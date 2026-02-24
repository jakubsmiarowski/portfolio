import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
  projects: defineTable({
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
    landingImageFit: v.optional(
      v.union(v.literal('cover'), v.literal('contain')),
    ),
    detailImageFit: v.optional(
      v.union(v.literal('cover'), v.literal('contain')),
    ),
    liveUrl: v.optional(v.string()),
    repoUrl: v.optional(v.string()),
    caseStudyUrl: v.optional(v.string()),
    tags: v.array(v.string()),
    accentColor: v.string(),
    bgTint: v.optional(v.string()),
    status: v.union(v.literal('draft'), v.literal('published')),
    order: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_status_order', ['status', 'order'])
    .index('by_order', ['order'])
    .index('by_slug', ['slug']),

  testimonials: defineTable({
    personName: v.string(),
    personRole: v.string(),
    company: v.string(),
    avatarUrl: v.optional(v.string()),
    quote: v.string(),
    isPublished: v.boolean(),
    order: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_published_order', ['isPublished', 'order'])
    .index('by_order', ['order']),

  messages: defineTable({
    senderName: v.string(),
    senderEmail: v.string(),
    content: v.string(),
    status: v.union(v.literal('new'), v.literal('read'), v.literal('archived')),
    createdAt: v.number(),
  }).index('by_createdAt', ['createdAt']),

  analyticsEvents: defineTable({
    eventType: v.union(
      v.literal('page_view'),
      v.literal('project_open'),
      v.literal('project_link_click'),
      v.literal('cta_click'),
      v.literal('testimonial_switch'),
      v.literal('contact_submit'),
      v.literal('wall_submit'),
    ),
    path: v.string(),
    projectSlug: v.optional(v.string()),
    sessionId: v.string(),
    meta: v.optional(v.record(v.string(), v.union(v.string(), v.number(), v.boolean()))),
    createdAt: v.number(),
  })
    .index('by_createdAt', ['createdAt'])
    .index('by_eventType_createdAt', ['eventType', 'createdAt'])
    .index('by_projectSlug_createdAt', ['projectSlug', 'createdAt']),

  siteSettings: defineTable({
    key: v.string(),
    availabilityText: v.string(),
    availabilityTimezone: v.string(),
    focusNote: v.string(),
    focusEmoji: v.optional(v.string()),
    careerStartYear: v.number(),
    wallEnabled: v.optional(v.boolean()),
    wallTickerDurationSec: v.optional(v.number()),
    wallMaxVisibleEntries: v.optional(v.number()),
    updatedAt: v.number(),
  }).index('by_key', ['key']),

  wallEntries: defineTable({
    displayName: v.string(),
    message: v.optional(v.string()),
    status: v.union(
      v.literal('pending'),
      v.literal('approved'),
      v.literal('archived'),
    ),
    sessionId: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_createdAt', ['createdAt'])
    .index('by_status_createdAt', ['status', 'createdAt'])
    .index('by_sessionId_createdAt', ['sessionId', 'createdAt']),

  adminSessions: defineTable({
    tokenHash: v.string(),
    ownerEmail: v.string(),
    expiresAt: v.number(),
    revoked: v.boolean(),
    createdAt: v.number(),
  })
    .index('by_tokenHash', ['tokenHash'])
    .index('by_ownerEmail', ['ownerEmail'])
    .index('by_expiresAt', ['expiresAt']),

  spotifyNowPlaying: defineTable({
    key: v.string(),
    status: v.union(v.literal('playing'), v.literal('idle'), v.literal('unavailable')),
    track: v.union(
      v.null(),
      v.object({
        title: v.string(),
        artists: v.string(),
        album: v.string(),
        albumImageUrl: v.string(),
        trackUrl: v.string(),
        genres: v.optional(v.array(v.string())),
        primaryGenre: v.optional(v.string()),
        durationMs: v.optional(v.number()),
        progressMs: v.optional(v.number()),
        playedAt: v.optional(v.string()),
      }),
    ),
    fetchedAt: v.string(),
    nextRefreshAt: v.number(),
    updatedAt: v.number(),
    error: v.optional(v.string()),
  }).index('by_key', ['key']),
})
