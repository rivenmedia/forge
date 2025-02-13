'use client'

import { type ReactNode, use } from 'react'

import { useRouter } from 'next/navigation'

import { signOut } from '@/app/(login)/actions'
import { Header } from '@/components/header'
import { useUser } from '@/lib/auth'

export default function Layout({ children }: { children: ReactNode }) {
    const { userPromise } = useUser()
    const user = use(userPromise)
    const router = useRouter()

    async function handleSignOut() {
        await signOut()
        router.refresh()
        router.push('/')
    }

    return (
        <div data-vaul-drawer-wrapper>
            <Header isAuthenticated={user} onSignOut={handleSignOut} />
            <main>{children}</main>
        </div>
    )
}
