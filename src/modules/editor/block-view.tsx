import React from 'react'
import { cn } from '@/shared/utils/cn'
import type { RenderNode } from '@/core/editor/types'
import type { EditorController } from './editor-controller.ts'
import { ParagraphBlock } from './paragraph-block.tsx'
import { HeadingBlock } from './heading-block.tsx'
import { DividerBlock } from './divider-block.tsx'
import {
  GridBlock,
  ListBlock,
  CardBlock,
  GalleryBlock,
  KanbanBlock,
  CalendarBlock,
} from './grid-blocks.tsx'
import {
  LabelBlock,
  TagBlock,
  HtmlEmbedBlock,
} from './embed-blocks.tsx'
import { BlockControls } from '@/editor/components/BlockControls/BlockControls'
import { ContextMenu } from '@/editor/components/ContextMenu/ContextMenu'
import { BlockPicker } from '@/editor/components/BlockPicker/BlockPicker'
import { getBlockDomId } from './block-utils.ts'
import { useReadOnly } from './editor-hooks.ts'

interface BlockViewProps {
  node: RenderNode
  selectedBlockIds: string[]
  dragOverBlockId: string | null
  slashMenuBlockId: string | null
  onSlashOpen: (blockId: string) => void
  onSlashClose: () => void
  slashOpen: boolean
  controller: EditorController
  onDragOver: (e: React.DragEvent, blockId: string) => void
  onDrop: (e: React.DragEvent, blockId: string) => void
  onBlockMenuOpen?: (blockId: string, anchorEl: HTMLElement) => void
  blockMenuBlockId?: string | null
  onBlockMenuClose?: () => void
  onDragStart?: (blockId: string, e: React.DragEvent) => void
  onConvert?: (blockId: string, newType: string) => void
}

export const BlockView = React.memo(function BlockView({
  node,
  selectedBlockIds,
  dragOverBlockId: _db,
  slashMenuBlockId,
  onSlashOpen,
  onSlashClose,
  slashOpen,
  controller,
  onDragOver,
  onDrop,
  onDragStart,
  onConvert,
}: BlockViewProps) {
  const isReadOnly = useReadOnly()
  const blockId = node.blockId
  const isSelected = selectedBlockIds.includes(blockId)
  const isSlashMenuOpen = slashMenuBlockId === blockId && slashOpen
  const type = node.type as string
  const props = node.props as Record<string, unknown> | undefined
  const text = (props?.text as string) ?? ''

  const [menuOpen, setMenuOpen] = React.useState(false)
  const [pickerOpen, setPickerOpen] = React.useState(false)
  const [menuAnchorEl, setMenuAnchorEl] = React.useState<HTMLElement | null>(null)
  const [pickerAnchorEl, setPickerAnchorEl] = React.useState<HTMLElement | null>(null)

  const pluginRenderer = React.useMemo(() => {
    const reg = controller.getBlockRegistration(type)
    return reg?.renderer as React.ComponentType<Record<string, unknown>> | undefined
  }, [type, controller])

  const handleMenuOpen = React.useCallback((_blockId: string, el: HTMLElement) => {
    setMenuOpen(true)
    setMenuAnchorEl(el)
  }, [])

  const handleMenuClose = React.useCallback(() => {
    setMenuOpen(false)
    setMenuAnchorEl(null)
  }, [])

  const handlePickerOpen = React.useCallback((_blockId: string, el: HTMLElement) => {
    setPickerOpen(true)
    setPickerAnchorEl(el)
  }, [])

  const handlePickerClose = React.useCallback(() => {
    setPickerOpen(false)
    setPickerAnchorEl(null)
  }, [])

  const handlePickerSelect = React.useCallback(
    (selectedType: string) => {
      controller.insertBlockAfter(blockId, selectedType)
      setPickerOpen(false)
      setPickerAnchorEl(null)
    },
    [controller, blockId]
  )

  const htmlId = getBlockDomId(blockId)

  const handleLocalDragStart = React.useCallback(
    (id: string, e: React.DragEvent) => {
      if (onDragStart) {
        onDragStart(id, e)
      }
    },
    [onDragStart]
  )

  const renderBlockContent = () => {
    if (pluginRenderer) {
      const renderProps: Record<string, unknown> = {
        blockId,
        text,
        controller,
        isSelected,
        onSlashOpen,
        onSlashClose,
        slashOpen: isSlashMenuOpen,
        ...(props ?? {}),
      }
      return React.createElement(pluginRenderer, renderProps)
    }

    switch (type) {
      case 'paragraph': {
        return (
          <ParagraphBlock
            blockId={blockId}
            text={text}
            controller={controller}
            onSlashOpen={onSlashOpen}
            onSlashClose={onSlashClose}
            slashOpen={isSlashMenuOpen}
            isSelected={isSelected}
          />
        )
      }
      case 'heading': {
        const level = (props?.level as number) ?? 2
        return (
          <HeadingBlock
            blockId={blockId}
            text={text}
            level={level}
            controller={controller}
            isSelected={isSelected}
          />
        )
      }
      case 'divider': {
        return <DividerBlock blockId={blockId} controller={controller} />
      }
      case 'grid': {
        return (
          <GridBlock
            node={node}
            controller={controller}
            isSelected={isSelected}
            selectedBlockIds={selectedBlockIds}
          />
        )
      }
      case 'list': {
        return (
          <ListBlock
            node={node}
            controller={controller}
            isSelected={isSelected}
            selectedBlockIds={selectedBlockIds}
          />
        )
      }
      case 'card': {
        return (
          <CardBlock
            node={node}
            controller={controller}
            isSelected={isSelected}
            selectedBlockIds={selectedBlockIds}
          />
        )
      }
      case 'gallery': {
        return (
          <GalleryBlock
            node={node}
            controller={controller}
            isSelected={isSelected}
            selectedBlockIds={selectedBlockIds}
          />
        )
      }
      case 'kanban': {
        return (
          <KanbanBlock
            node={node}
            controller={controller}
            isSelected={isSelected}
            selectedBlockIds={selectedBlockIds}
          />
        )
      }
      case 'calendar': {
        return (
          <CalendarBlock
            node={node}
            controller={controller}
            isSelected={isSelected}
            selectedBlockIds={selectedBlockIds}
          />
        )
      }
      case 'label': {
        return (
          <LabelBlock
            node={node}
            controller={controller}
            isSelected={isSelected}
            selectedBlockIds={selectedBlockIds}
          />
        )
      }
      case 'tag': {
        return (
          <TagBlock
            node={node}
            controller={controller}
            isSelected={isSelected}
            selectedBlockIds={selectedBlockIds}
          />
        )
      }
      case 'html_embed': {
        return (
          <HtmlEmbedBlock
            node={node}
            controller={controller}
            isSelected={isSelected}
            selectedBlockIds={selectedBlockIds}
          />
        )
      }
      default:
        return (
          <ParagraphBlock
            blockId={blockId}
            text={text}
            controller={controller}
            onSlashOpen={onSlashOpen}
            onSlashClose={onSlashClose}
            slashOpen={isSlashMenuOpen}
            isSelected={isSelected}
          />
        )
    }
  }

  return (
    <div
      id={htmlId}
      data-block-id={blockId}
      className={cn(
        'group relative px-1 py-0.5',
        type === 'divider' && 'py-1'
      )}
      onDragOver={(e) => !isReadOnly && onDragOver(e, blockId)}
      onDrop={(e) => !isReadOnly && onDrop(e, blockId)}
    >
      {!isReadOnly && (
        <BlockControls
          blockId={blockId}
          controller={controller}
          isSelected={isSelected}
          onMenuOpen={handleMenuOpen}
          onPickerOpen={handlePickerOpen}
          onDragStart={handleLocalDragStart}
        />
      )}
      <div className="ml-0">
        {renderBlockContent()}
      </div>
      {!isReadOnly && (
        <>
          <ContextMenu
            blockId={blockId}
            blockType={type}
            open={menuOpen}
            onClose={handleMenuClose}
            controller={controller}
            anchorEl={menuAnchorEl}
            onConvert={onConvert}
          />
          <BlockPicker
            blockId={blockId}
            open={pickerOpen}
            onClose={handlePickerClose}
            onSelect={handlePickerSelect}
            controller={controller}
            anchorEl={pickerAnchorEl}
          />
        </>
      )}
    </div>
  )
})
