# Theme System

Atlas supports light and dark themes with a consistent design system powered by Tailwind CSS and CSS custom properties.

---

## Overview

The theme system provides:
- Light and dark mode toggle
- Consistent color tokens across the application
- Automatic persistence of user preference
- Seamless transitions between themes

## Color Architecture

### CSS Custom Properties

Colors are defined as HSL values in `globals.css`:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --card: 0 0% 100%;
  --card-foreground: 222.2 84% 4.9%;
  --popover: 0 0% 100%;
  --popover-foreground: 222.2 84% 4.9%;
  --primary: 222.2 47.4% 11.2%;
  --primary-foreground: 210 40% 98%;
  --secondary: 210 40% 96.1%;
  --secondary-foreground: 222.2 47.4% 11.2%;
  --muted: 210 40% 96.1%;
  --muted-foreground: 215.4 16.3% 46.9%;
  --accent: 210 40% 96.1%;
  --accent-foreground: 222.2 47.4% 11.2%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 210 40% 98%;
  --border: 214.3 31.8% 91.4%;
  --input: 214.3 31.8% 91.4%;
  --ring: 222.2 84% 4.9%;
  --radius: 0.5rem;
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --card: 222.2 84% 4.9%;
  --card-foreground: 210 40% 98%;
  /* ... */
}
```

### Tailwind Configuration

```javascript
// tailwind.config.js
module.exports = {
  darkMode: ['class'],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        // ... all tokens
      }
    }
  }
}
```

## Theme Store

```typescript
// src/modules/settings/theme-store.ts
interface ThemeStore {
  theme: 'light' | 'dark'
  toggleTheme: () => void
  setTheme: (theme: 'light' | 'dark') => void
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      theme: 'light',
      toggleTheme: () => {
        const next = get().theme === 'light' ? 'dark' : 'light'
        document.documentElement.classList.toggle('dark', next === 'dark')
        set({ theme: next })
      },
      setTheme: (theme) => {
        document.documentElement.classList.toggle('dark', theme === 'dark')
        set({ theme })
      }
    }),
    { name: 'atlas-theme' }
  )
)
```

## Theme Toggle Component

```typescript
function ThemeToggle() {
  const { theme, toggleTheme } = useThemeStore()

  return (
    <Button variant="ghost" size="icon" onClick={toggleTheme}>
      {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
    </Button>
  )
}
```

## Sidebar Theme Colors

The sidebar uses its own semantic color tokens:

```css
.sidebar {
  --sidebar-background: 0 0% 98%;
  --sidebar-foreground: 240 5.3% 26.1%;
  --sidebar-muted: 240 4.8% 95.9%;
  --sidebar-muted-foreground: 240 3.8% 46.1%;
}
```

## Best Practices

1. **Use semantic tokens** — always `bg-background`, never `bg-white`
2. **Avoid hardcoded colors** — everything should resolve to a CSS variable
3. **Test both modes** — check contrast ratios in both light and dark
4. **Animate transitions** — use `transition-colors` for smooth theme switching

## Future Enhancements

- [ ] Additional themes (sepia, high-contrast)
- [ ] Custom theme builder
- [ ] System preference detection (`prefers-color-scheme`)
- [ ] Per-workspace themes