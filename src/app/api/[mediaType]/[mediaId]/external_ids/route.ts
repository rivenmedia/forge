import { NextRequest, NextResponse } from 'next/server'

import { TMDB_CONFIG } from '@/config/tmdb'
import { MediaType } from '@/types'

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ mediaType: MediaType; mediaId: string }> }
) {
    const { mediaType, mediaId } = await params

    try {
        const response = await fetch(`${TMDB_CONFIG.baseUrl}/${mediaType}/${mediaId}/external_ids`, {
            headers: TMDB_CONFIG.headers
        })

        if (!response.ok) {
            throw new Error(`Failed to fetch external ids`)
        }

        const data = await response.json()

        return NextResponse.json(data, {
            headers: {
                'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400'
            }
        })
    } catch (error) {
        return NextResponse.json(
            { error: `Failed to fetch external ids` },
            {
                status: 500,
                headers: {
                    'Cache-Control': 'public, max-age=60'
                }
            }
        )
    }
}
