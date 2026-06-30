import { IndexedDbStorageProvider } from '@/core/storage/providers/indexeddb-provider'
import { WorkspaceRepository } from './workspace-repository'
import { FolderRepository } from './folder-repository'
import { PageRepository } from './page-repository'

const defaultProvider = new IndexedDbStorageProvider()

export const workspaceRepository = new WorkspaceRepository(defaultProvider)
export const folderRepository = new FolderRepository(defaultProvider)
export const pageRepository = new PageRepository(defaultProvider)

export { BaseRepository } from './base-repository'
export { WorkspaceRepository } from './workspace-repository'
export { FolderRepository } from './folder-repository'
export { PageRepository } from './page-repository'
export { TrashRepository } from './trash-repository'
