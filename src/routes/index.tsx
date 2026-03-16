import { FormEvent, useEffect, useMemo, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'

import type { Doc } from '../../convex/_generated/dataModel'
import type { ProjectShowcaseItem } from '@/components/project-showcase'
import { LandingContactSection } from '@/components/landing/landing-contact-section'
import { LandingFooterSection } from '@/components/landing/landing-footer-section'
import { LandingHeroSection } from '@/components/landing/landing-hero-section'
import { LandingProjectsSection } from '@/components/landing/landing-projects-section'
import { LandingTestimonialsSection } from '@/components/landing/landing-testimonials-section'
import { Separator } from '@/components/ui/separator'
import { useAnalytics } from '@/lib/analytics'
import { getPortfolioPageData, submitContactMessage } from '@/lib/public-content'
import {
  buildCanonicalLinks,
  buildSeoMeta,
  createPersonJsonLd,
  createProfilePageJsonLd,
  createWebsiteJsonLd,
  getHomepageSeo,
} from '@/lib/seo'
import {
  normalizeImageReferenceForRender,
  normalizeProjectImageFit,
} from '@/lib/image-ref'

export const Route = createFileRoute('/')({
  loader: () => getPortfolioPageData(),
  head: () => {
    const seo = getHomepageSeo()

    return {
      meta: [
        ...buildSeoMeta({
          title: seo.title,
          description: seo.description,
          pathname: '/',
        }),
        { 'script:ld+json': createPersonJsonLd() },
        { 'script:ld+json': createProfilePageJsonLd() },
        { 'script:ld+json': createWebsiteJsonLd() },
      ],
      links: buildCanonicalLinks('/'),
    }
  },
  component: PortfolioPage,
})

type Project = Doc<'projects'>
type ProjectWithMedia = Project & {
  year?: string | number
  landingImageUrl?: string
  landingImageFit?: 'cover' | 'contain'
}

const CV_DOWNLOAD_PATH = '/Jakub_Smiarowski_CV.pdf'
const CV_DOWNLOAD_FILE_NAME = 'Jakub_Smiarowski_CV.pdf'

function PortfolioPage() {
  const { projects, testimonials, siteSettings } = Route.useLoaderData()
  const { trackEvent } = useAnalytics()

  const [activeTestimonialIndex, setActiveTestimonialIndex] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isContactSuccess, setIsContactSuccess] = useState(false)
  const [contactState, setContactState] = useState({
    senderName: '',
    senderEmail: '',
    content: '',
  })
  const [contactError, setContactError] = useState<string | null>(null)

  useEffect(() => {
    void trackEvent('page_view')
  }, [trackEvent])

  useEffect(() => {
    if (!testimonials.length) {
      setActiveTestimonialIndex(0)
      return
    }

    setActiveTestimonialIndex((prev) =>
      prev >= testimonials.length ? 0 : prev,
    )
  }, [testimonials.length])

  useEffect(() => {
    if (testimonials.length < 2) {
      return
    }

    const intervalId = window.setInterval(() => {
      setActiveTestimonialIndex((prev) => (prev + 1) % testimonials.length)
    }, 7_000)

    return () => window.clearInterval(intervalId)
  }, [testimonials])

  const showcaseProjects = useMemo<ProjectShowcaseItem[]>(() => {
    function guessYear(project: Project, index: number) {
      const projectWithMedia = project as ProjectWithMedia
      if (
        typeof projectWithMedia.year === 'string' &&
        projectWithMedia.year.trim()
      ) {
        return projectWithMedia.year.trim()
      }

      if (typeof projectWithMedia.year === 'number') {
        return `${projectWithMedia.year}`
      }

      const source = `${project.title} ${project.headline} ${project.summary} ${project.body.join(' ')}`
      const match = source.match(/\b(20\d{2})\b/)
      if (match?.[1]) {
        return match[1]
      }

      return `${new Date().getFullYear() - Math.floor(index / 2)}`
    }

    return projects.map((project, index) => {
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

  const stats = siteSettings.quickStats

  async function handleContactSubmit(event: FormEvent<HTMLFormElement>) {
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
      await submitContactMessage({
        data: {
          senderName: contactState.senderName.trim(),
          senderEmail: contactState.senderEmail.trim(),
          content: contactState.content.trim(),
        },
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

  function handleCvDownloadClick() {
    void trackEvent('cta_click', {
      meta: {
        cta: 'download_cv',
        asset: 'cv',
        file: CV_DOWNLOAD_FILE_NAME,
      },
    })
  }

  function handleSendMessageClick() {
    void trackEvent('cta_click', { meta: { cta: 'send_message' } })
    document.getElementById('contact-section')?.scrollIntoView({
      behavior: 'smooth',
    })
  }

  function handleContactStateChange(
    field: 'senderName' | 'senderEmail' | 'content',
    value: string,
  ) {
    setContactState((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  function handleSelectTestimonial(index: number, personName: string) {
    setActiveTestimonialIndex(index)
    void trackEvent('testimonial_switch', {
      meta: { person: personName },
    })
  }

  function handleResetSuccess() {
    setIsContactSuccess(false)
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto w-full max-w-4xl px-5 pb-16 pt-10 sm:px-8 sm:pt-14">
        <LandingHeroSection
          availabilityText={siteSettings.availabilityText}
          availabilityTimezone={siteSettings.availabilityTimezone}
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
          onSelectTestimonial={handleSelectTestimonial}
        />

        <Separator className="my-14" />

        <LandingContactSection
          isContactSuccess={isContactSuccess}
          isSubmitting={isSubmitting}
          contactError={contactError}
          contactState={contactState}
          onContactSubmit={handleContactSubmit}
          onContactStateChange={handleContactStateChange}
          onResetSuccess={handleResetSuccess}
        />

        <LandingFooterSection />
      </div>
    </main>
  )
}
