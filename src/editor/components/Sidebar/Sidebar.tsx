import React from 'react'
import { useEditor } from '@/modules/editor/editor-hooks'
import { SidebarSearch } from './SidebarSearch'
import { SidebarCategory } from './SidebarCategory'
import { cn } from '@/shared/utils/cn'

const basicIcon = (
  <svg viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5">
    <path d="M2.5 3.5H12.5M2.5 7.5H12.5M2.5 11.5H12.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
  </svg>
)

const headingIcon = (
  <svg viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5">
    <path d="M3 2.5V12.5M12 2.5V12.5M3 7.5H12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
  </svg>
)

const textIcon = (
  <svg viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5">
    <path d="M3.5 3.5H11.5M7.5 3.5V11.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
  </svg>
)

const dividerIcon = (
  <svg viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5">
    <path d="M2 7.5H13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
  </svg>
)

const containerIcon = (
  <svg viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5">
    <rect x="2" y="2" width="11" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
  </svg>
)

const sectionIcon = (
  <svg viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5">
    <rect x="2" y="2" width="11" height="4" rx="1" stroke="currentColor" strokeWidth="1.2"/>
    <rect x="2" y="8" width="11" height="5" rx="1" stroke="currentColor" strokeWidth="1.2"/>
  </svg>
)

const columnsIcon = (
  <svg viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5">
    <rect x="2" y="2" width="4.5" height="11" rx="1" stroke="currentColor" strokeWidth="1.2"/>
    <rect x="8.5" y="2" width="4.5" height="11" rx="1" stroke="currentColor" strokeWidth="1.2"/>
  </svg>
)

const imageIcon = (
  <svg viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5">
    <rect x="2" y="2" width="11" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
    <circle cx="5" cy="5.5" r="1" fill="currentColor"/>
    <path d="M2 10L5 7.5L8 10L10.5 8L13 10.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const buttonIcon = (
  <svg viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5">
    <rect x="2" y="4.5" width="11" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
    <path d="M5.5 7.5H9.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
  </svg>
)

const listIcon = (
  <svg viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5">
    <circle cx="3.5" cy="4" r="1" fill="currentColor"/>
    <circle cx="3.5" cy="7.5" r="1" fill="currentColor"/>
    <circle cx="3.5" cy="11" r="1" fill="currentColor"/>
    <path d="M6.5 4H12.5M6.5 7.5H12.5M6.5 11H12.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
  </svg>
)

const checklistIcon = (
  <svg viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5">
    <rect x="3" y="3" width="9" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
    <path d="M5.5 7.5L7 9L9.5 6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const quoteIcon = (
  <svg viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5">
    <path d="M4 4.5C4 4.5 3 5.5 3 7.5C3 9 4 9.5 4 9.5M8 4.5C8 4.5 7 5.5 7 7.5C7 9 8 9.5 8 9.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    <path d="M11 4.5C11 4.5 10 5.5 10 7.5C10 9 11 9.5 11 9.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeOpacity="0.4"/>
  </svg>
)

const codeIcon = (
  <svg viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5">
    <path d="M5 4.5L2 7.5L5 10.5M10 4.5L13 7.5L10 10.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const calloutIcon = (
  <svg viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5">
    <rect x="2" y="2" width="11" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
    <path d="M5 7.5H10M7.5 5V10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
  </svg>
)

const toggleIcon = (
  <svg viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5">
    <rect x="2" y="4" width="4" height="7" rx="1" stroke="currentColor" strokeWidth="1.2"/>
    <path d="M7.5 7.5H13M7.5 5H11M7.5 10H12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
  </svg>
)

const numberedListIcon = (
  <svg viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5">
    <text x="2" y="5.5" fontSize="5" fill="currentColor" fontWeight="bold">1</text>
    <text x="2" y="9" fontSize="5" fill="currentColor" fontWeight="bold">2</text>
    <text x="2" y="12.5" fontSize="5" fill="currentColor" fontWeight="bold">3</text>
    <path d="M7 4H13M7 7.5H13M7 11H13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
  </svg>
)

const categories = [
  {
    title: 'Basic',
    items: [
      { type: 'paragraph', label: 'Paragraph', icon: basicIcon },
      { type: 'heading', label: 'Heading', icon: headingIcon },
      { type: 'text', label: 'Text', icon: textIcon },
      { type: 'divider', label: 'Divider', icon: dividerIcon },
    ],
  },
  {
    title: 'Layout',
    items: [
      { type: 'container', label: 'Container', icon: containerIcon },
      { type: 'section', label: 'Section', icon: sectionIcon },
      { type: 'columns', label: 'Columns', icon: columnsIcon },
    ],
  },
  {
    title: 'Media',
    items: [
      { type: 'image', label: 'Image', icon: imageIcon },
      { type: 'video', label: 'Video', icon: imageIcon },
    ],
  },
  {
    title: 'Interactive',
    items: [
      { type: 'button', label: 'Button', icon: buttonIcon },
    ],
  },
  {
    title: 'Data',
    items: [
      { type: 'bullet_list_item', label: 'Bulleted List', icon: listIcon },
      { type: 'ordered_list_item', label: 'Numbered List', icon: numberedListIcon },
      { type: 'checklist', label: 'Checklist', icon: checklistIcon },
      { type: 'quote', label: 'Quote', icon: quoteIcon },
      { type: 'code_block', label: 'Code Block', icon: codeIcon },
    ],
  },
  {
    title: 'Advanced',
    items: [
      { type: 'callout', label: 'Callout', icon: calloutIcon },
      { type: 'toggle', label: 'Toggle', icon: toggleIcon },
    ],
  },
]

export function Sidebar() {
  const { controller, isOpen } = useEditor()
  const [search, setSearch] = React.useState('')

  const filteredCategories = React.useMemo(() => {
    if (!search) return categories
    const q = search.toLowerCase()
    return categories
      .map((cat) => ({
        ...cat,
        items: cat.items.filter(
          (item) =>
            item.label.toLowerCase().includes(q) ||
            item.type.toLowerCase().includes(q)
        ),
      }))
      .filter((cat) => cat.items.length > 0)
  }, [search])

  return (
    <div
      className={cn(
        'flex w-64 shrink-0 flex-col border-r border-border bg-background',
        'transition-opacity duration-200',
        !isOpen && 'opacity-50 pointer-events-none'
      )}
    >
      <div className="flex items-center gap-2 border-b border-border px-4 py-2.5">
        <svg viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-muted-foreground">
          <rect x="2" y="2" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="1.2"/>
          <path d="M5 5H10M5 7.5H10M5 10H8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
        </svg>
        <span className="text-sm font-semibold">Elements</span>
      </div>

      <SidebarSearch value={search} onChange={setSearch} />

      <div className="flex-1 overflow-y-auto px-1 pb-4">
        {filteredCategories.map((cat) => (
          <SidebarCategory
            key={cat.title}
            title={cat.title}
            items={cat.items}
            controller={controller}
            defaultOpen={!search}
          />
        ))}
        {filteredCategories.length === 0 && (
          <div className="px-4 py-8 text-center text-sm text-muted-foreground">
            No blocks match "{search}"
          </div>
        )}
      </div>
    </div>
  )
}
