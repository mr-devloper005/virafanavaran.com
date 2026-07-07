import Link from 'next/link'
import { ArrowRight, ArrowUpRight, BookOpen, CheckCircle2, Download, FileText, Filter, Layers, Search, Sparkles } from 'lucide-react'
import type { SitePost } from '@/lib/site-connector'
import type { HomeTimeSection } from '@/lib/task-data'
import type { TaskKey } from '@/lib/site-config'
import { getTaskConfig } from '@/lib/site-config'
import { pagesContent } from '@/editable/content/pages.content'
import { getEditablePostImage, getEditableExcerpt, postHref } from '@/editable/cards/PostCards'
import { getTaskTheme } from '@/editable/theme/task-themes'
import { EditableReveal } from '@/editable/shell/EditableReveal'
import { EditableHeroCollage } from '@/editable/sections/EditableHeroCollage'

type HomeSectionProps = {
  primaryTask: TaskKey
  primaryRoute: string
  posts: SitePost[]
  timeSections: HomeTimeSection[]
}

const container = 'mx-auto w-full max-w-[var(--editable-container)] px-5 sm:px-8 lg:px-14'

function categoryOf(post?: SitePost | null) {
  const content = post?.content && typeof post.content === 'object' ? (post.content as Record<string, unknown>) : {}
  return (typeof content.category === 'string' && content.category) || post?.tags?.[0] || ''
}

function dedupePosts(posts: SitePost[]) {
  const seen = new Set<string>()
  const out: SitePost[] = []
  for (const post of posts) {
    const key = post.slug || post.id || post.title
    if (!key || seen.has(key)) continue
    seen.add(key)
    out.push(post)
  }
  return out
}

function latestPostImages(posts: SitePost[], max = 6) {
  const seen = new Set<string>()
  const out: string[] = []
  for (const post of posts) {
    const img = getEditablePostImage(post)
    if (!img || img.includes('placeholder') || seen.has(img)) continue
    seen.add(img)
    out.push(img)
    if (out.length >= max) break
  }
  return out
}

// The public feed is centered on the reference library. `pdf` is always the
// public destination — profile items never surface.
function libraryLabel() {
  return getTaskTheme('pdf').kicker
}

/* ============================== HERO ============================== */
export function EditableHomeHero({ primaryTask, primaryRoute, posts, timeSections }: HomeSectionProps) {
  const pool = dedupePosts([...posts, ...timeSections.flatMap((section) => section.posts)])
  const heroImages = latestPostImages(pool)
  const label = libraryLabel()
  const heroTitle = pagesContent.home.hero.title?.join(' ') || `Reference material, without the noise.`
  const description = pagesContent.home.hero.description || `A curated ${label.toLowerCase()} — searchable, downloadable, and calmly organized.`

  return (
    <section className="on-dark relative overflow-hidden border-b border-[var(--editable-border-soft)] bg-[var(--slot4-dark-bg)]">
      <div className="absolute inset-0 opacity-95">
        <EditableHeroCollage images={heroImages} />
      </div>
      {/* Left-side gradient panel so hero text stays readable while images breathe on the right */}
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(13,83,14,0.82)_0%,rgba(13,83,14,0.65)_35%,rgba(13,83,14,0.15)_75%,rgba(13,83,14,0.05)_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_0%,transparent_65%,rgba(13,83,14,0.35)_100%)]" />

      <div className={`relative ${container} pt-24 pb-24 sm:pt-32 sm:pb-28 lg:pt-40 lg:pb-40`}>
        <EditableReveal index={0}>
          <div className="inline-flex items-center gap-2.5 rounded-full border border-[var(--editable-border-soft)] bg-[var(--slot4-glass)] px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.28em] text-[var(--slot4-page-text)]/80 backdrop-blur-md">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--slot4-accent)]" />
            <span>{pagesContent.home.hero.badge || `Independent ${label.toLowerCase()}`}</span>
          </div>
        </EditableReveal>

        <EditableReveal index={1}>
          <h1 className="editable-display mt-8 max-w-[18ch] text-balance text-[2.75rem] font-semibold leading-[1.02] tracking-[-0.035em] text-[var(--slot4-page-text)] sm:text-[4rem] lg:text-[4.375rem]">
            {heroTitle}
          </h1>
        </EditableReveal>

        <EditableReveal index={2}>
          <p className="mt-8 max-w-xl text-lg leading-[1.6] text-[var(--slot4-page-text)]/75 sm:text-[1.15rem]">
            {description}
          </p>
        </EditableReveal>

        <EditableReveal index={3}>
          <div className="mt-12 flex flex-wrap items-center gap-4">
            <Link
              href={primaryRoute}
              className="inline-flex items-center gap-2 rounded-full bg-[var(--slot4-accent)] px-7 py-4 text-sm font-semibold text-[var(--slot4-page-text)] transition duration-500 hover:brightness-110 hover:-translate-y-0.5"
            >
              Enter the {label.toLowerCase()} <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/search"
              className="inline-flex items-center gap-2 rounded-full border border-[var(--editable-border-soft)] bg-[var(--slot4-glass)] px-7 py-4 text-sm font-semibold text-[var(--slot4-page-text)] transition duration-500 hover:border-[var(--editable-border-soft)] hover:bg-[var(--slot4-glass)]"
            >
              <Search className="h-4 w-4" /> Search resources
            </Link>
          </div>
        </EditableReveal>

        <EditableReveal index={4}>
          <div className="mt-16 flex flex-wrap items-center gap-x-10 gap-y-4 text-sm text-[var(--slot4-page-text)]/55">
            <span className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-[var(--slot4-accent)]" /> Free to read</span>
            <span className="inline-flex items-center gap-2"><Download className="h-4 w-4 text-[var(--slot4-accent)]" /> Every entry downloadable</span>
            <span className="inline-flex items-center gap-2"><Layers className="h-4 w-4 text-[var(--slot4-accent)]" /> Categorized, filtered, indexed</span>
          </div>
        </EditableReveal>
      </div>
    </section>
  )
}

/* ============================== FEATURE SHOWCASE (was StoryRail) ==================== */
export function EditableStoryRail({ primaryTask: _primaryTask, primaryRoute, posts }: HomeSectionProps) {
  const primaryTask = _primaryTask
  const featured = dedupePosts(posts).slice(0, 3)
  if (!featured.length) return null
  const label = libraryLabel()
  return (
    <section className="border-b border-[var(--editable-border-soft)] bg-[var(--slot4-page-bg)]">
      <div className={`${container} py-24 sm:py-28 lg:py-32`}>
        <EditableReveal index={0}>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-xl">
              <p className="editable-mono text-[11px] font-medium uppercase tracking-[0.28em] text-[var(--slot4-accent)]">
                Featured entries
              </p>
              <h2 className="editable-display mt-4 text-[2.25rem] font-semibold leading-[1.08] tracking-[-0.025em] sm:text-[2.75rem] lg:text-[3.25rem]">
                Recent additions to the {label.toLowerCase()}.
              </h2>
            </div>
            <Link
              href={primaryRoute}
              className="inline-flex items-center gap-2 self-start rounded-full border border-[var(--editable-border-soft)] px-5 py-2.5 text-sm font-semibold text-[var(--slot4-page-text)] transition duration-300 hover:border-[var(--editable-border-soft)] sm:self-end"
            >
              Browse all <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </EditableReveal>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {featured.map((post, i) => (
            <EditableReveal key={post.id || post.slug} index={i + 1}>
              <FeatureTile post={post} href={postHref(primaryTask, post, primaryRoute)} index={i} />
            </EditableReveal>
          ))}
        </div>
      </div>
    </section>
  )
}

function FeatureTile({ post, href, index }: { post: SitePost; href: string; index: number }) {
  const image = getEditablePostImage(post)
  return (
    <Link
      href={href}
      className="group relative flex min-h-[440px] flex-col overflow-hidden rounded-[10px] border border-[var(--editable-border-soft)] bg-[var(--slot4-panel-bg)] transition duration-500 hover:-translate-y-1 hover:border-[var(--editable-border-soft)]"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img src={image} alt={post.title} className="absolute inset-0 h-full w-full object-cover opacity-90 transition duration-700 group-hover:scale-[1.05]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_40%,rgba(0,0,0,0.65))]" />
        <span className="absolute left-4 top-4 editable-mono rounded-full bg-[var(--slot4-dark-bg)]/60 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.28em] text-[var(--slot4-page-text)] backdrop-blur-md">
          {String(index + 1).padStart(2, '0')} · {categoryOf(post) || 'Entry'}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-7">
        <h3 className="editable-display line-clamp-3 text-[1.5rem] font-semibold leading-[1.15] tracking-[-0.015em] text-[var(--slot4-page-text)]">
          {post.title}
        </h3>
        <p className="mt-4 line-clamp-3 flex-1 text-sm leading-[1.7] text-[var(--slot4-page-text)]/60">
          {getEditableExcerpt(post, 150)}
        </p>
        <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[var(--slot4-page-text)] transition group-hover:text-[var(--slot4-accent)]">
          Read entry <ArrowUpRight className="h-4 w-4" />
        </span>
      </div>
    </Link>
  )
}

/* ============================== STATS BAND (was MagazineSplit) ==================== */
export function EditableMagazineSplit({ posts, timeSections }: HomeSectionProps) {
  const all = dedupePosts([...posts, ...timeSections.flatMap((section) => section.posts)])
  const categoryCount = new Set(all.map((p) => categoryOf(p)).filter(Boolean)).size

  const stats: Array<{ value: string; label: string; note: string }> = [
    { value: String(all.length).padStart(2, '0'), label: 'Entries', note: 'and growing' },
    { value: String(Math.max(categoryCount, 1)), label: 'Categories', note: 'curated by hand' },
    { value: '100%', label: 'Free access', note: 'no paywalls, no accounts' },
    { value: '24/7', label: 'Availability', note: 'read or download anytime' },
  ]

  return (
    <section className="border-b border-[var(--editable-border-soft)] bg-[var(--slot4-warm)]">
      <div className={`${container} py-24 sm:py-28 lg:py-32`}>
        <EditableReveal index={0}>
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div>
              <p className="editable-mono text-[11px] font-medium uppercase tracking-[0.28em] text-[var(--slot4-accent)]">By the numbers</p>
              <h2 className="editable-display mt-4 text-[2.25rem] font-semibold leading-[1.08] tracking-[-0.025em] sm:text-[2.75rem] lg:text-[3.25rem]">
                A quiet library built to actually be used.
              </h2>
            </div>
            <p className="text-lg leading-[1.7] text-[var(--slot4-page-text)]/60 lg:pb-3">
              Everything below is derived from what's actually in the library right now — no vanity metrics, no dressed-up numbers.
            </p>
          </div>
        </EditableReveal>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <EditableReveal key={stat.label} index={i + 1}>
              <div className="rounded-[10px] border border-[var(--editable-border-soft)] bg-[var(--slot4-panel-bg)] p-8">
                <p className="editable-display text-[3.5rem] font-semibold leading-none tracking-[-0.035em] text-[var(--slot4-page-text)]">
                  {stat.value}
                </p>
                <p className="mt-6 text-sm font-semibold text-[var(--slot4-page-text)]">{stat.label}</p>
                <p className="mt-1 text-sm text-[var(--slot4-page-text)]/50">{stat.note}</p>
              </div>
            </EditableReveal>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ============================== PROCESS STEPS (was TimeCollections' intro) ==================== */
function ProcessSteps() {
  const label = libraryLabel()
  const steps = [
    { icon: Search, title: 'Search or browse', body: `Start from a keyword, or open the ${label.toLowerCase()} and scan by category.` },
    { icon: Filter, title: 'Filter what you need', body: 'Every entry is tagged with category and format. Narrow down without friction.' },
    { icon: BookOpen, title: 'Read or download', body: 'Open the preview inline, or grab the file to keep for later. No signup wall.' },
  ]
  return (
    <section className="border-b border-[var(--editable-border-soft)] bg-[var(--slot4-page-bg)]">
      <div className={`${container} py-24 sm:py-28 lg:py-32`}>
        <EditableReveal index={0}>
          <div className="max-w-2xl">
            <p className="editable-mono text-[11px] font-medium uppercase tracking-[0.28em] text-[var(--slot4-accent)]">How it works</p>
            <h2 className="editable-display mt-4 text-[2.25rem] font-semibold leading-[1.08] tracking-[-0.025em] sm:text-[2.75rem] lg:text-[3.25rem]">
              Three steps between you and what you're looking for.
            </h2>
          </div>
        </EditableReveal>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {steps.map((step, i) => {
            const Icon = step.icon
            return (
              <EditableReveal key={step.title} index={i + 1}>
                <div className="group relative flex h-full flex-col rounded-[10px] border border-[var(--editable-border-soft)] bg-[var(--slot4-panel-bg)] p-8 transition duration-500 hover:border-[var(--editable-border-soft)]">
                  <span className="editable-mono text-[10px] font-medium uppercase tracking-[0.28em] text-[var(--slot4-page-text)]/40">
                    Step {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="mt-6 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--slot4-accent-soft)] text-[var(--slot4-accent)]">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="editable-display mt-6 text-xl font-semibold tracking-[-0.015em] text-[var(--slot4-page-text)]">{step.title}</h3>
                  <p className="mt-3 text-sm leading-[1.7] text-[var(--slot4-page-text)]/60">{step.body}</p>
                </div>
              </EditableReveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}

/* ============================== FEATURED COLLECTIONS (was TimeCollections) ==================== */
const sectionCopy: Record<string, { eyebrow: string; title: string }> = {
  spotlight: { eyebrow: 'Fresh this week', title: 'Added in the last 7 days' },
  browse: { eyebrow: 'Popular now', title: 'Currently trending' },
  index: { eyebrow: 'Evergreen', title: 'From the archive' },
}

function CollectionTile({ post, href }: { post: SitePost; href: string }) {
  const image = getEditablePostImage(post)
  const cat = categoryOf(post)
  return (
    <Link
      href={href}
      className="group flex flex-col overflow-hidden rounded-[10px] border border-[var(--editable-border-soft)] bg-[var(--slot4-panel-bg)] transition duration-500 hover:-translate-y-1 hover:border-[var(--editable-border-soft)]"
    >
      <div className="relative aspect-[16/11] overflow-hidden bg-[var(--slot4-media-bg)]">
        <img src={image} alt={post.title} className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.05]" loading="lazy" />
        {cat ? (
          <span className="absolute left-4 top-4 editable-mono rounded-full bg-[var(--slot4-dark-bg)]/60 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.28em] text-[var(--slot4-page-text)] backdrop-blur-md">
            {cat}
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col p-6">
        <h3 className="editable-display line-clamp-3 text-[1.2rem] font-semibold leading-tight tracking-[-0.015em] text-[var(--slot4-page-text)] group-hover:text-[var(--slot4-accent)]">
          {post.title}
        </h3>
        <p className="mt-3 line-clamp-3 flex-1 text-sm leading-[1.65] text-[var(--slot4-page-text)]/55">{getEditableExcerpt(post, 130)}</p>
        <span className="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-[var(--slot4-page-text)]/85">
          Open <ArrowUpRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </Link>
  )
}

export function EditableTimeCollections({ primaryTask, primaryRoute, posts, timeSections }: HomeSectionProps) {
  const sections =
    timeSections.length > 0
      ? timeSections
      : ([
          { key: 'spotlight', posts: posts.slice(0, 8), href: primaryRoute },
          { key: 'browse', posts: posts.slice(8, 16), href: primaryRoute },
          { key: 'index', posts: posts.slice(16, 24), href: primaryRoute },
        ] as Pick<HomeTimeSection, 'key' | 'posts' | 'href'>[])

  const visible = sections.filter((s) => s.posts.length)
  if (!visible.length) return null

  return (
    <>
      <ProcessSteps />
      {visible.map((section, sectionIndex) => {
        const copy = sectionCopy[section.key] || { eyebrow: 'Discover', title: 'More entries' }
        return (
          <section
            key={section.key}
            className={`border-b border-[var(--editable-border-soft)] ${sectionIndex % 2 === 0 ? 'bg-[var(--slot4-warm)]' : 'bg-[var(--slot4-page-bg)]'}`}
          >
            <div className={`${container} py-24 sm:py-28`}>
              <EditableReveal index={0}>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="editable-mono text-[11px] font-medium uppercase tracking-[0.28em] text-[var(--slot4-accent)]">
                      {copy.eyebrow}
                    </p>
                    <h2 className="editable-display mt-3 text-[1.75rem] font-semibold leading-[1.15] tracking-[-0.02em] sm:text-[2.25rem] lg:text-[2.75rem]">
                      {copy.title}
                    </h2>
                  </div>
                  <Link
                    href={section.href || primaryRoute}
                    className="inline-flex items-center gap-2 self-start rounded-full border border-[var(--editable-border-soft)] px-5 py-2.5 text-sm font-semibold text-[var(--slot4-page-text)] transition duration-300 hover:border-[var(--editable-border-soft)] sm:self-end"
                  >
                    Browse all <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </div>
              </EditableReveal>

              <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {section.posts.slice(0, 8).map((post, i) => (
                  <EditableReveal key={post.id || post.slug} index={i + 1}>
                    <CollectionTile post={post} href={postHref(primaryTask, post, primaryRoute)} />
                  </EditableReveal>
                ))}
              </div>
            </div>
          </section>
        )
      })}
      <QuoteBand />
      <FaqBand />
    </>
  )
}

/* ============================== QUOTE BAND ==================== */
function QuoteBand() {
  const label = libraryLabel()
  return (
    <section className="on-dark border-b border-[var(--editable-border-soft)] bg-[var(--slot4-dark-bg)]">
      <div className={`${container} py-24 sm:py-32 lg:py-40`}>
        <EditableReveal index={0}>
          <div className="mx-auto max-w-4xl text-center">
            <Sparkles className="mx-auto h-6 w-6 text-[var(--slot4-accent)]" />
            <blockquote className="editable-display mt-8 text-balance text-[2rem] font-medium leading-[1.2] tracking-[-0.025em] text-[var(--slot4-page-text)] sm:text-[2.75rem] lg:text-[3.5rem]">
              “The best reference is the one you can actually get to. This {label.toLowerCase()} is built around that idea.”
            </blockquote>
            <p className="mt-10 text-sm font-medium uppercase tracking-[0.24em] text-[var(--slot4-page-text)]/50">Editorial notes</p>
          </div>
        </EditableReveal>
      </div>
    </section>
  )
}

/* ============================== FAQ ==================== */
function FaqBand() {
  const label = libraryLabel()
  const faqs = [
    {
      q: `What is inside the ${label.toLowerCase()}?`,
      a: `Curated reference material — reports, guides, studies and reference documents you can preview inline or download to keep.`,
    },
    {
      q: 'Do I need to sign up to read anything?',
      a: 'No. Every entry is readable and downloadable without an account. Signing up is only for contributors.',
    },
    {
      q: 'How are entries organised?',
      a: 'By category, format and topic tags. Use search to jump straight to a keyword, or open the library and filter.',
    },
    {
      q: 'How often is it updated?',
      a: 'New entries roll in continuously. The homepage always reflects what was added most recently.',
    },
  ]
  return (
    <section className="border-b border-[var(--editable-border-soft)] bg-[var(--slot4-page-bg)]">
      <div className={`${container} py-24 sm:py-28 lg:py-32`}>
        <EditableReveal index={0}>
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
            <div>
              <p className="editable-mono text-[11px] font-medium uppercase tracking-[0.28em] text-[var(--slot4-accent)]">FAQ</p>
              <h2 className="editable-display mt-4 text-[2.25rem] font-semibold leading-[1.08] tracking-[-0.025em] sm:text-[2.75rem] lg:text-[3.25rem]">
                Answers before you ask.
              </h2>
              <p className="mt-6 max-w-md text-base leading-[1.7] text-[var(--slot4-page-text)]/55">
                Still curious? Reach out — the contact form goes straight to the team behind the {label.toLowerCase()}.
              </p>
              <Link
                href="/contact"
                className="mt-8 inline-flex items-center gap-2 rounded-full border border-[var(--editable-border-soft)] px-5 py-3 text-sm font-semibold text-[var(--slot4-page-text)] transition duration-300 hover:border-[var(--editable-border-soft)]"
              >
                Ask something <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid gap-4">
              {faqs.map((f, i) => (
                <EditableReveal key={f.q} index={i + 1}>
                  <details className="group rounded-[10px] border border-[var(--editable-border-soft)] bg-[var(--slot4-panel-bg)] p-6 transition duration-500 hover:border-[var(--editable-border-soft)] open:border-[var(--editable-border-soft)]">
                    <summary className="flex cursor-pointer list-none items-start justify-between gap-4">
                      <h3 className="editable-display text-lg font-semibold tracking-[-0.015em] text-[var(--slot4-page-text)] sm:text-xl">
                        {f.q}
                      </h3>
                      <span className="editable-mono mt-1 text-xs text-[var(--slot4-page-text)]/40 transition group-open:rotate-45">＋</span>
                    </summary>
                    <p className="mt-4 text-sm leading-[1.75] text-[var(--slot4-page-text)]/60">{f.a}</p>
                  </details>
                </EditableReveal>
              ))}
            </div>
          </div>
        </EditableReveal>
      </div>
    </section>
  )
}

/* ============================== FINAL CTA ==================== */
export function EditableHomeCta() {
  const label = libraryLabel()
  const pdfConfig = getTaskConfig('pdf')
  return (
    <section className="on-dark relative overflow-hidden bg-[var(--slot4-dark-bg)]">
      <div className="absolute inset-0 bg-[radial-gradient(60%_80%_at_50%_100%,rgba(48,109,41,0.28),transparent_65%)]" />
      <div className={`relative ${container} py-24 text-center sm:py-32 lg:py-40`}>
        <EditableReveal index={0}>
          <p className="editable-mono text-[11px] font-medium uppercase tracking-[0.28em] text-[var(--slot4-accent)]">
            Start reading
          </p>
          <h2 className="editable-display mx-auto mt-6 max-w-4xl text-balance text-[2.5rem] font-semibold leading-[1.05] tracking-[-0.035em] text-[var(--slot4-page-text)] sm:text-[3.5rem] lg:text-[4.375rem]">
            The {label.toLowerCase()} is open. Come in.
          </h2>
          <p className="mx-auto mt-8 max-w-xl text-lg leading-[1.6] text-[var(--slot4-page-text)]/70">
            Everything is one click away — read what's inside, or download the file for later.
          </p>
        </EditableReveal>
        <EditableReveal index={1}>
          <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
            {pdfConfig?.enabled ? (
              <Link
                href={pdfConfig.route}
                className="inline-flex items-center gap-2 rounded-full bg-[var(--slot4-accent)] px-8 py-4 text-sm font-semibold text-[var(--slot4-page-text)] transition duration-300 hover:brightness-110 hover:-translate-y-0.5"
              >
                <FileText className="h-4 w-4" /> Open the {label.toLowerCase()} <ArrowRight className="h-4 w-4" />
              </Link>
            ) : null}
            <Link
              href="/about"
              className="inline-flex items-center gap-2 rounded-full border border-[var(--editable-border-soft)] px-8 py-4 text-sm font-semibold text-[var(--slot4-page-text)] transition duration-300 hover:border-[var(--editable-border-soft)]"
            >
              About the project
            </Link>
          </div>
        </EditableReveal>
      </div>
    </section>
  )
}
