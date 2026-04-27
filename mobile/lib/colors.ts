// oklch(0.86 0.18 125) → #C3EA3A  (vibrant lime — matches web design accent)
// oklch(0.94 0.09 125) → #E9F5C0  (soft lime)
// oklch(0.65 0.18 25)  → #C74A30  (red)
// oklch(0.94 0.04 25)  → #FAEAE6  (soft red)
// oklch(0.78 0.13 70)  → #D48A3A  (amber)
// oklch(0.95 0.04 70)  → #FDF3E6  (soft amber)

export const C = {
  bg:         '#FAFAF7',
  fg:         '#0E0F0C',
  fg2:        '#2C2D29',
  fg3:        '#5A5C56',
  fg4:        '#8A8C85',
  line:       '#E5E4DD',
  line2:      '#EFEDE5',
  card:       '#FFFFFF',

  accent:     '#C3EA3A',
  accentInk:  '#0E0F0C',
  accentSoft: '#E9F5C0',

  red:        '#C74A30',
  redSoft:    '#FAEAE6',
  amber:      '#D48A3A',
  amberSoft:  '#FDF3E6',
  blue:       '#3A7DC7',

  // Dark theme
  darkBg:     '#0E0F0C',
  darkFg:     '#F5F5F0',
  darkFg2:    '#DCDCD4',
  darkFg3:    '#9A9C92',
  darkCard:   '#161713',
  darkLine:   '#232420',
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 18,
  xl: 24,
  full: 999,
} as const;

export const font = {
  display: undefined as string | undefined,    // system default
  body:    undefined as string | undefined,
  mono:    'Courier' as string,                // closest available mono on both platforms
} as const;
