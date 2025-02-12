import { cookies } from 'next/headers'

import { verifyToken } from '@/lib/auth/session'

import { db } from './drizzle'
import { activityLogs, clusterMembers, clusters, secrets, users } from './schema'
import { randomBytes } from 'crypto'
import { desc, eq } from 'drizzle-orm'

// TODO: Refactor logic
export async function getAuthSecret() {
    const secret = await db.select().from(secrets).where(eq(secrets.key, 'auth_secret')).limit(1)

    if (secret.length === 0) {
        const newSecret = randomBytes(32).toString('hex')
        try {
            await db.insert(secrets).values({ key: 'auth_secret', value: newSecret })
        } catch (error) {
            throw new Error('Failed to generate and store auth secret')
        }

        return new TextEncoder().encode(newSecret)
    }

    return new TextEncoder().encode(secret[0].value)
}

export async function getUser() {
    const sessionCookie = (await cookies()).get('session')
    if (!sessionCookie || !sessionCookie.value) {
        return null
    }

    const sessionData = await verifyToken(sessionCookie.value)
    if (!sessionData || !sessionData.user || typeof sessionData.user.id !== 'number') {
        return null
    }

    if (new Date(sessionData.expires) < new Date()) {
        return null
    }

    const user = await db.select().from(users).where(eq(users.id, sessionData.user.id)).limit(1)

    if (user.length === 0) {
        return null
    }

    return user[0]
}

export async function getUserWithCluster(userId: number) {
    const result = await db
        .select({
            user: users,
            clusterId: clusterMembers.clusterId
        })
        .from(users)
        .leftJoin(clusterMembers, eq(users.id, clusterMembers.userId))
        .where(eq(users.id, userId))
        .limit(1)

    return result[0]
}

export async function getActivityLogs() {
    const user = await getUser()
    if (!user) {
        throw new Error('User not authenticated')
    }

    return await db
        .select({
            id: activityLogs.id,
            action: activityLogs.action,
            timestamp: activityLogs.timestamp,
            ipAddress: activityLogs.ipAddress,
            userName: users.name
        })
        .from(activityLogs)
        .leftJoin(users, eq(activityLogs.userId, users.id))
        .where(eq(activityLogs.userId, user.id))
        .orderBy(desc(activityLogs.timestamp))
        .limit(10)
}

export async function getClusterForUser(userId: number) {
    const result = await db.query.users.findFirst({
        where: eq(users.id, userId),
        with: {
            clusterMembers: {
                with: {
                    cluster: {
                        with: {
                            clusterMembers: {
                                with: {
                                    user: {
                                        columns: {
                                            id: true,
                                            name: true,
                                            email: true
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    })

    return result?.clusterMembers[0]?.cluster || null
}
