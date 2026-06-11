'use client'

import { useState, useEffect, type DragEvent } from 'react'
import { useParams } from 'next/navigation'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { useAuth } from '@/context/AuthContext'
import { ProjectService } from '@/services/projectService'
import { FinancialService } from '@/services/financialService'
import { BusinessPlanService } from '@/services/businessPlanService'
import { MilestoneService } from '@/services/milestoneService'
import { ResourcesService } from '@/services/resourcesService'
import { MatchingService, MatchDto } from '@/services/matchingService'
import { Alert } from '@/components/Alert'
import { Button } from '@/components/Button'
import { FinancialChart } from '@/components/FinancialChart'
import TiptapEditor from '@/components/TiptapEditor'
import Link from 'next/link'
import { Project, FinancialAnalysis } from '@/types'
import { FinancialDashboard } from '@/components/FinancialDashboard'
import { SemaforoFinanciero } from '@/components/SemaforoFinanciero'
import { LayoutDashboard, FileText, BarChart3, ChevronLeft, Sparkles, ShoppingCart, Plus, Edit2, Check, X, Zap, Users, Lock } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { API_URL } from '@/config'

type TabType = 'info' | 'bmc' | 'businessPlan' | 'milestones' | 'resources' | 'financial' | 'marketplace'

type ProjectUpdatePayload = {
  id: string
  title: string
  description: string
  what: string
  how: string
  why: string
  projectType: string
  businessModelType: string
  stage: string
}

const stageOptions = [
  { value: 'Idea', label: 'Idea' },
  { value: 'Validacion', label: 'Validación' },
  { value: 'Prototipo', label: 'Prototipo' },
  { value: 'Tracción', label: 'Tracción' },
  { value: 'Crecimiento', label: 'Crecimiento' }
]

function ProjectDetailContent() {
  const [project, setProject] = useState<Project | null>(null)
  const [bmc, setBmc] = useState<any>(null)
  const [financials, setFinancials] = useState<FinancialAnalysis | null>(null)
  const [activeTab, setActiveTab] = useState<TabType>('info')
  const [loading, setLoading] = useState(true)
  const [loadingIA, setLoadingIA] = useState(false)
  const [loadingFinancials, setLoadingFinancials] = useState(false)
  const [isEditingProject, setIsEditingProject] = useState(false)
  const [isEditingBmc, setIsEditingBmc] = useState(false)
  const [isEditingFinancials, setIsEditingFinancials] = useState(false)
  const [isAddingProduct, setIsAddingProduct] = useState(false)
  const [productForm, setProductForm] = useState({ name: '', description: '', price: 0, category: 'Otro', imageUrl: '' })
  const [businessPlan, setBusinessPlan] = useState('')
  const [loadingBusinessPlan, setLoadingBusinessPlan] = useState(false)
  const [isGeneratingBusinessPlan, setIsGeneratingBusinessPlan] = useState(false)
  const [isSavingBusinessPlan, setIsSavingBusinessPlan] = useState(false)
  const [isUploadingDocument, setIsUploadingDocument] = useState(false)
  const [isDragActive, setIsDragActive] = useState(false)
  const [documentMessage, setDocumentMessage] = useState('')
  const [milestones, setMilestones] = useState<any[]>([])
  const [loadingMilestones, setLoadingMilestones] = useState(false)
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('')
  const [newMilestoneDate, setNewMilestoneDate] = useState('')
  const [resources, setResources] = useState<any[]>([])
  const [loadingResources, setLoadingResources] = useState(false)
  const [editForm, setEditForm] = useState({ title: '', description: '', stage: '', what: '', how: '', why: '' })
  const [matches, setMatches] = useState<MatchDto[]>([])
  const [loadingMatches, setLoadingMatches] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const { token, user } = useAuth()
  const params = useParams()
  const projectId = params.id as string
  const isViewer = user?.role === 'Investor' || user?.role === 'Mentor'

  const stage = project?.stage || ''
  const isIdeation = stage === 'Idea' || stage === 'Ideación'
  const financialLocked = isIdeation
  const marketplaceLocked = isIdeation || stage === 'Prototipo'

  const buildProjectUpdatePayload = (updatedStage?: string): ProjectUpdatePayload => {
    if (!project) {
      throw new Error('Project not loaded')
    }

    return {
      id: projectId,
      title: editForm.title,
      description: editForm.description,
      what: project.what ?? '',
      how: project.how ?? '',
      why: project.why ?? '',
      projectType: project.projectType ?? 'Producto',
      businessModelType: project.businessModelType ?? 'Necesidad',
      stage: updatedStage ?? editForm.stage ?? project.stage
    }
  }

  const handleChangeStage = async (newStage: string) => {
    if (!token || !project) return
    setError('')
    const prev = project.stage
    try {
      // optimistic update
      setProject({ ...project, stage: newStage })
      setEditForm({ ...editForm, stage: newStage })
      await ProjectService.updateProject(projectId, buildProjectUpdatePayload(newStage), token)
      setSuccess('Etapa actualizada')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      // revert
      setProject({ ...project, stage: prev })
      setEditForm({ ...editForm, stage: prev })
      setError('No se pudo actualizar la etapa')
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!token) return
        const projectData = await ProjectService.getProjectById(projectId, token)
        setProject(projectData)
        setEditForm({ 
          title: projectData.title, 
          description: projectData.description, 
          stage: projectData.stage,
          what: projectData.what ?? '',
          how: projectData.how ?? '',
          why: projectData.why ?? ''
        })
        
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

  useEffect(() => {
    const fetchBusinessPlan = async () => {
      try {
        if (!token) return
        setLoadingBusinessPlan(true)
        const planData = await BusinessPlanService.getBusinessPlan(projectId, token)
        setBusinessPlan(planData?.content ?? '')
      } catch (err) {
        console.warn('No hay plan de negocios disponible aún', err)
      } finally {
        setLoadingBusinessPlan(false)
      }
    }

    fetchBusinessPlan()
  }, [projectId, token])

  const loadFinancials = async () => {
    if (!token || financials || loadingFinancials) return
    setLoadingFinancials(true)
    try {
      const data = await FinancialService.getAnalysisByProjectId(projectId, token)
      setFinancials(data)
    } catch (err) {
      console.warn('Analysis not found or error loading', err)
      setFinancials(null)
    } finally {
      setLoadingFinancials(false)
    }
  }

  const handleGenerateFinancials = async () => {
    if (!token || loadingFinancials) return
    setLoadingFinancials(true)
    setError('')
    try {
      const data = await FinancialService.generateAnalysis(projectId, token)
      setFinancials(data)
    } catch (err) {
      setError('No se pudo generar el análisis financiero. Reintenta en unos momentos.')
    } finally {
      setLoadingFinancials(false)
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
    if ((tab === 'financial' && financialLocked) || (tab === 'marketplace' && marketplaceLocked)) return
    setActiveTab(tab)
    if (tab === 'financial') loadFinancials()
    if (tab === 'marketplace') loadProjectMatches()
    if (tab === 'milestones') loadMilestones()
    if (tab === 'resources') loadResources()
  }

  const loadMilestones = async () => {
    if (!token || loadingMilestones) return
    setLoadingMilestones(true)
    try {
      const data = await MilestoneService.getMilestones(projectId, token)
      setMilestones(data)
    } catch (err) {
      console.warn('No se pudieron cargar los hitos', err)
      setMilestones([])
    } finally {
      setLoadingMilestones(false)
    }
  }

  const handleCreateMilestone = async () => {
    if (!token || !newMilestoneTitle) return
    try {
      setLoading(true)
      const created = await MilestoneService.createMilestone(projectId, newMilestoneTitle, newMilestoneDate || null, token)
      setMilestones(prev => [created, ...prev])
      setNewMilestoneTitle('')
      setNewMilestoneDate('')
    } catch (err) {
      setError('No se pudo crear el hito')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleMilestone = async (mId: string) => {
    if (!token) return
    try {
      // determine current and next value for optimistic update
      const current = milestones.find(m => m.id === mId)
      const next = !current?.isCompleted
      await MilestoneService.toggleMilestone(projectId, mId, token)
      // optimistic refresh
      setMilestones(prev => prev.map(m => m.id === mId ? { ...m, isCompleted: next } : m))
    } catch (err) {
      setError('No se pudo actualizar el hito')
    }
  }

  const loadResources = async () => {
    if (!token || loadingResources) return
    setLoadingResources(true)
    try {
      const data = await ResourcesService.getResources(project?.stage ?? null, token)
      setResources(data)
    } catch (err) {
      console.warn('Error loading resources', err)
      setResources([])
    } finally {
      setLoadingResources(false)
    }
  }

  const handleGenerateBusinessPlan = async () => {
    if (!token) return
    setIsGeneratingBusinessPlan(true)
    setError('')
    try {
      const data = await BusinessPlanService.generateBusinessPlan(projectId, token)
      setBusinessPlan(data?.content ?? '')
      setSuccess('Plan de negocios generado con éxito por la IA')
      setActiveTab('businessPlan')
      setTimeout(() => setSuccess(''), 4000)
    } catch (err) {
      setError('No se pudo generar el plan de negocios. Verifica el microservicio de IA.')
    } finally {
      setIsGeneratingBusinessPlan(false)
    }
  }

  const handleSaveBusinessPlan = async () => {
    if (!token) return
    setIsSavingBusinessPlan(true)
    setError('')
    try {
      await BusinessPlanService.updateBusinessPlan(projectId, businessPlan, token)
      setSuccess('Plan de negocios guardado correctamente')
      setTimeout(() => setSuccess(''), 4000)
    } catch {
      setError('No se pudo guardar el plan de negocios')
    } finally {
      setIsSavingBusinessPlan(false)
    }
  }

  const handleDocumentUpload = async (file: File) => {
    if (!token) return
    setIsUploadingDocument(true)
    setError('')
    setDocumentMessage('')
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch(`${API_URL}/projects/${projectId}/documents`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Error en la carga del documento')
      }

      setDocumentMessage('Documento analizado con éxito por la IA')
      setSuccess('Documento analizado con éxito por la IA')
      setTimeout(() => setSuccess(''), 4000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo subir el documento')
    } finally {
      setIsUploadingDocument(false)
    }
  }

  const handleDrop = async (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragActive(false)
    const file = event.dataTransfer.files[0]
    if (!file) return
    if (!/\.(pdf|txt|docx)$/i.test(file.name)) {
      setError('Solo se aceptan archivos PDF, TXT o DOCX')
      return
    }
    await handleDocumentUpload(file)
  }

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragActive(true)
  }

  const handleDragLeave = () => {
    setIsDragActive(false)
  }

  const loadProjectMatches = async () => {
    if (!token || loadingMatches) return
    setLoadingMatches(true)
    try {
      const data = await MatchingService.getProjectMatches(projectId, token)
      setMatches(data)
    } catch {
      // Silently ignore — no matches yet
    } finally {
      setLoadingMatches(false)
    }
  }

  const handleGenerateMatches = async () => {
    if (!token) return
    const bmcText = bmc
      ? Object.values(bmc).filter(Boolean).join(' ')
      : project?.description ?? ''
    setLoadingMatches(true)
    setError('')
    try {
      const result = await MatchingService.generateMatches(projectId, bmcText, token)
      setSuccess(result.message)
      setTimeout(() => setSuccess(''), 4000)
      await loadProjectMatches()
    } catch {
      setError('No se pudieron generar los matches. Verifica que el microservicio de IA esté activo.')
    } finally {
      setLoadingMatches(false)
    }
  }

  const handleUpdateProject = async () => {
    if (!token || !project) return
    try {
      setLoading(true)
      await ProjectService.updateProject(projectId, buildProjectUpdatePayload(), token)
      const updated = await ProjectService.getProjectById(projectId, token)
      setProject(updated)
      setEditForm({
        title: updated.title,
        description: updated.description,
        stage: updated.stage,
        what: updated.what ?? '',
        how: updated.how ?? '',
        why: updated.why ?? ''
      })
      setIsEditingProject(false)
    } catch (err) {
      setError('Error al actualizar el proyecto')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateBmc = async () => {
    if (!token || !bmc) return
    try {
      setLoading(true)
      await ProjectService.updateBmc(projectId, bmc, token)
      setSuccess('BMC actualizado correctamente')
      setIsEditingBmc(false)
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError('Error al actualizar el BMC')
    } finally {
      setLoading(false)
    }
  }

  const handleAddProduct = async () => {
    if (!token) return
    try {
      setLoading(true)
      const data = {
        projectId,
        name: productForm.name,
        description: productForm.description,
        price: productForm.price,
        category: productForm.category, // Backend classifies automatically if Category is ProductCategory.Otro
        images: [productForm.imageUrl].filter(Boolean)
      }
      const { MarketplaceService } = await import('@/services/marketplaceService')
      await MarketplaceService.createProduct(data, token)
      setSuccess('Producto publicado en el marketplace exitosamente. La IA lo clasificará automáticamente si seleccionaste "Otro".')
      setIsAddingProduct(false)
      setProductForm({ name: '', description: '', price: 0, category: 'Otro', imageUrl: '' })
      setTimeout(() => setSuccess(''), 4000)
    } catch (err) {
      setError('Error al publicar el producto')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateFinancials = async () => {
    if (!token || !financials) return
    try {
      setLoading(true)
      await FinancialService.updateAnalysis(projectId, financials, token)
      setSuccess('Análisis financiero actualizado correctamente')
      setIsEditingFinancials(false)
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError('Error al actualizar el análisis financiero')
    } finally {
      setLoading(false)
    }
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
                  <span className="w-2 h-2 rounded-full animate-pulse" />
                  <span className="text-sm font-medium">Estado: {stage || 'Sin etapa definida'}</span>
                </div>
              </div>
              {isIdeation && (
                <div className="mt-6 rounded-3xl bg-gradient-to-r from-sky-600 to-indigo-700 text-white p-6 shadow-xl shadow-slate-900/20 border border-white/10">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-100 mb-3">Fase de Ideación</p>
                  <p className="text-base leading-7">
                    Estás en fase de Ideación. Completa tu BMC para avanzar a Prototipo y validar tu negocio.
                  </p>
                </div>
              )}
              {!isViewer && (
                <>
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
                  
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsEditingProject(!isEditingProject)}
                    className="flex items-center gap-2 px-6 py-4 rounded-2xl font-bold bg-white/10 hover:bg-white/20 transition-all backdrop-blur-md border border-white/20"
                  >
                    {isEditingProject ? 'Cancelar' : 'Editar Proyecto'}
                  </motion.button>
                </>
              )}
              {/* Stage selector */}
              {!isViewer && (
                <div className="flex items-center ml-4">
                  <select
                    aria-label="Cambiar etapa del proyecto"
                    value={project?.stage || ''}
                    onChange={(e) => handleChangeStage(e.target.value)}
                    className="rounded-xl px-4 py-3 bg-white text-sm font-semibold text-slate-700 border border-slate-200"
                  >
                    <option value="">Sin etapa</option>
                    {stageOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              {isViewer && (
                <div className="flex items-center gap-2 px-6 py-4 rounded-2xl font-bold text-sm bg-white/10"> 
                  <a href={`mailto:${project?.ownerEmail || 'contacto@emprendeia.com'}?subject=${encodeURIComponent('Interés en ' + (project?.title || 'tu proyecto'))}`} className="text-blue-600 font-bold">Contactar Emprendedor</a>
                </div>
              )}
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
              active={activeTab === 'businessPlan'} 
              onClick={() => handleTabChange('businessPlan')}
              icon={<Sparkles size={18} />}
              label="Plan de Negocios"
            />
            <TabButton 
              active={activeTab === 'milestones'} 
              onClick={() => handleTabChange('milestones')}
              icon={<Plus size={16} />}
              label="Hitos"
            />
            <TabButton 
              active={activeTab === 'resources'} 
              onClick={() => handleTabChange('resources')}
              icon={<LayoutDashboard size={16} />}
              label="Recursos"
            />
            <TabButton 
              active={activeTab === 'financial'} 
              onClick={() => handleTabChange('financial')}
              icon={<BarChart3 size={18} />}
              label="Análisis Financiero"
              disabled={financialLocked}
            />
            <TabButton 
              active={activeTab === 'marketplace'} 
              onClick={() => handleTabChange('marketplace')}
              icon={<ShoppingCart size={18} />}
              label="Marketplace"
              disabled={marketplaceLocked}
            />
          </div>

          {/* Content Area */}
          <div className="p-8 md:p-12">
            {error && <Alert type="error" message={error} />}
            {success && <Alert type="success" message={success} />}
            <AnimatePresence mode="wait">
              {activeTab === 'info' && (
                <motion.div
                  key="info"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="prose prose-slate max-w-none">
                    <h3 className="text-2xl font-bold text-slate-800 mb-4">Sobre este emprendimiento</h3>
                    {isEditingProject ? (
                      <div className="space-y-4 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                        <div>
                          <label className="block text-sm font-bold text-slate-400 uppercase mb-2">Título</label>
                          <input 
                            value={editForm.title} 
                            onChange={e => setEditForm({...editForm, title: e.target.value})}
                            className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-slate-800"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-slate-400 uppercase mb-2">Descripción</label>
                          <textarea 
                            value={editForm.description} 
                            rows={4}
                            onChange={e => setEditForm({...editForm, description: e.target.value})}
                            className="w-full bg-slate-50 border-none rounded-2xl p-4 text-slate-700 font-medium"
                          />
                        </div>
                        <div className="border-t border-slate-200 pt-4 mt-4">
                          <h4 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                            🧬 <span>ADN del Proyecto</span>
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">¿Qué hace? (What)</label>
                              <textarea 
                                value={editForm.what}
                                rows={3}
                                onChange={e => setEditForm({...editForm, what: e.target.value})}
                                placeholder="Describe la solución o producto que ofreces"
                                className="w-full bg-blue-50 border border-blue-100 rounded-xl p-3 text-slate-700 font-medium text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">¿Cómo lo hace? (How)</label>
                              <textarea 
                                value={editForm.how}
                                rows={3}
                                onChange={e => setEditForm({...editForm, how: e.target.value})}
                                placeholder="Explica tu modelo de negocio o metodología"
                                className="w-full bg-purple-50 border border-purple-100 rounded-xl p-3 text-slate-700 font-medium text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">¿Por qué lo hace? (Why)</label>
                              <textarea 
                                value={editForm.why}
                                rows={3}
                                onChange={e => setEditForm({...editForm, why: e.target.value})}
                                placeholder="Tu misión, visión o propósito"
                                className="w-full bg-green-50 border border-green-100 rounded-xl p-3 text-slate-700 font-medium text-sm"
                              />
                            </div>
                          </div>
                        </div>
                        <Button onClick={handleUpdateProject} className="w-full py-4">Guardar Cambios</Button>
                      </div>
                    ) : (
                      <>
                        <p className="text-slate-600 text-lg leading-relaxed bg-slate-50 p-6 rounded-2xl border border-slate-100">
                          {project?.description}
                        </p>
                        {(project?.what || project?.how || project?.why) && (
                          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                            {project?.what && (
                              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                                <h5 className="text-sm font-bold text-blue-900 mb-2">🤔 ¿Qué?</h5>
                                <p className="text-sm text-blue-800">{project.what}</p>
                              </div>
                            )}
                            {project?.how && (
                              <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                                <h5 className="text-sm font-bold text-purple-900 mb-2">⚙️ ¿Cómo?</h5>
                                <p className="text-sm text-purple-800">{project.how}</p>
                              </div>
                            )}
                            {project?.why && (
                              <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                                <h5 className="text-sm font-bold text-green-900 mb-2">💚 ¿Por qué?</h5>
                                <p className="text-sm text-green-800">{project.why}</p>
                              </div>
                            )}
                          </div>
                        )}
                        <div className="mt-8">
                          <h4 className="text-lg font-bold text-slate-800 mb-3">Subir documento para análisis de IA</h4>
                          <div
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            className={`rounded-3xl border-2 border-dashed p-10 text-center transition ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-white'} ${isUploadingDocument ? 'opacity-60' : ''}`}
                          >
                            <p className="text-slate-500 text-sm mb-4">Arrastra un archivo PDF, TXT o DOCX aquí para que la IA lo analice.</p>
                            <p className="text-slate-400 text-xs">También puedes hacer clic y soltar el archivo directamente.</p>
                            {isUploadingDocument && (
                              <p className="text-blue-600 font-semibold mt-4">Subiendo documento...</p>
                            )}
                          </div>
                          {documentMessage && (
                            <div className="mt-4 rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-emerald-700 font-medium">
                              {documentMessage}
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab === 'milestones' && (
                <motion.div key="milestones" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="text-2xl font-bold">Hitos del Proyecto</h3>
                      <p className="text-slate-500">Gestiona y marca los hitos alcanzados.</p>
                    </div>
                    {!isViewer && (
                      <div className="flex items-center gap-3">
                        <input value={newMilestoneTitle} onChange={e => setNewMilestoneTitle(e.target.value)} placeholder="Título del hito" className="p-3 rounded-xl border" />
                        <input type="date" value={newMilestoneDate} onChange={e => setNewMilestoneDate(e.target.value)} className="p-3 rounded-xl border" />
                        <Button onClick={handleCreateMilestone} className="rounded-2xl">Añadir Hito</Button>
                      </div>
                    )}
                  </div>

                  {loadingMilestones ? (
                    <div className="py-10 text-center">Cargando hitos...</div>
                  ) : (
                    <div className="space-y-3">
                      {milestones.length === 0 && <div className="text-slate-500">No hay hitos</div>}
                      {milestones.map(m => (
                        <div key={m.id} className="flex items-center justify-between bg-white p-4 rounded-2xl border">
                          <div className="flex items-center gap-4">
                            <input type="checkbox" checked={m.isCompleted} onChange={() => handleToggleMilestone(m.id)} disabled={isViewer} />
                            <div>
                              <div className="font-bold">{m.title}</div>
                              {m.dueDate && <div className="text-xs text-slate-400">Para: {new Date(m.dueDate).toLocaleDateString()}</div>}
                            </div>
                          </div>
                          <div className="text-sm text-slate-500">{m.isCompleted ? 'Completado' : 'Pendiente'}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'resources' && (
                <motion.div key="resources" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="text-2xl font-bold">Recursos Educativos</h3>
                      <p className="text-slate-500">Material recomendado según la fase de tu proyecto.</p>
                    </div>
                    <div>
                      <Button onClick={loadResources} className="rounded-2xl">Actualizar</Button>
                    </div>
                  </div>

                  {loadingResources ? (
                    <div className="py-10 text-center">Cargando recursos...</div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {resources.length === 0 && <div className="text-slate-500">No se encontraron recursos para esta fase.</div>}
                      {resources.map(r => (
                        <div key={r.id} className="bg-white p-4 rounded-2xl border">
                          <h4 className="font-bold mb-2">{r.title}</h4>
                          <p className="text-sm text-slate-600 mb-4">{r.description}</p>
                          {r.url && <a href={r.url} target="_blank" rel="noreferrer" className="text-blue-600 font-bold">Ver recurso</a>}
                        </div>
                      ))}
                    </div>
                  )}
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
                    <div className="space-y-6">
                      <div className="flex justify-between items-center bg-slate-900 rounded-3xl p-6 text-white shadow-xl shadow-slate-900/20">
                        <div>
                          <h3 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">Modelo de Negocio (BMC)</h3>
                          <p className="text-slate-400 mt-1">
                            {bmc.differential_name && <span className="font-bold text-indigo-300">Diferencial: {bmc.differential_name}</span>}
                          </p>
                        </div>
                        <div className="flex gap-4">
                          {!isViewer ? (
                            <>
                              <Button 
                                onClick={() => handleGenerateIA()}
                                className="rounded-xl px-6 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white shadow-lg shadow-purple-500/30 border-0"
                              >
                                <Zap size={18} className="mr-2" /> Optimizar con IA
                              </Button>
                              <Button 
                                onClick={() => isEditingBmc ? handleUpdateBmc() : setIsEditingBmc(true)}
                                className={`rounded-xl px-6 border-0 ${isEditingBmc ? 'bg-green-500 hover:bg-green-400 text-slate-900 shadow-lg shadow-green-500/30' : 'bg-slate-700 hover:bg-slate-600'}`}
                              >
                                {isEditingBmc ? <><Check size={18} className="mr-2"/> Guardar</> : <><Edit2 size={18} className="mr-2"/> Editar</>}
                              </Button>
                            </>
                          ) : null}
                        </div>
                      </div>

                      <div className="relative">
                        {/* Background for Glassmorphism */}
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-3xl -z-10" />
                        
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 p-2">
                        <CanvasBlock 
                          title="Aliados Clave" 
                          content={bmc.keyPartners || bmc.key_partners} 
                          isEditing={isEditingBmc}
                          onChange={(val: string) => setBmc({...bmc, keyPartners: val})}
                          color="bg-white" 
                          className="md:row-span-2" 
                        />
                        <div className="md:col-span-1 grid grid-rows-2 gap-3">
                          <CanvasBlock 
                            title="Actividades Clave" 
                            content={bmc.keyActivities || bmc.key_activities} 
                            isEditing={isEditingBmc}
                            onChange={(val: string) => setBmc({...bmc, keyActivities: val})}
                            color="bg-white" 
                          />
                          <CanvasBlock 
                            title="Recursos Clave" 
                            content={bmc.keyResources || bmc.key_resources} 
                            isEditing={isEditingBmc}
                            onChange={(val: string) => setBmc({...bmc, keyResources: val})}
                            color="bg-white" 
                          />
                        </div>
                        <CanvasBlock 
                          title="Propuesta de Valor" 
                          content={bmc.valueProposition || bmc.value_proposition} 
                          isEditing={isEditingBmc}
                          onChange={(val: string) => setBmc({...bmc, valueProposition: val})}
                          color="bg-blue-50 border-blue-100" 
                          className="md:row-span-2" 
                        />
                        <div className="md:col-span-1 grid grid-rows-2 gap-3">
                          <CanvasBlock 
                            title="Relación con Clientes" 
                            content={bmc.customerRelationships || bmc.customer_relationships} 
                            isEditing={isEditingBmc}
                            onChange={(val: string) => setBmc({...bmc, customerRelationships: val})}
                            color="bg-white" 
                          />
                          <CanvasBlock 
                            title="Canales" 
                            content={bmc.channels} 
                            isEditing={isEditingBmc}
                            onChange={(val: string) => setBmc({...bmc, channels: val})}
                            color="bg-white" 
                          />
                        </div>
                        <CanvasBlock 
                          title="Segmentos de Clientes" 
                          content={bmc.customerSegments || bmc.customer_segments} 
                          isEditing={isEditingBmc}
                          onChange={(val: string) => setBmc({...bmc, customerSegments: val})}
                          color="bg-white" 
                          className="md:row-span-2" 
                        />
                        <CanvasBlock 
                          title="Estructura de Costos" 
                          content={bmc.costStructure || bmc.cost_structure} 
                          isEditing={isEditingBmc}
                          onChange={(val: string) => setBmc({...bmc, costStructure: val})}
                          color="bg-white" 
                          className="md:col-span-2" 
                        />
                        <div className="hidden md:block" />
                        <CanvasBlock 
                          title="Fuentes de Ingresos" 
                          content={bmc.revenueStreams || bmc.revenue_streams} 
                          isEditing={isEditingBmc}
                          onChange={(val: string) => setBmc({...bmc, revenueStreams: val})}
                          color="bg-white" 
                          className="md:col-span-2" 
                        />
                      </div>
                    </div>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'businessPlan' && (
                <motion.div
                  key="businessPlan"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  <div className="flex flex-col md:flex-row justify-between items-start gap-4 bg-slate-900 p-6 rounded-3xl text-white shadow-xl shadow-slate-900/20">
                    <div>
                      <h3 className="text-2xl font-black">Plan de Negocios</h3>
                      <p className="text-slate-300 mt-2">Gestiona el plan y genera contenido con IA para avanzar tu modelo de negocio.</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                        {!isViewer && (
                          <>
                            <Button
                              onClick={handleGenerateBusinessPlan}
                              disabled={isGeneratingBusinessPlan}
                              className="rounded-2xl bg-gradient-to-r from-indigo-500 to-sky-500 text-white"
                            >
                              {isGeneratingBusinessPlan ? 'Generando...' : 'Generar Plan con IA'}
                            </Button>
                            <Button
                              onClick={handleSaveBusinessPlan}
                              disabled={isSavingBusinessPlan}
                              className="rounded-2xl bg-green-500 text-slate-900"
                            >
                              {isSavingBusinessPlan ? 'Guardando...' : 'Guardar Cambios'}
                            </Button>
                          </>
                        )}
                    </div>
                  </div>

                  {loadingBusinessPlan ? (
                    <div className="flex items-center justify-center py-20">
                      <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600" />
                    </div>
                  ) : (
                    <TiptapEditor
                      content={businessPlan}
                      onChange={setBusinessPlan}
                      editable={!isViewer}
                      label="Editor de Plan de Negocios"
                    />
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
                    <div className="space-y-6">
                      <div className="flex justify-between items-center">
                        <h3 className="text-xl font-bold text-slate-800">Proyecciones IA</h3>
                        {!isViewer && (
                          <Button 
                            onClick={() => isEditingFinancials ? handleUpdateFinancials() : setIsEditingFinancials(true)}
                            className={`rounded-xl px-6 ${isEditingFinancials ? 'bg-green-600 hover:bg-green-700' : 'bg-slate-800'}`}
                          >
                            {isEditingFinancials ? <><Check size={18} className="mr-2"/> Guardar Cambios</> : <><Edit2 size={18} className="mr-2"/> Editar Proyecciones</>}
                          </Button>
                        )}
                      </div>
                      
                      <SemaforoFinanciero isViable={true} />

                      <FinancialChart analysis={financials} />

                      <FinancialDashboard 
                        analysis={financials} 
                        isEditing={isEditingFinancials}
                        onChange={(updated) => setFinancials(updated)}
                      />
                    </div>
                  ) : loadingFinancials ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                      <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600" />
                      <p className="text-slate-500 font-medium animate-pulse">Generando proyecciones financieras...</p>
                    </div>
                  ) : (
                    <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                      <BarChart3 size={48} className="mx-auto text-slate-300 mb-4" />
                      <h3 className="text-xl font-bold text-slate-800 mb-2">Análisis Financiero No Encontrado</h3>
                      <p className="text-slate-500 mb-6">Es posible que el análisis aún se esté procesando o no se haya generado.</p>
                      <div className="flex justify-center gap-4">
                        <Button 
                          onClick={handleGenerateFinancials}
                          className="rounded-2xl px-8"
                        >
                          <Sparkles size={18} className="mr-2" />
                          Generar Análisis
                        </Button>
                        <Button 
                          onClick={() => { setFinancials(null); loadFinancials(); }}
                          className="rounded-2xl px-8 bg-slate-200 text-slate-700 hover:bg-slate-300"
                        >
                          Actualizar
                        </Button>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'marketplace' && (
                <motion.div
                  key="marketplace"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-2xl font-bold text-slate-800">Marketplace del Proyecto</h3>
                      <p className="text-slate-500">Publica tus servicios o productos para conectar con clientes.</p>
                    </div>
                    {!isViewer && (
                      <Button 
                        onClick={() => setIsAddingProduct(!isAddingProduct)}
                        className="rounded-2xl"
                      >
                        {isAddingProduct ? <><X size={18} className="mr-2"/> Cancelar</> : <><Plus size={18} className="mr-2"/> Publicar Producto</>}
                      </Button>
                    )}
                  </div>

                  {isAddingProduct && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      className="bg-slate-50 p-8 rounded-3xl border border-slate-200 overflow-hidden"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Nombre del Producto/Servicio</label>
                            <input 
                              value={productForm.name}
                              onChange={e => setProductForm({...productForm, name: e.target.value})}
                              placeholder="Ej: Consultoría en Marketing"
                              className="w-full bg-white border-slate-200 rounded-xl p-3 outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Categoría</label>
                            <select 
                              value={productForm.category}
                              onChange={e => setProductForm({...productForm, category: e.target.value})}
                              className="w-full bg-white border-slate-200 rounded-xl p-3 outline-none focus:ring-1 focus:ring-blue-500"
                            >
                              <option value="Servicio">Servicio</option>
                              <option value="Consultoria">Consultoría</option>
                              <option value="Digital">Digital</option>
                              <option value="Otro">Otro</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Precio ($)</label>
                            <input 
                              type="number"
                              value={productForm.price}
                              onChange={e => setProductForm({...productForm, price: Number(e.target.value)})}
                              className="w-full bg-white border-slate-200 rounded-xl p-3 outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">URL de Imagen</label>
                            <input 
                              value={productForm.imageUrl}
                              onChange={e => setProductForm({...productForm, imageUrl: e.target.value})}
                              placeholder="https://..."
                              className="w-full bg-white border-slate-200 rounded-xl p-3 outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Descripción</label>
                            <textarea 
                              value={productForm.description}
                              onChange={e => setProductForm({...productForm, description: e.target.value})}
                              rows={4}
                              placeholder="Describe lo que ofreces..."
                              className="w-full bg-white border-slate-200 rounded-xl p-3 outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="mt-8 flex justify-end">
                        <Button onClick={handleAddProduct} className="px-12 py-4 rounded-2xl shadow-lg shadow-blue-500/20">
                          Publicar ahora
                        </Button>
                      </div>
                    </motion.div>
                  )}

                  <div className="bg-blue-50 p-8 rounded-3xl border border-blue-100 flex items-center gap-6">
                    <div className="p-4 bg-white rounded-2xl shadow-sm text-blue-600">
                      <ShoppingCart size={32} />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-slate-800">Tus productos aparecen en el Marketplace general</h4>
                      <p className="text-slate-500">Cualquier usuario de la plataforma podrá ver y contactarte a través de esta sección.</p>
                    </div>
                  </div>

                  {/* AI Matching Section */}
                  <div className="mt-8 space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                          <Users size={22} className="text-indigo-500" />
                          Matches con Mentores e Inversores
                        </h4>
                        <p className="text-slate-500 text-sm">La IA analiza tu BMC y encuentra los perfiles más compatibles.</p>
                      </div>
                      <Button
                        onClick={handleGenerateMatches}
                        disabled={loadingMatches}
                        className="rounded-2xl px-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-0 shadow-lg shadow-indigo-500/30"
                      >
                        {loadingMatches
                          ? <><span className="animate-spin mr-2">⌛</span>Calculando...</>
                          : <><Sparkles size={18} className="mr-2" />Buscar Matches con IA</>
                        }
                      </Button>
                    </div>

                    {loadingMatches && matches.length === 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[1, 2, 3].map(n => (
                          <div key={n} className="bg-slate-100 rounded-2xl h-24 animate-pulse" />
                        ))}
                      </div>
                    )}

                    {!loadingMatches && matches.length === 0 && (
                      <div className="text-center py-12 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                        <Users size={40} className="mx-auto text-slate-300 mb-3" />
                        <p className="text-slate-500 font-medium">Aún no hay matches. Usa el botón para que la IA encuentre mentores e inversores compatibles.</p>
                      </div>
                    )}

                    {matches.length > 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {matches.map(match => (
                          <motion.div
                            key={match.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between"
                          >
                            <div className="flex items-center gap-4">
                              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-white text-lg ${
                                match.investorName?.toLowerCase().includes('mentor') ? 'bg-purple-500' : 'bg-blue-500'
                              }`}>
                                {match.investorName?.[0] ?? 'M'}
                              </div>
                              <div>
                                <p className="font-bold text-slate-800 text-sm">{match.investorName ?? 'Perfil Compatibles'}</p>
                                <p className="text-xs text-slate-400">{new Date(match.createdAt).toLocaleDateString('es-CO')}</p>
                              </div>
                            </div>
                            <div className={`px-4 py-1 rounded-full font-black text-sm ${
                              match.matchScore >= 85 ? 'bg-green-100 text-green-700' :
                              match.matchScore >= 70 ? 'bg-yellow-100 text-yellow-700' :
                              'bg-slate-100 text-slate-600'
                            }`}>
                              {match.matchScore.toFixed(0)}%
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}

function TabButton({ active, onClick, icon, label, disabled }: any) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-2 py-6 px-6 font-bold text-sm transition-all relative ${
        disabled ? 'text-slate-300 cursor-not-allowed opacity-70' : active ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
      }`}
    >
      {icon}
      <span className="hidden md:inline">{label}</span>
      {disabled ? <Lock size={16} className="text-slate-300" /> : null}
      {active && !disabled && (
        <motion.div 
          layoutId="activeTab" 
          className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t-full" 
        />
      )}
    </button>
  )
}

function CanvasBlock({ title, content, color, isEditing, onChange, className = "" }: any) {
  // Convertir a array si es necesario para visualización
  const items = Array.isArray(content) ? content : (content?.split('\n').filter((l: string) => l.trim()) || [])

  return (
    <div className={`bg-white/40 backdrop-blur-md p-5 border border-white/60 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] ${className} hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:bg-white/60 transition-all flex flex-col`}>
      <h3 className="font-black text-[11px] text-slate-500 uppercase mb-4 tracking-widest">{title}</h3>
      {isEditing ? (
        <textarea
          value={Array.isArray(content) ? content.join('\n') : content}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 w-full bg-white/50 border border-white rounded-2xl p-4 text-sm font-medium leading-relaxed focus:ring-2 focus:ring-blue-500 outline-none resize-none min-h-[120px]"
          placeholder={`Ingresa ${title.toLowerCase()}...`}
        />
      ) : (
        <ul className="space-y-3">
          {items.map((item: string, index: number) => (
            <li key={index} className="text-sm leading-relaxed text-slate-800 flex gap-3 font-medium bg-white/40 p-3 rounded-2xl">
              <span className="text-blue-500 font-bold">•</span> {item}
            </li>
          ))}
          {items.length === 0 && <li className="text-sm text-slate-400 italic font-medium p-3">No definido</li>}
        </ul>
      )}
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

