# Toolbar System

The toolbar provides context-sensitive formatting and block actions based on the current selection or cursor position.

---

## Overview

Atlas uses a floating toolbar that appears when text is selected or when a block is focused. The toolbar provides quick access to formatting actions (bold, italic, etc.), block transformations, and AI-powered operations.

## Toolbar Types

### 1. Floating Toolbar
- Appears when text is selected
- Positioned near the selection using `getBoundingClientRect()`
- Disappears on click outside or when selection is cleared

### 2. Block Toolbar
- Appears on block hover or focus
- Provides block-specific actions (drag handle, menu, add block)
- Implemented as part of `BlockControls`

### 3. Slash Menu Toolbar
- Triggered by typing `/`
- Filterable list of available blocks and commands
- See [Slash Menu](slash-menu.md) for details

## Toolbar Architecture

```
FloatingToolbar Component
├── Toolbar Position Calculation
│   └── getSelectionBoundingRect()
├── Formatting Actions
│   ├── toggleBold
│   ├── toggleItalic
│   ├── toggleUnderline
│   └── toggleStrikethrough
├── Block Actions
│   ├── duplicateBlock
│   ├── deleteBlock
│   └── convertBlock
└── AI Actions (Future)
    ├── summarizeSelection
    ├── rewriteSelection
    └── generateIdeas
```

## Implementation

### Positioning

```typescript
// Calculate toolbar position based on selection
function getToolbarPosition(): { top: number; left: number } {
  const selection = window.getSelection()
  if (!selection || selection.rangeCount === 0) return { top: 0, left: 0 }

  const range = selection.getRangeAt(0)
  const rect = range.getBoundingClientRect()

  return {
    top: rect.top - TOOLBAR_HEIGHT - 8,
    left: rect.left + rect.width / 2 - TOOLBAR_WIDTH / 2,
  }
}
```

### Formatting Actions

Toolbar actions modify the current selection or block content:

```typescript
// Toggle bold formatting on selected text
function toggleBold(controller: EditorController, blockId: string) {
  const block = controller.getBlock(blockId)
  if (!block) return

  // Apply or remove bold format
  const hasBold = block.formats.some(
    (f) => f.type === 'bold' && f.start <= selection.start && f.end >= selection.end
  )

  if (hasBold) {
    controller.removeFormat(blockId, 'bold', selection.start, selection.end)
  } else {
    controller.addFormat(blockId, 'bold', null, selection.start, selection.end)
  }
}
```

## Toolbar Components

### FormatButton

Reusable button for toolbar actions:

```typescript
interface FormatButtonProps {
  icon: React.ReactNode
  isActive: boolean
  onClick: () => void
  tooltip: string
}
```

### ToolbarDivider

Visual separator between toolbar action groups.

## Context Sensitivity

The toolbar adapts its actions based on:

| Context | Available Actions |
|---------|-------------------|
| Text selected | Bold, italic, link, color, highlight |
| Block focused | Duplicate, delete, convert, move |
| Image selected | Replace, align, caption, delete |
| Table selected | Add row/column, delete, merge cells |
| Code block | Language switch, copy, wrap |

## Styling

- Background: `bg-popover`
- Border: `border rounded-lg shadow-md`
- Buttons: `hover:bg-accent hover:text-accent-foreground`
- Active state: `bg-accent text-accent-foreground`
- Transition: `transition-colors duration-150`

## Future Enhancements

- [ ] Inline color picker
- [ ] Font size controls
- [ ] Text alignment buttons
- [ ] AI-assisted writing actions
- [ ] Custom toolbar plugins

## Related Documentation

- [Slash Menu](slash-menu.md) — Block insertion via `/`
- [Block System](block-system.md) — Block types and operations
- [Keyboard Shortcuts](keyboard-shortcuts.md) — Keyboard equivalents