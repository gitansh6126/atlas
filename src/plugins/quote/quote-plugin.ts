import type { PluginLifecycle, BlockValidator, BlockSerializer, BlockParser } from '@/core/editor/plugin-sdk'
import { textBlockCapabilities } from '@/core/editor/plugin-sdk'
import { QuoteRenderer } from './quote-renderer.tsx'

export const validateQuote: BlockValidator = (content) => {
  const errors: string[] = []
  if (typeof content.text !== 'string') {
    errors.push('Quote block is missing "text" in content')
  }
  return errors
}

export const serializeQuoteMarkdown: BlockSerializer = (block) => {
  const text = (block.content.text as string) ?? ''
  return `> ${text}\n\n`
}

export const serializeQuoteHtml: BlockSerializer = (block) => {
  const text = (block.content.text as string) ?? ''
  return `<blockquote><p>${text}</p></blockquote>\n`
}

export const serializeQuoteJson: BlockSerializer = (block) => {
  return JSON.stringify({ text: block.content.text })
}

export const parseQuote: BlockParser = (input) => {
  const match = input.match(/^>\s+(.*)$/)
  if (match) {
    return {
      content: {
        text: match[1].trim(),
      },
    }
  }
  return null
}

export const quotePlugin: PluginLifecycle = {
  manifest: {
    id: 'quote',
    name: 'Quote',
    version: '1.0.0',
    description: 'Block quote for citations and callouts',
    author: 'Atlas Team',
    icon: 'Quote',
    category: 'text',
  },
  capabilities: textBlockCapabilities(),

  register(context) {
    context.api.registerBlockType({
      type: 'quote',
      renderer: QuoteRenderer,
      validator: validateQuote,
      serializers: {
        markdown: serializeQuoteMarkdown,
        html: serializeQuoteHtml,
        json: serializeQuoteJson,
      },
      parsers: { markdown: parseQuote },
      slashCommand: {
        title: 'Quote',
        description: 'Block quote / citation',
        searchTerms: ['blockquote', 'cite', 'citation', 'quote'],
        group: 'text',
        aliases: ['blockquote', 'cite'],
      },
      toolbarActions: [
        { id: 'quote:convert-to-paragraph', label: 'Convert to paragraph', icon: 'Type' },
      ],
      contextMenuActions: [
        { id: 'quote:duplicate', label: 'Duplicate', group: 'edit' },
        { id: 'quote:delete', label: 'Delete', group: 'edit' },
        { id: 'quote:convert-to-paragraph', label: 'Convert to paragraph', group: 'convert' },
      ],
      placeholder: 'Quote',
    })
  },
}
