import { mutation } from './_generated/server'
import type { Doc } from './_generated/dataModel'

import { adminTokenArg, requireAdmin } from './lib/adminAuth'
import {
  defaultSiteSettings,
  dummyProjects,
  dummyTestimonials,
  dummyWallEntries,
} from './lib/dummyContent'

export const seedDummyContent = mutation({
  args: adminTokenArg,
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.adminToken)

    const now = Date.now()
    let insertedProjects = 0
    let insertedTestimonials = 0
    let insertedSettings = false
    let insertedWallEntries = 0

    const existingProjects = await ctx.db.query('projects').collect()
    if (existingProjects.length === 0) {
      for (const project of dummyProjects) {
        const status: Doc<'projects'>['status'] =
          project.status === 'draft' ? 'draft' : 'published'
        await ctx.db.insert('projects', {
          ...project,
          status,
          createdAt: now,
          updatedAt: now,
        })
        insertedProjects += 1
      }
    }

    const existingTestimonials = await ctx.db.query('testimonials').collect()
    if (existingTestimonials.length === 0) {
      for (const testimonial of dummyTestimonials) {
        await ctx.db.insert('testimonials', {
          ...testimonial,
          createdAt: now,
          updatedAt: now,
        })
        insertedTestimonials += 1
      }
    }

    const existingSettings = await ctx.db
      .query('siteSettings')
      .withIndex('by_key', (q) => q.eq('key', 'main'))
      .first()

    if (!existingSettings) {
      await ctx.db.insert('siteSettings', {
        ...defaultSiteSettings,
        updatedAt: now,
      })
      insertedSettings = true
    }

    const existingWallEntries = await ctx.db.query('wallEntries').collect()
    if (existingWallEntries.length === 0) {
      for (const entry of dummyWallEntries) {
        await ctx.db.insert('wallEntries', {
          ...entry,
          sessionId: `seed-${entry.displayName.toLowerCase()}`,
          createdAt: now,
          updatedAt: now,
        })
        insertedWallEntries += 1
      }
    }

    return {
      insertedProjects,
      insertedTestimonials,
      insertedSettings,
      insertedWallEntries,
    }
  },
})
