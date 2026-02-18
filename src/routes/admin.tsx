import { useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'

import { AdminAnalyticsTab } from '@/components/admin/admin-analytics-tab'
import { AdminMessagesTab } from '@/components/admin/admin-messages-tab'
import { AdminProjectsTab } from '@/components/admin/admin-projects-tab'
import { AdminTabNavigation } from '@/components/admin/admin-tab-navigation'
import type { AdminTab } from '@/components/admin/admin-shared'
import { AdminTestimonialsTab } from '@/components/admin/admin-testimonials-tab'
import { AdminWallTab } from '@/components/admin/admin-wall-tab'
import { AdminWidgetsTab } from '@/components/admin/admin-widgets-tab'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

export const Route = createFileRoute('/admin')({ component: AdminPage })

function AdminPage() {
  const adminToken = 'public-admin-mode'

  const [activeTab, setActiveTab] = useState<AdminTab>('projects')
  const [globalMessage, setGlobalMessage] = useState<string | null>(null)

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <Link to="/">
              <h1 className="text-3xl font-semibold tracking-tight">Portfolio Admin</h1>
            </Link>
            <p className="text-sm text-muted-foreground">
              Open mode enabled. Authentication will be added later.
            </p>
          </div>

          <Badge variant="secondary" className="rounded-full px-3 py-1">
            Public admin mode
          </Badge>
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
