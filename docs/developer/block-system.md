# Block System

The Block System defines how content is structured, validated, and rendered in Atlas. It is the heart of the extensibility model.

---

## Block Schema

Every block type in Atlas must conform to a schema that defines its properties and allowed child block types.

```ts
interface BlockSchema {
  type: BlockType;
  properties: Record<string, SchemaProperty>;
  allowedChildren?: BlockType[];
  isLeaf?: boolean;
}

interface SchemaProperty {
  type: "string" | "number" | "boolean" | "array" | "object";
  default?: unknown;
  required?: boolean;
}
```

### Example: Heading Block Schema

```ts
const headingSchema: BlockSchema = {
  type: "heading",
  properties: {
    level: { type: "number", default: 1, required: true },
    text: { type: "string", default: "", required: true },
    alignment: { type: "string", default: "left" },
  },
  allowedChildren: [],
  isLeaf: true,
};
```

---

## Block Types

| Type | Description | Children Allowed |
|---|---|---|
| `paragraph` | Plain text with inline formatting | No |
| `heading` | H1-H6 heading | No |
| `divider` | Horizontal rule | No |
| `grid` | Responsive grid container | Yes |
| `list` | Ordered / unordered list | Yes |
| `card` | Card container with a title and body | Yes |
| `gallery` | Image gallery grid | No |
| `kanban` | Kanban board | Yes (columns) |
| `calendar` | Date-based block | No |
| `label` | Colored label/pill | No |
| `tag` | Removable tag chip | No |
| `html_embed` | Raw HTML embed | No |

---

## Block Factory

Blocks are never instantiated directly. Instead, the `BlockFactory` creates them based on a type string.

```ts
const block = BlockFactory.create("heading", { level: 2, text: "Hello World" });
```

The factory:
1. Looks up the registered `BlockSchema` for the type.
2. Merges provided properties with `default` values.
3. Validates required properties.
4. Returns a fully formed `BlockNode`.

---

## Plugin Registration

New block types are registered via plugins.

```ts
const myBlockPlugin = {
  type: "custom-chart",
  schema: chartSchema,
  component: ChartComponent,
};

editor.registerPlugin(myBlockPlugin);
```

Plugins can also provide:
- **Renderer**: A React component to render the block in the main surface.
- **Toolbar Controls**: Custom controls that appear when the block is focused.
- **Serialization**: Custom `toJSON` and `fromJSON` hooks.

---

## Rendering

Each block type maps to a React component in the UI layer. The Core does not know about React; the mapping happens in `src/modules/editor-surface/BlockRenderer.tsx`.

```tsx
const BlockComponent = blockComponentMap[block.type] ?? FallbackBlock;
return <BlockComponent node={block} editor={editor} />;
```

See [Rendering Pipeline](rendering.md) for the full flow.
