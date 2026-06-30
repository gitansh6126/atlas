export interface Workspace {
  id: string;
  name: string;
  icon: string;
  createdAt: number;
}

export interface Folder {
  id: string;
  name: string;
  workspaceId: string;
  parentId: string | null;
  children: string[];
  createdAt: number;
}

export interface Page {
  id: string;
  title: string;
  workspaceId: string;
  folderId: string | null;
  isFavorite: boolean;
  lastOpened: number;
  createdAt: number;
  updatedAt: number;
}

export type Theme = 'light' | 'dark';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export type SidebarSection = 'folders' | 'pages' | 'favorites' | 'recent';
