import { ConvexProvider } from 'convex/react'
import { ConvexQueryClient } from '@convex-dev/react-query'

let convexQueryClient: ConvexQueryClient | null = null

function getConvexQueryClient() {
  if (!convexQueryClient) {
    const CONVEX_URL = import.meta.env.VITE_CONVEX_URL
    if (!CONVEX_URL) {
      console.error('missing envar CONVEX_URL')
      return null
    }
    convexQueryClient = new ConvexQueryClient(CONVEX_URL)
  }
  return convexQueryClient
}

export default function AppConvexProvider({
  children,
}: {
  children: React.ReactNode
}) {
  // During SSR, skip Convex initialization (it requires WebSocket which is browser-only)
  if (typeof window === 'undefined') {
    return <>{children}</>
  }

  const client = getConvexQueryClient()
  if (!client) {
    return <>{children}</>
  }

  return (
    <ConvexProvider client={client.convexClient}>
      {children}
    </ConvexProvider>
  )
}
