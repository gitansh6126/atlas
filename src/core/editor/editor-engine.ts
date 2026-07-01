import type { RenderNode, EditorMode, Block } from './types'
import { DocumentModel } from './document-model'
import { EditorState } from './editor-state'
import { BlockManager } from './block-manager'
import { SelectionManager } from './selection-manager'
import { CursorManager } from './cursor-manager'
import { Renderer } from './renderer'
import { PluginRegistry } from './plugin-registry'
import { HistoryBridge } from './history-bridge'
import { DocumentValidator } from './document-validator'
import { BlockFactory } from './block-factory'

export interface EditorConfig {
  pageId: string;
  workspaceId: string;
  rootBlockId: string;
  initialBlocks?: Block[];
  mode?: EditorMode;
  readOnly?: boolean;
}

export class EditorEngine {
  private state: EditorState;
  private renderer: Renderer;
  private historyBridge: HistoryBridge;
  private validator: DocumentValidator;

  constructor(pluginRegistry: PluginRegistry) {
    this.state = new EditorState(pluginRegistry)
    this.renderer = new Renderer(pluginRegistry)
    this.historyBridge = new HistoryBridge()
    this.validator = new DocumentValidator()
  }

  openDocument(config: EditorConfig): void {
    const factory = new BlockFactory()

    const rootBlock = factory.createRoot(config.workspaceId, config.pageId)
    rootBlock.id = config.rootBlockId
    rootBlock.children = []

    const document = new DocumentModel(config.pageId, config.workspaceId, rootBlock)

    if (config.initialBlocks) {
      for (const block of config.initialBlocks) {
        if (block.id !== rootBlock.id) {
          document.addBlock(block)
        }
      }
    }

    this.state.initialize(document)

    const ensureInitialParagraph = (): void => {
      const root = document.getRootBlock()
      if (root && root.children.length === 0) {
        const blockManager = this.state.getBlockManager()
        if (blockManager) {
          blockManager.insertParagraph(config.rootBlockId, '')
        }
      }
    }
    ensureInitialParagraph()

    if (config.mode) {
      this.state.setMode(config.mode)
    }

    if (config.readOnly) {
      this.state.setReadOnly(true)
    }
  }

  closeDocument(): void {
    this.state.reset()
    this.historyBridge.clear()
  }

  getDocument(): DocumentModel | null {
    return this.state.getDocument()
  }

  getBlockManager(): BlockManager | null {
    return this.state.getBlockManager()
  }

  getSelectionManager(): SelectionManager | null {
    return this.state.getSelectionManager()
  }

  getCursorManager(): CursorManager | null {
    return this.state.getCursorManager()
  }

  getPluginRegistry(): PluginRegistry {
    return this.state.getPluginRegistry()
  }

  getHistoryBridge(): HistoryBridge {
    return this.historyBridge
  }

  getValidator(): DocumentValidator {
    return this.validator
  }

  getMode(): EditorMode {
    return this.state.getMode()
  }

  setMode(mode: EditorMode): void {
    this.state.setMode(mode)
  }

  isReadOnly(): boolean {
    return this.state.isReadOnlyMode()
  }

  setReadOnly(readOnly: boolean): void {
    this.state.setReadOnly(readOnly)
  }

  isDocumentOpen(): boolean {
    return this.state.isDocumentOpen()
  }

  render(): RenderNode[] {
    const document = this.state.getDocument()
    if (!document) return []

    const rendered = this.renderer.renderDocument(document)
    return rendered ? [rendered] : []
  }

  renderBlocks(): RenderNode[] {
    const document = this.state.getDocument()
    const blockManager = this.state.getBlockManager()
    if (!document || !blockManager) return []

    const rootBlock = document.getRootBlock()
    if (!rootBlock) return []

    const children = blockManager.getChildren(rootBlock.id)
    return this.renderer.renderBlocks(children, document)
  }

  validate(): string[] {
    const document = this.state.getDocument()
    if (!document) return ['No document open']

    return this.validator.validate(document)
  }
}
