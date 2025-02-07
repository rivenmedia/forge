import { NextRequest, NextResponse } from 'next/server'

import { MediaType } from '@/types'

import { TMDB_CONFIG } from '../../config/tmdb'
import { dictToQueryString } from '../../utils/helpers'

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ mediaType: MediaType; mediaId: string }> }
) {
    const { mediaType, mediaId } = await params

    try {
        const searchParams = req.nextUrl.searchParams
        const language = searchParams.get('language') || TMDB_CONFIG.defaultLanguage
        const append_to_response = searchParams.get('append_to_response')

        const queryParams = { language, append_to_response }
        const queryString = dictToQueryString(queryParams)

        const response = await fetch(`${TMDB_CONFIG.baseUrl}/${mediaType}/${mediaId}?${queryString}`, {
            headers: TMDB_CONFIG.headers
        })

        if (!response.ok) {
            throw new Error(`Failed to fetch ${mediaType} details`)
        }

        const data = await response.json()
        return NextResponse.json(data, {
            headers: {
                'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400'
            }
        })
    } catch (error) {
        return NextResponse.json(
            { error: `Failed to fetch ${mediaType} details` },
            {
                status: 500,
                headers: {
                    'Cache-Control': 'public, max-age=60'
                }
            }
        )
    }
}
