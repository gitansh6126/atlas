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
import type { PluginRegistry } from '@/core/editor/plugin-registry'

export class PluginRegistryEnhancer {
  private legacyRegistry: PluginRegistry;

  readonly registrations = new Map<string, BlockTypeRegistration>();
  readonly slashCommands = new Map<string, SlashCommandEntry[]>();
  slashCommandsFlat: SlashCommandRegistryEntry[] | null = null;
  readonly toolbarActions = new Map<string, ToolbarAction[]>();
  readonly contextMenuItems = new Map<string, ContextMenuAction[]>();
  readonly serializers = new Map<string, Map<string, BlockSerializer>>();
  readonly parsers = new Map<string, Map<string, BlockParser>>();
  readonly validators = new Map<string, BlockValidator>();
  readonly keyboardShortcuts = new Map<string, KeyboardShortcut>();
  readonly searchIndexers = new Map<string, SearchIndexer>();
  readonly aiProviders = new Map<string, AIProvider>();

  constructor(legacyRegistry: PluginRegistry) {
    this.legacyRegistry = legacyRegistry
  }

  getLegacyRegistry(): PluginRegistry {
    return this.legacyRegistry
  }

  getRegistrations(): ReadonlyMap<string, BlockTypeRegistration> {
    return this.registrations
  }

  getRegistration(type: string): BlockTypeRegistration | undefined {
    return this.registrations.get(type)
  }

  getSlashCommands(): SlashCommandRegistryEntry[] {
    if (this.slashCommandsFlat) return this.slashCommandsFlat
    const entries: SlashCommandRegistryEntry[] = []
    for (const [blockType, commands] of this.slashCommands) {
      for (const command of commands) {
        entries.push({ blockType, command })
      }
    }
    this.slashCommandsFlat = entries
    return entries
  }

  getSlashCommandsForType(type: string): SlashCommandEntry[] {
    return this.slashCommands.get(type) ?? []
  }

  getToolbarActions(type: string): ToolbarAction[] {
    return this.toolbarActions.get(type) ?? []
  }

  getContextMenuItems(type: string): ContextMenuAction[] {
    return this.contextMenuItems.get(type) ?? []
  }

  getSerializers(type: string): Map<string, BlockSerializer> {
    return this.serializers.get(type) ?? new Map()
  }

  getSerializer(type: string, format: string): BlockSerializer | undefined {
    return this.serializers.get(type)?.get(format)
  }

  getParsers(type: string): Map<string, BlockParser> {
    return this.parsers.get(type) ?? new Map()
  }

  getParser(type: string, format: string): BlockParser | undefined {
    return this.parsers.get(type)?.get(format)
  }

  getValidator(type: string): BlockValidator | undefined {
    return this.validators.get(type)
  }

  getAllKeyboardShortcuts(): KeyboardShortcut[] {
    return Array.from(this.keyboardShortcuts.values())
  }

  getSearchIndexer(type: string): SearchIndexer | undefined {
    return this.searchIndexers.get(type)
  }

  getAIProviders(): AIProvider[] {
    return Array.from(this.aiProviders.values())
  }

  getBlockTypes(): string[] {
    return Array.from(this.registrations.keys())
  }

  getAllSlashCommands(): SlashCommandRegistryEntry[] {
    return this.getSlashCommands()
  }
}
