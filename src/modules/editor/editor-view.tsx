import React from 'react'
import { RootBlock } from './root-block.tsx'
import { BlockView } from './block-view.tsx'
import { cn } from '@/shared/utils/cn'
import { useEditor } from './editor-hooks.ts'
import { SlashMenu, type SlashMenuItem } from './slash-menu.tsx'
import { BlockSelection } from './block-selection.tsx'
import { FloatingToolbar } from '@/editor/components/FloatingToolbar/FloatingToolbar'
import { DragOverlay } from '@/editor/components/DragOverlay/DragOverlay'
import { useBlockSelection } from '@/editor/hooks/useBlockSelection'
import { useClipboard } from '@/editor/hooks/useClipboard'
import { useDragDrop } from '@/editor/hooks/useDragDrop'
import { useKeyboardNavigation } from '@/editor/hooks/useKeyboardNavigation'
import type { RenderNode } from '@/core/editor/types'

interface EditorViewProps {
  className?: string
}

export function EditorView({ className }: EditorViewProps) {
  const { controller, renderTree, isOpen } = useEditor()
  const [slashMenuBlockId, setSlashMenuBlockId] = React.useState<string | null>(null)
  const [slashOpen, setSlashOpen] = React.useState(false)
  const [slashFilter, setSlashFilter] = React.useState('')
  const viewportRef = React.useRef<HTMLDivElement>(null)

  const {
    selectedBlockIds,
  } = useBlockSelection(controller)

  const {
    dragState,
    handleDragOver,
    handleDrop,
    handleDragEnd,
  } = useDragDrop(controller)

  useClipboard(
    controller,
    () => selectedBlockIds,
    () => selectedBlockIds[selectedBlockIds.length - 1] ?? null
  )

  useKeyboardNavigation(controller, isOpen)

  const slashItems = React.useMemo(() => {
    const items: SlashMenuItem[] = []
    const seen = new Set<string>()

    const commands = controller.getPluginSlashCommands()
    for (const entry of commands) {
      const key = entry.blockType + entry.command.title
      if (seen.has(key)) continue
      seen.add(key)
      items.push({
        type: entry.blockType,
        label: entry.command.title,
        description: entry.command.description ?? '',
      })
    }

    return items
  }, [controller])

  React.useEffect(() => {
    if (!isOpen || renderTree.length === 0) return
    const rootNode = renderTree[0]
    if (rootNode.children && rootNode.children.length > 0) {
      const firstChild = rootNode.children[0]
      controller.focusBlock(firstChild.blockId, 0)
    }
  }, [isOpen, renderTree, controller])

  React.useEffect(() => {
    if (!slashOpen || !slashMenuBlockId) return
    const handler = () => {
      const block = controller.getBlock(slashMenuBlockId)
      if (block && typeof block.content.text === 'string') {
        const text = block.content.text as string
        if (text.startsWith('/')) {
          setSlashFilter(text.slice(1))
        }
      }
    }
    controller.addEventListener('content-change', handler)
    return () => controller.removeEventListener('content-change', handler)
  }, [slashOpen, slashMenuBlockId, controller])

  React.useEffect(() => {
    if (!isOpen) return
    const handler = () => handleDragEnd()
    document.addEventListener('dragend', handler)
    return () => document.removeEventListener('dragend', handler)
  }, [isOpen, handleDragEnd])

  const handleSlashOpen = React.useCallback(
    (blockId: string) => {
      setSlashMenuBlockId(blockId)
      setSlashOpen(true)
      const block = controller.getBlock(blockId)
      if (block && typeof block.content.text === 'string') {
        const text = block.content.text as string
        setSlashFilter(text.startsWith('/') ? text.slice(1) : '')
      } else {
        setSlashFilter('')
      }
    },
    [controller]
  )

  const handleSlashClose = React.useCallback(() => {
    setSlashMenuBlockId(null)
    setSlashOpen(false)
    setSlashFilter('')
  }, [])

  const handleSlashSelect = React.useCallback(
    async (type: string) => {
      if (!slashMenuBlockId) return
      const idx = controller.getBlockIndex(slashMenuBlockId)
      if (idx === -1) {
        handleSlashClose()
        return
      }

      const block = await controller.insertBlock(type, undefined, idx + 1, { text: '' })
      controller.deleteBlock(slashMenuBlockId)
      handleSlashClose()
      if (block) {
        requestAnimationFrame(() => controller.focusBlock(block.id, 0))
      }
    },
    [slashMenuBlockId, controller, handleSlashClose]
  )

  const handleConvert = React.useCallback(
    (blockId: string, newType: string) => {
      const converted = controller.convertBlock(blockId, newType)
      if (converted) {
        controller.focusBlock(converted.id, 0)
      }
    },
    [controller]
  )

  const handleBlockDragOver = React.useCallback(
    (e: React.DragEvent, blockId: string) => {
      handleDragOver(blockId, e)
    },
    [handleDragOver]
  )

  const handleBlockDrop = React.useCallback(
    (e: React.DragEvent, blockId: string) => {
      handleDrop(blockId, e)
    },
    [handleDrop]
  )

  const rootNode = renderTree[0]
  const childNodes = rootNode?.children ?? []

  return (
    <div
      ref={viewportRef}
      className={cn('relative mx-auto max-w-[720px] px-8 py-12', className)}
      role="document"
      aria-label="Editor content"
    >
      {rootNode && (
        <RootBlock node={{ id: rootNode.blockId, content: rootNode.props }} controller={controller} />
      )}
      <div className="relative">
        {childNodes.map((childNode: RenderNode) => (
          <BlockView
            key={childNode.blockId}
            node={childNode}
            selectedBlockIds={selectedBlockIds}
            dragOverBlockId={dragState.targetBlockId}
            slashMenuBlockId={slashMenuBlockId}
            onSlashOpen={handleSlashOpen}
            onSlashClose={handleSlashClose}
            slashOpen={slashOpen}
            controller={controller}
            onDragOver={handleBlockDragOver}
            onDrop={handleBlockDrop}
            onDragStart={(id, e) => {
              e.dataTransfer.setData('text/plain', id)
              e.dataTransfer.effectAllowed = 'move'
            }}
            onConvert={handleConvert}
          />
        ))}
      </div>
      {isOpen && <FloatingToolbar controller={controller} />}
      <DragOverlay dragState={dragState} />
      <SlashMenu
        blockId={slashMenuBlockId}
        filter={slashFilter}
        open={slashOpen}
        items={slashItems}
        controller={controller}
        onClose={handleSlashClose}
        onSelect={handleSlashSelect}
      />
      <BlockSelection
        selectedBlockIds={selectedBlockIds}
        dropTargetId={dragState.targetBlockId}
        dropPosition={dragState.position}
      />
    </div>
  )
}
