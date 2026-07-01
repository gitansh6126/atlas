import React from 'react'
import { getBlockElement } from './block-utils.ts'

interface BlockSelectionProps {
  selectedBlockIds: string[]
  dropTargetId: string | null
  dropPosition: 'before' | 'after'
}

export function BlockSelection({ selectedBlockIds, dropTargetId, dropPosition: _dp }: BlockSelectionProps) {
  const [positions, setPositions] = React.useState<
    { top: number; left: number; width: number; height: number }[]
  >([])

  React.useEffect(() => {
    const rects = selectedBlockIds
      .map((id) => {
        const el = getBlockElement(id)
        if (!el) return null
        const rect = el.getBoundingClientRect()
        return {
          top: rect.top + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width,
          height: rect.height,
        }
      })
      .filter((r): r is NonNullable<typeof r> => r !== null)

    setPositions(rects)
  }, [selectedBlockIds])

  return (
    <>
      {positions.map((pos, i) => (
        <div
          key={i}
          className="pointer-events-none absolute rounded-md border-2 border-primary/30 bg-primary/5"
          style={{
            top: pos.top,
            left: pos.left,
            width: pos.width,
            height: pos.height,
          }}
        />
      ))}
      {dropTargetId && <DropIndicator blockId={dropTargetId} />}
    </>
  )
}

function DropIndicator({ blockId }: { blockId: string }) {
  const [top, setTop] = React.useState(0)

  React.useEffect(() => {
    const el = getBlockElement(blockId)
    if (!el) return
    const rect = el.getBoundingClientRect()
    setTop(rect.top + window.scrollY)

    const timer = setInterval(() => {
      const r = el.getBoundingClientRect()
      setTop(r.top + window.scrollY)
    }, 100)

    return () => clearInterval(timer)
  }, [blockId])

  return (
    <div
      className="pointer-events-none absolute left-0 right-0 z-50 h-0.5 bg-primary"
      style={{ top }}
    />
  )
}
