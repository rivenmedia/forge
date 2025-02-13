import { env } from 'process'

const TMDB_READ_ACCESS_TOKEN =
  'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJlNTkxMmVmOWFhM2IxNzg2Zjk3ZTE1NWY1YmQ3ZjY1MSIsInN1YiI6IjY1M2NjNWUyZTg5NGE2MDBmZjE2N2FmYyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.xrIXsMFJpI1o1j5g2QpQcFP1X3AfRjFA5FlBFO5Naw8'

const DEFAULT_TMDB_LANGUAGE = 'en-US'
const TMDB_LANGUAGE = env.TMDB_LANGUAGE || DEFAULT_TMDB_LANGUAGE

export const TMDB_CONFIG = {
  baseUrl: 'https://api.themoviedb.org/3',
  headers: {
    Authorization: `Bearer ${TMDB_READ_ACCESS_TOKEN}`,
    'Content-Type': 'application/json;charset=utf-8',
  },
  defaultLanguage: TMDB_LANGUAGE,
}
