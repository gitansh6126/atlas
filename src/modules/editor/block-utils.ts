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
