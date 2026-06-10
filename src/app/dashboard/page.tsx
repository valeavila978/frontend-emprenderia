'use client'

import { ProtectedRoute } from '@/components/ProtectedRoute'
import { useAuth } from '@/context/AuthContext'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Bell, Briefcase, Plus, TrendingUp, Users, Activity } from 'lucide-react'
import { useEffect, useState } from 'react'
import { HubConnectionBuilder } from '@microsoft/signalr'
import { MatchingService, MatchDto } from '@/services/matchingService'
import { API_URL } from '@/config'

const STAGES = ['Idea', 'Prototipo', 'MVP', 'Escalado']

function getProgressWidth(stage: string) {
  const index = STAGES.indexOf(stage)
  if (index === -1) return '0%'
  return `${((index + 1) / STAGES.length) * 100}%`
}

function DashboardContent() {
  const { user, token } = useAuth()
  const [matches, setMatches] = useState<MatchDto[]>([])

  useEffect(() => {
    if (!token) return

    // 1. Fetch initial matches
    MatchingService.getUserMatches(token)
      .then(data => setMatches(data))
      .catch(err => console.error('Error fetching matches:', err))

    // 2. Establish SignalR connection
    const hubUrl = process.env.NEXT_PUBLIC_HUB_URL || `${API_URL.replace('/api', '')}/hubs/notifications`
    const connection = new HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: () => token
      })
      .withAutomaticReconnect()
      .build()

    connection.on('ReceiveNotification', (newMatch: MatchDto) => {
      setMatches(prev => [newMatch, ...prev])
    })

    connection.start()
      .then(() => console.log('SignalR Connected!'))
      .catch(err => console.error('SignalR connection error:', err))

    return () => {
      connection.stop()
    }
  }, [token])

  return (
    <div className="min-h-screen bg-[#0f172a] py-8 text-white">
      <div className="max-w-7xl mx-auto px-4">
        <header className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-300">
              Premium Workspace
            </h1>
            <p className="text-slate-400 mt-2">Bienvenido de nuevo, {user?.email}</p>
          </div>
          {user?.role !== 'Investor' && user?.role !== 'Mentor' ? (
            <Link href="/projects/create">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-blue-500/30 transition-all"
              >
                <Plus size={20} /> Nuevo Proyecto
              </motion.button>
            </Link>
          ) : (
            <div className="flex gap-3">
              <Link href="/projects" className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/10 text-white font-bold">
                Explorar Startups
              </Link>
              <Link href="/marketplace" className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/10 text-white font-bold">
                Marketplace
              </Link>
            </div>
          )}
        </header>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Main Area (Projects) - spans 2 cols */}
          <div className="md:col-span-2 space-y-6">
            
            {/* Stats row */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-slate-800/50 backdrop-blur-md rounded-3xl p-6 border border-slate-700/50 flex flex-col justify-between hover:bg-slate-800 transition-all">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 mb-4">
                  <Briefcase size={20} />
                </div>
                <div>
                  <p className="text-slate-400 text-sm font-semibold">Proyectos Activos</p>
                  <p className="text-3xl font-bold text-white mt-1">3</p>
                </div>
              </div>
              <div className="bg-slate-800/50 backdrop-blur-md rounded-3xl p-6 border border-slate-700/50 flex flex-col justify-between hover:bg-slate-800 transition-all">
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 mb-4">
                  <TrendingUp size={20} />
                </div>
                <div>
                  <p className="text-slate-400 text-sm font-semibold">TIR Promedio</p>
                  <p className="text-3xl font-bold text-white mt-1">14%</p>
                </div>
              </div>
              <div className="bg-slate-800/50 backdrop-blur-md rounded-3xl p-6 border border-slate-700/50 flex flex-col justify-between hover:bg-slate-800 transition-all">
                <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 mb-4">
                  <Users size={20} />
                </div>
                <div>
                  <p className="text-slate-400 text-sm font-semibold">Inversores</p>
                  <p className="text-3xl font-bold text-white mt-1">12</p>
                </div>
              </div>
            </div>

            {/* Project Cards */}
            <div className="bg-slate-800/50 backdrop-blur-md rounded-3xl p-8 border border-slate-700/50">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <Activity className="text-blue-400" /> Proyectos Recomendados
                </h2>
                <Link href="/projects" className="text-blue-400 hover:text-blue-300 font-medium text-sm">Ver todos →</Link>
              </div>

              <div className="space-y-4">
                {matches.length > 0 ? (
                  matches.map((m) => (
                    <div key={m.id} className="bg-slate-900/50 rounded-2xl p-6 border border-slate-700/50 hover:border-slate-600 transition-all cursor-pointer">
                      <div className="flex justify-between items-start mb-4 gap-4">
                        <div>
                          <h3 className="text-xl font-bold text-white">{m.projectTitle}</h3>
                          <p className="text-slate-400 text-sm mt-1">Match con {m.investorName || 'perfil compatible'}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          m.matchScore >= 85
                            ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-500/30'
                            : m.matchScore >= 70
                            ? 'bg-amber-500/20 text-amber-200 border border-amber-500/30'
                            : 'bg-slate-700/20 text-slate-200 border border-slate-700/30'
                        }`}>
                          {m.matchScore.toFixed(0)}%
                        </span>
                      </div>
                      <div className="text-slate-400 text-sm">
                        <p>Proyecto recomendado por IA basado en compatibilidad directa.</p>
                        <p className="mt-3 text-xs uppercase tracking-[0.2em] text-slate-500">{new Date(m.createdAt).toLocaleDateString('es-CO')}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-3xl border border-slate-700/50 bg-slate-900/40 p-8 text-center text-slate-400">
                    <p className="text-lg font-semibold text-white mb-3">Aún no hay recomendaciones de IA</p>
                    <p className="text-sm">Conecta tu proyecto y deja que la IA genere matches con mentores e inversionistas reales.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Panel (Interacciones) */}
          <div className="bg-slate-800/50 backdrop-blur-md rounded-3xl p-8 border border-slate-700/50 h-full flex flex-col">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
              <Bell className="text-amber-400" /> Interacciones
            </h2>
            
            <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
              {matches.map((m) => (
                <div key={m.id} className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/20 hover:bg-indigo-900/30 transition-all">
                  <div className="flex gap-3 items-start">
                    <div className="w-2 h-2 mt-2 rounded-full bg-indigo-400 shrink-0 animate-pulse" />
                    <div>
                      <p className="text-sm text-white font-semibold">¡Nuevo Match IA!</p>
                      <p className="text-xs text-slate-300 mt-1">
                        Tu proyecto <span className="text-indigo-300 font-medium">{m.projectTitle}</span> tiene compatibilidad del <span className="text-amber-400 font-bold">{m.matchScore}%</span> con {m.investorName || 'Perfil Recomendado'}.
                      </p>
                      <p className="text-[10px] text-slate-500 mt-2 uppercase font-bold">
                        {new Date(m.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {matches.length === 0 && (
                <>
                  {/* Notification Item */}
                  <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-700/50 hover:bg-slate-800 transition-all">
                    <div className="flex gap-3 items-start">
                      <div className="w-2 h-2 mt-2 rounded-full bg-amber-400 shrink-0" />
                      <div>
                        <p className="text-sm text-white font-medium">Nuevo mensaje de Inversor</p>
                        <p className="text-xs text-slate-400 mt-1">Juan Perez está interesado en EcoDelivery.</p>
                        <p className="text-[10px] text-slate-500 mt-2 uppercase font-bold">Hace 2 horas</p>
                      </div>
                    </div>
                  </div>

                  {/* Notification Item */}
                  <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-700/50 hover:bg-slate-800 transition-all">
                    <div className="flex gap-3 items-start">
                      <div className="w-2 h-2 mt-2 rounded-full bg-blue-400 shrink-0" />
                      <div>
                        <p className="text-sm text-white font-medium">Análisis Financiero Completo</p>
                        <p className="text-xs text-slate-400 mt-1">La IA ha terminado de optimizar tu modelo de FinTech App.</p>
                        <p className="text-[10px] text-slate-500 mt-2 uppercase font-bold">Hace 5 horas</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  )
}
