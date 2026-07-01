import React from 'react'
import { cn } from '@/shared/utils/cn'
import type { RenderNode } from '@/core/editor/types'
import type { EditorController } from './editor-controller.ts'
import { getBlockDomId } from './block-utils.ts'

interface GridBlockBaseProps {
  node: RenderNode
  controller: EditorController
  isSelected: boolean
  selectedBlockIds: string[]
  children?: React.ReactNode
}

function GridContainer({
  node,
  // controller: _controller,
  isSelected,
  // selectedBlockIds: _selectedBlockIds,
  children,
}: GridBlockBaseProps) {
  const blockId = node.blockId
  const props = node.props as Record<string, unknown> | undefined
  const columns = ((props?.columns as number) ?? 3)
  const gap = ((props?.gap as number) ?? 4)

  return (
    <div
      id={getBlockDomId(blockId)}
      data-block-id={blockId}
      className={cn(
        'grid w-full',
        isSelected && 'ring-2 ring-primary/40 rounded-sm',
      )}
      style={{
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
        gap: `${gap * 0.25}rem`,
      }}
    >
      {children}
    </div>
  )
}

export interface GridBlockProps {
  node: RenderNode
  controller: EditorController
  isSelected: boolean
  selectedBlockIds: string[]
}

export function GridBlock({
  node,
  controller,
  isSelected,
  selectedBlockIds,
}: GridBlockProps) {
  return (
    <GridContainer
      node={node}
      controller={controller}
      isSelected={isSelected}
      selectedBlockIds={selectedBlockIds}
    >
      <div className="col-span-full p-4 text-sm text-muted-foreground">
        Grid Block (columns: {String((node.props as Record<string, unknown>)?.columns ?? 3)})
      </div>
    </GridContainer>
  )
}

export interface ListBlockProps {
  node: RenderNode
  controller: EditorController
  isSelected: boolean
  selectedBlockIds: string[]
}

export function ListBlock({
  node,
  // controller: _controller,
  isSelected,
  // selectedBlockIds: _selectedBlockIds,
}: ListBlockProps) {
  const props = node.props as Record<string, unknown> | undefined
  const style = (props?.style as string) ?? 'bullet'
  const items = (props?.items as string[]) ?? ['Item 1', 'Item 2', 'Item 3']

  return (
    <ul
      id={getBlockDomId(node.blockId)}
      data-block-id={node.blockId}
      className={cn(
        'list-inside space-y-1 py-2',
        style === 'numbered' && 'list-decimal',
        style === 'bullet' && 'list-disc',
        style === 'check' && 'list-none',
        isSelected && 'ring-2 ring-primary/40 rounded-sm',
      )}
    >
      {items.map((item, idx) => (
        <li key={idx} className="flex items-center gap-2 text-sm">
          {style === 'check' && (
            <span className="inline-flex h-4 w-4 items-center justify-center rounded border border-muted-foreground/30">
              <svg className="h-3 w-3 text-primary" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </span>
          )}
          {item}
        </li>
      ))}
    </ul>
  )
}

export interface CardBlockProps {
  node: RenderNode
  controller: EditorController
  isSelected: boolean
  selectedBlockIds: string[]
}

export function CardBlock({
  node,
  isSelected,
}: CardBlockProps) {
  const props = node.props as Record<string, unknown> | undefined
  const title = (props?.title as string) ?? 'Card Title'
  const description = (props?.description as string) ?? 'Card description goes here.'

  return (
    <div
      id={getBlockDomId(node.blockId)}
      data-block-id={node.blockId}
      className={cn(
        'rounded-lg border bg-card p-4 shadow-sm',
        isSelected && 'ring-2 ring-primary/40',
      )}
    >
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </div>
  )
}

export interface GalleryBlockProps {
  node: RenderNode
  controller: EditorController
  isSelected: boolean
  selectedBlockIds: string[]
}

export function GalleryBlock({
  node,
  isSelected,
}: GalleryBlockProps) {
  const props = node.props as Record<string, unknown> | undefined
  const images = (props?.images as string[]) ?? []
  const columns = (props?.columns as number) ?? 3

  return (
    <div
      id={getBlockDomId(node.blockId)}
      data-block-id={node.blockId}
      className={cn(
        'grid gap-2',
        isSelected && 'ring-2 ring-primary/40 rounded-sm',
      )}
      style={{
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
      }}
    >
      {images.length === 0 ? (
        <div className="col-span-full rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
          Gallery Block (columns: {columns})
        </div>
      ) : (
        images.map((src, idx) => (
          <div key={idx} className="aspect-square overflow-hidden rounded-md bg-muted">
            <img src={src} alt="" className="h-full w-full object-cover" />
          </div>
        ))
      )}
    </div>
  )
}

export interface KanbanBlockProps {
  node: RenderNode
  controller: EditorController
  isSelected: boolean
  selectedBlockIds: string[]
}

export function KanbanBlock({
  node,
  isSelected,
}: KanbanBlockProps) {
  const props = node.props as Record<string, unknown> | undefined
  const columns = (props?.columns as { id: string; title: string }[]) ?? [
    { id: 'todo', title: 'To Do' },
    { id: 'doing', title: 'In Progress' },
    { id: 'done', title: 'Done' },
  ]

  return (
    <div
      id={getBlockDomId(node.blockId)}
      data-block-id={node.blockId}
      className={cn(
        'flex gap-3 overflow-x-auto rounded-lg border bg-muted/30 p-3',
        isSelected && 'ring-2 ring-primary/40',
      )}
    >
      {columns.map((col) => (
        <div key={col.id} className="min-w-[200px] flex-1 rounded-md bg-card p-3 shadow-sm">
          <h4 className="mb-2 text-sm font-semibold">{col.title}</h4>
          <div className="space-y-2">
            <div className="rounded-md border bg-background p-2 text-xs text-muted-foreground">
              Sample task in {col.title}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export interface CalendarBlockProps {
  node: RenderNode
  controller: EditorController
  isSelected: boolean
  selectedBlockIds: string[]
}

export function CalendarBlock({
  node,
  isSelected,
}: CalendarBlockProps) {
  const props = node.props as Record<string, unknown> | undefined
  const view = (props?.view as string) ?? 'month'

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const dates = Array.from({ length: 35 }, (_, i) => (i % 31) + 1)

  return (
    <div
      id={getBlockDomId(node.blockId)}
      data-block-id={node.blockId}
      className={cn(
        'rounded-lg border bg-card p-4',
        isSelected && 'ring-2 ring-primary/40',
      )}
    >
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold">Calendar ({view})</h3>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => (
          <div key={day} className="py-1 text-center text-xs font-medium text-muted-foreground">
            {day}
          </div>
        ))}
        {dates.slice(0, 35).map((date, idx) => (
          <div
            key={idx}
            className="flex h-8 items-center justify-center rounded-md text-xs hover:bg-muted"
          >
            {date}
          </div>
        ))}
      </div>
    </div>
  )
}
