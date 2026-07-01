export { PluginManager } from './plugin-manager.ts'
export { PluginValidator } from './plugin-validator.ts'
export { PluginLoader } from './plugin-loader.ts'
export { PluginRegistryEnhancer } from './plugin-registry-enhancer.ts'
export { createPluginAPI } from './plugin-api.ts'
export { createPluginContext } from './plugin-context.ts'
export { createDefaultCapabilities, textBlockCapabilities, dividerCapabilities } from './plugin-capabilities.ts'

export type {
  PluginManifest,
  PluginCapabilities,
  PluginLifecycle,
  BlockTypeRegistration,
  BlockValidator,
  BlockSerializer,
  BlockParser,
  SlashCommandEntry,
  ToolbarAction,
  ContextMenuAction,
  KeyboardShortcut,
  SearchIndexer,
  AIProvider,
  SlashCommandRegistryEntry,
  PluginCommandDescriptor,
  PluginSettingDefinition,
  PluginState,
} from './types.ts'

export type { PluginContext } from './plugin-context.ts'
