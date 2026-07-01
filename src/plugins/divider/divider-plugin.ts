import type { PluginLifecycle, BlockValidator, BlockSerializer, BlockParser } from '@/core/editor/plugin-sdk'
import { dividerCapabilities } from '@/core/editor/plugin-sdk'
import { DividerRenderer } from './divider-renderer.tsx'

export const validateDivider: BlockValidator = () => {
  return []
}

export const serializeDividerMarkdown: BlockSerializer = () => {
  return '---\n\n'
}

export const serializeDividerHtml: BlockSerializer = () => {
  return '<hr />\n'
}

export const serializeDividerJson: BlockSerializer = () => {
  return JSON.stringify({})
}

export const parseDivider: BlockParser = (input) => {
  if (/^-{3,}$/.test(input.trim())) {
    return { content: {} }
  }
  return null
}

export const dividerPlugin: PluginLifecycle = {
  manifest: {
    id: 'divider',
    name: 'Divider',
    version: '1.0.0',
    description: 'Horizontal rule / visual separator between blocks',
    author: 'Atlas Team',
    icon: 'Minus',
    category: 'layout',
  },
  capabilities: dividerCapabilities(),

  register(context) {
    context.api.registerBlockType({
      type: 'divider',
      renderer: DividerRenderer,
      validator: validateDivider,
      serializers: {
        markdown: serializeDividerMarkdown,
        html: serializeDividerHtml,
        json: serializeDividerJson,
      },
      parsers: { markdown: parseDivider },
      slashCommand: {
        title: 'Divider',
        description: 'Horizontal separator line',
        searchTerms: ['hr', 'separator', 'line', 'rule', 'horizontal'],
        group: 'layout',
        aliases: ['hr', '---'],
      },
      contextMenuActions: [
        { id: 'divider:duplicate', label: 'Duplicate', group: 'edit' },
        { id: 'divider:delete', label: 'Delete', group: 'edit' },
      ],
    })
  },
}
