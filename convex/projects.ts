import { mutation, query } from './_generated/server'
import type { Doc } from './_generated/dataModel'
import { v } from 'convex/values'

import { adminTokenArg, requireAdmin } from './lib/adminAuth'
import { pickDefined } from './lib/object'

type ProjectDoc = Doc<'projects'>
type FeatureCardInput = { title: string; emoji?: string; content: string }

function normalizeOptionalString(value: string | undefined) {
  if (value === undefined) {
    return undefined
  }

  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

function normalizeFeatureCards(cards: FeatureCardInput[] | undefined) {
  if (!cards) {
    return undefined
  }

  const normalized = cards
    .map((card) => ({
      title: card.title.trim(),
      emoji: normalizeOptionalString(card.emoji),
      content: card.content.trim(),
    }))
    .filter((card) => card.title.length > 0 && card.content.length > 0)

  return normalized.length > 0 ? normalized : undefined
}

export const listPublished = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query('projects')
      .withIndex('by_status_order', (q) => q.eq('status', 'published'))
      .order('asc')
      .collect()
  },
})

export const adminList = query({
  args: adminTokenArg,
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.adminToken)

    return await ctx.db.query('projects').withIndex('by_order').order('asc').collect()
  },
})

export const create = mutation({
  args: {
    ...adminTokenArg,
    slug: v.string(),
    title: v.string(),
    headline: v.string(),
    summary: v.string(),
    body: v.array(v.string()),
    featureCards: v.optional(
      v.array(
        v.object({
          title: v.string(),
          emoji: v.optional(v.string()),
          content: v.string(),
        }),
      ),
    ),
    coverImageUrl: v.string(),
    liveUrl: v.optional(v.string()),
    repoUrl: v.optional(v.string()),
    caseStudyUrl: v.optional(v.string()),
    tags: v.array(v.string()),
    accentColor: v.string(),
    bgTint: v.optional(v.string()),
    status: v.union(v.literal('draft'), v.literal('published')),
    order: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.adminToken)

    const existing = await ctx.db
      .query('projects')
      .withIndex('by_slug', (q) => q.eq('slug', args.slug))
      .first()

    if (existing) {
      throw new Error('Project slug already exists')
    }

    const now = Date.now()
    let order = args.order

    if (order === undefined) {
      const lastProject = await ctx.db
        .query('projects')
        .withIndex('by_order')
        .order('desc')
        .first()
      order = (lastProject?.order ?? 0) + 1
    }

    return await ctx.db.insert('projects', {
      slug: args.slug,
      title: args.title,
      headline: args.headline,
      summary: args.summary,
      body: args.body,
      featureCards: normalizeFeatureCards(args.featureCards),
      coverImageUrl: args.coverImageUrl,
      liveUrl: normalizeOptionalString(args.liveUrl),
      repoUrl: normalizeOptionalString(args.repoUrl),
      caseStudyUrl: normalizeOptionalString(args.caseStudyUrl),
      tags: args.tags,
      accentColor: args.accentColor,
      bgTint: normalizeOptionalString(args.bgTint),
      status: args.status,
      order,
      createdAt: now,
      updatedAt: now,
    })
  },
})

export const update = mutation({
  args: {
    ...adminTokenArg,
    id: v.id('projects'),
    slug: v.optional(v.string()),
    title: v.optional(v.string()),
    headline: v.optional(v.string()),
    summary: v.optional(v.string()),
    body: v.optional(v.array(v.string())),
    featureCards: v.optional(
      v.array(
        v.object({
          title: v.string(),
          emoji: v.optional(v.string()),
          content: v.string(),
        }),
      ),
    ),
    coverImageUrl: v.optional(v.string()),
    liveUrl: v.optional(v.string()),
    repoUrl: v.optional(v.string()),
    caseStudyUrl: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    accentColor: v.optional(v.string()),
    bgTint: v.optional(v.string()),
    status: v.optional(v.union(v.literal('draft'), v.literal('published'))),
    order: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.adminToken)

    const project = await ctx.db.get(args.id)
    if (!project) {
      throw new Error('Project not found')
    }

    const nextSlug = args.slug
    if (nextSlug !== undefined && nextSlug !== project.slug) {
      const slugConflict = await ctx.db
        .query('projects')
        .withIndex('by_slug', (q) => q.eq('slug', nextSlug))
        .first()

      if (slugConflict) {
        throw new Error('Project slug already exists')
      }
    }

    const patch = pickDefined({
      slug: args.slug,
      title: args.title,
      headline: args.headline,
      summary: args.summary,
      body: args.body,
      coverImageUrl: args.coverImageUrl,
      tags: args.tags,
      accentColor: args.accentColor,
      status: args.status,
      order: args.order,
      updatedAt: Date.now(),
    }) as Partial<ProjectDoc>

    if ('liveUrl' in args) {
      patch.liveUrl = normalizeOptionalString(args.liveUrl)
    }

    if ('repoUrl' in args) {
      patch.repoUrl = normalizeOptionalString(args.repoUrl)
    }

    if ('caseStudyUrl' in args) {
      patch.caseStudyUrl = normalizeOptionalString(args.caseStudyUrl)
    }

    if ('bgTint' in args) {
      patch.bgTint = normalizeOptionalString(args.bgTint)
    }

    if ('featureCards' in args) {
      patch.featureCards = normalizeFeatureCards(args.featureCards)
    }

    return await ctx.db.patch(args.id, patch)
  },
})

export const remove = mutation({
  args: {
    ...adminTokenArg,
    id: v.id('projects'),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.adminToken)
    await ctx.db.delete(args.id)
    return { success: true }
  },
})

export const reorder = mutation({
  args: {
    ...adminTokenArg,
    items: v.array(
      v.object({
        id: v.id('projects'),
        order: v.number(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.adminToken)

    const now = Date.now()
    for (const item of args.items) {
      await ctx.db.patch(item.id, {
        order: item.order,
        updatedAt: now,
      })
    }

    return { success: true }
  },
})
