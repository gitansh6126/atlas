import type { PluginLifecycle, BlockValidator, BlockSerializer, BlockParser } from '@/core/editor/plugin-sdk'
import { textBlockCapabilities } from '@/core/editor/plugin-sdk'
import { ParagraphRenderer } from './paragraph-renderer.tsx'

export const validateParagraph: BlockValidator = (content) => {
  const errors: string[] = []
  if (typeof content.text !== 'string') {
    errors.push('Paragraph block is missing "text" in content')
  }
  return errors
}

export const serializeParagraphMarkdown: BlockSerializer = (block) => {
  const text = (block.content.text as string) ?? ''
  return text + '\n\n'
}

export const serializeParagraphHtml: BlockSerializer = (block) => {
  const text = (block.content.text as string) ?? ''
  return `<p>${text}</p>\n`
}

export const serializeParagraphJson: BlockSerializer = (block) => {
  return JSON.stringify({ text: block.content.text })
}

export const parseParagraph: BlockParser = (input) => {
  return input.trim() ? { content: { text: input.trim() } } : null
}

export const paragraphPlugin: PluginLifecycle = {
  manifest: {
    id: 'paragraph',
    name: 'Paragraph',
    version: '1.0.0',
    description: 'Standard text block with inline formatting support',
    author: 'Atlas Team',
    icon: 'Type',
    category: 'text',
  },
  capabilities: textBlockCapabilities(),

  register(context) {
    context.api.registerBlockType({
      type: 'paragraph',
      renderer: ParagraphRenderer,
      validator: validateParagraph,
      serializers: {
        markdown: serializeParagraphMarkdown,
        html: serializeParagraphHtml,
        json: serializeParagraphJson,
      },
      parsers: { markdown: parseParagraph },
      slashCommand: {
        title: 'Paragraph',
        description: 'Plain text block',
        searchTerms: ['text', 'plain', 'body'],
        group: 'text',
        aliases: ['p', 'text'],
      },
      toolbarActions: [
        { id: 'paragraph:bold', label: 'Bold', icon: 'Bold' },
        { id: 'paragraph:italic', label: 'Italic', icon: 'Italic' },
      ],
      contextMenuActions: [
        { id: 'paragraph:duplicate', label: 'Duplicate', group: 'edit' },
        { id: 'paragraph:delete', label: 'Delete', group: 'edit' },
      ],
      placeholder: "Type '/' for commands...",
    })
  },
}
