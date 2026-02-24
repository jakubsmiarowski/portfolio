import { FormEvent, useEffect, useMemo, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useMutation, useQuery } from 'convex/react'

import { api } from '../../convex/_generated/api'
import type { Doc } from 'convex/_generated/dataModel'
import type { ProjectShowcaseItem } from '@/components/project-showcase'
import { LandingContactSection } from '@/components/landing/landing-contact-section'
import { LandingFooterSection } from '@/components/landing/landing-footer-section'
import { LandingHeroSection } from '@/components/landing/landing-hero-section'
import { LandingProjectsSection } from '@/components/landing/landing-projects-section'
import { LandingTestimonialsSection } from '@/components/landing/landing-testimonials-section'
import { LandingWallSection } from '@/components/landing/landing-wall-section'
import { Separator } from '@/components/ui/separator'
import { getPortfolioSessionId, useAnalytics } from '@/lib/analytics'
import {
  normalizeImageReferenceForRender,
  normalizeProjectImageFit,
} from '@/lib/image-ref'

export const Route = createFileRoute('/')({ component: PortfolioPage })

type Project = Doc<'projects'>
type ProjectWithMedia = Project & {
  year?: number
  landingImageUrl?: string
  landingImageFit?: 'cover' | 'contain'
}

const CV_DOWNLOAD_PATH = '/Jakub_Smiarowski_CV.pdf'
const CV_DOWNLOAD_FILE_NAME = 'Jakub_Smiarowski_CV.pdf'

function PortfolioPage() {
  const projects = useQuery(api.projects.listPublished)
  const testimonials = useQuery(api.testimonials.listPublished)
  const siteSettings = useQuery(api.siteSettings.getPublic)

  const submitMessage = useMutation(api.messages.submit)
  const submitWall = useMutation(api.wall.submit)
  const wallEntries = useQuery(api.wall.listApproved, {
    limit: siteSettings?.wallMaxVisibleEntries ?? 24,
  })

  const [activeTestimonialIndex, setActiveTestimonialIndex] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isContactSuccess, setIsContactSuccess] = useState(false)
  const [contactState, setContactState] = useState({
    senderName: '',
    senderEmail: '',
    content: '',
  })
  const [contactError, setContactError] = useState<string | null>(null)
  const [wallState, setWallState] = useState({
    displayName: '',
    message: '',
  })
  const [isWallSubmitting, setIsWallSubmitting] = useState(false)
  const [wallError, setWallError] = useState<string | null>(null)
  const [wallSuccess, setWallSuccess] = useState(false)

  const { trackEvent } = useAnalytics()

  useEffect(() => {
    trackEvent('page_view')
  }, [trackEvent])

  useEffect(() => {
    if (!testimonials?.length) {
      setActiveTestimonialIndex(0)
      return
    }

    setActiveTestimonialIndex((prev) =>
      prev >= testimonials.length ? 0 : prev,
    )
  }, [testimonials?.length])

  useEffect(() => {
    if (!testimonials || testimonials.length < 2) {
      return
    }

    const intervalId = window.setInterval(() => {
      setActiveTestimonialIndex((prev) => (prev + 1) % testimonials.length)
    }, 7000)

    return () => window.clearInterval(intervalId)
  }, [testimonials])

  const showcaseProjects = useMemo<ProjectShowcaseItem[]>(() => {
    const guessYear = (project: Project, index: number) => {
      const projectWithMedia = project as ProjectWithMedia
      if (typeof projectWithMedia.year === 'number') {
        return String(projectWithMedia.year)
      }

      const source = `${project.title} ${project.headline} ${project.summary} ${project.body.join(' ')}`
      const match = source.match(/\b(20\d{2})\b/)
      if (match?.[1]) {
        return match[1]
      }
      return `${new Date().getFullYear() - Math.floor(index / 2)}`
    }

    return (projects ?? []).map((project, index) => {
      const projectWithMedia = project as ProjectWithMedia
      const landingImageUrl =
        projectWithMedia.landingImageUrl || project.coverImageUrl

      return {
        title: project.title,
        description: project.headline,
        year: guessYear(project, index),
        link: `/projects/${project.slug}`,
        image: normalizeImageReferenceForRender(landingImageUrl),
        imageFit: normalizeProjectImageFit(projectWithMedia.landingImageFit),
      }
    })
  }, [projects])

  const stats = siteSettings?.quickStats ?? {
    projectsShipped: 0,
    yearsExperience: 0,
  }

  // const isWallEnabled = siteSettings?.wallEnabled ?? false
  const isWallEnabled = false
  const wallTickerDuration = Math.max(siteSettings?.wallTickerDurationSec ?? 38, 10)
  const approvedWallEntries = wallEntries ?? []
  const wallTickerEntries =
    approvedWallEntries.length > 0
      ? [...approvedWallEntries, ...approvedWallEntries]
      : []

  const handleWallSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!wallState.displayName.trim()) {
      setWallError('Please add your name before submitting.')
      return
    }

    setIsWallSubmitting(true)
    setWallError(null)
    setWallSuccess(false)

    try {
      await submitWall({
        displayName: wallState.displayName.trim(),
        message: wallState.message.trim() || undefined,
        sessionId: getPortfolioSessionId(),
      })
      await trackEvent('wall_submit')
      setWallSuccess(true)
      setWallState({ displayName: '', message: '' })
    } catch (error) {
      setWallError(
        error instanceof Error
          ? error.message
          : 'Wall entry could not be submitted right now.',
      )
    } finally {
      setIsWallSubmitting(false)
    }
  }

  const handleContactSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (
      !contactState.senderName.trim() ||
      !contactState.senderEmail.trim() ||
      !contactState.content.trim()
    ) {
      setContactError('Please complete all fields before sending your message.')
      return
    }

    setIsSubmitting(true)
    setContactError(null)
    setIsContactSuccess(false)

    try {
      await submitMessage({
        senderName: contactState.senderName.trim(),
        senderEmail: contactState.senderEmail.trim(),
        content: contactState.content.trim(),
      })

      await trackEvent('contact_submit')

      setIsContactSuccess(true)
      setContactState({ senderName: '', senderEmail: '', content: '' })
    } catch {
      setContactError('Message could not be sent right now. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCvDownloadClick = () => {
    void trackEvent('cta_click', {
      meta: {
        cta: 'download_cv',
        asset: 'cv',
        file: CV_DOWNLOAD_FILE_NAME,
      },
    })
  }

  const handleSendMessageClick = () => {
    trackEvent('cta_click', { meta: { cta: 'send_message' } })
    document.getElementById('contact-section')?.scrollIntoView({
      behavior: 'smooth',
    })
  }

  const handleWallDisplayNameChange = (value: string) => {
    setWallState((prev) => ({
      ...prev,
      displayName: value,
    }))
    setWallError(null)
    setWallSuccess(false)
  }

  const handleWallMessageChange = (value: string) => {
    setWallState((prev) => ({
      ...prev,
      message: value,
    }))
    setWallError(null)
    setWallSuccess(false)
  }

  const handleContactStateChange = (
    field: 'senderName' | 'senderEmail' | 'content',
    value: string,
  ) => {
    setContactState((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto w-full max-w-4xl px-5 pb-16 pt-10 sm:px-8 sm:pt-14">
        <LandingHeroSection
          availabilityText={
            siteSettings?.availabilityText ?? 'Available for selected projects'
          }
          availabilityTimezone={siteSettings?.availabilityTimezone ?? 'America/Toronto'}
          projectsShipped={stats.projectsShipped}
          yearsExperience={stats.yearsExperience}
          cvDownloadPath={CV_DOWNLOAD_PATH}
          cvDownloadFileName={CV_DOWNLOAD_FILE_NAME}
          onSendMessageClick={handleSendMessageClick}
          onCvDownloadClick={handleCvDownloadClick}
        />

        <Separator className="my-14" />

        <LandingProjectsSection projects={showcaseProjects} />

        <LandingTestimonialsSection
          testimonials={testimonials}
          activeTestimonialIndex={activeTestimonialIndex}
          onSelectTestimonial={(index, personName) => {
            setActiveTestimonialIndex(index)
            trackEvent('testimonial_switch', {
              meta: { person: personName },
            })
          }}
        />

        {isWallEnabled ? <Separator className="my-14" /> : null}

        <LandingWallSection
          isWallEnabled={isWallEnabled}
          wallState={wallState}
          isWallSubmitting={isWallSubmitting}
          wallError={wallError}
          wallSuccess={wallSuccess}
          wallTickerDuration={wallTickerDuration}
          approvedWallEntries={approvedWallEntries}
          wallTickerEntries={wallTickerEntries}
          onWallSubmit={handleWallSubmit}
          onDisplayNameChange={handleWallDisplayNameChange}
          onMessageChange={handleWallMessageChange}
        />

        <Separator className="my-14" />

        <LandingContactSection
          isContactSuccess={isContactSuccess}
          isSubmitting={isSubmitting}
          contactError={contactError}
          contactState={contactState}
          onContactSubmit={handleContactSubmit}
          onContactStateChange={handleContactStateChange}
          onResetSuccess={() => setIsContactSuccess(false)}
        />

        <LandingFooterSection />
      </div>
    </main>
  )
}
