export type { Workspace, Folder, Page } from '@/core/types/domain'

export type Theme = 'light' | 'dark';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export type SidebarSection = 'folders' | 'pages' | 'favorites' | 'recent';
