export interface ThemeColors {
  bg: string;
  bg2: string;
  text: string;
  muted: string;
  cyan: string;
  green: string;
  gold: string;
  border: string;
  surface: string;
  surface2: string;
}

export function getThemeColors(dark: boolean): ThemeColors {
  if (dark) {
    return {
      bg: '#0a0a0f',
      bg2: '#12121a',
      text: '#e4e4e7',
      muted: '#71717a',
      cyan: '#06b6d4',
      green: '#10b981',
      gold: '#f59e0b',
      border: '#27272a',
      surface: '#18181b',
      surface2: '#1e1e26',
    };
  }
  return {
    bg: '#fafafa',
    bg2: '#ffffff',
    text: '#18181b',
    muted: '#71717a',
    cyan: '#0891b2',
    green: '#059669',
    gold: '#d97706',
    border: '#e4e4e7',
    surface: '#ffffff',
    surface2: '#f4f4f5',
  };
}
