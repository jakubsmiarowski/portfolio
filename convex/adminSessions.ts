import { mutation } from './_generated/server'
import { v } from 'convex/values'

import {
  adminTokenArg,
  getIssueSecret,
  hashToken,
  requireAdmin,
} from './lib/adminAuth'

export const issue = mutation({
  args: {
    ownerEmail: v.string(),
    rawToken: v.string(),
    expiresAt: v.number(),
    issueSecret: v.string(),
  },
  handler: async (ctx, args) => {
    if (args.issueSecret !== getIssueSecret()) {
      throw new Error('Unauthorized token issue request')
    }

    const ownerSessions = await ctx.db
      .query('adminSessions')
      .withIndex('by_ownerEmail', (q) => q.eq('ownerEmail', args.ownerEmail))
      .collect()

    for (const session of ownerSessions) {
      if (!session.revoked && session.expiresAt > Date.now()) {
        await ctx.db.patch(session._id, { revoked: true })
      }
    }

    const tokenHash = await hashToken(args.rawToken)
    await ctx.db.insert('adminSessions', {
      tokenHash,
      ownerEmail: args.ownerEmail,
      expiresAt: args.expiresAt,
      revoked: false,
      createdAt: Date.now(),
    })

    return { success: true }
  },
})

export const revoke = mutation({
  args: adminTokenArg,
  handler: async (ctx, args) => {
    const session = await requireAdmin(ctx, args.adminToken)
    if (session._id) {
      await ctx.db.patch(session._id, { revoked: true })
    }
    return { success: true }
  },
})

export const revokeByOwner = mutation({
  args: {
    ownerEmail: v.string(),
    issueSecret: v.string(),
  },
  handler: async (ctx, args) => {
    if (args.issueSecret !== getIssueSecret()) {
      throw new Error('Unauthorized token revoke request')
    }

    const ownerSessions = await ctx.db
      .query('adminSessions')
      .withIndex('by_ownerEmail', (q) => q.eq('ownerEmail', args.ownerEmail))
      .collect()

    for (const session of ownerSessions) {
      if (!session.revoked && session.expiresAt > Date.now()) {
        await ctx.db.patch(session._id, { revoked: true })
      }
    }

    return { success: true }
  },
})
