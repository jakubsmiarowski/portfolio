import { useCallback, useEffect, useRef, useState } from 'react'

import { cn } from '@/lib/utils'

export type CardHoverEffectItem = {
  title: string
  emoji?: string
  description: string
}

type HighlightRect = {
  left: number
  top: number
  width: number
  height: number
}

export function CardHoverEffect({
  items,
  className,
  cardClassName,
}: {
  items: CardHoverEffectItem[]
  className?: string
  cardClassName?: string
}) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const cardRefs = useRef<Array<HTMLElement | null>>([])
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [highlightRect, setHighlightRect] = useState<HighlightRect | null>(null)

  const updateHighlightRect = useCallback((index: number) => {
    const container = containerRef.current
    const card = cardRefs.current[index]
    if (!container || !card) {
      return
    }

    const containerRect = container.getBoundingClientRect()
    const cardRect = card.getBoundingClientRect()
    setHighlightRect({
      left: cardRect.left - containerRect.left,
      top: cardRect.top - containerRect.top,
      width: cardRect.width,
      height: cardRect.height,
    })
  }, [])

  useEffect(() => {
    if (hoveredIndex === null) {
      return
    }

    const handleSync = () => updateHighlightRect(hoveredIndex)
    handleSync()
    window.addEventListener('resize', handleSync)

    return () => window.removeEventListener('resize', handleSync)
  }, [hoveredIndex, updateHighlightRect])

  return (
    <div
      ref={containerRef}
      onMouseLeave={() => setHoveredIndex(null)}
      className={cn(
        'relative grid grid-cols-1 gap-4 md:grid-cols-2 md:auto-rows-[19rem]',
        className,
      )}
    >
      <div
        className="pointer-events-none absolute z-0 rounded-2xl border border-foreground/20 bg-gradient-to-br from-sky-500/20 via-indigo-500/10 to-transparent shadow-[0_20px_45px_-28px_rgba(14,165,233,0.55)] transition-all duration-300 ease-out"
        style={{
          opacity: hoveredIndex === null || !highlightRect ? 0 : 1,
          transform: highlightRect
            ? `translate3d(${highlightRect.left}px, ${highlightRect.top}px, 0)`
            : 'translate3d(0, 0, 0)',
          width: highlightRect?.width ?? 0,
          height: highlightRect?.height ?? 0,
        }}
      />

      {items.map((item, index) => (
        <article
          key={`${item.title}-${index}`}
          ref={(node) => {
            cardRefs.current[index] = node
          }}
          onMouseEnter={() => {
            setHoveredIndex(index)
            updateHighlightRect(index)
          }}
          className={cn(
            'relative z-10 h-full rounded-2xl p-px [animation:project-feature-enter_600ms_cubic-bezier(0.22,1,0.36,1)]',
          )}
          style={{ animationDelay: `${index * 70}ms` }}
        >
          <div
            className={cn(
              'relative flex h-full flex-col rounded-[15px] border border-border/75 bg-card/95 p-5 backdrop-blur-[1px]',
              cardClassName,
            )}
          >
            <div className="flex items-center gap-2">
              {item.emoji ? (
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-secondary text-base leading-none">
                  {item.emoji}
                </span>
              ) : null}
              <p className="text-sm font-semibold tracking-tight text-foreground/90">{item.title}</p>
            </div>
            <p className="mt-4 overflow-y-auto pr-1 text-sm leading-relaxed text-muted-foreground sm:text-base">
              {item.description}
            </p>
          </div>
        </article>
      ))}
    </div>
  )
}
