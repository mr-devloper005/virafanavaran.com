import Link from 'next/link'
import { ArrowRight, ChevronLeft } from 'lucide-react'
import type { SitePost, SiteFeedPagination } from '@/lib/site-connector'
import { CATEGORY_OPTIONS } from '@/lib/categories'
import { taskPageVoices } from '@/editable/content/task-pages.content'
import { pagesContent } from '@/editable/content/pages.content'
import { editableDesignContract as dc } from '@/editable/layouts/design-contract'
import { ArticleListCard, postHref } from '@/editable/cards/PostCards'

export function EditableArticleArchive({
  posts,
  pagination,
  category = 'all',
  basePath = '/article',
}: {
  posts: SitePost[]
  pagination: SiteFeedPagination
  category?: string
  basePath?: string
}) {
  const voice = taskPageVoices.article
  const page = pagination.page || 1
  const pageHref = (nextPage: number) =>
    `${basePath}?${new URLSearchParams({ ...(category && category !== 'all' ? { category } : {}), page: String(nextPage) }).toString()}`

  return (
    <main className={dc.shell.page}>
      <section className={`${dc.shell.section} pt-20 sm:pt-24 lg:pt-32`}>
        <div className="rounded-[10px] border border-[var(--editable-border-soft)] bg-[var(--slot4-glass)] p-10 lg:p-14">
          <p className="editable-mono text-[11px] font-medium uppercase tracking-[0.28em] text-[var(--slot4-accent)]">
            {voice.eyebrow}
          </p>
          <h1 className="editable-display mt-6 max-w-4xl text-balance text-[3rem] font-semibold leading-[1.02] tracking-[-0.035em] sm:text-[4rem]">
            {voice.headline}
          </h1>
          <p className="mt-8 max-w-2xl text-lg leading-[1.65] text-[var(--slot4-page-text)]/65">{voice.description}</p>
          <form action={basePath} className="mt-10 flex max-w-xl flex-col gap-3 sm:flex-row">
            <select
              name="category"
              defaultValue={category || 'all'}
              className="min-w-0 flex-1 rounded-full border border-[var(--editable-border-soft)] bg-[var(--slot4-dark-bg)]/40 px-5 py-3 text-sm font-medium text-[var(--slot4-page-text)] outline-none"
            >
              <option value="all">All categories</option>
              {CATEGORY_OPTIONS.map((item) => (
                <option key={item.slug} value={item.slug}>
                  {item.name}
                </option>
              ))}
            </select>
            <button className="rounded-full bg-[var(--slot4-accent)] px-6 py-3 text-sm font-semibold text-[var(--slot4-page-text)] transition hover:brightness-110">
              Filter
            </button>
          </form>
        </div>
      </section>

      <section className={`${dc.shell.section} ${dc.shell.sectionY}`}>
        {posts.length ? (
          <div className="grid gap-6">
            {posts.map((post, index) => (
              <ArticleListCard
                key={post.id}
                post={post}
                href={postHref('article', post, basePath)}
                index={index + (page - 1) * pagination.limit}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-[10px] border border-[var(--editable-border-soft)] bg-[var(--slot4-glass)] p-12 text-center">
            <h2 className="editable-display text-2xl font-semibold tracking-[-0.02em]">No entries</h2>
            <p className="mt-3 text-sm leading-[1.7] text-[var(--slot4-page-text)]/60">Try another category, or head back to the full archive.</p>
          </div>
        )}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-3">
          {pagination.hasPrevPage ? (
            <Link href={pageHref(page - 1)} className="rounded-full border border-[var(--editable-border-soft)] px-5 py-3 text-sm font-semibold text-[var(--slot4-page-text)]">
              Previous
            </Link>
          ) : null}
          <span className="rounded-full border border-[var(--editable-border-soft)] bg-[var(--slot4-glass)] px-5 py-3 text-sm font-medium text-[var(--slot4-page-text)]/65">
            Page {page} of {pagination.totalPages || 1}
          </span>
          {pagination.hasNextPage ? (
            <Link href={pageHref(page + 1)} className="rounded-full border border-[var(--editable-border-soft)] px-5 py-3 text-sm font-semibold text-[var(--slot4-page-text)]">
              Next
            </Link>
          ) : null}
        </div>
      </section>
    </main>
  )
}

export function EditableArticleDetailShell({ slug, post }: { slug: string; post: SitePost | null }) {
  const voice = taskPageVoices.article
  return (
    <main className={dc.shell.page}>
      <section className={`${dc.shell.section} pt-16 sm:pt-20 lg:pt-24`}>
        <div className="grid gap-8 rounded-[10px] border border-[var(--editable-border-soft)] bg-[var(--slot4-glass)] p-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:p-14">
          <div className="min-w-0">
            <Link
              href="/article"
              className="inline-flex items-center gap-2 rounded-full border border-[var(--editable-border-soft)] px-4 py-2 text-sm font-semibold text-[var(--slot4-page-text)]/85"
            >
              <ChevronLeft className="h-4 w-4" /> Back
            </Link>
            <p className="editable-mono mt-10 text-[11px] font-medium uppercase tracking-[0.28em] text-[var(--slot4-accent)]">
              {voice.eyebrow}
            </p>
            <h1 className="editable-display mt-5 max-w-4xl text-[2.75rem] font-semibold leading-[1.04] tracking-[-0.03em] sm:text-[3.5rem] lg:text-[4rem]">
              {post?.title || pagesContent.detailPages.article.fallbackTitle}
            </h1>
          </div>
          <aside className="min-w-0 rounded-[10px] bg-[var(--slot4-dark-bg)]/40 p-7">
            <p className="editable-mono text-[10px] font-medium uppercase tracking-[0.28em] text-[var(--slot4-accent)]">
              Editorial note
            </p>
            <p className="mt-4 text-sm leading-[1.7] text-[var(--slot4-page-text)]/65">{voice.secondaryNote}</p>
            <Link
              href="/contact"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-[var(--slot4-page-text)]"
            >
              Get in touch <ArrowRight className="h-4 w-4" />
            </Link>
          </aside>
        </div>
      </section>
      <section className="mx-auto w-full max-w-3xl px-6 pb-20 pt-8 sm:pb-24 lg:pb-32">
        <div className="rounded-[10px] border border-[var(--editable-border-soft)] bg-[var(--slot4-glass)] p-8 sm:p-10">
          <p className="text-[1.0625rem] leading-[1.75] text-[var(--slot4-page-text)]/70">
            {post?.summary || `Editorial content for ${slug} will render through the detail page.`}
          </p>
        </div>
      </section>
    </main>
  )
}
