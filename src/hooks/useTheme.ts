import { useEffect } from 'react';
import { useStore } from '../store/useStore';

/** 将 settings.theme 应用到 <html class="dark">，'system' 跟随系统偏好 */
export function useTheme(): void {
  const theme = useStore((s) => s.settings.theme);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = () => {
      const dark = theme === 'dark' || (theme === 'system' && mq.matches);
      document.documentElement.classList.toggle('dark', dark);
    };
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, [theme]);
}
