'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { useAuth } from '@/context/AuthContext'
import { ProjectService } from '@/services/projectService'
import { Alert } from '@/components/Alert'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, ChevronLeft, Sparkles, Target, Lightbulb, Workflow } from 'lucide-react'

function CreateProjectContent() {
  const [step, setStep] = useState(1)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [what, setWhat] = useState('')
  const [how, setHow] = useState('')
  const [why, setWhy] = useState('')
  const [projectType, setProjectType] = useState(1)
  const [businessModelType, setBusinessModelType] = useState(1)
  
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { user, token } = useAuth()
  const router = useRouter()

  const handleNext = () => {
    if (step === 1 && (!title.trim() || !description.trim())) {
      setError('Por favor completa el título y descripción básicos.')
      return
    }
    setError('')
    setStep(prev => Math.min(prev + 1, 3))
  }

  const handlePrev = () => setStep(prev => Math.max(prev - 1, 1))

  const handleSubmit = async () => {
    setError('')
    
    if (!what.trim() || !how.trim() || !why.trim()) {
      setError('Debes completar el Qué, Cómo y Por Qué.')
      return
    }

    if (!user || !token) {
      setError('Error de autenticación')
      return
    }

    setLoading(true)

    try {
      await ProjectService.createProject(
        {
          ownerId: user.userId,
          title,
          description,
          what,
          how,
          why,
          projectType,
          businessModelType
        } as any,
        token
      )
      
      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear el proyecto')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0f172a] py-12 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-2xl w-full px-4 relative z-10">
        
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">Wizard de Ideación</h1>
          <p className="text-slate-400">Da vida a tu idea en 3 simples pasos (Framework 5W1H)</p>
        </div>

        {/* Progress Tracker */}
        <div className="flex justify-center mb-12">
          <div className="flex items-center gap-4">
            {[1, 2, 3].map((num) => (
              <div key={num} className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-500 ${
                  step >= num ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/40' : 'bg-slate-800 text-slate-500'
                }`}>
                  {num}
                </div>
                {num < 3 && (
                  <div className={`w-12 h-1 rounded-full transition-all duration-500 ${
                    step > num ? 'bg-blue-600' : 'bg-slate-800'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {error && <Alert type="error" message={error} onClose={() => setError('')} />}

        {/* Wizard Card */}
        <div className="bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 shadow-2xl">
          <AnimatePresence mode="wait">
            
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-3 mb-6 text-blue-400">
                  <Lightbulb size={24} />
                  <h2 className="text-2xl font-bold text-white">Concepto Base</h2>
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-slate-400 uppercase tracking-wide mb-2">Nombre del Proyecto</label>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ej: EcoDelivery"
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl p-4 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-400 uppercase tracking-wide mb-2">Descripción Corta</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Un breve resumen general..."
                    rows={3}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl p-4 text-white focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-400 uppercase tracking-wide mb-2">Tipo</label>
                    <select 
                      value={projectType} 
                      onChange={e => setProjectType(Number(e.target.value))}
                      className="w-full bg-slate-900/50 border border-slate-700 rounded-xl p-3 text-white outline-none"
                    >
                      <option value={1}>Producto</option>
                      <option value={2}>Servicio</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-400 uppercase tracking-wide mb-2">Modelo</label>
                    <select 
                      value={businessModelType} 
                      onChange={e => setBusinessModelType(Number(e.target.value))}
                      className="w-full bg-slate-900/50 border border-slate-700 rounded-xl p-3 text-white outline-none"
                    >
                      <option value={1}>Necesidad (Resolver dolor)</option>
                      <option value={2}>Oportunidad (Crear valor)</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-3 mb-6 text-indigo-400">
                  <Target size={24} />
                  <h2 className="text-2xl font-bold text-white">Definición Estratégica (What / Why)</h2>
                </div>
                
                <div className="relative">
                  <label className="block text-sm font-bold text-slate-400 uppercase tracking-wide mb-2">¿Qué haces? (What)</label>
                  <textarea
                    value={what}
                    onChange={(e) => setWhat(e.target.value.slice(0, 280))}
                    placeholder="Describe exactamente qué es tu solución de manera concreta."
                    rows={4}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl p-4 text-white focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                  />
                  <span className={`absolute bottom-4 right-4 text-xs font-bold ${what.length === 280 ? 'text-red-400' : 'text-slate-500'}`}>
                    {what.length}/280
                  </span>
                </div>

                <div className="relative">
                  <label className="block text-sm font-bold text-slate-400 uppercase tracking-wide mb-2">¿Por qué lo haces? (Why)</label>
                  <textarea
                    value={why}
                    onChange={(e) => setWhy(e.target.value.slice(0, 280))}
                    placeholder="¿Cuál es tu propósito o la razón principal de existir?"
                    rows={4}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl p-4 text-white focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                  />
                  <span className={`absolute bottom-4 right-4 text-xs font-bold ${why.length === 280 ? 'text-red-400' : 'text-slate-500'}`}>
                    {why.length}/280
                  </span>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-3 mb-6 text-purple-400">
                  <Workflow size={24} />
                  <h2 className="text-2xl font-bold text-white">Operativa (How)</h2>
                </div>
                
                <div className="relative">
                  <label className="block text-sm font-bold text-slate-400 uppercase tracking-wide mb-2">¿Cómo lo logras? (How)</label>
                  <textarea
                    value={how}
                    onChange={(e) => setHow(e.target.value.slice(0, 280))}
                    placeholder="¿Cómo funciona? ¿Cuál es el proceso clave detrás de tu magia?"
                    rows={6}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl p-4 text-white focus:ring-2 focus:ring-purple-500 outline-none resize-none"
                  />
                  <span className={`absolute bottom-4 right-4 text-xs font-bold ${how.length === 280 ? 'text-red-400' : 'text-slate-500'}`}>
                    {how.length}/280
                  </span>
                </div>

                <div className="bg-purple-500/10 border border-purple-500/20 rounded-2xl p-6 flex gap-4">
                  <Sparkles className="text-purple-400 shrink-0" />
                  <p className="text-sm text-purple-200">
                    Al finalizar, la IA de EmprendeIA analizará estas respuestas para generar tu Business Model Canvas y un reporte de Viabilidad Financiera.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Controls */}
          <div className="flex justify-between mt-8 pt-6 border-t border-slate-700/50">
            {step > 1 ? (
              <button 
                onClick={handlePrev}
                className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors px-4 py-2 font-bold"
              >
                <ChevronLeft size={20} /> Atrás
              </button>
            ) : (
              <Link href="/dashboard">
                <button className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors px-4 py-2 font-bold">
                  Cancelar
                </button>
              </Link>
            )}

            {step < 3 ? (
              <button 
                onClick={handleNext}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all"
              >
                Siguiente <ChevronRight size={20} />
              </button>
            ) : (
              <button 
                onClick={handleSubmit}
                disabled={loading}
                className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-purple-500/20 ${
                  loading ? 'bg-slate-700 text-slate-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white'
                }`}
              >
                {loading ? 'Analizando...' : 'Finalizar y Crear'} 
                {!loading && <Sparkles size={18} />}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}

export default function CreateProjectPage() {
  return (
    <ProtectedRoute>
      <CreateProjectContent />
    </ProtectedRoute>
  )
}
