'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { useAuth } from '@/context/AuthContext'
import { ProjectService } from '@/services/projectService'
import { FinancialService } from '@/services/financialService'
import { Alert } from '@/components/Alert'
import Link from 'next/link'
import { Project, FinancialAnalysis } from '@/types'
import { FinancialDashboard } from '@/components/FinancialDashboard'
import { LayoutDashboard, FileText, BarChart3, ChevronLeft, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

type TabType = 'info' | 'bmc' | 'financial'

function ProjectDetailContent() {
  const [project, setProject] = useState<Project | null>(null)
  const [bmc, setBmc] = useState<any>(null)
  const [financials, setFinancials] = useState<FinancialAnalysis | null>(null)
  const [activeTab, setActiveTab] = useState<TabType>('info')
  const [loading, setLoading] = useState(true)
  const [loadingIA, setLoadingIA] = useState(false)
  const [error, setError] = useState('')
  const { token } = useAuth()
  const params = useParams()
  const projectId = params.id as string

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!token) return
        const projectData = await ProjectService.getProjectById(projectId, token)
        setProject(projectData)
        
        // Cargar BMC si existe
        const bmcData = await ProjectService.getBmc(projectId, token)
        if (bmcData) {
          setBmc(bmcData)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar el proyecto')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [token, projectId])

  const loadFinancials = async () => {
    if (!token || financials) return
    try {
      const data = await FinancialService.getAnalysisByProjectId(projectId, token)
      setFinancials(data)
    } catch (err) {
      console.error('Error loading financials', err)
    }
  }

  const handleGenerateIA = async () => {
    if (!token) return
    setLoadingIA(true)
    setError('')
    try {
      const data = await ProjectService.generateBmc(projectId, token)
      // La respuesta del generador puede venir anidada o plana
      const bmcResult = data.bmc || data
      setBmc(bmcResult)
      setActiveTab('bmc')
    } catch (err) {
      setError('No se pudo generar el BMC. Verifica que el microservicio de IA esté activo.')
    } finally {
      setLoadingIA(false)
    }
  }

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab)
    if (tab === 'financial') loadFinancials()
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-50">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <Link 
          href="/projects" 
          className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors mb-6 font-medium group"
        >
          <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          Volver a Proyectos
        </Link>

        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 overflow-hidden border border-slate-100">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 md:p-12 text-white">
            <div className="flex flex-col md:flex-row justify-between items-start gap-6">
              <div>
                <motion.h1 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-4xl md:text-5xl font-black mb-4 tracking-tight"
                >
                  {project?.title}
                </motion.h1>
                <div className="flex items-center gap-2 text-blue-100 bg-white/10 px-4 py-1 rounded-full w-fit backdrop-blur-sm border border-white/10">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-sm font-medium">Estado: Fase de Ideación</span>
                </div>
              </div>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleGenerateIA}
                disabled={loadingIA}
                className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-bold transition-all ${
                  loadingIA ? 'bg-white/20' : 'bg-white text-blue-600 hover:shadow-2xl hover:shadow-white/20'
                } backdrop-blur-md shadow-lg`}
              >
                {loadingIA ? (
                  <>⌛ Analizando...</>
                ) : (
                  <>
                    <Sparkles size={20} />
                    Analizar con IA
                  </>
                )}
              </motion.button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-100 px-8 bg-white sticky top-0 z-10">
            <TabButton 
              active={activeTab === 'info'} 
              onClick={() => handleTabChange('info')}
              icon={<LayoutDashboard size={18} />}
              label="Información General"
            />
            <TabButton 
              active={activeTab === 'bmc'} 
              onClick={() => handleTabChange('bmc')}
              icon={<FileText size={18} />}
              label="Business Canvas"
            />
            <TabButton 
              active={activeTab === 'financial'} 
              onClick={() => handleTabChange('financial')}
              icon={<BarChart3 size={18} />}
              label="Análisis Financiero"
            />
          </div>

          {/* Content Area */}
          <div className="p-8 md:p-12">
            <AnimatePresence mode="wait">
              {activeTab === 'info' && (
                <motion.div
                  key="info"
                  initial={{ opacity: 0, opacity: 0 }}
                  animate={{ opacity: 1, opacity: 1 }}
                  exit={{ opacity: 0, opacity: 0 }}
                  className="space-y-6"
                >
                  <div className="prose prose-slate max-w-none">
                    <h3 className="text-2xl font-bold text-slate-800 mb-4">Sobre este emprendimiento</h3>
                    <p className="text-slate-600 text-lg leading-relaxed bg-slate-50 p-6 rounded-2xl border border-slate-100">
                      {project?.description}
                    </p>
                  </div>
                </motion.div>
              )}

              {activeTab === 'bmc' && (
                <motion.div
                  key="bmc"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {!bmc ? (
                    <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                      <FileText size={48} className="mx-auto text-slate-300 mb-4" />
                      <h3 className="text-xl font-bold text-slate-800 mb-2">No se ha generado el Canvas</h3>
                      <p className="text-slate-500 mb-6">Usa el botón de "Analizar con IA" para crear tu Business Model Canvas.</p>
                      <button 
                        onClick={handleGenerateIA}
                        className="text-blue-600 font-bold hover:underline"
                      >
                        Generar ahora →
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-3 bg-slate-100 p-3 rounded-3xl border border-slate-200">
                      <CanvasBlock title="Aliados Clave" items={bmc.keyPartners || bmc.key_partners} color="bg-white" className="md:row-span-2" />
                      <div className="md:col-span-1 grid grid-rows-2 gap-3">
                        <CanvasBlock title="Actividades Clave" items={bmc.keyActivities || bmc.key_activities} color="bg-white" />
                        <CanvasBlock title="Recursos Clave" items={bmc.keyResources || bmc.key_resources} color="bg-white" />
                      </div>
                      <CanvasBlock title="Propuesta de Valor" items={bmc.valueProposition || bmc.value_proposition} color="bg-blue-50 border-blue-100" className="md:row-span-2" />
                      <div className="md:col-span-1 grid grid-rows-2 gap-3">
                        <CanvasBlock title="Relación con Clientes" items={bmc.customerRelationships || bmc.customer_relationships} color="bg-white" />
                        <CanvasBlock title="Canales" items={bmc.channels} color="bg-white" />
                      </div>
                      <CanvasBlock title="Segmentos de Clientes" items={bmc.customerSegments || bmc.customer_segments} color="bg-white" className="md:row-span-2" />
                      <CanvasBlock title="Estructura de Costos" items={bmc.costStructure || bmc.cost_structure} color="bg-white" className="md:col-span-2" />
                      <div className="hidden md:block" />
                      <CanvasBlock title="Fuentes de Ingresos" items={bmc.revenueStreams || bmc.revenue_streams} color="bg-white" className="md:col-span-2" />
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'financial' && (
                <motion.div
                  key="financial"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {financials ? (
                    <FinancialDashboard analysis={financials} />
                  ) : (
                    <div className="flex justify-center items-center py-20">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}

function TabButton({ active, onClick, icon, label }: any) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 py-6 px-6 font-bold text-sm transition-all relative ${
        active ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
      }`}
    >
      {icon}
      <span className="hidden md:inline">{label}</span>
      {active && (
        <motion.div 
          layoutId="activeTab" 
          className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t-full" 
        />
      )}
    </button>
  )
}

function CanvasBlock({ title, items, color, className = "" }: any) {
  return (
    <div className={`${color} p-5 border border-slate-200 rounded-2xl shadow-sm ${className} hover:shadow-md transition-shadow`}>
      <h3 className="font-black text-[10px] text-slate-400 uppercase mb-4 tracking-widest">{title}</h3>
      <ul className="space-y-3">
        {items?.map((item: string, index: number) => (
          <li key={index} className="text-xs leading-relaxed text-slate-700 flex gap-2 font-medium">
            <span className="text-blue-400 mt-1">•</span> {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function ProjectDetailPage() {
  return (
    <ProtectedRoute>
      <ProjectDetailContent />
    </ProtectedRoute>
  )
}
