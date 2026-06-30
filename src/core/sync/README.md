# Sync Core

Synchronizes data between local storage and remote backends. Implements conflict resolution and offline queue.

## Future Responsibility
- Sync engine (bidirectional sync between local and remote)
- Conflict resolution strategies (last-write-wins, merge, manual)
- Offline change queue (queue mutations made offline)
- Connection state management (online/offline detection)
- Change tracking (track what changed since last sync)
- Authentication integration (tokens, refresh)
- WebSocket or polling for real-time updates

## Design Goals
- Offline-first: everything works offline, sync happens transparently
- Conflicts must never cause data loss
- Sync is observable — UI can show sync status
- Plugins can register conflict resolvers for their data

## Implementation Order
1. Change tracking system
2. Offline queue
3. Sync engine with basic last-write-wins
4. Connection state management
5. Conflict resolution UI

## Never
- Import UI components
- Know about editor document structure
- Block user interactions during sync
