import type { Block, RenderNode } from './types'

export interface SerializedDocument {
  version: string;
  pageId: string;
  workspaceId: string;
  blocks: SerializedBlock[];
  exportedAt: number;
}

export interface SerializedBlock {
  id: string;
  type: string;
  parentId: string | null;
  children: string[];
  content: Record<string, unknown>;
  metadata: Record<string, unknown>;
  position: number;
}

export interface Serializer {
  format: string;
  mimeType: string;
  serialize(blocks: Block[]): string;
}

export interface MarkdownSerializer extends Serializer {
  format: 'markdown';
  mimeType: 'text/markdown';
  serializeBlocks(blocks: Block[], pluginRegistry: import('./plugin-registry').PluginRegistry): string;
}

export interface HtmlSerializer extends Serializer {
  format: 'html';
  mimeType: 'text/html';
  serializeBlocks(blocks: Block[], pluginRegistry: import('./plugin-registry').PluginRegistry): string;
}

export interface JsonSerializer extends Serializer {
  format: 'json';
  mimeType: 'application/json';
  serializeBlocks(blocks: Block[], _pluginRegistry: import('./plugin-registry').PluginRegistry): string;
}

export function buildSerializedDocument(
  pageId: string,
  workspaceId: string,
  blocks: Block[],
): SerializedDocument {
  return {
    version: '0.1.0',
    pageId,
    workspaceId,
    blocks: blocks
      .filter((b) => b.deletedAt === null)
      .map(serializeBlock),
    exportedAt: Date.now(),
  }
}

export function serializeBlock(block: Block): SerializedBlock {
  return {
    id: block.id,
    type: block.type,
    parentId: block.parentId,
    children: [...block.children],
    content: { ...block.content },
    metadata: { ...block.metadata },
    position: block.position,
  }
}

export function renderNodeToJson(node: RenderNode): Record<string, unknown> {
  return {
    blockId: node.blockId,
    type: node.type,
    depth: node.depth,
    props: node.props,
    children: node.children.map(renderNodeToJson),
  }
}
