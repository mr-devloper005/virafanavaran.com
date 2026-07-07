'use client'

import { FormEvent, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, CheckCircle2, FileText, Lock, Send } from 'lucide-react'
import { SITE_CONFIG, type TaskKey } from '@/lib/site-config'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { useEditableLocalAuthSession } from '@/editable/components/EditableLocalAuthForms'
import { pagesContent } from '@/editable/content/pages.content'
import { getTaskTheme } from '@/editable/theme/task-themes'

type DraftPost = {
  id: string
  task: TaskKey
  title: string
  category: string
  summary: string
  url: string
  image: string
  body: string
  createdAt: string
}

const STORE_KEY = 'slot4:created-posts'

const inputBase =
  'w-full rounded-[10px] border border-[var(--editable-border-soft)] bg-[var(--slot4-dark-bg)]/40 px-5 py-3.5 text-sm font-medium text-[var(--slot4-page-text)] outline-none transition placeholder:text-[var(--slot4-page-text)]/35 focus:border-[var(--editable-border-soft)]'

const saveDraft = (draft: DraftPost) => {
  try {
    const existing = JSON.parse(window.localStorage.getItem(STORE_KEY) || '[]')
    const list = Array.isArray(existing) ? existing : []
    window.localStorage.setItem(STORE_KEY, JSON.stringify([draft, ...list].slice(0, 50)))
  } catch {
    window.localStorage.setItem(STORE_KEY, JSON.stringify([draft]))
  }
}

export default function CreatePage() {
  const { session } = useEditableLocalAuthSession()

  // Public Create UI centers on the Reference Library. The task selector
  // exposes only non-profile enabled tasks; profiles are never promoted
  // as a creatable public destination.
  const publicTasks = useMemo(
    () => SITE_CONFIG.tasks.filter((task) => task.enabled && task.key !== 'profile'),
    []
  )
  const initialTask: TaskKey = ((publicTasks.find((t) => t.key === 'pdf') || publicTasks[0])?.key || 'article') as TaskKey
  const [task, setTask] = useState<TaskKey>(initialTask)
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [summary, setSummary] = useState('')
  const [url, setUrl] = useState('')
  const [image, setImage] = useState('')
  const [body, setBody] = useState('')
  const [created, setCreated] = useState<DraftPost | null>(null)

  const activeLabel = getTaskTheme(task).kicker

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const draft: DraftPost = {
      id: `draft-${Date.now()}`,
      task,
      title: title.trim(),
      category: category.trim() || 'uncategorized',
      summary: summary.trim(),
      url: url.trim(),
      image: image.trim(),
      body: body.trim(),
      createdAt: new Date().toISOString(),
    }
    saveDraft(draft)
    setCreated(draft)
    setTitle('')
    setCategory('')
    setSummary('')
    setUrl('')
    setImage('')
    setBody('')
  }

  if (!session) {
    return (
      <EditableSiteShell>
        <main className="min-h-screen bg-[var(--slot4-page-bg)] px-6 py-24 text-[var(--slot4-page-text)] sm:py-32 lg:px-14 lg:py-40">
          <section className="mx-auto grid max-w-5xl gap-10 rounded-[10px] border border-[var(--editable-border-soft)] bg-[var(--slot4-glass)] p-10 md:grid-cols-[0.9fr_1.1fr] md:p-14">
            <div className="flex h-full min-h-72 items-center justify-center rounded-[10px] bg-[var(--slot4-dark-bg)]/60">
              <Lock className="h-16 w-16 text-[var(--slot4-page-text)]/40" />
            </div>
            <div className="self-center">
              <p className="editable-mono text-[11px] font-medium uppercase tracking-[0.28em] text-[var(--slot4-accent)]">
                {pagesContent.create.locked.badge}
              </p>
              <h1 className="editable-display mt-6 text-[2.5rem] font-semibold leading-[1.04] tracking-[-0.035em] sm:text-[3.5rem]">
                {pagesContent.create.locked.title}
              </h1>
              <p className="mt-6 max-w-xl text-base leading-[1.7] text-[var(--slot4-page-text)]/65">{pagesContent.create.locked.description}</p>
              <div className="mt-10 flex flex-wrap gap-3">
                <Link href="/login" className="inline-flex items-center gap-2 rounded-full bg-[var(--slot4-accent)] px-6 py-3.5 text-sm font-semibold text-[var(--slot4-page-text)] transition hover:brightness-110">
                  Sign in <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/signup" className="inline-flex items-center gap-2 rounded-full border border-[var(--editable-border-soft)] px-6 py-3.5 text-sm font-semibold text-[var(--slot4-page-text)] transition hover:border-[var(--editable-border-soft)]">
                  Get started
                </Link>
              </div>
            </div>
          </section>
        </main>
      </EditableSiteShell>
    )
  }

  return (
    <EditableSiteShell>
      <main className="min-h-screen bg-[var(--slot4-page-bg)] text-[var(--slot4-page-text)]">
        <section className="mx-auto max-w-[var(--editable-container)] px-6 py-16 sm:py-24 lg:px-14 lg:py-32">
          <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
            <aside>
              <p className="editable-mono text-[11px] font-medium uppercase tracking-[0.28em] text-[var(--slot4-accent)]">
                {pagesContent.create.hero.badge}
              </p>
              <h1 className="editable-display mt-6 text-[2.5rem] font-semibold leading-[1.04] tracking-[-0.035em] sm:text-[3.25rem]">
                Submit a resource
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-[1.65] text-[var(--slot4-page-text)]/65">
                {pagesContent.create.hero.description}
              </p>

              <div className="mt-10 grid gap-3">
                {publicTasks.map((item) => {
                  const active = item.key === task
                  const kicker = getTaskTheme(item.key).kicker
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setTask(item.key)}
                      className={`flex items-start gap-4 rounded-[10px] border p-5 text-left transition duration-300 ${
                        active
                          ? 'border-[var(--slot4-accent)]/60 bg-[var(--slot4-accent-soft)]'
                          : 'border-[var(--editable-border-soft)] bg-[var(--slot4-glass)] hover:border-[var(--editable-border-soft)]'
                      }`}
                    >
                      <span className={`mt-0.5 flex h-9 w-9 items-center justify-center rounded-full ${active ? 'bg-[var(--slot4-accent)] text-[var(--slot4-page-text)]' : 'bg-[var(--slot4-glass)] text-[var(--slot4-page-text)]/70'}`}>
                        <FileText className="h-4 w-4" />
                      </span>
                      <div>
                        <span className="block text-sm font-semibold text-[var(--slot4-page-text)]">{kicker}</span>
                        <span className="mt-1 block text-xs text-[var(--slot4-page-text)]/55">{item.description}</span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </aside>

            <form onSubmit={submit} className="rounded-[10px] border border-[var(--editable-border-soft)] bg-[var(--slot4-glass)] p-8 sm:p-10">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="editable-mono text-[10px] font-medium uppercase tracking-[0.28em] text-[var(--slot4-page-text)]/50">
                    New {activeLabel.toLowerCase()} entry
                  </p>
                  <h2 className="editable-display mt-2 text-2xl font-semibold tracking-[-0.02em]">{pagesContent.create.formTitle}</h2>
                </div>
                <span className="editable-mono rounded-full border border-[var(--editable-border-soft)] px-4 py-1.5 text-[10px] font-medium uppercase tracking-[0.24em] text-[var(--slot4-page-text)]/70">
                  {session.name}
                </span>
              </div>

              <div className="mt-8 grid gap-4">
                <input className={inputBase} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Entry title" required />
                <div className="grid gap-4 sm:grid-cols-2">
                  <input className={inputBase} value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Category" />
                  <input className={inputBase} value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Source or file URL" />
                </div>
                <input className={inputBase} value={image} onChange={(e) => setImage(e.target.value)} placeholder="Cover image URL (optional)" />
                <textarea className={`${inputBase} min-h-28`} value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="Short summary" required />
                <textarea className={`${inputBase} min-h-56`} value={body} onChange={(e) => setBody(e.target.value)} placeholder="Full content, notes, or description" required />
              </div>

              {created ? (
                <div className="mt-6 flex items-start gap-3 rounded-[10px] border border-emerald-400/30 bg-emerald-500/10 p-5 text-emerald-100">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold">{pagesContent.create.successTitle}</p>
                    <p className="mt-1 text-sm opacity-80">{created.title}</p>
                  </div>
                </div>
              ) : null}

              <button type="submit" className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[var(--slot4-accent)] px-6 text-sm font-semibold text-[var(--slot4-page-text)] transition duration-300 hover:brightness-110 hover:-translate-y-0.5">
                <Send className="h-4 w-4" /> {pagesContent.create.submitLabel}
              </button>
            </form>
          </div>
        </section>
      </main>
    </EditableSiteShell>
  )
}
