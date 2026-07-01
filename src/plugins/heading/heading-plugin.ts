import type { PluginLifecycle, BlockValidator, BlockSerializer, BlockParser, SlashCommandEntry } from '@/core/editor/plugin-sdk'
import { textBlockCapabilities } from '@/core/editor/plugin-sdk'
import { HeadingRenderer } from './heading-renderer.tsx'

export const validateHeading: BlockValidator = (content) => {
  const errors: string[] = []
  const level = content.level
  if (typeof level !== 'number' || level < 1 || level > 6) {
    errors.push(`Heading block has invalid level: ${String(level)}`)
  }
  if (typeof content.text !== 'string') {
    errors.push('Heading block is missing "text" in content')
  }
  return errors
}

export const serializeHeadingMarkdown: BlockSerializer = (block) => {
  const level = (block.content.level as number) ?? 1
  const text = (block.content.text as string) ?? ''
  const prefix = '#'.repeat(Math.min(Math.max(level, 1), 6))
  return `${prefix} ${text}\n\n`
}

export const serializeHeadingHtml: BlockSerializer = (block) => {
  const level = Math.min(Math.max((block.content.level as number) ?? 1, 1), 6)
  const text = (block.content.text as string) ?? ''
  return `<h${level}>${text}</h${level}>\n`
}

export const serializeHeadingJson: BlockSerializer = (block) => {
  return JSON.stringify({
    text: block.content.text,
    level: block.content.level ?? 1,
  })
}

export const parseHeading: BlockParser = (input) => {
  const match = input.match(/^(#{1,6})\s+(.*)$/)
  if (match) {
    return {
      content: {
        level: match[1].length,
        text: match[2].trim(),
      },
    }
  }
  return null
}

export const headingPlugin: PluginLifecycle = {
  manifest: {
    id: 'heading',
    name: 'Heading',
    version: '1.0.0',
    description: 'Section heading with configurable level (H1-H6)',
    author: 'Atlas Team',
    icon: 'Heading',
    category: 'text',
    commands: [
      { id: 'heading:level-up', name: 'Increase heading level' },
      { id: 'heading:level-down', name: 'Decrease heading level' },
    ],
    settings: [
      {
        key: 'defaultLevel',
        label: 'Default heading level',
        type: 'select',
        default: 2,
        options: [
          { label: 'Heading 1', value: '1' },
          { label: 'Heading 2', value: '2' },
          { label: 'Heading 3', value: '3' },
          { label: 'Heading 4', value: '4' },
          { label: 'Heading 5', value: '5' },
          { label: 'Heading 6', value: '6' },
        ],
      },
    ],
  },
  capabilities: textBlockCapabilities(),

  register(context) {
    context.api.registerBlockType({
      type: 'heading',
      renderer: HeadingRenderer,
      validator: validateHeading,
      serializers: {
        markdown: serializeHeadingMarkdown,
        html: serializeHeadingHtml,
        json: serializeHeadingJson,
      },
      parsers: { markdown: parseHeading },
      slashCommand: {
        title: 'Heading',
        description: 'Section heading (level 1-6)',
        searchTerms: ['h1', 'h2', 'h3', 'header', 'title', 'heading'],
        group: 'text',
        aliases: ['h', 'header'],
      },
      toolbarActions: [
        { id: 'heading:level', label: 'H', icon: 'Heading' },
      ],
      contextMenuActions: [
        { id: 'heading:duplicate', label: 'Duplicate', group: 'edit' },
        { id: 'heading:delete', label: 'Delete', group: 'edit' },
        { id: 'heading:convert-to-paragraph', label: 'Convert to paragraph', group: 'convert' },
      ],
      placeholder: 'Heading',
    })

    for (let level = 1; level <= 3; level++) {
      const cmd: SlashCommandEntry = {
        title: `Heading ${level}`,
        description: `Level ${level} section heading`,
        searchTerms: [`h${level}`, `heading${level}`],
        group: 'text',
        aliases: [`h${level}`],
      }
      context.api.registerSlashCommand('heading', cmd)
    }
  },
}
