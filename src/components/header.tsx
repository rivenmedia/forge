import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { siteConfig } from '@/config/site'
import { type User } from '@/lib/db/schema'

import { Icons } from './icons'
import { MainNav } from './main-nav'
import { MobileNav } from './mobile-nav'
import { ThemeSwitch } from './theme-switch'

interface HeaderProps {
    isAuthenticated: User | null
    onSignOut: () => Promise<void>
}

export function Header({ isAuthenticated, onSignOut }: HeaderProps) {
    return (
        <header className='border-grid bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur'>
            <div className='container-wrapper'>
                <div className='container flex h-14 items-center'>
                    <MainNav />
                    <div className='flex flex-1 items-center justify-end'>
                        <div className='flex flex-row-reverse gap-4 md:flex-row'>
                            <MobileNav />
                            <nav className='flex items-center md:gap-2'>
                                {/* TODO: Fix sign (in|out) button misalignment & add proper colors */}
                                {isAuthenticated ? (
                                    <Button onClick={onSignOut} variant='destructive'>
                                        Sign Out
                                    </Button>
                                ) : (
                                    <Button
                                        asChild
                                        className='rounded-full bg-black px-4 py-2 text-sm text-white hover:bg-gray-800'>
                                        <Link href='/sign-in'>Sign In</Link>
                                    </Button>
                                )}
                                <Button variant='ghost' size='icon' className='hidden h-8 w-8 px-0 md:flex'>
                                    <Link
                                        href='https://github.com/sirrobot01/debrid-blackhole'
                                        target='_blank'
                                        rel='noreferrer'>
                                        <Icons.GitHub className='h-4 w-4' />
                                        <span className='sr-only'>{siteConfig.name}</span>
                                    </Link>
                                </Button>
                                <ThemeSwitch />
                            </nav>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    )
}
