'use client'

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'

type Props = {
  children: ReactNode
  index?: number
  as?: keyof React.JSX.IntrinsicElements
  className?: string
  style?: CSSProperties
  /** Delay (ms) added on top of index-based stagger. */
  delay?: number
  /** Stagger step per index (ms). Default 90ms. */
  step?: number
  /** IntersectionObserver rootMargin. */
  rootMargin?: string
}

/**
 * Scroll-reveal component. Wraps children in a div that fades + slides
 * upward when it enters the viewport. Hidden state is applied only after
 * mount so no-JS visitors see content immediately.
 */
export function EditableReveal({
  children,
  index = 0,
  as = 'div',
  className = '',
  style,
  delay = 0,
  step = 90,
  rootMargin = '0px 0px -8% 0px',
}: Props) {
  const Tag = as as any
  const ref = useRef<HTMLDivElement | null>(null)
  const [mounted, setMounted] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setMounted(true)
    const el = ref.current
    if (!el) return
    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true)
      return
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true)
            observer.disconnect()
            break
          }
        }
      },
      { rootMargin, threshold: 0.05 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [rootMargin])

  const revealDelay = mounted ? delay + index * step : 0
  const stateClass = !mounted ? '' : visible ? 'is-visible' : 'is-hidden'

  return (
    <Tag
      ref={ref}
      className={`editable-reveal ${stateClass} ${className}`}
      style={{ ...style, transitionDelay: `${revealDelay}ms` }}
    >
      {children}
    </Tag>
  )
}

export default EditableReveal
