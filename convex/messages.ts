import { mutation, query } from './_generated/server'
import { v } from 'convex/values'

import { adminTokenArg, requireAdmin } from './lib/adminAuth'

export const submit = mutation({
  args: {
    senderName: v.string(),
    senderEmail: v.string(),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert('messages', {
      senderName: args.senderName,
      senderEmail: args.senderEmail,
      content: args.content,
      status: 'new',
      createdAt: Date.now(),
    })
  },
})

export const adminList = query({
  args: adminTokenArg,
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.adminToken)

    return await ctx.db
      .query('messages')
      .withIndex('by_createdAt')
      .order('desc')
      .collect()
  },
})

export const updateStatus = mutation({
  args: {
    ...adminTokenArg,
    id: v.id('messages'),
    status: v.union(v.literal('new'), v.literal('read'), v.literal('archived')),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.adminToken)

    const message = await ctx.db.get(args.id)
    if (!message) {
      throw new Error('Message not found')
    }

    await ctx.db.patch(args.id, { status: args.status })
    return { success: true }
  },
})
