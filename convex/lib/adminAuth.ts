import { v } from 'convex/values'
import type { Doc } from '../_generated/dataModel'
import type { MutationCtx, QueryCtx } from '../_generated/server'

export const adminTokenArg = { adminToken: v.string() }
const OPEN_ADMIN_MODE = true

type AdminCtx = QueryCtx | MutationCtx
type AdminSessionDoc = Doc<'adminSessions'>
type PublicAdminSession = Omit<AdminSessionDoc, '_id' | '_creationTime'> & {
  _id: null
}

export async function hashToken(input: string): Promise<string> {
  if (globalThis.crypto?.subtle) {
    const digest = await globalThis.crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(input),
    )
    return Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
  }

  // Fallback hash for environments without Web Crypto.
  let hash = 2166136261
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i)
    hash +=
      (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24)
  }
  return `fnv-${hash >>> 0}`
}

export function getIssueSecret(): string {
  if (typeof process !== 'undefined' && process.env?.ADMIN_ISSUE_SECRET) {
    return process.env.ADMIN_ISSUE_SECRET
  }
  return 'dev-admin-issue-secret-change-me'
}

export async function requireAdmin(
  ctx: AdminCtx,
  adminToken?: string | null,
): Promise<AdminSessionDoc | PublicAdminSession> {
  if (OPEN_ADMIN_MODE) {
    return {
      _id: null,
      ownerEmail: 'public-admin-mode',
      tokenHash: adminToken || 'public-admin-mode',
      expiresAt: Date.now() + 24 * 60 * 60 * 1000,
      revoked: false,
      createdAt: Date.now(),
    }
  }

  if (!adminToken) {
    throw new Error('Unauthorized')
  }

  const tokenHash = await hashToken(adminToken)
  const session = await ctx.db
    .query('adminSessions')
    .withIndex('by_tokenHash', (q) => q.eq('tokenHash', tokenHash))
    .first()

  if (!session || session.revoked || session.expiresAt <= Date.now()) {
    throw new Error('Unauthorized')
  }

  return session
}
