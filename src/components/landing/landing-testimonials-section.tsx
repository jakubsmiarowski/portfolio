import type { Doc } from 'convex/_generated/dataModel'

import { NowPlayingWidget } from '@/components/now-playing-widget'

type Testimonial = Doc<'testimonials'>

type LandingTestimonialsSectionProps = {
  testimonials: Testimonial[] | undefined
  activeTestimonialIndex: number
  onSelectTestimonial: (index: number, personName: string) => void
}

export function LandingTestimonialsSection({
  testimonials,
  activeTestimonialIndex,
  onSelectTestimonial,
}: LandingTestimonialsSectionProps) {
  const activeTestimonial =
    testimonials?.[activeTestimonialIndex] ?? testimonials?.[0] ?? null

  return (
    <section className="space-y-6 pt-14">
      <div className="mx-auto max-w-2xl space-y-3 text-center">
        <h3 className="text-3xl font-semibold tracking-tight text-foreground/90">
          Voices of satisfaction
        </h3>
        <p className="text-base text-muted-foreground">
          Feedback from clients and collaborators reflecting practical,
          high-quality product work.
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        {(testimonials ?? []).map((item, index) => (
          <button
            key={item._id}
            type="button"
            onClick={() => onSelectTestimonial(index, item.personName)}
            className={`inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-sm transition-[transform,background-color,color,border-color] duration-500 ${
              index === activeTestimonialIndex
                ? 'scale-[1.02] border-foreground/35 bg-foreground text-background'
                : 'border-border bg-secondary text-foreground hover:bg-secondary/70'
            }`}
          >
            <img
              src={item.avatarUrl || 'https://i.pravatar.cc/40'}
              alt={item.personName}
              className="h-5 w-5 rounded-full"
              loading="lazy"
            />
            {item.personName}
          </button>
        ))}
      </div>

      {activeTestimonial ? (
        <div className="mx-auto max-w-3xl rounded-3xl border bg-card">
          <div
            key={activeTestimonial._id}
            className="space-y-5 px-6 py-8 [animation:testimonial-enter_520ms_cubic-bezier(0.22,1,0.36,1)] sm:px-9"
          >
            <p className="text-2xl leading-relaxed tracking-tight text-foreground/90">
              &quot;{activeTestimonial.quote}&quot;
            </p>
            <p className="text-base text-muted-foreground">
              <span className="font-semibold text-foreground">
                {activeTestimonial.personName}
              </span>
              {' / '}
              {activeTestimonial.personRole}
              {' @ '}
              {activeTestimonial.company}
            </p>
          </div>
        </div>
      ) : (
        <p className="text-center text-muted-foreground">
          Testimonials will appear here once published from admin.
        </p>
      )}

      <div className="flex w-full flex-col items-start gap-2">
        <p className="text-sm text-muted-foreground">Spotify Live</p>
        <NowPlayingWidget />
      </div>
    </section>
  )
}
