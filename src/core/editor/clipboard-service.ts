import type { Block } from './types'

export interface ClipboardData {
  blocks: Block[];
  plainText: string;
  html: string;
  timestamp: number;
}

export class ClipboardService {
  private clipboard: ClipboardData | null = null;

  copy(blocks: Block[]): ClipboardData {
    const data: ClipboardData = {
      blocks: blocks.map((b) => ({ ...b })),
      plainText: blocks.map((b) => b.plainText).join('\n'),
      html: '',
      timestamp: Date.now(),
    }

    this.clipboard = data
    return data
  }

  cut(blocks: Block[]): ClipboardData {
    const data = this.copy(blocks)
    return data
  }

  paste(): ClipboardData | null {
    return this.clipboard
  }

  hasData(): boolean {
    return this.clipboard !== null
  }

  clear(): void {
    this.clipboard = null
  }

  getPlainText(): string {
    return this.clipboard?.plainText ?? ''
  }

  getBlocks(): Block[] {
    return this.clipboard?.blocks ?? []
  }
}
