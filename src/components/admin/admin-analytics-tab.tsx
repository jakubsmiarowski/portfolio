import { useQuery } from 'convex/react'

import { api } from '../../../convex/_generated/api'
import { Badge } from '@/components/ui/badge'

type AdminAnalyticsTabProps = {
  adminToken: string
}

export function AdminAnalyticsTab({ adminToken }: AdminAnalyticsTabProps) {
  const analyticsOverview = useQuery(api.analytics.adminOverview, { adminToken })
  const analyticsSeries = useQuery(api.analytics.adminTimeseries, {
    adminToken,
    days: 30,
  })
  const topProjects = useQuery(api.analytics.adminTopProjects, {
    adminToken,
    days: 30,
  })

  const last30 = analyticsOverview?.last30Days
  const chartMax =
    Math.max(...(analyticsSeries ?? []).map((point) => point.pageViews || 0), 1) ||
    1

  return (
    <section className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Page views (30d)
          </p>
          <p className="mt-2 text-3xl font-semibold">{last30?.pageViews ?? 0}</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Unique sessions (30d)
          </p>
          <p className="mt-2 text-3xl font-semibold">{last30?.uniqueSessions ?? 0}</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Project interactions (30d)
          </p>
          <p className="mt-2 text-3xl font-semibold">
            {last30?.projectInteractions ?? 0}
          </p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            CV downloads (30d)
          </p>
          <p className="mt-2 text-3xl font-semibold">{last30?.cvDownloads ?? 0}</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Contact conversion (30d)
          </p>
          <p className="mt-2 text-3xl font-semibold">
            {((last30?.contactConversionRate ?? 0) * 100).toFixed(1)}%
          </p>
        </div>
      </div>

      <div className="rounded-2xl border bg-card p-5 sm:p-6">
        <h3 className="text-lg font-semibold tracking-tight">
          Daily traffic (last 30 days)
        </h3>
        <div className="mt-4 space-y-2">
          {(analyticsSeries ?? []).map((point) => (
            <div
              key={point.day}
              className="grid grid-cols-[90px_1fr_auto] items-center gap-3 text-sm"
            >
              <span className="text-muted-foreground">{point.day.slice(5)}</span>
              <div className="h-2 rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-neutral-900"
                  style={{ width: `${Math.max((point.pageViews / chartMax) * 100, 3)}%` }}
                />
              </div>
              <span className="font-medium">{point.pageViews}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border bg-card p-5 sm:p-6">
        <h3 className="text-lg font-semibold tracking-tight">
          Top projects by interaction
        </h3>
        <div className="mt-4 space-y-2">
          {(topProjects ?? []).map((item) => (
            <div
              key={item.projectSlug}
              className="flex items-center justify-between rounded-lg border px-3 py-2"
            >
              <div>
                <p className="font-medium">{item.projectSlug}</p>
                <p className="text-xs text-muted-foreground">
                  opens: {item.opens} · link clicks: {item.linkClicks}
                </p>
              </div>
              <Badge variant="secondary">{item.totalInteractions}</Badge>
            </div>
          ))}
          {!topProjects?.length ? (
            <p className="text-sm text-muted-foreground">
              No project interactions yet.
            </p>
          ) : null}
        </div>
      </div>
    </section>
  )
}
