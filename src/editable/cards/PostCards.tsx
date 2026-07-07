import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import type { SitePost } from '@/lib/site-connector'
import type { TaskKey } from '@/lib/site-config'
import { editableDesignContract as dc, editablePalette as pal } from '@/editable/layouts/design-contract'

export function getEditablePostImage(post?: SitePost | null) {
  const media = Array.isArray(post?.media) ? post?.media : []
  const mediaUrl = media.find((item) => typeof item?.url === 'string' && item.url)?.url
  const content = post?.content && typeof post.content === 'object' ? (post.content as Record<string, unknown>) : {}
  const images = Array.isArray(content.images) ? content.images : []
  const contentImage = images.find((url): url is string => typeof url === 'string' && Boolean(url))
  const logo = typeof content.logo === 'string' ? content.logo : ''
  return mediaUrl || contentImage || logo || '/placeholder.svg?height=900&width=1400'
}

export function getEditableExcerpt(post?: SitePost | null, limit = 150) {
  const content = post?.content && typeof post.content === 'object' ? (post.content as Record<string, unknown>) : {}
  const raw =
    (typeof content.description === 'string' && content.description) ||
    (typeof content.summary === 'string' && content.summary) ||
    post?.summary ||
    ''
  const clean = raw.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
  return clean.length > limit ? `${clean.slice(0, limit).trim()}...` : clean
}

export function getEditableCategory(post?: SitePost | null) {
  const content = post?.content && typeof post.content === 'object' ? (post.content as Record<string, unknown>) : {}
  return (typeof content.category === 'string' && content.category) || post?.tags?.[0] || 'Featured'
}

export function postHref(task: TaskKey, post: SitePost, route = `/${task}`) {
  return `${route}/${post.slug}`
}

/* ---------- Editorial feature — large dark hero card ---------- */
export function EditorialFeatureCard({ post, href, label = 'Featured' }: { post: SitePost; href: string; label?: string }) {
  return (
    <Link href={href} className={`on-dark group relative block min-w-0 overflow-hidden rounded-[10px] bg-[var(--slot4-dark-bg)] ${dc.motion.lift}`}>
      <div className="relative min-h-[520px] lg:min-h-[620px]">
        <img
          src={getEditablePostImage(post)}
          alt={post.title}
          className="absolute inset-0 h-full w-full object-cover opacity-70 transition duration-700 group-hover:scale-[1.03] group-hover:opacity-80"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.15)_0%,rgba(0,0,0,0.55)_45%,rgba(0,0,0,0.92)_100%)]" />
        <div className="relative z-10 flex h-full min-h-[520px] flex-col justify-end p-7 sm:p-10 lg:min-h-[620px] lg:p-14">
          <span className="editable-mono text-[11px] font-medium uppercase tracking-[0.28em] text-[var(--slot4-accent)]">{label}</span>
          <h3 className="editable-display mt-5 max-w-3xl text-[2rem] font-semibold leading-[1.05] tracking-[-0.025em] text-[var(--slot4-page-text)] sm:text-[2.75rem] lg:text-[3.5rem]">
            {post.title}
          </h3>
          <p className="mt-5 max-w-2xl text-base leading-[1.7] text-[var(--slot4-page-text)]/75 sm:text-lg">
            {getEditableExcerpt(post, 180)}
          </p>
          <span className="mt-9 inline-flex w-fit items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-[var(--slot4-page-text)] transition duration-300 group-hover:brightness-95">
            Read the piece <ArrowUpRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </Link>
  )
}

/* ---------- Rail card — used in horizontal snap rails ---------- */
export function RailPostCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  return (
    <Link href={href} className={`group ${dc.layout.minRailCard} block overflow-hidden rounded-[10px] ${pal.panelBg} border border-[var(--editable-border-soft)] ${dc.motion.lift}`}>
      <div className={`${dc.media.frame} aspect-[4/5]`}>
        <img
          src={getEditablePostImage(post)}
          alt={post.title}
          className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.06]"
        />
        <span className="absolute left-4 top-4 editable-mono rounded-full bg-[var(--slot4-dark-bg)]/70 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.24em] text-[var(--slot4-page-text)] backdrop-blur-md">
          No. {String(index + 1).padStart(2, '0')}
        </span>
      </div>
      <div className="p-6">
        <p className="editable-mono text-[10px] font-medium uppercase tracking-[0.28em] text-[var(--slot4-accent)]">
          {getEditableCategory(post)}
        </p>
        <h3 className="editable-display mt-4 line-clamp-3 text-[1.35rem] font-semibold leading-tight tracking-[-0.015em] text-[var(--slot4-page-text)]">
          {post.title}
        </h3>
        <p className="mt-3 line-clamp-3 text-sm leading-[1.65] text-[var(--slot4-page-text)]/60">{getEditableExcerpt(post, 130)}</p>
      </div>
    </Link>
  )
}

/* ---------- Compact index — numbered ranked entry ---------- */
export function CompactIndexCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  return (
    <Link href={href} className="group block min-w-0 rounded-[10px] border border-[var(--editable-border-soft)] bg-[var(--slot4-panel-bg)] p-6 transition duration-500 hover:border-[var(--editable-border-soft)] hover:-translate-y-1">
      <div className="flex items-start gap-5">
        <span className="editable-display flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[var(--editable-border-soft)] text-[15px] font-semibold text-[var(--slot4-page-text)]">
          {String(index + 1).padStart(2, '0')}
        </span>
        <div className="min-w-0">
          <p className="editable-mono text-[10px] font-medium uppercase tracking-[0.28em] text-[var(--slot4-accent)]">
            {getEditableCategory(post)}
          </p>
          <h3 className="editable-display mt-2 line-clamp-2 text-lg font-semibold leading-snug tracking-[-0.015em] text-[var(--slot4-page-text)]">
            {post.title}
          </h3>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--slot4-page-text)]/55">{getEditableExcerpt(post, 105)}</p>
        </div>
      </div>
    </Link>
  )
}

/* ---------- Horizontal article list card ---------- */
export function ArticleListCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  return (
    <Link href={href} className={`group grid min-w-0 gap-6 overflow-hidden rounded-[10px] border border-[var(--editable-border-soft)] bg-[var(--slot4-panel-bg)] p-5 ${dc.motion.lift} sm:grid-cols-[260px_minmax(0,1fr)]`}>
      <div className={`${dc.media.frame} aspect-[16/12] sm:aspect-auto sm:min-h-[210px]`}>
        <img src={getEditablePostImage(post)} alt={post.title} className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.05]" />
      </div>
      <div className="min-w-0 sm:py-4 sm:pr-4">
        <p className="editable-mono text-[10px] font-medium uppercase tracking-[0.28em] text-[var(--slot4-accent)]">
          Entry {String(index + 1).padStart(2, '0')}
        </p>
        <h2 className="editable-display mt-3 line-clamp-3 text-2xl font-semibold leading-tight tracking-[-0.02em] text-[var(--slot4-page-text)] sm:text-[1.75rem]">
          {post.title}
        </h2>
        <p className="mt-4 line-clamp-3 text-[15px] leading-[1.65] text-[var(--slot4-page-text)]/60">{getEditableExcerpt(post, 180)}</p>
        <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[var(--slot4-page-text)] transition group-hover:text-[var(--slot4-accent)]">
          Read <ArrowUpRight className="h-4 w-4" />
        </span>
      </div>
    </Link>
  )
}
