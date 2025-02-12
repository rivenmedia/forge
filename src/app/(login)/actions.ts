'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import { validatedAction, validatedActionWithUser } from '@/lib/auth/middleware'
import { comparePasswords, hashPassword, setSession } from '@/lib/auth/session'
import { db } from '@/lib/db/drizzle'
import { getUser, getUserWithCluster } from '@/lib/db/queries'
import {
    ActivityType,
    type NewActivityLog,
    type NewCluster,
    type NewClusterMember,
    type NewUser,
    User,
    activityLogs,
    clusterMembers,
    clusters,
    invitations,
    users
} from '@/lib/db/schema'

import { and, eq, sql } from 'drizzle-orm'
import { z } from 'zod'

// TODO: Refactor to modular actions

async function logActivity(
    clusterId: number | null | undefined,
    userId: number,
    type: ActivityType,
    ipAddress?: string
) {
    if (clusterId === null || clusterId === undefined) {
        return
    }
    const newActivity: NewActivityLog = {
        clusterId,
        userId,
        action: type,
        ipAddress: ipAddress || ''
    }
    await db.insert(activityLogs).values(newActivity)
}

const signInSchema = z.object({
    email: z.string().email().min(3).max(255),
    password: z.string().min(8).max(100)
})

export const signIn = validatedAction(signInSchema, async (data, formData) => {
    const { email, password } = data

    const userWithCluster = await db
        .select({
            user: users,
            cluster: clusters
        })
        .from(users)
        .leftJoin(clusterMembers, eq(users.id, clusterMembers.userId))
        .leftJoin(clusters, eq(clusterMembers.clusterId, clusters.id))
        .where(eq(users.email, email))
        .limit(1)

    if (userWithCluster.length === 0) {
        return {
            error: 'Invalid email or password. Please try again.',
            email,
            password
        }
    }

    const { user: foundUser, cluster: foundCluster } = userWithCluster[0]

    const isPasswordValid = await comparePasswords(password, foundUser.passwordHash)

    if (!isPasswordValid) {
        return {
            error: 'Invalid email or password. Please try again.',
            email,
            password
        }
    }

    await Promise.all([setSession(foundUser), logActivity(foundCluster?.id, foundUser.id, ActivityType.SIGN_IN)])
    redirect('/dashboard')
})

const signUpSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    inviteId: z.string().optional()
})

export const signUp = validatedAction(signUpSchema, async (data, formData) => {
    const { email, password, inviteId } = data

    const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1)

    if (existingUser.length > 0) {
        return {
            error: 'Failed to create user. Please try again.',
            email,
            password
        }
    }

    const passwordHash = await hashPassword(password)

    const newUser: NewUser = {
        email,
        passwordHash,
        role: 'owner' // Default role, will be overridden if there's an invitation
    }

    const [createdUser] = await db.insert(users).values(newUser).returning()

    if (!createdUser) {
        return {
            error: 'Failed to create user. Please try again.',
            email,
            password
        }
    }

    let clusterId: number
    let userRole: string
    let createdCluster: typeof clusters.$inferSelect | null = null

    if (inviteId) {
        // Check if there's a valid invitation
        const [invitation] = await db
            .select()
            .from(invitations)
            .where(
                and(
                    eq(invitations.id, parseInt(inviteId)),
                    eq(invitations.email, email),
                    eq(invitations.status, 'pending')
                )
            )
            .limit(1)

        if (invitation) {
            clusterId = invitation.clusterId
            userRole = invitation.role

            await db.update(invitations).set({ status: 'accepted' }).where(eq(invitations.id, invitation.id))

            await logActivity(clusterId, createdUser.id, ActivityType.ACCEPT_INVITATION)
            ;[createdCluster] = await db.select().from(clusters).where(eq(clusters.id, clusterId)).limit(1)
        } else {
            return { error: 'Invalid or expired invitation.', email, password }
        }
    } else {
        // Create a new cluster if there's no invitation
        const newCluster: NewCluster = {
            name: `${email}'s Cluster`
        }

        ;[createdCluster] = await db.insert(clusters).values(newCluster).returning()

        if (!createdCluster) {
            return {
                error: 'Failed to create cluster. Please try again.',
                email,
                password
            }
        }

        clusterId = createdCluster.id
        userRole = 'owner'

        await logActivity(clusterId, createdUser.id, ActivityType.CREATE_CLUSTER)
    }

    const newClusterMember: NewClusterMember = {
        userId: createdUser.id,
        clusterId: clusterId,
        role: userRole
    }

    await Promise.all([
        db.insert(clusterMembers).values(newClusterMember),
        logActivity(clusterId, createdUser.id, ActivityType.SIGN_UP),
        setSession(createdUser)
    ])
    redirect('/dashboard')
})

export async function signOut() {
    const user = (await getUser()) as User
    const userWithCluster = await getUserWithCluster(user.id)
    await logActivity(userWithCluster?.clusterId, user.id, ActivityType.SIGN_OUT)
    ;(await cookies()).delete('session')
}

const updatePasswordSchema = z
    .object({
        currentPassword: z.string().min(8).max(100),
        newPassword: z.string().min(8).max(100),
        confirmPassword: z.string().min(8).max(100)
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: "Passwords don't match",
        path: ['confirmPassword']
    })

export const updatePassword = validatedActionWithUser(updatePasswordSchema, async (data, _, user) => {
    const { currentPassword, newPassword } = data

    const isPasswordValid = await comparePasswords(currentPassword, user.passwordHash)

    if (!isPasswordValid) {
        return { error: 'Current password is incorrect.' }
    }

    if (currentPassword === newPassword) {
        return {
            error: 'New password must be different from the current password.'
        }
    }

    const newPasswordHash = await hashPassword(newPassword)
    const userWithCluster = await getUserWithCluster(user.id)

    await Promise.all([
        db.update(users).set({ passwordHash: newPasswordHash }).where(eq(users.id, user.id)),
        logActivity(userWithCluster?.clusterId, user.id, ActivityType.UPDATE_PASSWORD)
    ])

    return { success: 'Password updated successfully.' }
})

const deleteAccountSchema = z.object({
    password: z.string().min(8).max(100)
})

export const deleteAccount = validatedActionWithUser(deleteAccountSchema, async (data, _, user) => {
    const { password } = data

    const isPasswordValid = await comparePasswords(password, user.passwordHash)
    if (!isPasswordValid) {
        return { error: 'Incorrect password. Account deletion failed.' }
    }

    const userWithCluster = await getUserWithCluster(user.id)

    await logActivity(userWithCluster?.clusterId, user.id, ActivityType.DELETE_ACCOUNT)

    // Soft delete
    await db
        .update(users)
        .set({
            deletedAt: sql`CURRENT_TIMESTAMP`,
            email: sql`CONCAT(email, '-', id, '-deleted')` // Ensure email uniqueness
        })
        .where(eq(users.id, user.id))

    if (userWithCluster?.clusterId) {
        await db
            .delete(clusterMembers)
            .where(and(eq(clusterMembers.userId, user.id), eq(clusterMembers.clusterId, userWithCluster.clusterId)))
    }

    ;(await cookies()).delete('session')
    redirect('/sign-in')
})

const updateAccountSchema = z.object({
    name: z.string().min(1, 'Name is required').max(100),
    email: z.string().email('Invalid email address')
})

export const updateAccount = validatedActionWithUser(updateAccountSchema, async (data, _, user) => {
    const { name, email } = data
    const userWithCluster = await getUserWithCluster(user.id)

    await Promise.all([
        db.update(users).set({ name, email }).where(eq(users.id, user.id)),
        logActivity(userWithCluster?.clusterId, user.id, ActivityType.UPDATE_ACCOUNT)
    ])

    return { success: 'Account updated successfully.' }
})

const removeClusterMemberSchema = z.object({
    memberId: z.number()
})

export const removeClusterMember = validatedActionWithUser(removeClusterMemberSchema, async (data, _, user) => {
    const { memberId } = data
    const userWithCluster = await getUserWithCluster(user.id)

    if (!userWithCluster?.clusterId) {
        return { error: 'User is not part of a cluster' }
    }

    await db
        .delete(clusterMembers)
        .where(and(eq(clusterMembers.id, memberId), eq(clusterMembers.clusterId, userWithCluster.clusterId)))

    await logActivity(userWithCluster.clusterId, user.id, ActivityType.REMOVE_CLUSTER_MEMBER)

    return { success: 'Cluster member removed successfully' }
})

const inviteClusterMemberSchema = z.object({
    email: z.string().email('Invalid email address'),
    role: z.enum(['member', 'owner'])
})

export const inviteClusterMember = validatedActionWithUser(inviteClusterMemberSchema, async (data, _, user) => {
    const { email, role } = data
    const userWithCluster = await getUserWithCluster(user.id)

    if (!userWithCluster?.clusterId) {
        return { error: 'User is not part of a cluster' }
    }

    const existingMember = await db
        .select()
        .from(users)
        .leftJoin(clusterMembers, eq(users.id, clusterMembers.userId))
        .where(and(eq(users.email, email), eq(clusterMembers.clusterId, userWithCluster.clusterId)))
        .limit(1)

    if (existingMember.length > 0) {
        return { error: 'User is already a member of this cluster' }
    }

    // Check if there's an existing invitation
    const existingInvitation = await db
        .select()
        .from(invitations)
        .where(
            and(
                eq(invitations.email, email),
                eq(invitations.clusterId, userWithCluster.clusterId),
                eq(invitations.status, 'pending')
            )
        )
        .limit(1)

    if (existingInvitation.length > 0) {
        return { error: 'An invitation has already been sent to this email' }
    }

    // Create a new invitation
    await db.insert(invitations).values({
        clusterId: userWithCluster.clusterId,
        email,
        role,
        invitedBy: user.id,
        status: 'pending'
    })

    await logActivity(userWithCluster.clusterId, user.id, ActivityType.INVITE_CLUSTER_MEMBER)

    // TODO: Send invitation email and include ?inviteId={id} to sign-up URL
    // await sendInvitationEmail(email, userWithCluster.cluster.name, role)

    return { success: 'Invitation sent successfully' }
})
