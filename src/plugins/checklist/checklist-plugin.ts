import type { PluginLifecycle, BlockValidator, BlockSerializer, BlockParser } from '@/core/editor/plugin-sdk'
import { textBlockCapabilities } from '@/core/editor/plugin-sdk'
import { ChecklistRenderer } from './checklist-renderer.tsx'

export const validateChecklist: BlockValidator = (content) => {
  const errors: string[] = []
  if (typeof content.text !== 'string') {
    errors.push('Checklist block is missing "text" in content')
  }
  if (typeof content.checked !== 'boolean') {
    errors.push('Checklist block is missing or invalid "checked" field')
  }
  return errors
}

export const serializeChecklistMarkdown: BlockSerializer = (block) => {
  const checked = block.content.checked ? 'x' : ' '
  const text = (block.content.text as string) ?? ''
  return `- [${checked}] ${text}\n`
}

export const serializeChecklistHtml: BlockSerializer = (block) => {
  const checked = block.content.checked ? 'checked' : ''
  const text = (block.content.text as string) ?? ''
  return `<li class="checklist-item"><input type="checkbox" ${checked} /> ${text}</li>\n`
}

export const serializeChecklistJson: BlockSerializer = (block) => {
  return JSON.stringify({
    text: block.content.text,
    checked: block.content.checked ?? false,
  })
}

export const parseChecklist: BlockParser = (input) => {
  const match = input.match(/^[-*]\s+\[([ xX])\]\s+(.*)$/)
  if (match) {
    return {
      content: {
        checked: match[1].toLowerCase() === 'x',
        text: match[2].trim(),
      },
    }
  }
  return null
}

export const checklistPlugin: PluginLifecycle = {
  manifest: {
    id: 'checklist',
    name: 'Checklist',
    version: '1.0.0',
    description: 'Interactive checklist item with checkbox',
    author: 'Atlas Team',
    icon: 'CheckSquare',
    category: 'text',
  },
  capabilities: textBlockCapabilities(),

  register(context) {
    context.api.registerBlockType({
      type: 'checklist',
      renderer: ChecklistRenderer,
      validator: validateChecklist,
      serializers: {
        markdown: serializeChecklistMarkdown,
        html: serializeChecklistHtml,
        json: serializeChecklistJson,
      },
      parsers: { markdown: parseChecklist },
      slashCommand: {
        title: 'Checklist',
        description: 'Task or checklist item',
        searchTerms: ['task', 'todo', 'checkbox', 'check', 'list'],
        group: 'text',
        aliases: ['task', 'todo'],
      },
      toolbarActions: [
        { id: 'checklist:toggle', label: 'Toggle checked', icon: 'CheckSquare' },
      ],
      contextMenuActions: [
        { id: 'checklist:duplicate', label: 'Duplicate', group: 'edit' },
        { id: 'checklist:delete', label: 'Delete', group: 'edit' },
        { id: 'checklist:toggle', label: 'Toggle checked', group: 'edit' },
      ],
      placeholder: 'List item',
      settings: [
        {
          key: 'defaultChecked',
          label: 'Default checked state',
          type: 'boolean',
          default: false,
        },
      ],
    })
  },
}
