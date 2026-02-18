import { mutation, query } from './_generated/server'
import { v } from 'convex/values'

import { adminTokenArg, requireAdmin } from './lib/adminAuth'

const STATUS_VALIDATOR = v.union(
  v.literal('pending'),
  v.literal('approved'),
  v.literal('archived'),
)

const MAX_PUBLIC_RESULTS = 30
const DEFAULT_PUBLIC_RESULTS = 24
const SUBMIT_COOLDOWN_MS = 60 * 1000

function normalizeDisplayName(input: string) {
  return input.trim().replace(/\s+/g, ' ')
}

function normalizeMessage(input?: string) {
  if (!input) return undefined
  const value = input.trim().replace(/\s+/g, ' ')
  return value.length > 0 ? value : undefined
}

function validateSubmitPayload(args: {
  displayName: string
  message?: string
  sessionId: string
}) {
  const displayName = normalizeDisplayName(args.displayName)
  const message = normalizeMessage(args.message)

  if (displayName.length < 2 || displayName.length > 40) {
    throw new Error('Name must be between 2 and 40 characters.')
  }

  if (message && message.length > 140) {
    throw new Error('Message must be 140 characters or fewer.')
  }

  const sessionId = args.sessionId.trim()
  if (sessionId.length < 8 || sessionId.length > 200) {
    throw new Error('Invalid session. Please refresh and try again.')
  }

  return {
    displayName,
    message,
    sessionId,
  }
}

export const submit = mutation({
  args: {
    displayName: v.string(),
    message: v.optional(v.string()),
    sessionId: v.string(),
  },
  handler: async (ctx, args) => {
    const payload = validateSubmitPayload(args)
    const now = Date.now()

    const previous = await ctx.db
      .query('wallEntries')
      .withIndex('by_sessionId_createdAt', (q) =>
        q.eq('sessionId', payload.sessionId),
      )
      .order('desc')
      .first()

    if (previous && now - previous.createdAt < SUBMIT_COOLDOWN_MS) {
      const retryInSec = Math.ceil(
        (SUBMIT_COOLDOWN_MS - (now - previous.createdAt)) / 1000,
      )
      throw new Error(
        `Please wait ${retryInSec} seconds before signing again.`,
      )
    }

    await ctx.db.insert('wallEntries', {
      displayName: payload.displayName,
      message: payload.message,
      status: 'pending',
      sessionId: payload.sessionId,
      createdAt: now,
      updatedAt: now,
    })

    return { success: true }
  },
})

export const listApproved = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = Math.min(
      Math.max(Math.floor(args.limit ?? DEFAULT_PUBLIC_RESULTS), 1),
      MAX_PUBLIC_RESULTS,
    )

    return await ctx.db
      .query('wallEntries')
      .withIndex('by_status_createdAt', (q) => q.eq('status', 'approved'))
      .order('desc')
      .take(limit)
  },
})

export const adminList = query({
  args: {
    ...adminTokenArg,
    status: v.optional(STATUS_VALIDATOR),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.adminToken)
    const status = args.status

    if (status) {
      return await ctx.db
        .query('wallEntries')
        .withIndex('by_status_createdAt', (q) => q.eq('status', status))
        .order('desc')
        .collect()
    }

    return await ctx.db
      .query('wallEntries')
      .withIndex('by_createdAt')
      .order('desc')
      .collect()
  },
})

export const adminUpdateStatus = mutation({
  args: {
    ...adminTokenArg,
    id: v.id('wallEntries'),
    status: STATUS_VALIDATOR,
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.adminToken)

    const entry = await ctx.db.get(args.id)
    if (!entry) {
      throw new Error('Wall entry not found')
    }

    await ctx.db.patch(args.id, {
      status: args.status,
      updatedAt: Date.now(),
    })

    return { success: true }
  },
})

export const adminRemove = mutation({
  args: {
    ...adminTokenArg,
    id: v.id('wallEntries'),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.adminToken)

    const entry = await ctx.db.get(args.id)
    if (!entry) {
      throw new Error('Wall entry not found')
    }

    await ctx.db.delete(args.id)
    return { success: true }
  },
})
