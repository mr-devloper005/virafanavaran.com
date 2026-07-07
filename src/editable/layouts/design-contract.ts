import type { CSSProperties } from 'react'

// Cream + green editorial palette.
//   #FBF5DD — page cream    #E7E1B1 — panel cream    #306D29 — mid green    #0D530E — deep green
export const editableRootStyle = {
  '--slot4-page-bg': '#FBF5DD',
  '--slot4-page-text': '#0D530E',
  '--slot4-panel-bg': '#E7E1B1',
  '--slot4-surface-bg': '#FBF5DD',
  '--slot4-muted-text': '#306D29',
  '--slot4-soft-muted-text': 'rgba(48,109,41,0.65)',
  '--slot4-accent': '#306D29',
  '--slot4-accent-fill': '#306D29',
  '--slot4-accent-soft': 'rgba(48,109,41,0.14)',
  '--slot4-accent-strong': '#0D530E',
  '--slot4-on-accent': '#FBF5DD',
  '--slot4-dark-bg': '#0D530E',
  '--slot4-dark-text': '#FBF5DD',
  '--slot4-media-bg': '#E7E1B1',
  '--slot4-cream': '#FBF5DD',
  '--slot4-warm': '#F3ECBE',
  '--slot4-lavender': '#E7E1B1',
  '--slot4-gray': '#E7E1B1',
  '--slot4-body-gradient': 'none',
  // Universal subtle-panel tint that reads in both light + dark sections
  '--slot4-glass': 'rgba(48,109,41,0.08)',
  '--slot4-glass-strong': 'rgba(48,109,41,0.14)',
  '--editable-page-bg': '#FBF5DD',
  '--editable-page-text': '#0D530E',
  '--editable-container': '1400px',
  '--editable-border': 'rgba(13,83,14,0.20)',
  '--editable-border-soft': 'rgba(13,83,14,0.12)',
  '--editable-border-strong': 'rgba(13,83,14,0.35)',
  '--editable-nav-bg': 'rgba(251,245,221,0.86)',
  '--editable-nav-text': '#0D530E',
  '--editable-nav-active': '#306D29',
  '--editable-nav-active-text': '#FBF5DD',
  '--editable-cta-bg': '#306D29',
  '--editable-cta-text': '#FBF5DD',
  '--editable-search-bg': '#FBF5DD',
  '--editable-footer-bg': '#0D530E',
  '--editable-footer-text': '#FBF5DD',
} as CSSProperties

export const editablePalette = {
  pageBg: 'bg-[var(--slot4-page-bg)]',
  pageText: 'text-[var(--slot4-page-text)]',
  panelBg: 'bg-[var(--slot4-panel-bg)]',
  panelText: 'text-[var(--slot4-page-text)]',
  surfaceBg: 'bg-[var(--slot4-surface-bg)]',
  surfaceText: 'text-[var(--slot4-page-text)]',
  mutedText: 'text-[var(--slot4-muted-text)]',
  softMutedText: 'text-[var(--slot4-soft-muted-text)]',
  accentText: 'text-[var(--slot4-accent)]',
  accentBg: 'bg-[var(--slot4-accent-fill)]',
  accentSoftBg: 'bg-[var(--slot4-accent-soft)]',
  accentSoftText: 'text-[var(--slot4-accent)]',
  onAccentText: 'text-[var(--slot4-on-accent)]',
  darkBg: 'bg-[var(--slot4-dark-bg)]',
  darkText: 'text-[var(--slot4-page-text)]',
  mediaBg: 'bg-[var(--slot4-media-bg)]',
  creamBg: 'bg-[var(--slot4-cream)]',
  warmBg: 'bg-[var(--slot4-warm)]',
  lavenderBg: 'bg-[var(--slot4-lavender)]',
  grayBg: 'bg-[var(--slot4-gray)]',
  border: 'border-[var(--editable-border)]',
  darkBorder: 'border-[var(--editable-border-soft)]',
  shadow: 'shadow-[0_1px_2px_rgba(13,83,14,0.06)]',
  shadowStrong: 'shadow-[0_20px_60px_rgba(13,83,14,0.14)]',
  overlay: 'bg-[linear-gradient(180deg,rgba(13,83,14,0.05),rgba(13,83,14,0.6))]',
} as const

export const editableDesignContract = {
  shell: {
    page: `min-h-screen ${editablePalette.pageBg} ${editablePalette.pageText}`,
    section: 'mx-auto w-full max-w-[var(--editable-container)] px-5 sm:px-8 lg:px-14',
    sectionY: 'py-20 sm:py-24 lg:py-32',
    sectionYSmall: 'py-14 sm:py-16 lg:py-20',
    sectionYLarge: 'py-24 sm:py-32 lg:py-40',
  },
  layout: {
    safeGrid: 'grid gap-8 md:grid-cols-2 xl:grid-cols-3',
    featureGrid: 'grid gap-14 lg:grid-cols-[1.15fr_0.85fr] lg:items-center',
    rail: 'flex snap-x gap-6 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
    minRailCard: 'w-[280px] shrink-0 snap-start sm:w-[320px]',
  },
  type: {
    eyebrow: 'editable-mono text-[11px] font-medium uppercase tracking-[0.28em] text-[var(--slot4-accent)]',
    heroTitle:
      'editable-display text-[2.5rem] font-semibold leading-[1.05] tracking-[-0.03em] sm:text-[3.5rem] lg:text-[4.375rem]',
    sectionTitle:
      'editable-display text-3xl font-semibold leading-[1.1] tracking-[-0.025em] sm:text-[2.75rem] lg:text-[3.5rem]',
    displayLarge:
      'editable-display text-[2.25rem] font-semibold leading-[1.08] tracking-[-0.025em] sm:text-[3rem] lg:text-[3.75rem]',
    body: 'text-base leading-[1.65] sm:text-[1.0625rem]',
    lead: 'text-lg leading-[1.6] sm:text-[1.15rem] text-[var(--slot4-muted-text)]',
    emphasis: 'editable-display italic font-medium text-[var(--slot4-accent)]',
    small: 'text-sm text-[var(--slot4-muted-text)]',
  },
  surface: {
    card: `rounded-[10px] ${editablePalette.panelBg} border border-[var(--editable-border-soft)] ${editablePalette.shadow}`,
    soft: `rounded-[10px] ${editablePalette.panelBg}`,
    dark: `rounded-[10px] bg-[var(--slot4-dark-bg)] text-[var(--slot4-page-text)]`,
    inverse: 'rounded-[10px] bg-[var(--slot4-dark-bg)] text-[var(--slot4-page-text)]',
  },
  button: {
    primary:
      'inline-flex items-center justify-center gap-2 rounded-full bg-[var(--slot4-accent-fill)] px-6 py-3.5 text-sm font-semibold tracking-[0.01em] text-[var(--slot4-on-accent)] transition duration-300 hover:bg-[var(--slot4-accent-strong)] hover:-translate-y-0.5 active:translate-y-0',
    secondary:
      'inline-flex items-center justify-center gap-2 rounded-full border border-[var(--editable-border)] bg-[var(--slot4-cream)] px-6 py-3.5 text-sm font-semibold tracking-[0.01em] text-[var(--slot4-page-text)] transition duration-300 hover:border-[var(--slot4-accent)] hover:bg-[var(--slot4-warm)]',
    accent:
      'inline-flex items-center justify-center gap-2 rounded-full bg-[var(--slot4-accent-fill)] px-7 py-4 text-sm font-semibold text-[var(--slot4-on-accent)] transition duration-300 hover:bg-[var(--slot4-accent-strong)] hover:-translate-y-0.5',
    ghost:
      'inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-[var(--slot4-page-text)]/85 transition duration-300 hover:text-[var(--slot4-page-text)]',
    inverse:
      'inline-flex items-center justify-center gap-2 rounded-full bg-[var(--slot4-cream)] px-6 py-3.5 text-sm font-semibold text-[var(--slot4-page-text)] transition duration-300 hover:bg-[var(--slot4-warm)] hover:-translate-y-0.5',
  },
  badge: {
    pill: 'inline-flex items-center gap-2 rounded-full border border-[var(--editable-border)] bg-[var(--slot4-glass)] px-3.5 py-1.5 text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--slot4-page-text)]/85',
    accentPill:
      'inline-flex items-center gap-2 rounded-full bg-[var(--slot4-accent-soft)] px-3.5 py-1.5 text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--slot4-accent)]',
    soft:
      'inline-flex items-center gap-2 rounded-full border border-[var(--editable-border-soft)] px-3 py-1 text-[11px] font-medium text-[var(--slot4-muted-text)]',
  },
  media: {
    frame: 'relative overflow-hidden rounded-[10px] bg-[var(--slot4-media-bg)]',
    frameFull: 'relative overflow-hidden bg-[var(--slot4-media-bg)]',
    ratio: 'aspect-[4/5]',
    ratioWide: 'aspect-[16/10]',
  },
  motion: {
    lift: 'transition duration-500 hover:-translate-y-1 hover:border-[var(--slot4-accent)]/40',
    fade: 'transition duration-500 hover:opacity-80',
    zoom: 'transition duration-700 group-hover:scale-[1.05]',
  },
} as const

export const aiLayoutRules = [
  'All colors flow from editableRootStyle — never hardcode hex values inside components.',
  'Buttons use dc.button.primary / secondary / accent / ghost — all pill-shaped.',
  'Cards use dc.surface.card (panel with hairline green border).',
  'Type uses dc.type.* — Inter display, Manrope body, tight negative tracking on headings.',
  'Section rhythm uses dc.shell.sectionY (or Small/Large variants) for generous vertical space.',
  'Wrap section headers and grid items in <EditableReveal index={i}> for staggered scroll-fade.',
  'Every transition uses var(--ease-premium).',
] as const
