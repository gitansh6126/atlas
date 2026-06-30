import { useWorkspaceStore } from '@/modules/workspace/workspace-store'
import { Logo } from '@/shared/components/common/logo'
import { QuickActions } from '@/modules/workspace/quick-actions'

export function WelcomeScreen() {
  const workspace = useWorkspaceStore((s) => s.getCurrentWorkspace())

  return (
    <div className="flex h-full flex-col items-center justify-center px-8">
      <div className="mb-12">
        <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-muted">
          <Logo showText={false} className="scale-[2.5]" />
        </div>
      </div>

      <h1 className="text-3xl font-bold tracking-tight text-foreground">
        Welcome to {workspace?.name ?? 'Atlas'}
      </h1>
      <p className="mt-2 max-w-lg text-center text-muted-foreground">
        Your knowledge workspace. Create pages, organize with folders, and build your personal
        knowledge base.
      </p>

      <QuickActions className="mt-10" />
    </div>
  )
}
