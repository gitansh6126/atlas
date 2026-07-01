# Tech Stack

This document explains the technology choices for the Atlas project and the rationale behind them.

---

## Overview

| Category | Technology | Version/Note | Purpose |
|---|---|---|---|
| **Bundler** | Vite | 5.x | Ultra-fast development and optimized production builds |
| **Framework** | React | 18.x | UI rendering |
| **Language** | TypeScript | 5.x | Static typing and developer safety |
| **Styling** | Tailwind CSS | 3.x | Utility-first CSS framework |
| **UI Components** | shadcn/ui | Tailwind v3 | Accessible, unopinionated component primitives |
| **State** | Zustand | 4.x | Lightweight state management |
| **Diagrams** | Mermaid | 10.x | Documentation diagrams |
| **Linting** | ESLint / Prettier | Standard | Code quality and formatting |

---

## Rationale

### Vite

- **Fast cold start**: Atlas has a large number of modules; Vite's native ESM-based dev server keeps startup times low.
- **Optimized builds**: Rollup-powered production builds with tree-shaking and code-splitting out of the box.
- **Plugin ecosystem**: Excellent support for React, TypeScript, and SVG imports.

### React + TypeScript

- **React**: Mature ecosystem, excellent developer tools, and a large pool of contributors familiar with the patterns.
- **TypeScript**: Catches a huge class of runtime errors at compile time. Essential for a complex object model like a document tree.

### Tailwind CSS + shadcn/ui

- **Tailwind**: Rapidly style components without leaving the component file. Keeps CSS bundle size minimal via purging.
- **shadcn/ui**: Provides accessible, unstyled primitives. We own the styling (no heavy opinionated UI library to fight against) and can customize everything via Tailwind.

### Zustand

- **Simplicity**: Far less boilerplate than Redux.
- **Performance**: Extremely lightweight. Fine-grained subscription without selectors or complex reselect logic.
- **Flexibility**: Works well with both transient and persistent state.

### Mermaid

- **Documentation as code**: Diagrams live alongside the documentation in version control.
- **Widely supported**: Rendered natively by GitHub, GitLab, and many other Markdown viewers.

---

## Current Tech Debt / Evaluation

| Technology | Status | Notes |
|---|---|---|
| Zustand | Stable | Evaluating TanStack Store for v2.0, but no urgency |
| Tailwind CSS | Stable | Considering Tailwind v4 once stable |
| React | Stable | Tracking React 19 Concurrency features |
