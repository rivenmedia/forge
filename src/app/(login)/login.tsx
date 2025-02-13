'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { CircleIcon, Loader2Icon } from 'lucide-react'

import { ActionState } from '@/lib/auth/middleware'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import { signIn, signUp } from './actions'

export function Login({ mode = 'signin' }: { mode?: 'signin' | 'signup' }) {
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect')
  const inviteId = searchParams.get('inviteId')
  const [state, formAction, pending] = useActionState<ActionState, FormData>(mode === 'signin' ? signIn : signUp, {
    error: '',
  })

  return (
    <div className='bg-background flex flex-col items-center justify-center gap-6 p-6 md:p-10'>
      <div className='flex w-full max-w-sm flex-col gap-6'>
        <div className='flex flex-col gap-6'>
          <Card>
            <CardHeader className='text-center'>
              <CardTitle className='text-xl'>
                {mode === 'signin' ? 'Sign in to your account' : 'Create your account'}
              </CardTitle>
              <CardDescription>Enter your email below to login to your account</CardDescription>
            </CardHeader>
            <CardContent>
              <form action={formAction}>
                <input type='hidden' name='redirect' value={redirect || ''} />
                <input type='hidden' name='inviteId' value={inviteId || ''} />
                <div className='grid gap-6'>
                  <div className='grid gap-6'>
                    <div className='grid gap-2'>
                      <Label htmlFor='email'>Email</Label>
                      <Input
                        id='email'
                        name='email'
                        type='email'
                        placeholder='m@example.com'
                        autoComplete='email'
                        defaultValue={state.email}
                        required
                        maxLength={50}
                      />
                    </div>
                    <div className='grid gap-2'>
                      <div className='flex items-center'>
                        <Label htmlFor='password'>Password</Label>
                      </div>
                      <Input
                        id='password'
                        name='password'
                        type='password'
                        autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                        defaultValue={state.password}
                        required
                        minLength={8}
                        maxLength={100}
                      />
                    </div>
                    <Button type='submit' className='w-full' disabled={pending}>
                      {pending ? (
                        <>
                          <Loader2Icon className='mr-2 h-4 w-4 animate-spin' />
                          Loading...
                        </>
                      ) : mode === 'signin' ? (
                        'Sign in'
                      ) : (
                        'Sign up'
                      )}
                    </Button>
                  </div>
                  <div className='after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t'>
                    <span className='bg-background text-muted-foreground relative z-10 px-2'>
                      {mode === 'signin' ? 'New to Riven?' : 'Already have an account?'}
                    </span>
                  </div>
                  <div className='flex flex-col gap-4'>
                    <Button variant='outline' className='w-full' asChild>
                      <Link
                        href={`${mode === 'signin' ? '/sign-up' : '/sign-in'}${
                          redirect ? `?redirect=${redirect}` : ''
                        }`}>
                        {mode === 'signin' ? 'Create an account' : 'Sign in to existing account'}
                      </Link>
                    </Button>
                    {state?.error && <div className='text-sm text-red-500'>{state.error}</div>}
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
