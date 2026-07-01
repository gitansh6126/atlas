# Troubleshooting

Common issues and solutions when developing with Atlas.

---

## Build Issues

### TypeScript Compilation Fails

**Symptom:** `tsc -b` fails with errors

**Solution:**
1. Run `npm install` to ensure all dependencies are present
2. Check for conflicting TypeScript versions
3. Verify `tsconfig.json` includes all source files
4. Check for circular imports using `madge`

### Vite Build Fails

**Symptom:** `vite build` throws an error

**Solution:**
1. Clear `.vite` cache: `rm -rf node_modules/.vite`
2. Check for import cycles
3. Verify environment variables are defined
4. Check `vite.config.ts` for misconfigurations

## Editor Issues

### Blocks Not Rendering

**Symptom:** Block appears in document but not visually

**Solution:**
1. Check that the block type has a plugin registered
2. Verify the `render()` method in the plugin returns a valid `RenderNode`
3. Confirm the block type is handled in `block-view.tsx`
4. Check browser console for React rendering errors

### Slash Menu Not Appearing

**Symptom:** Typing `/` does not show the slash menu

**Solution:**
1. Verify `SlashMenu.tsx` is imported and used in `EditorView`
2. Check the `slashOpen` state is being set correctly
3. Ensure the slash command regex matches `/` at the start of a paragraph
4. Confirm `controller.getPluginSlashCommands()` returns commands

### Selection Not Updating

**Symptom:** Cursor position or selection does not reflect user input

**Solution:**
1. Check `SelectionManager` is calling `dispatchEvent('selection-change')`
2. Verify the React hook listening to selection changes is subscribed
3. Ensure `contenteditable` events are correctly handled
4. Check that `focusBlock()` is being called with correct parameters

## State Management Issues

### Changes Not Persisting

**Symptom:** Changes disappear after refresh

**Solution:**
1. Check Zustand `persist` middleware is configured
2. Verify the storage key in `name` matches between reads and writes
3. Check browser LocalStorage is not full
4. Ensure `storage` option in persist config is correct

### Store Not Updating

**Symptom:** Component does not re-render when store changes

**Solution:**
1. Use the correct selector: `useStore(state => state.value)`
2. Ensure the store is wrapped in `persist()` if needed
3. Check for equality issues (use `shallow` or custom equality)
4. Verify the action that updates the store is actually being called

## Storage Issues

### Data Not Found

**Symptom:** `findById()` returns null for existing data

**Solution:**
1. Check the ID being queried matches the stored ID exactly
2. Verify the correct storage adapter is being used
3. Check browser DevTools > Application > IndexedDB for data
4. Ensure database version has not caused a schema mismatch

### Migration Failures

**Symptom:** Old data is not accessible after update

**Solution:**
1. Implement a migration in `db.ts` version upgrade
2. Test migrations in an isolated environment first
3. Provide a data export/import path for users

## Style Issues

### Tailwind Classes Not Applied

**Symptom:** Elements appear unstyled

**Solution:**
1. Ensure `globals.css` is imported in `main.tsx`
2. Check `tailwind.config.js` includes all source paths
3. Verify classes are not being purged in production
4. Check for typos in class names

### Dark Mode Not Working

**Symptom:** Dark mode classes have no effect

**Solution:**
1. Confirm `dark` class is on the `<html>` element
2. Check CSS variables are defined for both modes in `globals.css`
3. Verify `darkMode: 'class'` is set in `tailwind.config.js`

## Performance Issues

### Slow Rendering

**Symptom:** UI lags when typing or navigating

**Solution:**
1. Wrap expensive components with `React.memo`
2. Use `useMemo` for derived state
3. Implement virtualization for long block lists
4. Debounce frequent operations (autosave, search)

### Memory Leaks

**Symptom:** Memory usage grows over time

**Solution:**
1. Ensure `useEffect` cleanup functions remove listeners
2. Dispose of Web Workers when not needed
3. Avoid storing large objects in React state
4. Use `WeakMap` for caches where possible

## Related Documentation

- [Coding Standards](coding-standards.md) - Code quality guidelines
- [Performance](performance.md) - Optimization strategies
- [Roadmap](roadmap.md) - Known limitations