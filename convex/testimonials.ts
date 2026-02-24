import { mutation, query } from './_generated/server'
import { v } from 'convex/values'

import { adminTokenArg, requireAdmin } from './lib/adminAuth'
import { normalizeImageReference } from './lib/imageRef'
import { pickDefined } from './lib/object'

export const listPublished = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query('testimonials')
      .withIndex('by_published_order', (q) => q.eq('isPublished', true))
      .order('asc')
      .collect()
  },
})

export const adminList = query({
  args: adminTokenArg,
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.adminToken)
    return await ctx.db
      .query('testimonials')
      .withIndex('by_order')
      .order('asc')
      .collect()
  },
})

export const create = mutation({
  args: {
    ...adminTokenArg,
    personName: v.string(),
    personRole: v.string(),
    company: v.string(),
    avatarUrl: v.optional(v.string()),
    quote: v.string(),
    isPublished: v.boolean(),
    order: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.adminToken)

    let order = args.order
    if (order === undefined) {
      const last = await ctx.db
        .query('testimonials')
        .withIndex('by_order')
        .order('desc')
        .first()
      order = (last?.order ?? 0) + 1
    }

    const now = Date.now()
    const avatarUrl = normalizeImageReference(args.avatarUrl)

    return await ctx.db.insert('testimonials', {
      personName: args.personName,
      personRole: args.personRole,
      company: args.company,
      avatarUrl,
      quote: args.quote,
      isPublished: args.isPublished,
      order,
      createdAt: now,
      updatedAt: now,
    })
  },
})

export const update = mutation({
  args: {
    ...adminTokenArg,
    id: v.id('testimonials'),
    personName: v.optional(v.string()),
    personRole: v.optional(v.string()),
    company: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    quote: v.optional(v.string()),
    isPublished: v.optional(v.boolean()),
    order: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.adminToken)

    const testimonial = await ctx.db.get(args.id)
    if (!testimonial) {
      throw new Error('Testimonial not found')
    }

    const patch = pickDefined({
      personName: args.personName,
      personRole: args.personRole,
      company: args.company,
      quote: args.quote,
      isPublished: args.isPublished,
      order: args.order,
      updatedAt: Date.now(),
    }) as Record<string, unknown>

    if ('avatarUrl' in args) {
      patch.avatarUrl = normalizeImageReference(args.avatarUrl)
    }

    return await ctx.db.patch(args.id, patch as never)
  },
})

export const remove = mutation({
  args: {
    ...adminTokenArg,
    id: v.id('testimonials'),
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
        id: v.id('testimonials'),
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
