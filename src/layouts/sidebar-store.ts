import { create } from 'zustand'

interface SidebarState {
  collapsed: boolean;
  expandedSections: Record<string, boolean>;
  toggleSidebar: () => void;
  setCollapsed: (collapsed: boolean) => void;
  toggleSection: (section: string) => void;
  setSectionExpanded: (section: string, expanded: boolean) => void;
}

export const useSidebarStore = create<SidebarState>()((set) => ({
  collapsed: false,
  expandedSections: {
    folders: true,
    pages: true,
    favorites: false,
    recent: false,
  },
  toggleSidebar: () => set((state) => ({ collapsed: !state.collapsed })),
  setCollapsed: (collapsed) => set({ collapsed }),
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
