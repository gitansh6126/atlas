import React from 'react'
import { cn } from "@/shared/utils/cn"
import type { RenderNode } from "@/core/editor/types"
import type { EditorController } from "./editor-controller.ts"
import { getBlockDomId } from "./block-utils.ts"

export interface LabelBlockProps {
  node: RenderNode
  controller: EditorController
  isSelected: boolean
  selectedBlockIds: string[]
}

export function LabelBlock({ node, isSelected }: LabelBlockProps) {
  const props = node.props as Record<string, unknown> | undefined
  const text = (props?.text as string) ?? "Label"
  const variant = (props?.variant as string) ?? "default"

  const variantClass =
    variant === "destructive"
      ? "bg-destructive text-destructive-foreground"
      : variant === "secondary"
      ? "bg-secondary text-secondary-foreground"
      : variant === "outline"
      ? "border border-input bg-background"
      : "bg-primary text-primary-foreground"

  return (
    <span
      id={getBlockDomId(node.blockId)}
      data-block-id={node.blockId}
      className={cn(
        "inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-medium transition-colors",
        variantClass,
        isSelected && "ring-2 ring-primary/40"
      )}
    >
      {text}
    </span>
  )
}

export interface TagBlockProps {
  node: RenderNode
  controller: EditorController
  isSelected: boolean
  selectedBlockIds: string[]
}

export function TagBlock({ node, isSelected }: TagBlockProps) {
  const props = node.props as Record<string, unknown> | undefined
  const label = (props?.label as string) ?? "Tag"
  const color = (props?.color as string) ?? "#3b82f6"

  const hex = color.replace("#", "")
  const r = parseInt(hex.substring(0, 2), 16) || 0
  const g = parseInt(hex.substring(2, 4), 16) || 0
  const b = parseInt(hex.substring(4, 6), 16) || 0
  const brightness = (r * 299 + g * 587 + b * 114) / 1000
  const textColor = brightness > 180 ? "#000000" : "#ffffff"

  return (
    <span
      id={getBlockDomId(node.blockId)}
      data-block-id={node.blockId}
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-all",
        isSelected && "ring-2 ring-primary/40"
      )}
      style={{ backgroundColor: color, color: textColor }}
    >
      {label}
    </span>
  )
}

function FileDropZone({ onFileUpload }: { onFileUpload: (files: FileList) => void }) {
  const [dragOver, setDragOver] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = () => {
    setDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileUpload(e.dataTransfer.files)
    }
  }

  const handleClick = () => {
    inputRef.current?.click()
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileUpload(e.target.files)
    }
  }

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-md border-2 border-dashed p-6 text-sm transition-colors cursor-pointer",
        dragOver ? "border-primary bg-primary/5" : "border-muted-foreground/30 hover:border-muted-foreground/50"
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
      role="button"
      tabIndex={0}
    >
      <svg className="mb-2 h-8 w-8 text-muted-foreground/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
      </svg>
      <p className="font-medium">Drop files here or click to upload</p>
      <p className="mt-1 text-xs text-muted-foreground">Supports HTML, CSS, TXT</p>
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept=".html,.css,.txt"
        multiple
        onChange={handleInputChange}
      />
    </div>
  )
}

export interface HtmlEmbedBlockProps {
  node: RenderNode
  controller: EditorController
  isSelected: boolean
  selectedBlockIds: string[]
}

export function HtmlEmbedBlock({ node, controller, isSelected }: HtmlEmbedBlockProps) {
  const props = node.props as Record<string, unknown> | undefined
  const html = (props?.html as string) ?? ""
  const css = (props?.css as string) ?? ""
  const files = (props?.files as { name: string; content: string }[]) ?? []
  const [editHtml, setEditHtml] = React.useState(html)
  const [editCss, setEditCss] = React.useState(css)
  const [activeTab, setActiveTab] = React.useState<"preview" | "html" | "css" | "files">("preview")

  const iframeRef = React.useRef<HTMLIFrameElement>(null)

  const combinedHtml = React.useMemo(() => {
    return (
      "<!DOCTYPE html><html><head><meta charset=\"UTF-8\"><style>" +
      "body{margin:0;padding:8px;font-family:system-ui,-apple-system,sans-serif}" +
      css +
      "</style></head><body>" +
      html +
      "</body></html>"
    )
  }, [html, css])

  React.useEffect(() => {
    if (iframeRef.current) {
      const doc = iframeRef.current.contentDocument
      if (doc) {
        doc.open()
        doc.write(combinedHtml)
        doc.close()
      }
    }
  }, [combinedHtml])

  const handleFileUpload = (uploadedFiles: FileList) => {
    const promises = Array.from(uploadedFiles).map((file) => {
      return new Promise<{ name: string; content: string }>((resolve) => {
        const reader = new FileReader()
        reader.onload = (e) => {
          resolve({ name: file.name, content: (e.target?.result as string) ?? "" })
        }
        reader.readAsText(file)
      })
    })

    Promise.all(promises).then((results) => {
      const updatedFiles = [...files, ...results]
      controller.updateBlockContent(node.blockId, {
        ...(props ?? {}),
        files: updatedFiles,
      })
    })
  }

  const handleSave = () => {
    controller.updateBlockContent(node.blockId, {
      ...(props ?? {}),
      html: editHtml,
      css: editCss,
    })
  }

  return (
    <div
      id={getBlockDomId(node.blockId)}
      data-block-id={node.blockId}
      className={cn(
        "rounded-lg border bg-card p-4",
        isSelected && "ring-2 ring-primary/40"
      )}
    >
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold">HTML Embed</h3>
        <div className="flex items-center gap-1">
          {["preview", "html", "css", "files"].map((tab) => (
            <button
              key={tab}
              onClick={() =>
                setActiveTab(tab as "preview" | "html" | "css" | "files")
              }
              className={cn(
                "rounded px-2 py-0.5 text-xs font-medium transition-colors",
                activeTab === tab
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted"
              )}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "preview" && (
        <>
          {html || css ? (
            <iframe
              ref={iframeRef}
              className="w-full h-[200px] rounded-md border bg-white"
              sandbox="allow-scripts"
              title="HTML Embed Preview"
            />
          ) : (
            <FileDropZone onFileUpload={handleFileUpload} />
          )}
        </>
      )}

      {activeTab === "html" && (
        <div className="space-y-2">
          <textarea
            className="w-full h-[200px] rounded-md border bg-muted p-2 text-xs font-mono"
            value={editHtml}
            onChange={(e) => setEditHtml(e.target.value)}
            placeholder="<div>Your HTML here...</div>"
          />
          <button
            onClick={handleSave}
            className="rounded bg-primary px-3 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90"
          >
            Save
          </button>
        </div>
      )}

      {activeTab === "css" && (
        <div className="space-y-2">
          <textarea
            className="w-full h-[200px] rounded-md border bg-muted p-2 text-xs font-mono"
            value={editCss}
            onChange={(e) => setEditCss(e.target.value)}
            placeholder="/* Your CSS here... */"
          />
          <button
            onClick={handleSave}
            className="rounded bg-primary px-3 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90"
          >
            Save
          </button>
        </div>
      )}

      {activeTab === "files" && (
        <div className="space-y-2">
          {files.length === 0 ? (
            <FileDropZone onFileUpload={handleFileUpload} />
          ) : (
            <div className="space-y-2">
              {files.map((file, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between rounded-md border p-2 text-xs"
                >
                  <span className="font-medium">{file.name}</span>
                  <span className="text-muted-foreground">
                    {file.content.length} chars
                  </span>
                </div>
              ))}
              <FileDropZone onFileUpload={handleFileUpload} />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
