# Serializer Core

Serializes Atlas's internal document model into external formats (Markdown, HTML, JSON) for export, copy, and sync.

## Future Responsibility
- Markdown serializer (export pages as .md files)
- HTML serializer (copy as HTML for paste into other apps)
- JSON serializer (internal format for storage and sync)
- Plain text serializer (for search indexing)
- Plugin integration (each plugin knows how to serialize its blocks)
- Export pipeline (document → serializer → file download)

## Design Goals
- Serialization is the inverse of parsing (round-trip fidelity)
- Format-specific options (e.g., whether to include IDs in Markdown)
- All serializers iterate the same document model
- Plugins register their own serialization rules

## Implementation Order
1. JSON serializer (needed for storage)
2. Plain text serializer (needed for search)
3. Markdown serializer
4. HTML serializer (for copy/paste)

## Never
- Handle UI or rendering
- Access storage or network
- Know about editor state
