import { mutation, query } from './_generated/server'
import type { Doc } from './_generated/dataModel'
import { v } from 'convex/values'

import { adminTokenArg, requireAdmin } from './lib/adminAuth'

type AnalyticsEventDoc = Doc<'analyticsEvents'>
type TimeseriesRow = {
  day: string
  pageViews: number
  projectInteractions: number
  contactSubmits: number
}

const eventTypeValidator = v.union(
  v.literal('page_view'),
  v.literal('project_open'),
  v.literal('project_link_click'),
  v.literal('cta_click'),
  v.literal('testimonial_switch'),
  v.literal('contact_submit'),
  v.literal('wall_submit'),
)

function dayBucket(timestamp: number): string {
  return new Date(timestamp).toISOString().slice(0, 10)
}

function aggregateWindow(events: AnalyticsEventDoc[], days: number) {
  const now = Date.now()
  const cutoff = now - days * 24 * 60 * 60 * 1000
  const inWindow = events.filter((event) => event.createdAt >= cutoff)

  const pageViews = inWindow.filter((event) => event.eventType === 'page_view')
  const uniqueSessions = new Set(pageViews.map((event) => event.sessionId)).size
  const projectInteractions = inWindow.filter(
    (event) =>
      event.eventType === 'project_open' || event.eventType === 'project_link_click',
  ).length
  const contactSubmits = inWindow.filter(
    (event) => event.eventType === 'contact_submit',
  ).length
  const cvDownloads = inWindow.filter(
    (event) =>
      event.eventType === 'cta_click' && event.meta?.cta === 'download_cv',
  ).length

  return {
    pageViews: pageViews.length,
    uniqueSessions,
    projectInteractions,
    contactSubmits,
    cvDownloads,
    contactConversionRate:
      pageViews.length > 0 ? Number((contactSubmits / pageViews.length).toFixed(4)) : 0,
  }
}

export const track = mutation({
  args: {
    eventType: eventTypeValidator,
    path: v.string(),
    projectSlug: v.optional(v.string()),
    sessionId: v.string(),
    meta: v.optional(v.record(v.string(), v.union(v.string(), v.number(), v.boolean()))),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert('analyticsEvents', {
      eventType: args.eventType,
      path: args.path,
      projectSlug: args.projectSlug,
      sessionId: args.sessionId,
      meta: args.meta,
      createdAt: Date.now(),
    })

    return { success: true }
  },
})

export const adminOverview = query({
  args: adminTokenArg,
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.adminToken)

    const now = Date.now()
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000
    const events = await ctx.db
      .query('analyticsEvents')
      .withIndex('by_createdAt', (q) => q.gte('createdAt', thirtyDaysAgo))
      .collect()

    return {
      last7Days: aggregateWindow(events, 7),
      last30Days: aggregateWindow(events, 30),
      totals: {
        events: events.length,
      },
    }
  },
})

export const adminTimeseries = query({
  args: {
    ...adminTokenArg,
    days: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.adminToken)

    const rangeDays = Math.min(Math.max(args.days ?? 30, 1), 90)
    const now = Date.now()
    const cutoff = now - rangeDays * 24 * 60 * 60 * 1000

    const events = await ctx.db
      .query('analyticsEvents')
      .withIndex('by_createdAt', (q) => q.gte('createdAt', cutoff))
      .collect()

    const byDay = new Map<string, TimeseriesRow>()
    for (const event of events) {
      const key = dayBucket(event.createdAt)
      const row = byDay.get(key) ?? {
        day: key,
        pageViews: 0,
        projectInteractions: 0,
        contactSubmits: 0,
      }

      if (event.eventType === 'page_view') {
        row.pageViews += 1
      }

      if (
        event.eventType === 'project_open' ||
        event.eventType === 'project_link_click'
      ) {
        row.projectInteractions += 1
      }

      if (event.eventType === 'contact_submit') {
        row.contactSubmits += 1
      }

      byDay.set(key, row)
    }

    return Array.from(byDay.values()).sort((a, b) => a.day.localeCompare(b.day))
  },
})

export const adminTopProjects = query({
  args: {
    ...adminTokenArg,
    days: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.adminToken)

    const rangeDays = Math.min(Math.max(args.days ?? 30, 1), 90)
    const now = Date.now()
    const cutoff = now - rangeDays * 24 * 60 * 60 * 1000

    const events = await ctx.db
      .query('analyticsEvents')
      .withIndex('by_createdAt', (q) => q.gte('createdAt', cutoff))
      .collect()

    const projectMap = new Map<
      string,
      { projectSlug: string; opens: number; linkClicks: number }
    >()
    for (const event of events) {
      if (!event.projectSlug) continue
      if (
        event.eventType !== 'project_open' &&
        event.eventType !== 'project_link_click'
      ) {
        continue
      }

      const stat = projectMap.get(event.projectSlug) ?? {
        projectSlug: event.projectSlug,
        opens: 0,
        linkClicks: 0,
      }

      if (event.eventType === 'project_open') {
        stat.opens += 1
      } else {
        stat.linkClicks += 1
      }

      projectMap.set(event.projectSlug, stat)
    }

    return Array.from(projectMap.values())
      .map((item) => ({
        ...item,
        totalInteractions: item.opens + item.linkClicks,
      }))
      .sort((a, b) => b.totalInteractions - a.totalInteractions)
      .slice(0, 8)
  },
})
