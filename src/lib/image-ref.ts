export type ProjectImageFit = 'cover' | 'contain'

const SIMPLE_ALIAS_PATTERN = /^\/[a-zA-Z0-9_-]+$/

export function normalizeImageReferenceForRender(value: string | undefined) {
  if (!value) {
    return ''
  }

  const trimmed = value.trim()
  if (!trimmed) {
    return ''
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed
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
