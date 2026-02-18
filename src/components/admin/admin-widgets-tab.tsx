import { FormEvent, useEffect, useState } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { Database } from 'lucide-react'

import { api } from '../../../convex/_generated/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import type { WidgetFormState } from './admin-shared'

type AdminWidgetsTabProps = {
  adminToken: string
  onGlobalMessage: (message: string) => void
}

export function AdminWidgetsTab({
  adminToken,
  onGlobalMessage,
}: AdminWidgetsTabProps) {
  const siteSettings = useQuery(api.siteSettings.adminGet, { adminToken })

  const updateWidgets = useMutation(api.siteSettings.adminUpdate)
  const seedDummyContent = useMutation(api.seed.seedDummyContent)

  const [widgetForm, setWidgetForm] = useState<WidgetFormState>({
    availabilityText: '',
    availabilityTimezone: '',
    focusNote: '',
    focusEmoji: '',
    careerStartYear: '',
    wallEnabled: true,
    wallTickerDurationSec: '',
    wallMaxVisibleEntries: '',
  })

  useEffect(() => {
    if (!siteSettings) return
    setWidgetForm({
      availabilityText: siteSettings.availabilityText || '',
      availabilityTimezone: siteSettings.availabilityTimezone || '',
      focusNote: siteSettings.focusNote || '',
      focusEmoji: siteSettings.focusEmoji || '',
      careerStartYear: String(siteSettings.careerStartYear || ''),
      wallEnabled: siteSettings.wallEnabled ?? true,
      wallTickerDurationSec: String(siteSettings.wallTickerDurationSec || 38),
      wallMaxVisibleEntries: String(siteSettings.wallMaxVisibleEntries || 24),
    })
  }, [siteSettings])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    await updateWidgets({
      adminToken,
      availabilityText: widgetForm.availabilityText,
      availabilityTimezone: widgetForm.availabilityTimezone,
      focusNote: widgetForm.focusNote,
      focusEmoji: widgetForm.focusEmoji,
      careerStartYear: Number(widgetForm.careerStartYear),
      wallEnabled: widgetForm.wallEnabled,
      wallTickerDurationSec: Math.max(
        Number(widgetForm.wallTickerDurationSec) || 38,
        10,
      ),
      wallMaxVisibleEntries: Math.min(
        Math.max(Number(widgetForm.wallMaxVisibleEntries) || 24, 1),
        30,
      ),
    })

    onGlobalMessage('Site widgets updated successfully.')
  }

  return (
    <section className="grid gap-6 lg:grid-cols-[1fr_auto]">
      <form
        className="space-y-4 rounded-2xl border bg-card p-5 sm:p-6"
        onSubmit={handleSubmit}
      >
        <h2 className="text-xl font-semibold tracking-tight">Site widget settings</h2>

        <Input
          placeholder="Availability text"
          value={widgetForm.availabilityText}
          onChange={(event) =>
            setWidgetForm((prev) => ({
              ...prev,
              availabilityText: event.target.value,
            }))
          }
          required
        />

        <Input
          placeholder="Timezone (IANA)"
          value={widgetForm.availabilityTimezone}
          onChange={(event) =>
            setWidgetForm((prev) => ({
              ...prev,
              availabilityTimezone: event.target.value,
            }))
          }
          required
        />

        <Textarea
          placeholder="Focus note"
          value={widgetForm.focusNote}
          onChange={(event) =>
            setWidgetForm((prev) => ({
              ...prev,
              focusNote: event.target.value,
            }))
          }
          required
        />

        <div className="grid gap-3 sm:grid-cols-2">
          <Input
            placeholder="Focus emoji"
            value={widgetForm.focusEmoji}
            onChange={(event) =>
              setWidgetForm((prev) => ({
                ...prev,
                focusEmoji: event.target.value,
              }))
            }
          />
          <Input
            type="number"
            placeholder="Career start year"
            value={widgetForm.careerStartYear}
            onChange={(event) =>
              setWidgetForm((prev) => ({
                ...prev,
                careerStartYear: event.target.value,
              }))
            }
            required
          />
        </div>

        <div className="space-y-3 rounded-xl border p-4">
          <p className="text-sm font-medium">Sign the Wall widget</p>
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              checked={widgetForm.wallEnabled}
              onChange={(event) =>
                setWidgetForm((prev) => ({
                  ...prev,
                  wallEnabled: event.target.checked,
                }))
              }
            />
            Enable public wall
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              type="number"
              placeholder="Ticker duration (seconds)"
              value={widgetForm.wallTickerDurationSec}
              onChange={(event) =>
                setWidgetForm((prev) => ({
                  ...prev,
                  wallTickerDurationSec: event.target.value,
                }))
              }
              min={10}
              required
            />
            <Input
              type="number"
              placeholder="Max visible entries"
              value={widgetForm.wallMaxVisibleEntries}
              onChange={(event) =>
                setWidgetForm((prev) => ({
                  ...prev,
                  wallMaxVisibleEntries: event.target.value,
                }))
              }
              min={1}
              max={30}
              required
            />
          </div>
        </div>

        <Button type="submit">Save widgets</Button>
      </form>

      <aside className="min-w-[260px] space-y-4 rounded-2xl border bg-card p-5 sm:p-6">
        <h3 className="text-lg font-semibold tracking-tight">Setup helpers</h3>
        <p className="text-sm text-muted-foreground">
          Initialize dummy projects, testimonials, and wall entries if your
          tables are empty.
        </p>
        <Button
          variant="outline"
          className="w-full"
          onClick={async () => {
            const result = await seedDummyContent({ adminToken })
            onGlobalMessage(
              `Seed completed: ${result.insertedProjects} projects, ${result.insertedTestimonials} testimonials, ${result.insertedWallEntries} wall entries, settings ${result.insertedSettings ? 'created' : 'already present'}.`,
            )
          }}
        >
          <Database className="h-4 w-4" />
          Seed dummy content
        </Button>
      </aside>
    </section>
  )
}
