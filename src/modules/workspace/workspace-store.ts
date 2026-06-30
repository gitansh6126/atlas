import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Workspace, Folder, Page } from '@/shared/types'

interface WorkspaceState {
  workspaces: Workspace[];
  folders: Folder[];
  pages: Page[];
  currentWorkspaceId: string | null;
  selectedPageId: string | null;

  setCurrentWorkspace: (id: string) => void;
  setSelectedPage: (id: string | null) => void;
  addWorkspace: (workspace: Workspace) => void;
  addFolder: (folder: Folder) => void;
  addPage: (page: Page) => void;
  toggleFavorite: (pageId: string) => void;
  getCurrentWorkspace: () => Workspace | undefined;
  getCurrentWorkspaceFolders: () => Folder[];
  getCurrentWorkspacePages: () => Page[];
  getFavoritePages: () => Page[];
  getRecentPages: () => Page[];
}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set, get) => ({
      workspaces: [
        {
          id: 'default',
          name: 'My Workspace',
          icon: 'LayoutGrid',
          createdAt: Date.now(),
        },
      ],
      folders: [],
      pages: [],
      currentWorkspaceId: 'default',
      selectedPageId: null,

      setCurrentWorkspace: (id) => set({ currentWorkspaceId: id }),

      setSelectedPage: (id) => {
        set({ selectedPageId: id })
        if (id) {
          set((state) => ({
            pages: state.pages.map((p) =>
              p.id === id ? { ...p, lastOpened: Date.now() } : p,
            ),
          }))
        }
      },

      addWorkspace: (workspace) =>
        set((state) => ({ workspaces: [...state.workspaces, workspace] })),

      addFolder: (folder) => set((state) => ({ folders: [...state.folders, folder] })),

      addPage: (page) => set((state) => ({ pages: [...state.pages, page] })),

      toggleFavorite: (pageId) =>
        set((state) => ({
          pages: state.pages.map((p) =>
            p.id === pageId ? { ...p, isFavorite: !p.isFavorite } : p,
          ),
        })),

      getCurrentWorkspace: () => {
        const state = get()
        return state.workspaces.find((w) => w.id === state.currentWorkspaceId)
      },

      getCurrentWorkspaceFolders: () => {
        const state = get()
        return state.folders.filter((f) => f.workspaceId === state.currentWorkspaceId)
      },

      getCurrentWorkspacePages: () => {
        const state = get()
        return state.pages.filter((p) => p.workspaceId === state.currentWorkspaceId)
      },

      getFavoritePages: () => {
        const state = get()
        return state.pages.filter(
          (p) => p.workspaceId === state.currentWorkspaceId && p.isFavorite,
        )
      },

      getRecentPages: () => {
        const state = get()
        return state.pages
          .filter((p) => p.workspaceId === state.currentWorkspaceId)
          .sort((a, b) => b.lastOpened - a.lastOpened)
          .slice(0, 5)
      },
    }),
    { name: 'atlas-workspace' },
  ),
)
