import { useCallback } from 'react'
import { useMutation } from 'convex/react'

import { api } from '../../convex/_generated/api'

type AnalyticsEventType =
  | 'page_view'
  | 'project_open'
  | 'project_link_click'
  | 'cta_click'
  | 'testimonial_switch'
  | 'contact_submit'
  | 'wall_submit'

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
  const trackMutation = useMutation(api.analytics.track)

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
        await trackMutation({
          eventType,
          path: options?.path ?? window.location.pathname,
          projectSlug: options?.projectSlug,
          sessionId: createSessionId(),
          meta: options?.meta,
        })
      } catch {
        // Analytics must not break core UX.
      }
    },
    [trackMutation],
  )

  return {
    trackEvent,
  }
}
