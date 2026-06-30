import type { EditorMode } from './types'
import { DocumentModel } from './document-model'
import { BlockManager } from './block-manager'
import { SelectionManager } from './selection-manager'
import { CursorManager } from './cursor-manager'
import { PluginRegistry } from './plugin-registry'

export class EditorState {
  private document: DocumentModel | null = null;
  private blockManager: BlockManager | null = null;
  private selectionManager: SelectionManager | null = null;
  private cursorManager: CursorManager | null = null;
  private pluginRegistry: PluginRegistry;
  private mode: EditorMode = 'edit';
  private isReadOnly: boolean = false;

  constructor(pluginRegistry: PluginRegistry) {
    this.pluginRegistry = pluginRegistry
  }

  initialize(document: DocumentModel): void {
    this.document = document
    this.blockManager = new BlockManager(document)
    this.selectionManager = new SelectionManager(document)
    this.cursorManager = new CursorManager(document)
  }

  getDocument(): DocumentModel | null {
    return this.document
  }

  getBlockManager(): BlockManager | null {
    return this.blockManager
  }

  getSelectionManager(): SelectionManager | null {
    return this.selectionManager
  }

  getCursorManager(): CursorManager | null {
    return this.cursorManager
  }

  getPluginRegistry(): PluginRegistry {
    return this.pluginRegistry
  }

  getMode(): EditorMode {
    return this.mode
  }

  setMode(mode: EditorMode): void {
    this.mode = mode
  }

  isReadOnlyMode(): boolean {
    return this.isReadOnly
  }

  setReadOnly(readOnly: boolean): void {
    this.isReadOnly = readOnly
  }

  isDocumentOpen(): boolean {
    return this.document !== null
  }

  reset(): void {
    this.document = null
    this.blockManager = null
    this.selectionManager = null
    this.cursorManager = null
    this.mode = 'edit'
    this.isReadOnly = false
  }
}
