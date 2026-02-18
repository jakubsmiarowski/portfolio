import type { Doc } from 'convex/_generated/dataModel'

export type AdminTab =
  | 'projects'
  | 'testimonials'
  | 'messages'
  | 'analytics'
  | 'wall'
  | 'widgets'

export type FeatureCardForm = {
  title: string
  emoji: string
  content: string
}

export type ProjectFormState = {
  slug: string
  title: string
  headline: string
  summary: string
  featureCards: FeatureCardForm[]
  coverImageUrl: string
  liveUrl: string
  repoUrl: string
  caseStudyUrl: string
  tags: string
  accentColor: string
  bgTint: string
  status: 'draft' | 'published'
}

export type TestimonialFormState = {
  personName: string
  personRole: string
  company: string
  avatarUrl: string
  quote: string
  isPublished: boolean
}

export type WidgetFormState = {
  availabilityText: string
  availabilityTimezone: string
  focusNote: string
  focusEmoji: string
  careerStartYear: string
  wallEnabled: boolean
  wallTickerDurationSec: string
  wallMaxVisibleEntries: string
}

export type MessageStatus = Doc<'messages'>['status']

export const messageStatuses: MessageStatus[] = ['new', 'read', 'archived']

export const defaultFeatureCardPresets = [
  { title: 'Summary', emoji: '✨' },
  { title: 'Product scope', emoji: '🧩' },
  { title: 'Core flow', emoji: '⚙️' },
  { title: 'Implementation', emoji: '🛠️' },
  { title: 'Challenges', emoji: '🧠' },
  { title: 'Tech stack', emoji: '💻' },
]

export const featureEmojiOptions = [
  { value: '✨', label: 'Highlights' },
  { value: '🧩', label: 'Scope' },
  { value: '⚙️', label: 'Flow' },
  { value: '🛠️', label: 'Build' },
  { value: '🧠', label: 'Challenges' },
  { value: '💻', label: 'Tech' },
  { value: '📈', label: 'Results' },
  { value: '📊', label: 'Metrics' },
  { value: '🚀', label: 'Launch' },
  { value: '🔒', label: 'Security' },
  { value: '🤝', label: 'Collaboration' },
  { value: '🎨', label: 'Design' },
]

export function parseTags(value: string) {
  return value
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
}

export function createDefaultFeatureCards(): FeatureCardForm[] {
  return defaultFeatureCardPresets
    .slice(0, 4)
    .map((preset) => ({ ...preset, content: '' }))
}

export function normalizeFeatureCards(cards: FeatureCardForm[]): FeatureCardForm[] {
  return cards
    .map((card, index) => ({
      title:
        card.title.trim() ||
        defaultFeatureCardPresets[index]?.title ||
        `Feature ${index + 1}`,
      emoji: card.emoji.trim() || defaultFeatureCardPresets[index]?.emoji || '',
      content: card.content.trim(),
    }))
    .filter((card) => card.content.length > 0)
}

export function createEmptyProjectForm(): ProjectFormState {
  return {
    slug: '',
    title: '',
    headline: '',
    summary: '',
    featureCards: createDefaultFeatureCards(),
    coverImageUrl: '',
    liveUrl: '',
    repoUrl: '',
    caseStudyUrl: '',
    tags: '',
    accentColor: '#0ea5e9',
    bgTint: '#eef8ff',
    status: 'published',
  }
}

export function cloneProjectForm(form: ProjectFormState): ProjectFormState {
  return {
    ...form,
    featureCards: form.featureCards.map((card) => ({ ...card })),
  }
}
