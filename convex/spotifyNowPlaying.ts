import { v } from 'convex/values'

import { internal } from './_generated/api'
import { action, internalMutation, internalQuery, query } from './_generated/server'
import type { MutationCtx, QueryCtx } from './_generated/server'

type NowPlayingStatus = 'playing' | 'idle' | 'unavailable'

type NowPlayingTrack = {
  title: string
  artists: string
  album: string
  albumImageUrl: string
  trackUrl: string
  genres?: string[]
  primaryGenre?: string
  durationMs?: number
  progressMs?: number
  playedAt?: string
}

type NowPlayingPayload = {
  status: NowPlayingStatus
  track: NowPlayingTrack | null
  fetchedAt: string
}

type SpotifyTokenResponse = {
  access_token?: string
}

type SpotifyImage = {
  url: string
}

type SpotifyArtist = {
  name: string
  id?: string
}

type SpotifyAlbum = {
  name: string
  images?: SpotifyImage[]
}

type SpotifyTrackObject = {
  name?: string
  artists?: SpotifyArtist[]
  album?: SpotifyAlbum
  duration_ms?: number
  external_urls?: {
    spotify?: string
  }
}

type SpotifyArtistObject = {
  genres?: string[]
}

type SpotifyArtistsResponse = {
  artists?: SpotifyArtistObject[]
}

type SpotifyCurrentlyPlayingResponse = {
  is_playing?: boolean
  progress_ms?: number | null
  item?: SpotifyTrackObject | null
}

type SpotifyRecentlyPlayedItem = {
  played_at?: string
  track?: SpotifyTrackObject
}

type SpotifyRecentlyPlayedResponse = {
  items?: SpotifyRecentlyPlayedItem[]
}

const MAIN_KEY = 'main'
const MIN_REFRESH_MS = 25_000
const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token'
const SPOTIFY_CURRENT_URL = 'https://api.spotify.com/v1/me/player/currently-playing'
const SPOTIFY_RECENT_URL = 'https://api.spotify.com/v1/me/player/recently-played?limit=1'
const SPOTIFY_ARTISTS_URL = 'https://api.spotify.com/v1/artists'

const nowPlayingStatusValidator = v.union(
  v.literal('playing'),
  v.literal('idle'),
  v.literal('unavailable'),
)

const nowPlayingTrackValidator = v.union(
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
)

function fallbackPayload(): NowPlayingPayload {
  return {
    status: 'unavailable',
    track: null,
    fetchedAt: isoNow(),
  }
}

function isoNow() {
  return new Date().toISOString()
}

function toBase64(value: string) {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(value).toString('base64')
  }

  if (typeof btoa !== 'undefined') {
    return btoa(value)
  }

  throw new Error('No base64 encoder available for Spotify auth.')
}

function getSpotifyCredentials() {
  const clientId = process.env.SPOTIFY_CLIENT_ID?.trim()
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET?.trim()
  const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN?.trim()

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error('Missing Spotify credentials in Convex env.')
  }

  return {
    clientId,
    clientSecret,
    refreshToken,
  }
}

function normalizeGenres(genres?: string[] | null) {
  const result: string[] = []
  const seen = new Set<string>()

  for (const genre of genres ?? []) {
    const normalized = genre.trim().toLowerCase()
    if (!normalized || seen.has(normalized)) {
      continue
    }
    seen.add(normalized)
    result.push(normalized)
  }

  return result
}

function getTrackArtistIds(track: SpotifyTrackObject | null | undefined) {
  const ids: string[] = []
  const seen = new Set<string>()

  for (const artist of track?.artists ?? []) {
    const id = artist.id?.trim()
    if (!id || seen.has(id)) {
      continue
    }
    seen.add(id)
    ids.push(id)
  }

  return ids
}

function normalizeSpotifyTrack(
  track: SpotifyTrackObject | null | undefined,
  options?: {
    progressMs?: number | null
    playedAt?: string | null
    genres?: string[] | null
  },
): NowPlayingTrack | null {
  if (!track?.name) {
    return null
  }

  const artists = track.artists?.map((artist) => artist.name).filter(Boolean) ?? []
  const durationMs =
    typeof track.duration_ms === 'number' ? Math.max(track.duration_ms, 0) : undefined
  const progressMs =
    typeof options?.progressMs === 'number' ? Math.max(options.progressMs, 0) : undefined
  const playedAt = options?.playedAt?.trim() || undefined
  const genres = normalizeGenres(options?.genres)

  return {
    title: track.name,
    artists: artists.join(', '),
    album: track.album?.name ?? '',
    albumImageUrl: track.album?.images?.[0]?.url ?? '',
    trackUrl: track.external_urls?.spotify ?? '',
    genres: genres.length > 0 ? genres : undefined,
    primaryGenre: genres[0],
    durationMs,
    progressMs,
    playedAt,
  }
}

async function getSpotifyAccessToken() {
  const { clientId, clientSecret, refreshToken } = getSpotifyCredentials()
  const response = await fetch(SPOTIFY_TOKEN_URL, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${toBase64(`${clientId}:${clientSecret}`)}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  })

  if (!response.ok) {
    throw new Error(`Spotify token refresh failed with status ${response.status}.`)
  }

  const data = (await response.json()) as SpotifyTokenResponse
  if (!data.access_token) {
    throw new Error('Spotify token response missing access_token.')
  }

  return data.access_token
}

async function fetchArtistGenres(accessToken: string, artistIds: string[]) {
  if (artistIds.length === 0) {
    return [] as string[]
  }

  const params = new URLSearchParams({
    ids: artistIds.join(','),
  })

  const response = await fetch(`${SPOTIFY_ARTISTS_URL}?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    throw new Error(`Spotify artists lookup failed with status ${response.status}.`)
  }

  const data = (await response.json()) as SpotifyArtistsResponse
  const genres = (data.artists ?? []).flatMap((artist) => artist.genres ?? [])
  return normalizeGenres(genres)
}

async function fetchCurrentlyPlaying(accessToken: string) {
  const response = await fetch(SPOTIFY_CURRENT_URL, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (response.status === 204) {
    return null
  }

  if (!response.ok) {
    throw new Error(`Spotify currently-playing failed with status ${response.status}.`)
  }

  const data = (await response.json()) as SpotifyCurrentlyPlayingResponse
  const artistIds = getTrackArtistIds(data.item)
  const genres =
    artistIds.length > 0
      ? await fetchArtistGenres(accessToken, artistIds).catch(() => [])
      : []
  const track = normalizeSpotifyTrack(data.item, {
    progressMs: data.progress_ms,
    genres,
  })

  if (!track) {
    return null
  }

  return {
    isPlaying: Boolean(data.is_playing),
    track,
  }
}

async function fetchRecentlyPlayed(accessToken: string) {
  const response = await fetch(SPOTIFY_RECENT_URL, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    throw new Error(`Spotify recently-played failed with status ${response.status}.`)
  }

  const data = (await response.json()) as SpotifyRecentlyPlayedResponse
  const latest = data.items?.[0]
  if (!latest?.track) {
    return null
  }

  const artistIds = getTrackArtistIds(latest.track)
  const genres =
    artistIds.length > 0
      ? await fetchArtistGenres(accessToken, artistIds).catch(() => [])
      : []

  return normalizeSpotifyTrack(latest.track, {
    playedAt: latest.played_at,
    genres,
  })
}

async function resolveNowPlayingSafe() {
  try {
    const token = await getSpotifyAccessToken()
    const current = await fetchCurrentlyPlaying(token)
    if (current?.isPlaying && current.track) {
      return {
        status: 'playing' as const,
        track: current.track,
        fetchedAt: isoNow(),
      }
    }

    const recent = await fetchRecentlyPlayed(token)
    if (recent) {
      return {
        status: 'idle' as const,
        track: recent,
        fetchedAt: isoNow(),
      }
    }

    return {
      status: 'unavailable' as const,
      track: null,
      fetchedAt: isoNow(),
    }
  } catch {
    return {
      status: 'unavailable' as const,
      track: null,
      fetchedAt: isoNow(),
    }
  }
}

type SnapshotCtx = QueryCtx | MutationCtx

async function getSnapshotDoc(ctx: SnapshotCtx) {
  return await ctx.db
    .query('spotifyNowPlaying')
    .withIndex('by_key', (q) => q.eq('key', MAIN_KEY))
    .first()
}

export const getPublic = query({
  args: {},
  handler: async (ctx) => {
    const snapshot = await getSnapshotDoc(ctx)
    if (!snapshot) {
      return fallbackPayload()
    }

    return {
      status: snapshot.status,
      track: snapshot.track ?? null,
      fetchedAt: snapshot.fetchedAt || isoNow(),
    }
  },
})

export const getPublicInternal = internalQuery({
  args: {},
  handler: async (ctx) => {
    const snapshot = await getSnapshotDoc(ctx)
    if (!snapshot) {
      return fallbackPayload()
    }

    return {
      status: snapshot.status,
      track: snapshot.track ?? null,
      fetchedAt: snapshot.fetchedAt || isoNow(),
    }
  },
})

export const acquireRefreshLease = internalMutation({
  args: {
    nowMs: v.number(),
    minRefreshMs: v.number(),
    force: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const nowMs = args.nowMs
    const minRefreshMs = Math.max(Math.floor(args.minRefreshMs), 1_000)
    const nextRefreshAt = nowMs + minRefreshMs
    const snapshot = await getSnapshotDoc(ctx)

    if (!snapshot) {
      const fallback = fallbackPayload()
      await ctx.db.insert('spotifyNowPlaying', {
        key: MAIN_KEY,
        status: fallback.status,
        track: fallback.track,
        fetchedAt: fallback.fetchedAt,
        nextRefreshAt,
        updatedAt: nowMs,
      })
      return { acquired: true, nextRefreshAt }
    }

    if (!args.force && snapshot.nextRefreshAt > nowMs) {
      return {
        acquired: false,
        nextRefreshAt: snapshot.nextRefreshAt,
      }
    }

    await ctx.db.patch(snapshot._id, {
      nextRefreshAt,
      updatedAt: nowMs,
      error: undefined,
    })

    return { acquired: true, nextRefreshAt }
  },
})

export const saveSnapshot = internalMutation({
  args: {
    status: nowPlayingStatusValidator,
    track: nowPlayingTrackValidator,
    fetchedAt: v.string(),
    nowMs: v.number(),
  },
  handler: async (ctx, args) => {
    const snapshot = await getSnapshotDoc(ctx)
    const patch = {
      status: args.status,
      track: args.track,
      fetchedAt: args.fetchedAt,
      updatedAt: args.nowMs,
      error: undefined,
    }

    if (!snapshot) {
      await ctx.db.insert('spotifyNowPlaying', {
        key: MAIN_KEY,
        ...patch,
        nextRefreshAt: args.nowMs + MIN_REFRESH_MS,
      })
      return
    }

    await ctx.db.patch(snapshot._id, patch)
  },
})

export const markRefreshFailure = internalMutation({
  args: {
    message: v.string(),
    nowMs: v.number(),
  },
  handler: async (ctx, args) => {
    const snapshot = await getSnapshotDoc(ctx)
    if (!snapshot) {
      await ctx.db.insert('spotifyNowPlaying', {
        key: MAIN_KEY,
        status: 'unavailable',
        track: null,
        fetchedAt: isoNow(),
        nextRefreshAt: args.nowMs + MIN_REFRESH_MS,
        updatedAt: args.nowMs,
        error: args.message.slice(0, 300),
      })
      return
    }

    await ctx.db.patch(snapshot._id, {
      status: 'unavailable',
      track: null,
      fetchedAt: isoNow(),
      updatedAt: args.nowMs,
      error: args.message.slice(0, 300),
    })
  },
})

export const refresh = action({
  args: {
    force: v.optional(v.boolean()),
  },
  handler: async (ctx, args): Promise<NowPlayingPayload> => {
    const nowMs = Date.now()
    const lease = await ctx.runMutation(
      internal.spotifyNowPlaying.acquireRefreshLease,
      {
        nowMs,
        minRefreshMs: MIN_REFRESH_MS,
        force: args.force ?? false,
      },
    )

    if (!lease?.acquired) {
      return await ctx.runQuery(internal.spotifyNowPlaying.getPublicInternal, {})
    }

    try {
      const payload = await resolveNowPlayingSafe()
      await ctx.runMutation(internal.spotifyNowPlaying.saveSnapshot, {
        status: payload.status,
        track: payload.track,
        fetchedAt: payload.fetchedAt,
        nowMs: Date.now(),
      })
      return payload
    } catch (error) {
      await ctx.runMutation(internal.spotifyNowPlaying.markRefreshFailure, {
        nowMs: Date.now(),
        message: error instanceof Error ? error.message : 'Unexpected Spotify refresh failure.',
      })
      return await ctx.runQuery(internal.spotifyNowPlaying.getPublicInternal, {})
    }
  },
})
