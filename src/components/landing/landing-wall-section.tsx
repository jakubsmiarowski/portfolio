import type { FormEvent } from 'react'
import type { Doc } from 'convex/_generated/dataModel'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

type WallEntry = Doc<'wallEntries'>

type LandingWallSectionProps = {
  isWallEnabled: boolean
  wallState: {
    displayName: string
    message: string
  }
  isWallSubmitting: boolean
  wallError: string | null
  wallSuccess: boolean
  wallTickerDuration: number
  approvedWallEntries: WallEntry[]
  wallTickerEntries: WallEntry[]
  onWallSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>
  onDisplayNameChange: (value: string) => void
  onMessageChange: (value: string) => void
}

export function LandingWallSection({
  isWallEnabled,
  wallState,
  isWallSubmitting,
  wallError,
  wallSuccess,
  wallTickerDuration,
  approvedWallEntries,
  wallTickerEntries,
  onWallSubmit,
  onDisplayNameChange,
  onMessageChange,
}: LandingWallSectionProps) {
  if (!isWallEnabled) {
    return null
  }

  return (
    <section id="wall-section" className="space-y-5">
      <h3 className="text-3xl font-semibold tracking-tight text-foreground/90">
        Sign the wall
      </h3>
      <p className="max-w-2xl text-base text-muted-foreground sm:text-lg">
        Leave your name or a short note. New entries are moderated, then
        added to the live ticker.
      </p>

      <div className="rounded-3xl border bg-card p-5 sm:p-7">
        <form className="grid gap-4" onSubmit={onWallSubmit}>
          <fieldset disabled={isWallSubmitting} className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                value={wallState.displayName}
                onChange={(event) => onDisplayNameChange(event.target.value)}
                placeholder="Your name"
                required
              />
              <Button type="submit" className="rounded-xl px-6 sm:justify-self-end">
                {isWallSubmitting ? 'Submitting...' : 'Sign the wall'}
              </Button>
            </div>

            <Textarea
              value={wallState.message}
              onChange={(event) => onMessageChange(event.target.value)}
              placeholder="Optional short message"
              className="min-h-24"
              maxLength={140}
            />
          </fieldset>

          {wallError ? (
            <p className="text-sm text-muted-foreground">{wallError}</p>
          ) : null}
          {wallSuccess ? (
            <p className="text-sm text-muted-foreground">
              Signed. Your entry is pending approval.
            </p>
          ) : null}
        </form>

        <div className="mt-6">
          {approvedWallEntries.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Be the first to sign the wall.
            </p>
          ) : (
            <div className="wall-ticker overflow-hidden rounded-2xl border bg-background/40">
              <div
                className="wall-ticker-track flex w-max items-center gap-3 px-3 py-3"
                style={{ animationDuration: `${wallTickerDuration}s` }}
              >
                {wallTickerEntries.map((item, index) => (
                  <div
                    key={`${item._id}-${index}`}
                    className="inline-flex max-w-[30rem] items-center gap-2 rounded-full border bg-card px-3 py-1 text-sm"
                  >
                    <span className="font-semibold text-foreground/90">
                      {item.displayName}
                    </span>
                    {item.message ? (
                      <span className="truncate text-muted-foreground">
                        {item.message}
                      </span>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
