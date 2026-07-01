import type { PluginLifecycle, BlockValidator, BlockSerializer, BlockParser } from '@/core/editor/plugin-sdk'
import { textBlockCapabilities } from '@/core/editor/plugin-sdk'
import { NumberedListItemRenderer } from './numbered-list-renderer.tsx'

export const validateOrderedListItem: BlockValidator = (content) => {
  const errors: string[] = []
  if (typeof content.text !== 'string') {
    errors.push('Numbered list item is missing "text" in content')
  }
  return errors
}

export const serializeOrderedListItemMarkdown: BlockSerializer = (block) => {
  const text = (block.content.text as string) ?? ''
  const indent = (block.metadata?.indent as number) ?? 0
  const prefix = '\t'.repeat(indent)
  return `${prefix}1. ${text}\n`
}

export const serializeOrderedListItemHtml: BlockSerializer = (block) => {
  const text = (block.content.text as string) ?? ''
  return `<li>${text}</li>\n`
}

export const serializeOrderedListItemJson: BlockSerializer = (block) => {
  return JSON.stringify({
    text: block.content.text,
    indent: block.content.indent ?? 0,
    number: block.content.number ?? 1,
  })
}

export const parseOrderedListItem: BlockParser = (input) => {
  const match = input.match(/^(\t*)\d+\.\s+(.*)$/)
  if (match) {
    return {
      content: {
        text: match[2].trim(),
        metadata: { indent: match[1].length },
      },
    }
  }
  return null
}

export const numberedListPlugin: PluginLifecycle = {
  manifest: {
    id: 'numbered-list',
    name: 'Numbered List',
    version: '1.0.0',
    description: 'Ordered list item with sequential numbering',
    author: 'Atlas Team',
    icon: 'ListOrdered',
    category: 'text',
  },
  capabilities: textBlockCapabilities(),

  register(context) {
    context.api.registerBlockType({
      type: 'ordered_list_item',
      renderer: NumberedListItemRenderer,
      validator: validateOrderedListItem,
      serializers: {
        markdown: serializeOrderedListItemMarkdown,
        html: serializeOrderedListItemHtml,
        json: serializeOrderedListItemJson,
      },
      parsers: { markdown: parseOrderedListItem },
      slashCommand: {
        title: 'Numbered List',
        description: 'Ordered list with numbers',
        searchTerms: ['ol', 'ordered', 'numbered', 'list', 'enumeration'],
        group: 'text',
        aliases: ['ol', 'ordered list', 'numbered list', 'enum'],
      },
      toolbarActions: [
        { id: 'ordered:indent', label: 'Indent', icon: 'Indent' },
        { id: 'ordered:outdent', label: 'Outdent', icon: 'Outdent' },
      ],
      contextMenuActions: [
        { id: 'numbered:duplicate', label: 'Duplicate', group: 'edit' },
        { id: 'numbered:delete', label: 'Delete', group: 'edit' },
        { id: 'numbered:indent', label: 'Indent', group: 'list' },
        { id: 'numbered:outdent', label: 'Outdent', group: 'list' },
      ],
      placeholder: 'List item',
    })
  },
}
