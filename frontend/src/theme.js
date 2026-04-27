// theme.js — Theme system for FRBAMS (UV Edition)
// Themes are applied by writing CSS custom properties onto <html>.

export const THEMES = {
  'uv-classic': {
    name: 'UV Classic',
    description: 'University of the Visayas · Navy & Gold',
    preview: ['#002147', '#C9A227', '#F8F6F0'],
    vars: {
      '--bg':              '#F8F6F0',
      '--fg':              '#1A1F36',
      '--fg-2':            '#2C3258',
      '--fg-3':            '#6B7194',
      '--fg-4':            '#9EA2BC',
      '--line':            '#DDD9CF',
      '--line-2':          '#ECEAE3',
      '--card':            '#FFFFFF',
      '--accent':          '#C9A227',
      '--accent-ink':      '#FFFFFF',
      '--accent-soft':     '#F6EDCA',
      '--red':             '#C0392B',
      '--red-soft':        '#FDECEA',
      '--amber':           '#E67E22',
      '--amber-soft':      '#FEF3E6',
      '--blue':            '#2980B9',
      '--side-bg':         '#002147',
      '--side-fg':         'rgba(255,255,255,0.72)',
      '--side-fg-strong':  'rgba(255,255,255,0.95)',
      '--side-section':    'rgba(255,255,255,0.30)',
      '--side-hover':      'rgba(255,255,255,0.07)',
      '--side-active-bg':  '#C9A227',
      '--side-active-fg':  '#002147',
      '--side-badge-bg':   'rgba(255,255,255,0.14)',
      '--side-badge-fg':   'rgba(255,255,255,0.7)',
      '--side-line':       'rgba(255,255,255,0.10)',
      '--side-brand-fg':   '#FFFFFF',
    },
  },

  'uv-light': {
    name: 'UV Light',
    description: 'Clean light mode · Gold highlights',
    preview: ['#E8F0FB', '#1E4DA1', '#FFFFFF'],
    vars: {
      '--bg':              '#FFFFFF',
      '--fg':              '#0D1B3E',
      '--fg-2':            '#1E3461',
      '--fg-3':            '#5A6A8A',
      '--fg-4':            '#8A98B8',
      '--line':            '#D8DEF0',
      '--line-2':          '#EBF0FA',
      '--card':            '#F4F7FF',
      '--accent':          '#1E4DA1',
      '--accent-ink':      '#FFFFFF',
      '--accent-soft':     '#DCE9FF',
      '--red':             '#B02020',
      '--red-soft':        '#FCEAEA',
      '--amber':           '#C07800',
      '--amber-soft':      '#FEF4DC',
      '--blue':            '#1E4DA1',
      '--side-bg':         '#F4F7FF',
      '--side-fg':         '#2C3A6B',
      '--side-fg-strong':  '#0D1B3E',
      '--side-section':    '#8A98B8',
      '--side-hover':      '#E2EAFF',
      '--side-active-bg':  '#1E4DA1',
      '--side-active-fg':  '#FFFFFF',
      '--side-badge-bg':   '#DCE9FF',
      '--side-badge-fg':   '#1E4DA1',
      '--side-line':       '#D8DEF0',
      '--side-brand-fg':   '#0D1B3E',
    },
  },

  'uv-dark': {
    name: 'UV Dark',
    description: 'Dark mode · Deep navy canvas',
    preview: ['#0A0F1E', '#D4AF37', '#111827'],
    dark: true,
    vars: {
      '--bg':              '#0A0F1E',
      '--fg':              '#E8ECF8',
      '--fg-2':            '#C8CFE8',
      '--fg-3':            '#7A84A8',
      '--fg-4':            '#4A5270',
      '--line':            '#1C2340',
      '--line-2':          '#151C35',
      '--card':            '#111827',
      '--accent':          '#D4AF37',
      '--accent-ink':      '#0A0F1E',
      '--accent-soft':     '#2A2410',
      '--red':             '#E05252',
      '--red-soft':        '#2A1010',
      '--amber':           '#E0A040',
      '--amber-soft':      '#2A1E08',
      '--blue':            '#5B8FD4',
      '--side-bg':         '#070C1A',
      '--side-fg':         'rgba(232,236,248,0.65)',
      '--side-fg-strong':  'rgba(232,236,248,0.95)',
      '--side-section':    'rgba(232,236,248,0.28)',
      '--side-hover':      'rgba(255,255,255,0.05)',
      '--side-active-bg':  '#D4AF37',
      '--side-active-fg':  '#0A0F1E',
      '--side-badge-bg':   'rgba(255,255,255,0.10)',
      '--side-badge-fg':   'rgba(232,236,248,0.6)',
      '--side-line':       'rgba(255,255,255,0.07)',
      '--side-brand-fg':   '#E8ECF8',
    },
  },

  'slate': {
    name: 'Slate',
    description: 'Modern neutral · Indigo accent',
    preview: ['#1E293B', '#6366F1', '#F8FAFC'],
    vars: {
      '--bg':              '#F8FAFC',
      '--fg':              '#0F172A',
      '--fg-2':            '#1E293B',
      '--fg-3':            '#64748B',
      '--fg-4':            '#94A3B8',
      '--line':            '#E2E8F0',
      '--line-2':          '#F1F5F9',
      '--card':            '#FFFFFF',
      '--accent':          '#6366F1',
      '--accent-ink':      '#FFFFFF',
      '--accent-soft':     '#EEF2FF',
      '--red':             '#EF4444',
      '--red-soft':        '#FEF2F2',
      '--amber':           '#F59E0B',
      '--amber-soft':      '#FFFBEB',
      '--blue':            '#3B82F6',
      '--side-bg':         '#1E293B',
      '--side-fg':         'rgba(248,250,252,0.70)',
      '--side-fg-strong':  '#F8FAFC',
      '--side-section':    'rgba(148,163,184,0.6)',
      '--side-hover':      'rgba(255,255,255,0.06)',
      '--side-active-bg':  '#6366F1',
      '--side-active-fg':  '#FFFFFF',
      '--side-badge-bg':   'rgba(255,255,255,0.12)',
      '--side-badge-fg':   'rgba(248,250,252,0.7)',
      '--side-line':       'rgba(255,255,255,0.08)',
      '--side-brand-fg':   '#F8FAFC',
    },
  },

  'forest': {
    name: 'Forest',
    description: 'Lime green · Original accent',
    preview: ['#0E1A14', '#C3EA3A', '#FAFAF7'],
    vars: {
      '--bg':              '#FAFAF7',
      '--fg':              '#0E0F0C',
      '--fg-2':            '#2C2D29',
      '--fg-3':            '#5A5C56',
      '--fg-4':            '#8A8C85',
      '--line':            '#E5E4DD',
      '--line-2':          '#EFEDE5',
      '--card':            '#FFFFFF',
      '--accent':          '#C3EA3A',
      '--accent-ink':      '#0E0F0C',
      '--accent-soft':     '#E9F5C0',
      '--red':             '#C74A30',
      '--red-soft':        '#FAEAE6',
      '--amber':           '#D48A3A',
      '--amber-soft':      '#FDF3E6',
      '--blue':            '#3A7DC7',
      '--side-bg':         '#0E1A14',
      '--side-fg':         'rgba(250,250,247,0.68)',
      '--side-fg-strong':  '#FAFAF7',
      '--side-section':    'rgba(250,250,247,0.32)',
      '--side-hover':      'rgba(255,255,255,0.06)',
      '--side-active-bg':  '#C3EA3A',
      '--side-active-fg':  '#0E0F0C',
      '--side-badge-bg':   'rgba(255,255,255,0.12)',
      '--side-badge-fg':   'rgba(250,250,247,0.7)',
      '--side-line':       'rgba(255,255,255,0.09)',
      '--side-brand-fg':   '#FAFAF7',
    },
  },

  'rose': {
    name: 'Rose',
    description: 'Warm crimson · Academic red',
    preview: ['#3D0C11', '#E11D48', '#FFF5F5'],
    vars: {
      '--bg':              '#FFF8F8',
      '--fg':              '#1A0810',
      '--fg-2':            '#3D1020',
      '--fg-3':            '#885060',
      '--fg-4':            '#B48090',
      '--line':            '#F4D0D8',
      '--line-2':          '#FAE8EC',
      '--card':            '#FFFFFF',
      '--accent':          '#E11D48',
      '--accent-ink':      '#FFFFFF',
      '--accent-soft':     '#FFE4EC',
      '--red':             '#DC2626',
      '--red-soft':        '#FEF2F2',
      '--amber':           '#D97706',
      '--amber-soft':      '#FFFBEB',
      '--blue':            '#2563EB',
      '--side-bg':         '#3D0C11',
      '--side-fg':         'rgba(255,248,248,0.68)',
      '--side-fg-strong':  '#FFF8F8',
      '--side-section':    'rgba(255,200,210,0.35)',
      '--side-hover':      'rgba(255,255,255,0.07)',
      '--side-active-bg':  '#E11D48',
      '--side-active-fg':  '#FFFFFF',
      '--side-badge-bg':   'rgba(255,255,255,0.14)',
      '--side-badge-fg':   'rgba(255,200,210,0.8)',
      '--side-line':       'rgba(255,255,255,0.10)',
      '--side-brand-fg':   '#FFF8F8',
    },
  },
}

export const DEFAULT_THEME = 'uv-classic'

const STORAGE_KEY = 'frbams_theme'
const CUSTOM_KEY  = 'frbams_theme_custom'

export function applyTheme(themeId, customOverrides = {}) {
  const base = THEMES[themeId] ?? THEMES[DEFAULT_THEME]
  const vars  = { ...base.vars, ...customOverrides }
  const root  = document.documentElement

  Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v))

  // Dark mode data attribute for CSS selectors
  if (base.dark) {
    root.setAttribute('data-theme', 'dark')
  } else {
    root.removeAttribute('data-theme')
  }

  // Body + root background sync
  document.body.style.background = vars['--bg'] ?? ''
  const rootEl = document.getElementById('root')
  if (rootEl) rootEl.style.background = vars['--bg'] ?? ''
}

export function loadAndApplyTheme() {
  const id      = localStorage.getItem(STORAGE_KEY) ?? DEFAULT_THEME
  const custom  = JSON.parse(localStorage.getItem(CUSTOM_KEY) ?? '{}')
  applyTheme(id, custom)
  return { id, custom }
}

export function saveTheme(id, customOverrides = {}) {
  localStorage.setItem(STORAGE_KEY, id)
  localStorage.setItem(CUSTOM_KEY, JSON.stringify(customOverrides))
  applyTheme(id, customOverrides)
}

export function getSavedTheme() {
  return {
    id:     localStorage.getItem(STORAGE_KEY) ?? DEFAULT_THEME,
    custom: JSON.parse(localStorage.getItem(CUSTOM_KEY) ?? '{}'),
  }
}
