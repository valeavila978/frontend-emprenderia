'use client'

import { useEffect, useState } from 'react'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { useAuth } from '@/context/AuthContext'
import { ForumService } from '@/services/forumService'
import { Button } from '@/components/Button'
import { ForumTopic, ForumReply } from '@/types'
import { motion } from 'framer-motion'

export default function ForumPage() {
  const { token } = useAuth()
  const [topics, setTopics] = useState<ForumTopic[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showNew, setShowNew] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newContent, setNewContent] = useState('')

  const [selectedTopic, setSelectedTopic] = useState<ForumTopic | null>(null)
  const [replies, setReplies] = useState<ForumReply[]>([])
  const [replyContent, setReplyContent] = useState('')

  useEffect(() => {
    const load = async () => {
      if (!token) return
      setLoading(true)
      try {
        const data = await ForumService.getTopics(token)
        setTopics(data)
      } catch (err) {
        setError('No se pudieron cargar los temas')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [token])

  const openTopic = async (t: ForumTopic) => {
    setSelectedTopic(t)
    try {
      const r = await ForumService.getReplies(t.id, token!)
      setReplies(r)
    } catch {
      setReplies([])
    }
  }

  const handleCreateTopic = async () => {
    if (!token || !newTitle) return
    try {
      const created = await ForumService.createTopic(newTitle, newContent, token)
      setTopics(prev => [created, ...prev])
      setNewTitle('')
      setNewContent('')
      setShowNew(false)
    } catch {
      setError('No se pudo crear el tema')
    }
  }

  const handlePostReply = async () => {
    if (!token || !selectedTopic || !replyContent) return
    try {
      const created = await ForumService.postReply(selectedTopic.id, replyContent, token)
      setReplies(prev => [...prev, created])
      setReplyContent('')
    } catch {
      setError('No se pudo publicar la respuesta')
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#f8fafc] py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-4xl font-black">Foro Comunitario</h1>
            <div>
              <Button onClick={() => setShowNew(!showNew)} className="rounded-2xl">{showNew ? 'Cancelar' : 'Nuevo Tema'}</Button>
            </div>
          </div>

          {showNew && (
            <div className="bg-white p-6 rounded-2xl mb-6 border">
              <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Título" className="w-full p-3 border rounded mb-3" />
              <textarea value={newContent} onChange={e => setNewContent(e.target.value)} placeholder="Contenido" className="w-full p-3 border rounded mb-3" rows={4} />
              <div className="flex justify-end">
                <Button onClick={handleCreateTopic}>Crear Tema</Button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1 space-y-4">
              {loading ? <div>Cargando...</div> : (
                topics.map(t => (
                  <motion.div key={t.id} whileHover={{ scale: 1.01 }} className="bg-white p-4 rounded-2xl border cursor-pointer" onClick={() => openTopic(t)}>
                    <div className="font-bold">{t.title}</div>
                    <div className="text-xs text-slate-500">{new Date(t.createdAt).toLocaleDateString()}</div>
                  </motion.div>
                ))
              )}
            </div>
            <div className="md:col-span-2 bg-white p-6 rounded-2xl border">
              {selectedTopic ? (
                <>
                  <h2 className="text-2xl font-bold mb-2">{selectedTopic.title}</h2>
                  <div className="mb-4 text-slate-700">{selectedTopic.content}</div>
                  <div className="space-y-3 mb-6">
                    {replies.map(r => (
                      <div key={r.id} className="p-3 rounded-2xl border bg-slate-50">
                        <div className="text-sm text-slate-700">{r.content}</div>
                        <div className="text-xs text-slate-400 mt-2">{new Date(r.createdAt).toLocaleString()}</div>
                      </div>
                    ))}
                    {replies.length === 0 && <div className="text-slate-500">Sé el primero en responder</div>}
                  </div>
                  <textarea value={replyContent} onChange={e => setReplyContent(e.target.value)} placeholder="Escribe tu respuesta..." className="w-full p-3 border rounded mb-3" rows={3} />
                  <div className="flex justify-end"><Button onClick={handlePostReply}>Publicar Respuesta</Button></div>
                </>
              ) : (
                <div className="text-slate-500">Selecciona un tema para ver y responder.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
