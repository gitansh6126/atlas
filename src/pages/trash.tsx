import { Trash2 } from 'lucide-react'
import { EmptyState } from '@/shared/components/common/empty-state'

export function TrashPage() {
  return (
    <div className="flex h-full items-center justify-center">
      <EmptyState
        icon={<Trash2 className="h-12 w-12" />}
        title="Trash is empty"
        description="Deleted pages will appear here."
      />
    </div>
  )
}
