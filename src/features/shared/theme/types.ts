export interface ThemeDefinition {
  id: string;
  name: string;
  isDark: boolean;
  colors: {
    bg: string;
    surface: string;
    card: string;
    border: string;
    primary: string;
    primaryHover: string;
    secondary: string;
    accent: string;
    text: string;
    muted: string;
    success: string;
    warning: string;
    error: string;
    shadow: string;
    glow: string;
  };
}

export interface ThemeTokenMap {
  '--theme-bg': string;
  '--theme-surface': string;
  '--theme-card': string;
  '--theme-border': string;
  '--theme-primary': string;
  '--theme-primary-hover': string;
  '--theme-secondary': string;
  '--theme-accent': string;
  '--theme-text': string;
  '--theme-muted': string;
  '--theme-success': string;
  '--theme-warning': string;
  '--theme-error': string;
  '--theme-shadow': string;
  '--theme-glow': string;
}
