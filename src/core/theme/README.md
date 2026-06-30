# Theme Core

Manages visual theming: dark/light mode, color schemes, typography, spacing, and CSS variable generation.

## Future Responsibility
- Theme state management (current theme, mode)
- CSS variable generation (generate theme tokens as CSS custom properties)
- Color scheme definitions (light and dark palettes)
- Typography system (font families, sizes, line heights)
- Spacing and sizing scale
- User-customizable themes (future)
- High-contrast / accessibility themes (future)
- Animation preferences (reduce motion support)

## Design Goals
- Themes are defined as data (CSS variable maps), not as stylesheets
- Switching themes must be instant (no Flash of Unstyled Content)
- All components use CSS variables, never hardcoded colors
- Theme persists across sessions

## Current Status (Phase 1)
- Light and dark mode with CSS custom properties
- Theme toggle via Zustand store persisted to localStorage
- System preference detection (future)

## Never
- Import any module or plugin
- Know about editor state
- Handle business logic
