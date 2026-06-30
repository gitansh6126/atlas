import type { Block, RenderNode } from './types'
import type { DocumentModel } from './document-model'

export interface BlockPlugin {
  type: string;
  name: string;
  version: string;
  render(block: Block, children: RenderNode[], document: DocumentModel): RenderNode;
  validate?(block: Block): string[];
}

export class PluginRegistry {
  private plugins: Map<string, BlockPlugin> = new Map();

  register(plugin: BlockPlugin): void {
    if (this.plugins.has(plugin.type)) {
      throw new Error(`Plugin for block type "${plugin.type}" is already registered`)
    }
    this.plugins.set(plugin.type, plugin)
  }

  unregister(type: string): void {
    this.plugins.delete(type)
  }

  getPlugin(type: string): BlockPlugin | undefined {
    return this.plugins.get(type)
  }

  hasPlugin(type: string): boolean {
    return this.plugins.has(type)
  }

  getRegisteredTypes(): string[] {
    return Array.from(this.plugins.keys())
  }

  getAllPlugins(): BlockPlugin[] {
    return Array.from(this.plugins.values())
  }

  render(block: Block, document: DocumentModel): RenderNode {
    const plugin = this.plugins.get(block.type)
    if (!plugin) {
      return this.renderFallback(block, document)
    }

    const children = block.children
      .map((childId) => {
        const childBlock = document.getBlock(childId)
        if (!childBlock || childBlock.deletedAt !== null) return null
        return this.render(childBlock, document)
      })
      .filter((node): node is RenderNode => node !== null)

    return plugin.render(block, children, document)
  }

  validate(block: Block): string[] {
    const errors: string[] = []
    const plugin = this.plugins.get(block.type)

    if (plugin?.validate) {
      errors.push(...plugin.validate(block))
    }

    return errors
  }

  private renderFallback(block: Block, document: DocumentModel): RenderNode {
    const children = block.children
      .map((childId) => {
        const childBlock = document.getBlock(childId)
        if (!childBlock || childBlock.deletedAt !== null) return null
        return this.render(childBlock, document)
      })
      .filter((node): node is RenderNode => node !== null)

    return {
      blockId: block.id,
      type: block.type,
      depth: 0,
      props: {
        content: block.content,
        metadata: block.metadata,
        isFallback: true,
      },
      children,
    }
  }
}
