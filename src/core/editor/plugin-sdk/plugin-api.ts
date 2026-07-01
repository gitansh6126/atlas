import type {
  BlockTypeRegistration,
  SlashCommandEntry,
  ToolbarAction,
  ContextMenuAction,
  KeyboardShortcut,
  BlockSerializer,
  BlockParser,
  BlockValidator,
  SearchIndexer,
  AIProvider,
  SlashCommandRegistryEntry,
} from './types.ts'
import type { PluginRegistryEnhancer } from './plugin-registry-enhancer.ts'

type RenderNode = import('@/core/editor/types').RenderNode
type BlockPlugin = import('@/core/editor/plugin-registry').BlockPlugin
type BlockType = import('@/core/editor/types').Block

export interface PluginAPI {
  registerBlockType(registration: BlockTypeRegistration): void;
  registerSlashCommand(blockType: string, command: SlashCommandEntry): void;
  registerToolbarAction(blockType: string, action: ToolbarAction): void;
  registerContextMenuItem(blockType: string, item: ContextMenuAction): void;
  registerKeyboardShortcut(shortcut: KeyboardShortcut): void;
  registerSerializer(blockType: string, format: string, serializer: BlockSerializer): void;
  registerParser(blockType: string, format: string, parser: BlockParser): void;
  registerValidator(blockType: string, validator: BlockValidator): void;
  registerSearchIndexer(blockType: string, indexer: SearchIndexer): void;
  registerAIProvider(provider: AIProvider): void;
  getBlockRegistration(type: string): BlockTypeRegistration | undefined;
  getSlashCommands(): SlashCommandRegistryEntry[];
  getBlockTypes(): string[];
}

export function createPluginAPI(enhancer: PluginRegistryEnhancer): PluginAPI {
  function buildLegacyPlugin(reg: BlockTypeRegistration): BlockPlugin {
    return {
      type: reg.type,
      name: reg.slashCommand?.title ?? reg.type,
      version: '1.0.0',
      render(block: BlockType, children: RenderNode[], _document: import('@/core/editor/document-model').DocumentModel) {
        return {
          blockId: block.id,
          type: block.type,
          depth: 0,
          props: { ...block.content, formats: block.formats },
          children,
        }
      },
      validate: reg.validator
        ? (block: BlockType) => reg.validator!(block.content)
        : undefined,
    }
  }

  return {
    registerBlockType(registration: BlockTypeRegistration): void {
      if (enhancer.registrations.has(registration.type)) {
        throw new Error(`Block type "${registration.type}" is already registered`)
      }

      enhancer.registrations.set(registration.type, registration)

      const legacy = buildLegacyPlugin(registration)
      try {
        enhancer.getLegacyRegistry().register(legacy)
      } catch {
        // Legacy registry already has this type registered
      }

      if (registration.slashCommand) {
        const existing = enhancer.slashCommands.get(registration.type) ?? []
        existing.push(registration.slashCommand)
        enhancer.slashCommands.set(registration.type, existing)
      }
      enhancer.slashCommandsFlat = null

      if (registration.toolbarActions) {
        const existing = enhancer.toolbarActions.get(registration.type) ?? []
        enhancer.toolbarActions.set(registration.type, [...existing, ...registration.toolbarActions])
      }

      if (registration.contextMenuActions) {
        const existing = enhancer.contextMenuItems.get(registration.type) ?? []
        enhancer.contextMenuItems.set(registration.type, [...existing, ...registration.contextMenuActions])
      }

      if (registration.validator) {
        enhancer.validators.set(registration.type, registration.validator)
      }

      if (registration.parsers) {
        const pmap = new Map<string, BlockParser>()
        for (const [fmt, parser] of Object.entries(registration.parsers)) {
          pmap.set(fmt, parser)
        }
        enhancer.parsers.set(registration.type, pmap)
      }

      if (registration.serializers) {
        const smap = new Map<string, BlockSerializer>()
        for (const [fmt, serializer] of Object.entries(registration.serializers)) {
          smap.set(fmt, serializer)
        }
        enhancer.serializers.set(registration.type, smap)
      }
    },

    registerSlashCommand(blockType: string, command: SlashCommandEntry): void {
      const existing = enhancer.slashCommands.get(blockType) ?? []
      existing.push(command)
      enhancer.slashCommands.set(blockType, existing)
      enhancer.slashCommandsFlat = null
    },

    registerToolbarAction(blockType: string, action: ToolbarAction): void {
      const existing = enhancer.toolbarActions.get(blockType) ?? []
      existing.push(action)
      enhancer.toolbarActions.set(blockType, existing)
    },

    registerContextMenuItem(blockType: string, item: ContextMenuAction): void {
      const existing = enhancer.contextMenuItems.get(blockType) ?? []
      existing.push(item)
      enhancer.contextMenuItems.set(blockType, existing)
    },

    registerKeyboardShortcut(shortcut: KeyboardShortcut): void {
      if (enhancer.keyboardShortcuts.has(shortcut.id)) {
        throw new Error(`Keyboard shortcut "${shortcut.id}" is already registered`)
      }
      enhancer.keyboardShortcuts.set(shortcut.id, shortcut)
    },

    registerSerializer(blockType: string, format: string, serializer: BlockSerializer): void {
      let byType = enhancer.serializers.get(blockType)
      if (!byType) {
        byType = new Map()
        enhancer.serializers.set(blockType, byType)
      }
      byType.set(format, serializer)
    },

    registerParser(blockType: string, format: string, parser: BlockParser): void {
      let byType = enhancer.parsers.get(blockType)
      if (!byType) {
        byType = new Map()
        enhancer.parsers.set(blockType, byType)
      }
      byType.set(format, parser)
    },

    registerValidator(blockType: string, validator: BlockValidator): void {
      enhancer.validators.set(blockType, validator)
    },

    registerSearchIndexer(blockType: string, indexer: SearchIndexer): void {
      enhancer.searchIndexers.set(blockType, indexer)
    },

    registerAIProvider(provider: AIProvider): void {
      enhancer.aiProviders.set(provider.id, provider)
    },

    getBlockRegistration(type: string): BlockTypeRegistration | undefined {
      return enhancer.registrations.get(type)
    },

    getSlashCommands(): SlashCommandRegistryEntry[] {
      return enhancer.getSlashCommands()
    },

    getBlockTypes(): string[] {
      return enhancer.getBlockTypes()
    },
  }
}
