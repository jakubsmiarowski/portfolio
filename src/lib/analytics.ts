import { useCallback } from 'react'
import { trackPortfolioEvent, type AnalyticsEventType } from '@/lib/public-content'

const SESSION_KEY = 'portfolio_session_id'

function createSessionId() {
  if (typeof window === 'undefined') {
    return 'ssr-session'
  }

  const existing = window.localStorage.getItem(SESSION_KEY)
  if (existing) {
    return existing
  }

  const id =
    (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`) +
    '-pf'
  window.localStorage.setItem(SESSION_KEY, id)
  return id
}

export function getPortfolioSessionId() {
  return createSessionId()
}

export function useAnalytics() {
  const trackEvent = useCallback(
    async (
      eventType: AnalyticsEventType,
      options?: {
        path?: string
        projectSlug?: string
        meta?: Record<string, string | number | boolean>
      },
    ) => {
      if (typeof window === 'undefined') {
        return
      }

      try {
        await trackPortfolioEvent({
          data: {
            eventType,
            path: options?.path ?? window.location.pathname,
            projectSlug: options?.projectSlug,
            sessionId: createSessionId(),
            meta: options?.meta,
          },
        })
      } catch {
        // Analytics must not break core UX.
      }
    },
    [],
  )

  return {
    trackEvent,
  }
}
