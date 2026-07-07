import { slot4BrandConfig } from '@/editable/theme/brand.config'

export const pagesContent = {
  home: {
    metadata: {
      title: 'A quiet reference library, always open',
      description:
        'Read and download curated reference material — reports, guides, studies — through a calm, editorial reference library.',
      openGraphTitle: 'A quiet reference library, always open',
      openGraphDescription: 'Curated reference material with no signup wall. Read inline or download to keep.',
      keywords: ['reference library', 'downloadable reports', 'research studies', 'guides', 'reading platform'],
    },
    hero: {
      badge: 'Independent reference library',
      title: ['Reference material,', 'without the noise.'],
      description:
        'A curated reference library — searchable, downloadable, and calmly organized. Read inline or take the file with you.',
      primaryCta: { label: 'Enter the library', href: '/pdf' },
      secondaryCta: { label: 'Search resources', href: '/search' },
      searchPlaceholder: 'Search the reference library',
      focusLabel: 'Focus',
      featureCardBadge: 'Recently added',
      featureCardTitle: 'The freshest entries drive the homepage rhythm.',
      featureCardDescription:
        'The most recently added references stay at the centre — the site reflects what is actually in the library right now.',
    },
    intro: {
      badge: 'What this is',
      title: 'Built around one thing: making reference material easy to reach.',
      paragraphs: [
        'This is a small, quietly curated reference library. Everything inside is meant to be read carefully, referenced later, or downloaded and kept.',
        'The homepage stays out of the way — it exists to point you at the most recent, most useful entries and let you disappear into them.',
        'No paywalls, no accounts required for reading, no dashboard demanding your attention. Just the material and a way to find it.',
      ],
      sideBadge: 'The floor',
      sidePoints: [
        'Every entry is free to read and download.',
        'Every entry is tagged, categorized and searchable.',
        'The homepage always reflects what was added most recently.',
        'The reader gets the file, no sign-up wall in the way.',
      ],
      primaryLink: { label: 'Enter the library', href: '/pdf' },
      secondaryLink: { label: 'About the project', href: '/about' },
    },
    cta: {
      badge: 'Start reading',
      title: 'The library is open. Come in.',
      description: 'Everything is one click away — read what is inside, or download the file for later.',
      primaryCta: { label: 'Enter the library', href: '/pdf' },
      secondaryCta: { label: 'Contact us', href: '/contact' },
    },
    taskSection: {
      heading: 'Latest in the library',
      descriptionSuffix: 'The most recent entries added to the reference library.',
    },
  },
  about: {
    badge: 'About',
    title: 'A calmer place for reference material.',
    description: `${slot4BrandConfig.siteName} is a small, deliberately quiet reference library — built for people who want the material, not the noise around it.`,
    paragraphs: [
      'Everything inside the library is chosen because it is worth returning to. The tagging is done by hand, the categories stay small, and nothing is added just to fill space.',
      'The reader always comes first: read inline, download when you want, no signup wall, no distractions.',
      'If something feels missing, tell us. The library grows through recommendations from readers as much as from editorial curation.',
    ],
    values: [
      {
        title: 'Reader-first, always',
        description: 'No paywalls, no forced accounts, no dark patterns. If you want the file, you get the file.',
      },
      {
        title: 'Curated, not crowd-sourced',
        description: 'Every entry is chosen and tagged by hand. Small library, high signal.',
      },
      {
        title: 'Built to last',
        description: 'The reference material stays where you left it. No feeds, no algorithms, no rot.',
      },
    ],
  },
  contact: {
    eyebrow: `Contact ${slot4BrandConfig.siteName}`,
    title: 'Have a question, a correction, or a resource to add?',
    description:
      'Tell us what you are trying to find, fix, or contribute. The message goes to the small team behind the library — no ticketing system in the way.',
    formTitle: 'Send a message',
  },
  search: {
    metadata: {
      title: 'Search',
      description: 'Search the reference library for reports, guides, studies, and reference material.',
    },
    hero: {
      badge: 'Search the library',
      title: 'Find the exact reference you need.',
      description: 'Use keywords, categories, or content types to narrow the reference library to what actually matters.',
      placeholder: 'Search by keyword, category, or title',
    },
    resultsTitle: 'Latest entries in the library',
  },
  create: {
    metadata: {
      title: 'Submit',
      description: 'Submit a new reference for the library.',
    },
    locked: {
      badge: 'Contributor access',
      title: 'Sign in to submit a reference.',
      description: 'Use your contributor account to open the submission workspace and add a new entry to the reference library.',
    },
    hero: {
      badge: 'Submission workspace',
      title: 'Add a reference to the library.',
      description: 'Choose the entry type, add details, and prepare a clean submission with cover, summary and body content.',
    },
    formTitle: 'Entry details',
    submitLabel: 'Submit for review',
    successTitle: 'Entry submitted for review.',
  },
  auth: {
    login: {
      metadataDescription: 'Sign in to contribute to the reference library.',
      badge: 'Contributor access',
      title: 'Welcome back.',
      description: 'Sign in to manage your submissions and continue adding to the reference library.',
      formTitle: 'Sign in',
      submitLabel: 'Continue',
      noAccount: 'No account matched these details. Create a contributor account first, then sign in.',
      success: 'Signed in. Redirecting…',
      createCta: 'Create a contributor account',
    },
    signup: {
      metadataDescription: 'Create a contributor account for the reference library.',
      badge: 'Contributor access',
      title: 'Create your contributor account.',
      description: 'Contributor accounts unlock the submission workspace so you can add references to the library.',
      formTitle: 'Create account',
      submitLabel: 'Create account',
      passwordShort: 'Use at least 4 characters for the password.',
      success: 'Account created. Redirecting…',
      loginCta: 'Sign in instead',
    },
  },
  detailPages: {
    article: {
      relatedTitle: 'Related entries',
      fallbackTitle: 'Entry details',
    },
    listing: {
      relatedTitle: 'Related entries',
      fallbackTitle: 'Entry details',
    },
    image: {
      relatedTitle: 'Related visuals',
      fallbackTitle: 'Visual details',
    },
    profile: {
      relatedTitle: 'From the reference library',
      fallbackDescription: 'Contributor details will appear here once available.',
      visitButton: 'Visit official site',
    },
  },
} as const
