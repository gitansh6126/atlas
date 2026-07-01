# Inspector Panel

The Inspector Panel provides a properties editing interface for the currently selected block or page.

---

## Overview

The Inspector is a side panel that displays editable properties for the active block. When a user selects a block, the Inspector updates to show relevant fields: text properties, layout settings, colors, and metadata.

## Inspector Architecture

```
Inspector Panel
├── Panel Header
│   └── Block Type Icon + Name
├── Properties Section
│   ├── Text Properties (content, placeholder)
│   ├── Style Properties (colors, variants, alignment)
│   ├── Layout Properties (columns, gap, width)
│   └── Metadata (createdAt, position, tags)
└── Advanced Section
    └── Custom Fields (plugin-defined)
```

## Implementation

### Inspector Component

```typescript
interface InspectorPanelProps {
  selectedBlockId: string | null
  controller: EditorController
}

function InspectorPanel({ selectedBlockId, controller }: InspectorPanelProps) {
  if (!selectedBlockId) {
    return <EmptyState message="Select a block to inspect" />
  }

  const block = controller.getBlock(selectedBlockId)
  if (!block) return null

  return (
    <div className="w-80 border-l bg-sidebar p-4">
      <InspectorHeader block={block} />
      <InspectorProperties block={block} controller={controller} />
    </div>
  )
}
```

### Dynamic Properties

Each block type defines its own inspector fields:

| Block Type | Inspector Fields |
|-----------|-------------------|
| Paragraph | Text content, alignment |
| Heading | Text content, level (H1-H6) |
| Grid | Columns, gap, layout mode |
| Label | Text content, variant |
| Tag | Label text, color picker |
| HTML Embed | HTML editor, CSS editor, file list |
| Card | Title, description, image URL |

## Block Type Registry

Inspector fields are registered alongside block types:

```typescript
interface BlockInspectorConfig {
  fields: InspectorField[]
}

interface InspectorField {
  key: string
  label: string
  type: 'text' | 'number' | 'select' | 'color' | 'textarea'
  defaultValue: unknown
  options?: { label: string; value: string }[]
}
```

## Property Binding

Properties are two-way bound to the document model:

```typescript
// Update block content when inspector field changes
function updateBlockProperty(
  controller: EditorController,
  blockId: string,
  key: string,
  value: unknown
) {
  controller.updateBlockContent(blockId, { [key]: value })
}
```

## Future Enhancements

- [ ] Collapsible property sections
- [ ] Property search/filter
- [ ] Bulk editing for multi-selection
- [ ] Plugin-defined inspector fields
- [ ] Keyboard navigation within inspector

## Related Documentation

- [Block System](block-system.md) — Block types and schemas
- [Editor](editor.md) — Document model and updates