import type { PluginLifecycle, BlockValidator, BlockSerializer, BlockParser } from '@/core/editor/plugin-sdk'
import { createDefaultCapabilities } from '@/core/editor/plugin-sdk'
import { ImageRenderer } from './image-renderer.tsx'

export const validateImage: BlockValidator = (content) => {
  const errors: string[] = []
  if (!content.src || typeof content.src !== 'string') {
    errors.push('Image block is missing "src" in content')
  }
  return errors
}

export const serializeImageMarkdown: BlockSerializer = (block) => {
  const alt = (block.content.alt as string) ?? ''
  const src = (block.content.src as string) ?? ''
  const caption = (block.content.caption as string) ?? ''
  const cap = caption ? ` ${caption}` : ''
  return alt ? `![${alt}](${src})${cap}\n\n` : `![](${src})${cap}\n\n`
}

export const serializeImageHtml: BlockSerializer = (block) => {
  const alt = (block.content.alt as string) ?? ''
  const src = (block.content.src as string) ?? ''
  const caption = (block.content.caption as string) ?? ''
  const alignment = (block.content.alignment as string) ?? 'center'
  const width = block.content.width as number | undefined
  const style = `text-align: ${alignment}; max-width: 100%;` + (width ? ` width: ${width}px;` : '')
  return `<figure style="${style}"><img src="${src}" alt="${alt}" /><figcaption>${caption}</figcaption></figure>\n`
}

export const serializeImageJson: BlockSerializer = (block) => {
  return JSON.stringify({
    src: block.content.src,
    alt: block.content.alt ?? '',
    caption: block.content.caption ?? '',
    alignment: block.content.alignment ?? 'center',
    width: block.content.width,
  })
}

export const parseImageMarkdown: BlockParser = (input) => {
  const match = input.match(/!\[([^\]]*)\]\(([^)]+)\)(?:\s*(.+))?\s*$/)
  if (match) {
    return {
      content: {
        alt: match[1].trim(),
        src: match[2].trim(),
        caption: match[3]?.trim() || '',
        alignment: 'center',
      },
    }
  }
  return null
}

export const imagePlugin: PluginLifecycle = {
  manifest: {
    id: 'image',
    name: 'Image',
    version: '1.0.0',
    description: 'Image block with caption, alt text, alignment, and resize',
    author: 'Atlas Team',
    icon: 'Image',
    category: 'media',
  },
  capabilities: createDefaultCapabilities({
    rendering: true,
    serialization: true,
    parsing: true,
    validation: true,
    slashMenu: true,
    contextMenu: true,
    clipboard: true,
  }),

  register(context) {
    context.api.registerBlockType({
      type: 'image',
      renderer: ImageRenderer,
      validator: validateImage,
      serializers: {
        markdown: serializeImageMarkdown,
        html: serializeImageHtml,
        json: serializeImageJson,
      },
      parsers: { markdown: parseImageMarkdown },
      slashCommand: {
        title: 'Image',
        description: 'Insert an image with caption and alignment',
        searchTerms: ['img', 'picture', 'photo', 'media', 'upload'],
        group: 'media',
        aliases: ['img', 'picture'],
      },
      contextMenuActions: [
        { id: 'image:align-left', label: 'Align Left', group: 'align' },
        { id: 'image:align-center', label: 'Align Center', group: 'align' },
        { id: 'image:align-right', label: 'Align Right', group: 'align' },
        { id: 'image:toggle-caption', label: 'Toggle Caption', group: 'edit' },
        { id: 'image:delete', label: 'Delete', group: 'edit' },
      ],
    })
  },
}
