import * as React from 'react'
import { EditorContext } from './editor-context'
import { EditorController } from './editor-controller'
import { PluginManager } from '@/core/editor/plugin-sdk'
import { paragraphPlugin } from '@/plugins/paragraph'
import { headingPlugin } from '@/plugins/heading'
import { dividerPlugin } from '@/plugins/divider'
import { bulletedListPlugin } from '@/plugins/bulleted-list'
import { numberedListPlugin } from '@/plugins/numbered-list'
import { checklistPlugin } from '@/plugins/checklist'
import { quotePlugin } from '@/plugins/quote'
import { calloutPlugin } from '@/plugins/callout'
import { togglePlugin } from '@/plugins/toggle'
import { imagePlugin } from '@/plugins/image/image-plugin'
import type { RenderNode, Selection } from '@/core/editor/types'
import type { Page } from '@/core/types/domain'

interface EditorProviderProps {
  children: React.ReactNode;
}

const EditorProvider = React.forwardRef<EditorController, EditorProviderProps>(
  ({ children }, _ref) => {
    const [controller, setController] = React.useState<EditorController | null>(null)

    const [isOpen, setIsOpen] = React.useState(false)
    const [page, setPage] = React.useState<Page | null>(null)
    const [renderTree, setRenderTree] = React.useState<RenderNode[]>([])
    const [selection, setSelection] = React.useState<Selection | null>(null)
    const [isDirty, setIsDirty] = React.useState(false)
    const [isSaving, setIsSaving] = React.useState(false)
    const [lastSavedAt, setLastSavedAt] = React.useState(0)
    const [isReadOnly, setIsReadOnly] = React.useState(false)
    const [_tick, setTick] = React.useState(0)

    React.useEffect(() => {
      const ctrl = new EditorController()
      let disposed = false

      ;(async () => {
        const manager = new PluginManager(ctrl.getEngine().getPluginRegistry())
        const pluginDefs = [
          paragraphPlugin,
          headingPlugin,
          dividerPlugin,
          bulletedListPlugin,
          numberedListPlugin,
          checklistPlugin,
          quotePlugin,
          calloutPlugin,
          togglePlugin,
          imagePlugin,
        ]
        for (const plugin of pluginDefs) {
          try {
            const id = manager.register(plugin)
            if (id) await manager.initialize(id)
          } catch (e) {
            console.warn(`Failed to register plugin "${plugin.manifest?.id ?? 'unknown'}":`, e)
          }
        }
        if (disposed) return
        ctrl.setPluginManager(manager)
        setController(ctrl)
      })()

      const handleDocumentChange = () => {
        if (disposed) return
        setIsOpen(ctrl.isDocumentOpen())
        setPage(ctrl.getPage())
        setRenderTree(ctrl.getRenderTree())
        setIsDirty(ctrl.isDirty())
        setIsSaving(ctrl.isSaving())
        setLastSavedAt(ctrl.getLastSavedAt())
        setIsReadOnly(ctrl.isReadOnly())
      }

      const handleContentChange = () => {
        if (disposed) return
        setRenderTree(ctrl.getRenderTree())
        setIsDirty(ctrl.isDirty())
        setTick((t) => t + 1)
      }

      const handleSelectionChange = () => {
        if (disposed) return
        setSelection(ctrl.getSelection())
      }

      const handleSaveStateChange = () => {
        if (disposed) return
        setIsDirty(ctrl.isDirty())
        setIsSaving(ctrl.isSaving())
        setLastSavedAt(ctrl.getLastSavedAt())
      }

      const handlePageTitleChange = () => {
        if (disposed) return
        setPage(ctrl.getPage())
        setTick((t) => t + 1)
      }

      const handleReadOnlyChange = () => {
        if (disposed) return
        setIsReadOnly(ctrl.isReadOnly())
      }

      ctrl.addEventListener('document-change', handleDocumentChange)
      ctrl.addEventListener('content-change', handleContentChange)
      ctrl.addEventListener('selection-change', handleSelectionChange)
      ctrl.addEventListener('save-state-change', handleSaveStateChange)
      ctrl.addEventListener('page-title-change', handlePageTitleChange)
      ctrl.addEventListener('read-only-change', handleReadOnlyChange)

      return () => {
        disposed = true
        ctrl.removeEventListener('document-change', handleDocumentChange)
        ctrl.removeEventListener('content-change', handleContentChange)
        ctrl.removeEventListener('selection-change', handleSelectionChange)
        ctrl.removeEventListener('save-state-change', handleSaveStateChange)
        ctrl.removeEventListener('page-title-change', handlePageTitleChange)
        ctrl.removeEventListener('read-only-change', handleReadOnlyChange)
        ctrl.closeDocument()
      }
    }, [])

    const value: {
      controller: EditorController;
      isOpen: boolean;
      page: Page | null;
      renderTree: RenderNode[];
      selection: Selection | null;
      isDirty: boolean;
      isSaving: boolean;
      lastSavedAt: number;
      isReadOnly: boolean;
    } = React.useMemo(() => ({
      controller: controller!,
      isOpen,
      page,
      renderTree,
      selection,
      isDirty,
      isSaving,
      lastSavedAt,
      isReadOnly,
    }), [controller, isOpen, page, renderTree, selection, isDirty, isSaving, lastSavedAt, isReadOnly])

    if (!controller) return null

    return (
      <EditorContext.Provider value={value}>
        {children}
      </EditorContext.Provider>
    )
  },
)
EditorProvider.displayName = 'EditorProvider'

export { EditorProvider }
