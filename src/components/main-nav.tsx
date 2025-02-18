'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { navConfig, siteConfig } from '@/config/site'
import { cn } from '@/lib/utils'
import { SearchDialog } from './search-dialog'

export function MainNav() {
  const pathname = usePathname()
  const siteName = siteConfig.name
  const [base, highlight] = [siteName.substring(1), siteName[0]]

  return (
    <>
      <div className='mr-4 lg:mr-6'>
        <Link href='/' className='flex items-center gap-2'>
          <span>
            <strong>{highlight}</strong>
            {base}
          </span>
        </Link>
      </div>
      <div className='hidden md:flex'>
        <nav className='flex items-center gap-4 text-sm xl:gap-6'>
          {navConfig.mainNav?.map(
            (item) =>
              item.href && (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'hover:text-foreground/80 transition-colors',
                    pathname === item.href ? 'text-foreground' : 'text-foreground/80'
                  )}>
                  {item.label}
                </Link>
              )
          )}
        </nav>
        <div className='ml-4'>
            <SearchDialog />
        </div>
      </div>
    </>
  )
}
