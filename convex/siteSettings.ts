import { mutation, query } from './_generated/server'
import type { MutationCtx, QueryCtx } from './_generated/server'
import type { Doc } from './_generated/dataModel'
import { v } from 'convex/values'

import { adminTokenArg, requireAdmin } from './lib/adminAuth'
import { defaultSiteSettings } from './lib/dummyContent'
import { pickDefined } from './lib/object'

type SiteSettingsDoc = Doc<'siteSettings'>
type SettingsCtx = QueryCtx | MutationCtx

async function getSettingsDoc(ctx: SettingsCtx) {
  return ctx.db
    .query('siteSettings')
    .withIndex('by_key', (q) => q.eq('key', 'main'))
    .first()
}

async function getPublishedProjectCount(ctx: QueryCtx) {
  const projects = await ctx.db
    .query('projects')
    .withIndex('by_status_order', (q) => q.eq('status', 'published'))
    .collect()

  return projects.length
}

function normalizeSettings(
  settings: SiteSettingsDoc | null | undefined,
): Omit<SiteSettingsDoc, '_id' | '_creationTime'> {
  return {
    key: 'main',
    availabilityText:
      settings?.availabilityText ?? defaultSiteSettings.availabilityText,
    availabilityTimezone:
      settings?.availabilityTimezone ?? defaultSiteSettings.availabilityTimezone,
    focusNote: settings?.focusNote ?? defaultSiteSettings.focusNote,
    focusEmoji: settings?.focusEmoji ?? defaultSiteSettings.focusEmoji,
    careerStartYear: settings?.careerStartYear ?? defaultSiteSettings.careerStartYear,
    wallEnabled: settings?.wallEnabled ?? defaultSiteSettings.wallEnabled,
    wallTickerDurationSec:
      settings?.wallTickerDurationSec ?? defaultSiteSettings.wallTickerDurationSec,
    wallMaxVisibleEntries:
      settings?.wallMaxVisibleEntries ?? defaultSiteSettings.wallMaxVisibleEntries,
    updatedAt: settings?.updatedAt ?? Date.now(),
  }
}

export const getPublic = query({
  args: {},
  handler: async (ctx) => {
    const settings = normalizeSettings(await getSettingsDoc(ctx))
    const projectsShipped = await getPublishedProjectCount(ctx)
    const currentYear = new Date().getUTCFullYear()

    return {
      availabilityText: settings.availabilityText,
      availabilityTimezone: settings.availabilityTimezone,
      focusNote: settings.focusNote,
      focusEmoji: settings.focusEmoji,
      wallEnabled: settings.wallEnabled,
      wallTickerDurationSec: settings.wallTickerDurationSec,
      wallMaxVisibleEntries: settings.wallMaxVisibleEntries,
      quickStats: {
        projectsShipped,
        yearsExperience: Math.max(currentYear - settings.careerStartYear, 1),
      },
      updatedAt: settings.updatedAt,
    }
  },
})

export const adminGet = query({
  args: adminTokenArg,
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.adminToken)
    return normalizeSettings(await getSettingsDoc(ctx))
  },
})

export const adminUpdate = mutation({
  args: {
    ...adminTokenArg,
    availabilityText: v.optional(v.string()),
    availabilityTimezone: v.optional(v.string()),
    focusNote: v.optional(v.string()),
    focusEmoji: v.optional(v.string()),
    careerStartYear: v.optional(v.number()),
    wallEnabled: v.optional(v.boolean()),
    wallTickerDurationSec: v.optional(v.number()),
    wallMaxVisibleEntries: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.adminToken)

    const existing = await getSettingsDoc(ctx)
    const now = Date.now()
    const wallTickerDurationSec =
      args.wallTickerDurationSec === undefined
        ? undefined
        : Math.max(Math.floor(args.wallTickerDurationSec), 10)
    const wallMaxVisibleEntries =
      args.wallMaxVisibleEntries === undefined
        ? undefined
        : Math.min(Math.max(Math.floor(args.wallMaxVisibleEntries), 1), 30)

    const patch = pickDefined({
      availabilityText: args.availabilityText,
      availabilityTimezone: args.availabilityTimezone,
      focusNote: args.focusNote,
      focusEmoji: args.focusEmoji,
      careerStartYear: args.careerStartYear,
      wallEnabled: args.wallEnabled,
      wallTickerDurationSec,
      wallMaxVisibleEntries,
      updatedAt: now,
    })

    if (!existing) {
      const merged = {
        ...defaultSiteSettings,
        ...patch,
        key: 'main',
        updatedAt: now,
      }
      await ctx.db.insert('siteSettings', merged)
      return merged
    }

    await ctx.db.patch(existing._id, patch)
    return { ...existing, ...patch }
  },
})
