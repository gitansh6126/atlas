import type { PluginLifecycle } from './types.ts'
import { PluginValidator } from './plugin-validator.ts'
import type { PluginManager } from './plugin-manager.ts'

export interface PluginModule {
  default?: PluginLifecycle;
  createPlugin?: () => PluginLifecycle;
  plugin?: PluginLifecycle;
}

export class PluginLoader {
  private validator: PluginValidator;
  private loaded = new Set<string>();

  constructor() {
    this.validator = new PluginValidator()
  }

  async loadPlugin(
    plugin: PluginLifecycle | PluginModule,
    manager: PluginManager,
  ): Promise<string | null> {
    const resolved = this.resolvePlugin(plugin)
    if (!resolved) {
      return null
    }

    const validation = this.validator.validateLifecycle(resolved)
    if (!validation.valid) {
      console.warn(
        `Plugin "${resolved.manifest.id}" validation failed:`,
        validation.errors,
      )
      return null
    }

    if (this.loaded.has(resolved.manifest.id)) {
      console.warn(`Plugin "${resolved.manifest.id}" is already loaded`)
      return null
    }

    manager.register(resolved)
    this.loaded.add(resolved.manifest.id)
    return resolved.manifest.id
  }

  async loadPlugins(
    plugins: (PluginLifecycle | PluginModule)[],
    manager: PluginManager,
  ): Promise<string[]> {
    const loaded: string[] = []
    const sorted = this.sortByDependencies(plugins)

    for (const plugin of sorted) {
      const id = await this.loadPlugin(plugin, manager)
      if (id) {
        loaded.push(id)
      }
    }

    return loaded
  }

  isLoaded(pluginId: string): boolean {
    return this.loaded.has(pluginId)
  }

  getLoadedPluginIds(): string[] {
    return Array.from(this.loaded)
  }

  private resolvePlugin(plugin: PluginLifecycle | PluginModule): PluginLifecycle | null {
    if ('manifest' in plugin && 'capabilities' in plugin) {
      return plugin as PluginLifecycle
    }

    const mod = plugin as PluginModule
    if (mod.default) return mod.default
    if (mod.createPlugin) return mod.createPlugin()
    if (mod.plugin) return mod.plugin

    return null
  }

  private sortByDependencies(plugins: (PluginLifecycle | PluginModule)[]): (PluginLifecycle | PluginModule)[] {
    const resolved = new Map<string, PluginLifecycle>()
    const entries: { original: PluginLifecycle | PluginModule; lifecycle: PluginLifecycle }[] = []

    for (const p of plugins) {
      const lc = this.resolvePlugin(p)
      if (lc) {
        resolved.set(lc.manifest.id, lc)
        entries.push({ original: p, lifecycle: lc })
      }
    }

    const visited = new Set<string>()
    const sorted: (PluginLifecycle | PluginModule)[] = []

    function visit(id: string): void {
      if (visited.has(id)) return
      visited.add(id)

      const lc = resolved.get(id)
      if (lc?.manifest.dependencies) {
        for (const dep of lc.manifest.dependencies) {
          visit(dep)
        }
      }

      const entry = entries.find((e) => e.lifecycle.manifest.id === id)
      if (entry) {
        sorted.push(entry.original)
      }
    }

    for (const entry of entries) {
      visit(entry.lifecycle.manifest.id)
    }

    return sorted
  }
}
