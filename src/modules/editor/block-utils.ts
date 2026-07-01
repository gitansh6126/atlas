export function getCaretPosition(element: HTMLElement): number {
  const sel = window.getSelection()
  if (!sel || !sel.rangeCount) return 0
  const range = sel.getRangeAt(0)
  const preRange = document.createRange()
  preRange.selectNodeContents(element)
  preRange.setEnd(range.startContainer, range.startOffset)
  return preRange.toString().length
}

export function setCaretPosition(element: HTMLElement, offset: number): void {
  const sel = window.getSelection()
  if (!sel) return
  const targetOffset = Math.min(offset, element.textContent?.length ?? 0)
  const textNode = findTextNode(element, targetOffset)
  if (textNode) {
    const range = document.createRange()
    range.setStart(textNode.node, Math.min(textNode.offset, textNode.node.textContent?.length ?? 0))
    range.collapse(true)
    sel.removeAllRanges()
    sel.addRange(range)
  }
}

interface TextNodeResult {
  node: Text
  offset: number
}

function findTextNode(element: HTMLElement, targetOffset: number): TextNodeResult | null {
  let accumulated = 0
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null)
  let node: Text | null = walker.firstChild() as Text | null
  while (node) {
    const len = node.textContent?.length ?? 0
    if (accumulated + len >= targetOffset) {
      return { node, offset: targetOffset - accumulated }
    }
    accumulated += len
    node = walker.nextNode() as Text | null
  }
  return null
}

export function isElementEmpty(element: HTMLElement): boolean {
  return !element.textContent || element.textContent.trim().length === 0
}

export function getBlockDomId(blockId: string): string {
  return `block-${blockId}`
}

export function getBlockElement(blockId: string): HTMLElement | null {
  return document.getElementById(getBlockDomId(blockId))
}

export function isAtBlockStart(element: HTMLElement): boolean {
  return getCaretPosition(element) === 0
}

export function isAtBlockEnd(element: HTMLElement): boolean {
  const pos = getCaretPosition(element)
  const len = element.textContent?.length ?? 0
  return pos >= len
}

export function selectBlockContent(blockId: string): void {
  const el = getBlockElement(blockId)
  if (!el) return
  const range = document.createRange()
  range.selectNodeContents(el)
  const sel = window.getSelection()
  if (sel) {
    sel.removeAllRanges()
    sel.addRange(range)
  }
}

export function isOnlySlash(text: string): boolean {
  return text.trim() === '/' || text === '/'
}

export function getSlashMenuPosition(blockEl: HTMLElement): { top: number; left: number } {
  const rect = blockEl.getBoundingClientRect()
  return {
    top: rect.bottom + window.scrollY + 4,
    left: rect.left + window.scrollX,
  }
}

// ── Markdown shortcut patterns ──

export interface MarkdownPattern {
  regex: RegExp;
  type: string;
  extractContent: (match: RegExpExecArray) => Record<string, unknown>;
}

export const markdownPatterns: MarkdownPattern[] = [
  {
    regex: /^(#{1,6})\s+(.+)$/,
    type: 'heading',
    extractContent: (match) => ({ level: Math.min(match[1].length, 6), text: match[2] }),
  },
  {
    regex: /^>(?:\s+)?(.+)$/,
    type: 'quote',
    extractContent: (match) => ({ text: match[1] }),
  },
  {
    regex: /^[-*]\s*\[([ xX]?)\]\s*(.*)$/,
    type: 'checklist',
    extractContent: (match) => ({ checked: match[1].toLowerCase() === 'x', text: match[2] }),
  },
  {
    regex: /^[-*]\s+(.+)$/,
    type: 'bullet_list_item',
    extractContent: (match) => ({ text: match[1], indent: 0 }),
  },
  {
    regex: /^\d+\.\s+(.+)$/,
    type: 'ordered_list_item',
    extractContent: (match) => ({ text: match[1], indent: 0, number: 1 }),
  },
  {
    regex: /^---\s*$/,
    type: 'divider',
    extractContent: () => ({}),
  },
  {
    regex: /^(>|&gt;)\s*(.*)$/,
    type: 'callout',
    extractContent: (match) => ({ text: match[2] || '', variant: 'info' }),
  },
  {
    regex: /^#([a-fA-F0-9]{6})\s*(.+)$/,
    type: 'callout',
    extractContent: (match) => ({ text: match[2], variant: 'tip' }),
  },
]

export function matchMarkdownShortcut(text: string): { type: string; content: Record<string, unknown> } | null {
  for (const pattern of markdownPatterns) {
    const match = pattern.regex.exec(text)
    if (match) {
      return { type: pattern.type, content: pattern.extractContent(match) }
    }
  }
  return null
}
