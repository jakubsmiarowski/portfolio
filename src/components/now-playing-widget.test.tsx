// @vitest-environment jsdom

import { act } from 'react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { NowPlayingWidget } from '@/components/now-playing-widget'

const { trackEventMock, useQueryMock, useActionMock, refreshNowPlayingMock } = vi.hoisted(() => ({
  trackEventMock: vi.fn(),
  useQueryMock: vi.fn(),
  useActionMock: vi.fn(),
  refreshNowPlayingMock: vi.fn(),
}))

vi.mock('convex/react', () => ({
  useQuery: useQueryMock,
  useAction: useActionMock,
}))

vi.mock('@/lib/analytics', () => ({
  useAnalytics: () => ({
    trackEvent: trackEventMock,
  }),
}))

describe('NowPlayingWidget', () => {
  let queryValue: unknown

  beforeEach(() => {
    trackEventMock.mockReset()
    trackEventMock.mockResolvedValue(undefined)
    refreshNowPlayingMock.mockReset()
    refreshNowPlayingMock.mockResolvedValue(undefined)
    queryValue = undefined
    useQueryMock.mockImplementation(() => queryValue)
    useActionMock.mockImplementation(() => refreshNowPlayingMock)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders a playing track and sends analytics on click', async () => {
    queryValue = {
      status: 'playing',
      fetchedAt: '2026-02-13T12:00:00.000Z',
      track: {
        title: 'A Real Hero',
        artists: 'College, Electric Youth',
        album: 'Drive OST',
        albumImageUrl: 'https://cdn.example/drive.jpg',
        trackUrl: 'https://open.spotify.com/track/hero',
        durationMs: 267_000,
        progressMs: 12_000,
      },
    }

    render(<NowPlayingWidget />)

    await screen.findByText('A Real Hero')
    const link = screen.getByRole('link', { name: /open current spotify track/i })

    expect(link.getAttribute('href')).toBe('https://open.spotify.com/track/hero')

    fireEvent.click(link)

    expect(trackEventMock).toHaveBeenCalledWith('cta_click', {
      meta: {
        cta: 'now_playing_widget',
        status: 'playing',
      },
    })
  })

  it('renders idle state with last played track', async () => {
    queryValue = {
      status: 'idle',
      fetchedAt: '2026-02-13T12:00:00.000Z',
      track: {
        title: 'Midnight City',
        artists: 'M83',
        album: "Hurry Up, We're Dreaming",
        albumImageUrl: 'https://cdn.example/m83.jpg',
        trackUrl: 'https://open.spotify.com/track/midnight-city',
      },
    }

    render(<NowPlayingWidget />)

    await screen.findByText('Midnight City')
    expect(screen.getByText('Idle')).toBeTruthy()
    expect(screen.getByText(/Not playing now/i)).toBeTruthy()
  })

  it('renders unavailable state without link', async () => {
    queryValue = {
      status: 'unavailable',
      fetchedAt: '2026-02-13T12:00:00.000Z',
      track: null,
    }

    render(<NowPlayingWidget />)

    await screen.findByText('Spotify unavailable')
    expect(screen.getByText('Music status unavailable')).toBeTruthy()
    expect(screen.queryByRole('link', { name: /open current spotify track/i })).toBeNull()
  })

  it('applies a dedicated visual variant for darksynth', async () => {
    queryValue = {
      status: 'playing',
      fetchedAt: '2026-02-13T12:00:00.000Z',
      track: {
        title: 'Turbo Killer',
        artists: 'Carpenter Brut',
        album: 'Trilogy',
        albumImageUrl: 'https://cdn.example/turbo.jpg',
        trackUrl: 'https://open.spotify.com/track/turbo-killer',
        primaryGenre: 'darksynth',
        genres: ['darksynth', 'synthwave'],
        durationMs: 220_000,
        progressMs: 2_000,
      },
    }

    render(<NowPlayingWidget />)

    await screen.findByText('Turbo Killer')
    const link = screen.getByRole('link', { name: /open current spotify track/i })

    expect(link.className).toContain('now-playing-widget--darksynth')
  })

  it('switches polling interval from playing to idle', async () => {
    vi.useFakeTimers()

    queryValue = {
      status: 'playing',
      fetchedAt: '2026-02-13T12:00:00.000Z',
      track: {
        title: 'Turbo Killer',
        artists: 'Carpenter Brut',
        album: 'Trilogy',
        albumImageUrl: 'https://cdn.example/turbo.jpg',
        trackUrl: 'https://open.spotify.com/track/turbo-killer',
        durationMs: 220_000,
        progressMs: 2_000,
      },
    }

    const view = render(<NowPlayingWidget />)

    await waitFor(() => {
      expect(refreshNowPlayingMock).toHaveBeenCalledTimes(1)
    })

    await act(async () => {
      await vi.advanceTimersByTimeAsync(30_000)
    })

    await waitFor(() => {
      expect(refreshNowPlayingMock).toHaveBeenCalledTimes(2)
    })

    queryValue = {
      status: 'idle',
      fetchedAt: '2026-02-13T12:01:00.000Z',
      track: {
        title: 'Turbo Killer',
        artists: 'Carpenter Brut',
        album: 'Trilogy',
        albumImageUrl: 'https://cdn.example/turbo.jpg',
        trackUrl: 'https://open.spotify.com/track/turbo-killer',
        playedAt: '2026-02-13T12:00:30.000Z',
      },
    }
    view.rerender(<NowPlayingWidget />)

    await screen.findByText('Idle')

    await act(async () => {
      await vi.advanceTimersByTimeAsync(119_999)
    })
    expect(refreshNowPlayingMock).toHaveBeenCalledTimes(2)

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1)
    })
    await waitFor(() => {
      expect(refreshNowPlayingMock).toHaveBeenCalledTimes(3)
    })
  })
})
