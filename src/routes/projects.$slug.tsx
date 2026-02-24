import { useEffect, useMemo } from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'
import { useQuery } from 'convex/react'
import { ArrowLeft, ArrowUpRight, Github, MoveRight } from 'lucide-react'

import { api } from '../../convex/_generated/api'
import type { Doc } from 'convex/_generated/dataModel'
import { ThemeSwitcher } from '@/components/theme-switcher'
import { CardHoverEffect, type CardHoverEffectItem } from '@/components/ui/card-hover-effect'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useAnalytics } from '@/lib/analytics'
import {
  normalizeImageReferenceForRender,
  normalizeProjectImageFit,
} from '@/lib/image-ref'

export const Route = createFileRoute('/projects/$slug')({
  component: ProjectPage,
})

type Project = Doc<'projects'>
type ProjectWithMedia = Project & {
  detailImageUrl?: string
  detailImageFit?: 'cover' | 'contain'
}

const defaultFeatureMeta = [
  { title: 'Summary', emoji: '✨' },
  { title: 'Product scope', emoji: '🧩' },
  { title: 'Implementation', emoji: '🛠️' },
  { title: 'Delivery impact', emoji: '📈' },
  { title: 'Challenges', emoji: '🧠' },
  { title: 'Tech stack', emoji: '💻' },
]

function toFeatureCards(project: Project): CardHoverEffectItem[] {
  const normalizedCards = (project.featureCards ?? [])
    .map((card) => ({
      title: card.title.trim(),
      emoji: (card.emoji || '').trim(),
      description: card.content.trim(),
    }))
    .filter((card) => card.title.length > 0 && card.description.length > 0)

  if (normalizedCards.length > 0) {
    return normalizedCards
  }

  const legacyBlocks = project.body.length > 0 ? project.body : [project.summary]
  return legacyBlocks.map((paragraph, index) => ({
    title: defaultFeatureMeta[index]?.title ?? `Feature ${index + 1}`,
    emoji: defaultFeatureMeta[index]?.emoji || '',
    description: paragraph,
  }))
}

function ProjectPage() {
  const { slug } = Route.useParams()
  const projects = useQuery(api.projects.listPublished)
  const { trackEvent } = useAnalytics()

  const project = useMemo(
    () => projects?.find((item) => item.slug === slug) ?? null,
    [projects, slug],
  )

  useEffect(() => {
    if (!project) {
      return
    }

    trackEvent('project_open', {
      projectSlug: project.slug,
    })
  }, [project, trackEvent])

  if (projects && !project) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-5 pb-16 pt-10 sm:px-8 sm:pt-14">
          <div className="flex items-center justify-between gap-4">
            <Button variant="outline" className="rounded-xl" asChild>
              <Link to="/">
                <ArrowLeft className="h-4 w-4" />
                Back home
              </Link>
            </Button>
            <div className="flex items-center gap-2">
              <Avatar size="lg" className="rounded-xl border border-border/70 shadow-xs">
                <AvatarImage
                  src="/kuba.jpeg"
                  alt="Kuba Smiarowski"
                  className="scale-[1.25] object-cover object-[50%_22%]"
                />
                <AvatarFallback className="rounded-xl">KS</AvatarFallback>
              </Avatar>
              <ThemeSwitcher />
            </div>
          </div>
          <div className="rounded-3xl border bg-card p-8 text-center">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground/90">
              Project not found
            </h1>
            <p className="mt-2 text-muted-foreground">
              This project does not exist or has not been published yet.
            </p>
          </div>
        </div>
      </main>
    )
  }

  if (!project) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <div className="mx-auto w-full max-w-4xl px-5 pb-16 pt-10 sm:px-8 sm:pt-14">
          <div className="h-[420px] animate-pulse rounded-3xl border bg-card/60" />
        </div>
      </main>
    )
  }

  const featureCards = toFeatureCards(project)
  const projectWithMedia = project as ProjectWithMedia
  const detailImageUrl = normalizeImageReferenceForRender(
    projectWithMedia.detailImageUrl || project.coverImageUrl,
  )
  const detailImageFit = normalizeProjectImageFit(
    projectWithMedia.detailImageFit,
    'contain',
  )

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto w-full max-w-4xl px-5 pb-16 pt-10 sm:px-8 sm:pt-14">
        <div className="mb-8 flex items-center justify-between gap-4">
          <Button variant="outline" className="rounded-xl" asChild>
            <Link to="/">
              <ArrowLeft className="h-4 w-4" />
              Back home
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            <Avatar size="lg" className="rounded-xl border border-border/70 shadow-xs">
              <AvatarImage
                src="/kuba.jpeg"
                alt="Kuba Smiarowski"
                className="scale-[1.25] object-cover object-[50%_22%]"
              />
              <AvatarFallback className="rounded-xl">KS</AvatarFallback>
            </Avatar>
            <ThemeSwitcher />
          </div>
        </div>

        <section className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-6 [animation:project-showcase-enter_560ms_cubic-bezier(0.22,1,0.36,1)]">
            <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs font-medium">
              Case study
            </Badge>

            <div className="space-y-4">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                {project.title}
              </p>
              <h1 className="text-balance text-4xl font-semibold leading-tight tracking-tight text-foreground/90 sm:text-5xl">
                {project.headline}
              </h1>
              <p className="max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                {project.summary}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {project.tags.map((tag) => (
                <Badge
                  key={`${project._id}-${tag}`}
                  variant="secondary"
                  className="rounded-full border px-3 py-1"
                  style={{
                    borderColor: `${project.accentColor}40`,
                    backgroundColor: `${project.accentColor}14`,
                    color: project.accentColor,
                  }}
                >
                  {tag}
                </Badge>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              {project.liveUrl ? (
                <Button className="rounded-xl" asChild>
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() =>
                      trackEvent('project_link_click', {
                        projectSlug: project.slug,
                        meta: { target: 'live' },
                      })
                    }
                  >
                    Live project
                    <ArrowUpRight className="h-4 w-4" />
                  </a>
                </Button>
              ) : null}
              {project.repoUrl ? (
                <Button variant="outline" className="rounded-xl" asChild>
                  <a
                    href={project.repoUrl}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() =>
                      trackEvent('project_link_click', {
                        projectSlug: project.slug,
                        meta: { target: 'repo' },
                      })
                    }
                  >
                    Source code
                    <Github className="h-4 w-4" />
                  </a>
                </Button>
              ) : null}
              {project.caseStudyUrl ? (
                <Button variant="outline" className="rounded-xl" asChild>
                  <a
                    href={project.caseStudyUrl}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() =>
                      trackEvent('project_link_click', {
                        projectSlug: project.slug,
                        meta: { target: 'case_study' },
                      })
                    }
                  >
                    External case study
                    <MoveRight className="h-4 w-4" />
                  </a>
                </Button>
              ) : null}
            </div>
          </div>

          <div className="lg:sticky lg:top-10 lg:h-fit">
            <div
              className="overflow-hidden rounded-3xl border bg-card [animation:project-showcase-enter_640ms_cubic-bezier(0.22,1,0.36,1)]"
              style={{ borderColor: `${project.accentColor}35` }}
            >
              <div
                style={{ backgroundColor: project.bgTint ?? '#f6f8fa' }}
                className="border-b p-2"
              >
                <img
                  src={detailImageUrl}
                  alt={project.title}
                  className={`h-[260px] w-full rounded-2xl ${
                    detailImageFit === 'contain' ? 'object-contain' : 'object-cover'
                  } sm:h-[300px]`}
                />
              </div>
              <div className="space-y-3 p-5">
                <p className="text-sm font-medium text-muted-foreground">Project highlights</p>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Scroll to explore implementation details, delivery steps, and outcomes.
                </p>
              </div>
            </div>
          </div>
        </section>

        <Separator className="my-12" />

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground/90 sm:text-3xl">
            Feature breakdown
          </h2>
          <CardHoverEffect
            items={featureCards}
            cardClassName="transition-colors duration-300"
          />
        </section>
      </div>
    </main>
  )
}
