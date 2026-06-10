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

const normalizeContent = (value: string) => {
  if (!value) return '<p></p>'
  return value
    .split(/\r?\n/)
    .map((line) => `<p>${line || '<br/>'}</p>`)
    .join('')
}

export default function TiptapEditor({ content, onChange, editable = true, className = '', label }: TiptapEditorProps) {
  const lastHtml = useRef<string>('')

  const editor = useEditor({
    editable,
    extensions: [StarterKit],
    content: content ? content : '<p></p>',
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
    if (editor && content !== undefined && editor.getHTML() !== content) {
      editor.commands.setContent(content)
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
