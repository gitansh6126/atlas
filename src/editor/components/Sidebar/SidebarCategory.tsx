import React from 'react'
import { SidebarSection } from './SidebarSection'
import { SidebarItem } from './SidebarItem'
import type { EditorController } from '@/modules/editor/editor-controller'

interface SidebarItemData {
  type: string
  label: string
  icon: React.ReactNode
}

interface SidebarCategoryProps {
  title: string
  items: SidebarItemData[]
  controller: EditorController
  defaultOpen?: boolean
}

export function SidebarCategory({ title, items, controller, defaultOpen = true }: SidebarCategoryProps) {
  return (
    <div className="mb-1">
      <SidebarSection title={title} defaultOpen={defaultOpen}>
        <div className="space-y-0.5">
          {items.map((item) => (
            <SidebarItem
              key={item.type}
              type={item.type}
              label={item.label}
              icon={item.icon}
              controller={controller}
            />
          ))}
        </div>
      </SidebarSection>
    </div>
  )
}
