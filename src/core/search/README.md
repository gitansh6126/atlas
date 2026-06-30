# Search Core

Full-text search engine for pages and content. Operates entirely client-side with optional remote search.

## Future Responsibility
- Full-text search index (client-side)
- Search query parser (filters, operators)
- Ranking and relevance scoring
- Fuzzy matching and typo tolerance
- Highlighting matches in results
- Search provider interface (local index, remote API, hybrid)
- Index persistence to IndexedDB

## Design Goals
- Search must feel instant (< 100ms for local queries)
- Index is built incrementally, not rebuilt from scratch
- Search results must be ordered by relevance
- Plugins can provide custom search indexing for their content

## Implementation Order
1. Search index (in-memory inverted index)
2. Query parser and matcher
3. Ranking algorithm
4. Index persistence
5. UI integration bridge

## Never
- Import UI components
- Block the main thread during indexing
