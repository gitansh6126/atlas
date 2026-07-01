import { Editor } from '@/editor'
import { useWorkspaceStore } from '@/modules/workspace/workspace-store'
import { WelcomeScreen } from '@/modules/workspace/welcome-screen'

export function HomePage() {
  const selectedPageId = useWorkspaceStore((s) => s.selectedPageId)
  const currentWorkspaceId = useWorkspaceStore((s) => s.currentWorkspaceId)

  if (!selectedPageId) {
    return <WelcomeScreen />
  }

  return (
    <div className="flex h-full flex-col">
      <Editor
        pageId={selectedPageId}
        workspaceId={currentWorkspaceId ?? undefined}
        className="h-full"
      />
    </div>
  )
}
