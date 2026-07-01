# Core Editor

This document details the central editing engine: the document model, block tree, selection management, and event system.

---

## Editor Instance

The `Editor` is the primary orchestrator of the editing experience. It manages the document model, executes commands, and dispatches events.

```ts
const editor = createEditor({
  initialState: defaultDocument,
  plugins: [paragraphPlugin, headingPlugin],
  storageAdapter: newLocalStorageAdapter("atlas-doc"),
});
```

The editor itself is a plain class/object in `src/core/editor.ts` and does not know about React. UI components consume it via a Zustand store (see [State Management](state-management.md)).

---

## Document Model

The document is represented as an `AtlasDocument`, a tree of `BlockNode` objects.

```ts
interface AtlasDocument {
  id: string;
  type: "document";
  properties: Record<string, unknown>;
  children: BlockNode[];
}

interface BlockNode {
  id: string;
  type: BlockType;
  properties: Record<string, unknown>;
  children?: BlockNode[]; // Optional nested tree (e.g., lists, grids)
}
```

### Immutability

All mutations to the document model produce a new object graph. The Core never mutates nodes in place. This enables cheap snapshotting, history, and predictable change detection.

```
Before: { id: "a", type: "paragraph", children: [...] }
After:  { id: "a", type: "paragraph", children: [<NEW>] } // new reference
```

---

## Block Tree

The block tree is a recursive structure. A block is a node; some blocks can contain other blocks.

### Supported Block Types

| Type | Can Have Children |
|---|---|---|
| `paragraph` | No |
| `heading` | No |
| `divider` | No |
| `grid` | Yes |
| `list` | Yes |
| `card` | Yes |
| `gallery` | No (items are properties) |
| `kanban` | Yes (columns -> cards) |
| `calendar` | No |
| `label` | No |
| `tag` | No |
| `html_embed` | No |

---

## Selection Manager

`SelectionManager` tracks the user's current selection within the document, which can range from a single cursor position to multiple blocks.

```ts
interface Selection {
  anchorId: string;
  focusId: string;
  anchorOffset: number;
  focusOffset: number;
  isCollapsed: boolean;
}
```

The Selection Manager also handles:

- **Normalization**: Ensures selection boundaries are valid after document mutations.
- **Navigation**: Moving the cursor up/down/left/right across arbitrary block structures.
- **Serialization**: Saving and restoring selections for undo/redo.

---

## Event System

The editor uses a simple pub/sub pattern for internal communication.

```ts
editor.on("change", (event) => {
  console.log("Document changed", event.transaction);
});

editor.on("selectionChange", (event) => {
  console.log("Selection moved", event.selection);
});
```

### Key Events

| Event | Payload | Description |
|---|---|---|
| `change` | `{ transaction: Transaction, document: AtlasDocument }` | Document was modified |
| `selectionChange` | `{ selection: Selection }` | Cursor or selection changed |
| `blockAdded` | `{ blockId: string }` | A block was inserted |
| `blockRemoved` | `{ blockId: string }` | A block was deleted |

---

## Render Tree

While the **Document Model** is the raw data tree, a separate lightweight **Render Tree** is used for UI rendering. It flattens the recursive block tree into an array of renderable items for efficient React rendering.

```ts
type RenderNode = {
  id: string;
  type: BlockType;
  level: number; // Nesting depth
  isLeaf: boolean;
};
```

See [Rendering Pipeline](rendering.md) for more details.
