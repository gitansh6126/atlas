export interface InlineFormat {
  start: number;
  end: number;
  type: 'bold' | 'italic' | 'underline' | 'strikethrough' | 'code' | 'link' | 'highlight' | 'color';
  value: string | null;
}

export interface Block {
  id: string;
  workspaceId: string;
  pageId: string;
  parentId: string | null;
  children: string[];
  type: string;
  pluginVersion: string;
  content: Record<string, unknown>;
  metadata: Record<string, unknown>;
  formats: InlineFormat[];
  position: number;
  plainText: string;
  wordCount: number;
  charCount: number;
  createdAt: number;
  updatedAt: number;
  version: number;
  deletedAt: number | null;
}

export interface Document {
  pageId: string;
  workspaceId: string;
  blocks: Map<string, Block>;
  rootBlockId: string;
  dirtyBlocks: Set<string>;
  loadedAt: number;
  lastSavedAt: number;
  isSaving: boolean;
}

export interface Selection {
  type: 'cursor' | 'range' | 'block';
  anchorBlockId: string;
  anchorOffset: number;
  focusBlockId: string;
  focusOffset: number;
  selectedBlockIds: string[];
}

export interface CursorPosition {
  blockId: string;
  offset: number;
}

export type EditorMode = 'edit' | 'preview' | 'focus';

export interface RenderNode {
  blockId: string;
  type: string;
  depth: number;
  props: Record<string, unknown>;
  children: RenderNode[];
}

export const BLOCK_TYPE_ROOT = 'root';

export const BLOCK_TYPE_PARAGRAPH = 'paragraph';

export const BLOCK_TYPE_HEADING = 'heading';

export const BLOCK_TYPE_DIVIDER = 'divider';

export const BLOCK_TYPE_GRID = 'grid';

export const BLOCK_TYPE_LIST = 'list';

export const BLOCK_TYPE_CARD = 'card';

export const BLOCK_TYPE_GALLERY = 'gallery';

export const BLOCK_TYPE_KANBAN = 'kanban';

export const BLOCK_TYPE_CALENDAR = 'calendar';

export const BLOCK_TYPE_LABEL = 'label';

export const BLOCK_TYPE_TAG = 'tag';

export const BLOCK_TYPE_HTML_EMBED = 'html_embed';

export const BLOCK_TYPES_BUILTIN: readonly string[] = [
  BLOCK_TYPE_ROOT,
  BLOCK_TYPE_PARAGRAPH,
  BLOCK_TYPE_HEADING,
  BLOCK_TYPE_DIVIDER,
  BLOCK_TYPE_GRID,
  BLOCK_TYPE_LIST,
  BLOCK_TYPE_CARD,
  BLOCK_TYPE_GALLERY,
  BLOCK_TYPE_KANBAN,
  BLOCK_TYPE_CALENDAR,
  BLOCK_TYPE_LABEL,
  BLOCK_TYPE_TAG,
  BLOCK_TYPE_HTML_EMBED,
] as const;
