import { useMemo } from 'react'
import { useMutation, useQuery } from 'convex/react'

import { api } from '../../../convex/_generated/api'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { messageStatuses } from './admin-shared'

type AdminMessagesTabProps = {
  adminToken: string
}

export function AdminMessagesTab({ adminToken }: AdminMessagesTabProps) {
  const messages = useQuery(api.messages.adminList, { adminToken })
  const updateMessageStatus = useMutation(api.messages.updateStatus)

  const messageRows = useMemo(() => messages ?? [], [messages])

  return (
    <section className="rounded-2xl border bg-card p-5 sm:p-6">
      <h2 className="text-xl font-semibold tracking-tight">Inbox</h2>
      <div className="mt-4 space-y-3">
        {messageRows.map((message) => (
          <article key={message._id} className="space-y-3 rounded-xl border p-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="font-medium">{message.senderName}</p>
                <p className="text-xs text-muted-foreground">{message.senderEmail}</p>
              </div>
              <Badge variant="secondary">{message.status}</Badge>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {message.content}
            </p>
            <div className="flex flex-wrap gap-2">
              {messageStatuses.map((status) => (
                <Button
                  key={`${message._id}-${status}`}
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    updateMessageStatus({
                      adminToken,
                      id: message._id,
                      status,
                    })
                  }
                >
                  Mark {status}
                </Button>
              ))}
            </div>
          </article>
        ))}

        {!messageRows.length ? (
          <p className="text-sm text-muted-foreground">No messages yet.</p>
        ) : null}
      </div>
    </section>
  )
}
