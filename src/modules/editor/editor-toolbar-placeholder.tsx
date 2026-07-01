import * as React from 'react'
import { cn } from '@/shared/utils/cn'

interface EditorToolbarPlaceholderProps {
  isDirty: boolean;
  isSaving: boolean;
}

const EditorToolbarPlaceholder = React.forwardRef<HTMLDivElement, EditorToolbarPlaceholderProps>(
  ({ isDirty, isSaving }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex h-9 items-center justify-end gap-2 border-b border-border px-4',
        )}
      >
        {isSaving && (
          <span className="text-xs text-muted-foreground">Saving...</span>
        )}
        {isDirty && !isSaving && (
          <span className="text-xs text-muted-foreground">Unsaved changes</span>
        )}
        {!isDirty && !isSaving && (
          <span className="text-xs text-muted-foreground">All changes saved</span>
        )}
      </div>
    )
  },
)
EditorToolbarPlaceholder.displayName = 'EditorToolbarPlaceholder'

export { EditorToolbarPlaceholder }
