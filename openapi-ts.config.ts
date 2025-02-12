import { defaultPlugins, defineConfig } from '@hey-api/openapi-ts'

export default defineConfig({
    input: 'http://localhost:8080/openapi.json',
    output: 'src/lib/client',
    plugins: [
        ...defaultPlugins,
        '@hey-api/client-fetch',
        {
            asClass: true,
            name: '@hey-api/sdk'
        }
    ]
})
