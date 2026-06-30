import type { DocumentModel } from './document-model'
import type { Block } from './types'

export interface ValidationError {
  blockId: string;
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

export class DocumentValidator {
  validate(document: DocumentModel): string[] {
    const errors: string[] = []
    const blocks = document.getAllBlocks()

    let rootCount = 0

    for (const [, block] of blocks) {
      if (block.deletedAt !== null) continue

      if (block.type === 'root') {
        rootCount++
      }

      errors.push(...this.validateBlock(block))
    }

    if (rootCount === 0) {
      errors.push('Document has no root block')
    }

    if (rootCount > 1) {
      errors.push(`Document has ${rootCount} root blocks (expected 1)`)
    }

    errors.push(...this.validateParentReferences(blocks))
    errors.push(...this.validateCircularReferences(blocks))
    errors.push(...this.validateChildrenExist(blocks))
    errors.push(...this.validateUniqueIds(blocks))

    return errors
  }

  validateBlock(block: Block): string[] {
    const errors: string[] = []

    if (!block.id) {
      errors.push('Block is missing id')
    }

    if (!block.type) {
      errors.push(`Block ${block.id} is missing type`)
    }

    if (block.version < 1) {
      errors.push(`Block ${block.id} has invalid version: ${block.version}`)
    }

    if (!block.content || typeof block.content !== 'object') {
      errors.push(`Block ${block.id} has invalid content`)
    }

    if (!Array.isArray(block.children)) {
      errors.push(`Block ${block.id} has invalid children array`)
    }

    return errors
  }

  validateParentReferences(blocks: Map<string, Block>): string[] {
    const errors: string[] = []

    for (const [id, block] of blocks) {
      if (block.deletedAt !== null) continue
      if (block.parentId && !blocks.has(block.parentId)) {
        errors.push(`Block ${id} references non-existent parent ${block.parentId}`)
      }
    }

    return errors
  }

  validateChildrenExist(blocks: Map<string, Block>): string[] {
    const errors: string[] = []

    for (const [id, block] of blocks) {
      if (block.deletedAt !== null) continue
      for (const childId of block.children) {
        if (!blocks.has(childId)) {
          errors.push(`Block ${id} has non-existent child ${childId}`)
        }
      }
    }

    return errors
  }

  validateCircularReferences(blocks: Map<string, Block>): string[] {
    const errors: string[] = []

    for (const [id, _block] of blocks) {
      if (this.hasCircularReference(id, blocks)) {
        errors.push(`Block ${id} is part of a circular reference`)
      }
    }

    return errors
  }

  private hasCircularReference(blockId: string, blocks: Map<string, Block>, visited?: Set<string>): boolean {
    const visitedSet = visited ?? new Set<string>()

    if (visitedSet.has(blockId)) {
      return true
    }

    visitedSet.add(blockId)
    const block = blocks.get(blockId)

    if (block?.parentId) {
      return this.hasCircularReference(block.parentId, blocks, visitedSet)
    }

    return false
  }

  validateUniqueIds(blocks: Map<string, Block>): string[] {
    const errors: string[] = []
    const seen = new Set<string>()

    for (const [id, block] of blocks) {
      if (block.deletedAt !== null) continue
      if (seen.has(id)) {
        errors.push(`Duplicate block id: ${id}`)
      }
      seen.add(id)
    }

    return errors
  }
}
