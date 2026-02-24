import { mutation, query } from './_generated/server'
import { v } from 'convex/values'

import { adminTokenArg, requireAdmin } from './lib/adminAuth'
import { normalizeImageReference, requireImageReference } from './lib/imageRef'
import { pickDefined } from './lib/object'

type FeatureCardInput = { title: string; emoji?: string; content: string }
type ProjectImageFit = 'cover' | 'contain'

const MIN_PROJECT_YEAR = 1990
const PROJECT_YEAR_PATTERN = /^(\d{4})(?:\s*-\s*(\d{4}))?$/

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

function normalizeProjectImageFit(value: ProjectImageFit | undefined, fallback: ProjectImageFit) {
  return value === 'contain' ? 'contain' : fallback
}

function normalizeProjectYear(value: string | undefined) {
  if (value === undefined) {
    return undefined
  }

  const trimmed = value.trim()
  if (!trimmed) {
    return undefined
  }

  const match = trimmed.match(PROJECT_YEAR_PATTERN)
  if (!match) {
    throw new Error('Year must be in format YYYY or YYYY-YYYY')
  }

  const startYear = Number.parseInt(match[1], 10)
  const endYear = match[2] ? Number.parseInt(match[2], 10) : undefined
  const maxYear = new Date().getFullYear() + 1
  if (startYear < MIN_PROJECT_YEAR || startYear > maxYear) {
    throw new Error(`Year must be between ${MIN_PROJECT_YEAR} and ${maxYear}`)
  }

  if (endYear !== undefined) {
    if (endYear < MIN_PROJECT_YEAR || endYear > maxYear) {
      throw new Error(`Year must be between ${MIN_PROJECT_YEAR} and ${maxYear}`)
    }
    if (endYear < startYear) {
      throw new Error('Year range end must be greater than or equal to start')
    }
    return `${startYear}-${endYear}`
  }

  return `${startYear}`
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
    year: v.optional(v.string()),
    coverImageUrl: v.string(),
    landingImageUrl: v.optional(v.string()),
    detailImageUrl: v.optional(v.string()),
    landingImageFit: v.optional(v.union(v.literal('cover'), v.literal('contain'))),
    detailImageFit: v.optional(v.union(v.literal('cover'), v.literal('contain'))),
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

    const year = normalizeProjectYear(args.year)
    const coverImageUrl = requireImageReference(args.coverImageUrl, 'coverImageUrl')
    const landingImageUrl =
      normalizeImageReference(args.landingImageUrl) ?? coverImageUrl
    const detailImageUrl = normalizeImageReference(args.detailImageUrl) ?? coverImageUrl

    return await ctx.db.insert(
      'projects',
      {
        slug: args.slug,
        title: args.title,
        headline: args.headline,
        summary: args.summary,
        body: args.body,
        featureCards: normalizeFeatureCards(args.featureCards),
        year,
        coverImageUrl,
        landingImageUrl,
        detailImageUrl,
        landingImageFit: normalizeProjectImageFit(args.landingImageFit, 'cover'),
        detailImageFit: normalizeProjectImageFit(args.detailImageFit, 'contain'),
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
      } as never,
    )
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
    year: v.optional(v.string()),
    coverImageUrl: v.optional(v.string()),
    landingImageUrl: v.optional(v.string()),
    detailImageUrl: v.optional(v.string()),
    landingImageFit: v.optional(v.union(v.literal('cover'), v.literal('contain'))),
    detailImageFit: v.optional(v.union(v.literal('cover'), v.literal('contain'))),
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
      tags: args.tags,
      accentColor: args.accentColor,
      status: args.status,
      order: args.order,
      updatedAt: Date.now(),
    }) as Record<string, unknown>

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

    if ('year' in args) {
      patch.year = normalizeProjectYear(args.year)
    }

    const projectWithMedia = project as {
      coverImageUrl: string
      landingImageUrl?: string
      detailImageUrl?: string
    }

    let resolvedCoverImageUrl = projectWithMedia.coverImageUrl
    if ('coverImageUrl' in args) {
      resolvedCoverImageUrl = requireImageReference(args.coverImageUrl, 'coverImageUrl')
      patch.coverImageUrl = resolvedCoverImageUrl
    }

    if ('landingImageUrl' in args) {
      const landingImageUrl =
        normalizeImageReference(args.landingImageUrl) ?? resolvedCoverImageUrl
      patch.landingImageUrl = landingImageUrl

      if (!('coverImageUrl' in args)) {
        patch.coverImageUrl = landingImageUrl
      }
    }

    if ('detailImageUrl' in args) {
      patch.detailImageUrl =
        normalizeImageReference(args.detailImageUrl) ?? resolvedCoverImageUrl
    }

    if ('landingImageFit' in args) {
      patch.landingImageFit = normalizeProjectImageFit(args.landingImageFit, 'cover')
    }

    if ('detailImageFit' in args) {
      patch.detailImageFit = normalizeProjectImageFit(args.detailImageFit, 'contain')
    }

    if (
      'coverImageUrl' in args &&
      !('landingImageUrl' in args) &&
      !projectWithMedia.landingImageUrl
    ) {
      patch.landingImageUrl = resolvedCoverImageUrl
    }

    if (
      'coverImageUrl' in args &&
      !('detailImageUrl' in args) &&
      !projectWithMedia.detailImageUrl
    ) {
      patch.detailImageUrl = resolvedCoverImageUrl
    }

    return await ctx.db.patch(args.id, patch as never)
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
