'use client'

import { use, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'

import { useUser } from '@/lib/auth'
import { Header } from '@/components/header'
import { signOut } from '@/app/(login)/actions'

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
