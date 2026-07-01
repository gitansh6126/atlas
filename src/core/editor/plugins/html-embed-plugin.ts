import type { BlockPlugin } from '@/core/editor/plugin-registry'
import type { Block, RenderNode } from '@/core/editor/types'
import type { DocumentModel } from '@/core/editor/document-model'

function render(block: Block, _children: RenderNode[], _document: DocumentModel): RenderNode {
  return {
    blockId: block.id,
    type: block.type,
    depth: 0,
    props: {
      html: block.content?.html ?? '',
      css: block.content?.css ?? '',
      files: block.content?.files ?? [],
    },
    children: [],
  }
}

export const htmlEmbedPlugin: BlockPlugin = {
  type: 'html_embed',
  name: 'HTML Embed',
  version: '1.0.0',
  render,
}