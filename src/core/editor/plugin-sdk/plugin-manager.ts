import type { PluginLifecycle, PluginState } from './types.ts'
import { PluginRegistryEnhancer } from './plugin-registry-enhancer.ts'
import { PluginValidator } from './plugin-validator.ts'
import { PluginLoader } from './plugin-loader.ts'
import { createPluginAPI } from './plugin-api.ts'
import { createPluginContext } from './plugin-context.ts'
import type { PluginRegistry } from '@/core/editor/plugin-registry'
import type { EditorEngine } from '@/core/editor/editor-engine'

export class PluginManager {
  private plugins = new Map<string, PluginLifecycle>();
  private states = new Map<string, PluginState>();
  private enhancer: PluginRegistryEnhancer;
  private validator: PluginValidator;
  private loader: PluginLoader;
  private editor: EditorEngine | null = null;

  constructor(legacyRegistry: PluginRegistry) {
    this.enhancer = new PluginRegistryEnhancer(legacyRegistry)
    this.validator = new PluginValidator()
    this.loader = new PluginLoader()
  }

  getEnhancer(): PluginRegistryEnhancer {
    return this.enhancer
  }

  getValidator(): PluginValidator {
    return this.validator
  }

  getLoader(): PluginLoader {
    return this.loader
  }

  setEditor(engine: EditorEngine): void {
    this.editor = engine
  }

  getEditor(): EditorEngine | null {
    return this.editor
  }

  register(plugin: PluginLifecycle): string | null {
    const validation = this.validator.validateLifecycle(plugin)
    if (!validation.valid) {
      console.warn(
        `Plugin "${plugin.manifest.id}" rejected:`,
        validation.errors,
      )
      return null
    }

    if (this.plugins.has(plugin.manifest.id)) {
      console.warn(`Plugin "${plugin.manifest.id}" is already registered`)
      return null
    }

    this.plugins.set(plugin.manifest.id, plugin)
    this.states.set(plugin.manifest.id, {
      id: plugin.manifest.id,
      status: 'registered',
      registeredAt: Date.now(),
    })

    return plugin.manifest.id
  }

  private buildAPI() {
    return createPluginAPI(this.enhancer)
  }

  async initialize(pluginId: string): Promise<boolean> {
    const plugin = this.plugins.get(pluginId)
    if (!plugin) return false

    const state = this.states.get(pluginId)
    if (!state || state.status !== 'registered') return false

    try {
      const api = this.buildAPI()
      const context = createPluginContext(pluginId, api, this.editor)

      if (plugin.register) {
        await plugin.register(context)
      }

      if (plugin.initialize) {
        await plugin.initialize(context)
      }

      state.status = 'initialized'
      return true
    } catch (error) {
      state.status = 'registered'
      state.error = error instanceof Error ? error.message : String(error)
      console.warn(`Plugin "${pluginId}" initialization failed:`, error)
      return false
    }
  }

  async activate(pluginId: string): Promise<boolean> {
    const plugin = this.plugins.get(pluginId)
    if (!plugin) return false

    const state = this.states.get(pluginId)
    if (!state || state.status !== 'initialized') return false

    try {
      const api = this.buildAPI()
      const context = createPluginContext(pluginId, api, this.editor)

      if (plugin.activate) {
        await plugin.activate(context)
      }

      state.status = 'activated'
      state.activatedAt = Date.now()
      return true
    } catch (error) {
      state.status = 'initialized'
      state.error = error instanceof Error ? error.message : String(error)
      console.warn(`Plugin "${pluginId}" activation failed:`, error)
      return false
    }
  }

  async deactivate(pluginId: string): Promise<boolean> {
    const plugin = this.plugins.get(pluginId)
    if (!plugin) return false

    const state = this.states.get(pluginId)
    if (!state || state.status !== 'activated') return false

    try {
      const api = this.buildAPI()
      const context = createPluginContext(pluginId, api, this.editor)

      if (plugin.deactivate) {
        await plugin.deactivate(context)
      }

      state.status = 'deactivated'
      return true
    } catch (error) {
      state.error = error instanceof Error ? error.message : String(error)
      console.warn(`Plugin "${pluginId}" deactivation failed:`, error)
      return false
    }
  }

  async dispose(pluginId: string): Promise<boolean> {
    const plugin = this.plugins.get(pluginId)
    if (!plugin) return false

    const state = this.states.get(pluginId)
    if (!state) return false

    try {
      const api = this.buildAPI()
      const context = createPluginContext(pluginId, api, this.editor)

      if (plugin.dispose) {
        await plugin.dispose(context)
      }

      state.status = 'disposed'
      this.plugins.delete(pluginId)
      this.states.delete(pluginId)
      return true
    } catch (error) {
      state.error = error instanceof Error ? error.message : String(error)
      console.warn(`Plugin "${pluginId}" dispose failed:`, error)
      return false
    }
  }

  async initializeAll(): Promise<string[]> {
    const succeeded: string[] = []

    for (const [id] of this.plugins) {
      const ok = await this.initialize(id)
      if (ok) succeeded.push(id)
    }

    return succeeded
  }

  async activateAll(): Promise<string[]> {
    const succeeded: string[] = []

    for (const [id] of this.plugins) {
      const ok = await this.activate(id)
      if (ok) succeeded.push(id)
    }

    return succeeded
  }

  async startAll(): Promise<string[]> {
    const initialized = await this.initializeAll()
    const activated = await this.activateAll()
    return [...new Set([...initialized, ...activated])]
  }

  getPlugin(id: string): PluginLifecycle | undefined {
    return this.plugins.get(id)
  }

  getState(id: string): PluginState | undefined {
    return this.states.get(id)
  }

  getActivePlugins(): PluginLifecycle[] {
    return Array.from(this.states.entries())
      .filter(([_, state]) => state.status === 'activated')
      .map(([id]) => this.plugins.get(id)!)
  }

  getAllPlugins(): PluginLifecycle[] {
    return Array.from(this.plugins.values())
  }

  getPluginIds(): string[] {
    return Array.from(this.plugins.keys())
  }

  getPluginStates(): Map<string, PluginState> {
    return new Map(this.states)
  }
}
