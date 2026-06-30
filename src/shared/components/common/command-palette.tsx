import { useEffect, useState, useMemo } from 'react'
import { Search, FileText, Folder, Plus } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { Input } from '@/shared/components/ui/input'
import { usePageStore } from '@/modules/pages/page-store'
import { useFolderStore } from '@/modules/folders/folder-store'
import { useWorkspaceStore } from '@/modules/workspace/workspace-store'
import { cn } from '@/shared/utils/cn'

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ResultItem {
  id: string;
  type: 'page' | 'folder' | 'action';
  label: string;
  icon: React.ReactNode;
  onSelect: () => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)

  const pages = usePageStore((s) => s.pages)
  const folders = useFolderStore((s) => s.folders)
  const setSelectedPage = useWorkspaceStore((s) => s.setSelectedPage)
  const createPage = usePageStore((s) => s.createPage)
  const loadPages = usePageStore((s) => s.loadPages)
  const createFolder = useFolderStore((s) => s.createFolder)
  const loadFolders = useFolderStore((s) => s.loadFolders)
  const currentWorkspaceId = useWorkspaceStore((s) => s.currentWorkspaceId)

  useEffect(() => {
    if (!open) {
      setQuery('')
      setSelectedIndex(0)
    }
  }, [open])

  const results = useMemo(() => {
    const items: ResultItem[] = []
    const lower = query.toLowerCase()

    if (!lower) return items

    const matchingPages = pages.filter(
      (p) =>
        p.workspaceId === currentWorkspaceId &&
        p.deletedAt === null &&
        p.title.toLowerCase().includes(lower),
    )

    for (const page of matchingPages) {
      items.push({
        id: page.id,
        type: 'page',
        label: page.title,
        icon: <FileText className="h-4 w-4" />,
        onSelect: () => {
          setSelectedPage(page.id)
          onOpenChange(false)
        },
      })
    }

    const matchingFolders = folders.filter(
      (f) =>
        f.workspaceId === currentWorkspaceId &&
        f.deletedAt === null &&
        f.name.toLowerCase().includes(lower),
    )

    for (const folder of matchingFolders) {
      items.push({
        id: folder.id,
        type: 'folder',
        label: folder.name,
        icon: <Folder className="h-4 w-4" />,
        onSelect: () => {
          onOpenChange(false)
        },
      })
    }

    if (items.length === 0) {
      items.push({
        id: 'create-page',
        type: 'action',
        label: `Create page "${query}"`,
        icon: <Plus className="h-4 w-4" />,
        onSelect: async () => {
          if (currentWorkspaceId) {
            await createPage(query, currentWorkspaceId)
            await loadPages(currentWorkspaceId)
            onOpenChange(false)
          }
        },
      })
      items.push({
        id: 'create-folder',
        type: 'action',
        label: `Create folder "${query}"`,
        icon: <Folder className="h-4 w-4" />,
        onSelect: async () => {
          if (currentWorkspaceId) {
            await createFolder(query, currentWorkspaceId)
            await loadFolders(currentWorkspaceId)
            onOpenChange(false)
          }
        },
      })
    }

    return items.slice(0, 10)
  }, [query, pages, folders, currentWorkspaceId, setSelectedPage, onOpenChange, createPage, loadPages, createFolder, loadFolders])

  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="top-[15%] translate-y-0 sm:max-w-[550px]">
        <DialogHeader className="sr-only">
          <DialogTitle>Command Palette</DialogTitle>
          <DialogDescription>Search and run commands</DialogDescription>
        </DialogHeader>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') {
                e.preventDefault()
                setSelectedIndex((i) => Math.min(i + 1, results.length - 1))
              } else if (e.key === 'ArrowUp') {
                e.preventDefault()
                setSelectedIndex((i) => Math.max(i - 1, 0))
              } else if (e.key === 'Enter' && results[selectedIndex]) {
                results[selectedIndex].onSelect()
              }
            }}
            placeholder="Search pages, folders, or type a command..."
            className="h-11 border-none pl-9 pr-4 text-base shadow-none focus-visible:ring-0"
            autoFocus
          />
        </div>
        {query && results.length > 0 && (
          <div className="max-h-[300px] overflow-y-auto border-t">
            {results.map((item, index) => (
              <button
                key={item.id}
                className={cn(
                  'flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition-colors',
                  index === selectedIndex && 'bg-accent text-accent-foreground',
                )}
                onClick={item.onSelect}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <span className="text-muted-foreground">{item.icon}</span>
                <span className="flex-1 truncate">{item.label}</span>
                <span className="text-xs text-muted-foreground capitalize">{item.type}</span>
              </button>
            ))}
          </div>
        )}
        {query && results.length === 0 ? (
          <div className="flex items-center justify-center border-t py-8">
            <p className="text-sm text-muted-foreground">
              No results for &ldquo;{query}&rdquo;
            </p>
          </div>
        ) : !query ? (
          <div className="flex items-center justify-center border-t pb-2 pt-6">
            <p className="text-sm text-muted-foreground">
              Start typing to search or press{' '}
              <kbd className="rounded border bg-muted px-1.5 py-0.5 text-xs font-medium">Esc</kbd>{' '}
              to close
            </p>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
