import type { BlockPlugin } from '@/core/editor/plugin-registry'
import type { Block, RenderNode } from '@/core/editor/types'
import type { DocumentModel } from '@/core/editor/document-model'

function render(block: Block, _children: RenderNode[], _document: DocumentModel): RenderNode {
  return {
    blockId: block.id,
    type: block.type,
    depth: 0,
    props: {
      text: block.content?.text ?? 'Label',
      variant: block.content?.variant ?? 'default',
    },
    children: [],
  }
}

export const labelPlugin: BlockPlugin = {
  type: 'label',
  name: 'Label',
  version: '1.0.0',
  render,
}