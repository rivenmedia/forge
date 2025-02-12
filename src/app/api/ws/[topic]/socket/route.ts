import { env } from 'node:process'

const websocketUrl = (env.BACKEND_URL || 'http://localhost:8080').replace(/^http/, 'ws')
const apiKey = env.API_KEY

export function SOCKET(
    client: import('ws').WebSocket,
    request: import('http').IncomingMessage,
    server: import('ws').WebSocketServer,
    { params }: { params: { topic: string } }
) {
    console.log('A client connected')

    const nativeWebSocket = new WebSocket(`${websocketUrl}/api/v1/ws/${params.topic}?api_key=${apiKey}`)

    client.onmessage = (message) => {
        nativeWebSocket.send(message.data.toString())
    }

    nativeWebSocket.onmessage = (message) => {
        client.send(message.data)
    }

    nativeWebSocket.onerror = (error) => {
        console.error('WebSocket error:', error)
    }

    client.onclose = () => {
        console.log('client closed')
        nativeWebSocket.close()
    }

    nativeWebSocket.onclose = () => {
        console.log('nativeWebSocket closed')
        client.close()
    }
}
