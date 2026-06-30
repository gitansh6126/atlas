import { useWorkspaceStore } from '@/modules/workspace/workspace-store'
import { WelcomeScreen } from '@/modules/workspace/welcome-screen'

export function HomePage() {
  const selectedPageId = useWorkspaceStore((s) => s.selectedPageId)

  if (!selectedPageId) {
    return <WelcomeScreen />
  }

  return (
    <div className="flex h-full items-center justify-center">
      <p className="text-sm text-muted-foreground">Page content will be rendered here.</p>
    </div>
  )
}
