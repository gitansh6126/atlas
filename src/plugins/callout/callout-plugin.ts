import type { PluginLifecycle, BlockValidator, BlockSerializer, BlockParser, SlashCommandEntry } from '@/core/editor/plugin-sdk'
import { textBlockCapabilities } from '@/core/editor/plugin-sdk'
import { CalloutRenderer } from './callout-renderer.tsx'

export const validateCallout: BlockValidator = (content) => {
  const errors: string[] = []
  if (typeof content.text !== 'string') {
    errors.push('Callout block is missing "text" in content')
  }
  if (content.variant && !['info', 'warning', 'success', 'danger', 'tip'].includes(content.variant as string)) {
    errors.push(`Callout has invalid variant: ${String(content.variant)}`)
  }
  return errors
}

export const serializeCalloutMarkdown: BlockSerializer = (block) => {
  const text = (block.content.text as string) ?? ''
  const variant = (block.content.variant as string) ?? 'info'
  return `> **${variant}:** ${text}\n\n`
}

export const serializeCalloutHtml: BlockSerializer = (block) => {
  const text = (block.content.text as string) ?? ''
  const variant = (block.content.variant as string) ?? 'info'
  return `<div class="callout callout-${variant}"><p>${text}</p></div>\n`
}

export const serializeCalloutJson: BlockSerializer = (block) => {
  return JSON.stringify({
    text: block.content.text,
    variant: block.content.variant ?? 'info',
  })
}

export const parseCalloutMarkdown: BlockParser = (input) => {
  const match = input.match(/^>\s+\*\*(info|warning|success|danger|tip):\*\*\s+(.*)$/i)
  if (match) {
    return {
      content: {
        variant: match[1].toLowerCase(),
        text: match[2].trim(),
      },
    }
  }
  return null
}

export const parseCalloutJson: BlockParser = (input) => {
  try {
    const data = JSON.parse(input)
    if (typeof data.text === 'string') {
      return {
        content: {
          text: data.text,
          variant: data.variant ?? 'info',
        },
      }
    }
  } catch {}
  return null
}

const variantMeta = [
  { variant: 'info', title: 'Info Callout', searchTerms: ['info', 'note', 'information'], aliases: ['info', 'note'] },
  { variant: 'warning', title: 'Warning Callout', searchTerms: ['warn', 'warning', 'caution'], aliases: ['warn', 'caution'] },
  { variant: 'success', title: 'Success Callout', searchTerms: ['success', 'done', 'complete'], aliases: ['success', 'done'] },
  { variant: 'danger', title: 'Danger Callout', searchTerms: ['danger', 'error', 'alert'], aliases: ['danger', 'error'] },
  { variant: 'tip', title: 'Tip Callout', searchTerms: ['tip', 'hint', 'advice'], aliases: ['tip', 'hint'] },
]

export const calloutPlugin: PluginLifecycle = {
  manifest: {
    id: 'callout',
    name: 'Callout',
    version: '1.0.0',
    description: 'Highlighted information boxes with icons and color variants',
    author: 'Atlas Team',
    icon: 'Info',
    category: 'text',
  },
  capabilities: textBlockCapabilities(),

  register(context) {
    context.api.registerBlockType({
      type: 'callout',
      renderer: CalloutRenderer,
      validator: validateCallout,
      serializers: {
        markdown: serializeCalloutMarkdown,
        html: serializeCalloutHtml,
        json: serializeCalloutJson,
      },
      parsers: {
        markdown: parseCalloutMarkdown,
        json: parseCalloutJson,
      },
      slashCommand: {
        title: 'Callout',
        description: 'Highlighted info with icon and color',
        searchTerms: ['callout', 'info', 'note', 'highlight', 'alert'],
        group: 'text',
        aliases: ['info', 'note', 'alert'],
      },
      toolbarActions: [
        { id: 'callout:variant', label: 'Change variant', icon: 'Palette' },
      ],
      contextMenuActions: [
        { id: 'callout:duplicate', label: 'Duplicate', group: 'edit' },
        { id: 'callout:delete', label: 'Delete', group: 'edit' },
        { id: 'callout:convert-to-paragraph', label: 'Convert to paragraph', group: 'convert' },
      ],
      placeholder: 'Type / for commands...',
      settings: [
        {
          key: 'defaultVariant',
          label: 'Default callout variant',
          type: 'select',
          default: 'info',
          options: [
            { label: 'Info', value: 'info' },
            { label: 'Warning', value: 'warning' },
            { label: 'Success', value: 'success' },
            { label: 'Danger', value: 'danger' },
            { label: 'Tip', value: 'tip' },
          ],
        },
      ],
    })

    for (const meta of variantMeta) {
      const cmd: SlashCommandEntry = {
        title: meta.title,
        description: `${meta.variant} callout box`,
        searchTerms: meta.searchTerms,
        group: 'text',
        aliases: meta.aliases,
      }
      context.api.registerSlashCommand('callout', cmd)
    }
  },
}
