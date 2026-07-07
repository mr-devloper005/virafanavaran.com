import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowUpRight, FileText, Search } from 'lucide-react'
import { buildPageMetadata } from '@/lib/seo'
import { fetchSiteFeed } from '@/lib/site-connector'
import { getPostTaskKey } from '@/lib/task-data'
import { getMockPostsForTask } from '@/lib/mock-posts'
import { SITE_CONFIG, type TaskKey } from '@/lib/site-config'
import type { SitePost } from '@/lib/site-connector'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { pagesContent } from '@/editable/content/pages.content'
import { getTaskTheme } from '@/editable/theme/task-themes'
import { EditableReveal } from '@/editable/shell/EditableReveal'
import { Ads, getSlotSizes } from '@/lib/ads'

export const revalidate = 3

const pickRandom = (sizes: string[]) => sizes[Math.floor(Math.random() * sizes.length)]

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    path: '/search',
    title: pagesContent.search.metadata.title,
    description: pagesContent.search.metadata.description,
  })
}

const stripHtml = (value: string) => value.replace(/<[^>]*>/g, ' ')
const compactText = (value: unknown) => (typeof value === 'string' ? stripHtml(value).replace(/\s+/g, ' ').trim().toLowerCase() : '')
const getContent = (post: SitePost) => (post.content && typeof post.content === 'object' ? (post.content as Record<string, unknown>) : {})
const compactRaw = (value: unknown) => (typeof value === 'string' ? value.trim() : '')
const getImage = (post: SitePost) => {
  const content = getContent(post)
  const media = Array.isArray(post.media) ? post.media.find((item) => typeof item?.url === 'string')?.url : ''
  const images = Array.isArray(content.images) ? (content.images.find((item) => typeof item === 'string') as string | undefined) : ''
  return media || compactRaw(content.featuredImage) || compactRaw(content.image) || compactRaw(content.thumbnail) || images || ''
}
const summaryOf = (post: SitePost) => post.summary || compactRaw(getContent(post).description) || compactRaw(getContent(post).excerpt) || ''

const matches = (post: SitePost, query: string, category: string, task: string) => {
  const content = getContent(post)
  const typeText = compactText(content.type)
  if (typeText === 'comment') return false
  const derivedTask = getPostTaskKey(post) || typeText
  // Profiles never appear in public search results.
  if (derivedTask === 'profile') return false
  if (task && derivedTask !== task) return false
  const categoryText = compactText(content.category)
  const tagsText = compactText(Array.isArray(post.tags) ? post.tags.join(' ') : '')
  if (category && !(categoryText || tagsText).includes(category)) return false
  if (!query) return true
  return [post.title, post.summary, content.description, content.body, content.excerpt, content.category, Array.isArray(post.tags) ? post.tags.join(' ') : '']
    .some((value) => compactText(value).includes(query))
}

function labelFor(task: TaskKey | null) {
  if (!task) return 'Entry'
  return getTaskTheme(task).kicker
}

function SearchResultCard({ post }: { post: SitePost }) {
  const task = getPostTaskKey(post) as TaskKey | null
  if (task === 'profile') return null
  const taskRoute = SITE_CONFIG.tasks.find((item) => item.key === task)?.route
  const href = `${taskRoute || `/${task || 'article'}`}/${post.slug}`
  const image = getImage(post)
  const summary = summaryOf(post)
  const label = labelFor(task)

  return (
    <Link
      href={href}
      className="group flex flex-col overflow-hidden rounded-[10px] border border-[var(--editable-border-soft)] bg-[var(--slot4-glass)] transition duration-500 hover:-translate-y-1 hover:border-[var(--editable-border-soft)]"
    >
      {image ? (
        <div className="relative aspect-[16/10] overflow-hidden bg-[var(--slot4-media-bg)]">
          <img src={image} alt="" className="h-full w-full object-cover opacity-90 transition duration-700 group-hover:scale-[1.05]" />
          <span className="absolute left-4 top-4 editable-mono rounded-full bg-[var(--slot4-dark-bg)]/70 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.28em] text-[var(--slot4-page-text)] backdrop-blur-md">
            {label}
          </span>
        </div>
      ) : (
        <div className="flex aspect-[16/10] items-center justify-center bg-[var(--slot4-panel-bg)] text-[var(--slot4-page-text)]/30">
          <FileText className="h-10 w-10" />
        </div>
      )}
      <div className="flex flex-1 flex-col p-6">
        <h2 className="editable-display line-clamp-3 text-lg font-semibold leading-tight tracking-[-0.015em] text-[var(--slot4-page-text)]">
          {post.title}
        </h2>
        {summary ? (
          <p className="mt-3 line-clamp-3 flex-1 text-sm leading-[1.7] text-[var(--slot4-page-text)]/55">{stripHtml(summary)}</p>
        ) : null}
        <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[var(--slot4-page-text)] transition group-hover:text-[var(--slot4-accent)]">
          Open <ArrowUpRight className="h-4 w-4" />
        </span>
      </div>
    </Link>
  )
}

export default async function SearchPage({ searchParams }: { searchParams?: Promise<{ q?: string; category?: string; task?: string; master?: string }> }) {
  const resolved = (await searchParams) || {}
  const query = (resolved.q || '').trim()
  const normalized = query.toLowerCase()
  const category = (resolved.category || '').trim().toLowerCase()
  const task = (resolved.task || '').trim().toLowerCase()
  const useMaster = resolved.master !== '0'
  const feed = await fetchSiteFeed(useMaster ? 1000 : 300, useMaster ? { fresh: true, category: category || undefined, task: task || undefined } : undefined)
  const posts = feed?.posts?.length
    ? feed.posts
    : useMaster
    ? []
    : SITE_CONFIG.tasks.filter((item) => item.enabled && item.key !== 'profile').flatMap((item) => getMockPostsForTask(item.key))
  const results = posts.filter((post) => matches(post, normalized, category, task)).slice(0, normalized ? 80 : 36)
  // Only surface public tasks in the type dropdown — never profile.
  const publicTasks = SITE_CONFIG.tasks.filter((item) => item.enabled && item.key !== 'profile')

  return (
    <EditableSiteShell>
      <main className="min-h-screen bg-[var(--slot4-page-bg)] text-[var(--slot4-page-text)]">
        <section className="mx-auto max-w-[var(--editable-container)] px-6 py-16 sm:py-24 lg:px-14 lg:py-32">
          <EditableReveal index={0}>
            <div className="max-w-3xl">
              <p className="editable-mono text-[11px] font-medium uppercase tracking-[0.28em] text-[var(--slot4-accent)]">
                {pagesContent.search.hero.badge}
              </p>
              <h1 className="editable-display mt-6 text-balance text-[2.5rem] font-semibold leading-[1.04] tracking-[-0.035em] sm:text-[3.5rem] lg:text-[4.25rem]">
                {pagesContent.search.hero.title}
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-[1.65] text-[var(--slot4-page-text)]/65">
                {pagesContent.search.hero.description}
              </p>
            </div>
          </EditableReveal>

          <EditableReveal index={1}>
            <form action="/search" className="mt-12 rounded-[10px] border border-[var(--editable-border-soft)] bg-[var(--slot4-glass)] p-6 sm:p-8">
              <input type="hidden" name="master" value="1" />
              <label className="flex items-center gap-3 rounded-full border border-[var(--editable-border-soft)] bg-[var(--slot4-dark-bg)]/40 px-5 py-4">
                <Search className="h-5 w-5 text-[var(--slot4-page-text)]/50" />
                <input
                  name="q"
                  defaultValue={query}
                  placeholder={pagesContent.search.hero.placeholder}
                  className="min-w-0 flex-1 bg-transparent text-base font-medium text-[var(--slot4-page-text)] outline-none placeholder:text-[var(--slot4-page-text)]/40"
                />
                <button className="inline-flex items-center gap-2 rounded-full bg-[var(--slot4-accent)] px-5 py-2 text-sm font-semibold text-[var(--slot4-page-text)] transition hover:brightness-110" type="submit">
                  Search
                </button>
              </label>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <input
                  name="category"
                  defaultValue={category}
                  placeholder="Category"
                  className="rounded-full border border-[var(--editable-border-soft)] bg-[var(--slot4-dark-bg)]/40 px-5 py-3 text-sm font-medium text-[var(--slot4-page-text)] outline-none placeholder:text-[var(--slot4-page-text)]/40"
                />
                <select name="task" defaultValue={task} className="rounded-full border border-[var(--editable-border-soft)] bg-[var(--slot4-dark-bg)]/40 px-5 py-3 text-sm font-medium text-[var(--slot4-page-text)] outline-none">
                  <option value="">All content</option>
                  {publicTasks.map((item) => (
                    <option key={item.key} value={item.key}>
                      {getTaskTheme(item.key).kicker}
                    </option>
                  ))}
                </select>
              </div>
            </form>
          </EditableReveal>

          <EditableReveal index={2}>
            <div className="mt-16 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="editable-mono text-[10px] font-medium uppercase tracking-[0.28em] text-[var(--slot4-page-text)]/50">
                  {results.length} results
                </p>
                <h2 className="editable-display mt-3 text-2xl font-semibold tracking-[-0.02em] sm:text-3xl">
                  {query ? `Results for “${query}”` : pagesContent.search.resultsTitle}
                </h2>
              </div>
            </div>
          </EditableReveal>

          {results.length ? (
            <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {results.map((post, index) => (
                <EditableReveal key={post.id || post.slug} index={index}>
                  <SearchResultCard post={post} />
                </EditableReveal>
              ))}
            </div>
          ) : (
            <div className="mt-12 rounded-[10px] border border-dashed border-[var(--editable-border-soft)] bg-[var(--slot4-glass)] p-14 text-center">
              <p className="editable-display text-2xl font-semibold tracking-[-0.02em] text-[var(--slot4-page-text)]">Nothing matched.</p>
              <p className="mt-3 text-sm text-[var(--slot4-page-text)]/55">Try a different keyword, category, or content type.</p>
            </div>
          )}

          <div className="mt-16">
            <Ads slot="footer" size={pickRandom(getSlotSizes('footer'))} showLabel />
          </div>
        </section>
      </main>
    </EditableSiteShell>
  )
}
