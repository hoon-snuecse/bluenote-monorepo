const baseConfig = require('@bluenote/config/tailwind');

/** @type {import('tailwindcss').Config} */
module.exports = {
  ...baseConfig,
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    // 공통 UI 패키지 포함
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    ...baseConfig.theme,
    extend: {
      ...baseConfig.theme.extend,
      colors: {
        ...baseConfig.theme.extend.colors,
        // web 앱 전용 색상
        blueprint: {
          primary: '#1e3a8a',
          secondary: '#3b82f6',
          accent: '#fbbf24',
          paper: '#f8fafc',
          lines: '#e2e8f0',
        },
      },
      animation: {
        ...baseConfig.theme.extend.animation,
        // web 앱 전용 애니메이션
        'float-blueprint': 'float-blueprint 25s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
      },
      keyframes: {
        ...baseConfig.theme.extend.keyframes,
        // web 앱 전용 keyframes
        'float-blueprint': {
          '0%, 100%': { 
            transform: 'translateY(0px) translateX(0px) rotate(0deg)',
            opacity: '0.08',
          },
          '25%': { 
            transform: 'translateY(-40px) translateX(30px) rotate(3deg)',
            opacity: '0.12',
          },
          '50%': { 
            transform: 'translateY(-30px) translateX(-20px) rotate(-2deg)',
            opacity: '0.06',
          },
          '75%': { 
            transform: 'translateY(20px) translateX(25px) rotate(2deg)',
            opacity: '0.10',
          },
        },
        'pulse-glow': {
          '0%, 100%': {
            boxShadow: '0 0 20px rgba(99, 102, 241, 0.3)',
          },
          '50%': {
            boxShadow: '0 0 30px rgba(99, 102, 241, 0.5)',
          },
        },
      },
    },
  },
  plugins: [],
};