import { useEffect, useMemo, useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Loader2, LogOut } from 'lucide-react'

import { AdminAnalyticsTab } from '@/components/admin/admin-analytics-tab'
import { AdminMessagesTab } from '@/components/admin/admin-messages-tab'
import { AdminProjectsTab } from '@/components/admin/admin-projects-tab'
import { AdminTabNavigation } from '@/components/admin/admin-tab-navigation'
import type { AdminTab } from '@/components/admin/admin-shared'
import { AdminTestimonialsTab } from '@/components/admin/admin-testimonials-tab'
import { AdminWallTab } from '@/components/admin/admin-wall-tab'
import { AdminWidgetsTab } from '@/components/admin/admin-widgets-tab'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { issueAdminToken, revokeAdminToken } from '@/lib/admin-session'
import { authClient } from '@/lib/auth-client'

export const Route = createFileRoute('/admin')({ component: AdminPage })

function getAccessErrorMessage(
  reason: 'unauthenticated' | 'forbidden' | 'misconfigured',
  email?: string,
) {
  if (reason === 'forbidden') {
    return `Konto ${email ?? ''} nie ma uprawnień do panelu admin.`
  }

  if (reason === 'misconfigured') {
    return 'Admin jest źle skonfigurowany. Sprawdź zmienne środowiskowe.'
  }

  return 'Sesja wygasła. Zaloguj się ponownie.'
}

function AdminPage() {
  const { data: sessionData, isPending: isSessionPending } = authClient.useSession()
  const sessionEmail = useMemo(() => {
    const email = sessionData?.user?.email
    if (typeof email !== 'string') {
      return null
    }
    const normalized = email.trim().toLowerCase()
    return normalized || null
  }, [sessionData?.user?.email])

  const [adminToken, setAdminToken] = useState<string | null>(null)
  const [isIssuingToken, setIsIssuingToken] = useState(false)
  const [authMessage, setAuthMessage] = useState<string | null>(null)
  const [isAuthActionPending, setIsAuthActionPending] = useState(false)

  const [activeTab, setActiveTab] = useState<AdminTab>('projects')
  const [globalMessage, setGlobalMessage] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    if (!sessionEmail) {
      setAdminToken(null)
      setIsIssuingToken(false)
      setAuthMessage(null)
      return undefined
    }

    const issueToken = async () => {
      setIsIssuingToken(true)
      setAuthMessage(null)

      try {
        const result = await issueAdminToken()
        if (cancelled) return

        if (result.ok) {
          setAdminToken(result.token)
          return
        }

        setAdminToken(null)
        setAuthMessage(getAccessErrorMessage(result.reason, result.email))
      } catch {
        if (!cancelled) {
          setAdminToken(null)
          setAuthMessage('Nie udało się wystawić sesji admina.')
        }
      } finally {
        if (!cancelled) {
          setIsIssuingToken(false)
        }
      }
    }

    void issueToken()
    return () => {
      cancelled = true
    }
  }, [sessionEmail])

  const handleGoogleSignIn = async () => {
    setIsAuthActionPending(true)
    setAuthMessage(null)

    try {
      const result = await authClient.signIn.social({
        provider: 'google',
        callbackURL: '/admin',
      })

      if (result.error) {
        setAuthMessage(result.error.message || 'Logowanie Google nie powiodło się.')
      }
    } catch {
      setAuthMessage('Logowanie Google nie powiodło się.')
    } finally {
      setIsAuthActionPending(false)
    }
  }

  const handleSignOut = async () => {
    setIsAuthActionPending(true)
    setGlobalMessage(null)
    setAdminToken(null)

    try {
      await revokeAdminToken()
    } catch {
      // Ignore revocation errors and continue logout.
    }

    try {
      const result = await authClient.signOut()
      if (result.error) {
        setAuthMessage(result.error.message || 'Wylogowanie nie powiodło się.')
      } else {
        setAuthMessage(null)
      }
    } catch {
      setAuthMessage('Wylogowanie nie powiodło się.')
    } finally {
      setIsAuthActionPending(false)
    }
  }

  if (isSessionPending || (sessionEmail && isIssuingToken)) {
    return (
      <main className="grid min-h-screen place-items-center bg-background px-5">
        <section className="w-full max-w-md rounded-2xl border bg-card p-6 text-center">
          <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
          <h1 className="mt-3 text-lg font-semibold tracking-tight">
            Sprawdzam sesję admina
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            To potrwa tylko chwilę.
          </p>
        </section>
      </main>
    )
  }

  if (!sessionEmail) {
    return (
      <main className="grid min-h-screen place-items-center bg-background px-5">
        <section className="w-full max-w-md rounded-2xl border bg-card p-6 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Panel admin</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Zaloguj się przez Google, aby uzyskać dostęp.
          </p>
          <Button
            className="mt-6 w-full"
            onClick={() => {
              void handleGoogleSignIn()
            }}
            disabled={isAuthActionPending}
          >
            Zaloguj przez Google
          </Button>
          {authMessage ? (
            <p className="mt-3 text-sm text-destructive">{authMessage}</p>
          ) : null}
        </section>
      </main>
    )
  }

  if (!adminToken) {
    return (
      <main className="grid min-h-screen place-items-center bg-background px-5">
        <section className="w-full max-w-md rounded-2xl border bg-card p-6 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Brak dostępu</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {authMessage || 'To konto nie ma dostępu do panelu admin.'}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">{sessionEmail}</p>
          <Button
            variant="outline"
            className="mt-6 w-full"
            onClick={() => {
              void handleSignOut()
            }}
            disabled={isAuthActionPending}
          >
            Wyloguj
          </Button>
        </section>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <Link to="/">
              <h1 className="text-3xl font-semibold tracking-tight">Portfolio Admin</h1>
            </Link>
            <p className="text-sm text-muted-foreground">
              Zalogowano jako: {sessionEmail}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="rounded-full px-3 py-1">
              Protected mode
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                void handleSignOut()
              }}
              disabled={isAuthActionPending}
            >
              <LogOut className="h-4 w-4" />
              Wyloguj
            </Button>
          </div>
        </div>

        <Separator className="my-6" />

        {globalMessage ? (
          <div className="mb-4 rounded-xl border bg-card px-4 py-3 text-sm text-muted-foreground">
            {globalMessage}
          </div>
        ) : null}

        <AdminTabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

        {activeTab === 'projects' ? (
          <AdminProjectsTab
            adminToken={adminToken}
            onGlobalMessage={setGlobalMessage}
          />
        ) : null}

        {activeTab === 'testimonials' ? (
          <AdminTestimonialsTab
            adminToken={adminToken}
            onGlobalMessage={setGlobalMessage}
          />
        ) : null}

        {activeTab === 'messages' ? (
          <AdminMessagesTab adminToken={adminToken} />
        ) : null}

        {activeTab === 'analytics' ? (
          <AdminAnalyticsTab adminToken={adminToken} />
        ) : null}

        {activeTab === 'wall' ? (
          <AdminWallTab adminToken={adminToken} onGlobalMessage={setGlobalMessage} />
        ) : null}

        {activeTab === 'widgets' ? (
          <AdminWidgetsTab
            adminToken={adminToken}
            onGlobalMessage={setGlobalMessage}
          />
        ) : null}
      </div>
    </main>
  )
}
