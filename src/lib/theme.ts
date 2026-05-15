export type ThemeMode = 'Light' | 'Dark';

const THEME_KEY = 'promptro:theme';

export const readThemeMode = (): ThemeMode => {
  const savedTheme = localStorage.getItem(THEME_KEY);
  return savedTheme === 'Dark' || savedTheme === 'Light' ? savedTheme : 'Light';
};

export const applyThemeMode = (mode: ThemeMode) => {
  localStorage.setItem(THEME_KEY, mode);
  document.documentElement.dataset.theme = mode.toLowerCase();
};
