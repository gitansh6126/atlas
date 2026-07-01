import type { BlockPlugin } from '@/core/editor/plugin-registry'
import type { Block, RenderNode } from '@/core/editor/types'
import type { DocumentModel } from '@/core/editor/document-model'

function render(block: Block, _children: RenderNode[], _document: DocumentModel): RenderNode {
  return {
    blockId: block.id,
    type: block.type,
    depth: 0,
    props: {
      columns: block.content?.columns ?? 3,
      gap: block.content?.gap ?? 4,
      layout: block.content?.layout ?? 'fixed',
    },
    children: [],
  }
}

export const gridPlugin: BlockPlugin = {
  type: 'grid',
  name: 'Grid',
  version: '1.0.0',
  render,
}