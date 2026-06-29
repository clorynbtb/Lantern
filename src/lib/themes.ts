/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

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

export const THEMES: Record<string, ThemeDefinition> = {
  light: {
    id: 'light',
    name: 'Light Clear',
    isDark: false,
    colors: {
      bg: '#FAF8F5',
      surface: '#FFFFFF',
      card: '#FFFFFF',
      border: '#EBE9E5',
      primary: '#E28743',
      primaryHover: '#C16723',
      secondary: '#F5F3EF',
      accent: '#FCEFE4',
      text: '#1C1917',
      muted: '#78716C',
      success: '#16A34A',
      warning: '#D97706',
      error: '#DC2626',
      shadow: '0 4px 20px -2px rgba(120, 113, 108, 0.08)',
      glow: '0 0 30px rgba(226, 135, 67, 0.1)',
    }
  },
  dark: {
    id: 'dark',
    name: 'Carbon Dark',
    isDark: true,
    colors: {
      bg: '#0F172A',
      surface: '#1E293B',
      card: '#1E293B',
      border: '#334155',
      primary: '#38BDF8',
      primaryHover: '#0EA5E9',
      secondary: '#1E293B',
      accent: '#0284C7',
      text: '#F8FAFC',
      muted: '#94A3B8',
      success: '#4ADE80',
      warning: '#FBBF24',
      error: '#F87171',
      shadow: '0 4px 20px -2px rgba(0, 0, 0, 0.3)',
      glow: '0 0 30px rgba(56, 189, 248, 0.15)',
    }
  },
  lantern: {
    id: 'lantern',
    name: 'Lantern Warm',
    isDark: false,
    colors: {
      bg: '#FAF3EC',
      surface: '#FFFBF7',
      card: '#FFFBF7',
      border: '#F3E6DA',
      primary: '#E28743',
      primaryHover: '#C16723',
      secondary: '#F6E9DD',
      accent: '#FCEFE4',
      text: '#2E251E',
      muted: '#8A7568',
      success: '#2E7D32',
      warning: '#E65100',
      error: '#C62828',
      shadow: '0 8px 30px rgba(226, 135, 67, 0.05)',
      glow: '0 0 40px rgba(226, 135, 67, 0.2)',
    }
  },
  sunset: {
    id: 'sunset',
    name: 'Sunset Glow',
    isDark: true,
    colors: {
      bg: '#1A0E2E',
      surface: '#2C1B4D',
      card: '#2C1B4D',
      border: '#453173',
      primary: '#FF6B6B',
      primaryHover: '#FF4747',
      secondary: '#251642',
      accent: '#FF8E53',
      text: '#FFEDED',
      muted: '#A592C4',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      shadow: '0 4px 25px rgba(255, 107, 107, 0.15)',
      glow: '0 0 35px rgba(255, 107, 107, 0.25)',
    }
  },
  ocean: {
    id: 'ocean',
    name: 'Ocean Teal',
    isDark: true,
    colors: {
      bg: '#041620',
      surface: '#0B2535',
      card: '#0B2535',
      border: '#153E56',
      primary: '#00ADB5',
      primaryHover: '#36EEE0',
      secondary: '#071C28',
      accent: '#087E8B',
      text: '#E3FAF9',
      muted: '#81A5BA',
      success: '#34D399',
      warning: '#F59E0B',
      error: '#F87171',
      shadow: '0 4px 20px rgba(0, 173, 181, 0.1)',
      glow: '0 0 35px rgba(0, 173, 181, 0.2)',
    }
  },
  forest: {
    id: 'forest',
    name: 'Forest Moss',
    isDark: true,
    colors: {
      bg: '#0D1B0E',
      surface: '#162F18',
      card: '#162F18',
      border: '#234C26',
      primary: '#52B788',
      primaryHover: '#74C69D',
      secondary: '#0F2111',
      accent: '#40916C',
      text: '#E8F5E9',
      muted: '#7FA983',
      success: '#4ADE80',
      warning: '#FBBF24',
      error: '#F87171',
      shadow: '0 4px 20px rgba(82, 183, 136, 0.1)',
      glow: '0 0 35px rgba(82, 183, 136, 0.15)',
    }
  },
  coffee: {
    id: 'coffee',
    name: 'Coffee Latte',
    isDark: true,
    colors: {
      bg: '#221A15',
      surface: '#362B24',
      card: '#362B24',
      border: '#4B3E35',
      primary: '#C5A880',
      primaryHover: '#A88B65',
      secondary: '#2B211A',
      accent: '#E1C699',
      text: '#F5EFEB',
      muted: '#A59489',
      success: '#829582',
      warning: '#C2A649',
      error: '#AC5A5A',
      shadow: '0 4px 20px rgba(197, 168, 128, 0.08)',
      glow: '0 0 30px rgba(197, 168, 128, 0.15)',
    }
  },
  sakura: {
    id: 'sakura',
    name: 'Sakura Petal',
    isDark: false,
    colors: {
      bg: '#FFF0F3',
      surface: '#FFE3E8',
      card: '#FFE3E8',
      border: '#FFCCD5',
      primary: '#FF758F',
      primaryHover: '#FF4D6D',
      secondary: '#FFF5F7',
      accent: '#FFB3C1',
      text: '#441420',
      muted: '#8F5E68',
      success: '#4E9F3D',
      warning: '#D8AC36',
      error: '#D03B3B',
      shadow: '0 4px 20px rgba(255, 117, 143, 0.08)',
      glow: '0 0 30px rgba(255, 117, 143, 0.2)',
    }
  },
  midnight: {
    id: 'midnight',
    name: 'Obsidian Midnight',
    isDark: true,
    colors: {
      bg: '#020204',
      surface: '#0A0A0E',
      card: '#0A0A0E',
      border: '#181822',
      primary: '#6366F1',
      primaryHover: '#4F46E5',
      secondary: '#07070B',
      accent: '#4338CA',
      text: '#E2E8F0',
      muted: '#64748B',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      shadow: '0 4px 20px rgba(99, 102, 241, 0.05)',
      glow: '0 0 40px rgba(99, 102, 241, 0.25)',
    }
  }
};

export function applyThemeVariables(themeId: string): ThemeDefinition {
  const root = document.documentElement;
  const selectedTheme = THEMES[themeId] || THEMES.light;

  // Set individual CSS variables on HTML root
  root.style.setProperty('--theme-bg', selectedTheme.colors.bg);
  root.style.setProperty('--theme-surface', selectedTheme.colors.surface);
  root.style.setProperty('--theme-card', selectedTheme.colors.card);
  root.style.setProperty('--theme-border', selectedTheme.colors.border);
  root.style.setProperty('--theme-primary', selectedTheme.colors.primary);
  root.style.setProperty('--theme-primary-hover', selectedTheme.colors.primaryHover);
  root.style.setProperty('--theme-secondary', selectedTheme.colors.secondary);
  root.style.setProperty('--theme-accent', selectedTheme.colors.accent);
  root.style.setProperty('--theme-text', selectedTheme.colors.text);
  root.style.setProperty('--theme-muted', selectedTheme.colors.muted);
  root.style.setProperty('--theme-success', selectedTheme.colors.success);
  root.style.setProperty('--theme-warning', selectedTheme.colors.warning);
  root.style.setProperty('--theme-error', selectedTheme.colors.error);
  root.style.setProperty('--theme-shadow', selectedTheme.colors.shadow);
  root.style.setProperty('--theme-glow', selectedTheme.colors.glow);

  // Add/remove native 'dark' mode class to support existing tailwind flow & elements
  if (selectedTheme.isDark) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }

  return selectedTheme;
}
