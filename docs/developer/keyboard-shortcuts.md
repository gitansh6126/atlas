# Keyboard Shortcuts

Atlas provides robust keyboard handling for navigation, editing, and command execution.

---

## Handler Architecture

Keyboard events are intercepted at the `EditorSurface` level and dispatched through a priority chain:

```
Global Shortcuts (Ctrl/Cmd + ...)
  → Block-Level Shortcuts (e.g., List item indentation)
    → Inline Editing (Typing, Backspace, etc.)
```

- **Global**: Window-level listeners for app-wide shortcuts (e.g., `Ctrl+P` for print).
- **Editor**: Captures arrow keys, enter, backspace, formatting shortcuts.
- **Block**: Specific overrides (e.g., `Tab` for list indentation, `Escape` for deselecting).

---

## Navigation

| Key | Action |
|---|---|
| `ArrowUp` | Move cursor to previous block |
| `ArrowDown` | Move cursor to next block |
| `ArrowLeft` / `ArrowRight` | Move within block text |
| `Home` / `End` | Move to start / end of current block |
| `PageUp` / `PageDown` | Scroll and jump ~10 blocks |

---

## Editing Shortcuts

| Shortcut | Action |
|---|---|
| `Enter` | Insert new block below / split current block |
| `Shift+Enter` | Soft line break (within paragraph) |
| `Backspace` | Remove character / merge with previous block |
| `Delete` | Remove character / remove empty block |
| `Tab` | Indent list item / focus next input |
| `Shift+Tab` | Outdent list item richly / focus previous input |

---

## Formatting Shortcuts

| Shortcut (Mac/Win) | Action |
|---|---|
| `Cmd/Ctrl+B` | Toggle bold |
| `Cmd/Ctrl+I` | Toggle italic |
| `Cmd/Ctrl+U` | Toggle underline |
| `Cmd/Ctrl+K` | Insert link |

---

## Command Shortcuts

| Shortcut | Action |
|---|---|
| `Cmd/Ctrl+Z` | Undo |
| `Cmd/Ctrl+Shift+Z` | Redo |
| `/` | Open Slash Menu |
| `Cmd/Ctrl+Shift+1` | Insert Heading 1 |
| `Cmd/Ctrl+Shift+2` | Insert Heading 2 |
| `Cmd/Ctrl+Shift+P` | Insert Paragraph |
| `Cmd/Ctrl+Shift+D` | Insert Divider |

---

## Implementation

Shortcuts are registered via a `KeyboardShortcutRegistry` which maps key combinations to command dispatchers.

```ts
shortcuts.register({
  key: "mod+z",
  handler: () => editor.undo(),
});

shortcuts.register({
  key: "/",
  when: "editor-focused",
  handler: () => slashMenu.open(),
});
```

---

## Conflict Resolution

When multiple handlers match an input (e.g., a block-level handler and a global handler), the most specific context wins. Block-level handlers can call `event.stopPropagation()` to prevent the global handler from firing.
