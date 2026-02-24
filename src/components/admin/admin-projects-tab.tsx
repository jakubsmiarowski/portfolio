import { FormEvent, useMemo, useState } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { ArrowDown, ArrowUp, Plus } from 'lucide-react'

import { api } from '../../../convex/_generated/api'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import type { Doc, Id } from 'convex/_generated/dataModel'
import {
  cloneProjectForm,
  createEmptyProjectForm,
  defaultFeatureCardPresets,
  featureEmojiOptions,
  normalizeFeatureCards,
  parseTags,
  type FeatureCardForm,
} from './admin-shared'

type AdminProjectsTabProps = {
  adminToken: string
  onGlobalMessage: (message: string) => void
}

const MIN_PROJECT_YEAR = 1990

export function AdminProjectsTab({
  adminToken,
  onGlobalMessage,
}: AdminProjectsTabProps) {
  const projects = useQuery(api.projects.adminList, { adminToken })

  const createProject = useMutation(api.projects.create)
  const updateProject = useMutation(api.projects.update)
  const removeProject = useMutation(api.projects.remove)
  const reorderProjects = useMutation(api.projects.reorder)

  const [projectEditingId, setProjectEditingId] = useState<Id<'projects'> | null>(
    null,
  )
  const maxProjectYear = new Date().getFullYear() + 1

  const emptyProjectForm = createEmptyProjectForm()

  const projectExampleTemplates = {
    corporateEvents: {
      ...createEmptyProjectForm(),
      slug: 'corporate-events-platform',
      title: 'Corporate Events Platform',
      headline: 'Airbnb for Corporate events',
      summary:
        'A modern platform connecting companies with unique venues for meetings, retreats, and team events. Streamlined booking, transparent pricing, and dedicated support.',
      featureCards: [
        {
          title: 'Summary',
          emoji: '✨',
          content:
            'Companies often struggle to find the right space for offsites, workshops, or client meetings. We built a marketplace that curates venues specifically for corporate use, with capacity, AV setup, and catering options clearly listed.',
        },
        {
          title: 'Booking flow',
          emoji: '🧩',
          content:
            'The platform includes a registration and booking flow with approval workflows, invoicing, and calendar sync. Venue owners get a dedicated dashboard to manage availability and pricing.',
        },
        {
          title: 'Delivery impact',
          emoji: '📈',
          content:
            'We launched with 50 venues in 3 cities and reached 200+ bookings in the first year. The product became a reliable channel for corporate event sourcing.',
        },
        {
          title: 'Tech stack',
          emoji: '💻',
          content:
            'React, TypeScript, Node.js, Stripe, and a custom availability engine with focus on predictable flows and admin operability.',
        },
      ],
      year: '2026',
      coverImageUrl:
        'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200',
      landingImageUrl:
        'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200',
      detailImageUrl:
        'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200',
      landingImageFit: 'cover' as const,
      detailImageFit: 'contain' as const,
      liveUrl: 'https://corporate-events-demo.vercel.app',
      repoUrl: 'https://github.com/example/corporate-events',
      caseStudyUrl: 'https://medium.com/example/corporate-events-case-study',
      tags: 'React, TypeScript, Node.js, Booking, SaaS',
      accentColor: '#0ea5e9',
      bgTint: '#eef8ff',
    },
    motorraid: {
      ...createEmptyProjectForm(),
      slug: 'motorraid',
      title: 'motoRRaid',
      headline: 'motoRRaid — Motorcycle adventures & community',
      summary:
        'Website and community hub for motoRRaid: motorcycle trips, rally calendar, and rider community. Built for discovery, event sign-up, and brand presence.',
      featureCards: [
        {
          title: 'Summary',
          emoji: '🏍️',
          content:
            'motoRRaid is the go-to place for motorcycle enthusiasts to find trips, rallies, and like-minded riders. The project required a fast, mobile-first site with a strong visual identity and clear calls to action.',
        },
        {
          title: 'Community experience',
          emoji: '🤝',
          content:
            'We delivered event listings, image galleries, and structure optimized for discovery and event sign-up. The layout supports both recurring visitors and first-time users.',
        },
        {
          title: 'Brand system',
          emoji: '🎨',
          content:
            'Red and yellow accents reflect the brand and improve visual scanning. Typography and spacing were tuned for readability across long-form event content.',
        },
      ],
      year: '2025',
      coverImageUrl:
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200',
      landingImageUrl:
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200',
      detailImageUrl:
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200',
      landingImageFit: 'cover' as const,
      detailImageFit: 'contain' as const,
      liveUrl: 'https://mrr.bike/',
      repoUrl: '',
      caseStudyUrl: '',
      tags: 'React, Motorcycle, Community, Brand',
      accentColor: '#dc2626',
      bgTint: '#fef2f2',
    },
  }

  const [projectForm, setProjectForm] = useState(() =>
    cloneProjectForm(emptyProjectForm),
  )

  const projectRows = useMemo(() => projects ?? [], [projects])

  const resetProjectForm = () => {
    setProjectEditingId(null)
    setProjectForm(cloneProjectForm(emptyProjectForm))
  }

  const loadProjectToForm = (project: Doc<'projects'>) => {
    const projectWithMedia = project as Doc<'projects'> & {
      year?: number
      landingImageUrl?: string
      detailImageUrl?: string
      landingImageFit?: 'cover' | 'contain'
      detailImageFit?: 'cover' | 'contain'
    }

    const fromProjectCards: FeatureCardForm[] = Array.isArray(project.featureCards)
      ? project.featureCards.map((card) => ({
          title: String(card?.title || '').trim(),
          emoji: String(card?.emoji || '').trim(),
          content: String(card?.content || '').trim(),
        }))
      : []

    const legacyCards: FeatureCardForm[] =
      (project.body || []).length > 0
        ? (project.body || []).map((paragraph: string, index: number) => ({
            title:
              defaultFeatureCardPresets[index]?.title || `Feature ${index + 1}`,
            emoji: defaultFeatureCardPresets[index]?.emoji || '',
            content: paragraph,
          }))
        : [{ title: 'Summary', emoji: '✨', content: project.summary || '' }]

    const featureCards =
      fromProjectCards.filter((card) => card.title || card.content).length > 0
        ? fromProjectCards
        : legacyCards
    const landingImageUrl =
      projectWithMedia.landingImageUrl || project.coverImageUrl
    const detailImageUrl =
      projectWithMedia.detailImageUrl || project.coverImageUrl

    setProjectEditingId(project._id)
    setProjectForm({
      slug: project.slug,
      title: project.title,
      headline: project.headline,
      summary: project.summary,
      featureCards,
      year:
        typeof projectWithMedia.year === 'number'
          ? String(projectWithMedia.year)
          : '',
      coverImageUrl: landingImageUrl,
      landingImageUrl,
      detailImageUrl,
      landingImageFit: projectWithMedia.landingImageFit || 'cover',
      detailImageFit: projectWithMedia.detailImageFit || 'contain',
      liveUrl: project.liveUrl || '',
      repoUrl: project.repoUrl || '',
      caseStudyUrl: project.caseStudyUrl || '',
      tags: (project.tags || []).join(', '),
      accentColor: project.accentColor,
      bgTint: project.bgTint || '#eef8ff',
      status: project.status,
    })
  }

  const submitProjectForm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const featureCards = normalizeFeatureCards(projectForm.featureCards)
    if (featureCards.length === 0) {
      onGlobalMessage('Add at least one feature card with content.')
      return
    }

    const year = Number.parseInt(projectForm.year, 10)
    if (!Number.isInteger(year)) {
      onGlobalMessage('Year is required and must be a number.')
      return
    }

    if (year < MIN_PROJECT_YEAR || year > maxProjectYear) {
      onGlobalMessage(
        `Year must be between ${MIN_PROJECT_YEAR} and ${maxProjectYear}.`,
      )
      return
    }

    const landingImageUrl =
      projectForm.landingImageUrl.trim() || projectForm.coverImageUrl.trim()
    if (!landingImageUrl) {
      onGlobalMessage('Landing image URL is required.')
      return
    }

    const detailImageUrl = projectForm.detailImageUrl.trim() || landingImageUrl

    const payload = {
      adminToken,
      slug: projectForm.slug.trim(),
      title: projectForm.title.trim(),
      headline: projectForm.headline.trim(),
      summary: projectForm.summary.trim(),
      body: featureCards.map((card) => card.content),
      featureCards,
      year,
      coverImageUrl: landingImageUrl,
      landingImageUrl,
      detailImageUrl,
      landingImageFit: projectForm.landingImageFit,
      detailImageFit: projectForm.detailImageFit,
      liveUrl: projectForm.liveUrl.trim(),
      repoUrl: projectForm.repoUrl.trim(),
      caseStudyUrl: projectForm.caseStudyUrl.trim(),
      tags: parseTags(projectForm.tags),
      accentColor: projectForm.accentColor.trim(),
      bgTint: projectForm.bgTint.trim(),
      status: projectForm.status,
    }

    try {
      if (projectEditingId) {
        await updateProject({
          ...payload,
          id: projectEditingId,
        })
        onGlobalMessage('Project updated successfully.')
      } else {
        await createProject(payload)
        onGlobalMessage('Project created successfully.')
      }
      resetProjectForm()
    } catch (error) {
      onGlobalMessage(
        error instanceof Error ? error.message : 'Project action failed.',
      )
    }
  }

  const moveProject = async (index: number, direction: -1 | 1) => {
    if (!projectRows.length) return

    const target = index + direction
    if (target < 0 || target >= projectRows.length) return

    const next = [...projectRows]
    const [item] = next.splice(index, 1)
    next.splice(target, 0, item)

    await reorderProjects({
      adminToken,
      items: next.map((project, idx) => ({
        id: project._id,
        order: idx + 1,
      })),
    })
  }

  return (
    <section className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
      <form
        onSubmit={submitProjectForm}
        className="space-y-4 rounded-2xl border bg-card p-5 sm:p-6"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold tracking-tight">
            {projectEditingId ? 'Edit project' : 'Create project'}
          </h2>
          {projectEditingId ? (
            <Button variant="ghost" type="button" onClick={resetProjectForm}>
              Cancel edit
            </Button>
          ) : null}
        </div>

        {!projectEditingId ? (
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                setProjectForm(cloneProjectForm(projectExampleTemplates.corporateEvents))
              }
            >
              Load example: Corporate Events
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                setProjectForm(cloneProjectForm(projectExampleTemplates.motorraid))
              }
            >
              Load example: motoRRaid
            </Button>
          </div>
        ) : null}

        <div className="grid gap-3 sm:grid-cols-3">
          <Input
            placeholder="Slug"
            value={projectForm.slug}
            onChange={(event) =>
              setProjectForm((prev) => ({ ...prev, slug: event.target.value }))
            }
            required
          />
          <Input
            placeholder="Title"
            value={projectForm.title}
            onChange={(event) =>
              setProjectForm((prev) => ({ ...prev, title: event.target.value }))
            }
            required
          />
          <Input
            placeholder="Year"
            type="number"
            min={MIN_PROJECT_YEAR}
            max={maxProjectYear}
            value={projectForm.year}
            onChange={(event) =>
              setProjectForm((prev) => ({ ...prev, year: event.target.value }))
            }
            required
          />
        </div>

        <Input
          placeholder="Headline"
          value={projectForm.headline}
          onChange={(event) =>
            setProjectForm((prev) => ({ ...prev, headline: event.target.value }))
          }
          required
        />

        <Textarea
          placeholder="Summary"
          value={projectForm.summary}
          onChange={(event) =>
            setProjectForm((prev) => ({ ...prev, summary: event.target.value }))
          }
          required
        />

        <div className="space-y-3 rounded-xl border p-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-foreground/90">Feature cards</p>
              <p className="text-xs text-muted-foreground">
                Each card has its own title and content.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                setProjectForm((prev) => ({
                  ...prev,
                  featureCards: [
                    ...prev.featureCards,
                    {
                      title:
                        defaultFeatureCardPresets[prev.featureCards.length]?.title ||
                        `Feature ${prev.featureCards.length + 1}`,
                      emoji:
                        defaultFeatureCardPresets[prev.featureCards.length]?.emoji ||
                        '',
                      content: '',
                    },
                  ],
                }))
              }
            >
              <Plus className="h-4 w-4" />
              Add card
            </Button>
          </div>

          <div className="space-y-3">
            {projectForm.featureCards.map((card, index) => (
              <div
                key={`feature-card-${index}`}
                className="space-y-2 rounded-lg border p-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Card {index + 1}
                  </p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={projectForm.featureCards.length <= 1}
                    onClick={() =>
                      setProjectForm((prev) => ({
                        ...prev,
                        featureCards: prev.featureCards.filter(
                          (_, cardIndex) => cardIndex !== index,
                        ),
                      }))
                    }
                  >
                    Remove
                  </Button>
                </div>

                <div className="grid grid-cols-[138px_1fr] gap-2">
                  <select
                    aria-label={`Card ${index + 1} emoji`}
                    className="h-10 rounded-md border bg-background px-3 text-sm"
                    value={card.emoji}
                    onChange={(event) =>
                      setProjectForm((prev) => ({
                        ...prev,
                        featureCards: prev.featureCards.map((item, cardIndex) =>
                          cardIndex === index
                            ? { ...item, emoji: event.target.value }
                            : item,
                        ),
                      }))
                    }
                  >
                    {!featureEmojiOptions.some(
                      (option) => option.value === card.emoji,
                    ) && card.emoji ? (
                      <option value={card.emoji}>{card.emoji} current</option>
                    ) : null}
                    <option value="">No emoji</option>
                    {featureEmojiOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.value} {option.label}
                      </option>
                    ))}
                  </select>
                  <Input
                    placeholder={`Title (e.g. ${
                      defaultFeatureCardPresets[index]?.title ||
                      `Feature ${index + 1}`
                    })`}
                    value={card.title}
                    onChange={(event) =>
                      setProjectForm((prev) => ({
                        ...prev,
                        featureCards: prev.featureCards.map((item, cardIndex) =>
                          cardIndex === index
                            ? { ...item, title: event.target.value }
                            : item,
                        ),
                      }))
                    }
                  />
                </div>

                <Textarea
                  placeholder="Card content"
                  className="min-h-28"
                  value={card.content}
                  onChange={(event) =>
                    setProjectForm((prev) => ({
                      ...prev,
                      featureCards: prev.featureCards.map((item, cardIndex) =>
                        cardIndex === index
                          ? { ...item, content: event.target.value }
                          : item,
                      ),
                    }))
                  }
                />
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3 rounded-xl border p-3">
          <div>
            <p className="text-sm font-medium text-foreground/90">Project images</p>
            <p className="text-xs text-muted-foreground">
              Shortcut: <code>/pg</code> resolves to <code>/pictures/pg.jpeg</code>.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              placeholder="Landing image URL"
              value={projectForm.landingImageUrl}
              onChange={(event) =>
                setProjectForm((prev) => ({
                  ...prev,
                  landingImageUrl: event.target.value,
                  coverImageUrl: event.target.value,
                }))
              }
              required
            />
            <select
              className="h-10 rounded-md border bg-background px-3 text-sm"
              value={projectForm.landingImageFit}
              onChange={(event) =>
                setProjectForm((prev) => ({
                  ...prev,
                  landingImageFit: event.target.value as 'cover' | 'contain',
                }))
              }
            >
              <option value="cover">Landing fit: cover</option>
              <option value="contain">Landing fit: contain</option>
            </select>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              placeholder="Detail image URL (optional)"
              value={projectForm.detailImageUrl}
              onChange={(event) =>
                setProjectForm((prev) => ({
                  ...prev,
                  detailImageUrl: event.target.value,
                }))
              }
            />
            <select
              className="h-10 rounded-md border bg-background px-3 text-sm"
              value={projectForm.detailImageFit}
              onChange={(event) =>
                setProjectForm((prev) => ({
                  ...prev,
                  detailImageFit: event.target.value as 'cover' | 'contain',
                }))
              }
            >
              <option value="cover">Detail fit: cover</option>
              <option value="contain">Detail fit: contain</option>
            </select>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Input
            placeholder="Live URL"
            value={projectForm.liveUrl}
            onChange={(event) =>
              setProjectForm((prev) => ({ ...prev, liveUrl: event.target.value }))
            }
          />
          <Input
            placeholder="Repo URL"
            value={projectForm.repoUrl}
            onChange={(event) =>
              setProjectForm((prev) => ({ ...prev, repoUrl: event.target.value }))
            }
          />
        </div>

        <Input
          placeholder="Case study URL"
          value={projectForm.caseStudyUrl}
          onChange={(event) =>
            setProjectForm((prev) => ({
              ...prev,
              caseStudyUrl: event.target.value,
            }))
          }
        />

        <Input
          placeholder="Tags (comma separated)"
          value={projectForm.tags}
          onChange={(event) =>
            setProjectForm((prev) => ({ ...prev, tags: event.target.value }))
          }
          required
        />

        <div className="grid gap-3 sm:grid-cols-3">
          <Input
            type="color"
            value={projectForm.accentColor}
            onChange={(event) =>
              setProjectForm((prev) => ({
                ...prev,
                accentColor: event.target.value,
              }))
            }
          />
          <Input
            type="color"
            value={projectForm.bgTint}
            onChange={(event) =>
              setProjectForm((prev) => ({ ...prev, bgTint: event.target.value }))
            }
          />
          <select
            className="h-10 rounded-md border bg-background px-3 text-sm"
            value={projectForm.status}
            onChange={(event) =>
              setProjectForm((prev) => ({
                ...prev,
                status: event.target.value as typeof prev.status,
              }))
            }
          >
            <option value="published">published</option>
            <option value="draft">draft</option>
          </select>
        </div>

        <Button type="submit" className="w-full">
          <Plus className="h-4 w-4" />
          {projectEditingId ? 'Update project' : 'Create project'}
        </Button>
      </form>

      <div className="rounded-2xl border bg-card p-5 sm:p-6">
        <h3 className="text-lg font-semibold tracking-tight">Current projects</h3>
        <div className="mt-4 space-y-3">
          {projectRows.map((project, index) => (
            <div key={project._id} className="space-y-2 rounded-xl border p-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium">{project.title}</p>
                  <p className="text-xs text-muted-foreground">
                    /{project.slug}
                    {typeof (project as { year?: number }).year === 'number'
                      ? ` • ${(project as { year?: number }).year}`
                      : ''}
                  </p>
                </div>
                <Badge
                  variant={
                    project.status === 'published' ? 'default' : 'secondary'
                  }
                >
                  {project.status}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => loadProjectToForm(project)}
                >
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    updateProject({
                      adminToken,
                      id: project._id,
                      status:
                        project.status === 'published' ? 'draft' : 'published',
                    })
                  }
                >
                  Toggle status
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => moveProject(index, -1)}
                >
                  <ArrowUp className="h-3 w-3" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => moveProject(index, 1)}
                >
                  <ArrowDown className="h-3 w-3" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeProject({ adminToken, id: project._id })}
                >
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
