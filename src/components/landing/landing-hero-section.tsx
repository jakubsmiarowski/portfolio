import { Dot, Download, Mail } from 'lucide-react'

import { ThemeSwitcher } from '@/components/theme-switcher'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

type LandingHeroSectionProps = {
  availabilityText: string
  availabilityTimezone: string
  projectsShipped: number
  yearsExperience: number
  cvDownloadPath: string
  cvDownloadFileName: string
  onSendMessageClick: () => void
  onCvDownloadClick: () => void
}

export function LandingHeroSection({
  availabilityText,
  availabilityTimezone,
  projectsShipped,
  yearsExperience,
  cvDownloadPath,
  cvDownloadFileName,
  onSendMessageClick,
  onCvDownloadClick,
}: LandingHeroSectionProps) {
  return (
    <>
      <div className="mb-8 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Avatar size="lg" className="rounded-xl border border-border/70 shadow-xs">
            <AvatarImage
              src="/kuba.jpeg"
              alt="Kuba Smiarowski"
              className="scale-[1.25] object-cover object-[50%_22%]"
            />
            <AvatarFallback className="rounded-xl">KS</AvatarFallback>
          </Avatar>
          <p className="text-sm font-medium tracking-wide text-muted-foreground">
            Kuba Śmiarowski
          </p>
        </div>
        <ThemeSwitcher />
      </div>

      <section className="space-y-7">
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <Badge variant="secondary" className="rounded-full px-3 py-1 font-medium">
            {availabilityText}
          </Badge>
          <Badge variant="secondary" className="rounded-full px-3 py-1 font-medium">
            GMT-5
            <Dot className="h-4 w-4" />
            {availabilityTimezone}
          </Badge>
          <Badge variant="secondary" className="rounded-full px-3 py-1 font-medium">
            {projectsShipped} projects shipped
          </Badge>
          <Badge variant="secondary" className="rounded-full px-3 py-1 font-medium">
            {yearsExperience}+ years experience
          </Badge>
        </div>

        <div className="space-y-5">
          <h1 className="max-w-3xl text-balance text-4xl font-semibold leading-tight tracking-tight text-foreground/90 sm:text-6xl">
            I&apos;m <span className="text-foreground">Kuba</span>, frontend engineer
            building clean, high-impact digital products.
          </h1>
          <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
            I ship portfolio-grade interfaces and product surfaces with strong
            implementation quality, fast feedback loops, and business-focused
            outcomes.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="secondary"
              className="h-11 rounded-xl px-6"
              onClick={onSendMessageClick}
            >
              Send message
              <Mail className="h-4 w-4" />
            </Button>
            <Button asChild className="h-11 rounded-xl px-6">
              <a
                href={cvDownloadPath}
                download={cvDownloadFileName}
                onClick={onCvDownloadClick}
              >
                Get CV
                <Download className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}
