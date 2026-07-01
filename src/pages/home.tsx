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
    <Editor
      pageId={selectedPageId}
      workspaceId={currentWorkspaceId ?? undefined}
      className="h-full"
    />
  )
}
