export type ProjectImageFit = 'cover' | 'contain'

const SIMPLE_ALIAS_PATTERN = /^\/[a-zA-Z0-9_-]+$/
const PEXELS_PAGE_PATTERN = /^https?:\/\/(?:www\.)?pexels\.com\//i

function normalizeKnownImagePageUrl(value: string) {
  if (!PEXELS_PAGE_PATTERN.test(value)) {
    return undefined
  }

  const idMatch = value.match(/(?:-|\/)(\d{5,})(?:\/)?(?:\?.*)?$/)
  if (!idMatch?.[1]) {
    return undefined
  }

  const photoId = idMatch[1]
  return `https://images.pexels.com/photos/${photoId}/pexels-photo-${photoId}.jpeg?auto=compress&cs=tinysrgb&w=1600`
}

export function normalizeImageReferenceForRender(value: string | undefined) {
  if (!value) {
    return ''
  }

  const trimmed = value.trim()
  if (!trimmed) {
    return ''
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return normalizeKnownImagePageUrl(trimmed) ?? trimmed
  }

  if (trimmed.startsWith('/pictures/')) {
    return trimmed
  }

  if (trimmed.startsWith('pictures/')) {
    return `/${trimmed}`
  }

  if (SIMPLE_ALIAS_PATTERN.test(trimmed)) {
    return `/pictures/${trimmed.slice(1)}.jpeg`
  }

  return trimmed
}

export function normalizeProjectImageFit(
  value: string | undefined,
  fallback: ProjectImageFit = 'cover',
) {
  return value === 'contain' ? 'contain' : fallback
}
