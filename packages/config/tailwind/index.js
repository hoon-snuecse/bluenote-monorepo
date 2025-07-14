/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    // Apps
    "../../apps/*/src/**/*.{js,ts,jsx,tsx,mdx}",
    "../../apps/*/app/**/*.{js,ts,jsx,tsx,mdx}",
    // Packages
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // 기본 색상 팔레트
        blue: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        slate: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
        // 평가 시스템 색상
        grade: {
          excellent: '#10b981', // 매우 우수 - green
          good: '#3b82f6',      // 우수 - blue
          fair: '#f59e0b',      // 보통 - amber
          poor: '#ef4444',      // 미흡 - red
        },
      },
      fontFamily: {
        // CSS 변수 사용
        'space-grotesk': ['var(--font-space-grotesk)', 'sans-serif'],
        'inter': ['var(--font-inter)', 'sans-serif'],
        // 한글 폰트 (fallback)
        'pretendard': ['Pretendard', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      // 공통 애니메이션
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'fade-up': 'fadeUp 0.5s ease-out',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      // 공통 그림자
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.1)',
        'card': '0 2px 8px 0 rgba(0, 0, 0, 0.05)',
      },
    },
  },
  plugins: [],
}