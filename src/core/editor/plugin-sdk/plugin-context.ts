import type { PluginAPI } from './plugin-api.ts'
import type { EditorEngine } from '@/core/editor/editor-engine'

export interface PluginContext {
  pluginId: string;
  api: PluginAPI;
  editor: EditorEngine | null;
  getSetting(key: string): unknown;
  setSetting(key: string, value: unknown): void;
}

export function createPluginContext(
  pluginId: string,
  api: PluginAPI,
  editor: EditorEngine | null,
): PluginContext {
  const settings = new Map<string, unknown>()

  return {
    pluginId,
    api,
    editor,
    getSetting(key: string): unknown {
      return settings.get(key)
    },
    setSetting(key: string, value: unknown): void {
      settings.set(key, value)
    },
  }
}
