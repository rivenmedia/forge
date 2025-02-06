import Link from 'next/link'

import { Button } from '@/components/ui/button'

import { CircleIcon } from 'lucide-react'

export default function NotFound() {
    return (
        <div className='flex min-h-[100dvh] items-center justify-center'>
            <div className='max-w-md space-y-8 p-4 text-center'>
                <div className='flex justify-center'>
                    <CircleIcon className='size-12 text-red-700' />
                </div>
                <h1 className='text-foreground text-4xl font-bold tracking-tight'>Page Not Found</h1>
                <p className='text-base text-gray-700'>
                    The page you are looking for might have been removed, had its name changed, or is temporarily
                    unavailable.
                </p>
                <Button variant='outline' asChild>
                    <Link href='/'>Back to Home</Link>
                </Button>
            </div>
        </div>
    )
}
