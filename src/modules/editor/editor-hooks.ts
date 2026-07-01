import { useContext } from 'react'
import { EditorContext, type EditorContextValue } from './editor-context.tsx'

export function useEditor(): EditorContextValue {
  const ctx = useContext(EditorContext)
  if (!ctx) {
    throw new Error('useEditor must be used within an EditorProvider')
  }
  return ctx
}

export function useEditorController() {
  return useEditor().controller
}

export function useRenderTree() {
  return useEditor().renderTree
}

export function useIsDocumentOpen() {
  return useEditor().isOpen
}

export function usePage() {
  return useEditor().page
}

export function useDirtyState() {
  return useEditor().isDirty
}

export function useSavingState() {
  return useEditor().isSaving
}
