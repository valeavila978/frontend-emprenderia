'use client'

import { useEffect, useRef } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'

interface TiptapEditorProps {
  content: string
  onChange: (value: string) => void
  editable?: boolean
  className?: string
  label?: string
}

const convertMarkdownToHTML = (value: string) => {
  if (!value) return '<p></p>'

  const convertInline = (text: string) =>
    text
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/__(.+?)__/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/_(.+?)_/g, '<em>$1</em>')
      .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')

  const lines = value.split(/\r?\n/)
  let html = ''
  let inList = false
  let listType: 'ul' | 'ol' | null = null

  const closeList = () => {
    if (inList && listType) {
      html += `</${listType}>`
      inList = false
      listType = null
    }
  }

  lines.forEach((line) => {
    const trimmed = line.trim()
    if (/^#{1,6}\s+/.test(trimmed)) {
      closeList()
      const level = Math.min(trimmed.match(/^#+/)![0].length, 6)
      const contentText = trimmed.replace(/^#{1,6}\s+/, '')
      html += `<h${level}>${convertInline(contentText)}</h${level}>`
      return
    }

    if (/^---$|^\*\*\*$|^___$/.test(trimmed)) {
      closeList()
      html += '<hr />'
      return
    }

    if (/^\d+\.\s+/.test(trimmed)) {
      if (!inList || listType !== 'ol') {
        closeList()
        listType = 'ol'
        inList = true
        html += '<ol class="list-decimal list-inside mb-4 ml-2 space-y-1">'
      }
      html += `<li class="text-slate-900">${convertInline(trimmed.replace(/^\d+\.\s+/, ''))}</li>`
      return
    }

    if (/^[-*+]\s+/.test(trimmed)) {
      if (!inList || listType !== 'ul') {
        closeList()
        listType = 'ul'
        inList = true
        html += '<ul class="list-disc list-inside mb-4 ml-2 space-y-1">'
      }
      html += `<li class="text-slate-900">${convertInline(trimmed.replace(/^[-*+]\s+/, ''))}</li>`
      return
    }

    if (trimmed === '') {
      closeList()
      html += '<p><br/></p>'
      return
    }

    closeList()
    html += `<p>${convertInline(trimmed)}</p>`
  })

  closeList()
  return html
}

export default function TiptapEditor({ content, onChange, editable = true, className = '', label }: TiptapEditorProps) {
  const lastHtml = useRef<string>('')

  const editor = useEditor({
    editable,
    extensions: [StarterKit],
    content: convertMarkdownToHTML(content),
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      if (lastHtml.current !== html) {
        lastHtml.current = html
        onChange(html)
      }
    },
    editorProps: {
      attributes: {
        class: 'prose prose-slate max-w-none focus:outline-none bg-transparent min-h-[260px] p-4',
      },
    },
  })

  useEffect(() => {
    if (editor && content !== undefined && editor.getHTML() !== convertMarkdownToHTML(content)) {
      editor.commands.setContent(convertMarkdownToHTML(content))
    }
  }, [content, editor])

  return (
    <div className={`rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden ${className}`}>
      {label ? (
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold">
          {label}
        </div>
      ) : null}
      <div className="min-h-[320px]">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
