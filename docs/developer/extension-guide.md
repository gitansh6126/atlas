# Extension Guide

This guide explains how to extend Atlas with custom blocks, plugins, and integrations.

---

## Creating a Custom Block

### Step 1: Define the Block Type

```typescript
// src/core/types/blocks.ts
export interface MyCustomBlock extends Block {
  type: 'custom_block'
  content: {
    title: string
    value: number
    items: string[]
  }
}
```

### Step 2: Create a Plugin

```typescript
// src/plugins/custom-block/index.ts
import type { BlockPlugin } from '@/core/editor/plugin-registry'

export const customBlockPlugin: BlockPlugin = {
  type: 'custom_block',
  name: 'Custom Block',
  version: '1.0.0',
  render: (block) => ({
    blockId: block.id,
    type: block.type,
    depth: 0,
    props: {
      title: block.content?.title ?? '',
      value: block.content?.value ?? 0,
      items: block.content?.items ?? []
    },
    children: []
  })
}
```

### Step 3: Create the React Component

```typescript
// src/plugins/custom-block/CustomBlock.tsx
import { cn } from '@/shared/utils/cn'

export function CustomBlock({ node, isSelected }) {
  const { title, value, items } = node.props

  return (
    <div className={cn('p-4 border rounded', isSelected && 'ring-2')}>
      <h4>{title}</h4>
      <p>Value: {value}</p>
      <ul>
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </div>
  )
}
```

### Step 4: Register in BlockView

```typescript
// src/modules/editor/block-view.tsx
import { CustomBlock } from '@/plugins/custom-block/CustomBlock'

case 'custom_block':
  return (
    <CustomBlock
      node={node}
      isSelected={isSelected}
      selectedBlockIds={selectedBlockIds}
    />
  )
```

### Step 5: Register the Plugin

```typescript
// src/modules/editor/editor-controller.ts
import { customBlockPlugin } from '@/plugins/custom-block'

registry.register(customBlockPlugin)
```

## Plugin SDK (Future)

In the future, Atlas will support third-party plugins via:

```typescript
// my-plugin.ts
import { definePlugin } from '@atlas/sdk'

export default definePlugin({
  name: 'My Plugin',
  version: '1.0.0',
  blocks: [customBlockPlugin],
  commands: [myCustomCommand],
  hooks: {
    onDocumentOpen: (doc) => console.log('Document opened:', doc)
  }
})
```

## Best Practices

1. Keep plugins self-contained
2. Version your plugins independently
3. Use the provided APIs, never access internals directly
4. Handle errors gracefully
5. Test with large documents

## Related Documentation

- [Block System](block-system.md) - Block types and schema
- [API Reference](api-reference.md) - Available interfaces