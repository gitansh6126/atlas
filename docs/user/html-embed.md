# HTML Embed

The **HTML Embed** block is one of the most powerful features in Atlas. It lets you bring in custom **HTML**, **CSS**, and even uploaded files — perfect for widgets, styled snippets, charts, and more.

## How to Add an HTML Embed Block

1. Type `/html` or `/embed` on a new line
2. Select **HTML Embed** from the menu
3. The block appears with tabs at the top

---

## Editing HTML & CSS

Each HTML Embed block has four tabs:

| Tab | What You Can Do |
|-----|-----------------|
| **Preview** | See a live rendered view of your HTML + CSS |
| **HTML** | Edit the raw HTML code |
| **CSS** | Add or edit custom styles |
| **Files** | Manage uploaded files |

Click the tabs to switch between them.

---

## Uploading Files

You can upload `.html`, `.css`, and `.txt` files directly into an HTML embed block:

### Drag & Drop

1. Find the file on your computer
2. Drag it over the HTML embed block
3. Drop it — Atlas will ingest the file

### Click to Upload

1. Click inside the HTML embed block
2. Select **Upload File** from the toolbar or prompt
3. Choose your `.html`, `.css`, or `.txt` file

---

## Example: Custom Styled Box

**HTML Tab:**

```html
<div class="my-box">
  <h2>Hello Atlas!</h2>
  <p>This is a custom embed.</p>
</div>
```

**CSS Tab:**

```css
.my-box {
  background: #e0f2fe;
  border-left: 4px solid #0284c7;
  padding: 1rem;
  border-radius: 8px;
}
```

**Preview Tab:**

Shows a light blue box with a blue left border and padded text.

---

## Use Cases

- 📊 Embedding charts or data visualizations
- 🎨 Custom styled callout boxes
- 📋 Interactive forms or widgets
- 📖 Importing exported HTML content from other tools

---

> ⚠️ **Security Note**: HTML embeds run locally. Be cautious when pasting code from untrusted sources.
