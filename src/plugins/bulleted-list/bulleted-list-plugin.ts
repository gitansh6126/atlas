import type { PluginLifecycle, BlockValidator, BlockSerializer, BlockParser } from '@/core/editor/plugin-sdk'
import { textBlockCapabilities } from '@/core/editor/plugin-sdk'
import { BulletedListItemRenderer } from './bulleted-list-renderer.tsx'

export const validateBulletedListItem: BlockValidator = (content) => {
  const errors: string[] = []
  if (typeof content.text !== 'string') {
    errors.push('Bulleted list item is missing "text" in content')
  }
  return errors
}

export const serializeBulletedListItemMarkdown: BlockSerializer = (block) => {
  const text = (block.content.text as string) ?? ''
  const indent = (block.metadata?.indent as number) ?? 0
  const prefix = '\t'.repeat(indent)
  return `${prefix}- ${text}\n`
}

export const serializeBulletedListItemHtml: BlockSerializer = (block) => {
  const text = (block.content.text as string) ?? ''
  return `<li>${text}</li>\n`
}

export const serializeBulletedListItemJson: BlockSerializer = (block) => {
  return JSON.stringify({
    text: block.content.text,
    indent: block.content.indent ?? 0,
  })
}

export const parseBulletedListItem: BlockParser = (input) => {
  const match = input.match(/^(\t*)[-*]\s+(.*)$/)
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

export const bulletedListPlugin: PluginLifecycle = {
  manifest: {
    id: 'bulleted-list',
    name: 'Bulleted List',
    version: '1.0.0',
    description: 'Unordered list item with bullet marker',
    author: 'Atlas Team',
    icon: 'List',
    category: 'text',
  },
  capabilities: textBlockCapabilities(),

  register(context) {
    context.api.registerBlockType({
      type: 'bullet_list_item',
      renderer: BulletedListItemRenderer,
      validator: validateBulletedListItem,
      serializers: {
        markdown: serializeBulletedListItemMarkdown,
        html: serializeBulletedListItemHtml,
        json: serializeBulletedListItemJson,
      },
      parsers: { markdown: parseBulletedListItem },
      slashCommand: {
        title: 'Bulleted List',
        description: 'Unordered list with bullet points',
        searchTerms: ['ul', 'unordered', 'bullet', 'list', 'items'],
        group: 'text',
        aliases: ['ul', 'unordered list', 'bullet list'],
      },
      toolbarActions: [
        { id: 'bullet:indent', label: 'Indent', icon: 'Indent' },
        { id: 'bullet:outdent', label: 'Outdent', icon: 'Outdent' },
      ],
      contextMenuActions: [
        { id: 'bullet:duplicate', label: 'Duplicate', group: 'edit' },
        { id: 'bullet:delete', label: 'Delete', group: 'edit' },
        { id: 'bullet:indent', label: 'Indent', group: 'list' },
        { id: 'bullet:outdent', label: 'Outdent', group: 'list' },
      ],
      placeholder: 'List item',
    })
  },
}
