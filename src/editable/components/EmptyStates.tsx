import Link from 'next/link'
import { ArrowRight, SearchX } from 'lucide-react'
import { cn } from '@/lib/utils'

type EmptyStateProps = {
  title?: string
  description?: string
  actionLabel?: string
  actionHref?: string
  className?: string
}

export function EmptyState({
  title = 'Nothing to show yet',
  description = 'New entries land here as soon as they are published. Come back a little later.',
  actionLabel = 'Back to home',
  actionHref = '/',
  className,
}: EmptyStateProps) {
  return (
    <section className={cn('rounded-[10px] border border-[var(--editable-border-soft)] bg-[var(--slot4-glass)] p-12 text-center', className)}>
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--slot4-accent-soft)] text-[var(--slot4-accent)]">
        <SearchX className="h-6 w-6" />
      </div>
      <h2 className="editable-display mt-6 text-2xl font-semibold tracking-[-0.02em] text-[var(--slot4-page-text)]">{title}</h2>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-[1.7] text-[var(--slot4-page-text)]/60">{description}</p>
      <Link
        href={actionHref}
        className="mt-8 inline-flex items-center gap-2 rounded-full border border-[var(--editable-border-soft)] px-6 py-3 text-sm font-semibold text-[var(--slot4-page-text)] transition hover:border-[var(--editable-border-soft)]"
      >
        {actionLabel} <ArrowRight className="h-4 w-4" />
      </Link>
    </section>
  )
}

export function TaskEmptyState({ taskLabel = 'entries', className }: { taskLabel?: string; className?: string }) {
  return (
    <EmptyState
      className={className}
      title={`No ${taskLabel} available yet`}
      description={`Fresh ${taskLabel} appear here automatically. The page layout stays ready — nothing to do on your end.`}
      actionLabel="Explore the library"
      actionHref="/"
    />
  )
}

export function ContactSuccessState({ className }: { className?: string }) {
  return (
    <EmptyState
      className={className}
      title="Message received"
      description="Thanks for reaching out. We've saved it and will get back to you through the channel you provided."
      actionLabel="Back home"
      actionHref="/"
    />
  )
}
