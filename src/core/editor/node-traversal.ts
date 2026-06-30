import type { Block } from './types'

export class NodeTraversal {
  private blocks: Map<string, Block>;

  constructor(blocks: Map<string, Block>) {
    this.blocks = blocks
  }

  getBlock(id: string): Block | undefined {
    return this.blocks.get(id)
  }

  getParent(block: Block): Block | undefined {
    if (!block.parentId) return undefined
    return this.blocks.get(block.parentId)
  }

  getChildren(block: Block): Block[] {
    return block.children
      .map((id) => this.blocks.get(id))
      .filter((b): b is Block => b !== undefined && b.deletedAt === null)
      .sort((a, b) => a.position - b.position)
  }

  getDescendants(block: Block): Block[] {
    const result: Block[] = []
    const queue = [...block.children]

    while (queue.length > 0) {
      const childId = queue.shift()
      if (!childId) continue
      const child = this.blocks.get(childId)
      if (!child || child.deletedAt !== null) continue
      result.push(child)
      queue.push(...child.children)
    }

    return result
  }

  getAncestors(block: Block): Block[] {
    const result: Block[] = []
    let current = block.parentId ? this.blocks.get(block.parentId) : undefined

    while (current) {
      result.push(current)
      current = current.parentId ? this.blocks.get(current.parentId) : undefined
    }

    return result
  }

  getPreviousSibling(block: Block): Block | undefined {
    if (!block.parentId) return undefined
    const parent = this.blocks.get(block.parentId)
    if (!parent) return undefined

    const siblings = parent.children.filter((id) => {
      const b = this.blocks.get(id)
      return b && b.deletedAt === null
    })

    const index = siblings.indexOf(block.id)
    if (index <= 0) return undefined

    const prevId = siblings[index - 1]
    return prevId ? this.blocks.get(prevId) : undefined
  }

  getNextSibling(block: Block): Block | undefined {
    if (!block.parentId) return undefined
    const parent = this.blocks.get(block.parentId)
    if (!parent) return undefined

    const siblings = parent.children.filter((id) => {
      const b = this.blocks.get(id)
      return b && b.deletedAt === null
    })

    const index = siblings.indexOf(block.id)
    if (index === -1 || index >= siblings.length - 1) return undefined

    const nextId = siblings[index + 1]
    return nextId ? this.blocks.get(nextId) : undefined
  }

  getNextBlock(block: Block): Block | undefined {
    const children = this.getChildren(block)
    if (children.length > 0) return children[0]

    const nextSibling = this.getNextSibling(block)
    if (nextSibling) return nextSibling

    let current = block
    while (current.parentId) {
      const parent = this.blocks.get(current.parentId)
      if (!parent) return undefined
      const parentNextSibling = this.getNextSibling(parent)
      if (parentNextSibling) return parentNextSibling
      current = parent
    }

    return undefined
  }

  getPreviousBlock(block: Block): Block | undefined {
    const prevSibling = this.getPreviousSibling(block)
    if (!prevSibling) {
      if (block.parentId) {
        return this.blocks.get(block.parentId)
      }
      return undefined
    }

    const children = this.getChildren(prevSibling)
    if (children.length === 0) return prevSibling

    let lastChild = children[children.length - 1]
    let lastChildChildren = this.getChildren(lastChild)
    while (lastChildChildren.length > 0) {
      lastChild = lastChildChildren[lastChildChildren.length - 1]
      lastChildChildren = this.getChildren(lastChild)
    }

    return lastChild
  }

  getRootBlock(): Block | undefined {
    for (const block of this.blocks.values()) {
      if (block.type === 'root' && block.deletedAt === null) {
        return block
      }
    }
    return undefined
  }

  countDescendants(block: Block): number {
    let count = 0
    const queue = [...block.children]
    while (queue.length > 0) {
      const id = queue.shift()
      if (!id) continue
      const child = this.blocks.get(id)
      if (!child || child.deletedAt !== null) continue
      count++
      queue.push(...child.children)
    }
    return count
  }

  validateTree(): string[] {
    const errors: string[] = []
    const rootBlocks = new Set<string>()

    for (const [id, block] of this.blocks) {
      if (block.deletedAt !== null) continue

      if (block.type === 'root') {
        if (rootBlocks.size > 0) {
          errors.push(`Multiple root blocks found: ${id}`)
        }
        rootBlocks.add(id)
      }

      if (block.parentId && !this.blocks.has(block.parentId)) {
        errors.push(`Block ${id} has non-existent parent ${block.parentId}`)
      }

      for (const childId of block.children) {
        if (!this.blocks.has(childId)) {
          errors.push(`Block ${id} has non-existent child ${childId}`)
        }
      }
    }

    return errors
  }
}
