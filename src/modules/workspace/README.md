# Workspace Module

Manages workspaces — the top-level organizational unit in Atlas. A workspace contains folders and pages.

## Responsibility
- Workspace CRUD (create, rename, delete)
- Active workspace selection
- Workspace-level settings and metadata
- Workspace import/export (future)
- Workspace-level sync configuration (future)

## Current Status (Phase 1)
- Workspace data model (types)
- Workspace switcher UI
- Welcome screen showing current workspace name
- Store with localStorage persistence

## Never
- Import editor or plugin modules
- Handle page or folder content directly
