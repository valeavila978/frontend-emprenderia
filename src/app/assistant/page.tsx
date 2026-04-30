'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/context/AuthContext'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { AIService } from '@/services/aiService'
import { ProjectService } from '@/services/projectService'
import { ChatMessage, Project } from '@/types'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { Send, Bot, User, Sparkles, MessageSquare, ChevronDown, Layout } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

function AssistantContent() {
  const { token } = useAuth()
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: '¡Hola! Soy el asistente inteligente de EmprendeIA. ¿En qué puedo ayudarte hoy con tu proyecto?',
      timestamp: new Date().toISOString()
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Cargar proyectos del usuario
  useEffect(() => {
    const fetchProjects = async () => {
      if (!token) return
      try {
        const data = await ProjectService.getProjects(token)
        setProjects(data)
      } catch (err) {
        console.error('Error fetching projects:', err)
      }
    }
    fetchProjects()
  }, [token])

  // Notificar cambio de contexto
  useEffect(() => {
    if (selectedProjectId) {
      const project = projects.find(p => p.id === selectedProjectId)
      if (project) {
        const systemMsg: ChatMessage = {
          id: 'system-' + Date.now(),
          role: 'assistant',
          content: `He cargado el contexto de "${project.title}". Ahora puedes hacerme preguntas específicas sobre este proyecto.`,
          timestamp: new Date().toISOString()
        }
        setMessages(prev => [...prev, systemMsg])
      }
    }
  }, [selectedProjectId, projects])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || !token || isLoading) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const data = await AIService.sendMessage(input, sessionId, selectedProjectId, token)
      
      if (data.sessionId && !sessionId) {
        setSessionId(data.sessionId)
      }

      // El microservicio devuelve el mensaje dentro de data.message.content
      const responseContent = data.message?.content || data.response || 'El asistente no pudo procesar la respuesta.'

      const botMessage: ChatMessage = {
        id: Math.random().toString(36).substr(2, 9),
        role: 'assistant',
        content: responseContent,
        timestamp: new Date().toISOString()
      }

      setMessages(prev => [...prev, botMessage])
    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage: ChatMessage = {
        id: 'error-' + Date.now(),
        role: 'assistant',
        content: 'Lo siento, hubo un problema al conectar con el servicio de IA. Asegúrate de que el microservicio esté activo.',
        timestamp: new Date().toISOString()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-72px)] bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar de Proyectos */}
      <aside className="w-full md:w-80 bg-white border-r border-slate-100 p-6 flex flex-col gap-6">
        <div>
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Contexto de Proyecto</h2>
          <div className="relative">
            <select 
              value={selectedProjectId || ''} 
              onChange={(e) => setSelectedProjectId(e.target.value || null)}
              className="w-full appearance-none bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all cursor-pointer pr-10"
            >
              <option value="">🤖 Asistente General</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>🚀 {p.title}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
          </div>
          <p className="mt-3 text-[10px] text-slate-400 font-medium leading-relaxed">
            {selectedProjectId 
              ? 'El asistente tiene acceso a los detalles de tu proyecto seleccionado para darte mejores consejos.' 
              : 'Selecciona un proyecto para que la IA tenga contexto específico sobre tu negocio.'}
          </p>
        </div>

        <div className="mt-auto bg-blue-50 p-6 rounded-3xl border border-blue-100">
          <div className="flex items-center gap-3 mb-3">
            <Sparkles className="text-blue-600" size={20} />
            <h3 className="text-sm font-black text-blue-900 tracking-tight">Sugerencia Pro</h3>
          </div>
          <p className="text-xs text-blue-700 leading-relaxed font-medium">
            "Pregúntame cómo mejorar tu propuesta de valor basándote en tu Business Canvas."
          </p>
        </div>
      </aside>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col p-4 md:p-8 max-h-[calc(100vh-72px)] overflow-hidden">
        {/* Header */}
        <header className="mb-6 flex items-center justify-between bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-4">
            <div className="bg-blue-600 p-3 rounded-2xl text-white shadow-lg shadow-blue-600/20">
              <Bot size={24} />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight">Asistente EmprendeIA</h1>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  {selectedProjectId ? 'Contexto de Proyecto Activo' : 'Asistente General'}
                </span>
              </div>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
            <Layout className="text-blue-500" size={16} />
            <span className="text-xs font-bold text-slate-600">
              {selectedProjectId 
                ? projects.find(p => p.id === selectedProjectId)?.title 
                : 'Sin Proyecto'}
            </span>
          </div>
        </header>

        {/* Chat Messages Area */}
        <div className="flex-1 overflow-y-auto mb-6 pr-4 space-y-6 custom-scrollbar">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex gap-3 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm border ${
                    msg.role === 'user' 
                      ? 'bg-white border-slate-100 text-slate-600' 
                      : 'bg-blue-600 border-blue-500 text-white'
                  }`}>
                    {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
                  </div>
                  <div className={`p-4 rounded-3xl shadow-sm ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-slate-700 border border-slate-100'
                  }`}>
                    <p className="text-sm font-medium leading-relaxed">{msg.content}</p>
                    <span className={`text-[10px] mt-2 block font-bold uppercase tracking-widest ${
                      msg.role === 'user' ? 'text-blue-200' : 'text-slate-400'
                    }`}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {isLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
              <div className="bg-white border border-slate-100 p-4 rounded-3xl flex gap-2">
                <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" />
                <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <form onSubmit={handleSendMessage} className="bg-white p-4 rounded-[40px] shadow-xl border border-slate-100 flex items-center gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder={selectedProjectId ? "Pregunta sobre tu proyecto..." : "Haz una pregunta general..."}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full bg-transparent border-none focus:ring-0 text-slate-700 font-medium px-4 outline-none"
              disabled={isLoading}
            />
          </div>
          <Button 
            type="submit" 
            disabled={!input.trim() || isLoading}
            className="rounded-full w-12 h-12 flex items-center justify-center p-0 shadow-lg shadow-blue-600/20 transition-all active:scale-90"
          >
            <Send size={20} />
          </Button>
        </form>
      </div>
    </div>
  )
}

export default function AssistantPage() {
  return (
    <ProtectedRoute>
      <AssistantContent />
    </ProtectedRoute>
  )
}
