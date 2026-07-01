import React from 'react'
import { EditorProvider } from '@/modules/editor/editor-provider'
import { EditorView } from '@/modules/editor/editor-view'
import { useEditor } from '@/editor/hooks/use-editor'
import { Sidebar } from '@/editor/components/Sidebar/Sidebar'
import type { EditorProps } from '@/editor/types'

function EditorInner({
  pageId,
  workspaceId,
  readOnly,
  onChange,
  className,
  children,
}: EditorProps) {
  const { controller } = useEditor()
  const lastPageRef = React.useRef<string | null>(null)

  React.useEffect(() => {
    if (!pageId || !workspaceId) return
    if (pageId === lastPageRef.current) return
    lastPageRef.current = pageId
    controller.openDocument(pageId, workspaceId)
  }, [pageId, workspaceId, controller])

  React.useEffect(() => {
    if (readOnly === undefined) return
    controller.setReadOnly(readOnly)
  }, [readOnly, controller])

  React.useEffect(() => {
    if (!onChange) return
    const handler = () => {
      const tree = controller.getRenderTree()
      onChange(tree)
    }
    controller.addEventListener('content-change', handler)
    return () => controller.removeEventListener('content-change', handler)
  }, [onChange, controller])

  return (
    <div className="flex h-full overflow-hidden">
      <Sidebar />
      <div className="flex-1 overflow-y-auto">
        <EditorView className={className} />
      </div>
      {children}
    </div>
  )
}

export function Editor(props: EditorProps) {
  return (
    <EditorProvider>
      <EditorInner {...props} />
    </EditorProvider>
  )
}
