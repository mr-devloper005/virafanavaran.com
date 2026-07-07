import Link from 'next/link'
import { ArrowUpRight, ChevronDown, Download, Filter, Globe, Layers, MapPin, Phone, Search, UserRound } from 'lucide-react'
import { buildTaskMetadata } from '@/lib/seo'
import { CATEGORY_OPTIONS, normalizeCategory } from '@/lib/categories'
import { fetchPaginatedTaskPosts, buildPostUrl } from '@/lib/task-data'
import { getTaskConfig, type TaskKey } from '@/lib/site-config'
import type { SiteFeedPagination, SitePost } from '@/lib/site-connector'
import { taskPageMetadata } from '@/config/site.content'
import { taskPageVoices } from '@/editable/content/task-pages.content'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { getTaskTheme, taskThemeStyle } from '@/editable/theme/task-themes'
import { EditableReveal } from '@/editable/shell/EditableReveal'
import { Ads, getSlotSizes } from '@/lib/ads'

export const revalidate = 3

const pickRandom = (sizes: string[]) => sizes[Math.floor(Math.random() * sizes.length)]

export const taskMetadata = (task: TaskKey, path: string) =>
  buildTaskMetadata(task, {
    path,
    title: taskPageMetadata[task]?.title,
    description: taskPageMetadata[task]?.description,
  })

const getContent = (post: SitePost) => (post.content && typeof post.content === 'object' ? (post.content as Record<string, unknown>) : {})
const asText = (value: unknown) => (typeof value === 'string' ? value.trim() : '')
const isUrl = (value: string) => value.startsWith('/') || /^https?:\/\//i.test(value)

const getImages = (post: SitePost) => {
  const content = getContent(post)
  const media = Array.isArray(post.media)
    ? post.media.map((item) => item?.url).filter((url): url is string => typeof url === 'string' && isUrl(url))
    : []
  const images = Array.isArray(content.images)
    ? content.images.filter((url): url is string => typeof url === 'string' && isUrl(url))
    : []
  const image = asText(content.image) || asText(content.featuredImage) || asText(content.thumbnail)
  const logo = asText(content.logo)
  return [...media, ...images, ...(isUrl(image) ? [image] : []), ...(isUrl(logo) ? [logo] : [])].filter(Boolean).slice(0, 8)
}

const placeholder = '/placeholder.svg?height=900&width=1200'
const getImage = (post: SitePost) => getImages(post)[0] || placeholder
const getCategory = (post: SitePost, fallback: string) => asText(getContent(post).category) || post.tags?.[0] || fallback
const stripHtml = (value: string) => value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
const getSummary = (post: SitePost) =>
  stripHtml(post.summary || asText(getContent(post).description) || asText(getContent(post).excerpt) || asText(getContent(post).body))
const getField = (post: SitePost, keys: string[]) => {
  const content = getContent(post)
  for (const key of keys) {
    const value = asText(content[key])
    if (value) return value
  }
  return ''
}
const cleanDomain = (value: string) => value.replace(/^https?:\/\//, '').replace(/\/$/, '')

function pageHref(basePath: string, category: string, page: number) {
  const params = new URLSearchParams()
  if (category && category !== 'all') params.set('category', category)
  if (page > 1) params.set('page', String(page))
  const query = params.toString()
  return query ? `${basePath}?${query}` : basePath
}

const taskGrid: Record<TaskKey, string> = {
  article: 'grid gap-8 md:grid-cols-2 xl:grid-cols-3',
  listing: 'grid gap-6 xl:grid-cols-2',
  classified: 'grid gap-6 sm:grid-cols-2 xl:grid-cols-3',
  image: 'columns-1 gap-6 [column-fill:_balance] sm:columns-2 xl:columns-3',
  sbm: 'grid gap-6 md:grid-cols-2 xl:grid-cols-3',
  pdf: 'grid gap-6 md:grid-cols-2 xl:grid-cols-3',
  profile: 'grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
}

const cardBase =
  'group block rounded-[10px] border border-[var(--editable-border-soft)] bg-[var(--slot4-glass)] transition duration-500 hover:-translate-y-1 hover:border-[var(--editable-border-soft)]'

export async function EditableTaskArchiveRoute({
  task,
  searchParams,
  basePath,
}: {
  task: TaskKey
  searchParams?: Promise<{ category?: string; page?: string }>
  basePath?: string
}) {
  const resolved = (await searchParams) || {}
  const page = Math.max(1, Math.floor(Number(resolved.page) || 1))
  const category = resolved.category ? normalizeCategory(resolved.category) : 'all'
  const taskConfig = getTaskConfig(task)
  const { posts, pagination } = await fetchPaginatedTaskPosts(task, { page, limit: 24, category })
  return <TaskArchiveView task={task} posts={posts} pagination={pagination} category={category} basePath={basePath || taskConfig?.route || `/${task}`} />
}

export function TaskArchiveView({
  task,
  posts,
  pagination,
  category,
  basePath,
}: {
  task: TaskKey
  posts: SitePost[]
  pagination: SiteFeedPagination
  category: string
  basePath: string
}) {
  const taskConfig = getTaskConfig(task)
  const voice = taskPageVoices[task]
  const theme = getTaskTheme(task)
  const page = pagination.page || 1
  const label = taskConfig?.label || task
  const categoryLabel = category === 'all' ? 'All categories' : CATEGORY_OPTIONS.find((item) => item.slug === category)?.name || category

  return (
    <EditableSiteShell>
      <main style={taskThemeStyle(task)} className="min-h-screen bg-[var(--tk-bg)] text-[var(--tk-text)]">
        {/* Hero header */}
        <header className="relative overflow-hidden border-b border-[var(--editable-border-soft)]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_0%,var(--tk-glow),transparent_70%)]" />
          <div className="relative mx-auto max-w-[var(--editable-container)] px-6 py-24 sm:py-32 lg:px-14 lg:py-40">
            <EditableReveal index={0}>
              <div className="editable-mono flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.32em] text-[var(--tk-accent)]">
                <span>{theme.kicker}</span>
                <span className="h-1 w-1 rounded-full bg-[var(--tk-accent)] opacity-50" />
                <span className="text-[var(--tk-muted)]">{label}</span>
              </div>
            </EditableReveal>
            <EditableReveal index={1}>
              <h1 className="editable-display mt-8 max-w-4xl text-balance text-[2.75rem] font-semibold leading-[1.02] tracking-[-0.035em] sm:text-[4rem] lg:text-[4.375rem]">
                {voice?.headline || `Browse the ${theme.kicker.toLowerCase()}`}
              </h1>
            </EditableReveal>
            <EditableReveal index={2}>
              <p className="mt-8 max-w-2xl text-lg leading-[1.6] text-[var(--tk-muted)]">
                {voice?.description || theme.note}
              </p>
            </EditableReveal>
            {voice?.chips?.length ? (
              <EditableReveal index={3}>
                <div className="mt-10 flex flex-wrap gap-2.5">
                  {voice.chips.map((chip) => (
                    <span key={chip} className="editable-mono rounded-full border border-[var(--editable-border-soft)] bg-[var(--slot4-glass)] px-3.5 py-1.5 text-[10px] font-medium uppercase tracking-[0.24em] text-[var(--slot4-page-text)]/70">
                      {chip}
                    </span>
                  ))}
                </div>
              </EditableReveal>
            ) : null}

            <EditableReveal index={4}>
              <div className="mt-14 flex flex-col gap-4 border-t border-[var(--editable-border-soft)] pt-8 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-[var(--tk-muted)]">
                  <span className="font-semibold text-[var(--slot4-page-text)]">{posts.length}</span> {posts.length === 1 ? 'entry' : 'entries'} · {categoryLabel}
                </p>
                <form action={basePath} className="flex items-center gap-3">
                  <div className="relative">
                    <select
                      name="category"
                      defaultValue={category}
                      className="h-12 appearance-none rounded-full border border-[var(--editable-border-soft)] bg-[var(--slot4-glass)] pl-5 pr-11 text-sm font-medium text-[var(--slot4-page-text)] outline-none transition focus:border-[var(--editable-border-soft)]"
                      aria-label={voice?.filterLabel || 'Filter category'}
                    >
                      <option value="all">All categories</option>
                      {CATEGORY_OPTIONS.map((item) => (
                        <option key={item.slug} value={item.slug}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--slot4-page-text)]/60" />
                  </div>
                  <button className="inline-flex h-12 items-center gap-2 rounded-full bg-[var(--tk-accent)] px-6 text-sm font-semibold text-[var(--tk-on-accent)] transition hover:brightness-110">
                    <Filter className="h-4 w-4" /> Apply
                  </button>
                </form>
              </div>
            </EditableReveal>
          </div>
        </header>

        {/* Reference-Library archive: header ad */}
        {task === 'pdf' ? (
          <div className="mx-auto w-full max-w-[var(--editable-container)] px-6 pt-10 sm:pt-12 lg:px-14">
            <Ads slot="header" size={pickRandom(getSlotSizes('header'))} showLabel className="mx-auto w-full" />
          </div>
        ) : null}

        <section className="mx-auto max-w-[var(--editable-container)] px-6 py-20 sm:py-24 lg:px-14 lg:py-32">
          {posts.length ? (
            <div className={taskGrid[task]}>
              {posts.map((post, index) => (
                <EditableReveal key={post.id || post.slug} index={index}>
                  <ArchivePostCard post={post} task={task} basePath={basePath} index={index} />
                </EditableReveal>
              ))}
            </div>
          ) : (
            <div className="mx-auto max-w-xl rounded-[10px] border border-dashed border-[var(--editable-border-soft)] bg-[var(--slot4-glass)] px-8 py-20 text-center">
              <Search className="mx-auto h-7 w-7 text-[var(--slot4-page-text)]/40" />
              <h2 className="editable-display mt-6 text-2xl font-semibold tracking-[-0.02em]">Nothing here yet</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--tk-muted)]">
                Try another category, or check back after new entries land.
              </p>
            </div>
          )}

          {posts.length ? (
            <nav className="mt-20 flex items-center justify-center gap-3 text-sm">
              {pagination.hasPrevPage ? (
                <Link href={pageHref(basePath, category, page - 1)} className="rounded-full border border-[var(--editable-border-soft)] px-5 py-2.5 font-medium text-[var(--slot4-page-text)] transition hover:border-[var(--editable-border-soft)]">
                  Previous
                </Link>
              ) : null}
              <span className="rounded-full border border-[var(--editable-border-soft)] bg-[var(--slot4-glass)] px-5 py-2.5 font-medium text-[var(--tk-muted)]">
                Page {page} of {pagination.totalPages || 1}
              </span>
              {pagination.hasNextPage ? (
                <Link href={pageHref(basePath, category, page + 1)} className="rounded-full border border-[var(--editable-border-soft)] px-5 py-2.5 font-medium text-[var(--slot4-page-text)] transition hover:border-[var(--editable-border-soft)]">
                  Next
                </Link>
              ) : null}
            </nav>
          ) : null}
        </section>
      </main>
    </EditableSiteShell>
  )
}

function ArchivePostCard({ post, task, basePath, index }: { post: SitePost; task: TaskKey; basePath: string; index: number }) {
  const href = `${basePath}/${post.slug}` || buildPostUrl(task, post.slug)
  if (task === 'listing') return <ListingArchiveCard post={post} href={href} />
  if (task === 'classified') return <ClassifiedArchiveCard post={post} href={href} />
  if (task === 'image') return <ImageArchiveCard post={post} href={href} index={index} />
  if (task === 'sbm') return <BookmarkArchiveCard post={post} href={href} index={index} />
  if (task === 'pdf') return <PdfArchiveCard post={post} href={href} />
  if (task === 'profile') return <ProfileArchiveCard post={post} href={href} />
  return <ArticleArchiveCard post={post} href={href} index={index} />
}

function CardArrow({ label }: { label: string }) {
  return (
    <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[var(--slot4-page-text)] transition group-hover:text-[var(--tk-accent)]">
      {label}
      <ArrowUpRight className="h-4 w-4 transition duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
    </span>
  )
}

function ArticleArchiveCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  const image = getImage(post)
  const category = getCategory(post, 'Editorial')
  return (
    <Link href={href} className={`${cardBase} overflow-hidden`}>
      <div className="aspect-[16/10] overflow-hidden bg-[var(--tk-raised)]">
        <img src={image} alt="" className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]" />
      </div>
      <div className="p-7">
        <div className="editable-mono flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.28em] text-[var(--tk-accent)]">
          <span>{category}</span>
          <span className="text-[var(--slot4-page-text)]/40">· No. {String(index + 1).padStart(2, '0')}</span>
        </div>
        <h2 className="editable-display mt-4 text-2xl font-semibold leading-[1.15] tracking-[-0.02em] text-[var(--slot4-page-text)]">
          {post.title}
        </h2>
        <p className="mt-4 line-clamp-2 text-[15px] leading-[1.7] text-[var(--slot4-page-text)]/60">{getSummary(post)}</p>
        <CardArrow label="Read entry" />
      </div>
    </Link>
  )
}

function ListingArchiveCard({ post, href }: { post: SitePost; href: string }) {
  const logo = getImages(post)[0]
  const location = getField(post, ['location', 'address', 'city'])
  const phone = getField(post, ['phone', 'telephone', 'mobile'])
  const website = getField(post, ['website', 'url'])
  return (
    <Link href={href} className={`${cardBase} flex items-center gap-5 p-6`}>
      <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-[10px] border border-[var(--editable-border-soft)] bg-[var(--tk-raised)]">
        {logo ? <img src={logo} alt="" className="h-full w-full object-cover" /> : <Layers className="h-9 w-9 text-[var(--slot4-page-text)]/40" />}
      </div>
      <div className="min-w-0 flex-1">
        <h2 className="editable-display truncate text-xl font-semibold tracking-[-0.02em] text-[var(--slot4-page-text)]">{post.title}</h2>
        <p className="mt-2 line-clamp-1 text-sm leading-6 text-[var(--slot4-page-text)]/55">{getSummary(post)}</p>
        <div className="mt-3 flex flex-wrap gap-4 text-xs font-medium text-[var(--slot4-page-text)]/50">
          {location ? <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-[var(--tk-accent)]" /> {location}</span> : null}
          {phone ? <span className="inline-flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 text-[var(--tk-accent)]" /> {phone}</span> : null}
          {website ? <span className="inline-flex items-center gap-1.5"><Globe className="h-3.5 w-3.5 text-[var(--tk-accent)]" /> Website</span> : null}
        </div>
      </div>
      <ArrowUpRight className="h-5 w-5 shrink-0 text-[var(--slot4-page-text)]/40 transition group-hover:text-[var(--tk-accent)]" />
    </Link>
  )
}

function ClassifiedArchiveCard({ post, href }: { post: SitePost; href: string }) {
  const price = getField(post, ['price', 'amount', 'budget'])
  const location = getField(post, ['location', 'address', 'city'])
  const condition = getField(post, ['condition', 'type', 'availability'])
  return (
    <Link href={href} className={`${cardBase} flex flex-col p-7`}>
      <div className="flex items-start justify-between gap-4">
        <span className="editable-display text-3xl font-semibold tracking-[-0.03em] text-[var(--tk-accent)]">{price || 'Open offer'}</span>
        {condition ? <span className="editable-mono rounded-full bg-[var(--tk-accent-soft)] px-3 py-1 text-[10px] font-medium uppercase tracking-[0.24em] text-[var(--tk-accent)]">{condition}</span> : null}
      </div>
      <h2 className="editable-display mt-6 text-xl font-semibold leading-tight tracking-[-0.015em] text-[var(--slot4-page-text)]">{post.title}</h2>
      <p className="mt-3 line-clamp-3 flex-1 text-sm leading-[1.7] text-[var(--slot4-page-text)]/55">{getSummary(post)}</p>
      <div className="mt-6 flex items-center justify-between border-t border-[var(--editable-border-soft)] pt-4 text-xs font-medium text-[var(--slot4-page-text)]/45">
        <span className="inline-flex items-center gap-1.5">
          {location ? (
            <>
              <MapPin className="h-3.5 w-3.5" /> {location}
            </>
          ) : (
            'Details inside'
          )}
        </span>
        <ArrowUpRight className="h-4 w-4 text-[var(--tk-accent)] transition group-hover:translate-x-0.5" />
      </div>
    </Link>
  )
}

function ImageArchiveCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  const image = getImage(post)
  return (
    <Link href={href} className="group mb-6 block break-inside-avoid overflow-hidden rounded-[10px] border border-[var(--editable-border-soft)] bg-[var(--slot4-glass)] transition duration-500 hover:-translate-y-1 hover:border-[var(--editable-border-soft)]">
      <div className={`relative overflow-hidden ${index % 3 === 0 ? 'aspect-[3/4]' : 'aspect-[4/3]'}`}>
        <img src={image} alt="" className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.05]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_45%,rgba(0,0,0,0.85))]" />
        <div className="absolute inset-x-0 bottom-0 p-6">
          <h2 className="editable-display line-clamp-2 text-lg font-semibold leading-tight tracking-[-0.015em] text-[var(--slot4-page-text)]">{post.title}</h2>
          <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--slot4-page-text)]/70">
            View <ArrowUpRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </Link>
  )
}

function BookmarkArchiveCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  const website = getField(post, ['website', 'url', 'link'])
  return (
    <Link href={href} className={`${cardBase} flex gap-5 p-6`}>
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--tk-accent-soft)] text-[var(--tk-accent)]">
        <Globe className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <span className="editable-mono text-[10px] font-medium uppercase tracking-[0.28em] text-[var(--slot4-page-text)]/45">
          Saved · {String(index + 1).padStart(2, '0')}
        </span>
        <h2 className="editable-display mt-2 text-lg font-semibold leading-tight tracking-[-0.015em] text-[var(--slot4-page-text)]">
          {post.title}
        </h2>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--slot4-page-text)]/55">{getSummary(post)}</p>
        {website ? <p className="mt-3 truncate text-xs font-medium text-[var(--tk-accent)]">{cleanDomain(website)}</p> : null}
      </div>
    </Link>
  )
}

/** Pdf card — the public Reference Library entry. Document glyph (SVG), title, category chip. */
function PdfArchiveCard({ post, href }: { post: SitePost; href: string }) {
  const category = getCategory(post, 'Reference')
  const format = (getField(post, ['format', 'fileType']) || 'PDF').toUpperCase()
  return (
    <Link href={href} className={`${cardBase} flex flex-col p-7`}>
      <div className="flex items-start justify-between gap-4">
        <div className="relative flex h-16 w-14 flex-col items-center justify-end overflow-hidden rounded-[6px] bg-[var(--tk-accent-soft)] text-[var(--tk-accent)] shadow-[inset_0_0_0_1px_rgba(48,109,41,0.3)]">
          <div className="absolute inset-x-2 top-2 space-y-1">
            <div className="h-1 rounded-full bg-current opacity-25" />
            <div className="h-1 w-4/5 rounded-full bg-current opacity-25" />
            <div className="h-1 w-3/5 rounded-full bg-current opacity-25" />
          </div>
          <span className="editable-mono mb-1.5 text-[9px] font-semibold uppercase tracking-[0.14em]">{format}</span>
        </div>
        <span className="editable-mono rounded-full border border-[var(--editable-border-soft)] px-3 py-1 text-[10px] font-medium uppercase tracking-[0.24em] text-[var(--slot4-page-text)]/60">
          {category}
        </span>
      </div>
      <h2 className="editable-display mt-8 text-xl font-semibold leading-tight tracking-[-0.015em] text-[var(--slot4-page-text)]">{post.title}</h2>
      <p className="mt-3 line-clamp-3 flex-1 text-sm leading-[1.7] text-[var(--slot4-page-text)]/55">{getSummary(post)}</p>
      <div className="mt-6 flex items-center justify-between border-t border-[var(--editable-border-soft)] pt-4">
        <span className="editable-mono text-[10px] font-medium uppercase tracking-[0.24em] text-[var(--slot4-page-text)]/50">
          {format}
        </span>
        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--tk-accent)]">
          Open <Download className="h-4 w-4" />
        </span>
      </div>
    </Link>
  )
}

/** Profile archive card — kept functional in code, but archive is never
 *  linked/promoted publicly. Direct URL only. */
function ProfileArchiveCard({ post, href }: { post: SitePost; href: string }) {
  const avatar = getImages(post)[0]
  const role = getField(post, ['role', 'designation', 'company', 'location'])
  return (
    <Link href={href} className={`${cardBase} flex flex-col items-center p-7 text-center`}>
      <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-[var(--editable-border-soft)] bg-[var(--tk-raised)]">
        {avatar ? <img src={avatar} alt="" className="h-full w-full object-cover" /> : <UserRound className="h-10 w-10 text-[var(--slot4-page-text)]/40" />}
      </div>
      <h2 className="editable-display mt-5 text-lg font-semibold tracking-[-0.015em] text-[var(--slot4-page-text)]">{post.title}</h2>
      {role ? <p className="editable-mono mt-2 text-[10px] font-medium uppercase tracking-[0.24em] text-[var(--tk-accent)]">{role}</p> : null}
      <p className="mt-3 line-clamp-2 text-sm leading-6 text-[var(--slot4-page-text)]/55">{getSummary(post)}</p>
    </Link>
  )
}
