import Link from 'next/link'
import { redirect } from 'next/navigation'

import { getClusterForUser, getUser } from '@/lib/db/queries'
import { Button } from '@/components/ui/button'
import { Card, CardHeader } from '@/components/ui/card'

import { Settings } from './settings'

export default async function SettingsPage() {
  const user = await getUser()

  if (!user) {
    redirect('/sign-in')
  }

  const clusterData = await getClusterForUser(user.id)

  if (!clusterData) {
    throw new Error('Cluster not found')
  }

  return <Settings />
}
