import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Workspace } from '@/core/types/domain'
import { workspaceRepository } from '@/core/repositories'
import {
  commandBus,
  CreateWorkspaceCommand,
  RenameWorkspaceCommand,
  DeleteWorkspaceCommand,
  DuplicateWorkspaceCommand,
} from '@/core/commands'

interface WorkspaceState {
  workspaces: Workspace[];
  currentWorkspaceId: string | null;
  selectedPageId: string | null;
  isLoading: boolean;
  error: string | null;

  loadWorkspaces: () => Promise<void>;
  setCurrentWorkspace: (id: string) => void;
  setSelectedPage: (id: string | null) => void;
  createWorkspace: (name: string) => Promise<void>;
  renameWorkspace: (id: string, name: string) => Promise<void>;
  deleteWorkspace: (id: string) => Promise<void>;
  duplicateWorkspace: (id: string) => Promise<void>;
  getCurrentWorkspace: () => Workspace | undefined;
}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set, get) => ({
      workspaces: [],
      currentWorkspaceId: null,
      selectedPageId: null,
      isLoading: false,
      error: null,

      loadWorkspaces: async () => {
        set({ isLoading: true, error: null })
        const result = await workspaceRepository.findAllActive()
        if (result.success) {
          const workspaces = result.data
          set((state) => ({
            workspaces,
            isLoading: false,
            currentWorkspaceId: state.currentWorkspaceId ?? workspaces[0]?.id ?? null,
          }))
        } else {
          set({ error: result.error.message, isLoading: false })
        }
      },

      setCurrentWorkspace: (id) => set({ currentWorkspaceId: id }),

      setSelectedPage: (id) => {
        set({ selectedPageId: id })
      },

      createWorkspace: async (name: string) => {
        const result = await commandBus.execute(new CreateWorkspaceCommand(), { name })
        if (result.success) {
          set((state) => ({
            workspaces: [...state.workspaces, result.data.workspace],
            currentWorkspaceId: result.data.workspace.id,
          }))
        }
      },

      renameWorkspace: async (id: string, name: string) => {
        const result = await commandBus.execute(new RenameWorkspaceCommand(), { workspaceId: id, name })
        if (result.success) {
          set((state) => ({
            workspaces: state.workspaces.map((w) => (w.id === id ? result.data.workspace : w)),
          }))
        }
      },

      deleteWorkspace: async (id: string) => {
        const result = await commandBus.execute(new DeleteWorkspaceCommand(), { workspaceId: id })
        if (result.success) {
          set((state) => ({
            workspaces: state.workspaces.filter((w) => w.id !== id),
            currentWorkspaceId:
              state.currentWorkspaceId === id
                ? state.workspaces.find((w) => w.id !== id)?.id ?? null
                : state.currentWorkspaceId,
          }))
        }
      },

      duplicateWorkspace: async (id: string) => {
        const result = await commandBus.execute(new DuplicateWorkspaceCommand(), { workspaceId: id })
        if (result.success) {
          set((state) => ({
            workspaces: [...state.workspaces, result.data.workspace],
          }))
        }
      },

      getCurrentWorkspace: () => {
        const state = get()
        return state.workspaces.find((w) => w.id === state.currentWorkspaceId)
      },
    }),
    {
      name: 'atlas-workspace',
      partialize: (state) => ({
        currentWorkspaceId: state.currentWorkspaceId,
        selectedPageId: state.selectedPageId,
      }),
    },
  ),
)
