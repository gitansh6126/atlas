export interface PluginManifest {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  icon?: string;
  category?: string;
  supportedFormats?: string[];
  commands?: PluginCommandDescriptor[];
  settings?: PluginSettingDefinition[];
  dependencies?: string[];
}

export interface PluginCommandDescriptor {
  id: string;
  name: string;
  description?: string;
  defaultShortcut?: string;
}

export interface PluginSettingDefinition {
  key: string;
  label: string;
  type: 'string' | 'number' | 'boolean' | 'select' | 'multiselect';
  default?: unknown;
  options?: { label: string; value: string }[];
  description?: string;
}

export interface PluginCapabilities {
  rendering: boolean;
  serialization: boolean;
  parsing: boolean;
  validation: boolean;
  slashMenu: boolean;
  toolbar: boolean;
  keyboardShortcuts: boolean;
  contextMenu: boolean;
  clipboard: boolean;
  search: boolean;
  ai: boolean;
  export_: boolean;
}

export interface BlockValidator {
  (content: Record<string, unknown>): string[];
}

export interface BlockSerializer {
  (block: { content: Record<string, unknown>; metadata: Record<string, unknown> }): string;
}

export interface BlockParser {
  (input: string): { content: Record<string, unknown> } | null;
}

export interface SlashCommandEntry {
  title: string;
  description?: string;
  searchTerms?: string[];
  group?: string;
  icon?: string;
  aliases?: string[];
}

export interface ToolbarAction {
  id: string;
  label: string;
  icon?: string;
  shortcut?: string;
  isActive?: () => boolean;
  isAvailable?: () => boolean;
}

export interface ContextMenuAction {
  id: string;
  label: string;
  shortcut?: string;
  group?: string;
}

export interface KeyboardShortcut {
  id: string;
  shortcut: string;
  label: string;
  callback: () => void;
  contexts?: string[];
}

export interface SearchIndexer {
  (content: Record<string, unknown>, plainText: string): string[];
}

export interface AIProvider {
  id: string;
  name: string;
  capabilities: string[];
}

export interface SlashCommandRegistryEntry {
  blockType: string;
  command: SlashCommandEntry;
}

export interface BlockTypeRegistration {
  type: string;
  renderer: unknown;
  validator?: BlockValidator;
  serializers?: Record<string, BlockSerializer>;
  parsers?: Record<string, BlockParser>;
  slashCommand?: SlashCommandEntry;
  toolbarActions?: ToolbarAction[];
  contextMenuActions?: ContextMenuAction[];
  placeholder?: string;
  settings?: PluginSettingDefinition[];
}

export interface PluginState {
  id: string;
  status: 'registered' | 'initialized' | 'activated' | 'deactivated' | 'disposed';
  error?: string;
  registeredAt: number;
  activatedAt?: number;
}

export interface PluginLifecycle {
  manifest: PluginManifest;
  capabilities: PluginCapabilities;
  register?: (context: import('./plugin-context.ts').PluginContext) => void | Promise<void>;
  initialize?: (context: import('./plugin-context.ts').PluginContext) => void | Promise<void>;
  activate?: (context: import('./plugin-context.ts').PluginContext) => void | Promise<void>;
  deactivate?: (context: import('./plugin-context.ts').PluginContext) => void | Promise<void>;
  dispose?: (context: import('./plugin-context.ts').PluginContext) => void | Promise<void>;
}
