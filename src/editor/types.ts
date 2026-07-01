import type { RenderNode } from '@/core/editor/types'

export interface EditorProps {
  pageId?: string
  workspaceId?: string
  readOnly?: boolean
  autoFocus?: boolean
  onChange?: (renderTree: RenderNode[]) => void
  className?: string
  placeholder?: string
  children?: React.ReactNode
}
