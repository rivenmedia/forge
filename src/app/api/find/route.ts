import { NextRequest, NextResponse } from 'next/server'

import { TMDB_CONFIG } from '@/config/tmdb'
import { dictToQueryString } from '@/lib/utils'

export async function GET(
    req: NextRequest,
    {
        params
    }: {
        params: Promise<{
            external_id: string
            external_source: string
        }>
    }
) {
    const { external_id, external_source } = await params

    try {
        const searchParams = req.nextUrl.searchParams
        const query = searchParams.get('query')

        if (!query) {
            return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 })
        }

        const language = searchParams.get('language') || TMDB_CONFIG.defaultLanguage
        const page = searchParams.get('page') || '1'

        const params = { external_id, external_source }
        const queryString = dictToQueryString(params)

        const response = await fetch(`${TMDB_CONFIG.baseUrl}/find/${external_id}?${queryString}`, {
            headers: TMDB_CONFIG.headers
        })

        if (!response.ok) {
            throw new Error('Failed to fetch external ID')
        }

        const data = await response.json()

        return NextResponse.json(data, {
            headers: {
                'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400'
            }
        })
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to fetch external ID' },
            {
                status: 500,
                headers: {
                    'Cache-Control': 'public, max-age=60'
                }
            }
        )
    }
}
