import type { PluginLifecycle, BlockValidator, BlockSerializer, BlockParser } from '@/core/editor/plugin-sdk'
import { textBlockCapabilities } from '@/core/editor/plugin-sdk'
import { ToggleRenderer } from './toggle-renderer.tsx'

export const validateToggle: BlockValidator = (content) => {
  const errors: string[] = []
  if (typeof content.text !== 'string') {
    errors.push('Toggle block is missing "text" in content')
  }
  if (content.collapsed !== undefined && typeof content.collapsed !== 'boolean') {
    errors.push('Toggle block has invalid "collapsed" field')
  }
  return errors
}

export const serializeToggleMarkdown: BlockSerializer = (block) => {
  const text = (block.content.text as string) ?? ''
  return `<details><summary>${text}</summary></details>\n\n`
}

export const serializeToggleHtml: BlockSerializer = (block) => {
  const text = (block.content.text as string) ?? ''
  return `<details><summary>${text}</summary></details>\n`
}

export const serializeToggleJson: BlockSerializer = (block) => {
  return JSON.stringify({
    text: block.content.text,
    collapsed: block.content.collapsed ?? true,
  })
}

export const parseToggleMarkdown: BlockParser = (input) => {
  const match = input.match(/^<details><summary>(.*?)<\/summary><\/details>\s*$/)
  if (match) {
    return {
      content: {
        text: match[1].trim(),
        collapsed: true,
      },
    }
  }
  return null
}

export const parseToggleJson: BlockParser = (input) => {
  try {
    const data = JSON.parse(input)
    if (typeof data.text === 'string') {
      return {
        content: {
          text: data.text,
          collapsed: data.collapsed ?? true,
        },
      }
    }
  } catch {}
  return null
}

export const togglePlugin: PluginLifecycle = {
  manifest: {
    id: 'toggle',
    name: 'Toggle',
    version: '1.0.0',
    description: 'Collapsible block with nested content support',
    author: 'Atlas Team',
    icon: 'ChevronRight',
    category: 'text',
  },
  capabilities: textBlockCapabilities(),

  register(context) {
    context.api.registerBlockType({
      type: 'toggle',
      renderer: ToggleRenderer,
      validator: validateToggle,
      serializers: {
        markdown: serializeToggleMarkdown,
        html: serializeToggleHtml,
        json: serializeToggleJson,
      },
      parsers: {
        markdown: parseToggleMarkdown,
        json: parseToggleJson,
      },
      slashCommand: {
        title: 'Toggle',
        description: 'Collapsible block / dropdown',
        searchTerms: ['toggle', 'collapse', 'expand', 'details', 'spoiler'],
        group: 'text',
        aliases: ['collapse', 'details', 'spoiler'],
      },
      toolbarActions: [
        { id: 'toggle:collapse', label: 'Collapse', icon: 'ChevronUp' },
        { id: 'toggle:expand', label: 'Expand', icon: 'ChevronDown' },
      ],
      contextMenuActions: [
        { id: 'toggle:duplicate', label: 'Duplicate', group: 'edit' },
        { id: 'toggle:delete', label: 'Delete', group: 'edit' },
        { id: 'toggle:convert-to-paragraph', label: 'Convert to paragraph', group: 'convert' },
      ],
      placeholder: 'Toggle heading',
    })
  },
}
