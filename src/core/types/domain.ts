export interface Workspace {
  id: string;
  name: string;
  icon: string;
  description: string | null;
  colorScheme: 'light' | 'dark' | 'system';
  defaultEditorMode: 'edit' | 'preview' | 'focus';
  pageSortOrder: 'created' | 'updated' | 'alphabetical';
  pageSortDirection: 'asc' | 'desc';
  syncEnabled: boolean;
  syncProvider: string | null;
  lastSyncedAt: number | null;
  pageCount: number;
  folderCount: number;
  createdAt: number;
  updatedAt: number;
  version: number;
  deletedAt: number | null;
}

export interface Folder {
  id: string;
  workspaceId: string;
  parentId: string | null;
  name: string;
  icon: string | null;
  children: string[];
  pageCount: number;
  collapsed: boolean;
  createdAt: number;
  updatedAt: number;
  version: number;
  deletedAt: number | null;
}

export interface Page {
  id: string;
  workspaceId: string;
  folderId: string | null;
  title: string;
  icon: string | null;
  coverAssetId: string | null;
  rootBlockId: string;
  isFavorite: boolean;
  isPinned: boolean;
  lastOpenedAt: number;
  wordCount: number;
  charCount: number;
  createdAt: number;
  updatedAt: number;
  version: number;
  deletedAt: number | null;
}
