import type { BlockPlugin } from '@/core/editor/plugin-registry'
import type { Block, RenderNode } from '@/core/editor/types'
import type { DocumentModel } from '@/core/editor/document-model'

function render(block: Block, children: RenderNode[], _document: DocumentModel): RenderNode {
  return {
    blockId: block.id,
    type: block.type,
    depth: 0,
    props: {
      level: block.content?.level ?? 1,
      text: block.content?.text ?? '',
      formats: block.formats,
    },
    children,
  }
}

function validate(block: Block): string[] {
  const errors: string[] = []
  const level = block.content?.level

  if (typeof level !== 'number' || level < 1 || level > 6) {
    errors.push(`Heading block ${block.id} has invalid level: ${String(level)}`)
  }

  if (typeof block.content?.text !== 'string') {
    errors.push(`Heading block ${block.id} is missing "text" in content`)
  }

  return errors
}

export const headingPlugin: BlockPlugin = {
  type: 'heading',
  name: 'Heading',
  version: '1.0.0',
  render,
  validate,
}
