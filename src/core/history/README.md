# History Core

Provides undo/redo functionality for the editor and workspace actions. Uses a command-based history stack.

## Future Responsibility
- Undo/redo stack management
- Command pattern integration (each action records its inverse)
- Merge policies (coalesce adjacent typing into single undo step)
- Stack limits and memory management
- Collaborative undo awareness (future)
- Persistence of undo history across sessions (future)

## Design Goals
- History must not leak memory (bounded stack)
- Typing undo must feel natural (character grouping, not per-key)
- Every mutation must go through command → history pipeline

## Implementation Order
1. History stack (simple array with pointer)
2. Command interface (execute + undo methods)
3. Typing merge policy
4. Bounded stack with configurable limit

## Never
- Directly mutate state
- Know about UI components
- Handle storage or sync
