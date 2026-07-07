'use client'

import { BookOpen, Layers, Mail, Sparkles } from 'lucide-react'
import { pagesContent } from '@/editable/content/pages.content'
import { EditableContactLeadForm } from '@/editable/components/EditableContactLeadForm'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { EditableReveal } from '@/editable/shell/EditableReveal'

const lanes = [
  { icon: BookOpen, title: 'Reading & discovery', body: 'Trouble finding a specific reference? We can point you to the right entry, or add it if it should be there.' },
  { icon: Layers, title: 'Contributions', body: 'Have material worth adding to the reference library? Share it and we will consider it for inclusion.' },
  { icon: Sparkles, title: 'Editorial', body: 'Feedback, corrections, or questions about how something is categorized — all welcome.' },
  { icon: Mail, title: 'Everything else', body: 'General questions, partnerships, or just want to say hello — the same form works.' },
]

export default function ContactPage() {
  return (
    <EditableSiteShell>
      <main className="min-h-screen bg-[var(--slot4-page-bg)] text-[var(--slot4-page-text)]">
        <section className="mx-auto max-w-[var(--editable-container)] px-6 py-24 sm:py-28 lg:px-14 lg:py-40">
          <div className="grid gap-16 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
            <div>
              <EditableReveal index={0}>
                <p className="editable-mono text-[11px] font-medium uppercase tracking-[0.28em] text-[var(--slot4-accent)]">
                  {pagesContent.contact.eyebrow}
                </p>
              </EditableReveal>
              <EditableReveal index={1}>
                <h1 className="editable-display mt-6 text-[2.75rem] font-semibold leading-[1.04] tracking-[-0.035em] sm:text-[3.5rem] lg:text-[4rem]">
                  {pagesContent.contact.title}
                </h1>
              </EditableReveal>
              <EditableReveal index={2}>
                <p className="mt-8 max-w-xl text-lg leading-[1.65] text-[var(--slot4-page-text)]/65">{pagesContent.contact.description}</p>
              </EditableReveal>

              <div className="mt-12 grid gap-4">
                {lanes.map((lane, i) => (
                  <EditableReveal key={lane.title} index={i + 3}>
                    <div className="rounded-[10px] border border-[var(--editable-border-soft)] bg-[var(--slot4-glass)] p-6 transition duration-500 hover:border-[var(--editable-border-soft)]">
                      <lane.icon className="h-5 w-5 text-[var(--slot4-accent)]" />
                      <h2 className="editable-display mt-4 text-lg font-semibold tracking-[-0.015em] text-[var(--slot4-page-text)]">{lane.title}</h2>
                      <p className="mt-2 text-sm leading-[1.7] text-[var(--slot4-page-text)]/60">{lane.body}</p>
                    </div>
                  </EditableReveal>
                ))}
              </div>
            </div>

            <EditableReveal index={2}>
              <div className="rounded-[10px] border border-[var(--editable-border-soft)] bg-[var(--slot4-glass)] p-8 sm:p-10 lg:sticky lg:top-24">
                <h2 className="editable-display text-2xl font-semibold tracking-[-0.02em] text-[var(--slot4-page-text)]">{pagesContent.contact.formTitle}</h2>
                <div className="mt-6">
                  <EditableContactLeadForm />
                </div>
              </div>
            </EditableReveal>
          </div>
        </section>
      </main>
    </EditableSiteShell>
  )
}
