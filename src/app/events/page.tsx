'use client'

import { useEffect, useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { useAutoAnimate } from '@formkit/auto-animate/react'

type EventData = {
    [key: string]: string[]
}

function getNewWebSocket() {
    return new WebSocket('/api/ws/event_update/socket')
}

export default function EventsPage() {
    const [events, setEvents] = useState<EventData | undefined>()
    const [status, setStatus] = useState('Disconnected')
    const [ws, setWs] = useState<WebSocket | undefined>()
    const [listRef] = useAutoAnimate()
    const [itemsRef] = useAutoAnimate()

    useEffect(() => {
        const websocket = getNewWebSocket()

        websocket.onopen = () => {
            setStatus('Connected')
            console.log('Connected to WebSocket')
        }

        websocket.onclose = () => {
            setStatus('Disconnected')
            console.log('Disconnected from WebSocket')

            // Attempt to reconnect after 3 seconds
            setTimeout(() => {
                setStatus('Reconnecting...')
                setWs(undefined)
                const newWebsocket = getNewWebSocket()
                setWs(newWebsocket)
            }, 3000)
        }

        websocket.onerror = (error) => {
            console.error('WebSocket error:', error)
            setStatus('Error')
        }

        websocket.onmessage = (event) => {
            const data = JSON.parse(event.data)
            console.log('Received data:', data)
            setEvents(data.data)
        }

        setWs(websocket)

        // Cleanup on component unmount
        return () => {
            if (websocket) {
                websocket.close()
            }
        }
    }, [])

    return (
        <>
            <div className='absolute top-4 right-4'>
                {status === 'Connected' && <Badge variant={'secondary'}>Connected</Badge>}
                {status === 'Disconnected' && <Badge variant={'destructive'}>Disconnected</Badge>}
                {status === 'Reconnecting...' && <Badge variant={'gray'}>Reconnecting...</Badge>}
                {status === 'Error' && <Badge variant={'destructive'}>Error</Badge>}
            </div>
            <div className='container mx-auto p-6'>
                {events === undefined && <h1 className='text-xl font-bold'>Loading...</h1>}

                {events === null && <h1 className='text-xl font-bold text-red-600'>Error</h1>}
                {events && (
                    <div className='space-y-6'>
                        <h1 className='mb-6 text-2xl font-bold'>Events</h1>
                        {/* Apply animation to the container of event groups */}
                        <div ref={listRef} className='space-y-6'>
                            {Object.entries(events).map(([key, value]) => (
                                <div key={key} className='space-y-4'>
                                    <h2 className='text-xl font-semibold'>{key}</h2>
                                    {/* Apply animation to the container of individual events */}
                                    <ul ref={itemsRef} className='flex flex-wrap space-y-4 space-x-4'>
                                        {value.map((event) => (
                                            <li key={event} className='list-none'>
                                                <div className='rounded-lg border-2 border-black p-4 dark:border-white'>
                                                    <p>{event}</p>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </>
    )
}
