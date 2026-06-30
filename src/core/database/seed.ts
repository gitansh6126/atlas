import { atlasDb } from './atlas-database'
import { logger } from '@/core/storage/logger'
import type { Workspace, Folder, Page } from '@/core/types/domain'

function generateId(): string {
  return crypto.randomUUID()
}

function now(): number {
  return Date.now()
}

interface SeedData {
  workspace: Workspace;
  folders: Folder[];
  pages: Page[];
}

function buildSeedData(): SeedData {
  const workspaceId = 'default'
  const rootFolderId = generateId()
  const gettingStartedFolderId = generateId()
  const page1Id = generateId()
  const page2Id = generateId()
  const page3Id = generateId()
  const nowTs = now()

  const workspace: Workspace = {
    id: workspaceId,
    name: 'My Workspace',
    icon: 'LayoutGrid',
    description: 'Your personal knowledge workspace',
    colorScheme: 'system',
    defaultEditorMode: 'edit',
    pageSortOrder: 'updated',
    pageSortDirection: 'desc',
    syncEnabled: false,
    syncProvider: null,
    lastSyncedAt: null,
    pageCount: 3,
    folderCount: 2,
    createdAt: nowTs,
    updatedAt: nowTs,
    version: 1,
    deletedAt: null,
  }

  const folders: Folder[] = [
    {
      id: rootFolderId,
      workspaceId,
      parentId: null,
      name: 'Getting Started',
      icon: 'Rocket',
      children: [gettingStartedFolderId],
      pageCount: 2,
      collapsed: false,
      createdAt: nowTs,
      updatedAt: nowTs,
      version: 1,
      deletedAt: null,
    },
    {
      id: gettingStartedFolderId,
      workspaceId,
      parentId: rootFolderId,
      name: 'Basics',
      icon: 'BookOpen',
      children: [],
      pageCount: 2,
      collapsed: false,
      createdAt: nowTs,
      updatedAt: nowTs,
      version: 1,
      deletedAt: null,
    },
  ]

  const pages: Page[] = [
    {
      id: page1Id,
      workspaceId,
      folderId: rootFolderId,
      title: 'Welcome to Atlas',
      icon: 'FileText',
      coverAssetId: null,
      rootBlockId: generateId(),
      isFavorite: true,
      isPinned: false,
      lastOpenedAt: nowTs,
      wordCount: 0,
      charCount: 0,
      createdAt: nowTs,
      updatedAt: nowTs,
      version: 1,
      deletedAt: null,
    },
    {
      id: page2Id,
      workspaceId,
      folderId: gettingStartedFolderId,
      title: 'How to Use Folders',
      icon: 'FolderTree',
      coverAssetId: null,
      rootBlockId: generateId(),
      isFavorite: false,
      isPinned: false,
      lastOpenedAt: nowTs,
      wordCount: 0,
      charCount: 0,
      createdAt: nowTs,
      updatedAt: nowTs,
      version: 1,
      deletedAt: null,
    },
    {
      id: page3Id,
      workspaceId,
      folderId: gettingStartedFolderId,
      title: 'Creating Your First Page',
      icon: 'FilePlus',
      coverAssetId: null,
      rootBlockId: generateId(),
      isFavorite: false,
      isPinned: false,
      lastOpenedAt: nowTs,
      wordCount: 0,
      charCount: 0,
      createdAt: nowTs,
      updatedAt: nowTs,
      version: 1,
      deletedAt: null,
    },
  ]

  return { workspace, folders, pages }
}

export async function seedDatabase(): Promise<void> {
  const workspaceCount = await atlasDb.workspaces.count()
  if (workspaceCount > 0) {
    logger.info('Database already seeded, skipping')
    return
  }

  logger.info('Seeding database with default data')

  const data = buildSeedData()

  await atlasDb.transaction(
    'rw',
    atlasDb.workspaces,
    atlasDb.folders,
    atlasDb.pages,
    async () => {
      await atlasDb.workspaces.add(data.workspace)
      for (const folder of data.folders) {
        await atlasDb.folders.add(folder)
      }
      for (const page of data.pages) {
        await atlasDb.pages.add(page)
      }
    },
  )

  logger.info('Database seeded successfully')
}
