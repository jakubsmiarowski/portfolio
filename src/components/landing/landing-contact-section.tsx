import type { FormEvent } from 'react'

import { CircleCheck } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

type LandingContactSectionProps = {
  isContactSuccess: boolean
  isSubmitting: boolean
  contactError: string | null
  contactState: {
    senderName: string
    senderEmail: string
    content: string
  }
  onContactSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>
  onContactStateChange: (
    field: 'senderName' | 'senderEmail' | 'content',
    value: string,
  ) => void
  onResetSuccess: () => void
}

export function LandingContactSection({
  isContactSuccess,
  isSubmitting,
  contactError,
  contactState,
  onContactSubmit,
  onContactStateChange,
  onResetSuccess,
}: LandingContactSectionProps) {
  return (
    <section id="contact-section" className="space-y-5">
      <h3 className="text-3xl font-semibold tracking-tight text-foreground/90">
        Let&apos;s build something meaningful.
      </h3>
      <p className="max-w-2xl text-base text-muted-foreground sm:text-lg">
        Send a quick note about your product, timeline, and goals. I usually
        respond within one business day.
      </p>

      <div className="relative overflow-hidden rounded-3xl border bg-card p-5 sm:p-7">
        <form
          className={`grid gap-4 transition-[opacity,transform,filter] duration-500 ${
            isContactSuccess
              ? 'pointer-events-none translate-y-2 opacity-0 blur-[2px]'
              : 'translate-y-0 opacity-100 blur-0'
          }`}
          onSubmit={onContactSubmit}
          aria-hidden={isContactSuccess}
        >
          <fieldset
            disabled={isContactSuccess || isSubmitting}
            className="grid gap-4"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                value={contactState.senderName}
                onChange={(event) =>
                  onContactStateChange('senderName', event.target.value)
                }
                placeholder="Your name"
                required
              />
              <Input
                type="email"
                value={contactState.senderEmail}
                onChange={(event) =>
                  onContactStateChange('senderEmail', event.target.value)
                }
                placeholder="Your email"
                required
              />
            </div>

            <Textarea
              value={contactState.content}
              onChange={(event) =>
                onContactStateChange('content', event.target.value)
              }
              placeholder="Tell me about the project"
              className="min-h-36"
              required
            />

            <div className="flex flex-wrap items-center gap-3">
              <Button type="submit" className="rounded-xl px-6">
                {isSubmitting ? 'Sending...' : 'Send message'}
              </Button>
              <p className="text-sm text-muted-foreground">
                or email me directly at smiarowski.jakub@gmail.com
              </p>
            </div>
          </fieldset>

          {contactError ? (
            <p className="text-sm text-muted-foreground">{contactError}</p>
          ) : null}
        </form>

        <div
          className={`absolute inset-0 flex items-center justify-center px-7 transition-[opacity,transform,filter] duration-500 ${
            isContactSuccess
              ? 'translate-y-0 opacity-100 blur-0'
              : 'pointer-events-none -translate-y-2 opacity-0 blur-[2px]'
          }`}
          aria-hidden={!isContactSuccess}
        >
          <div className="max-w-md text-center">
            <CircleCheck className="mx-auto mb-4 h-10 w-10 text-emerald-600" />
            <p className="text-xl font-semibold tracking-tight text-foreground/90">
              Dzięki za wiadomość.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Wrócę do Ciebie jak tylko będę mógł.
            </p>
            <Button
              type="button"
              variant="secondary"
              className="mt-5 rounded-xl px-6"
              onClick={onResetSuccess}
            >
              Send another message
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
