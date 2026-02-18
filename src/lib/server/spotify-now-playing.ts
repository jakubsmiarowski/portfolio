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
  id?: string
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

export type NowPlayingStatus = 'playing' | 'idle' | 'unavailable'

export type NowPlayingTrack = {
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

export type NowPlayingPayload = {
  status: NowPlayingStatus
  track: NowPlayingTrack | null
  fetchedAt: string
}

type FetchLike = typeof fetch

type CachedNowPlaying = {
  value: NowPlayingPayload | null
  expiresAt: number
  inFlight: Promise<NowPlayingPayload> | null
}

const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token'
const SPOTIFY_CURRENT_URL = 'https://api.spotify.com/v1/me/player/currently-playing'
const SPOTIFY_RECENT_URL = 'https://api.spotify.com/v1/me/player/recently-played?limit=1'
const SPOTIFY_ARTISTS_URL = 'https://api.spotify.com/v1/artists'

const cache: CachedNowPlaying = {
  value: null,
  expiresAt: 0,
  inFlight: null,
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
  const env = typeof process !== 'undefined' ? process.env : undefined
  const clientId = env?.SPOTIFY_CLIENT_ID?.trim()
  const clientSecret = env?.SPOTIFY_CLIENT_SECRET?.trim()
  const refreshToken = env?.SPOTIFY_REFRESH_TOKEN?.trim()

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error('Missing Spotify credentials.')
  }

  return {
    clientId,
    clientSecret,
    refreshToken,
  }
}

function isoNow() {
  return new Date().toISOString()
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

function buildPayload(
  status: NowPlayingStatus,
  track: NowPlayingTrack | null,
): NowPlayingPayload {
  return {
    status,
    track,
    fetchedAt: isoNow(),
  }
}

export function normalizeSpotifyTrack(
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
  const primaryGenre = genres[0]

  return {
    title: track.name,
    artists: artists.join(', '),
    album: track.album?.name ?? '',
    albumImageUrl: track.album?.images?.[0]?.url ?? '',
    trackUrl: track.external_urls?.spotify ?? '',
    genres: genres.length > 0 ? genres : undefined,
    primaryGenre,
    durationMs,
    progressMs,
    playedAt,
  }
}

export async function fetchArtistGenres(
  accessToken: string,
  artistIds: string[],
  fetchImpl: FetchLike = fetch,
) {
  const ids = artistIds.filter(Boolean)
  if (ids.length === 0) {
    return [] as string[]
  }

  const query = new URLSearchParams({
    ids: ids.join(','),
  })

  const response = await fetchImpl(`${SPOTIFY_ARTISTS_URL}?${query.toString()}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    throw new Error(`Spotify artists lookup failed with status ${response.status}.`)
  }

  const data = (await response.json()) as SpotifyArtistsResponse
  const allGenres = (data.artists ?? []).flatMap((artist) => artist.genres ?? [])

  return normalizeGenres(allGenres)
}

export async function getSpotifyAccessToken(fetchImpl: FetchLike = fetch) {
  const { clientId, clientSecret, refreshToken } = getSpotifyCredentials()
  const basicToken = toBase64(`${clientId}:${clientSecret}`)
  const response = await fetchImpl(SPOTIFY_TOKEN_URL, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basicToken}`,
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

export async function fetchCurrentlyPlaying(
  accessToken: string,
  fetchImpl: FetchLike = fetch,
) {
  const response = await fetchImpl(SPOTIFY_CURRENT_URL, {
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
      ? await fetchArtistGenres(accessToken, artistIds, fetchImpl).catch(() => [])
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

export async function fetchRecentlyPlayed(
  accessToken: string,
  fetchImpl: FetchLike = fetch,
) {
  const response = await fetchImpl(SPOTIFY_RECENT_URL, {
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
      ? await fetchArtistGenres(accessToken, artistIds, fetchImpl).catch(() => [])
      : []

  return normalizeSpotifyTrack(latest.track, {
    playedAt: latest.played_at,
    genres,
  })
}

export async function resolveNowPlaying(fetchImpl: FetchLike = fetch) {
  const token = await getSpotifyAccessToken(fetchImpl)

  const current = await fetchCurrentlyPlaying(token, fetchImpl)
  if (current?.isPlaying && current.track) {
    return buildPayload('playing', current.track)
  }

  const recent = await fetchRecentlyPlayed(token, fetchImpl)
  if (recent) {
    return buildPayload('idle', recent)
  }

  return buildPayload('unavailable', null)
}

export async function resolveNowPlayingSafe(fetchImpl: FetchLike = fetch) {
  try {
    return await resolveNowPlaying(fetchImpl)
  } catch {
    return buildPayload('unavailable', null)
  }
}

export async function getCachedNowPlaying(options?: {
  ttlMs?: number
  fetchImpl?: FetchLike
}) {
  const ttlMs = Math.max(options?.ttlMs ?? 25_000, 1_000)
  const fetchImpl = options?.fetchImpl ?? fetch
  const now = Date.now()

  if (cache.value && cache.expiresAt > now) {
    return cache.value
  }

  if (cache.inFlight) {
    return cache.inFlight
  }

  cache.inFlight = resolveNowPlayingSafe(fetchImpl)
    .then((payload) => {
      cache.value = payload
      cache.expiresAt = Date.now() + ttlMs
      return payload
    })
    .finally(() => {
      cache.inFlight = null
    })

  return cache.inFlight
}

export function clearNowPlayingCache() {
  cache.value = null
  cache.expiresAt = 0
  cache.inFlight = null
}
