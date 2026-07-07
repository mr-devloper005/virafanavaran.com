import type { TaskKey } from '@/lib/site-config'

export type TaskPageVoice = {
  eyebrow: string
  headline: string
  description: string
  filterLabel: string
  secondaryNote: string
  chips: string[]
}

/*
  Copy per task archive. `pdf` = Reference Library (public), `profile` =
  Contributor (never surfaced publicly). All other tasks stay functional
  but their archive is not promoted in this site's public navigation.
*/
export const taskPageVoices = {
  pdf: {
    eyebrow: 'Reference Library',
    headline: 'A quiet library of reference material, always open.',
    description:
      'Curated reports, studies, guides and reference documents — searchable by category, downloadable in one click, no signup wall in the way.',
    filterLabel: 'Filter by category',
    secondaryNote: 'The library grows steadily; the freshest entries always sit up top.',
    chips: ['Free to read', 'Every entry downloadable', 'Curated by hand'],
  },
  profile: {
    eyebrow: 'Contributor',
    headline: 'The people behind the reference library.',
    description: 'Records of contributors and the material they have brought into the reference library.',
    filterLabel: 'Filter contributors',
    secondaryNote: 'Contributor pages live at their own direct URL only.',
    chips: ['Verified contributors', 'Editorial curation', 'Reader-first'],
  },
  article: {
    eyebrow: 'Editorial',
    headline: 'Long-form reads that give context to the reference material.',
    description:
      'Essays and long-form pieces that frame the material in the reference library — background, methodology, and considered analysis.',
    filterLabel: 'Filter by topic',
    secondaryNote: 'Reading space, hierarchy, and fewer distractions.',
    chips: ['Editorial pacing', 'Long-read friendly'],
  },
  listing: {
    eyebrow: 'Directory',
    headline: 'Structured entries, organized for discovery.',
    description: 'Directory-style entries with the metadata that matters up front.',
    filterLabel: 'Filter category',
    secondaryNote: 'Prioritize comparison and direct action paths.',
    chips: ['Directory', 'Compare'],
  },
  classified: {
    eyebrow: 'Notices',
    headline: 'Time-sensitive posts, easy to scan.',
    description: 'Notices and offers, presented with the essentials up front and no editorial decoration.',
    filterLabel: 'Filter notice category',
    secondaryNote: 'Fast scan, direct browsing.',
    chips: ['Fast scan', 'Time-sensitive'],
  },
  image: {
    eyebrow: 'Visuals',
    headline: 'A visual index — gallery-first browsing.',
    description: 'Visual entries with a portfolio-like rhythm.',
    filterLabel: 'Filter visuals',
    secondaryNote: 'Let the image carry the page.',
    chips: ['Gallery', 'Portfolio mood'],
  },
  sbm: {
    eyebrow: 'Bookmarks',
    headline: 'Saved links worth returning to.',
    description: 'Curated shelves of resources, tools and references.',
    filterLabel: 'Filter collection',
    secondaryNote: 'Grouped, tagged, and calm.',
    chips: ['Collections', 'References'],
  },
} satisfies Record<TaskKey, TaskPageVoice>
