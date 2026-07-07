import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  ArrowLeft, ArrowRight, ArrowUpRight, Bookmark, BookOpen, CheckCircle2, Download,
  ExternalLink, FileText, Globe2, Layers, Link as LinkIcon, Mail, MapPin, Phone, ShieldCheck, Tag, UserRound,
} from 'lucide-react'
import { buildPostMetadata, buildTaskMetadata } from '@/lib/seo'
import { fetchArticleComments, fetchTaskPostBySlug, fetchTaskPosts } from '@/lib/task-data'
import { getTaskConfig, SITE_CONFIG, type TaskKey } from '@/lib/site-config'
import type { SitePost } from '@/lib/site-connector'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { EditableArticleComments } from '@/editable/components/EditableArticleComments'
import { getTaskTheme, taskThemeStyle } from '@/editable/theme/task-themes'
import { Ads, getSlotSizes } from '@/lib/ads'

export const revalidate = 3

const pickRandom = (sizes: string[]) => sizes[Math.floor(Math.random() * sizes.length)]

export async function generateEditableDetailMetadata(task: TaskKey, params: Promise<{ slug?: string; username?: string }>) {
  const resolved = await params
  const slug = resolved.slug || resolved.username || ''
  const post = await fetchTaskPostBySlug(task, slug)
  return post ? await buildPostMetadata(task, post) : await buildTaskMetadata(task)
}

export async function EditableTaskDetailRoute({ task, params }: { task: TaskKey; params: Promise<{ slug?: string; username?: string }> }) {
  const resolved = await params
  const slug = resolved.slug || resolved.username || ''
  const post = await fetchTaskPostBySlug(task, slug)
  if (!post) notFound()
  // For profile detail: never surface OTHER profiles. Related uses the public
  // Reference Library (pdf) task instead. For all other tasks: same-task related.
  const relatedTask: TaskKey = task === 'profile' ? 'pdf' : task
  const relatedRaw = await fetchTaskPosts(relatedTask, 8)
  const related = (task === 'profile' ? relatedRaw : relatedRaw.filter((item) => item.slug !== post.slug)).slice(0, 4)
  const comments = task === 'article' ? await fetchArticleComments(post.slug, 50) : []
  return <TaskDetailView task={task} post={post} related={related} comments={comments} />
}

/* -------------------------- Helpers -------------------------- */
const getContent = (post: SitePost) => (post.content && typeof post.content === 'object' ? (post.content as Record<string, unknown>) : {})
const asText = (value: unknown) => (typeof value === 'string' ? value.trim() : '')
const isUrl = (value: string) => value.startsWith('/') || /^https?:\/\//i.test(value)

const getField = (post: SitePost, keys: string[]) => {
  const content = getContent(post)
  for (const key of keys) {
    const value = asText(content[key])
    if (value) return value
  }
  return ''
}

const getImages = (post: SitePost) => {
  const content = getContent(post)
  const media = Array.isArray(post.media)
    ? post.media.map((item) => item?.url).filter((url): url is string => typeof url === 'string' && isUrl(url))
    : []
  const images = Array.isArray(content.images)
    ? content.images.filter((url): url is string => typeof url === 'string' && isUrl(url))
    : []
  const singleImages = ['image', 'featuredImage', 'thumbnail', 'logo', 'avatar']
    .map((key) => asText(content[key]))
    .filter((url) => url && isUrl(url))
  return [...media, ...images, ...singleImages].filter(Boolean).slice(0, 12)
}

const getBody = (post: SitePost) => {
  const content = getContent(post)
  return asText(content.body) || asText(content.description) || asText(content.details) || post.summary || 'Details will appear here once available.'
}

const escapeHtml = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')

const safeUrl = (value: string) => (/^https?:\/\//i.test(value) ? value : '#')

const linkifyMarkdown = (value: string) =>
  value.replace(/\[([^\]]+)]\((https?:\/\/[^\s)]+)\)/gi, (_m, label, url) => `<a href="${safeUrl(url)}" target="_blank" rel="nofollow noopener noreferrer">${label}</a>`)

const linkifyText = (value: string) =>
  linkifyMarkdown(value).replace(/(^|[\s(>])((https?:\/\/)[^\s<)]+)/gi, (_m, prefix, url) => `${prefix}<a href="${safeUrl(url)}" target="_blank" rel="nofollow noopener noreferrer">${url}</a>`)

const hardenLinks = (html: string) =>
  html.replace(/<a\s+([^>]*href=["'][^"']+["'][^>]*)>/gi, (_m, attrs) => {
    let next = String(attrs).replace(/\s+on\w+=("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    if (!/\starget=/i.test(next)) next += ' target="_blank"'
    if (!/\srel=/i.test(next)) next += ' rel="nofollow noopener noreferrer"'
    return `<a ${next}>`
  })

const sanitizeHtml = (html: string) =>
  hardenLinks(
    html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<(iframe|object|embed)[^>]*>[\s\S]*?<\/\1>/gi, '')
      .replace(/\s+on\w+=("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
      .replace(/(href|src)=(['"])javascript:[\s\S]*?\2/gi, '$1="#"')
  )

const formatPlainText = (raw: string) => {
  const value = raw.trim()
  if (!value) return ''
  if (/<[a-z][\s\S]*>/i.test(value)) return sanitizeHtml(linkifyMarkdown(value))
  return value
    .split(/\n{2,}/)
    .map((part) => `<p>${linkifyText(escapeHtml(part).replace(/\n/g, '<br />'))}</p>`)
    .join('')
}

const summaryText = (post: SitePost) => post.summary || asText(getContent(post).description) || asText(getContent(post).excerpt) || ''
const stripHtml = (value: string) => value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
const leadText = (post: SitePost) => {
  const summary = summaryText(post)
  if (!summary) return ''
  const lead = stripHtml(summary)
  return lead && lead !== stripHtml(getBody(post)) ? lead : ''
}
const categoryOf = (post: SitePost, fallback: string) => asText(getContent(post).category) || post.tags?.[0] || fallback
const mapSrcFor = (post: SitePost) => {
  const address = getField(post, ['address', 'location', 'city'])
  const lat = getField(post, ['lat', 'latitude'])
  const lng = getField(post, ['lng', 'lon', 'longitude'])
  if (lat && lng) return `https://maps.google.com/maps?q=${encodeURIComponent(`${lat},${lng}`)}&z=14&output=embed`
  if (address) return `https://maps.google.com/maps?q=${encodeURIComponent(address)}&z=13&output=embed`
  return ''
}
const tagsOf = (post: SitePost): string[] => (Array.isArray(post.tags) ? post.tags.filter((t) => typeof t === 'string' && t.trim()).slice(0, 8) : [])

/* -------------------------- Root switch -------------------------- */
export function TaskDetailView({
  task,
  post,
  related,
  comments = [],
}: {
  task: TaskKey
  post: SitePost
  related: SitePost[]
  comments?: Array<{ id: string; name: string; comment: string; createdAt: string }>
}) {
  return (
    <EditableSiteShell>
      <main style={taskThemeStyle(task)} className="min-h-screen bg-[var(--tk-bg)] text-[var(--tk-text)]">
        {task === 'listing' ? <ListingDetail post={post} related={related} /> : null}
        {task === 'classified' ? <ClassifiedDetail post={post} related={related} /> : null}
        {task === 'image' ? <ImageDetail post={post} related={related} /> : null}
        {task === 'sbm' ? <BookmarkDetail post={post} related={related} /> : null}
        {task === 'pdf' ? <PdfDetail post={post} related={related} /> : null}
        {task === 'profile' ? <ProfileDetail post={post} related={related} /> : null}
        {task === 'article' ? <ArticleDetail post={post} related={related} comments={comments} /> : null}
      </main>
    </EditableSiteShell>
  )
}

/* -------------------------- Shared building blocks -------------------------- */
function Kicker({ task, children }: { task: TaskKey; children?: React.ReactNode }) {
  const theme = getTaskTheme(task)
  return (
    <div className="editable-mono flex flex-wrap items-center gap-3 text-[10px] font-medium uppercase tracking-[0.32em] text-[var(--tk-accent)]">
      <span>{theme.kicker}</span>
      {children ? (
        <>
          <span className="h-1 w-1 rounded-full bg-[var(--tk-accent)]/60" />
          <span className="text-[var(--tk-muted)]">{children}</span>
        </>
      ) : null}
    </div>
  )
}

function BackLink({ task }: { task: TaskKey }) {
  // Profile detail is not surfaced anywhere in the public UI — its Back link
  // points to home instead of a nonexistent profile archive.
  const taskConfig = task === 'profile' ? undefined : getTaskConfig(task)
  const href = taskConfig?.route || '/'
  const theme = getTaskTheme(task === 'profile' ? 'pdf' : task)
  return (
    <Link href={href} className="inline-flex items-center gap-2 text-sm font-medium text-[var(--slot4-page-text)]/60 transition duration-300 hover:text-[var(--slot4-page-text)]">
      <ArrowLeft className="h-4 w-4" /> Back to {taskConfig?.label || theme.kicker}
    </Link>
  )
}

function Divider() {
  return <div className="my-12 h-px bg-[var(--slot4-cream)]/8" />
}

function BodyContent({ post, compact = false }: { post: SitePost; compact?: boolean }) {
  return (
    <div
      className={`article-content mt-10 max-w-none text-[var(--tk-text)] ${compact ? 'text-[15px] leading-[1.75]' : 'text-[1.0625rem] leading-[1.8]'}`}
      dangerouslySetInnerHTML={{ __html: formatPlainText(getBody(post)) }}
    />
  )
}

function TagRow({ tags }: { tags: string[] }) {
  if (!tags.length) return null
  return (
    <div className="mt-10 flex flex-wrap gap-2">
      {tags.map((tag) => (
        <span
          key={tag}
          className="editable-mono inline-flex items-center gap-1.5 rounded-full border border-[var(--editable-border-soft)] bg-[var(--slot4-glass)] px-3.5 py-1.5 text-[11px] font-medium uppercase tracking-[0.24em] text-[var(--slot4-page-text)]/65"
        >
          <Tag className="h-3 w-3" /> {tag}
        </span>
      ))}
    </div>
  )
}

function InfoGrid({ items }: { items: Array<[string, string, typeof MapPin]> }) {
  const visible = items.filter(([, value]) => value)
  if (!visible.length) return null
  return (
    <div className="mt-10 grid gap-3 sm:grid-cols-2">
      {visible.map(([label, value, Icon]) => (
        <div key={label} className="rounded-[10px] border border-[var(--editable-border-soft)] bg-[var(--slot4-glass)] p-5">
          <div className="editable-mono flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.28em] text-[var(--slot4-page-text)]/45">
            <Icon className="h-3.5 w-3.5 text-[var(--tk-accent)]" /> {label}
          </div>
          <p className="mt-3 break-words text-sm font-medium leading-[1.6] text-[var(--slot4-page-text)]">{value}</p>
        </div>
      ))}
    </div>
  )
}

function ImageStrip({ images, label, large = false }: { images: string[]; label: string; large?: boolean }) {
  if (!images.length) return null
  return (
    <section className="mt-14">
      <p className="editable-mono text-[10px] font-medium uppercase tracking-[0.28em] text-[var(--slot4-page-text)]/45">{label}</p>
      <div className={`mt-5 grid gap-4 ${large ? 'sm:grid-cols-2' : 'grid-cols-2 sm:grid-cols-4'}`}>
        {images.slice(0, large ? 4 : 8).map((image, index) => (
          <img key={`${image}-${index}`} src={image} alt="" className="aspect-[4/3] rounded-[10px] border border-[var(--editable-border-soft)] object-cover" />
        ))}
      </div>
    </section>
  )
}

function MapBox({ src, label }: { src: string; label: string }) {
  return (
    <div className="overflow-hidden rounded-[10px] border border-[var(--editable-border-soft)] bg-[var(--slot4-glass)]">
      <div className="flex items-center gap-2 border-b border-[var(--editable-border-soft)] p-4 text-sm font-semibold text-[var(--slot4-page-text)]">
        <MapPin className="h-4 w-4 text-[var(--tk-accent)]" /> {label || 'Location'}
      </div>
      <iframe src={src} title="Map" loading="lazy" className="h-64 w-full border-0" />
    </div>
  )
}

function ContactAction({ website, phone, email, bare = false }: { website?: string; phone?: string; email?: string; bare?: boolean }) {
  if (!website && !phone && !email) return null
  const buttons = (
    <div className={`flex flex-wrap gap-2.5 ${bare ? 'justify-center' : ''}`}>
      {website ? (
        <Link
          href={website}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-full bg-[var(--tk-accent)] px-5 py-2.5 text-sm font-semibold text-[var(--tk-on-accent)] transition hover:brightness-110"
        >
          Website <ExternalLink className="h-4 w-4" />
        </Link>
      ) : null}
      {phone ? (
        <a href={`tel:${phone}`} className="inline-flex items-center gap-2 rounded-full border border-[var(--editable-border-soft)] px-4 py-2.5 text-sm font-semibold text-[var(--slot4-page-text)] transition hover:border-[var(--editable-border-soft)]">
          <Phone className="h-4 w-4" /> Call
        </a>
      ) : null}
      {email ? (
        <a href={`mailto:${email}`} className="inline-flex items-center gap-2 rounded-full border border-[var(--editable-border-soft)] px-4 py-2.5 text-sm font-semibold text-[var(--slot4-page-text)] transition hover:border-[var(--editable-border-soft)]">
          <Mail className="h-4 w-4" /> Email
        </a>
      ) : null}
    </div>
  )
  if (bare) return <div className="mt-6">{buttons}</div>
  return (
    <div className="rounded-[10px] border border-[var(--editable-border-soft)] bg-[var(--slot4-glass)] p-6">
      <p className="editable-mono text-[10px] font-medium uppercase tracking-[0.28em] text-[var(--slot4-page-text)]/45">Quick actions</p>
      <div className="mt-4">{buttons}</div>
    </div>
  )
}

function BadgeLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[var(--editable-border-soft)] py-3 text-sm">
      <span className="editable-mono text-[10px] font-medium uppercase tracking-[0.28em] text-[var(--slot4-page-text)]/50">{label}</span>
      <span className="font-semibold text-[var(--slot4-page-text)]">{value}</span>
    </div>
  )
}

/* -------------------------- ARTICLE (public) -------------------------- */
function ArticleDetail({ post, related, comments }: { post: SitePost; related: SitePost[]; comments: Array<{ id: string; name: string; comment: string; createdAt: string }> }) {
  const images = getImages(post)
  return (
    <>
      <article className="mx-auto max-w-3xl px-6 py-20 sm:py-28">
        <BackLink task="article" />
        <div className="mt-14">
          <Kicker task="article">{categoryOf(post, 'Editorial')}</Kicker>
        </div>
        <h1 className="editable-display mt-7 text-balance text-[2.5rem] font-semibold leading-[1.04] tracking-[-0.03em] sm:text-[3.5rem]">
          {post.title}
        </h1>
        {leadText(post) ? (
          <p className="mt-8 text-[1.25rem] leading-[1.55] text-[var(--slot4-page-text)]/75">{leadText(post)}</p>
        ) : null}
        {images[0] ? (
          <img src={images[0]} alt="" className="mt-12 aspect-[16/9] w-full rounded-[10px] border border-[var(--editable-border-soft)] object-cover" />
        ) : null}
        <BodyContent post={post} />
        <TagRow tags={tagsOf(post)} />
        <EditableArticleComments slug={post.slug} comments={comments} />
      </article>
      <RelatedStrip task="article" related={related} />
    </>
  )
}

/* -------------------------- LISTING -------------------------- */
function ListingDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const images = getImages(post)
  const logo = images[0]
  const address = getField(post, ['address', 'location', 'city'])
  const phone = getField(post, ['phone', 'telephone', 'mobile'])
  const email = getField(post, ['email'])
  const website = getField(post, ['website', 'url'])
  const mapSrc = mapSrcFor(post)
  return (
    <section className="mx-auto max-w-[var(--editable-container)] px-6 py-20 sm:py-28 lg:px-14">
      <BackLink task="listing" />
      <div className="mt-12 grid gap-12 lg:grid-cols-[minmax(0,1fr)_380px]">
        <article className="min-w-0">
          <Kicker task="listing">Listing</Kicker>
          <h1 className="editable-display mt-6 text-[2.5rem] font-semibold leading-[1.04] tracking-[-0.03em] sm:text-[3.25rem]">
            {post.title}
          </h1>
          {leadText(post) ? <p className="mt-6 max-w-2xl text-lg leading-[1.6] text-[var(--slot4-page-text)]/70">{leadText(post)}</p> : null}
          {logo ? <img src={logo} alt="" className="mt-10 aspect-[16/10] w-full rounded-[10px] border border-[var(--editable-border-soft)] object-cover" /> : null}
          <InfoGrid items={[['Location', address, MapPin], ['Phone', phone, Phone], ['Email', email, Mail], ['Website', website, Globe2]]} />
          <Divider />
          <BodyContent post={post} />
          <TagRow tags={tagsOf(post)} />
          <ImageStrip images={images.slice(1)} label="Showcase" />
        </article>
        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          {mapSrc ? <MapBox src={mapSrc} label={address || post.title} /> : null}
          <ContactAction website={website} phone={phone} email={email} />
        </aside>
      </div>
    </section>
  )
}

/* -------------------------- CLASSIFIED -------------------------- */
function ClassifiedDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const images = getImages(post)
  const price = getField(post, ['price', 'amount', 'budget'])
  const location = getField(post, ['location', 'address', 'city'])
  const condition = getField(post, ['condition', 'availability', 'type'])
  const phone = getField(post, ['phone', 'telephone', 'mobile'])
  const email = getField(post, ['email'])
  const website = getField(post, ['website', 'url'])
  return (
    <>
      <section className="mx-auto grid max-w-[var(--editable-container)] gap-12 px-6 py-20 sm:py-28 lg:grid-cols-[380px_minmax(0,1fr)] lg:px-14">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <BackLink task="classified" />
          <div className="mt-8 rounded-[10px] border border-[var(--editable-border-soft)] bg-[var(--slot4-glass)] p-8">
            <Kicker task="classified">Notice</Kicker>
            <h1 className="editable-display mt-5 text-3xl font-semibold leading-tight tracking-[-0.025em]">{post.title}</h1>
            <p className="editable-display mt-6 text-4xl font-semibold tracking-[-0.03em] text-[var(--tk-accent)]">{price || 'Open offer'}</p>
            <div className="mt-6 grid gap-1">
              {condition ? <BadgeLine label="Condition" value={condition} /> : null}
              {location ? <BadgeLine label="Location" value={location} /> : null}
            </div>
            <div className="mt-7 flex flex-wrap gap-3">
              {phone ? <a href={`tel:${phone}`} className="inline-flex items-center gap-2 rounded-full bg-[var(--tk-accent)] px-5 py-2.5 text-sm font-semibold text-[var(--tk-on-accent)] transition hover:brightness-110"><Phone className="h-4 w-4" /> Call</a> : null}
              {email ? <a href={`mailto:${email}`} className="inline-flex items-center gap-2 rounded-full border border-[var(--editable-border-soft)] px-5 py-2.5 text-sm font-semibold text-[var(--slot4-page-text)] transition hover:border-[var(--editable-border-soft)]"><Mail className="h-4 w-4" /> Email</a> : null}
            </div>
          </div>
        </aside>
        <article className="min-w-0">
          <ImageStrip images={images} label="Offer images" large />
          <BodyContent post={post} />
          <TagRow tags={tagsOf(post)} />
          <ContactAction website={website} phone={phone} email={email} />
        </article>
      </section>
      <RelatedStrip task="classified" related={related} />
    </>
  )
}

/* -------------------------- IMAGE -------------------------- */
function ImageDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const images = getImages(post)
  const gallery = images.length ? images : ['/placeholder.svg?height=900&width=1200']
  return (
    <>
      <section className="mx-auto max-w-[var(--editable-container)] px-6 py-20 sm:py-28 lg:px-14">
        <BackLink task="image" />
        <div className="mt-12 grid gap-12 lg:grid-cols-[1.5fr_0.6fr]">
          <div className="columns-1 gap-5 [column-fill:_balance] sm:columns-2">
            {gallery.map((image, index) => (
              <figure key={`${image}-${index}`} className="mb-5 break-inside-avoid overflow-hidden rounded-[10px] border border-[var(--editable-border-soft)] bg-[var(--slot4-glass)]">
                <img src={image} alt="" className="w-full object-cover" />
              </figure>
            ))}
          </div>
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <Kicker task="image">Visual</Kicker>
            <h1 className="editable-display mt-6 text-4xl font-semibold leading-[1.04] tracking-[-0.025em] sm:text-5xl">{post.title}</h1>
            {leadText(post) ? <p className="mt-6 text-lg leading-[1.65] text-[var(--slot4-page-text)]/70">{leadText(post)}</p> : null}
            <BodyContent post={post} compact />
            <TagRow tags={tagsOf(post)} />
          </aside>
        </div>
      </section>
      <RelatedStrip task="image" related={related} />
    </>
  )
}

/* -------------------------- BOOKMARK -------------------------- */
function BookmarkDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const website = getField(post, ['website', 'url', 'link'])
  return (
    <>
      <article className="mx-auto max-w-3xl px-6 py-20 sm:py-28">
        <BackLink task="sbm" />
        <div className="mt-12 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--tk-accent-soft)] text-[var(--tk-accent)]">
          <Bookmark className="h-7 w-7" />
        </div>
        <div className="mt-6"><Kicker task="sbm">Saved resource</Kicker></div>
        <h1 className="editable-display mt-5 text-4xl font-semibold leading-[1.04] tracking-[-0.025em] sm:text-5xl">{post.title}</h1>
        {leadText(post) ? <p className="mt-6 text-lg leading-[1.65] text-[var(--slot4-page-text)]/70">{leadText(post)}</p> : null}
        {website ? (
          <Link href={website} target="_blank" rel="noreferrer" className="mt-8 inline-flex items-center gap-2 rounded-full bg-[var(--tk-accent)] px-6 py-3.5 text-sm font-semibold text-[var(--tk-on-accent)] transition hover:brightness-110">
            Open resource <ExternalLink className="h-4 w-4" />
          </Link>
        ) : null}
        <BodyContent post={post} />
        <TagRow tags={tagsOf(post)} />
      </article>
      <RelatedStrip task="sbm" related={related} />
    </>
  )
}

/* ================================================================== */
/*  Shared building blocks for PDF + Profile "Cover Spread" detail    */
/* ================================================================== */

/** Perspective document glyph — tilted card look for the hero, flat for tiles. */
function DocumentGlyph({
  label = 'PDF',
  size = 'md',
  variant = 'flat',
}: {
  label?: string
  size?: 'hero' | 'lg' | 'md' | 'sm'
  variant?: 'flat' | 'perspective'
}) {
  const dims =
    size === 'hero' ? 'h-64 w-52' : size === 'lg' ? 'h-32 w-24' : size === 'md' ? 'h-16 w-14' : 'h-11 w-9'
  const fontSize =
    size === 'hero' ? 'text-[15px]' : size === 'lg' ? 'text-[12px]' : size === 'md' ? 'text-[10px]' : 'text-[9px]'
  const inner = (
    <div
      className={`relative flex ${dims} flex-col items-center justify-end overflow-hidden rounded-[8px] bg-[var(--tk-accent-soft)] text-[var(--tk-accent)] shadow-[inset_0_0_0_1px_rgba(48,109,41,0.35)]`}
    >
      <div className={`absolute inset-x-3 top-3 ${size === 'hero' ? 'space-y-2.5' : 'space-y-1'}`}>
        {(size === 'hero' ? [1, 0.85, 0.6, 0.9, 0.5, 0.75] : [1, 0.8, 0.6]).map((w, i) => (
          <div key={i} className={size === 'hero' ? 'h-1.5 rounded-full bg-current opacity-20' : 'h-1 rounded-full bg-current opacity-25'} style={{ width: `${w * 100}%` }} />
        ))}
      </div>
      <span className={`editable-mono ${size === 'hero' ? 'mb-4' : 'mb-2'} font-semibold uppercase tracking-[0.16em] ${fontSize}`}>{label}</span>
    </div>
  )
  if (variant === 'perspective') {
    return (
      <div
        className="relative"
        style={{ perspective: '1200px' }}
      >
        <div
          style={{ transform: 'rotateY(-14deg) rotateX(6deg) rotateZ(-2deg)', boxShadow: '0 40px 80px -20px rgba(48,109,41,0.35), 0 60px 120px -40px rgba(0,0,0,0.6)' }}
          className="rounded-[10px]"
        >
          {inner}
        </div>
        {/* Ghost card behind for depth */}
        <div
          aria-hidden
          style={{ transform: 'rotateY(-14deg) rotateX(6deg) rotateZ(3deg) translate(6px, 12px)' }}
          className={`absolute inset-0 -z-10 rounded-[10px] border border-[var(--editable-border-soft)] bg-[var(--slot4-glass)]`}
        />
      </div>
    )
  }
  return inner
}

/** Sticky sub-nav rail with jump anchors + primary CTA. */
function DetailAnchorRail({
  anchors,
  primary,
}: {
  anchors: Array<{ href: string; label: string }>
  primary?: { label: string; href: string; icon?: React.ReactNode; external?: boolean }
}) {
  return (
    <div className="sticky top-[72px] z-30 -mx-6 mt-16 border-b border-[var(--editable-border-soft)] bg-[color-mix(in_oklab,var(--tk-bg)_92%,black)]/85 backdrop-blur-xl lg:-mx-14">
      <div className="mx-auto flex max-w-[var(--editable-container)] items-center gap-1 overflow-x-auto px-6 py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:px-14">
        <nav className="flex min-w-0 items-center gap-1">
          {anchors.map((a) => (
            <Link
              key={a.href}
              href={a.href}
              className="editable-mono shrink-0 rounded-full px-4 py-2 text-[10px] font-medium uppercase tracking-[0.24em] text-[var(--slot4-page-text)]/60 transition hover:bg-[var(--slot4-glass)] hover:text-[var(--slot4-page-text)]"
            >
              {a.label}
            </Link>
          ))}
        </nav>
        {primary ? (
          <Link
            href={primary.href}
            target={primary.external ? '_blank' : undefined}
            rel={primary.external ? 'noreferrer' : undefined}
            className="ml-auto inline-flex shrink-0 items-center gap-2 rounded-full bg-[var(--tk-accent)] px-5 py-2.5 text-xs font-semibold text-[var(--tk-on-accent)] transition hover:brightness-110"
          >
            {primary.icon}
            {primary.label}
          </Link>
        ) : null}
      </div>
    </div>
  )
}

/** Reusable meta card for the triptych row. */
function MetaCard({
  eyebrow,
  icon,
  children,
  accent = false,
}: {
  eyebrow: string
  icon?: React.ReactNode
  children: React.ReactNode
  accent?: boolean
}) {
  return (
    <div
      className={`flex flex-col rounded-[14px] border p-8 ${
        accent ? 'border-[var(--tk-accent)]/45 bg-[linear-gradient(155deg,rgba(48,109,41,0.14),rgba(48,109,41,0.02))]' : 'border-[var(--editable-border-soft)] bg-[var(--slot4-glass)]'
      }`}
    >
      <div className="flex items-center gap-2.5">
        {icon ? <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--slot4-glass)] text-[var(--tk-accent)]">{icon}</span> : null}
        <span className="editable-mono text-[10px] font-medium uppercase tracking-[0.28em] text-[var(--slot4-page-text)]/55">{eyebrow}</span>
      </div>
      <div className="mt-6 flex-1">{children}</div>
    </div>
  )
}

/** Compact stat pill used inside the cinematic hero. */
function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="inline-flex items-center gap-2.5 rounded-full border border-[var(--editable-border-soft)] bg-[var(--slot4-glass)] px-4 py-2 backdrop-blur-md">
      <span className="editable-mono text-[10px] font-medium uppercase tracking-[0.24em] text-[var(--slot4-page-text)]/50">{label}</span>
      <span className="editable-display text-sm font-semibold tracking-[-0.01em] text-[var(--slot4-page-text)]">{value}</span>
    </div>
  )
}

/* ================================================================== */
/*  PDF (REFERENCE LIBRARY) — "Cover Spread" magazine feature layout   */
/* ================================================================== */
function PdfDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const content = getContent(post)
  const fileUrl = getField(post, ['fileUrl', 'pdfUrl', 'documentUrl', 'url'])
  const category = categoryOf(post, 'Reference')
  const format = (getField(post, ['format', 'fileType']) || 'PDF').toUpperCase()
  const uploader = getField(post, ['author', 'uploader', 'contributor']) || SITE_CONFIG.name
  const filename = getField(post, ['filename', 'file']) || `${post.slug || 'document'}.pdf`
  const insideItems: string[] = Array.isArray(content.sections)
    ? (content.sections as unknown[]).filter((s): s is string => typeof s === 'string').slice(0, 6)
    : []
  const fallbackInside = ['Overview & context', 'Methodology & scope', 'Key findings', 'Detailed analysis', 'References & sources']
  const insideList = insideItems.length ? insideItems : fallbackInside
  const tags = tagsOf(post)
  const lead = leadText(post)

  const anchors = [
    { href: '#pdf-preview', label: 'Preview' },
    { href: '#pdf-about', label: 'About' },
    { href: '#pdf-inside', label: 'Inside' },
    { href: '#pdf-related', label: 'Related' },
  ]

  return (
    <>
      {/* ============ 1. Cinematic hero cover ============ */}
      <section className="on-dark relative overflow-hidden border-b border-[var(--editable-border-soft)] bg-[var(--slot4-dark-bg)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_80%_at_15%_50%,rgba(48,109,41,0.25),transparent_65%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.15)_0%,rgba(0,0,0,0.55)_100%)]" />

        <div className="relative mx-auto max-w-[var(--editable-container)] px-6 pb-24 pt-14 sm:pb-28 lg:px-14 lg:pb-32 lg:pt-16">
          <BackLink task="pdf" />

          <div className="mt-12 grid gap-14 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-center lg:gap-20">
            {/* Perspective document cover */}
            <div className="flex items-center justify-center py-10 lg:py-16">
              <DocumentGlyph label={format} size="hero" variant="perspective" />
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="editable-mono inline-flex items-center gap-2 rounded-full bg-[var(--tk-accent)] px-3.5 py-1.5 text-[10px] font-medium uppercase tracking-[0.32em] text-[var(--slot4-page-text)]">
                  Reference · {format}
                </span>
                <span className="editable-mono inline-flex items-center gap-2 rounded-full border border-[var(--editable-border-soft)] px-3.5 py-1.5 text-[10px] font-medium uppercase tracking-[0.28em] text-[var(--slot4-page-text)]/75">
                  {category}
                </span>
              </div>

              <h1 className="editable-display mt-8 text-balance text-[2.75rem] font-semibold leading-[1.0] tracking-[-0.035em] sm:text-[3.75rem] lg:text-[4.5rem]">
                {post.title}
              </h1>

              {lead ? (
                <p className="mt-8 max-w-2xl text-[1.15rem] leading-[1.55] text-[var(--slot4-page-text)]/70 sm:text-[1.25rem]">{lead}</p>
              ) : null}

              {/* Stat pill row */}
              <div className="mt-10 flex flex-wrap gap-2.5">
                <StatPill label="Format" value={format} />
                <StatPill label="Category" value={category} />
                <StatPill label="By" value={uploader} />
              </div>

              {/* CTAs */}
              <div className="mt-10 flex flex-wrap items-center gap-4">
                {fileUrl ? (
                  <>
                    <Link
                      href={fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-full bg-[var(--tk-accent)] px-7 py-4 text-sm font-semibold text-[var(--tk-on-accent)] transition duration-300 hover:brightness-110 hover:-translate-y-0.5"
                    >
                      <Download className="h-4 w-4" /> Download
                    </Link>
                    <Link
                      href={fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-full border border-[var(--editable-border-soft)] px-7 py-4 text-sm font-semibold text-[var(--slot4-page-text)] transition duration-300 hover:border-[var(--editable-border-soft)]"
                    >
                      Open in new tab <ExternalLink className="h-4 w-4" />
                    </Link>
                  </>
                ) : (
                  <span className="editable-mono text-[11px] font-medium uppercase tracking-[0.24em] text-[var(--slot4-page-text)]/50">
                    File will be attached soon
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Filename strip — the cinema-style caption */}
        <div className="relative border-t border-[var(--editable-border-soft)] bg-[var(--slot4-dark-bg)]/40 backdrop-blur-md">
          <div className="mx-auto flex max-w-[var(--editable-container)] items-center gap-3 overflow-hidden px-6 py-4 lg:px-14">
            <span className="editable-mono shrink-0 text-[10px] font-medium uppercase tracking-[0.28em] text-[var(--slot4-page-text)]/45">Filename</span>
            <span className="editable-mono truncate text-sm font-medium text-[var(--slot4-page-text)]/85">{filename}</span>
          </div>
        </div>
      </section>

      {/* ============ 2. Sticky anchor rail ============ */}
      <div className="mx-auto w-full max-w-[var(--editable-container)] px-6 lg:px-14">
        <DetailAnchorRail
          anchors={anchors}
          primary={fileUrl ? { label: 'Download', href: fileUrl, external: true, icon: <Download className="h-3.5 w-3.5" /> } : undefined}
        />
      </div>

      {/* ============ 3. Full-width cinematic preview ============ */}
      {fileUrl ? (
        <section id="pdf-preview" className="on-dark border-b border-[var(--editable-border-soft)] bg-[var(--slot4-dark-bg)] py-16 sm:py-20 lg:py-24">
          <div className="mx-auto max-w-[calc(var(--editable-container)+120px)] px-6 lg:px-10">
            <div className="editable-mono mb-5 flex items-center justify-between gap-3 text-[10px] font-medium uppercase tracking-[0.28em] text-[var(--slot4-page-text)]/50">
              <span className="inline-flex items-center gap-2"><FileText className="h-3 w-3 text-[var(--tk-accent)]" /> Live preview</span>
              <span>{format} · full document</span>
            </div>
            <div className="overflow-hidden rounded-[16px] border border-[var(--editable-border-soft)] bg-[var(--tk-raised)] shadow-[0_40px_120px_-20px_rgba(0,0,0,0.7)]">
              <div className="flex items-center gap-2 border-b border-[var(--editable-border-soft)] px-5 py-3">
                <span className="h-2.5 w-2.5 rounded-full bg-[var(--slot4-cream)]/20" />
                <span className="h-2.5 w-2.5 rounded-full bg-[var(--slot4-cream)]/15" />
                <span className="h-2.5 w-2.5 rounded-full bg-[var(--slot4-cream)]/10" />
                <span className="editable-mono ml-4 truncate text-[10px] font-medium uppercase tracking-[0.24em] text-[var(--slot4-page-text)]/45">
                  {filename}
                </span>
              </div>
              <iframe src={`${fileUrl}#toolbar=0&navpanes=0&scrollbar=0`} title={post.title} className="h-[85vh] w-full bg-[var(--tk-raised)]" />
            </div>
          </div>
        </section>
      ) : null}

      {/* ============ 4. Meta triptych ============ */}
      <section className="border-b border-[var(--editable-border-soft)] bg-[var(--tk-bg)] py-20 sm:py-24 lg:py-28">
        <div className="mx-auto max-w-[var(--editable-container)] px-6 lg:px-14">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* The document */}
            <MetaCard eyebrow="The document" icon={<FileText className="h-4 w-4" />}>
              <div className="grid gap-1">
                <BadgeLine label="Category" value={category} />
                <BadgeLine label="Uploaded by" value={uploader} />
                <BadgeLine label="Format" value={format} />
              </div>
              {fileUrl ? (
                <Link
                  href={fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--tk-accent)] px-5 py-3.5 text-sm font-semibold text-[var(--tk-on-accent)] transition hover:brightness-110"
                >
                  <Download className="h-4 w-4" /> Get the file
                </Link>
              ) : null}
            </MetaCard>

            {/* Inside */}
            <MetaCard eyebrow="What's inside" icon={<BookOpen className="h-4 w-4" />} accent>
              <ul className="grid gap-3.5 text-sm text-[var(--slot4-page-text)]/80">
                {insideList.map((item, i) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="editable-mono mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--slot4-dark-bg)]/30 text-[10px] font-medium text-[var(--tk-accent)]">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="leading-[1.55]">{item}</span>
                  </li>
                ))}
              </ul>
            </MetaCard>

            {/* Tags + share */}
            <MetaCard eyebrow="Signals" icon={<Tag className="h-4 w-4" />}>
              {tags.length ? (
                <div className="flex flex-wrap gap-2">
                  {tags.map((t) => (
                    <span key={t} className="editable-mono inline-flex items-center gap-1.5 rounded-full border border-[var(--editable-border-soft)] bg-[var(--slot4-glass)] px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.24em] text-[var(--slot4-page-text)]/70">
                      #{t}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[var(--slot4-page-text)]/50">No tags yet.</p>
              )}
              <div className="mt-8 border-t border-[var(--editable-border-soft)] pt-6">
                <p className="editable-mono text-[10px] font-medium uppercase tracking-[0.28em] text-[var(--slot4-page-text)]/50">Share</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {fileUrl ? (
                    <Link
                      href={fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-full border border-[var(--editable-border-soft)] px-4 py-2 text-xs font-semibold text-[var(--slot4-page-text)] transition hover:border-[var(--editable-border-soft)]"
                    >
                      <ExternalLink className="h-3.5 w-3.5" /> File link
                    </Link>
                  ) : null}
                  <span className="inline-flex items-center gap-2 rounded-full border border-[var(--editable-border-soft)] px-4 py-2 text-xs font-medium text-[var(--slot4-page-text)]/50">
                    <BookOpen className="h-3.5 w-3.5" /> Cite this reference
                  </span>
                </div>
              </div>
            </MetaCard>
          </div>
        </div>
      </section>

      {/* ============ 5. Reading column ============ */}
      <section id="pdf-about" className="border-b border-[var(--editable-border-soft)] bg-[var(--tk-bg)] py-20 sm:py-24 lg:py-28">
        <div className="mx-auto max-w-3xl px-6">
          <p className="editable-mono text-[10px] font-medium uppercase tracking-[0.32em] text-[var(--tk-accent)]">
            Editorial notes
          </p>
          <h2 className="editable-display mt-5 text-balance text-[2.25rem] font-semibold leading-[1.05] tracking-[-0.03em] sm:text-[2.75rem]">
            About this document
          </h2>
          <BodyContent post={post} />
        </div>
      </section>

      {/* ============ 6. Repeated CTA callout ============ */}
      {fileUrl ? (
        <section className="border-b border-[var(--editable-border-soft)] bg-[var(--tk-bg)]">
          <div className="mx-auto max-w-3xl px-6 pb-12 sm:pb-16">
            <div className="flex flex-col gap-5 rounded-[16px] border border-[var(--tk-accent)]/45 bg-[linear-gradient(140deg,rgba(48,109,41,0.16),rgba(48,109,41,0.02))] p-8 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="editable-mono text-[10px] font-medium uppercase tracking-[0.3em] text-[var(--tk-accent)]">Keep a copy</p>
                <p className="editable-display mt-3 text-xl font-semibold tracking-[-0.015em] text-[var(--slot4-page-text)] sm:text-2xl">
                  Download the full {format}
                </p>
              </div>
              <Link
                href={fileUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-[var(--tk-accent)] px-6 py-3.5 text-sm font-semibold text-[var(--tk-on-accent)] transition hover:brightness-110"
              >
                <Download className="h-4 w-4" /> Download
              </Link>
            </div>
          </div>
        </section>
      ) : null}

      {/* ============ 7. In-article ad ============ */}
      <section id="pdf-inside" className="border-b border-[var(--editable-border-soft)] bg-[var(--tk-bg)] py-16">
        <div className="mx-auto max-w-3xl px-6">
          <Ads slot="article-bottom" size={pickRandom(getSlotSizes('article-bottom'))} showLabel />
        </div>
      </section>

      {/* ============ 8. Related as horizontal snap rail ============ */}
      {related.length ? <PdfRelatedRail related={related} /> : null}
    </>
  )
}

/** Horizontal snap-rail of related documents. Uses SVG glyphs (no photos). */
function PdfRelatedRail({ related }: { related: SitePost[] }) {
  const taskConfig = getTaskConfig('pdf')
  const theme = getTaskTheme('pdf')
  return (
    <section id="pdf-related" className="on-dark bg-[var(--slot4-dark-bg)] py-20 sm:py-24 lg:py-28">
      <div className="mx-auto max-w-[var(--editable-container)] px-6 lg:px-14">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="editable-mono text-[10px] font-medium uppercase tracking-[0.32em] text-[var(--tk-accent)]">Related references</p>
            <h2 className="editable-display mt-3 text-2xl font-semibold tracking-[-0.02em] sm:text-3xl">
              More in the {theme.kicker.toLowerCase()}
            </h2>
          </div>
          <Link href={taskConfig?.route || '/'} className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--tk-accent)] hover:brightness-110">
            Browse all <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
      <div className="mt-10 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="mx-auto flex w-max max-w-none gap-5 px-6 lg:px-14">
          {related.map((item) => {
            const href = `${taskConfig?.route || '/pdf'}/${item.slug}`
            const fmt = (getField(item, ['format', 'fileType']) || 'PDF').toUpperCase()
            const itemCategory = categoryOf(item, 'Reference')
            return (
              <Link
                key={item.id || item.slug}
                href={href}
                className="on-light group flex w-[320px] shrink-0 snap-start flex-col rounded-[14px] border border-[var(--editable-border-soft)] bg-[var(--tk-surface)] p-7 transition duration-500 hover:-translate-y-1 hover:border-[var(--editable-border-soft)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <DocumentGlyph label={fmt} size="lg" />
                  <span className="editable-mono rounded-full border border-[var(--editable-border-soft)] px-3 py-1 text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--slot4-page-text)]/60">
                    {itemCategory}
                  </span>
                </div>
                <h3 className="editable-display mt-8 line-clamp-3 text-lg font-semibold leading-tight tracking-[-0.015em] text-[var(--slot4-page-text)]">
                  {item.title}
                </h3>
                <div className="mt-auto flex items-center justify-between pt-6">
                  <span className="editable-mono text-[10px] font-medium uppercase tracking-[0.24em] text-[var(--slot4-page-text)]/55">
                    {fmt}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--tk-accent)]">
                    Open <ArrowUpRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}

/* ================================================================== */
/*  PROFILE (Contributor) — coherent "Cover Spread" variant            */
/*  Direct-URL-only, never promoted, but treated as a premium record.  */
/* ================================================================== */
function ProfileDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const theme = getTaskTheme('profile')
  const images = getImages(post)
  const avatar = images[0]
  const role = getField(post, ['role', 'designation', 'title', 'company'])
  const location = getField(post, ['location', 'address', 'city'])
  const website = getField(post, ['website', 'url'])
  const email = getField(post, ['email'])
  const phone = getField(post, ['phone', 'telephone', 'mobile'])
  const mapSrc = mapSrcFor(post)
  const linksList: string[] = [website].filter((x): x is string => Boolean(x))
  const verified = Boolean(getField(post, ['verified']))
  const tags = tagsOf(post)
  const lead = leadText(post)

  const anchors = [
    { href: '#profile-about', label: 'About' },
    { href: '#profile-contact', label: 'Contact' },
    { href: '#profile-trust', label: 'Trust' },
    ...(related.length ? [{ href: '#profile-work', label: 'Work' }] : []),
  ]
  const primaryHref = website || (email ? `mailto:${email}` : phone ? `tel:${phone}` : '')

  return (
    <>
      {/* ============ 1. Cinematic hero cover ============ */}
      <section className="on-dark relative overflow-hidden border-b border-[var(--editable-border-soft)] bg-[var(--slot4-dark-bg)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_80%_at_15%_50%,rgba(48,109,41,0.22),transparent_65%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.15)_0%,rgba(0,0,0,0.55)_100%)]" />

        <div className="relative mx-auto max-w-[var(--editable-container)] px-6 pb-24 pt-14 sm:pb-28 lg:px-14 lg:pb-32 lg:pt-16">
          <BackLink task="profile" />

          <div className="mt-12 grid gap-14 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-center lg:gap-20">
            {/* Portrait framed like a magazine cover */}
            <div className="flex items-center justify-center py-4 lg:py-10">
              <div className="relative">
                <div
                  className="relative h-64 w-52 overflow-hidden rounded-[14px] border border-[var(--editable-border-soft)] bg-[var(--tk-raised)] shadow-[0_40px_80px_-20px_rgba(48,109,41,0.35),0_60px_120px_-40px_rgba(0,0,0,0.6)]"
                  style={{ transform: 'rotateY(-6deg) rotateX(3deg)' }}
                >
                  {avatar ? (
                    <img src={avatar} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(160deg,rgba(48,109,41,0.35),rgba(48,109,41,0.05))]">
                      <UserRound className="h-24 w-24 text-[var(--slot4-page-text)]/50" />
                    </div>
                  )}
                  {/* Accent frame corner */}
                  <div className="absolute inset-x-0 bottom-0 h-16 bg-[linear-gradient(180deg,transparent,rgba(0,0,0,0.75))]" />
                  <div className="editable-mono absolute bottom-4 left-4 text-[10px] font-semibold uppercase tracking-[0.24em] text-[var(--slot4-page-text)]/90">
                    {theme.kicker}
                  </div>
                </div>
                {/* Ghost card for depth */}
                <div
                  aria-hidden
                  className="absolute inset-0 -z-10 rounded-[14px] border border-[var(--editable-border-soft)] bg-[var(--slot4-glass)]"
                  style={{ transform: 'rotateY(-6deg) rotateX(3deg) translate(8px, 14px)' }}
                />
              </div>
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="editable-mono inline-flex items-center gap-2 rounded-full bg-[var(--tk-accent)] px-3.5 py-1.5 text-[10px] font-medium uppercase tracking-[0.32em] text-[var(--slot4-page-text)]">
                  {theme.kicker} record
                </span>
                {verified ? (
                  <span className="editable-mono inline-flex items-center gap-2 rounded-full border border-[var(--editable-border-soft)] px-3.5 py-1.5 text-[10px] font-medium uppercase tracking-[0.28em] text-[var(--slot4-page-text)]/80">
                    <ShieldCheck className="h-3 w-3 text-[var(--tk-accent)]" /> Verified
                  </span>
                ) : null}
              </div>

              <h1 className="editable-display mt-8 text-balance text-[2.75rem] font-semibold leading-[1.0] tracking-[-0.035em] sm:text-[3.75rem] lg:text-[4.5rem]">
                {post.title}
              </h1>
              {role ? <p className="mt-5 text-[1.25rem] text-[var(--slot4-page-text)]/70">{role}</p> : null}

              {/* Stat pill row */}
              <div className="mt-10 flex flex-wrap gap-2.5">
                <StatPill label="Location" value={location || '—'} />
                <StatPill label="Links" value={linksList.length ? String(linksList.length) : '—'} />
                <StatPill label="Contributions" value={String(related.length || 0)} />
                <StatPill label="Status" value={verified ? 'Verified' : 'Active'} />
              </div>

              {/* CTAs */}
              <div className="mt-10 flex flex-wrap items-center gap-4">
                {primaryHref ? (
                  <Link
                    href={primaryHref}
                    target={website ? '_blank' : undefined}
                    rel={website ? 'noreferrer' : undefined}
                    className="inline-flex items-center gap-2 rounded-full bg-[var(--tk-accent)] px-7 py-4 text-sm font-semibold text-[var(--tk-on-accent)] transition duration-300 hover:brightness-110 hover:-translate-y-0.5"
                  >
                    Get in touch <ArrowRight className="h-4 w-4" />
                  </Link>
                ) : null}
                <Link
                  href="#profile-work"
                  className="inline-flex items-center gap-2 rounded-full border border-[var(--editable-border-soft)] px-7 py-4 text-sm font-semibold text-[var(--slot4-page-text)] transition duration-300 hover:border-[var(--editable-border-soft)]"
                >
                  See contributions
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Byline strip */}
        <div className="relative border-t border-[var(--editable-border-soft)] bg-[var(--slot4-dark-bg)]/40 backdrop-blur-md">
          <div className="mx-auto flex max-w-[var(--editable-container)] items-center gap-3 overflow-hidden px-6 py-4 lg:px-14">
            <span className="editable-mono shrink-0 text-[10px] font-medium uppercase tracking-[0.28em] text-[var(--slot4-page-text)]/45">Record of</span>
            <span className="editable-mono truncate text-sm font-medium text-[var(--slot4-page-text)]/85">{post.title}{role ? ` · ${role}` : ''}</span>
          </div>
        </div>
      </section>

      {/* ============ 2. Sticky anchor rail ============ */}
      <div className="mx-auto w-full max-w-[var(--editable-container)] px-6 lg:px-14">
        <DetailAnchorRail
          anchors={anchors}
          primary={
            primaryHref
              ? {
                  label: 'Get in touch',
                  href: primaryHref,
                  external: Boolean(website),
                  icon: <Mail className="h-3.5 w-3.5" />,
                }
              : undefined
          }
        />
      </div>

      {/* ============ 3. Cinematic pull-quote / map centerpiece ============ */}
      {lead || mapSrc ? (
        <section className="on-dark border-b border-[var(--editable-border-soft)] bg-[var(--slot4-dark-bg)] py-16 sm:py-20 lg:py-24">
          <div className="mx-auto max-w-[calc(var(--editable-container)+120px)] px-6 lg:px-10">
            {lead ? (
              <blockquote className="editable-display mx-auto max-w-4xl text-balance text-center text-[1.75rem] font-medium leading-[1.35] tracking-[-0.02em] text-[var(--slot4-page-text)]/90 sm:text-[2.25rem] lg:text-[2.75rem]">
                “{lead}”
              </blockquote>
            ) : mapSrc ? (
              <div className="overflow-hidden rounded-[16px] border border-[var(--editable-border-soft)] bg-[var(--tk-raised)] shadow-[0_40px_120px_-20px_rgba(0,0,0,0.7)]">
                <div className="flex items-center gap-2 border-b border-[var(--editable-border-soft)] px-5 py-3">
                  <MapPin className="h-3.5 w-3.5 text-[var(--tk-accent)]" />
                  <span className="editable-mono truncate text-[10px] font-medium uppercase tracking-[0.24em] text-[var(--slot4-page-text)]/60">
                    {location || post.title}
                  </span>
                </div>
                <iframe src={mapSrc} title="Location" loading="lazy" className="h-[60vh] w-full border-0" />
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      {/* ============ 4. Meta triptych ============ */}
      <section id="profile-contact" className="border-b border-[var(--editable-border-soft)] bg-[var(--tk-bg)] py-20 sm:py-24 lg:py-28">
        <div className="mx-auto max-w-[var(--editable-container)] px-6 lg:px-14">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Contact */}
            <MetaCard eyebrow="Contact" icon={<Mail className="h-4 w-4" />}>
              <div className="grid gap-1">
                {location ? <ContactRow icon={MapPin} label="Address" value={location} /> : null}
                {phone ? <ContactRow icon={Phone} label="Phone" value={phone} href={`tel:${phone}`} /> : null}
                {email ? <ContactRow icon={Mail} label="Email" value={email} href={`mailto:${email}`} /> : null}
                {website ? <ContactRow icon={Globe2} label="Website" value={website.replace(/^https?:\/\//, '')} href={website} external /> : null}
                {linksList.length > 1
                  ? linksList.slice(1).map((l) => (
                      <ContactRow key={l} icon={LinkIcon} label="Link" value={l.replace(/^https?:\/\//, '')} href={l} external />
                    ))
                  : null}
                {!location && !phone && !email && !website ? (
                  <p className="text-sm text-[var(--slot4-page-text)]/50">Contact channels will appear once provided.</p>
                ) : null}
              </div>
              {primaryHref ? (
                <Link
                  href={primaryHref}
                  target={website ? '_blank' : undefined}
                  rel={website ? 'noreferrer' : undefined}
                  className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--tk-accent)] px-5 py-3.5 text-sm font-semibold text-[var(--tk-on-accent)] transition hover:brightness-110"
                >
                  Get in touch <ArrowRight className="h-4 w-4" />
                </Link>
              ) : null}
            </MetaCard>

            {/* About / facts */}
            <MetaCard eyebrow="At a glance" icon={<UserRound className="h-4 w-4" />} accent>
              <div className="grid gap-1">
                <BadgeLine label="Location" value={location || '—'} />
                <BadgeLine label="Contributions" value={String(related.length || 0)} />
                <BadgeLine label="Status" value={verified ? 'Verified' : 'Active'} />
              </div>
              {tags.length ? (
                <div className="mt-8 border-t border-[var(--editable-border-soft)] pt-6">
                  <p className="editable-mono text-[10px] font-medium uppercase tracking-[0.28em] text-[var(--slot4-page-text)]/50">Areas</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {tags.map((t) => (
                      <span key={t} className="editable-mono inline-flex items-center gap-1.5 rounded-full border border-[var(--editable-border-soft)] bg-[var(--slot4-glass)] px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.24em] text-[var(--slot4-page-text)]/70">
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
            </MetaCard>

            {/* Trust */}
            <MetaCard eyebrow="Trust" icon={<ShieldCheck className="h-4 w-4" />}>
              <ul className="grid gap-4 text-sm text-[var(--slot4-page-text)]/80">
                {[
                  'Verified identity on record',
                  'Contributor to the reference library',
                  'Reachable through platform contacts',
                ].map((line) => (
                  <li key={line} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--tk-accent-soft)] text-[var(--tk-accent)]">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    </span>
                    <span className="leading-[1.6]">{line}</span>
                  </li>
                ))}
              </ul>
              {/* Sidebar ad — placed inside the trust panel column of the triptych */}
              <div className="mt-8 border-t border-[var(--editable-border-soft)] pt-6">
                <Ads slot="sidebar" size={pickRandom(getSlotSizes('sidebar'))} showLabel />
              </div>
            </MetaCard>
          </div>
        </div>
      </section>

      {/* ============ 5. Reading column ============ */}
      <section id="profile-about" className="border-b border-[var(--editable-border-soft)] bg-[var(--tk-bg)] py-20 sm:py-24 lg:py-28">
        <div className="mx-auto max-w-3xl px-6">
          <p className="editable-mono text-[10px] font-medium uppercase tracking-[0.32em] text-[var(--tk-accent)]">Bio</p>
          <h2 className="editable-display mt-5 text-balance text-[2.25rem] font-semibold leading-[1.05] tracking-[-0.03em] sm:text-[2.75rem]">
            About {post.title.split(' ')[0]}
          </h2>
          <BodyContent post={post} />
          <TagRow tags={tags} />
        </div>
      </section>

      {/* ============ 6. Trust re-anchor + optional map full-width when lead was used ============ */}
      {lead && mapSrc ? (
        <section id="profile-trust" className="on-dark border-b border-[var(--editable-border-soft)] bg-[var(--slot4-dark-bg)]">
          <div className="mx-auto max-w-[calc(var(--editable-container)+120px)] px-6 py-16 lg:px-10 lg:py-24">
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <p className="editable-mono text-[10px] font-medium uppercase tracking-[0.32em] text-[var(--tk-accent)]">Located</p>
                <h3 className="editable-display mt-3 text-2xl font-semibold tracking-[-0.02em] sm:text-3xl">
                  {location || 'On the map'}
                </h3>
              </div>
            </div>
            <div className="overflow-hidden rounded-[16px] border border-[var(--editable-border-soft)] bg-[var(--tk-raised)]">
              <iframe src={mapSrc} title="Location" loading="lazy" className="h-[55vh] w-full border-0" />
            </div>
          </div>
        </section>
      ) : (
        <section id="profile-trust" className="hidden" aria-hidden />
      )}

      {/* ============ 7. Contributions rail — points into Reference Library ============ */}
      {related.length ? <ContributorLibraryRail related={related} authorName={post.title} /> : null}
    </>
  )
}

/** Horizontal snap-rail of the contributor's Reference Library entries.
 *  NEVER links to other profiles — only into the public library. */
function ContributorLibraryRail({ related, authorName }: { related: SitePost[]; authorName: string }) {
  const pdfConfig = getTaskConfig('pdf')
  const theme = getTaskTheme('pdf')
  return (
    <section id="profile-work" className="on-dark bg-[var(--slot4-dark-bg)] py-20 sm:py-24 lg:py-28">
      <div className="mx-auto max-w-[var(--editable-container)] px-6 lg:px-14">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="editable-mono text-[10px] font-medium uppercase tracking-[0.32em] text-[var(--tk-accent)]">
              From the {theme.kicker.toLowerCase()}
            </p>
            <h2 className="editable-display mt-3 text-2xl font-semibold tracking-[-0.02em] sm:text-3xl">
              Contributions from {authorName}
            </h2>
          </div>
          <Link href={pdfConfig?.route || '/'} className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--tk-accent)] hover:brightness-110">
            Browse the library <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
      <div className="mt-10 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="mx-auto flex w-max max-w-none gap-5 px-6 lg:px-14">
          {related.map((item) => {
            const href = `${pdfConfig?.route || '/pdf'}/${item.slug}`
            const fmt = (getField(item, ['format', 'fileType']) || 'PDF').toUpperCase()
            const itemCategory = categoryOf(item, 'Reference')
            return (
              <Link
                key={item.id || item.slug}
                href={href}
                className="on-light group flex w-[320px] shrink-0 snap-start flex-col rounded-[14px] border border-[var(--editable-border-soft)] bg-[var(--tk-surface)] p-7 transition duration-500 hover:-translate-y-1 hover:border-[var(--editable-border-soft)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <DocumentGlyph label={fmt} size="lg" />
                  <span className="editable-mono rounded-full border border-[var(--editable-border-soft)] px-3 py-1 text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--slot4-page-text)]/60">
                    {itemCategory}
                  </span>
                </div>
                <h3 className="editable-display mt-8 line-clamp-3 text-lg font-semibold leading-tight tracking-[-0.015em] text-[var(--slot4-page-text)]">
                  {item.title}
                </h3>
                <div className="mt-auto flex items-center justify-between pt-6">
                  <span className="editable-mono text-[10px] font-medium uppercase tracking-[0.24em] text-[var(--slot4-page-text)]/55">
                    {fmt}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--tk-accent)]">
                    Open <ArrowUpRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function ContactRow({ icon: Icon, label, value, href, external }: { icon: typeof MapPin; label: string; value: string; href?: string; external?: boolean }) {
  const inner = (
    <>
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--slot4-glass)] text-[var(--tk-accent)]">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="editable-mono text-[10px] font-medium uppercase tracking-[0.28em] text-[var(--slot4-page-text)]/45">{label}</p>
        <p className="mt-1 break-words text-sm font-semibold text-[var(--slot4-page-text)] [overflow-wrap:anywhere]">{value}</p>
      </div>
      {href ? <ArrowUpRight className="mt-2 h-4 w-4 shrink-0 text-[var(--slot4-page-text)]/30 group-hover:text-[var(--tk-accent)]" /> : null}
    </>
  )
  if (href) {
    return (
      <a
        href={href}
        target={external ? '_blank' : undefined}
        rel={external ? 'noreferrer' : undefined}
        className="group flex min-w-0 items-start gap-3 rounded-lg border-b border-[var(--editable-border-soft)] py-3 transition hover:bg-[var(--slot4-glass)]"
      >
        {inner}
      </a>
    )
  }
  return <div className="flex min-w-0 items-start gap-3 border-b border-[var(--editable-border-soft)] py-3">{inner}</div>
}

/* -------------------------- Related strip (article/listing/etc.) -------------------------- */
function RelatedStrip({ task, related }: { task: TaskKey; related: SitePost[] }) {
  if (!related.length) return null
  const taskConfig = getTaskConfig(task)
  return (
    <section className="border-t border-[var(--editable-border-soft)]">
      <div className="mx-auto max-w-[var(--editable-container)] px-6 py-16 sm:py-20 lg:px-14">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="editable-mono text-[10px] font-medium uppercase tracking-[0.28em] text-[var(--tk-accent)]">More</p>
            <h2 className="editable-display mt-3 text-2xl font-semibold tracking-[-0.02em] sm:text-3xl">
              More {(taskConfig?.label || 'entries').toLowerCase()}
            </h2>
          </div>
          <Link href={taskConfig?.route || '/'} className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--tk-accent)] hover:brightness-110">
            Browse all <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {related.map((item) => {
            const image = getImages(item)[0]
            const href = `${taskConfig?.route || `/${task}`}/${item.slug}`
            return (
              <Link key={item.id || item.slug} href={href} className="group block overflow-hidden rounded-[10px] border border-[var(--editable-border-soft)] bg-[var(--slot4-glass)] transition duration-500 hover:-translate-y-1 hover:border-[var(--editable-border-soft)]">
                <div className="aspect-[16/10] overflow-hidden bg-[var(--tk-raised)]">
                  {image ? (
                    <img src={image} alt="" className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]" />
                  ) : (
                    <div className="flex h-full items-center justify-center"><Layers className="h-7 w-7 text-[var(--slot4-page-text)]/25" /></div>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="editable-display line-clamp-2 text-base font-semibold leading-snug tracking-[-0.01em] text-[var(--slot4-page-text)]">{item.title}</h3>
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--slot4-page-text)]/55">{stripHtml(summaryText(item))}</p>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
