'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, Search, X } from 'lucide-react'
import { SITE_CONFIG } from '@/lib/site-config'
import { globalContent } from '@/editable/content/global.content'
import { useEditableLocalAuthSession } from '@/editable/components/EditableLocalAuthForms'

// Only static, non-task nav destinations. Task archives are never linked
// from the navbar — public discovery lives in the footer + search.
const STATIC_LINKS: Array<{ label: string; href: string }> = [
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
]

export function EditableNavbar() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const { session, logout } = useEditableLocalAuthSession()

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--editable-border-soft)] bg-[var(--editable-nav-bg)] text-[var(--slot4-page-text)] backdrop-blur-xl">
      <nav className="mx-auto flex min-h-[72px] w-full max-w-[var(--editable-container)] items-center gap-8 px-5 sm:px-8 lg:px-14">
        <Link href="/" className="group flex shrink-0 items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center bg-[var(--slot4-accent)] text-[var(--slot4-on-accent)] transition duration-500 group-hover:brightness-110">
            <img src="/favicon.png?v=20260413" alt={SITE_CONFIG.name} className="h-8 w-8 object-contain" />
          </span>
          <span className="editable-display text-lg font-semibold tracking-[-0.01em] text-[var(--slot4-page-text)] sm:text-xl">
            {SITE_CONFIG.name}
          </span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {STATIC_LINKS.map((item) => {
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-4 py-2 text-sm font-medium transition duration-300 ${
                  active ? 'bg-[var(--slot4-glass)] text-[var(--slot4-page-text)]' : 'text-[var(--slot4-page-text)]/70 hover:bg-[var(--slot4-glass)] hover:text-[var(--slot4-page-text)]'
                }`}
              >
                {item.label}
              </Link>
            )
          })}
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-2">
          <Link
            href="/search"
            aria-label="Search"
            className="hidden h-10 w-10 items-center justify-center rounded-full border border-[var(--editable-border)]/10 text-[var(--slot4-page-text)]/80 transition duration-300 hover:border-[var(--editable-border)]/25 hover:text-[var(--slot4-page-text)] sm:inline-flex"
          >
            <Search className="h-4 w-4" />
          </Link>
          {session ? (
            <>
              <Link
                href="/create"
                className="hidden items-center gap-2 rounded-full bg-[var(--slot4-accent)] px-5 py-2.5 text-sm font-semibold text-[var(--slot4-on-accent)] transition duration-300 hover:brightness-110 sm:inline-flex"
              >
                Submit
              </Link>
              <button
                type="button"
                onClick={logout}
                className="hidden rounded-full px-3 py-2 text-sm font-medium text-[var(--slot4-page-text)]/70 transition duration-300 hover:text-[var(--slot4-page-text)] sm:inline-flex"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden rounded-full px-4 py-2.5 text-sm font-medium text-[var(--slot4-page-text)]/85 transition duration-300 hover:text-[var(--slot4-page-text)] sm:inline-flex"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="hidden items-center gap-2 rounded-full bg-[var(--slot4-accent)] px-5 py-2.5 text-sm font-semibold text-[var(--slot4-on-accent)] transition duration-300 hover:brightness-110 sm:inline-flex"
              >
                Get started
              </Link>
            </>
          )}
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--editable-border)]/10 text-[var(--slot4-page-text)] md:hidden"
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {open ? (
        <div className="border-t border-[var(--editable-border)]/5 bg-[var(--slot4-page-bg)] px-5 py-5 md:hidden">
          <form action="/search" className="mb-4 flex items-center gap-3 rounded-full border border-[var(--editable-border)]/10 bg-[var(--slot4-glass)] px-4 py-2.5">
            <Search className="h-4 w-4 text-[var(--slot4-page-text)]/60" />
            <input
              name="q"
              type="search"
              placeholder={globalContent.nav?.searchPlaceholder || 'Search the library'}
              className="min-w-0 flex-1 bg-transparent text-sm text-[var(--slot4-page-text)] outline-none placeholder:text-[var(--slot4-page-text)]/45"
            />
          </form>
          <div className="grid gap-1">
            {[{ label: 'Home', href: '/' }, ...STATIC_LINKS, ...(session ? [{ label: 'Submit', href: '/create' }] : [{ label: 'Sign in', href: '/login' }, { label: 'Get started', href: '/signup' }])].map(
              (item) => {
                const active = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`rounded-xl px-4 py-3 text-sm font-medium transition ${
                      active ? 'bg-[var(--slot4-glass)] text-[var(--slot4-page-text)]' : 'text-[var(--slot4-page-text)]/70 hover:bg-[var(--slot4-glass)] hover:text-[var(--slot4-page-text)]'
                    }`}
                  >
                    {item.label}
                  </Link>
                )
              }
            )}
            {session ? (
              <button
                type="button"
                onClick={() => {
                  setOpen(false)
                  logout()
                }}
                className="rounded-xl px-4 py-3 text-left text-sm font-medium text-[var(--slot4-page-text)]/70 transition hover:bg-[var(--slot4-glass)] hover:text-[var(--slot4-page-text)]"
              >
                Logout
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </header>
  )
}
