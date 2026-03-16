import type { MetaDescriptor } from '@tanstack/react-router'
import { normalizeImageReferenceForRender } from '@/lib/image-ref'
import type { Doc } from '../../convex/_generated/dataModel'

const SITE_ORIGIN = 'https://www.kubasmiarowski.com'
const SITE_NAME = 'Kuba Śmiarowski'
const SITE_NAME_ASCII = 'Kuba Smiarowski'
const SITE_TITLE_SUFFIX = 'Kuba Śmiarowski'
const DEFAULT_SOCIAL_IMAGE = `${SITE_ORIGIN}/kuba.jpeg`
const DEFAULT_ROBOTS =
  'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'

const SAME_AS_LINKS = [
  'https://github.com/jakubsmiarowski',
  'https://www.linkedin.com/in/jakub-%C5%9Bmiarowski-779371104/',
]

type Project = Doc<'projects'>

type SeoConfig = {
  title: string
  description: string
  pathname: string
  image?: string
  robots?: string
  type?: 'website' | 'article'
}

function trimSlashes(value: string) {
  return value.replace(/^\/+|\/+$/g, '')
}

export function getSiteOrigin() {
  return SITE_ORIGIN
}

export function getSitePersonName() {
  return SITE_NAME
}

export function absoluteUrl(pathname: string) {
  if (!pathname) {
    return SITE_ORIGIN
  }

  if (/^https?:\/\//i.test(pathname)) {
    return pathname
  }

  if (pathname === '/') {
    return `${SITE_ORIGIN}/`
  }

  return `${SITE_ORIGIN}/${trimSlashes(pathname)}`
}

export function resolveSeoImage(image?: string) {
  const normalized = normalizeImageReferenceForRender(image)
  if (!normalized) {
    return DEFAULT_SOCIAL_IMAGE
  }

  return absoluteUrl(normalized)
}

export function buildSeoMeta({
  title,
  description,
  pathname,
  image,
  robots = DEFAULT_ROBOTS,
  type = 'website',
}: SeoConfig): MetaDescriptor[] {
  const canonicalUrl = absoluteUrl(pathname)
  const socialImage = resolveSeoImage(image)

  return [
    { title },
    { name: 'description', content: description },
    { name: 'author', content: SITE_NAME },
    { name: 'robots', content: robots },
    { name: 'googlebot', content: robots },
    { property: 'og:locale', content: 'en_US' },
    { property: 'og:type', content: type },
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'og:url', content: canonicalUrl },
    { property: 'og:site_name', content: SITE_NAME },
    { property: 'og:image', content: socialImage },
    { property: 'og:image:alt', content: title },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: title },
    { name: 'twitter:description', content: description },
    { name: 'twitter:image', content: socialImage },
  ]
}

export function buildCanonicalLinks(pathname: string) {
  return [{ rel: 'canonical', href: absoluteUrl(pathname) }]
}

export function buildNoIndexMeta(title: string, description: string) {
  return buildSeoMeta({
    title,
    description,
    pathname: '/admin',
    robots: 'noindex, nofollow',
  })
}

export function createPersonJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: SITE_NAME,
    alternateName: [
      SITE_NAME_ASCII,
      'Jakub Śmiarowski',
      'Jakub Smiarowski',
    ],
    url: absoluteUrl('/'),
    image: DEFAULT_SOCIAL_IMAGE,
    sameAs: SAME_AS_LINKS,
    jobTitle: 'Frontend Engineer',
    email: 'smiarowski.jakub@gmail.com',
  }
}

export function createProfilePageJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    url: absoluteUrl('/'),
    name: `${SITE_NAME} Portfolio`,
    description:
      'Official portfolio of Kuba Śmiarowski, frontend engineer building clean, high-impact digital products.',
    mainEntity: {
      '@type': 'Person',
      name: SITE_NAME,
      url: absoluteUrl('/'),
    },
  }
}

export function createWebsiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: `${SITE_NAME} Portfolio`,
    alternateName: `${SITE_NAME_ASCII} Portfolio`,
    url: absoluteUrl('/'),
    inLanguage: 'en',
  }
}

export function createProjectJsonLd(project: Project) {
  const socialImage = resolveSeoImage(project.coverImageUrl)

  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: project.title,
    headline: project.headline,
    description: project.summary,
    url: absoluteUrl(`/projects/${project.slug}`),
    image: socialImage,
    keywords: project.tags,
    dateModified: new Date(project.updatedAt).toISOString(),
    author: {
      '@type': 'Person',
      name: SITE_NAME,
      url: absoluteUrl('/'),
    },
  }
}

export function getHomepageSeo() {
  return {
    title: 'Kuba Śmiarowski (Kuba Smiarowski) · Frontend Engineer Portfolio',
    description:
      'Official portfolio of Kuba Śmiarowski, frontend engineer building clean, high-impact digital products, case studies, and contact details.',
  }
}

export function getProjectSeo(project: Project) {
  return {
    title: `${project.title} · ${SITE_TITLE_SUFFIX}`,
    description: project.summary,
  }
}

export function withRobotsHeader(
  response: Response,
  value = 'noindex, nofollow',
) {
  const headers = new Headers(response.headers)
  headers.set('X-Robots-Tag', value)

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  })
}
