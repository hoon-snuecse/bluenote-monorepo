export interface Theme {
  id: string;
  name: string;
  description: string;
  colors: {
    primary: string;
    primaryHover: string;
    background: string;
    surface: string;
    text: string;
    textMuted: string;
    border: string;
    grade: {
      excellent: string;
      good: string;
      fair: string;
      poor: string;
    };
  };
  effects: {
    glass: boolean;
    blur: string;
    opacity: string;
    shadow: string;
  };
}

export const themes: Record<string, Theme> = {
  glass: {
    id: 'glass',
    name: 'Glass Morphism',
    description: '투명하고 현대적인 글래스 효과 테마',
    colors: {
      primary: 'bg-blue-500',
      primaryHover: 'hover:bg-blue-600',
      background: 'bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50',
      surface: 'bg-white/70',
      text: 'text-slate-800',
      textMuted: 'text-slate-600',
      border: 'border-slate-200/50',
      grade: {
        excellent: 'bg-green-500/20 border-green-500/30 text-green-700',
        good: 'bg-blue-500/20 border-blue-500/30 text-blue-700',
        fair: 'bg-amber-500/20 border-amber-500/30 text-amber-700',
        poor: 'bg-red-500/20 border-red-500/30 text-red-700',
      },
    },
    effects: {
      glass: true,
      blur: 'backdrop-blur-sm',
      opacity: '70',
      shadow: 'shadow-card hover:shadow-md',
    },
  },
  ocean: {
    id: 'ocean',
    name: 'Ocean Breeze',
    description: '차분하고 깊이감 있는 바다색 테마',
    colors: {
      primary: 'bg-teal-600',
      primaryHover: 'hover:bg-teal-700',
      background: 'bg-gradient-to-br from-cyan-50 via-teal-50/40 to-blue-50',
      surface: 'bg-white/80',
      text: 'text-slate-900',
      textMuted: 'text-slate-700',
      border: 'border-teal-200/60',
      grade: {
        excellent: 'bg-emerald-500/25 border-emerald-500/40 text-emerald-800',
        good: 'bg-teal-500/25 border-teal-500/40 text-teal-800',
        fair: 'bg-yellow-500/25 border-yellow-500/40 text-yellow-800',
        poor: 'bg-rose-500/25 border-rose-500/40 text-rose-800',
      },
    },
    effects: {
      glass: true,
      blur: 'backdrop-blur-md',
      opacity: '80',
      shadow: 'shadow-lg hover:shadow-xl',
    },
  },
  minimal: {
    id: 'minimal',
    name: 'Minimal Clean',
    description: '깔끔하고 단순한 미니멀 테마',
    colors: {
      primary: 'bg-slate-900',
      primaryHover: 'hover:bg-slate-800',
      background: 'bg-white',
      surface: 'bg-white',
      text: 'text-slate-900',
      textMuted: 'text-slate-600',
      border: 'border-slate-200',
      grade: {
        excellent: 'bg-green-50 border-green-200 text-green-900',
        good: 'bg-blue-50 border-blue-200 text-blue-900',
        fair: 'bg-amber-50 border-amber-200 text-amber-900',
        poor: 'bg-red-50 border-red-200 text-red-900',
      },
    },
    effects: {
      glass: false,
      blur: '',
      opacity: '100',
      shadow: 'shadow-sm hover:shadow',
    },
  },
};

export function getTheme(themeId: string): Theme {
  return themes[themeId] || themes.glass;
}