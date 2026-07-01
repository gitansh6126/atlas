import React from 'react'
import { cn } from '@/shared/utils/cn'
import type { EditorController } from '@/modules/editor/editor-controller'

interface ImageRendererProps {
  blockId: string
  src?: string
  alt?: string
  caption?: string
  alignment?: 'left' | 'center' | 'right'
  width?: number
  controller: EditorController
  isSelected?: boolean
}

export function ImageRenderer({
  blockId,
  src,
  alt,
  caption,
  alignment = 'center',
  width,
  controller,
}: ImageRendererProps) {
  const [isEditing, setIsEditing] = React.useState(!src)
  const [url, setUrl] = React.useState(src || '')
  const [altText, _setAltText] = React.useState(alt || '')
  const [capText, _setCapText] = React.useState(caption || '')
  const [imgWidth, setImgWidth] = React.useState(width)
  const [isResizing, setIsResizing] = React.useState(false)
  const [startX, setStartX] = React.useState(0)
  const [startWidth, setStartWidth] = React.useState(0)
  const containerRef = React.useRef<HTMLDivElement>(null)

  const handleUrlSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      controller.updateBlockContent(blockId, { src: url, alt: altText, caption: capText, alignment, width: imgWidth })
      setIsEditing(false)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string
      setUrl(dataUrl)
      controller.updateBlockContent(blockId, { src: dataUrl, alt: altText, caption: capText, alignment, width: imgWidth })
      setIsEditing(false)
    }
    reader.readAsDataURL(file)
  }

  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizing(true)
    setStartX(e.clientX)
    const currentWidth = containerRef.current?.offsetWidth ?? 0
    setStartWidth(currentWidth)
  }

  React.useEffect(() => {
    if (!isResizing) return
    const handleMouseMove = (e: MouseEvent) => {
      const delta = e.clientX - startX
      const newWidth = Math.max(100, startWidth + delta)
      setImgWidth(newWidth)
    }
    const handleMouseUp = () => {
      setIsResizing(false)
      controller.updateBlockContent(blockId, { src: url, alt: altText, caption: capText, alignment, width: imgWidth })
    }
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizing, startX, startWidth, imgWidth, blockId, controller, url, altText, capText, alignment])

  if (isEditing || !src) {
    return (
      <div className="relative rounded-lg border border-dashed border-muted-foreground/30 bg-muted/30 p-6">
        <div className="flex flex-col items-center gap-3">
          <input
            type="text"
            placeholder="Paste image URL..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={handleUrlSubmit}
            className="w-full max-w-md rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
          <span className="text-xs text-muted-foreground">or</span>
          <label className="cursor-pointer rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            Upload Image
            <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
          </label>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        'group relative inline-block max-w-full',
        alignment === 'left' && 'mr-auto',
        alignment === 'center' && 'mx-auto',
        alignment === 'right' && 'ml-auto',
      )}
      style={imgWidth ? { width: imgWidth } : undefined}
    >
      <img
        src={src}
        alt={altText}
        className="h-auto w-full rounded-md object-contain"
        draggable={false}
      />
      {caption && <p className="mt-2 text-center text-sm text-muted-foreground">{caption}</p>}
      
      {/* Resize handle */}
      <div
        className="absolute right-0 top-1/2 h-8 w-2 -translate-y-1/2 translate-x-1 cursor-ew-resize rounded bg-primary/50 opacity-0 transition-opacity group-hover:opacity-100"
        onMouseDown={handleResizeStart}
        role="button"
        aria-label="Resize image"
      />
      
      {/* Alignment controls */}
      <div className="absolute -bottom-8 left-1/2 flex -translate-x-1/2 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        {(['left', 'center', 'right'] as const).map((align) => (
          <button
            key={align}
            type="button"
            onClick={() => {
              controller.updateBlockContent(blockId, { src: url, alt: altText, caption: capText, alignment: align, width: imgWidth })
            }}
            className={cn(
              'rounded p-1 text-xs hover:bg-accent',
              alignment === align && 'bg-accent',
            )}
          >
            {align[0].toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  )
}
