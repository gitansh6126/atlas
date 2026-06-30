# Commands Core

A command registry implementing the command pattern. Every user action in Atlas — formatting text, creating pages, toggling sidebar — is a command.

## Future Responsibility
- Central command registry (all actions registered in one place)
- Command execution pipeline (before/after hooks, validation)
- Keyboard shortcut binding (map shortcuts to commands)
- Context-aware command availability (is the command valid right now?)
- Command composition (macros, sequences)
- Menu integration (generate menu items from commands)

## Design Goals
- UI never calls functions directly — it dispatches commands
- Commands are serializable (enables history, sync, macros)
- A command must declare: id, label, shortcut, execute, validate
- Commands are discoverable (command palette shows all commands)

## Implementation Order
1. Command interface and registry
2. Basic command execution
3. Keyboard shortcut binding
4. Context validation

## Never
- Import UI components
- Handle rendering
- Know about specific page content
