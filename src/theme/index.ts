export const colors = {
  primary: {
    main: '#dc2626',
    light: '#ef4444',
    dark: '#b91c1c',
  },
  secondary: {
    main: '#4a5568',
    light: '#718096',
    dark: '#2d3748',
  },
  background: {
    primary: '#1a202c',
    secondary: '#2d3748',
    card: 'rgba(45, 55, 72, 0.95)',
  },
  text: {
    primary: '#ffffff',
    secondary: '#e2e8f0',
    muted: '#a0aec0',
  },
  feedback: {
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b',
  },
  border: {
    primary: 'rgba(255, 255, 255, 0.1)',
    secondary: 'rgba(220, 38, 38, 0.2)',
  },
} as const;

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '20px',
  xl: '24px',
  xxl: '40px',
} as const;

export const borderRadius = {
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '24px',
} as const;

export const typography = {
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  fontSize: {
    xs: '0.8rem',
    sm: '0.9rem',
    base: '1rem',
    lg: '1.1rem',
    xl: '1.5rem',
    '2xl': '2.5rem',
    '6xl': '6rem',
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
} as const;

export const shadows = {
  card: '0 20px 40px rgba(0, 0, 0, 0.3)',
  focus: '0 0 0 3px rgba(220, 38, 38, 0.1)',
} as const;

export const theme = {
  colors,
  spacing,
  borderRadius,
  typography,
  shadows,
} as const;
