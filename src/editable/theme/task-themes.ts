import type { CSSProperties } from 'react'
import type { TaskKey } from '@/lib/site-config'

/*
  Cream + green editorial task theme. Shared identity across every task —
  only the kicker + note copy varies per task.
*/

export type TaskTheme = {
  kicker: string
  note: string
  dark: boolean
  fontDisplay: string
  fontBody: string
  bg: string
  surface: string
  raised: string
  text: string
  muted: string
  line: string
  accent: string
  accentSoft: string
  onAccent: string
  glow: string
  radius: string
}

const DISPLAY = "'Inter', system-ui, -apple-system, 'Helvetica Neue', Arial, sans-serif"
const BODY = "'Manrope', 'Inter', system-ui, -apple-system, sans-serif"

const base = {
  dark: false,
  fontDisplay: DISPLAY,
  fontBody: BODY,
  bg: '#FBF5DD',
  surface: '#FBF5DD',
  raised: '#E7E1B1',
  text: '#0D530E',
  muted: '#306D29',
  line: 'rgba(13,83,14,0.20)',
  accent: '#306D29',
  accentSoft: 'rgba(48,109,41,0.14)',
  onAccent: '#FBF5DD',
  glow: 'rgba(48,109,41,0.22)',
  radius: '10px',
} satisfies Omit<TaskTheme, 'kicker' | 'note'>

export const taskThemes: Record<TaskKey, TaskTheme> = {
  article: { ...base, kicker: 'Editorial', note: 'Long-form reads and considered essays.' },
  listing: { ...base, kicker: 'Directory', note: 'Discoverable entries, well organized.' },
  classified: { ...base, kicker: 'Notices', note: 'Time-sensitive posts and offers.' },
  image: { ...base, kicker: 'Visuals', note: 'A curated visual index.' },
  sbm: { ...base, kicker: 'Bookmarks', note: 'Saved links worth returning to.' },
  pdf: { ...base, kicker: 'Reference Library', note: 'Downloadable studies, reports, and reference material.' },
  profile: { ...base, kicker: 'Contributor', note: 'A record of the people behind the library.' },
}

export function getTaskTheme(task: TaskKey): TaskTheme {
  return taskThemes[task] || taskThemes.article
}

export function taskThemeStyle(task: TaskKey): CSSProperties {
  const t = getTaskTheme(task)
  return {
    '--tk-bg': t.bg,
    '--tk-surface': t.surface,
    '--tk-raised': t.raised,
    '--tk-text': t.text,
    '--tk-muted': t.muted,
    '--tk-line': t.line,
    '--tk-accent': t.accent,
    '--tk-accent-soft': t.accentSoft,
    '--tk-on-accent': t.onAccent,
    '--tk-glow': t.glow,
    '--tk-radius': t.radius,
    '--slot4-accent': t.accent,
    '--slot4-accent-fill': t.accent,
    '--editable-font-display': t.fontDisplay,
    '--editable-font-body': t.fontBody,
    fontFamily: t.fontBody,
  } as CSSProperties
}
