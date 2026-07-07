'use client'

import Link from 'next/link'
import { ArrowUpRight, ArrowRight } from 'lucide-react'
import { SITE_CONFIG, getTaskConfig } from '@/lib/site-config'
import { globalContent } from '@/editable/content/global.content'
import { useEditableLocalAuthSession } from '@/editable/components/EditableLocalAuthForms'
import { getTaskTheme } from '@/editable/theme/task-themes'

export function EditableFooter() {
  const year = new Date().getFullYear()
  const { session, logout } = useEditableLocalAuthSession()

  // Public discovery — Reference Library only. Profiles never appear here.
  const pdfConfig = getTaskConfig('pdf')
  const libraryLabel = getTaskTheme('pdf').kicker
  const discoveryLinks = pdfConfig?.enabled
    ? [{ label: libraryLabel, href: pdfConfig.route, note: 'Browse the full library' }]
    : []

  const resourceLinks: Array<[string, string]> = [
    ['About', '/about'],
    ['Contact', '/contact'],
    ['Search', '/search'],
  ]

  const accountLinks: Array<[string, string]> = session
    ? [['Submit a resource', '/create']]
    : [['Sign in', '/login'], ['Get started', '/signup']]

  return (
    <footer className="on-dark border-t border-[var(--editable-border-soft)] bg-[var(--editable-footer-bg)] text-[var(--slot4-page-text)]">
      {/* CTA strip */}
      <section className="border-b border-[var(--editable-border-soft)]">
        <div className="mx-auto grid max-w-[var(--editable-container)] gap-8 px-5 py-16 sm:px-8 lg:grid-cols-[1.4fr_1fr] lg:items-center lg:px-14 lg:py-24">
          <div>
            <p className="editable-mono text-[11px] font-medium uppercase tracking-[0.3em] text-[var(--slot4-accent)]">Get started</p>
            <h2 className="editable-display mt-4 text-3xl font-semibold leading-[1.08] tracking-[-0.025em] sm:text-4xl lg:text-[3rem]">
              A calmer place for reference material.
            </h2>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center lg:justify-end">
            {pdfConfig?.enabled ? (
              <Link
                href={pdfConfig.route}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--slot4-accent)] px-7 py-4 text-sm font-semibold text-[var(--slot4-page-text)] transition duration-300 hover:brightness-110 hover:-translate-y-0.5"
              >
                Enter the {libraryLabel.toLowerCase()} <ArrowRight className="h-4 w-4" />
              </Link>
            ) : null}
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-[var(--editable-border-soft)] px-7 py-4 text-sm font-semibold text-[var(--slot4-page-text)] transition duration-300 hover:border-[var(--editable-border-soft)]"
            >
              Talk to us
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-[var(--editable-container)] gap-14 px-5 py-16 sm:px-8 lg:grid-cols-[1.4fr_1fr_1fr_1fr] lg:px-14">
        <div>
          <Link href="/" className="inline-flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center bg-[var(--slot4-accent)]">
              <img src="/favicon.png?v=20260413" alt={SITE_CONFIG.name} className="h-8 w-8 object-contain" />
            </span>
            <span className="editable-display text-xl font-semibold tracking-[-0.01em]">{SITE_CONFIG.name}</span>
          </Link>
          <p className="mt-5 max-w-sm text-sm leading-7 text-[var(--slot4-page-text)]/60">
            {globalContent.footer?.description}
          </p>
        </div>

        <div>
          <h3 className="editable-mono text-[11px] font-medium uppercase tracking-[0.28em] text-[var(--slot4-page-text)]/50">Discovery</h3>
          <div className="mt-5 grid gap-3">
            {discoveryLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group inline-flex items-center justify-between gap-3 text-sm font-medium text-[var(--slot4-page-text)]/85 transition hover:text-[var(--slot4-page-text)]"
              >
                <span>{link.label}</span>
                <ArrowUpRight className="h-3.5 w-3.5 text-[var(--slot4-page-text)]/40 transition group-hover:text-[var(--slot4-accent)]" />
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h3 className="editable-mono text-[11px] font-medium uppercase tracking-[0.28em] text-[var(--slot4-page-text)]/50">Resources</h3>
          <div className="mt-5 grid gap-3">
            {resourceLinks.map(([label, href]) => (
              <Link key={href} href={href} className="text-sm font-medium text-[var(--slot4-page-text)]/70 transition hover:text-[var(--slot4-page-text)]">
                {label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h3 className="editable-mono text-[11px] font-medium uppercase tracking-[0.28em] text-[var(--slot4-page-text)]/50">Account</h3>
          <div className="mt-5 grid gap-3">
            {accountLinks.map(([label, href]) => (
              <Link key={href} href={href} className="text-sm font-medium text-[var(--slot4-page-text)]/70 transition hover:text-[var(--slot4-page-text)]">
                {label}
              </Link>
            ))}
            {session ? (
              <button
                type="button"
                onClick={logout}
                className="text-left text-sm font-medium text-[var(--slot4-page-text)]/70 transition hover:text-[var(--slot4-page-text)]"
              >
                Logout
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <div className="border-t border-[var(--editable-border-soft)] px-5 py-6 sm:px-8 lg:px-14">
        <div className="mx-auto flex max-w-[var(--editable-container)] flex-col items-center justify-between gap-2 text-xs font-medium text-[var(--slot4-page-text)]/45 sm:flex-row">
          <p>© {year} {SITE_CONFIG.name}. All rights reserved.</p>
          <p>Built for reference readers.</p>
        </div>
      </div>
    </footer>
  )
}
