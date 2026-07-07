import { slot4BrandConfig } from '@/editable/theme/brand.config'

// Public-facing copy for a Reference Library platform. Profiles never
// surface in public copy — no "Profiles" links, no profile CTAs.
export const globalContent = {
  site: {
    name: slot4BrandConfig.siteName,
    tagline: slot4BrandConfig.tagline || 'An independent reference library',
    domain: slot4BrandConfig.domain,
    baseUrl: slot4BrandConfig.baseUrl,
  },
  nav: {
    tagline: 'An independent reference library',
    searchPlaceholder: 'Search the reference library',
    primaryLinks: [
      { label: 'About', href: '/about' },
      { label: 'Contact', href: '/contact' },
    ],
    actions: {
      primary: { label: 'Get started', href: '/signup' },
      secondary: { label: 'Sign in', href: '/login' },
    },
  },
  footer: {
    tagline: 'Reference material, calmly organized',
    description:
      'A quiet, editorially-curated reference library. Search, read, and download reports, guides and studies — no signup wall, no clutter.',
    columns: [
      {
        title: 'Discovery',
        links: [{ label: 'Reference Library', href: '/pdf' }],
      },
      {
        title: 'Resources',
        links: [
          { label: 'About', href: '/about' },
          { label: 'Contact', href: '/contact' },
          { label: 'Search', href: '/search' },
        ],
      },
    ],
    bottomNote: 'Built for reference readers.',
  },
  commonLabels: {
    readMore: 'Read entry',
    viewAll: 'Browse all',
    explore: 'Explore',
    latest: 'Latest',
    related: 'Related',
    published: 'Published',
  },
} as const
