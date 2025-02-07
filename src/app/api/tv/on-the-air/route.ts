import { NextRequest, NextResponse } from 'next/server'

import { MediaType } from '@/types'

import { TMDB_CONFIG } from '../../config/tmdb'
import { dictToQueryString } from '../../utils/helpers'

export async function GET(req: NextRequest) {
    try {
        const searchParams = req.nextUrl.searchParams
        const language = searchParams.get('language') || TMDB_CONFIG.defaultLanguage
        const page = searchParams.get('page') || '1'

        const params = { language, page }
        const queryString = dictToQueryString(params)

        const response = await fetch(`${TMDB_CONFIG.baseUrl}/tv/on_the_air?${queryString}`, {
            headers: TMDB_CONFIG.headers
        })

        if (!response.ok) {
            throw new Error(`Failed to fetch on the air tv`)
        }

        const data = await response.json()
        return NextResponse.json(data)
    } catch (error) {
        return NextResponse.json({ error: `Failed to fetch on the air tv` }, { status: 500 })
    }
}
