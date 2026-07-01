import type { PluginCapabilities } from './types.ts'

export function createDefaultCapabilities(overrides?: Partial<PluginCapabilities>): PluginCapabilities {
  return {
    rendering: false,
    serialization: false,
    parsing: false,
    validation: false,
    slashMenu: false,
    toolbar: false,
    keyboardShortcuts: false,
    contextMenu: false,
    clipboard: false,
    search: false,
    ai: false,
    export_: false,
    ...overrides,
  }
}

export function textBlockCapabilities(): PluginCapabilities {
  return createDefaultCapabilities({
    rendering: true,
    serialization: true,
    parsing: true,
    validation: true,
    slashMenu: true,
    toolbar: true,
    contextMenu: true,
    clipboard: true,
  })
}

export function dividerCapabilities(): PluginCapabilities {
  return createDefaultCapabilities({
    rendering: true,
    serialization: true,
    parsing: true,
    validation: true,
    slashMenu: true,
    contextMenu: true,
  })
}
