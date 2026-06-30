# Editor Core

The editor is the heart of Atlas. This module provides a framework-agnostic editing engine that can render any content type through the plugin system.

## Future Responsibility
- Document model and data structure
- Cursor management and selection
- Input handling (keyboard, mouse, composition)
- Rendering pipeline (virtual DOM → actual DOM)
- Plugin orchestration (coordinating content type plugins)
- History integration (undo/redo boundaries)
- Serialization bridge (convert document ↔ storage format)

## Design Goals
- Zero dependency on any specific UI framework
- Framework adapters live outside this module
- All content types are plugins — nothing is hardcoded
- The editor must support offline-first with optimistic updates
- Selection and cursor must work correctly across all content types

## Implementation Order
1. Document model (`Document`, `Block`, `Inline` node types)
2. Selection and cursor engine
3. Plugin registry and lifecycle
4. Rendering pipeline (render blocks to React components)
5. Input handling (typing, delete, enter, paste)
6. History integration

## Never
- Import React or any UI framework directly
- Handle storage, sync, or network concerns
- Know about themes or styling
- Use browser-specific APIs without abstractions
