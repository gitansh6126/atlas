import React from 'react'
import { cn } from '@/shared/utils/cn'
import type { RenderNode } from '@/core/editor/types'
import type { EditorController } from './editor-controller.ts'
import { ParagraphBlock } from './paragraph-block.tsx'
import { HeadingBlock } from './heading-block.tsx'
import { DividerBlock } from './divider-block.tsx'
import { getBlockDomId } from './block-utils.ts'

interface BlockRendererProps {
  node: RenderNode
  selectedBlockIds: string[]
  controller: EditorController
}

export const BlockRenderer = React.memo(function BlockRenderer({
  node,
  selectedBlockIds,
  controller,
}: BlockRendererProps) {
  const blockId = node.blockId
  const isSelected = selectedBlockIds.includes(blockId)
  const type = node.type as string
  const props = node.props as Record<string, unknown> | undefined
  const text = (props?.text as string) ?? ''

  const htmlId = getBlockDomId(blockId)

  const renderContent = () => {
    switch (type) {
      case 'paragraph':
        return (
          <ParagraphBlock
            blockId={blockId}
            text={text}
            controller={controller}
            onSlashOpen={() => {}}
            onSlashClose={() => {}}
            slashOpen={false}
            isSelected={isSelected}
          />
        )
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
      case 'divider':
        return <DividerBlock blockId={blockId} controller={controller} />
      default:
        return (
          <ParagraphBlock
            blockId={blockId}
            text={text}
            controller={controller}
            onSlashOpen={() => {}}
            onSlashClose={() => {}}
            slashOpen={false}
            isSelected={isSelected}
          />
        )
    }
  }

  return (
    <div
      id={htmlId}
      className={cn(
        'relative group px-1 py-0.5',
        type === 'divider' && 'py-1'
      )}
    >
      {renderContent()}
    </div>
  )
})
