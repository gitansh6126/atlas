import { EditorEngine } from '@/core/editor/editor-engine'
import type { EditorConfig } from '@/core/editor/editor-engine'
import { PluginRegistry } from '@/core/editor/plugin-registry'
import { ClipboardService } from '@/core/editor/clipboard-service'
import { rootPlugin } from '@/core/editor/plugins/root-plugin'
import { paragraphPlugin } from '@/core/editor/plugins/paragraph-plugin'
import { headingPlugin } from '@/core/editor/plugins/heading-plugin'
import { dividerPlugin } from '@/core/editor/plugins/divider-plugin'
import { InsertBlockCommand } from '@/core/editor/editor-commands'
import { commandBus } from '@/core/commands/command-bus'
import { pageRepository, blockRepository } from '@/core/repositories'
import type { Page } from '@/core/types/domain'
import type { Block, RenderNode, Selection } from '@/core/editor/types'
import { logger } from '@/core/storage/logger'
import type {
  PluginManager as PluginManagerType,
  PluginLifecycle,
  SlashCommandRegistryEntry,
  BlockTypeRegistration,
} from '@/core/editor/plugin-sdk'

interface UndoEntry {
  blockId: string;
  before: Block | null;
  after: Block | null;
  timestamp: number;
}

export class EditorController extends EventTarget {
  private engine: EditorEngine;
  private clipboard: ClipboardService;
  private page: Page | null = null;
  private autosaveTimer: ReturnType<typeof setTimeout> | null = null;
  private autosaveDebounceMs = 1500;
  private undoStack: UndoEntry[] = [];
  private redoStack: UndoEntry[] = [];
  private typingSessionBlockId: string | null = null;
  private typingSessionTimer: ReturnType<typeof setTimeout> | null = null;
  private typingGroupMs = 2000;
  private pluginManager: PluginManagerType | null = null;

  constructor() {
    super()
    const registry = new PluginRegistry()
    registry.register(rootPlugin)
    registry.register(paragraphPlugin)
    registry.register(headingPlugin)
    registry.register(dividerPlugin)
    this.engine = new EditorEngine(registry)
    this.clipboard = new ClipboardService()
  }

  getEngine(): EditorEngine {
    return this.engine
  }

  setPluginManager(manager: PluginManagerType): void {
    this.pluginManager = manager
    this.engine.getPluginRegistry()
  }

  getPluginManager(): PluginManagerType | null {
    return this.pluginManager
  }

  registerPlugin(plugin: PluginLifecycle): string | null {
    if (!this.pluginManager) return null
    return this.pluginManager.register(plugin)
  }

  setReadOnly(readOnly: boolean): void {
    this.engine.setReadOnly(readOnly)
  }

  isReadOnly(): boolean {
    return this.engine.isReadOnly()
  }

  getPluginSlashCommands(): SlashCommandRegistryEntry[] {
    if (!this.pluginManager) return []
    const enhancer = this.pluginManager.getEnhancer()
    return enhancer.getSlashCommands()
  }

  getBlockRegistration(type: string): BlockTypeRegistration | undefined {
    if (!this.pluginManager) return undefined
    const enhancer = this.pluginManager.getEnhancer()
    return enhancer.getRegistration(type)
  }

  async openDocument(pageId: string, workspaceId: string): Promise<void> {
    await this.closeDocument()

    const pageResult = await pageRepository.findById(pageId)
    if (!pageResult.success) {
      logger.error('Failed to load page:', pageResult.error)
      return
    }

    this.page = pageResult.data

    const blockResult = await blockRepository.findByPage(pageId)
    if (!blockResult.success) {
      logger.error('Failed to load blocks:', blockResult.error)
      return
    }

    const blocks = blockResult.data

    const config: EditorConfig = {
      pageId,
      workspaceId,
      rootBlockId: this.page.rootBlockId,
      initialBlocks: blocks,
    }

    this.engine.openDocument(config)
    this.undoStack = []
    this.redoStack = []

    this.dispatchEvent(new CustomEvent('document-change'))
  }

  async closeDocument(): Promise<void> {
    await this.flushAutosave()
    this.engine.closeDocument()
    this.page = null
    this.cancelAutosave()
    this.undoStack = []
    this.redoStack = []
    this.typingSessionBlockId = null
    if (this.typingSessionTimer) {
      clearTimeout(this.typingSessionTimer)
      this.typingSessionTimer = null
    }
    this.dispatchEvent(new CustomEvent('document-change'))
  }

  async saveDocument(): Promise<void> {
    const document = this.engine.getDocument()
    if (!document || !this.page) return

    if (!document.isDirty()) return

    document.setSaving(true)
    this.dispatchEvent(new CustomEvent('save-state-change'))

    const dirtyIds = Array.from(document.getDirtyBlocks())
    const pageUpdated = { ...this.page, updatedAt: Date.now(), version: this.page.version + 1 }

    let allSuccess = true

    for (const blockId of dirtyIds) {
      const block = document.getBlock(blockId)
      if (!block) continue
      const result = await blockRepository.upsert(block)
      if (!result.success) {
        allSuccess = false
        logger.error(`Failed to save block ${blockId}:`, result.error)
      }
    }

    const pageResult = await pageRepository.update(this.page.id, pageUpdated)
    if (!pageResult.success) {
      allSuccess = false
      logger.error('Failed to save page metadata:', pageResult.error)
    }

    if (allSuccess) {
      document.markAllClean()
      document.setLastSavedAt(Date.now())
      this.page = pageResult.success ? pageResult.data : this.page
    }

    document.setSaving(false)
    this.dispatchEvent(new CustomEvent('save-state-change'))
  }

  getRenderTree(): RenderNode[] {
    return this.engine.render()
  }

  isDocumentOpen(): boolean {
    return this.engine.isDocumentOpen()
  }

  getPage(): Page | null {
    return this.page
  }

  getDocumentId(): string | null {
    return this.page?.id ?? null
  }

  isDirty(): boolean {
    const document = this.engine.getDocument()
    return document ? document.isDirty() : false
  }

  isSaving(): boolean {
    const document = this.engine.getDocument()
    return document ? document.isSaving() : false
  }

  getLastSavedAt(): number {
    const document = this.engine.getDocument()
    return document ? document.getLastSavedAt() : 0
  }

  getSelectedBlockIds(): string[] {
    const sm = this.engine.getSelectionManager()
    return sm ? sm.getSelectedBlocks() : []
  }

  focusBlock(blockId: string, offset: number = 0): void {
    const sm = this.engine.getSelectionManager()
    if (!sm) return
    sm.setCursor(blockId, offset)
    this.dispatchEvent(new CustomEvent('selection-change'))
  }

  getSelection(): Selection | null {
    const sm = this.engine.getSelectionManager()
    return sm ? sm.getSelection() : null
  }

  setSelection(selection: Selection): void {
    const sm = this.engine.getSelectionManager()
    if (!sm) return
    sm.setSelection(selection)
    this.dispatchEvent(new CustomEvent('selection-change'))
  }

  async insertBlock(type: string, parentId?: string, position?: number, content?: Record<string, unknown>): Promise<Block | null> {
    const blockManager = this.engine.getBlockManager()
    const document = this.engine.getDocument()
    if (!blockManager || !document) return null

    const rootBlock = document.getRootBlock()
    const targetParent = parentId ?? rootBlock?.id
    if (!targetParent) return null

    const cmd = new InsertBlockCommand(this.engine)
    const result = await commandBus.execute(cmd, { type, parentId: targetParent, position, content })
    if (result.success) {
      this.dispatchEvent(new CustomEvent('content-change'))
      this.scheduleAutosave()
      return result.data.block
    }
    return null
  }

  insertParagraph(parentId?: string, text?: string, position?: number): Block | null {
    const blockManager = this.engine.getBlockManager()
    const document = this.engine.getDocument()
    if (!blockManager || !document) return null

    const rootBlock = document.getRootBlock()
    const targetParent = parentId ?? rootBlock?.id
    if (!targetParent) return null

    const block = blockManager.insertParagraph(targetParent, text, position)
    this.engine.getHistoryBridge().recordInsert(block.id)
    this.dispatchEvent(new CustomEvent('content-change'))
    this.scheduleAutosave()
    return block
  }

  insertHeading(parentId?: string, level?: number, text?: string, position?: number): Block | null {
    const blockManager = this.engine.getBlockManager()
    const document = this.engine.getDocument()
    if (!blockManager || !document) return null

    const rootBlock = document.getRootBlock()
    const targetParent = parentId ?? rootBlock?.id
    if (!targetParent) return null

    const block = blockManager.insertHeading(targetParent, level ?? 2, text, position)
    this.engine.getHistoryBridge().recordInsert(block.id)
    this.dispatchEvent(new CustomEvent('content-change'))
    this.scheduleAutosave()
    return block
  }

  insertDivider(parentId?: string, position?: number): Block | null {
    const blockManager = this.engine.getBlockManager()
    const document = this.engine.getDocument()
    if (!blockManager || !document) return null

    const rootBlock = document.getRootBlock()
    const targetParent = parentId ?? rootBlock?.id
    if (!targetParent) return null

    const block = blockManager.insertDivider(targetParent, position)
    this.engine.getHistoryBridge().recordInsert(block.id)
    this.dispatchEvent(new CustomEvent('content-change'))
    this.scheduleAutosave()
    return block
  }

  deleteBlock(blockId: string): boolean {
    const blockManager = this.engine.getBlockManager()
    if (!blockManager) return false

    const block = blockManager.getBlock(blockId)
    if (block) {
      this.engine.getHistoryBridge().recordDelete(blockId, block as unknown as Record<string, unknown>)
    }
    blockManager.deleteBlock(blockId)
    this.endTypingSession()
    this.dispatchEvent(new CustomEvent('content-change'))
    this.scheduleAutosave()
    return true
  }

  moveBlock(blockId: string, newParentId: string, position?: number): Block | null {
    const blockManager = this.engine.getBlockManager()
    if (!blockManager) return null

    const block = blockManager.getBlock(blockId)
    if (block) {
      this.engine.getHistoryBridge().recordMove(blockId, block as unknown as Record<string, unknown>)
    }

    const moved = blockManager.moveBlock(blockId, newParentId, position)
    if (moved) {
      this.dispatchEvent(new CustomEvent('content-change'))
      this.scheduleAutosave()
      return moved
    }
    return null
  }

  duplicateBlock(blockId: string): Block | null {
    const blockManager = this.engine.getBlockManager()
    if (!blockManager) return null

    const clone = blockManager.duplicateBlock(blockId)
    if (clone) {
      this.dispatchEvent(new CustomEvent('content-change'))
      this.scheduleAutosave()
      return clone
    }
    return null
  }

  updateBlockContent(blockId: string, content: Record<string, unknown>): void {
    const blockManager = this.engine.getBlockManager()
    const document = this.engine.getDocument()
    if (!blockManager || !document) return

    const block = blockManager.getBlock(blockId)
    if (!block) return

    if (this.typingSessionBlockId !== blockId) {
      this.endTypingSession()
      this.undoStack.push({
        blockId,
        before: { ...block, content: { ...block.content } } as Block,
        after: null,
        timestamp: Date.now(),
      })
      this.typingSessionBlockId = blockId
    }

    if (this.typingSessionTimer) {
      clearTimeout(this.typingSessionTimer)
    }
    this.typingSessionTimer = setTimeout(() => {
      this.endTypingSession()
    }, this.typingGroupMs)

    blockManager.updateContent(blockId, content)

    const updatedBlock = blockManager.getBlock(blockId)
    if (updatedBlock && this.undoStack.length > 0) {
      const lastEntry = this.undoStack[this.undoStack.length - 1]
      if (lastEntry.blockId === blockId) {
        lastEntry.after = { ...updatedBlock, content: { ...updatedBlock.content } } as Block
      }
    }

    this.redoStack = []
    this.dispatchEvent(new CustomEvent('content-change'))
    this.scheduleAutosave()
  }

  updateBlockMetadata(blockId: string, metadata: Record<string, unknown>): void {
    const blockManager = this.engine.getBlockManager()
    if (!blockManager) return
    blockManager.updateMetadata(blockId, metadata)
    this.dispatchEvent(new CustomEvent('content-change'))
    this.scheduleAutosave()
  }

  async undo(): Promise<boolean> {
    const document = this.engine.getDocument()
    const blockManager = this.engine.getBlockManager()
    if (!document || !blockManager) return false

    this.endTypingSession()

    if (this.undoStack.length === 0) return false

    const entry = this.undoStack.pop()!
    if (!entry.before) return false

    const currentBlock = blockManager.getBlock(entry.blockId)
    if (currentBlock && entry.after) {
      this.redoStack.push({
        blockId: entry.blockId,
        before: { ...currentBlock, content: { ...currentBlock.content } } as Block,
        after: entry.after,
        timestamp: Date.now(),
      })
    }

    blockManager.updateContent(entry.blockId, entry.before.content)
    this.dispatchEvent(new CustomEvent('content-change'))
    this.scheduleAutosave()
    return true
  }

  async redo(): Promise<boolean> {
    const blockManager = this.engine.getBlockManager()
    if (!blockManager) return false

    if (this.redoStack.length === 0) return false

    const entry = this.redoStack.pop()!
    if (!entry.after) return false

    const currentBlock = blockManager.getBlock(entry.blockId)
    if (currentBlock && entry.before) {
      this.undoStack.push({
        blockId: entry.blockId,
        before: { ...currentBlock, content: { ...currentBlock.content } } as Block,
        after: entry.after,
        timestamp: Date.now(),
      })
    }

    blockManager.updateContent(entry.blockId, entry.after.content)
    this.dispatchEvent(new CustomEvent('content-change'))
    this.scheduleAutosave()
    return true
  }

  getBlock(blockId: string): Block | undefined {
    const document = this.engine.getDocument()
    return document ? document.getBlock(blockId) : undefined
  }

  getBlockManager() {
    return this.engine.getBlockManager()
  }

  getSelectionManager() {
    return this.engine.getSelectionManager()
  }

  getHistoryBridge() {
    return this.engine.getHistoryBridge()
  }

  selectBlock(blockId: string): void {
    const sm = this.engine.getSelectionManager()
    if (!sm) return
    sm.selectBlock(blockId)
    this.dispatchEvent(new CustomEvent('selection-change'))
  }

  selectBlocks(blockIds: string[]): void {
    const sm = this.engine.getSelectionManager()
    if (!sm) return
    sm.selectBlocks(blockIds)
    this.dispatchEvent(new CustomEvent('selection-change'))
  }

  async insertBlockAfter(blockId: string, type: string = 'paragraph', content?: Record<string, unknown>): Promise<Block | null> {
    const idx = this.getBlockIndex(blockId)
    if (idx === -1) return null
    const block = this.getBlock(blockId)
    if (!block) return null
    const parentId = block.parentId
    if (!parentId) return null
    return this.insertBlock(type, parentId, idx + 1, content)
  }

  async insertBlockBefore(blockId: string, type: string = 'paragraph', content?: Record<string, unknown>): Promise<Block | null> {
    const idx = this.getBlockIndex(blockId)
    if (idx === -1) return null
    const block = this.getBlock(blockId)
    if (!block) return null
    const parentId = block.parentId
    if (!parentId) return null
    return this.insertBlock(type, parentId, idx, content)
  }

  async insertBlockAfterActive(type: string, content?: Record<string, unknown>): Promise<Block | null> {
    const sel = this.getSelection()
    const selectedIds = this.getSelectedBlockIds()

    let activeBlockId: string | null = null
    if (sel?.anchorBlockId) {
      activeBlockId = sel.anchorBlockId
    } else if (selectedIds.length > 0) {
      activeBlockId = selectedIds[selectedIds.length - 1]
    }

    let newBlock: Block | null
    if (activeBlockId) {
      newBlock = await this.insertBlockAfter(activeBlockId, type, content)
    } else {
      newBlock = await this.insertBlock(type, undefined, undefined, content)
    }

    if (newBlock) {
      this.focusBlock(newBlock.id, 0)
      requestAnimationFrame(() => {
        const el = document.getElementById(`block-${newBlock.id}`)
        if (el) {
          const rect = el.getBoundingClientRect()
          const vh = window.innerHeight
          if (rect.bottom < 0 || rect.top > vh) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' })
          }
        }
      })
    }

    return newBlock
  }

  getBlockType(blockId: string): string {
    const block = this.getBlock(blockId)
    return block?.type ?? 'paragraph'
  }

  convertBlock(blockId: string, newType: string): Block | null {
    const document = this.engine.getDocument()
    const blockManager = this.engine.getBlockManager()
    if (!document || !blockManager) return null
    const block = document.getBlock(blockId)
    if (!block || block.type === newType) return null

    const text = (block.content['text'] as string) ?? ''
    const parentId = block.parentId ?? document.getRootBlock()?.id
    if (!parentId) return null

    const idx = this.getBlockIndex(blockId)
    if (idx === -1) return null

    const newContent: Record<string, unknown> = { text }
    if (newType === 'heading') {
      newContent['level'] = 2
    }
    if (newType === 'callout') {
      newContent['variant'] = 'info'
    }
    if (newType === 'checklist') {
      newContent['checked'] = false
    }

    const newBlock = blockManager.insertBlock(newType, parentId, idx, newContent)
    if (!newBlock) return null

    blockManager.deleteBlock(blockId)
    this.dispatchEvent(new CustomEvent('content-change'))
    this.scheduleAutosave()
    return newBlock
  }

  convertToParagraph(blockId: string): Block | null {
    return this.convertBlock(blockId, 'paragraph')
  }

  getBlockIndex(blockId: string): number {
    const document = this.engine.getDocument()
    if (!document) return -1
    const block = document.getBlock(blockId)
    if (!block || !block.parentId) return -1
    const parent = document.getBlock(block.parentId)
    if (!parent || !parent.children) return -1
    return parent.children.indexOf(blockId)
  }

  getFirstEditableBlockId(): string | null {
    const document = this.engine.getDocument()
    if (!document) return null
    const rootBlock = document.getRootBlock()
    if (!rootBlock || !rootBlock.children) return null
    const editableTypes = new Set(['paragraph', 'heading'])
    for (const childId of rootBlock.children) {
      const child = document.getBlock(childId)
      if (child && editableTypes.has(child.type)) {
        return childId
      }
    }
    return null
  }

  focusFirstBlock(): void {
    const firstId = this.getFirstEditableBlockId()
    if (firstId) {
      this.focusBlock(firstId, 0)
    }
  }

  updatePageTitle(title: string): void {
    if (!this.page) return
    this.page = { ...this.page, title }
    this.dispatchEvent(new CustomEvent('page-title-change'))
    this.scheduleAutosave()
  }

  copyBlock(blockId: string): void {
    const document = this.engine.getDocument()
    if (!document) return
    const block = document.getBlock(blockId)
    if (!block) return
    const data = this.clipboard.copy([block])
    if (data.plainText) {
      navigator.clipboard.writeText(data.plainText).catch(() => {})
    }
  }

  cutBlock(blockId: string): void {
    this.copyBlock(blockId)
    this.deleteBlock(blockId)
  }

  pasteBlockAfter(blockId: string): void {
    const clipboard = this.clipboard.getBlocks()
    if (clipboard.length === 0) return
    const document = this.engine.getDocument()
    const blockManager = this.engine.getBlockManager()
    if (!document || !blockManager) return
    const block = document.getBlock(blockId)
    if (!block) return
    const parentId = block.parentId ?? document.getRootBlock()?.id
    if (!parentId) return
    const index = this.getBlockIndex(blockId)
    if (index === -1) return
    for (let i = 0; i < clipboard.length; i++) {
      blockManager.insertBlock(clipboard[i].type, parentId, index + 1 + i, clipboard[i].content)
    }
    this.dispatchEvent(new CustomEvent('content-change'))
    this.scheduleAutosave()
  }

  moveBlockToTarget(blockId: string, targetBlockId: string): void {
    const document = this.engine.getDocument()
    if (!document) return
    const block = document.getBlock(blockId)
    const targetBlock = document.getBlock(targetBlockId)
    if (!block || !targetBlock) return
    const parentId = targetBlock.parentId ?? document.getRootBlock()?.id
    if (!parentId) return
    const targetIndex = this.getBlockIndex(targetBlockId)
    if (targetIndex === -1) return
    this.moveBlock(blockId, parentId, targetIndex)
  }

  copy(): void {
    const sm = this.engine.getSelectionManager()
    if (!sm) return
    const selectedIds = sm.getSelectedBlocks()
    if (selectedIds.length === 0) return

    const document = this.engine.getDocument()
    if (!document) return

    const blocks = selectedIds
      .map((id) => document.getBlock(id))
      .filter((b): b is Block => b !== undefined && b.deletedAt === null)

    if (blocks.length === 0) return

    const data = this.clipboard.copy(blocks)
    const plainText = data.plainText
    if (plainText) {
      navigator.clipboard.writeText(plainText).catch(() => {})
    }
  }

  cut(): void {
    const sm = this.engine.getSelectionManager()
    if (!sm) return
    const selectedIds = sm.getSelectedBlocks()
    if (selectedIds.length === 0) return

    const document = this.engine.getDocument()
    if (!document) return

    const blocks = selectedIds
      .map((id) => document.getBlock(id))
      .filter((b): b is Block => b !== undefined && b.deletedAt === null)

    if (blocks.length === 0) return

    const data = this.clipboard.cut(blocks)
    const plainText = data.plainText
    if (plainText) {
      navigator.clipboard.writeText(plainText).catch(() => {})
    }

    for (const block of blocks) {
      this.deleteBlock(block.id)
    }
  }

  async paste(): Promise<void> {
    const blockManager = this.engine.getBlockManager()
    const document = this.engine.getDocument()
    if (!blockManager || !document) return

    const clipboardBlocks = this.clipboard.getBlocks()
    if (clipboardBlocks.length > 0) {
      const rootBlock = document.getRootBlock()
      if (!rootBlock) return
      const parentId = rootBlock.id

      for (const cb of clipboardBlocks) {
        blockManager.insertBlock(cb.type, parentId, undefined, cb.content)
      }
      this.dispatchEvent(new CustomEvent('content-change'))
      this.scheduleAutosave()
      return
    }

    const text = await navigator.clipboard.readText().catch(() => '')
    if (!text) return

    const rootBlock = document.getRootBlock()
    if (!rootBlock) return

    const lines = text.split('\n').filter((l) => l.length > 0)
    for (const line of lines) {
      blockManager.insertParagraph(rootBlock.id, line)
    }
    this.dispatchEvent(new CustomEvent('content-change'))
    this.scheduleAutosave()
  }

  private scheduleAutosave(): void {
    this.cancelAutosave()
    this.autosaveTimer = setTimeout(() => {
      this.saveDocument()
    }, this.autosaveDebounceMs)
  }

  private cancelAutosave(): void {
    if (this.autosaveTimer) {
      clearTimeout(this.autosaveTimer)
      this.autosaveTimer = null
    }
  }

  private async flushAutosave(): Promise<void> {
    this.cancelAutosave()
    if (this.isDirty()) {
      await this.saveDocument()
    }
  }

  private endTypingSession(): void {
    this.typingSessionBlockId = null
    if (this.typingSessionTimer) {
      clearTimeout(this.typingSessionTimer)
      this.typingSessionTimer = null
    }
  }
}
