# Export Core

Handles exporting Atlas content to various output formats (PDF, HTML, Markdown files, images).

## Future Responsibility
- Export pipeline (select pages → choose format → generate output)
- PDF export (print-styled PDF with table of contents)
- Single HTML export (self-contained HTML with styles)
- Markdown bundle export (ZIP of .md files with assets)
- Image export (screenshot of page or block)
- Batch export (multi-page or entire workspace)
- Export templates (customizable output styling)

## Design Goals
- Export should produce beautiful, print-ready output
- Styling in export is independent of editor styling
- Export is async and cancellable for large documents

## Implementation Order
1. HTML export (basic)
2. Markdown export
3. PDF export
4. Batch export

## Never
- Import UI components
- Know about editor state
- Block the main thread
