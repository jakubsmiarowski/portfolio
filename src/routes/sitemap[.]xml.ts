import { createFileRoute } from '@tanstack/react-router'

import { api } from '../../convex/_generated/api'
import {
  createPublicConvexClient,
  fetchPublishedProjects,
} from '@/lib/public-content'
import { absoluteUrl } from '@/lib/seo'

function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

export const Route = createFileRoute('/sitemap.xml')({
  server: {
    handlers: {
      GET: async () => {
        const client = createPublicConvexClient()
        const [projects, siteSettings] = await Promise.all([
          fetchPublishedProjects(client),
          client.query(api.siteSettings.getPublic, {}),
        ])

        const homepageUpdatedAt = Math.max(
          siteSettings.updatedAt,
          ...projects.map((project) => project.updatedAt),
        )

        const urls = [
          {
            loc: absoluteUrl('/'),
            lastmod: new Date(homepageUpdatedAt).toISOString(),
          },
          ...projects.map((project) => ({
            loc: absoluteUrl(`/projects/${project.slug}`),
            lastmod: new Date(project.updatedAt).toISOString(),
          })),
        ]

        const body = [
          '<?xml version="1.0" encoding="UTF-8"?>',
          '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
          ...urls.map(
            (url) =>
              `<url><loc>${escapeXml(url.loc)}</loc><lastmod>${url.lastmod}</lastmod></url>`,
          ),
          '</urlset>',
        ].join('')

        return new Response(body, {
          status: 200,
          headers: {
            'content-type': 'application/xml; charset=utf-8',
            'cache-control': 'public, max-age=3600',
          },
        })
      },
    },
  },
})
