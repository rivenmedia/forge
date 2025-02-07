// lib/utils.ts
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function dictToQueryString(params: Record<string, any>): string {
    const filteredParams = Object.fromEntries(Object.entries(params).filter(([_, v]) => v != null))
    return new URLSearchParams(filteredParams).toString()
}
