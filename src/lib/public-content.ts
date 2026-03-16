import { createServerFn } from '@tanstack/react-start'
import { ConvexHttpClient } from 'convex/browser'

import { api } from '../../convex/_generated/api'
import type { Doc } from '../../convex/_generated/dataModel'

type Project = Doc<'projects'>

export type AnalyticsEventType =
  | 'page_view'
  | 'project_open'
  | 'project_link_click'
  | 'cta_click'
  | 'testimonial_switch'
  | 'contact_submit'
  | 'wall_submit'

function getConvexUrl() {
  const convexUrl = process.env.VITE_CONVEX_URL || process.env.CONVEX_URL || ''
  if (!convexUrl) {
    throw new Error('Missing Convex URL for public content')
  }

  return convexUrl
}

export function createPublicConvexClient() {
  return new ConvexHttpClient(getConvexUrl())
}

export async function fetchPublishedProjects(client = createPublicConvexClient()) {
  return client.query(api.projects.listPublished, {})
}

export async function fetchPortfolioPageData() {
  const client = createPublicConvexClient()
  const [projects, testimonials, siteSettings] = await Promise.all([
    fetchPublishedProjects(client),
    client.query(api.testimonials.listPublished, {}),
    client.query(api.siteSettings.getPublic, {}),
  ])

  const wallEntries = siteSettings.wallEnabled
    ? await client.query(api.wall.listApproved, {
        limit: siteSettings.wallMaxVisibleEntries ?? 24,
      })
    : []

  return {
    projects,
    testimonials,
    siteSettings,
    wallEntries,
  }
}

export async function fetchProjectBySlug(slug: string) {
  const projects = await fetchPublishedProjects()
  const project = projects.find((item) => item.slug === slug) ?? null

  return {
    project,
  }
}

export const getPortfolioPageData = createServerFn({ method: 'GET' }).handler(
  async () => fetchPortfolioPageData(),
)

export const getProjectPageData = createServerFn({ method: 'GET' })
  .inputValidator((data: { slug: string }) => data)
  .handler(async ({ data }) => fetchProjectBySlug(data.slug))

export const submitContactMessage = createServerFn({ method: 'POST' })
  .inputValidator(
    (data: { senderName: string; senderEmail: string; content: string }) => data,
  )
  .handler(async ({ data }) => {
    const client = createPublicConvexClient()
    return client.mutation(api.messages.submit, data)
  })

export const submitWallEntry = createServerFn({ method: 'POST' })
  .inputValidator(
    (data: { displayName: string; message?: string; sessionId: string }) => data,
  )
  .handler(async ({ data }) => {
    const client = createPublicConvexClient()
    return client.mutation(api.wall.submit, data)
  })

export const trackPortfolioEvent = createServerFn({ method: 'POST' })
  .inputValidator(
    (data: {
      eventType: AnalyticsEventType
      path: string
      projectSlug?: string
      sessionId: string
      meta?: Record<string, string | number | boolean>
    }) => data,
  )
  .handler(async ({ data }) => {
    const client = createPublicConvexClient()
    return client.mutation(api.analytics.track, data)
  })

export type PortfolioPageData = Awaited<ReturnType<typeof getPortfolioPageData>>
export type ProjectPageData = Awaited<ReturnType<typeof getProjectPageData>>
export type PublishedProject = Project
