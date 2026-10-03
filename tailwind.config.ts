import type { Config } from 'tailwindcss';

/**
 * iOS 设计系统色板：
 * 浅色背景 #F2F2F7 / 卡片 #FFFFFF；深色背景 #000 / 卡片 #1C1C1E；
 * 分割线 rgba(60,60,67,0.29)，深色分割线 rgba(84,84,88,0.65)。
 */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Text"',
          '"SF Pro Display"',
          'Inter',
          '"PingFang SC"',
          '"Helvetica Neue"',
          '"Microsoft YaHei"',
          'sans-serif',
        ],
      },
      colors: {
        ios: {
          blue: '#007AFF',
          green: '#34C759',
          red: '#FF3B30',
          orange: '#FF9500',
          yellow: '#FFCC00',
          bg: '#F2F2F7',
          card: '#FFFFFF',
          darkbg: '#000000',
          darkcard: '#1C1C1E',
          darkcard2: '#2C2C2E',
          separator: 'rgba(60,60,67,0.29)',
          darkseparator: 'rgba(84,84,88,0.65)',
          secondary: '#8E8E93',
        },
      },
      borderRadius: {
        card: '16px',
        btn: '12px',
        sheet: '22px',
      },
    },
  },
  plugins: [],
} satisfies Config;
