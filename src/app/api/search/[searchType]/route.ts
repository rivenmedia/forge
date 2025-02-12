import { NextRequest, NextResponse } from 'next/server'

import { TMDB_CONFIG } from '@/config/tmdb'
import { dictToQueryString } from '@/lib/utils'

export async function GET(req: NextRequest, { params }: { params: Promise<{ searchType: string }> }) {
    const { searchType } = await params

    try {
        const searchParams = req.nextUrl.searchParams
        const query = searchParams.get('query')

        if (!query) {
            return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 })
        }

        const include_adult = searchParams.get('include_adult') === 'true'
        const language = searchParams.get('language') || TMDB_CONFIG.defaultLanguage
        const page = searchParams.get('page') || '1'

        const params = { query, include_adult, language, page }
        const queryString = dictToQueryString(params)

        const response = await fetch(`${TMDB_CONFIG.baseUrl}/search/${searchType}?${queryString}`, {
            headers: TMDB_CONFIG.headers
        })

        if (!response.ok) {
            throw new Error(`Failed to fetch search results for ${searchType}`)
        }

        const data = await response.json()

        return NextResponse.json(data)
    } catch (error) {
        return NextResponse.json({ error: `Failed to fetch search results for ${searchType}` }, { status: 500 })
    }
}
