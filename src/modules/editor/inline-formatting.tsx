import * as React from 'react'
import type { InlineFormat } from '@/core/editor/types'

/**
 * Apply inline formatting to raw text based on markdown-style syntax.
 * Supports: **bold**, __italic__, _underline_, `code`, [link](url)
 */
export function applyInlineFormatting(text: string): { formatted: boolean; text: string; formats: InlineFormat[] } {
  const formats: InlineFormat[] = []
  let formattedText = text
  let changed = false

  // Track accumulated offset changes so we can report start/end in the FINAL text
  let offset = 0

  const addFormat = (start: number, end: number, type: InlineFormat['type'], value: string | null = null) => {
    formats.push({ start, end, type, value })
  }

  formattedText = formattedText.replace(/\*\*(.+?)\*\*/g, (match, p1, index) => {
    addFormat(index - offset, index - offset + p1.length, 'bold')
    offset += match.length - p1.length
    changed = true
    return p1
  })

  formattedText = formattedText.replace(/__(.+?)__/g, (match, p1, index) => {
    addFormat(index - offset, index - offset + p1.length, 'italic')
    offset += match.length - p1.length
    changed = true
    return p1
  })

  formattedText = formattedText.replace(/_(.+?)_/g, (match, p1, index) => {
    addFormat(index - offset, index - offset + p1.length, 'underline')
    offset += match.length - p1.length
    changed = true
    return p1
  })

  formattedText = formattedText.replace(/`(.+?)`/g, (match, p1, index) => {
    addFormat(index - offset, index - offset + p1.length, 'code')
    offset += match.length - p1.length
    changed = true
    return p1
  })

  formattedText = formattedText.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, p1, p2, index) => {
    addFormat(index - offset, index - offset + p1.length, 'link', p2)
    offset += match.length - p1.length
    changed = true
    return p1
  })

  return { formatted: changed, text: formattedText, formats }
}

/**
 * Render text segments with inline formats as React elements.
 */
export function renderInlineText(text: string, formats?: InlineFormat[] | null): React.ReactNode[] {
  if (!formats || formats.length === 0) {
    return [<React.Fragment key="text">{text}</React.Fragment>]
  }

  // Sort formats by start, then by end (descending) to handle nested formats
  const sorted = [...formats].sort((a, b) => {
    if (a.start !== b.start) return a.start - b.start
    return b.end - a.end
  })

  // Flatten: collect all format boundaries
  const boundaries = new Set<number>([0, text.length])
  for (const f of sorted) {
    if (f.start < text.length) boundaries.add(f.start)
    if (f.end <= text.length) boundaries.add(f.end)
  }

  const sortedBoundaries = Array.from(boundaries).sort((a, b) => a - b)
  const segments: { start: number; end: number; text: string; formats: InlineFormat[] }[] = []

  for (let i = 0; i < sortedBoundaries.length - 1; i++) {
    const start = sortedBoundaries[i]
    const end = sortedBoundaries[i + 1]
    const segmentText = text.slice(start, end)
    const activeFormats = sorted.filter((f) => f.start <= start && f.end >= end)
    segments.push({ start, end, text: segmentText, formats: activeFormats })
  }

  // Render each segment with its active formats
  return segments.map((seg, idx) => {
    let children: React.ReactNode = seg.text
    for (const fmt of seg.formats) {
      switch (fmt.type) {
        case 'bold':
          children = React.createElement('strong', { key: `${idx}-bold` }, children)
          break
        case 'italic':
          children = React.createElement('em', { key: `${idx}-italic` }, children)
          break
        case 'underline':
          children = React.createElement('u', { key: `${idx}-underline` }, children)
          break
        case 'strikethrough':
          children = React.createElement('s', { key: `${idx}-strikethrough` }, children)
          break
        case 'code':
          children = React.createElement('code', {
            key: `${idx}-code`,
            className: 'rounded bg-muted px-1 py-0.5 font-mono text-sm',
          }, children)
          break
        case 'link':
          children = React.createElement('a', {
            key: `${idx}-link`,
            href: fmt.value ?? '#',
            target: '_blank',
            rel: 'noopener noreferrer',
            className: 'text-primary underline hover:text-primary/80',
          }, children)
          break
        case 'highlight':
          children = React.createElement('mark', {
            key: `${idx}-highlight`,
            className: 'bg-yellow-200 dark:bg-yellow-800',
          }, children)
          break
        case 'color':
          children = React.createElement('span', {
            key: `${idx}-color`,
            style: { color: fmt.value ?? 'inherit' },
          }, children)
          break
        default:
          break
      }
    }
    return React.createElement(React.Fragment, { key: idx }, children)
  })
}
