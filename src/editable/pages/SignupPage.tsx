import type { Metadata } from 'next'
import Link from 'next/link'
import { buildPageMetadata } from '@/lib/seo'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { EditableLocalSignupForm } from '@/editable/components/EditableLocalAuthForms'
import { pagesContent } from '@/editable/content/pages.content'

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({ path: '/signup', title: 'Get started', description: pagesContent.auth.signup.metadataDescription })
}

export default function SignupPage() {
  return (
    <EditableSiteShell>
      <main className="min-h-screen bg-[var(--slot4-page-bg)] text-[var(--slot4-page-text)]">
        <section className="mx-auto grid min-h-[calc(100vh-12rem)] max-w-[var(--editable-container)] items-center gap-16 px-6 py-24 sm:py-32 lg:grid-cols-[0.95fr_1.05fr] lg:px-14">
          <div className="rounded-[10px] border border-[var(--editable-border-soft)] bg-[var(--slot4-glass)] p-8 sm:p-10">
            <h1 className="editable-display text-2xl font-semibold tracking-[-0.02em] text-[var(--slot4-page-text)]">
              {pagesContent.auth.signup.formTitle}
            </h1>
            <EditableLocalSignupForm />
            <p className="mt-8 text-sm text-[var(--slot4-page-text)]/55">
              Already a contributor?{' '}
              <Link href="/login" className="font-semibold text-[var(--slot4-accent)] hover:brightness-110">
                {pagesContent.auth.signup.loginCta}
              </Link>
            </p>
          </div>
          <div>
            <p className="editable-mono text-[11px] font-medium uppercase tracking-[0.28em] text-[var(--slot4-accent)]">
              {pagesContent.auth.signup.badge}
            </p>
            <h2 className="editable-display mt-6 max-w-xl text-[3rem] font-semibold leading-[1.02] tracking-[-0.035em] sm:text-[4rem]">
              {pagesContent.auth.signup.title}
            </h2>
            <p className="mt-8 max-w-lg text-lg leading-[1.65] text-[var(--slot4-page-text)]/65">{pagesContent.auth.signup.description}</p>
          </div>
        </section>
      </main>
    </EditableSiteShell>
  )
}
