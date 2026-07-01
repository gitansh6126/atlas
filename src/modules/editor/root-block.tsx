import React from 'react'
import { cn } from '@/shared/utils/cn'
import type { EditorController } from './editor-controller.ts'
import { useReadOnly } from './editor-hooks.ts'

interface RootBlockProps {
  node: { id: string; content?: Record<string, unknown> }
  controller: EditorController
}

export function RootBlock({ node, controller }: RootBlockProps) {
  const page = controller.getPage()
  const [title, setTitle] = React.useState(page?.title ?? '')
  const ref = React.useRef<HTMLDivElement>(null)
  const isReadOnly = useReadOnly()

  React.useEffect(() => {
    const onChange = () => {
      const p = controller.getPage()
      if (p) setTitle(p.title)
    }
    controller.addEventListener('page-title-change', onChange)
    return () => controller.removeEventListener('page-title-change', onChange)
  }, [controller])

  React.useEffect(() => {
    const p = controller.getPage()
    if (p && p.title !== title) {
      setTitle(p.title)
    }
  }, [node])

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const newTitle = (e.target as HTMLDivElement).textContent ?? ''
    setTitle(newTitle)
    controller.updatePageTitle(newTitle)
  }

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      const firstBlockId = controller.getFirstEditableBlockId()
      if (firstBlockId) {
        controller.focusBlock(firstBlockId, 0)
      } else {
        const block = await controller.insertBlock('paragraph')
        if (block) {
          requestAnimationFrame(() => controller.focusBlock(block.id, 0))
        }
      }
    }
    if (e.key === 'Home' && !e.shiftKey) {
      e.preventDefault()
      const sel = window.getSelection()
      if (sel && ref.current) {
        const range = document.createRange()
        range.setStart(ref.current, 0)
        range.collapse(true)
        sel.removeAllRanges()
        sel.addRange(range)
      }
    }
    if (e.key === 'End' && !e.shiftKey) {
      e.preventDefault()
      const sel = window.getSelection()
      if (sel && ref.current) {
        const range = document.createRange()
        range.selectNodeContents(ref.current)
        range.collapse(false)
        sel.removeAllRanges()
        sel.addRange(range)
      }
    }
  }

  return (
    <div
      ref={ref}
      id={`block-${node.id}`}
      role="textbox"
      aria-label="Page title"
      aria-placeholder="Untitled"
      contentEditable={!isReadOnly}
      suppressContentEditableWarning
      className={cn(
        'mb-6 text-4xl font-bold outline-none break-words whitespace-pre-wrap',
        !isReadOnly && 'empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/40 empty:before:pointer-events-none',
        'focus-visible:outline-none focus-visible:ring-0'
      )}
      data-placeholder={!isReadOnly ? 'Untitled' : undefined}
      onInput={!isReadOnly ? handleInput : undefined}
      onKeyDown={!isReadOnly ? handleKeyDown : undefined}
    >
      {title}
    </div>
  )
}
