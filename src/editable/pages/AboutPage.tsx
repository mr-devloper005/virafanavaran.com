import Link from 'next/link'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { SITE_CONFIG } from '@/lib/site-config'
import { pagesContent } from '@/editable/content/pages.content'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { EditableReveal } from '@/editable/shell/EditableReveal'

export default function AboutPage() {
  return (
    <EditableSiteShell>
      <main className="min-h-screen bg-[var(--slot4-page-bg)] text-[var(--slot4-page-text)]">
        <section className="mx-auto max-w-[var(--editable-container)] px-6 py-24 sm:py-28 lg:px-14 lg:py-40">
          <EditableReveal index={0}>
            <p className="editable-mono text-[11px] font-medium uppercase tracking-[0.28em] text-[var(--slot4-accent)]">
              {pagesContent.about.badge}
            </p>
          </EditableReveal>
          <EditableReveal index={1}>
            <h1 className="editable-display mt-6 text-balance text-[3rem] font-semibold leading-[1.02] tracking-[-0.035em] sm:text-[4rem] lg:text-[4.75rem]">
              About {SITE_CONFIG.name}
            </h1>
          </EditableReveal>
          <EditableReveal index={2}>
            <p className="mt-10 max-w-3xl text-[1.25rem] leading-[1.6] text-[var(--slot4-page-text)]/75">
              {pagesContent.about.description}
            </p>
          </EditableReveal>

          <div className="mt-20 grid gap-14 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="max-w-2xl space-y-6 text-base leading-[1.8] text-[var(--slot4-page-text)]/70">
              {pagesContent.about.paragraphs.map((paragraph, i) => (
                <EditableReveal key={paragraph} index={i + 3}>
                  <p>{paragraph}</p>
                </EditableReveal>
              ))}
              <EditableReveal index={pagesContent.about.paragraphs.length + 3}>
                <Link
                  href="/contact"
                  className="mt-6 inline-flex items-center gap-2 rounded-full bg-[var(--slot4-accent)] px-6 py-3.5 text-sm font-semibold text-[var(--slot4-page-text)] transition duration-300 hover:brightness-110 hover:-translate-y-0.5"
                >
                  Reach out <ArrowRight className="h-4 w-4" />
                </Link>
              </EditableReveal>
            </div>

            <div className="space-y-4">
              {pagesContent.about.values.map((value, i) => (
                <EditableReveal key={value.title} index={i + 3}>
                  <div className="rounded-[10px] border border-[var(--editable-border-soft)] bg-[var(--slot4-glass)] p-7">
                    <div className="flex items-start gap-4">
                      <span className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--slot4-accent-soft)] text-[var(--slot4-accent)]">
                        <CheckCircle2 className="h-4 w-4" />
                      </span>
                      <div>
                        <h2 className="editable-display text-lg font-semibold tracking-[-0.015em] text-[var(--slot4-page-text)]">{value.title}</h2>
                        <p className="mt-3 text-sm leading-[1.7] text-[var(--slot4-page-text)]/60">{value.description}</p>
                      </div>
                    </div>
                  </div>
                </EditableReveal>
              ))}
            </div>
          </div>
        </section>
      </main>
    </EditableSiteShell>
  )
}
