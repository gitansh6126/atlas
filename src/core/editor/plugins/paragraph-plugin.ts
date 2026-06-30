import type { BlockPlugin } from '@/core/editor/plugin-registry'
import type { Block, RenderNode } from '@/core/editor/types'
import type { DocumentModel } from '@/core/editor/document-model'

function render(block: Block, children: RenderNode[], _document: DocumentModel): RenderNode {
  return {
    blockId: block.id,
    type: block.type,
    depth: 0,
    props: {
      text: block.content?.text ?? '',
      formats: block.formats,
    },
    children,
  }
}

function validate(block: Block): string[] {
  const errors: string[] = []

  if (typeof block.content?.text !== 'string') {
    errors.push(`Paragraph block ${block.id} is missing "text" in content`)
  }

  return errors
}

export const paragraphPlugin: BlockPlugin = {
  type: 'paragraph',
  name: 'Paragraph',
  version: '1.0.0',
  render,
  validate,
}
