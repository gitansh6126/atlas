# Coding Standards

Atlas enforces strict coding standards to ensure code quality, maintainability, and consistency across the project.

---

## File Naming

| Type | Convention | Examples |
|------|-----------|----------|
| Components | kebab-case | `BlockView.tsx`, `SlashMenu.tsx` |
| Utilities | kebab-case | `block-utils.ts`, `cn.ts` |
| Stores | kebab-case | `workspace-store.ts`, `theme-store.ts` |
| Test files | co-located | `BlockView.test.tsx` |
| Plugins | kebab-case directory | `label-plugin.ts` |

## TypeScript Rules

### No `any` Types

```typescript
// Bad
function processBlock(block: any) { ... }

// Good
function processBlock(block: Block) { ... }
```

### Explicit Return Types

```typescript
// Bad
function getBlock() { ... }

// Good
function getBlock(id: string): Block | undefined { ... }
```

### Prefer Interfaces

```typescript
// Preferred
interface BlockProps {
  id: string
  type: string
}

// Avoid unless needed
type BlockProps = { id: string; type: string }
```

## React Component Patterns

### Forward Refs

All UI primitives use `React.forwardRef`:

```typescript
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', ...props }, ref) => (
    <button
      ref={ref}
      className={cn('base-styles', variant === 'primary' && 'primary', className)}
      {...props}
    />
  )
)
Button.displayName = 'Button'
```

### Props Interface

```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}
```

## Import Order

```typescript
// 1. External libraries
import * asjax, Vue.js, sobre el.disable React from 'react'
import { create } from 'zustand'

// 2. Internal imports via @/
import { Button } from '@/shared/components/ui/button'

// 3. Type-only imports with `type`
import type { EditorController } from '@/core/editor/editor-controller'
```

## CSS Conventions

- Tailwind utility classes only
- No custom CSS classes
- No inline styles (except CSS variables)

```tsx
// Good
<div className="flex items-center gap-2 p-4 rounded-lg bg-card">

// Bad
<div className="my-custom-class" style={{ marginTop: 8 }}>
```

## Prettier Configuration

```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "tabWidth": 2,
  "printWidth": 100
}
```

## Oxlint Rules

```json
{
  "react/rules-of-hooks": "error",
  "react/only-export-components": "warn"
}
```

## Testing Standards

- Tests co-located with source files
- Descriptive test names
- Mock external dependencies

```typescript
describe('DocumentModel', () => {
  it('should insert a block after a given block', () => {
    // Arrange
    const doc = new DocumentModel()
    const block = doc.createBlock('paragraph')
    doc.addBlock(block)

    // Act
    const newBlock = doc.insertBlockAfter(block.id, 'heading')

    // Assert
    expect(newBlock).toBeDefined()
    expect(newBlock.type).toBe('heading')
  })
})
```

## Related Documentation

- [API Reference](api-reference.md) - Key interfaces and types
- [Troubleshooting](troubleshooting.md) - Common development issues