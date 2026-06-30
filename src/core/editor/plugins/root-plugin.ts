import type { BlockPlugin } from '@/core/editor/plugin-registry'
import type { Block, RenderNode } from '@/core/editor/types'
import type { DocumentModel } from '@/core/editor/document-model'

function render(block: Block, children: RenderNode[], _document: DocumentModel): RenderNode {
  return {
    blockId: block.id,
    type: block.type,
    depth: 0,
    props: {
      title: block.content?.title ?? '',
    },
    children,
  }
}

export const rootPlugin: BlockPlugin = {
  type: 'root',
  name: 'Root',
  version: '1.0.0',
  render,
}
