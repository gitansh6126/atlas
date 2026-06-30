import type { Block, RenderNode } from './types'
import type { DocumentModel } from './document-model'
import type { PluginRegistry } from './plugin-registry'

export class Renderer {
  private pluginRegistry: PluginRegistry;

  constructor(pluginRegistry: PluginRegistry) {
    this.pluginRegistry = pluginRegistry
  }

  renderDocument(document: DocumentModel): RenderNode | null {
    const rootBlock = document.getRootBlock()
    if (!rootBlock) return null

    return this.renderBlock(rootBlock, document, 0)
  }

  renderBlock(block: Block, document: DocumentModel, depth: number): RenderNode {
    const plugin = this.pluginRegistry.getPlugin(block.type)

    const children = block.children
      .map((childId) => {
        const childBlock = document.getBlock(childId)
        if (!childBlock || childBlock.deletedAt !== null) return null
        return this.renderBlock(childBlock, document, depth + 1)
      })
      .filter((node): node is RenderNode => node !== null)

    if (!plugin) {
      return {
        blockId: block.id,
        type: block.type,
        depth,
        props: { content: block.content, isFallback: true },
        children,
      }
    }

    const rendered = plugin.render(block, children, document)
    return {
      ...rendered,
      depth,
    }
  }

  renderBlocks(blocks: Block[], document: DocumentModel): RenderNode[] {
    return blocks
      .filter((b) => b.deletedAt === null)
      .sort((a, b) => a.position - b.position)
      .map((block) => this.renderBlock(block, document, 0))
  }
}
