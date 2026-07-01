# Labels & Tags

Labels and tags help you categorize and highlight content inside container blocks like cards, grids, and lists.

## Label

A **label** is a small inline badge with preset styling variations.

### Variants

| Variant | Appearance | Best Used For |
|---------|-----------|---------------|
| **default** | Solid filled | General status |
| **secondary** | Lighter fill | Secondary info |
| **outline** | Bordered only | Subtle marking |
| **destructive** | Red-hued | Warnings, errors |

### How to Add a Label

1. Type `/label` in a block
2. Choose the **Label** block
3. Enter your text (e.g., `Draft`, `Approved`)
4. Select the desired variant from the toolbar

### Example

```
Status: [Draft] -- label with outline variant
Priority: [High] -- label with destructive variant
```

---

## Tag

A **tag** is a colored pill with a custom hex color.

### How to Add a Tag

1. Type `/tag` in a block
2. Choose the **Tag** block
3. Enter your tag text (e.g., `Design`)
4. Pick or type a **hex color** (e.g., `#3B82F6`)
5. The text color is automatically adjusted for contrast

### Example

| Tag | Color |
|-----|-------|
| `#Design` | `#3B82F6` (blue) |
| `#Urgent` | `#EF4444` (red) |
| `#Research` | `#10B981` (green) |

---

## Best Practices

- 🏷️ Use **labels** for fixed statuses (e.g., `Done`, `In Progress`)
- 🏷️ Use **tags** for flexible categories (e.g., `#UX`, `#Backend`)
- 🏷️ Keep tag colors consistent across your workspace for easy scanning

---

> 🔗 Tags and labels work inside container blocks like cards, grids, and kanbans.
