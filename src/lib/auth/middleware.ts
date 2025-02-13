import { redirect } from 'next/navigation'

import { getClusterForUser, getUser } from '@/lib/db/queries'
import { ClusterDataWithMembers, User } from '@/lib/db/schema'

import { z } from 'zod'

// TODO: Improve `ActionState` type. Not too happy with how it currently is.
export type ActionState = {
    error?: string
    success?: string
    email?: string
    password?: string
    [key: string]: unknown // This allows for additional properties
}

type SchemaType = z.ZodType<Record<string, unknown>>

type ValidatedActionFunction<S extends SchemaType, T> = (data: z.infer<S>, formData: FormData) => Promise<T>

export function validatedAction<S extends SchemaType, T>(schema: S, action: ValidatedActionFunction<S, T>) {
    return async (prevState: ActionState, formData: FormData): Promise<T> => {
        const result = schema.safeParse(Object.fromEntries(formData))
        if (!result.success) {
            return { error: result.error.errors[0].message } as T
        }

        return action(result.data, formData)
    }
}

type ValidatedActionWithUserFunction<S extends SchemaType, T> = (
    data: z.infer<S>,
    formData: FormData,
    user: User
) => Promise<T>

export function validatedActionWithUser<S extends SchemaType, T>(
    schema: S,
    action: ValidatedActionWithUserFunction<S, T>
) {
    return async (prevState: ActionState, formData: FormData): Promise<T> => {
        const user = await getUser()
        if (!user) {
            throw new Error('User is not authenticated')
        }

        const result = schema.safeParse(Object.fromEntries(formData))
        if (!result.success) {
            return { error: result.error.errors[0].message } as T
        }

        return action(result.data, formData, user)
    }
}

type ActionWithClusterFunction<T> = (formData: FormData, cluster: ClusterDataWithMembers) => Promise<T>

export function withCluster<T>(action: ActionWithClusterFunction<T>) {
    return async (formData: FormData): Promise<T> => {
        const user = await getUser()
        if (!user) {
            redirect('/sign-in')
        }

        const cluster = await getClusterForUser(user.id)
        if (!cluster) {
            throw new Error('Cluster not found')
        }

        return action(formData, cluster)
    }
}
