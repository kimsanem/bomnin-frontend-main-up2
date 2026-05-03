export const useTheme = () => {
  const theme = useState<'light' | 'dark'>('theme', () => 'light');

  const applyTheme = (value: 'light' | 'dark') => {
    theme.value = value;

    if (import.meta.client) {
      document.documentElement.classList.toggle('dark', value === 'dark');
      document.documentElement.dataset.theme = value;
      localStorage.setItem('theme', value);
    }
  };

  const initTheme = () => {
    if (!import.meta.client) return;

    const savedTheme = localStorage.getItem('theme');
    applyTheme(savedTheme === 'dark' ? 'dark' : 'light');
  };

  const toggleTheme = () => {
    applyTheme(theme.value === 'dark' ? 'light' : 'dark');
  };

  return {
    theme,
    initTheme,
    toggleTheme,
  };
};
