import { create } from 'zustand'

type SidebarMode = 'fixed' | 'variable'

interface SidebarState {
  collapsed: boolean;
  mode: SidebarMode;
  width: number;
  expandedSections: Record<string, boolean>;
  toggleSidebar: () => void;
  setCollapsed: (collapsed: boolean) => void;
  setMode: (mode: SidebarMode) => void;
  setWidth: (width: number) => void;
  toggleSection: (section: string) => void;
  setSectionExpanded: (section: string, expanded: boolean) => void;
}

const MIN_WIDTH = 180
const MAX_WIDTH = 480
const DEFAULT_WIDTH = 240

export const useSidebarStore = create<SidebarState>()((set) => ({
  collapsed: false,
  mode: 'variable',
  width: DEFAULT_WIDTH,
  expandedSections: {
    folders: true,
    pages: true,
    favorites: false,
    recent: false,
  },
  toggleSidebar: () => set((state) => ({ collapsed: !state.collapsed })),
  setCollapsed: (collapsed) => set({ collapsed }),
  setMode: (mode) => set({ mode }),
  setWidth: (width) => set({ width: Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, width)) }),
  toggleSection: (section) =>
    set((state) => ({
      expandedSections: {
        ...state.expandedSections,
        [section]: !state.expandedSections[section],
      },
    })),
  setSectionExpanded: (section, expanded) =>
    set((state) => ({
      expandedSections: { ...state.expandedSections, [section]: expanded },
    })),
}))
