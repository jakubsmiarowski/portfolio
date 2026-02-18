import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAction, useQuery } from 'convex/react'
import { ExternalLink, Music2 } from 'lucide-react'

import { api } from '../../convex/_generated/api'
import { useAnalytics } from '@/lib/analytics'

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

type GenreVariant =
  | 'default'
  | 'synthwave'
  | 'darksynth'
  | 'metalcore'
  | 'progmetal'
  | 'electronic'
  | 'heavy'
  | 'hiphop'
  | 'jazz'
  | 'ambient'

const FALLBACK_PAYLOAD: NowPlayingPayload = {
  status: 'unavailable',
  track: null,
  fetchedAt: new Date().toISOString(),
}

const POLL_MS: Record<NowPlayingStatus, number> = {
  playing: 30_000,
  idle: 120_000,
  unavailable: 120_000,
}

function isNowPlayingStatus(value: unknown): value is NowPlayingStatus {
  return value === 'playing' || value === 'idle' || value === 'unavailable'
}

function toNowPlayingPayload(input: unknown): NowPlayingPayload {
  if (!input || typeof input !== 'object') {
    return FALLBACK_PAYLOAD
  }

  const data = input as Partial<NowPlayingPayload>
  if (!isNowPlayingStatus(data.status)) {
    return FALLBACK_PAYLOAD
  }

  const track =
    data.track && typeof data.track === 'object'
      ? (data.track as NowPlayingTrack)
      : null

  return {
    status: data.status,
    track,
    fetchedAt:
      typeof data.fetchedAt === 'string' && data.fetchedAt.length > 0
        ? data.fetchedAt
        : new Date().toISOString(),
  }
}

function formatIdleCaption(playedAt?: string) {
  if (!playedAt) {
    return 'Not playing now'
  }

  const played = Date.parse(playedAt)
  if (Number.isNaN(played)) {
    return 'Not playing now'
  }

  const minutesAgo = Math.round((Date.now() - played) / 60_000)
  if (minutesAgo < 1) {
    return 'Not playing now'
  }

  if (minutesAgo < 60) {
    return `Not playing now - ${minutesAgo}m ago`
  }

  const hoursAgo = Math.round(minutesAgo / 60)
  return `Not playing now - ${hoursAgo}h ago`
}

const GENRE_VARIANT_CLASSES: Record<GenreVariant, string> = {
  default: 'now-playing-widget--default',
  synthwave: 'now-playing-widget--synthwave',
  darksynth: 'now-playing-widget--darksynth',
  metalcore: 'now-playing-widget--metalcore',
  progmetal: 'now-playing-widget--progmetal',
  electronic: 'now-playing-widget--electronic',
  heavy: 'now-playing-widget--heavy',
  hiphop: 'now-playing-widget--hiphop',
  jazz: 'now-playing-widget--jazz',
  ambient: 'now-playing-widget--ambient',
}

const GENRE_VARIANT_RULES: Array<{
  variant: GenreVariant
  tokens: string[]
}> = [
  {
    variant: 'darksynth',
    tokens: ['darksynth', 'dark electro', 'aggrotech', 'cyberpunk'],
  },
  {
    variant: 'synthwave',
    tokens: ['synthwave', 'retrowave', 'outrun', 'new retro wave'],
  },
  {
    variant: 'metalcore',
    tokens: ['metalcore', 'post-hardcore', 'deathcore'],
  },
  {
    variant: 'progmetal',
    tokens: ['progressive metal', 'prog metal', 'djent', 'mathcore', 'progressive rock'],
  },
  {
    variant: 'electronic',
    tokens: [
      'electronic',
      'techno',
      'house',
      'trance',
      'drum and bass',
      'dnb',
      'idm',
      'breakbeat',
      'electro',
      'edm',
    ],
  },
  {
    variant: 'heavy',
    tokens: ['metal', 'hardcore', 'punk', 'rock', 'grunge', 'hard rock'],
  },
  {
    variant: 'hiphop',
    tokens: ['hip hop', 'hip-hop', 'rap', 'trap', 'grime'],
  },
  {
    variant: 'jazz',
    tokens: ['jazz', 'blues', 'soul', 'funk'],
  },
  {
    variant: 'ambient',
    tokens: ['ambient', 'classical', 'orchestral', 'piano'],
  },
]

function collectTrackGenres(track: NowPlayingTrack | null) {
  const genres: string[] = []
  const seen = new Set<string>()

  const add = (value?: string) => {
    const normalized = value?.trim().toLowerCase()
    if (!normalized || seen.has(normalized)) {
      return
    }

    seen.add(normalized)
    genres.push(normalized)
  }

  add(track?.primaryGenre)
  for (const genre of track?.genres ?? []) {
    add(genre)
  }

  return genres
}

function getGenreVariantClass(track: NowPlayingTrack | null) {
  const genres = collectTrackGenres(track)

  for (const rule of GENRE_VARIANT_RULES) {
    if (genres.some((genre) => rule.tokens.some((token) => genre.includes(token)))) {
      return GENRE_VARIANT_CLASSES[rule.variant]
    }
  }

  return GENRE_VARIANT_CLASSES.default
}

export function NowPlayingWidget() {
  const { trackEvent } = useAnalytics()
  const spotifySnapshot = useQuery(api.spotifyNowPlaying.getPublic)
  const refreshNowPlaying = useAction(api.spotifyNowPlaying.refresh)
  const [isVisible, setIsVisible] = useState(
    typeof document === 'undefined' ? true : document.visibilityState === 'visible',
  )
  const payload = useMemo(
    () => toNowPlayingPayload(spotifySnapshot),
    [spotifySnapshot],
  )
  const isLoading = typeof spotifySnapshot === 'undefined'

  const fetchNowPlaying = useCallback(async () => {
    try {
      await refreshNowPlaying({})
    } catch {
      // The query state remains the source of truth.
    }
  }, [refreshNowPlaying])

  useEffect(() => {
    const onVisibilityChange = () => {
      setIsVisible(document.visibilityState === 'visible')
    }

    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => document.removeEventListener('visibilitychange', onVisibilityChange)
  }, [])

  useEffect(() => {
    if (!isVisible) {
      return
    }

    void fetchNowPlaying()
  }, [fetchNowPlaying, isVisible])

  useEffect(() => {
    if (!isVisible) {
      return
    }

    const interval = window.setInterval(() => {
      void fetchNowPlaying()
    }, POLL_MS[payload.status])

    return () => window.clearInterval(interval)
  }, [fetchNowPlaying, isVisible, payload.status])

  const statusLabel = useMemo(() => {
    if (payload.status === 'playing') {
      return 'Playing now'
    }
    if (payload.status === 'idle') {
      return 'Idle'
    }
    return 'Offline'
  }, [payload.status])

  const progress = useMemo(() => {
    if (
      payload.status !== 'playing' ||
      !payload.track?.durationMs ||
      !payload.track.progressMs
    ) {
      return 0
    }

    return Math.min(
      100,
      Math.max(0, (payload.track.progressMs / payload.track.durationMs) * 100),
    )
  }, [payload.status, payload.track?.durationMs, payload.track?.progressMs])

  const subtitle = useMemo(() => {
    if (payload.status === 'playing') {
      return payload.track?.artists || payload.track?.album || 'Spotify'
    }

    if (payload.status === 'idle') {
      return formatIdleCaption(payload.track?.playedAt)
    }

    if (isLoading) {
      return 'Loading Spotify status...'
    }

    return 'Music status unavailable'
  }, [isLoading, payload.status, payload.track?.album, payload.track?.artists, payload.track?.playedAt])

  const trackTitle =
    payload.track?.title ??
    (payload.status === 'unavailable' ? 'Spotify unavailable' : 'No track data')

  const hasTrackLink = Boolean(payload.track?.trackUrl)
  const genreVariantClass = getGenreVariantClass(payload.track)

  const cardContent = (
    <>
      <div className="relative flex items-center gap-3 w-full">
        <div className="now-playing-widget__cover" aria-hidden={!payload.track?.albumImageUrl}>
          {payload.track?.albumImageUrl ? (
            <img
              src={payload.track.albumImageUrl}
              alt={`Album cover for ${trackTitle}`}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <span className="grid h-full w-full place-items-center bg-muted text-muted-foreground">
              <Music2 className="h-4 w-4" />
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1 flex flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-2">
          <p className="truncate text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground sm:shrink-0">
            {statusLabel}
          </p>
          <p className="min-w-0 flex-1 truncate text-sm font-semibold text-foreground">
            {trackTitle}
          </p>
          <p className="truncate text-[12px] text-muted-foreground sm:shrink-0">
            {subtitle}
          </p>
        </div>

        <div className="flex items-end gap-1 text-muted-foreground">
          {payload.status === 'playing' ? (
            <>
              <span className="now-playing-widget__bar" />
              <span className="now-playing-widget__bar now-playing-widget__bar--2" />
              <span className="now-playing-widget__bar now-playing-widget__bar--3" />
            </>
          ) : (
            <Music2 className="h-4 w-4" />
          )}
          {hasTrackLink ? <ExternalLink className="h-3.5 w-3.5" /> : null}
        </div>
      </div>

      <div className="now-playing-widget__progress" aria-hidden>
        <span style={{ width: `${progress}%` }} />
      </div>
    </>
  )

  if (!hasTrackLink) {
    return (
      <div
        className={`now-playing-widget ${genreVariantClass} w-full rounded-xl border px-3 py-2.5`}
        aria-live="polite"
        data-genre={payload.track?.primaryGenre ?? ''}
      >
        {cardContent}
      </div>
    )
  }

  return (
    <a
      href={payload.track?.trackUrl}
      target="_blank"
      rel="noreferrer"
      className={`now-playing-widget ${genreVariantClass} w-full rounded-xl border px-3 py-2.5 transition-colors hover:bg-secondary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30`}
      onClick={() =>
        void trackEvent('cta_click', {
          meta: {
            cta: 'now_playing_widget',
            status: payload.status,
          },
        })
      }
      aria-label="Open current Spotify track"
      aria-live="polite"
      data-genre={payload.track?.primaryGenre ?? ''}
    >
      {cardContent}
    </a>
  )
}
