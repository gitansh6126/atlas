import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Theme } from '@/shared/types'

interface ThemeState {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

function applyThemeClass(theme: Theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark')
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'light',
      toggleTheme: () =>
        set((state) => {
          const next = state.theme === 'light' ? 'dark' : 'light'
          applyThemeClass(next)
          return { theme: next }
        }),
      setTheme: (theme) => {
        applyThemeClass(theme)
        set({ theme })
      },
    }),
    { name: 'atlas-theme' },
  ),
)
