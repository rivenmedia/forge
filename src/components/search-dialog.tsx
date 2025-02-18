"use client"

import React from 'react'
import { useRouter } from 'next/navigation'
import { Film, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { useDebounce } from '@/hooks/use-debounce'
import Image from 'next/image'

interface SearchResult {
  title: string
  media_type: string
  path: string
  excerpt: string
  type: 'component' | 'media' | 'action'
  posterPath?: string
}

const componentRegistry = [
    {
		id: 'settings-about',
		title: 'About Settings',
		content:
			'View information about Riven, including version numbers, support links, and contributors.',
		path: '/settings/about'
	},
	{
		id: 'settings-content',
		title: 'Content Settings',
		content: 'Configure content providers for Riven.',
		path: '/settings/content'
	},
	{
		id: 'settings-general',
		title: 'General Settings',
		content: 'Configure global and default settings for Riven.',
		path: '/settings/general'
	},
	{
		id: 'settings-mediaserver',
		title: 'Media Server Settings',
		content: 'Configure media server settings for Riven.',
		path: '/settings/mediaserver'
	},
	{
		id: 'settings-ranking',
		title: 'Ranking Settings',
		content: 'Configure ranking settings for Riven, including profiles and custom ranks.',
		path: '/settings/ranking'
	},
	{
		id: 'settings-scrapers',
		title: 'Scraper Settings',
		content: 'Configure scraper settings for Riven.',
		path: '/settings/scrapers'
	},
	{
		id: 'settings-layout',
		title: 'Settings Layout',
		content: 'Navigate between different settings pages in Riven.',
		path: '/settings'
	},
	{
		id: 'backend-version',
		title: 'Backend Version',
		content: 'View and check for updates to the Riven backend.',
		path: '/settings/about#backend-version'
	},
	{
		id: 'frontend-version',
		title: 'Frontend Version',
		content: 'View and check for updates to the Riven frontend.',
		path: '/settings/about#frontend-version'
	},
	{
		id: 'rclone-path',
		title: 'Rclone Path',
		content: 'View the configured Rclone path for Riven.',
		path: '/settings/about#rclone-path'
	},
	{
		id: 'library-path',
		title: 'Library Path',
		content: 'View the configured library path for Riven.',
		path: '/settings/about#library-path'
	},
	{
		id: 'support-discord',
		title: 'Discord Support',
		content: 'Get support for Riven through the Discord community.',
		path: '/settings/about#discord'
	},
	{
		id: 'support-github',
		title: 'GitHub Support',
		content: 'Report issues or contribute to Riven on GitHub.',
		path: '/settings/about#github'
	},
	{
		id: 'contributors',
		title: 'Contributors',
		content: 'View the contributors to the Riven project.',
		path: '/settings/about#contributors'
	},
	{
		id: 'ranking-profiles',
		title: 'Ranking Profiles',
		content:
			'Learn about the different ranking profiles available in Riven: default, best, and custom.',
		path: '/settings/ranking#profiles'
	},
	{
		id: 'ranking-wiki',
		title: 'Ranking Wiki',
		content: 'Access detailed information about Riven ranking settings.',
		path: '/settings/ranking#wiki'
	}
]

const mapMediaType = (mediaType: string) => {
    switch (mediaType) {
        case 'tv':
        return 'Show'
        case 'movie':
        return 'Movie'
        case 'person':
        return 'Person'
        default:
        return
    }
}

export function SearchDialog() {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const debouncedQuery = useDebounce(query, 300)
  const [results, setResults] = React.useState<SearchResult[]>([])
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    document.addEventListener('keydown', down)

    return () => document.removeEventListener('keydown', down)
  }, [])

  const searchContent = React.useCallback((query: string): SearchResult[] => {
    const lowercaseQuery = query.toLowerCase()

    const results: SearchResult[] = [
    //   {
    //     title: `Search as media: "${query}"`,
    //     media_type: '',
    //     path: '#',
    //     excerpt: `Search for "${query}" in TMDB`,
    //     type: 'action'
    //   }
    ]

    const componentResults = componentRegistry
      .filter(component =>
        component.id.toLowerCase().includes(lowercaseQuery) ||
        component.title.toLowerCase().includes(lowercaseQuery) ||
        component.content.toLowerCase().includes(lowercaseQuery)
      )
      .map(result => ({
        title: result.title,
        media_type: '',
        path: result.path,
        excerpt: result.content.substring(0, 100) + '...',
        type: 'component' as const
      }))

    return [...results, ...componentResults]
  }, [])

  React.useEffect(() => {
    if (!debouncedQuery) {
      setResults([])

return
    }

    const fetchResults = async () => {
      setLoading(true)
      try {
        // First get local component results
        const componentResults = searchContent(debouncedQuery)
        setResults(componentResults)

        // Then fetch media results
        const response = await fetch(`/api/search/multi?query=${encodeURIComponent(debouncedQuery)}`)
        if (!response.ok) throw new Error('Search failed')

        const data = await response.json()
        console.log(`Got search results for "${debouncedQuery}":`, data)
        const mediaResults = data.results.map((item: any) => ({
          title: item.title || item.name || '',
          media_type: mapMediaType(item.media_type),
          path: `/${item.media_type}/${item.id}`,
          excerpt: item.overview
            ? item.overview.substring(0, 100) + '...'
            : 'No description available',
          type: 'media' as const,
          posterPath: item.poster_path
            ? `https://image.tmdb.org/t/p/w92${item.poster_path}`
            : undefined
        }))

        console.log(`Set search results for "${debouncedQuery}":`, [...componentResults, ...mediaResults])

        setResults([...componentResults, ...mediaResults])
      } catch (error) {
        console.error('Search error:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchResults()
  }, [debouncedQuery, searchContent])

  const handleSelect = React.useCallback((result: SearchResult) => {
    setOpen(false)
    if (result.type === 'action') {
      // Handle action type if needed
      return
    }
    router.push(result.path)
  }, [router])

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(true)}
        className="w-9 px-0"
      >
        <Search className="h-5 w-5" />
        <span className="sr-only">Search</span>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Search..."
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {results.length > 0 && (
            <CommandGroup heading="Results">
              {results.map((result) => (
                <CommandItem
                  key={result.path + result.title}
                  onSelect={() => handleSelect(result)}
                  className="flex items-start gap-2 p-2"
                >
                  {result.type === 'media' && result.posterPath ? (
                    <div className="relative h-24 w-16 rounded">
                      <Image
                        src={result.posterPath}
                        alt={result.title}
                        width={64}
                        height={96}
                        className="object-cover rounded max-w-none"
                      />
                    </div>
                  ) : result.type === 'media' ? (
                    <div className="flex h-24 w-16 items-center justify-center rounded bg-muted">
                      <Film className="h-8 w-8" />
                    </div>
                  ) : null}
                  <div className="flex flex-col">
                    <span className="font-medium">{result.title}</span>
                    <span className="text-sm text-muted-foreground">
                      {result.excerpt}
                    </span>
                    {result.media_type && (
                      <span className="text-xs text-muted-foreground">
                        {result.media_type}
                      </span>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  )
}
