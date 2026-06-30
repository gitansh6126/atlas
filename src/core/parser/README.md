# Parser Core

Parses external formats (Markdown, HTML, plain text) into Atlas's internal document model.

## Future Responsibility
- Markdown parser (CommonMark spec compliance)
- HTML parser (Paste from web browsers)
- Plain text parser (line-based conversion)
- Extensible parser pipeline (plugins register their own parsers)
- Paste handling (detect format, parse, insert)
- Import pipeline (file → parser → document)

## Design Goals
- All parsers output the same internal document model
- Parsing is lossless where possible (round-trip through serializer)
- Parse errors are graceful (partial result with warnings)
- Paste from Notion, Google Docs, MS Word should work

## Implementation Order
1. Plain text parser
2. Markdown parser (basic blocks)
3. HTML parser (paste support)
4. Markdown parser (full CommonMark)
5. Plugin parser integration

## Never
- Handle UI or rendering
- Access storage or network
- Know about editor state
