# Storage Core

Storage abstracts all data persistence behind a unified interface. No module should ever access localStorage, IndexedDB, or any database directly.

## Future Responsibility
- `StorageProvider` interface (the contract every backend must implement)
- Local storage adapters (IndexedDB via Dexie, localStorage fallback)
- Remote storage adapters (Supabase, custom API, GitHub)
- Migration system (schema versioning and data migration)
- Cache layer (in-memory cache with invalidation)
- Transaction support (atomic batch operations)
- Query interface (filter, sort, pagination)

## Design Goals
- Modules call `storage.pages.getById(id)` — they never know the backend
- Switching from IndexedDB to Supabase requires zero module changes
- All storage errors are typed and predictable
- Migration must be backward-compatible

## Implementation Order
1. `StorageProvider` interface
2. In-memory provider (for testing and development)
3. IndexedDB provider via Dexie
4. Migration system
5. Cache layer

## Never
- Import any module or plugin
- Handle UI or rendering concerns
- Know about editor document model structure
