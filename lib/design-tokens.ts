/**
 * Design System Tokens
 * Based on DESIGN_SYSTEM_MINI_APP.md specification
 */

export const DESIGN_TOKENS = {
  // Typography - Inter font with modular scale
  fontFamily: {
    sans: "'Inter', system-ui, -apple-system, sans-serif",
    mono: "'Geist Mono', monospace",
  },

  // Font sizes and line heights (modular scale)
  typography: {
    display: {
      size: '36px',
      lineHeight: '42px',
      weight: 700,
    },
    h1: {
      size: '24px',
      lineHeight: '32px',
      weight: 700,
    },
    h2: {
      size: '20px',
      lineHeight: '28px',
      weight: 600,
    },
    h3: {
      size: '16px',
      lineHeight: '24px',
      weight: 600,
    },
    bodyLarge: {
      size: '16px',
      lineHeight: '24px',
      weight: 400,
    },
    body: {
      size: '14px',
      lineHeight: '20px',
      weight: 400,
    },
    bodySmall: {
      size: '12px',
      lineHeight: '16px',
      weight: 400,
    },
    caption: {
      size: '10px',
      lineHeight: '14px',
      weight: 500,
    },
  },

  // Touch targets
  touchTarget: {
    min: '44px',
  },

  // Spacing - 8px baseline grid
  spacing: {
    0: '0px',
    1: '8px',
    2: '16px',
    3: '24px',
    4: '32px',
    5: '40px',
    6: '48px',
    7: '56px',
    8: '64px',
    9: '72px',
    10: '80px',
  },

  // Border radius
  radius: {
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
  },

  // Colors - Shef-Montazh palette
  colors: {
    primary: '#E85D2F',
    secondary: '#BFFF00',
    background: {
      light: '#E8E8E8',
      dark: '#2A2A2A',
      darkAlt: '#1A1A1A',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#9B9B9B',
      tertiary: '#6B6B6B',
    },
    status: {
      success: '#BFFF00',
      warning: '#FFD60A',
      error: '#FF4444',
      info: '#3B82F6',
    },
  },

  // Glassmorphism
  glass: {
    light: 'rgba(255, 255, 255, 0.05)',
    medium: 'rgba(255, 255, 255, 0.1)',
    strong: 'rgba(255, 255, 255, 0.15)',
    backdrop: 'rgba(169, 169, 169, 0.2)',
    border: 'rgba(255, 255, 255, 0.1)',
  },

  // Animation timings
  animation: {
    fast: '200ms',
    normal: '300ms',
    slow: '500ms',
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },

  // Elevation (shadows)
  shadow: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.1)',
    md: '0 4px 8px rgba(0, 0, 0, 0.15)',
    lg: '0 8px 16px rgba(0, 0, 0, 0.2)',
    xl: '0 16px 32px rgba(0, 0, 0, 0.25)',
  },

  // Z-index scale
  zIndex: {
    base: 0,
    dropdown: 10,
    sticky: 20,
    fixed: 30,
    modalBackdrop: 40,
    modal: 50,
    toast: 100,
  },
}

// Tailwind-compatible spacing scale (8px grid)
export const SPACING_SCALE = {
  0: '0',
  1: '8px',
  2: '16px',
  3: '24px',
  4: '32px',
  5: '40px',
  6: '48px',
  8: '64px',
  10: '80px',
  12: '96px',
  16: '128px',
  20: '160px',
  24: '192px',
}

// Typography utility classes mapping
export const TYPOGRAPHY_CLASSES = {
  display: 'text-4xl leading-tight font-bold',
  h1: 'text-2xl leading-8 font-bold',
  h2: 'text-xl leading-7 font-semibold',
  h3: 'text-base leading-6 font-semibold',
  bodyLarge: 'text-base leading-6 font-normal',
  body: 'text-sm leading-5 font-normal',
  bodySmall: 'text-xs leading-4 font-normal',
  caption: 'text-[10px] leading-[14px] font-medium',
}
