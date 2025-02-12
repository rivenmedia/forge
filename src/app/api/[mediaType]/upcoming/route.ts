import { NextRequest, NextResponse } from 'next/server'

import { TMDB_CONFIG } from '@/config/tmdb'
import { dictToQueryString } from '@/lib/utils'
import { MediaType } from '@/types'

export async function GET(req: NextRequest, { params }: { params: Promise<{ mediaType: MediaType }> }) {
    const { mediaType } = await params

    try {
        const searchParams = req.nextUrl.searchParams
        const language = searchParams.get('language') || TMDB_CONFIG.defaultLanguage
        const page = searchParams.get('page') || '1'

        const params = { language, page }
        const queryString = dictToQueryString(params)

        const response = await fetch(`${TMDB_CONFIG.baseUrl}/${mediaType}/upcoming?${queryString}`, {
            headers: TMDB_CONFIG.headers
        })

        if (!response.ok) {
            throw new Error(`Failed to fetch upcoming ${mediaType}`)
        }

        const data = await response.json()

        return NextResponse.json(data, {
            headers: {
                'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400'
            }
        })
    } catch (error) {
        return NextResponse.json(
            { error: `Failed to fetch upcoming ${mediaType}` },
            {
                status: 500,
                headers: {
                    'Cache-Control': 'public, max-age=60'
                }
            }
        )
    }
}
