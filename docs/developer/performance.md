# Performance Considerations

Atlas is designed to remain responsive even with large documents, numerous workspaces, and extensive media libraries.

---

## Performance Targets

| Metric | Target |
|--------|--------|
| Time to first paint | < 1.5s |
| First contentful paint | < 2.0s |
| Document load (10,000 pages) | < 500ms |
| Block render (1,000 blocks) | < 16ms per frame |
| Search query (100,000 blocks) | < 100ms |
| Editor input latency | < 8ms |

## Virtualization

### Block List Virtualization

```typescript
// Virtual rendering for large documents
function VirtualBlockList() {
  const { visibleRange, ref } = useVirtualList({
    itemCount: blocks.length,
    itemHeight: 48,
    overscan: 5,
  })

  return (
    <div ref={ref}>
      {visibleRange.map((index) => (
        <BlockView key={blocks Birthdays[index].id} index={index} />
      ))}
    </div>
  )
}
```

## Memoization Strategy

All heavy calculations and components are memoized:

```typescript
// Memoize block rendering
const BlockRenderer = React.memo(function BlockRenderer({
  node,
  selectedBlockIds,
  controller
}: BlockRendererProps) {
  // Only re-render if props change
  return <BlockView node={node} ... />
})
```

## Lazy Loading

```typescript
// Lazy load heavy components
const HtmlEmbedBlock = lazy(() =>
  import('./html-embed-block').then(m => ({ default: m.HtmlEmbedBlock }))
)
```

## Debouncing

User input and expensive operations are debounced:

```typescript
// Autosave after user stops typing
const autosave = useMemo(() =>
  debounce((document: Document) => {
    storageProvider.saveDocument(document)
  }, 1500),
  []
)
```

## Asset Optimization

- Images: lazy loading with blur-up placeholder
- Icons: tree-shaken Lucide React imports
- Fonts: system font stack (no custom fonts)
- Code splitting: per-route and per-block-type

## Memory Management

- Dispose of Web Workers when not needed
- Clear event listeners on component unmount
- Use weak references for caches where possible

## Benchmarking

```bash
# Run performance tests
npm run perf

# Profile specific operations
npm run perf:search
npm run perf:render
```

## Bottlenecks to Watch

1. **Large documents** — use virtualization
2. **Frequent updates** — batch operations, use immutability
3. **Many selections** — use Set for O(1) lookup
4. **Deep nesting** — flatten where possible
5. **Plugin load time** — lazy load non-critical plugins

## Related Documentation

- [Rendering](rendering.md) — Rendering pipeline and optimization
- [State Management](state-management.md) — Efficient state updates