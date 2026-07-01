import * as React from 'react'
import { useEditor } from './editor-hooks'

const SelectionLayer = React.forwardRef<HTMLDivElement>((_props, ref) => {
  const { controller } = useEditor()
  const selection = controller.getSelection()

  if (!selection || selection.selectedBlockIds.length <= 1) {
    return null
  }

  return (
    <div
      ref={ref}
      className="pointer-events-none fixed inset-0 z-50"
      aria-hidden
    />
  )
})
SelectionLayer.displayName = 'SelectionLayer'

export { SelectionLayer }
