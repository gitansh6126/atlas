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

export const BLOCK_TYPES_BUILTIN: readonly string[] = [
  BLOCK_TYPE_ROOT,
  BLOCK_TYPE_PARAGRAPH,
  BLOCK_TYPE_HEADING,
  BLOCK_TYPE_DIVIDER,
] as const;
