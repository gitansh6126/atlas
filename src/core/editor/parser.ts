import type { Block } from './types'

export interface ParsedDocument {
  pageId: string;
  workspaceId: string;
  blocks: Block[];
  parsedAt: number;
}

export interface Parser {
  format: string;
  mimeTypes: string[];
  parse(input: string, workspaceId: string, pageId: string): ParsedDocument;
}

export interface MarkdownParser extends Parser {
  format: 'markdown';
  mimeTypes: ['text/markdown'];
}

export interface HtmlParser extends Parser {
  format: 'html';
  mimeTypes: ['text/html'];
}

export interface JsonParser extends Parser {
  format: 'json';
  mimeTypes: ['application/json'];
}

export function buildParsedDocument(
  pageId: string,
  workspaceId: string,
  blocks: Block[],
): ParsedDocument {
  return {
    pageId,
    workspaceId,
    blocks,
    parsedAt: Date.now(),
  }
}
