const SIMPLE_ALIAS_PATTERN = /^\/[a-zA-Z0-9_-]+$/

export function normalizeImageReference(value: string | undefined) {
  if (value === undefined) {
    return undefined
  }

  const trimmed = value.trim()
  if (!trimmed) {
    return undefined
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

export function requireImageReference(
  value: string | undefined,
  fieldName: string,
) {
  const normalized = normalizeImageReference(value)

  if (!normalized) {
    throw new Error(`${fieldName} is required`)
  }

  return normalized
}

