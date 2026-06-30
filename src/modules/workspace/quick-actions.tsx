import { FolderPlus, FilePlus, Plus } from 'lucide-react'
import { Card, CardContent } from '@/shared/components/ui/card'
import { cn } from '@/shared/utils/cn'

interface QuickActionsProps {
  className?: string;
}

const actions = [
  {
    id: 'create-workspace',
    label: 'Create Workspace',
    icon: Plus,
    description: 'Start a new workspace',
  },
  {
    id: 'create-folder',
    label: 'Create Folder',
    icon: FolderPlus,
    description: 'Organize your pages',
  },
  {
    id: 'create-page',
    label: 'Create Page',
    icon: FilePlus,
    description: 'Add a new page',
  },
]

export function QuickActions({ className }: QuickActionsProps) {
  return (
    <div className={cn('w-full max-w-lg', className)}>
      <p className="mb-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        Quick Actions
      </p>
      <div className="grid grid-cols-3 gap-3">
        {actions.map((action) => (
          <Card
            key={action.id}
            className="group cursor-pointer transition-colors hover:bg-accent/50"
          >
            <CardContent className="flex flex-col items-center gap-2 p-4 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted transition-colors group-hover:bg-background">
                <action.icon className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium">{action.label}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{action.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
