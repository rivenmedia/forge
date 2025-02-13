import { NextRequest, NextResponse } from 'next/server'

import { TMDB_CONFIG } from '@/config/tmdb'
import { dictToQueryString } from '@/lib/utils'

export async function GET(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      tvId: string
      seasonNumber: string
    }>
  }
) {
  try {
    const { tvId, seasonNumber } = await params
    const searchParams = req.nextUrl.searchParams
    const language = searchParams.get('language') || TMDB_CONFIG.defaultLanguage
    const append_to_response = searchParams.get('append_to_response')

    const queryParams = { language, append_to_response }
    const queryString = dictToQueryString(queryParams)

    const response = await fetch(`${TMDB_CONFIG.baseUrl}/tv/${tvId}/season/${seasonNumber}?${queryString}`, {
      headers: TMDB_CONFIG.headers,
    })

    if (!response.ok) {
      throw new Error('Failed to fetch TV season details')
    }

    const data = await response.json()

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch TV season details' }, { status: 500 })
  }
}
