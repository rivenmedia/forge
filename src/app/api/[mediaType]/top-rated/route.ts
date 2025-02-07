import { NextRequest, NextResponse } from 'next/server'

import { MediaType } from '@/types'

import { TMDB_CONFIG } from '../../config/tmdb'
import { dictToQueryString } from '../../utils/helpers'

export async function GET(req: NextRequest, { params }: { params: Promise<{ mediaType: MediaType }> }) {
    const { mediaType } = await params

    try {
        const searchParams = req.nextUrl.searchParams
        const language = searchParams.get('language') || TMDB_CONFIG.defaultLanguage
        const page = searchParams.get('page') || '1'

        const params = { language, page }
        const queryString = dictToQueryString(params)

        const response = await fetch(`${TMDB_CONFIG.baseUrl}/${mediaType}/top_rated?${queryString}`, {
            headers: TMDB_CONFIG.headers
        })

        if (!response.ok) {
            throw new Error(`Failed to fetch top rated ${mediaType}`)
        }

        const data = await response.json()
        return NextResponse.json(data)
    } catch (error) {
        return NextResponse.json({ error: `Failed to fetch top rated ${mediaType}` }, { status: 500 })
    }
}
