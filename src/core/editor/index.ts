export { DocumentModel } from './document-model'
export { EditorEngine } from './editor-engine'
export type { EditorConfig } from './editor-engine'
export { EditorState } from './editor-state'
export { BlockManager } from './block-manager'
export { SelectionManager } from './selection-manager'
export { CursorManager } from './cursor-manager'
export { Renderer } from './renderer'
export { HistoryBridge } from './history-bridge'
export { PluginRegistry } from './plugin-registry'
export type { BlockPlugin } from './plugin-registry'
export {
  InsertBlockCommand,
  DeleteBlockCommand,
  MoveBlockCommand,
  DuplicateBlockCommand,
  SplitBlockCommand,
  MergeBlockCommand,
} from './editor-commands'
export { BlockFactory } from './block-factory'
export { NodeTraversal } from './node-traversal'
export { DocumentValidator } from './document-validator'
export { ClipboardService } from './clipboard-service'
export {
  buildSerializedDocument,
  serializeBlock,
  renderNodeToJson,
} from './serializer'
export type {
  SerializedDocument,
  SerializedBlock,
  Serializer,
  MarkdownSerializer,
  HtmlSerializer,
  JsonSerializer,
} from './serializer'
export { buildParsedDocument } from './parser'
export type {
  ParsedDocument,
  Parser,
  MarkdownParser,
  HtmlParser,
  JsonParser,
} from './parser'
export type { ValidationError } from './document-validator'

// Block type constants and core interfaces
export {
  BLOCK_TYPE_ROOT,
  BLOCK_TYPE_PARAGRAPH,
  BLOCK_TYPE_HEADING,
  BLOCK_TYPE_DIVIDER,
  BLOCK_TYPES_BUILTIN,
} from './types'
export type {
  Block,
  Document,
  InlineFormat,
  Selection,
  CursorPosition,
  EditorMode,
  RenderNode,
} from './types'

// Built-in plugins
export { rootPlugin } from './plugins/root-plugin'
export { paragraphPlugin } from './plugins/paragraph-plugin'
export { headingPlugin } from './plugins/heading-plugin'
export { dividerPlugin } from './plugins/divider-plugin'
