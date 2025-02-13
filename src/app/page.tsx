import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Card, CardHeader } from '@/components/ui/card'

const Page = () => {
  return (
    <div className='container py-4'>
      <Card className='text-center md:w-[200px]'>
        <CardHeader>
          <h1>Page: /</h1>
          <Button asChild>
            <Link href='/dashboard'>Dashboard</Link>
          </Button>
        </CardHeader>
      </Card>
    </div>
  )
}

export default Page
