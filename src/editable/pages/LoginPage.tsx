import type { Metadata } from 'next'
import Link from 'next/link'
import { buildPageMetadata } from '@/lib/seo'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { EditableLocalLoginForm } from '@/editable/components/EditableLocalAuthForms'
import { pagesContent } from '@/editable/content/pages.content'

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({ path: '/login', title: 'Sign in', description: pagesContent.auth.login.metadataDescription })
}

export default function LoginPage() {
  return (
    <EditableSiteShell>
      <main className="min-h-screen bg-[var(--slot4-page-bg)] text-[var(--slot4-page-text)]">
        <section className="mx-auto grid min-h-[calc(100vh-12rem)] max-w-[var(--editable-container)] items-center gap-16 px-6 py-24 sm:py-32 lg:grid-cols-[1.05fr_0.95fr] lg:px-14">
          <div>
            <p className="editable-mono text-[11px] font-medium uppercase tracking-[0.28em] text-[var(--slot4-accent)]">
              {pagesContent.auth.login.badge}
            </p>
            <h1 className="editable-display mt-6 max-w-xl text-[3rem] font-semibold leading-[1.02] tracking-[-0.035em] sm:text-[4rem]">
              {pagesContent.auth.login.title}
            </h1>
            <p className="mt-8 max-w-lg text-lg leading-[1.65] text-[var(--slot4-page-text)]/65">{pagesContent.auth.login.description}</p>
          </div>
          <div className="rounded-[10px] border border-[var(--editable-border-soft)] bg-[var(--slot4-glass)] p-8 sm:p-10">
            <h2 className="editable-display text-2xl font-semibold tracking-[-0.02em] text-[var(--slot4-page-text)]">
              {pagesContent.auth.login.formTitle}
            </h2>
            <EditableLocalLoginForm />
            <p className="mt-8 text-sm text-[var(--slot4-page-text)]/55">
              New here?{' '}
              <Link href="/signup" className="font-semibold text-[var(--slot4-accent)] hover:brightness-110">
                {pagesContent.auth.login.createCta}
              </Link>
            </p>
          </div>
        </section>
      </main>
    </EditableSiteShell>
  )
}
