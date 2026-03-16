import type { ServerEntry } from '@tanstack/react-start/server-entry'
import { createStartHandler, defaultStreamHandler } from '@tanstack/react-start/server'

const startHandler = createStartHandler(defaultStreamHandler)
const CANONICAL_HOST = 'www.kubasmiarowski.com'
const APEX_HOST = 'kubasmiarowski.com'

async function fetch(request: Request): Promise<Response> {
  const incomingUrl = new URL(request.url)

  if (incomingUrl.hostname === APEX_HOST) {
    const redirectUrl = new URL(`https://${CANONICAL_HOST}`)
    redirectUrl.pathname = incomingUrl.pathname
    redirectUrl.search = incomingUrl.search
    redirectUrl.hash = incomingUrl.hash

    return new Response(null, {
      status: 301,
      headers: {
        Location: redirectUrl.toString(),
        'Cache-Control': 'no-store',
        'X-Redirect-Source': 'portfolio-worker-apex',
      },
    })
  }

  return startHandler(request)
}

export function createServerEntry(entry: ServerEntry): ServerEntry {
  return {
    async fetch(...args) {
      return entry.fetch(...args)
    },
  }
}

export default createServerEntry({ fetch })
