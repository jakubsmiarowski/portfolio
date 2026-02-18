import { useMemo } from 'react'
import { useMutation, useQuery } from 'convex/react'

import { api } from '../../../convex/_generated/api'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Doc } from 'convex/_generated/dataModel'

type AdminWallTabProps = {
  adminToken: string
  onGlobalMessage: (message: string) => void
}

type WallEntry = Doc<'wallEntries'>

function formatDateTime(timestamp?: number) {
  if (!timestamp) return 'Unknown date'
  return new Date(timestamp).toLocaleString()
}

type WallColumnProps = {
  title: string
  entries: WallEntry[]
  actions: (entry: WallEntry) => Array<{
    label: string
    variant?: 'default' | 'outline'
    onClick: () => Promise<void>
  }>
  emptyLabel: string
}

function WallColumn({ title, entries, actions, emptyLabel }: WallColumnProps) {
  return (
    <section className="rounded-2xl border bg-card p-5 sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
        <Badge variant="secondary">{entries.length}</Badge>
      </div>
      <div className="space-y-3">
        {entries.map((entry) => (
          <article key={entry._id} className="space-y-2 rounded-xl border p-3">
            <p className="font-medium">{entry.displayName}</p>
            {entry.message ? (
              <p className="text-sm text-muted-foreground">{entry.message}</p>
            ) : (
              <p className="text-sm text-muted-foreground">Signed with name only.</p>
            )}
            <p className="text-xs text-muted-foreground">
              {formatDateTime(entry.createdAt)}
            </p>
            <div className="flex flex-wrap gap-2">
              {actions(entry).map((action) => (
                <Button
                  key={`${entry._id}-${action.label}`}
                  size="sm"
                  variant={action.variant ?? 'default'}
                  onClick={() => {
                    void action.onClick()
                  }}
                >
                  {action.label}
                </Button>
              ))}
            </div>
          </article>
        ))}
        {!entries.length ? (
          <p className="text-sm text-muted-foreground">{emptyLabel}</p>
        ) : null}
      </div>
    </section>
  )
}

export function AdminWallTab({ adminToken, onGlobalMessage }: AdminWallTabProps) {
  const wallEntries = useQuery(api.wall.adminList, { adminToken })

  const updateWallStatus = useMutation(api.wall.adminUpdateStatus)
  const removeWallEntry = useMutation(api.wall.adminRemove)

  const wallRows = useMemo(() => wallEntries ?? [], [wallEntries])
  const pendingWallRows = useMemo(
    () => wallRows.filter((row) => row.status === 'pending'),
    [wallRows],
  )
  const approvedWallRows = useMemo(
    () => wallRows.filter((row) => row.status === 'approved'),
    [wallRows],
  )
  const archivedWallRows = useMemo(
    () => wallRows.filter((row) => row.status === 'archived'),
    [wallRows],
  )

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border bg-card p-5 sm:p-6">
        <h2 className="text-xl font-semibold tracking-tight">Sign the Wall moderation</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Review pending submissions and control what appears on the public
          ticker.
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <WallColumn
          title="Pending"
          entries={pendingWallRows}
          emptyLabel="No pending entries."
          actions={(entry) => [
            {
              label: 'Approve',
              onClick: async () => {
                await updateWallStatus({
                  adminToken,
                  id: entry._id,
                  status: 'approved',
                })
                onGlobalMessage('Wall entry approved.')
              },
            },
            {
              label: 'Archive',
              variant: 'outline',
              onClick: async () => {
                await updateWallStatus({
                  adminToken,
                  id: entry._id,
                  status: 'archived',
                })
                onGlobalMessage('Wall entry archived.')
              },
            },
            {
              label: 'Delete',
              variant: 'outline',
              onClick: async () => {
                await removeWallEntry({ adminToken, id: entry._id })
                onGlobalMessage('Wall entry deleted.')
              },
            },
          ]}
        />

        <WallColumn
          title="Approved"
          entries={approvedWallRows}
          emptyLabel="No approved entries yet."
          actions={(entry) => [
            {
              label: 'Archive',
              variant: 'outline',
              onClick: async () => {
                await updateWallStatus({
                  adminToken,
                  id: entry._id,
                  status: 'archived',
                })
                onGlobalMessage('Wall entry archived.')
              },
            },
            {
              label: 'Delete',
              variant: 'outline',
              onClick: async () => {
                await removeWallEntry({ adminToken, id: entry._id })
                onGlobalMessage('Wall entry deleted.')
              },
            },
          ]}
        />

        <WallColumn
          title="Archived"
          entries={archivedWallRows}
          emptyLabel="No archived entries."
          actions={(entry) => [
            {
              label: 'Re-approve',
              onClick: async () => {
                await updateWallStatus({
                  adminToken,
                  id: entry._id,
                  status: 'approved',
                })
                onGlobalMessage('Wall entry approved.')
              },
            },
            {
              label: 'Delete',
              variant: 'outline',
              onClick: async () => {
                await removeWallEntry({ adminToken, id: entry._id })
                onGlobalMessage('Wall entry deleted.')
              },
            },
          ]}
        />
      </div>
    </section>
  )
}
