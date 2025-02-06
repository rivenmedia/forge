'use client'

import * as React from 'react'

import Link, { LinkProps } from 'next/link'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { navConfig } from '@/config/site'
import { useMetaColor } from '@/hooks/use-meta-color'
import { cn } from '@/lib/utils'

import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from './drawer'

export function MobileNav() {
    const [open, setOpen] = React.useState(false)
    const { setMetaColor, metaColor } = useMetaColor()
    const triggerRef = React.useRef<HTMLButtonElement>(null)

    const onOpenChange = React.useCallback(
        (open: boolean) => {
            setOpen(open)
            setMetaColor(open ? '#09090b' : metaColor)

            // Return focus to trigger when closing
            if (!open && triggerRef.current) {
                triggerRef.current.focus()
            }
        },
        [setMetaColor, metaColor]
    )

    return (
        <Drawer open={open} onOpenChange={onOpenChange}>
            <DrawerTrigger asChild>
                <Button ref={triggerRef} variant='ghost' size='icon' className='h-8 w-8 px-0 md:hidden'>
                    <svg
                        xmlns='http://www.w3.org/2000/svg'
                        fill='none'
                        viewBox='0 0 24 24'
                        strokeWidth='1.5'
                        stroke='currentColor'
                        className='!size-6'>
                        <path strokeLinecap='round' strokeLinejoin='round' d='M3.75 9h16.5m-16.5 6.75h16.5' />
                    </svg>
                    <span className='sr-only'>Toggle Menu</span>
                </Button>
            </DrawerTrigger>
            <DrawerContent>
                <DrawerTitle className='sr-only'>Mobile menu</DrawerTitle>
                <DrawerDescription className='sr-only'>Select an item</DrawerDescription>
                <div className='overflow-auto p-6'>
                    <div className='flex flex-col space-y-3'>
                        {navConfig.mainNav?.map(
                            (item) =>
                                item.href && (
                                    <MobileLink key={item.href} href={item.href} onOpenChange={setOpen}>
                                        {item.label}
                                    </MobileLink>
                                )
                        )}
                    </div>
                </div>
            </DrawerContent>
        </Drawer>
    )
}

interface MobileLinkProps extends LinkProps {
    onOpenChange?: (open: boolean) => void
    children: React.ReactNode
    className?: string
}

function MobileLink({ href, onOpenChange, className, children, ...props }: MobileLinkProps) {
    const router = useRouter()
    return (
        <Link
            href={href}
            onClick={() => {
                router.push(href.toString())
                onOpenChange?.(false)
            }}
            className={cn('text-base', className)}
            {...props}>
            {children}
        </Link>
    )
}
