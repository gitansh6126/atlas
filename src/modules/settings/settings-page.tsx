import { useState, useCallback } from 'react'
import { useThemeStore } from '@/core/theme/theme-store'
import { useWorkspaceStore } from '@/modules/workspace/workspace-store'
import { useToastStore } from '@/shared/hooks/use-toast'
import { Input } from '@/shared/components/ui/input'
import { Button } from '@/shared/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
import { Separator } from '@/shared/components/ui/separator'

export function SettingsPage() {
  const { theme, setTheme } = useThemeStore()
  const currentWorkspace = useWorkspaceStore((s) => s.getCurrentWorkspace())
  const renameWorkspace = useWorkspaceStore((s) => s.renameWorkspace)
  const toast = useToastStore((s) => s.toast)

  const [workspaceName, setWorkspaceName] = useState(currentWorkspace?.name ?? '')

  const handleSaveWorkspaceName = useCallback(async () => {
    if (!currentWorkspace || !workspaceName.trim()) return
    await renameWorkspace(currentWorkspace.id, workspaceName.trim())
    toast('Workspace name updated', 'success')
  }, [currentWorkspace, workspaceName, renameWorkspace, toast])

  return (
    <div className="mx-auto max-w-2xl space-y-8 px-6 py-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your workspace preferences</p>
      </div>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">General</CardTitle>
          <CardDescription>Basic workspace settings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium">Workspace Name</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                The name displayed in the sidebar
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Input
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
                className="max-w-xs"
              />
              <Button size="sm" onClick={handleSaveWorkspaceName}>
                Save
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Appearance</CardTitle>
          <CardDescription>Customize the look and feel of Atlas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Theme</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Choose between light and dark mode
              </p>
            </div>
            <div className="flex items-center gap-1 rounded-lg border p-1">
              <button
                onClick={() => setTheme('light')}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  theme === 'light'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Light
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  theme === 'dark'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Dark
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="pt-8 text-center">
        <p className="text-xs text-muted-foreground">
          More settings will be available in future updates.
        </p>
      </div>
    </div>
  )
}
