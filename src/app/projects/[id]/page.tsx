'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { useAuth } from '@/context/AuthContext'
import { ProjectService } from '@/services/projectService'
import { FinancialService } from '@/services/financialService'
import { MatchingService, MatchDto } from '@/services/matchingService'
import { Alert } from '@/components/Alert'
import { Button } from '@/components/Button'
import Link from 'next/link'
import { Project, FinancialAnalysis } from '@/types'
import { FinancialDashboard } from '@/components/FinancialDashboard'
import { SemaforoFinanciero } from '@/components/SemaforoFinanciero'
import { LayoutDashboard, FileText, BarChart3, ChevronLeft, Sparkles, ShoppingCart, Plus, Edit2, Check, X, Zap, Users } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

type TabType = 'info' | 'bmc' | 'financial' | 'marketplace'

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
  const [editForm, setEditForm] = useState({ title: '', description: '', stage: '' })
  const [matches, setMatches] = useState<MatchDto[]>([])
  const [loadingMatches, setLoadingMatches] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const { token } = useAuth()
  const params = useParams()
  const projectId = params.id as string

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!token) return
        const projectData = await ProjectService.getProjectById(projectId, token)
        setProject(projectData)
        setEditForm({ 
          title: projectData.title, 
          description: projectData.description, 
          stage: projectData.stage 
        })
        
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
    setActiveTab(tab)
    if (tab === 'financial') loadFinancials()
    if (tab === 'marketplace') loadProjectMatches()
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
      await ProjectService.updateProject(projectId, editForm, token)
      const updated = await ProjectService.getProjectById(projectId, token)
      setProject(updated)
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
              
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsEditingProject(!isEditingProject)}
                className="flex items-center gap-2 px-6 py-4 rounded-2xl font-bold bg-white/10 hover:bg-white/20 transition-all backdrop-blur-md border border-white/20"
              >
                {isEditingProject ? 'Cancelar' : 'Editar Proyecto'}
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
            <TabButton 
              active={activeTab === 'marketplace'} 
              onClick={() => handleTabChange('marketplace')}
              icon={<ShoppingCart size={18} />}
              label="Marketplace"
            />
          </div>

          {/* Content Area */}
          <div className="p-8 md:p-12">
            {error && <Alert type="error" message={error} className="mb-6" />}
            {success && <Alert type="success" message={success} className="mb-6" />}
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
                        <Button onClick={handleUpdateProject} className="w-full py-4">Guardar Cambios</Button>
                      </div>
                    ) : (
                      <p className="text-slate-600 text-lg leading-relaxed bg-slate-50 p-6 rounded-2xl border border-slate-100">
                        {project?.description}
                      </p>
                    )}
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
                    <div className="space-y-6">
                      <div className="flex justify-between items-center bg-slate-900 rounded-3xl p-6 text-white shadow-xl shadow-slate-900/20">
                        <div>
                          <h3 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">Modelo de Negocio (BMC)</h3>
                          <p className="text-slate-400 mt-1">
                            {bmc.differential_name && <span className="font-bold text-indigo-300">Diferencial: {bmc.differential_name}</span>}
                          </p>
                        </div>
                        <div className="flex gap-4">
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
                        <Button 
                          onClick={() => isEditingFinancials ? handleUpdateFinancials() : setIsEditingFinancials(true)}
                          className={`rounded-xl px-6 ${isEditingFinancials ? 'bg-green-600 hover:bg-green-700' : 'bg-slate-800'}`}
                        >
                          {isEditingFinancials ? <><Check size={18} className="mr-2"/> Guardar Cambios</> : <><Edit2 size={18} className="mr-2"/> Editar Proyecciones</>}
                        </Button>
                      </div>
                      
                      <SemaforoFinanciero isViable={financials.isViable ?? (financials as any).is_viable} />

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
                    <Button 
                      onClick={() => setIsAddingProduct(!isAddingProduct)}
                      className="rounded-2xl"
                    >
                      {isAddingProduct ? <><X size={18} className="mr-2"/> Cancelar</> : <><Plus size={18} className="mr-2"/> Publicar Producto</>}
                    </Button>
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
