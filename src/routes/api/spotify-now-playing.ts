import { createFileRoute } from '@tanstack/react-router'

import { getCachedNowPlaying } from '@/lib/server/spotify-now-playing'

const JSON_HEADERS = {
  'content-type': 'application/json; charset=utf-8',
  'cache-control': 'no-store',
}

export const Route = createFileRoute('/api/spotify-now-playing')({
  server: {
    handlers: {
      GET: async () => {
        try {
          const payload = await getCachedNowPlaying({
            ttlMs: 25_000,
          })

          return new Response(JSON.stringify(payload), {
            status: 200,
            headers: JSON_HEADERS,
          })
        } catch (error) {
          console.error(
            '[spotify-now-playing]',
            error instanceof Error ? error.message : 'Unexpected error.',
          )

          return new Response(
            JSON.stringify({
              status: 'unavailable',
              track: null,
              fetchedAt: new Date().toISOString(),
            }),
            {
              status: 200,
              headers: JSON_HEADERS,
            },
          )
        }
      },
    },
  },
})
