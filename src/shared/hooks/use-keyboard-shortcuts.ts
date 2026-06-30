import { useEffect } from 'react'

type ShortcutHandler = (e: KeyboardEvent) => void

interface ShortcutDef {
  key: string;
  ctrlOrMeta?: boolean;
  shift?: boolean;
  alt?: boolean;
  handler: ShortcutHandler;
  preventDefault?: boolean;
}

export function useKeyboardShortcuts(shortcuts: ShortcutDef[]) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        const matchKey = e.key.toLowerCase() === shortcut.key.toLowerCase()
        const matchCtrl = shortcut.ctrlOrMeta ? (e.metaKey || e.ctrlKey) : true
        const matchShift = shortcut.shift ? e.shiftKey : true
        const matchAlt = shortcut.alt ? e.altKey : true

        if (matchKey && matchCtrl && matchShift && matchAlt) {
          if (shortcut.preventDefault !== false) {
            e.preventDefault()
            e.stopPropagation()
          }
          shortcut.handler(e)
          return
        }
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [shortcuts])
}
