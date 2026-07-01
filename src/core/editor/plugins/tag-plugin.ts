import type { BlockPlugin } from '@/core/editor/plugin-registry'
import type { Block, RenderNode } from '@/core/editor/types'
import type { DocumentModel } from '@/core/editor/document-model'

function render(block: Block, _children: RenderNode[], _document: DocumentModel): RenderNode {
  return {
    blockId: block.id,
    type: block.type,
    depth: 0,
    props: {
      label: block.content?.label ?? 'Tag',
      color: block.content?.color ?? '#3b82f6',
    },
    children: [],
  }
}

export const tagPlugin: BlockPlugin = {
  type: 'tag',
  name: 'Tag',
  version: '1.0.0',
  render,
}