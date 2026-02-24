import { FormEvent, useMemo, useState } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { ArrowDown, ArrowUp } from 'lucide-react'

import { api } from '../../../convex/_generated/api'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import type { Doc, Id } from 'convex/_generated/dataModel'
import type { TestimonialFormState } from './admin-shared'

type AdminTestimonialsTabProps = {
  adminToken: string
  onGlobalMessage: (message: string) => void
}

export function AdminTestimonialsTab({
  adminToken,
  onGlobalMessage,
}: AdminTestimonialsTabProps) {
  const testimonials = useQuery(api.testimonials.adminList, { adminToken })

  const createTestimonial = useMutation(api.testimonials.create)
  const updateTestimonial = useMutation(api.testimonials.update)
  const removeTestimonial = useMutation(api.testimonials.remove)
  const reorderTestimonials = useMutation(api.testimonials.reorder)

  const [testimonialEditingId, setTestimonialEditingId] = useState<
    Id<'testimonials'> | null
  >(null)
  const [testimonialForm, setTestimonialForm] = useState<TestimonialFormState>({
    personName: '',
    personRole: '',
    company: '',
    avatarUrl: '',
    quote: '',
    isPublished: true,
  })

  const testimonialRows = useMemo(() => testimonials ?? [], [testimonials])

  const resetTestimonialForm = () => {
    setTestimonialEditingId(null)
    setTestimonialForm({
      personName: '',
      personRole: '',
      company: '',
      avatarUrl: '',
      quote: '',
      isPublished: true,
    })
  }

  const loadTestimonialToForm = (testimonial: Doc<'testimonials'>) => {
    setTestimonialEditingId(testimonial._id)
    setTestimonialForm({
      personName: testimonial.personName,
      personRole: testimonial.personRole,
      company: testimonial.company,
      avatarUrl: testimonial.avatarUrl || '',
      quote: testimonial.quote,
      isPublished: testimonial.isPublished,
    })
  }

  const submitTestimonialForm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const payload = {
      adminToken,
      personName: testimonialForm.personName.trim(),
      personRole: testimonialForm.personRole.trim(),
      company: testimonialForm.company.trim(),
      avatarUrl: testimonialForm.avatarUrl.trim() || undefined,
      quote: testimonialForm.quote.trim(),
      isPublished: testimonialForm.isPublished,
    }

    try {
      if (testimonialEditingId) {
        await updateTestimonial({
          ...payload,
          id: testimonialEditingId,
        })
        onGlobalMessage('Testimonial updated successfully.')
      } else {
        await createTestimonial(payload)
        onGlobalMessage('Testimonial created successfully.')
      }
      resetTestimonialForm()
    } catch (error) {
      onGlobalMessage(
        error instanceof Error ? error.message : 'Testimonial action failed.',
      )
    }
  }

  const moveTestimonial = async (index: number, direction: -1 | 1) => {
    if (!testimonialRows.length) return

    const target = index + direction
    if (target < 0 || target >= testimonialRows.length) return

    const next = [...testimonialRows]
    const [item] = next.splice(index, 1)
    next.splice(target, 0, item)

    await reorderTestimonials({
      adminToken,
      items: next.map((row, idx) => ({
        id: row._id,
        order: idx + 1,
      })),
    })
  }

  return (
    <section className="grid gap-6 lg:grid-cols-[1fr_1fr]">
      <form
        onSubmit={submitTestimonialForm}
        className="space-y-4 rounded-2xl border bg-card p-5 sm:p-6"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold tracking-tight">
            {testimonialEditingId ? 'Edit testimonial' : 'Create testimonial'}
          </h2>
          {testimonialEditingId ? (
            <Button variant="ghost" type="button" onClick={resetTestimonialForm}>
              Cancel edit
            </Button>
          ) : null}
        </div>

        <Input
          placeholder="Name"
          value={testimonialForm.personName}
          onChange={(event) =>
            setTestimonialForm((prev) => ({
              ...prev,
              personName: event.target.value,
            }))
          }
          required
        />

        <div className="grid gap-3 sm:grid-cols-2">
          <Input
            placeholder="Role"
            value={testimonialForm.personRole}
            onChange={(event) =>
              setTestimonialForm((prev) => ({
                ...prev,
                personRole: event.target.value,
              }))
            }
            required
          />
          <Input
            placeholder="Company"
            value={testimonialForm.company}
            onChange={(event) =>
              setTestimonialForm((prev) => ({
                ...prev,
                company: event.target.value,
              }))
            }
            required
          />
        </div>

        <Input
          placeholder="Avatar URL"
          value={testimonialForm.avatarUrl}
          onChange={(event) =>
            setTestimonialForm((prev) => ({
              ...prev,
              avatarUrl: event.target.value,
            }))
          }
        />
        <p className="text-xs text-muted-foreground">
          Shortcut: <code>/pg</code> resolves to <code>/pictures/pg.jpeg</code>.
        </p>

        <Textarea
          placeholder="Quote"
          className="min-h-32"
          value={testimonialForm.quote}
          onChange={(event) =>
            setTestimonialForm((prev) => ({
              ...prev,
              quote: event.target.value,
            }))
          }
          required
        />

        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <input
            type="checkbox"
            checked={testimonialForm.isPublished}
            onChange={(event) =>
              setTestimonialForm((prev) => ({
                ...prev,
                isPublished: event.target.checked,
              }))
            }
          />
          Published
        </label>

        <Button type="submit" className="w-full">
          {testimonialEditingId ? 'Update testimonial' : 'Create testimonial'}
        </Button>
      </form>

      <div className="rounded-2xl border bg-card p-5 sm:p-6">
        <h3 className="text-lg font-semibold tracking-tight">Current testimonials</h3>
        <div className="mt-4 space-y-3">
          {testimonialRows.map((item, index) => (
            <div key={item._id} className="space-y-2 rounded-xl border p-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium">{item.personName}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.personRole} @ {item.company}
                  </p>
                </div>
                <Badge variant={item.isPublished ? 'default' : 'secondary'}>
                  {item.isPublished ? 'published' : 'hidden'}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => loadTestimonialToForm(item)}
                >
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    updateTestimonial({
                      adminToken,
                      id: item._id,
                      isPublished: !item.isPublished,
                    })
                  }
                >
                  Toggle status
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => moveTestimonial(index, -1)}
                >
                  <ArrowUp className="h-3 w-3" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => moveTestimonial(index, 1)}
                >
                  <ArrowDown className="h-3 w-3" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeTestimonial({ adminToken, id: item._id })}
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
