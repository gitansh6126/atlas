import * as React from 'react'
import { useEditor } from './editor-hooks'

const CursorLayer = React.forwardRef<HTMLDivElement>((_props, ref) => {
  const { controller } = useEditor()
  const selection = controller.getSelection()

  if (!selection || selection.type !== 'cursor') {
    return null
  }

  return (
    <div
      ref={ref}
      className="pointer-events-none fixed top-0 left-0 h-full w-full"
      aria-hidden
    />
  )
})
CursorLayer.displayName = 'CursorLayer'

export { CursorLayer }
