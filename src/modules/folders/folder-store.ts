import { create } from 'zustand'
import type { Folder } from '@/core/types/domain'
import { folderRepository } from '@/core/repositories'
import {
  commandBus,
  CreateFolderCommand,
  RenameFolderCommand,
  DeleteFolderCommand,
  DuplicateFolderCommand,
  MoveFolderCommand,
} from '@/core/commands'

interface FolderState {
  folders: Folder[];
  isLoading: boolean;
  error: string | null;

  loadFolders: (workspaceId: string) => Promise<void>;
  createFolder: (name: string, workspaceId: string, parentId?: string | null) => Promise<void>;
  renameFolder: (folderId: string, name: string) => Promise<void>;
  deleteFolder: (folderId: string) => Promise<void>;
  duplicateFolder: (folderId: string) => Promise<void>;
  moveFolder: (folderId: string, parentId: string | null) => Promise<void>;
}

export const useFolderStore = create<FolderState>()((set, get) => ({
  folders: [],
  isLoading: false,
  error: null,

  loadFolders: async (workspaceId: string) => {
    set({ isLoading: true, error: null })
    const result = await folderRepository.findByWorkspace(workspaceId)
    if (result.success) {
      set({ folders: result.data, isLoading: false })
    } else {
      set({ error: result.error.message, isLoading: false })
    }
  },

  createFolder: async (name: string, workspaceId: string, parentId?: string | null) => {
    const result = await commandBus.execute(new CreateFolderCommand(), {
      name,
      workspaceId,
      parentId: parentId ?? null,
    })
    if (result.success) {
      const currentFolders = get().folders
      set({ folders: [...currentFolders, result.data.folder] })
    }
  },

  renameFolder: async (folderId: string, name: string) => {
    const result = await commandBus.execute(new RenameFolderCommand(), { folderId, name })
    if (result.success) {
      set({
        folders: get().folders.map((f) => (f.id === folderId ? result.data.folder : f)),
      })
    }
  },

  deleteFolder: async (folderId: string) => {
    const result = await commandBus.execute(new DeleteFolderCommand(), { folderId })
    if (result.success) {
      set({ folders: get().folders.filter((f) => f.id !== folderId) })
    }
  },

  duplicateFolder: async (folderId: string) => {
    const result = await commandBus.execute(new DuplicateFolderCommand(), { folderId })
    if (result.success) {
      set({ folders: [...get().folders, result.data.folder] })
    }
  },

  moveFolder: async (folderId: string, parentId: string | null) => {
    const result = await commandBus.execute(new MoveFolderCommand(), { folderId, parentId })
    if (result.success) {
      set({
        folders: get().folders.map((f) => (f.id === folderId ? result.data.folder : f)),
      })
    }
  },
}))
