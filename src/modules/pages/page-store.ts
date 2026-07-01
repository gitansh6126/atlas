import { create } from 'zustand'
import type { Page } from '@/core/types/domain'
import { pageRepository } from '@/core/repositories'
import {
  commandBus,
  CreatePageCommand,
  RenamePageCommand,
  DeletePageCommand,
  ToggleFavoriteCommand,
  DuplicatePageCommand,
  MovePageCommand,
  PinPageCommand,
} from '@/core/commands'

interface PageState {
  pages: Page[];
  isLoading: boolean;
  error: string | null;

  loadPages: (workspaceId: string) => Promise<void>;
  createPage: (title: string, workspaceId: string, folderId?: string | null) => Promise<Page | null>;
  renamePage: (pageId: string, title: string) => Promise<void>;
  deletePage: (pageId: string) => Promise<void>;
  toggleFavorite: (pageId: string) => Promise<void>;
  duplicatePage: (pageId: string) => Promise<void>;
  movePage: (pageId: string, folderId: string | null) => Promise<void>;
  togglePin: (pageId: string) => Promise<void>;
}

export const usePageStore = create<PageState>()((set, get) => ({
  pages: [],
  isLoading: false,
  error: null,

  loadPages: async (workspaceId: string) => {
    set({ isLoading: true, error: null })
    const result = await pageRepository.findByWorkspace(workspaceId)
    if (result.success) {
      set({ pages: result.data, isLoading: false })
    } else {
      set({ error: result.error.message, isLoading: false })
    }
  },

  createPage: async (title: string, workspaceId: string, folderId?: string | null) => {
    const result = await commandBus.execute(new CreatePageCommand(), {
      title,
      workspaceId,
      folderId: folderId ?? null,
    })
    if (result.success) {
      set({ pages: [...get().pages, result.data.page] })
    }
    return result.success ? result.data.page : null
  },

  renamePage: async (pageId: string, title: string) => {
    const result = await commandBus.execute(new RenamePageCommand(), { pageId, title })
    if (result.success) {
      set({
        pages: get().pages.map((p) => (p.id === pageId ? result.data.page : p)),
      })
    }
  },

  deletePage: async (pageId: string) => {
    const result = await commandBus.execute(new DeletePageCommand(), { pageId })
    if (result.success) {
      set({ pages: get().pages.filter((p) => p.id !== pageId) })
    }
  },

  toggleFavorite: async (pageId: string) => {
    const current = get().pages.find((p) => p.id === pageId)
    if (!current) return

    const result = await commandBus.execute(new ToggleFavoriteCommand(), {
      pageId,
      isFavorite: !current.isFavorite,
    })
    if (result.success) {
      set({
        pages: get().pages.map((p) => (p.id === pageId ? result.data.page : p)),
      })
    }
  },

  duplicatePage: async (pageId: string) => {
    const result = await commandBus.execute(new DuplicatePageCommand(), { pageId })
    if (result.success) {
      set({ pages: [...get().pages, result.data.page] })
    }
  },

  movePage: async (pageId: string, folderId: string | null) => {
    const result = await commandBus.execute(new MovePageCommand(), { pageId, folderId })
    if (result.success) {
      set({
        pages: get().pages.map((p) => (p.id === pageId ? result.data.page : p)),
      })
    }
  },

  togglePin: async (pageId: string) => {
    const current = get().pages.find((p) => p.id === pageId)
    if (!current) return

    const result = await commandBus.execute(new PinPageCommand(), {
      pageId,
      isPinned: !current.isPinned,
    })
    if (result.success) {
      set({
        pages: get().pages.map((p) => (p.id === pageId ? result.data.page : p)),
      })
    }
  },
}))
