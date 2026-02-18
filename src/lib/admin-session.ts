import { ConvexHttpClient } from 'convex/browser'
import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'

import { api } from '../../convex/_generated/api'
import { auth } from './auth'

type IssueResult =
  | {
      ok: true
      token: string
      expiresAt: number
      email: string
    }
  | {
      ok: false
      reason: 'unauthenticated' | 'forbidden' | 'misconfigured'
      email?: string
    }

const FALLBACK_OWNER_EMAIL = 'smiarowski.jakub@gmail.com'

function getOwnerEmails() {
  const raw =
    process.env.OWNER_EMAILS?.trim() ||
    process.env.VITE_OWNER_EMAILS?.trim() ||
    FALLBACK_OWNER_EMAIL

  return new Set(
    raw
      .split(',')
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean),
  )
}

function getConvexUrl() {
  return process.env.VITE_CONVEX_URL || process.env.CONVEX_URL || ''
}

function getIssueSecret() {
  return process.env.ADMIN_ISSUE_SECRET || 'dev-admin-issue-secret-change-me'
}

function createAdminToken() {
  if (globalThis.crypto?.randomUUID) {
    return `${globalThis.crypto.randomUUID()}-${Date.now().toString(36)}`
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`
}

function getSessionEmail(sessionData: unknown): string | null {
  if (!sessionData || typeof sessionData !== 'object') {
    return null
  }

  const user = (sessionData as { user?: unknown }).user
  if (!user || typeof user !== 'object') {
    return null
  }

  const email = (user as { email?: unknown }).email
  if (typeof email !== 'string') {
    return null
  }

  const normalized = email.trim().toLowerCase()
  return normalized || null
}

export const issueAdminToken = createServerFn({ method: 'GET' }).handler(
  async (): Promise<IssueResult> => {
    const convexUrl = getConvexUrl()
    if (!convexUrl) {
      return { ok: false, reason: 'misconfigured' }
    }

    const request = getRequest()
    const sessionData = await auth.api.getSession({ headers: request.headers })
    const email = getSessionEmail(sessionData)
    if (!email) {
      return { ok: false, reason: 'unauthenticated' }
    }

    if (!getOwnerEmails().has(email)) {
      return { ok: false, reason: 'forbidden', email }
    }

    const token = createAdminToken()
    const expiresAt = Date.now() + 8 * 60 * 60 * 1000

    const client = new ConvexHttpClient(convexUrl)
    await client.mutation(api.adminSessions.issue, {
      ownerEmail: email,
      rawToken: token,
      expiresAt,
      issueSecret: getIssueSecret(),
    })

    return {
      ok: true,
      token,
      expiresAt,
      email,
    }
  },
)

export const revokeAdminToken = createServerFn({ method: 'POST' }).handler(
  async ({ data }) => {
    const adminToken = (data as { adminToken?: string } | undefined)?.adminToken
    if (!adminToken) {
      return { ok: false }
    }

    const convexUrl = getConvexUrl()
    if (!convexUrl) {
      return { ok: false }
    }

    const client = new ConvexHttpClient(convexUrl)
    await client.mutation(api.adminSessions.revoke, {
      adminToken,
    })

    return { ok: true }
  },
)
