import type { PluginManifest, PluginCapabilities, PluginLifecycle } from './types.ts'

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export class PluginValidator {
  validateManifest(manifest: PluginManifest): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    if (!manifest.id || manifest.id.trim().length === 0) {
      errors.push('Plugin manifest is missing "id"')
    } else if (!/^[a-z0-9][a-z0-9_-]*$/.test(manifest.id)) {
      errors.push(
        `Plugin id "${manifest.id}" must start with a lowercase letter or number, and contain only lowercase letters, numbers, hyphens, and underscores`,
      )
    }

    if (!manifest.name || manifest.name.trim().length === 0) {
      errors.push(`Plugin "${manifest.id}" is missing "name"`)
    }

    if (!manifest.version || !/^\d+\.\d+\.\d+$/.test(manifest.version)) {
      errors.push(`Plugin "${manifest.id}" has invalid or missing "version" (expected semver)`)
    }

    if (!manifest.description || manifest.description.trim().length === 0) {
      warnings.push(`Plugin "${manifest.id}" is missing a "description"`)
    }

    if (!manifest.author || manifest.author.trim().length === 0) {
      warnings.push(`Plugin "${manifest.id}" is missing an "author"`)
    }

    if (manifest.dependencies) {
      for (const dep of manifest.dependencies) {
        if (typeof dep !== 'string' || dep.trim().length === 0) {
          errors.push(`Plugin "${manifest.id}" has an invalid dependency entry`)
        }
      }
    }

    if (manifest.commands) {
      for (const cmd of manifest.commands) {
        if (!cmd.id) {
          errors.push(`Plugin "${manifest.id}" has a command missing "id"`)
        }
        if (!cmd.name) {
          errors.push(`Plugin "${manifest.id}" has a command missing "name"`)
        }
      }
    }

    if (manifest.settings) {
      for (const setting of manifest.settings) {
        if (!setting.key) {
          errors.push(`Plugin "${manifest.id}" has a setting missing "key"`)
        }
        if (!setting.label) {
          errors.push(`Plugin "${manifest.id}" has a setting missing "label"`)
        }
        if (!['string', 'number', 'boolean', 'select', 'multiselect'].includes(setting.type)) {
          errors.push(
            `Plugin "${manifest.id}" setting "${setting.key}" has invalid type "${setting.type}"`,
          )
        }
      }
    }

    return { valid: errors.length === 0, errors, warnings }
  }

  validateCapabilities(
    manifest: PluginManifest,
    capabilities: PluginCapabilities,
  ): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    if (capabilities.slashMenu && !manifest.commands && !capabilities.rendering) {
      warnings.push(
        `Plugin "${manifest.id}" declares slashMenu but no commands or rendering capability`,
      )
    }

    if (capabilities.toolbar && !capabilities.rendering) {
      warnings.push(
        `Plugin "${manifest.id}" declares toolbar capability but not rendering`,
      )
    }

    if (capabilities.serialization && !capabilities.rendering) {
      warnings.push(
        `Plugin "${manifest.id}" declares serialization without rendering`,
      )
    }

    if (capabilities.parsing && !capabilities.rendering) {
      warnings.push(
        `Plugin "${manifest.id}" declares parsing without rendering`,
      )
    }

    return { valid: errors.length === 0, errors, warnings }
  }

  validateLifecycle(plugin: PluginLifecycle): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    if (!plugin.manifest) {
      return { valid: false, errors: ['Plugin is missing manifest'], warnings: [] }
    }

    const manifestResult = this.validateManifest(plugin.manifest)
    errors.push(...manifestResult.errors)
    warnings.push(...manifestResult.warnings)

    if (plugin.capabilities) {
      const capsResult = this.validateCapabilities(plugin.manifest, plugin.capabilities)
      errors.push(...capsResult.errors)
      warnings.push(...capsResult.warnings)
    } else {
      warnings.push(`Plugin "${plugin.manifest.id}" is missing capabilities declaration`)
    }

    return { valid: errors.length === 0, errors, warnings }
  }
}
