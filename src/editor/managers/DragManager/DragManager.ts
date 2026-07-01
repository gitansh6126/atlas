import type { EditorController } from '@/modules/editor/editor-controller'

export interface DragState {
  sourceBlockId: string | null
  targetBlockId: string | null
  position: 'before' | 'after'
  isDragging: boolean
}

type Listener = (state: DragState) => void

export class DragManager {
  private controller: EditorController
  private state: DragState = {
    sourceBlockId: null,
    targetBlockId: null,
    position: 'after',
    isDragging: false,
  }
  private listeners: Set<Listener> = new Set()

  constructor(controller: EditorController) {
    this.controller = controller
  }

  getState(): DragState {
    return this.state
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  startDrag(blockId: string): void {
    this.state = {
      sourceBlockId: blockId,
      targetBlockId: null,
      position: 'after',
      isDragging: true,
    }
    this.notify()
  }

  updateDrag(targetBlockId: string, cursorY: number, elementTop: number, elementHeight: number): void {
    if (!this.state.isDragging) return
    const midY = elementTop + elementHeight / 2
    this.state = {
      ...this.state,
      targetBlockId,
      position: cursorY < midY ? 'before' : 'after',
    }
    this.notify()
  }

  endDrag(moved: boolean = false): void {
    const { sourceBlockId, targetBlockId, position } = this.state
    if (moved && sourceBlockId && targetBlockId && sourceBlockId !== targetBlockId) {
      const target = this.controller.getBlock(targetBlockId)
      if (target) {
        const parentId = target.parentId
        if (parentId) {
          const targetIndex = this.controller.getBlockIndex(targetBlockId)
          if (targetIndex !== -1) {
            const dropIndex = position === 'after' ? targetIndex + 1 : targetIndex
            this.controller.moveBlock(sourceBlockId, parentId, dropIndex)
          }
        }
      }
    }

    this.state = {
      sourceBlockId: null,
      targetBlockId: null,
      position: 'after',
      isDragging: false,
    }
    this.notify()
  }

  cancelDrag(): void {
    this.state = {
      sourceBlockId: null,
      targetBlockId: null,
      position: 'after',
      isDragging: false,
    }
    this.notify()
  }

  private notify(): void {
    for (const listener of this.listeners) {
      listener(this.state)
    }
  }
}
