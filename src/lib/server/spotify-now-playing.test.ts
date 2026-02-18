import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  clearNowPlayingCache,
  getCachedNowPlaying,
  normalizeSpotifyTrack,
  resolveNowPlaying,
  resolveNowPlayingSafe,
} from '@/lib/server/spotify-now-playing'

const ENV_KEYS = [
  'SPOTIFY_CLIENT_ID',
  'SPOTIFY_CLIENT_SECRET',
  'SPOTIFY_REFRESH_TOKEN',
] as const

const ENV_SNAPSHOT = Object.fromEntries(
  ENV_KEYS.map((key) => [key, process.env[key]]),
) as Record<(typeof ENV_KEYS)[number], string | undefined>

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json',
    },
  })
}

function setSpotifyEnv() {
  process.env.SPOTIFY_CLIENT_ID = 'client-id'
  process.env.SPOTIFY_CLIENT_SECRET = 'client-secret'
  process.env.SPOTIFY_REFRESH_TOKEN = 'refresh-token'
}

describe('spotify now playing service', () => {
  beforeEach(() => {
    clearNowPlayingCache()
    setSpotifyEnv()
  })

  afterEach(() => {
    clearNowPlayingCache()
    for (const key of ENV_KEYS) {
      const value = ENV_SNAPSHOT[key]
      if (typeof value === 'undefined') {
        delete process.env[key]
      } else {
        process.env[key] = value
      }
    }
  })

  it('normalizes a spotify track', () => {
    const track = normalizeSpotifyTrack(
      {
        name: 'Night Drive',
        artists: [{ name: 'Kavinsky' }, { name: 'The Midnight' }],
        album: {
          name: 'Retro Collection',
          images: [{ url: 'https://cdn.example/cover.jpg' }],
        },
        duration_ms: 230_000,
        external_urls: {
          spotify: 'https://open.spotify.com/track/123',
        },
      },
      {
        progressMs: 42_000,
      },
    )

    expect(track).toEqual({
      title: 'Night Drive',
      artists: 'Kavinsky, The Midnight',
      album: 'Retro Collection',
      albumImageUrl: 'https://cdn.example/cover.jpg',
      trackUrl: 'https://open.spotify.com/track/123',
      genres: undefined,
      primaryGenre: undefined,
      durationMs: 230_000,
      progressMs: 42_000,
      playedAt: undefined,
    })
  })

  it('returns playing payload when spotify reports active playback', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ access_token: 'token-123' }))
      .mockResolvedValueOnce(
        jsonResponse({
          is_playing: true,
          progress_ms: 15_000,
          item: {
            name: 'A Real Hero',
            artists: [
              { name: 'College', id: 'artist-college' },
              { name: 'Electric Youth', id: 'artist-electric-youth' },
            ],
            album: {
              name: 'Drive OST',
              images: [{ url: 'https://cdn.example/drive.jpg' }],
            },
            duration_ms: 267_000,
            external_urls: {
              spotify: 'https://open.spotify.com/track/hero',
            },
          },
        }),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          artists: [
            { id: 'artist-college', genres: ['synthwave', 'electronic'] },
            { id: 'artist-electric-youth', genres: ['electronic'] },
          ],
        }),
      )

    const payload = await resolveNowPlaying(fetchMock as unknown as typeof fetch)

    expect(payload.status).toBe('playing')
    expect(payload.track?.title).toBe('A Real Hero')
    expect(payload.track?.artists).toBe('College, Electric Youth')
    expect(payload.track?.primaryGenre).toBe('synthwave')
    expect(fetchMock).toHaveBeenCalledTimes(3)
  })

  it('falls back to recently played when no active playback exists', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ access_token: 'token-123' }))
      .mockResolvedValueOnce(new Response(null, { status: 204 }))
      .mockResolvedValueOnce(
        jsonResponse({
          items: [
            {
              played_at: '2026-02-13T12:00:00.000Z',
              track: {
                name: 'Midnight City',
                artists: [{ name: 'M83', id: 'artist-m83' }],
                album: {
                  name: "Hurry Up, We're Dreaming",
                  images: [{ url: 'https://cdn.example/m83.jpg' }],
                },
                duration_ms: 244_000,
                external_urls: {
                  spotify: 'https://open.spotify.com/track/midnight-city',
                },
              },
            },
          ],
        }),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          artists: [{ id: 'artist-m83', genres: ['indietronica'] }],
        }),
      )

    const payload = await resolveNowPlaying(fetchMock as unknown as typeof fetch)

    expect(payload.status).toBe('idle')
    expect(payload.track?.title).toBe('Midnight City')
    expect(payload.track?.playedAt).toBe('2026-02-13T12:00:00.000Z')
    expect(payload.track?.primaryGenre).toBe('indietronica')
    expect(fetchMock).toHaveBeenCalledTimes(4)
  })

  it('returns unavailable payload when spotify API fails', async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(new Response(null, { status: 500 }))

    const payload = await resolveNowPlayingSafe(fetchMock as unknown as typeof fetch)

    expect(payload.status).toBe('unavailable')
    expect(payload.track).toBeNull()
  })

  it('uses cached payload inside ttl window', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ access_token: 'token-123' }))
      .mockResolvedValueOnce(
        jsonResponse({
          is_playing: true,
          progress_ms: 4_200,
          item: {
            name: 'Turbo Killer',
            artists: [{ name: 'Carpenter Brut', id: 'artist-carpenter-brut' }],
            album: {
              name: 'Trilogy',
              images: [{ url: 'https://cdn.example/turbo.jpg' }],
            },
            duration_ms: 220_000,
            external_urls: {
              spotify: 'https://open.spotify.com/track/turbo-killer',
            },
          },
        }),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          artists: [{ id: 'artist-carpenter-brut', genres: ['darksynth', 'synthwave'] }],
        }),
      )

    const first = await getCachedNowPlaying({
      ttlMs: 25_000,
      fetchImpl: fetchMock as unknown as typeof fetch,
    })

    const second = await getCachedNowPlaying({
      ttlMs: 25_000,
      fetchImpl: fetchMock as unknown as typeof fetch,
    })

    expect(fetchMock).toHaveBeenCalledTimes(3)
    expect(second).toEqual(first)
  })
})
