import type { BlockPlugin } from '@/core/editor/plugin-registry'
import type { Block, RenderNode } from '@/core/editor/types'
import type { DocumentModel } from '@/core/editor/document-model'

function render(block: Block, _children: RenderNode[], _document: DocumentModel): RenderNode {
  return {
    blockId: block.id,
    type: block.type,
    depth: 0,
    props: {},
    children: [],
  }
}

export const dividerPlugin: BlockPlugin = {
  type: 'divider',
  name: 'Divider',
  version: '1.0.0',
  render,
}
