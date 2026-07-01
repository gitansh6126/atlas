import * as React from 'react'
import { EditorController } from './editor-controller'
import type { RenderNode, Selection } from '@/core/editor/types'
import type { Page } from '@/core/types/domain'

export interface EditorContextValue {
  controller: EditorController;
  isOpen: boolean;
  page: Page | null;
  renderTree: RenderNode[];
  selection: Selection | null;
  isDirty: boolean;
  isSaving: boolean;
  lastSavedAt: number;
}

const EditorContext = React.createContext<EditorContextValue | null>(null)

export { EditorContext }
