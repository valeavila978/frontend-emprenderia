'use client'

import { useState, useEffect } from 'react'
import { MarketplaceProduct } from '@/types'; import { useAuth } from '@/context/AuthContext'
import { MarketplaceService } from '@/services/marketplaceService'
import { ProductCard } from '@/components/ProductCard'
import { Search, Filter, Sparkles, ShoppingBag, X } from 'lucide-react'
import { motion } from 'framer-motion'

export default function MarketplacePage() {
  const { token } = useAuth(); const [products, setProducts] = useState<MarketplaceProduct[]>([])
  const [selectedProduct, setSelectedProduct] = useState<MarketplaceProduct | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('All')

  const [error, setError] = useState('')

  useEffect(() => {
    const fetchProducts = async () => {
      if (!token) return
      setLoading(true)
      setError('')
      try {
        const data = await MarketplaceService.getProducts(token)
        if (activeCategory === 'Todos' || activeCategory === 'All') {
          setProducts(data)
        } else {
          // Normalize to compare with backend string enums e.g. "Servicio", "Consultoria", "Digital", "Otro"
          const categoryMap: { [key: string]: string } = {
            'Servicio': 'Servicio',
            'Consultoria': 'Consultoria',
            'Digital': 'Digital',
            'Otro': 'Otro'
          }
          const target = categoryMap[activeCategory] || activeCategory
          setProducts(data.filter(p => p.category === target))
        }
      } catch (err) {
        console.error('Error fetching marketplace products:', err)
        setError('No se pudieron cargar los productos del marketplace.')
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [activeCategory, token])

  const categories = ['Todos', 'Servicio', 'Consultoria', 'Digital', 'Otro']

  return (
    <div className="min-h-screen bg-[#f8fafc] py-12">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        
        {/* Header Section */}
        <header className="mb-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 text-blue-600 font-black uppercase tracking-[0.2em] text-xs mb-4">
                <Sparkles size={16} />
                Marketplace de Innovación
              </div>
              <h1 className="text-5xl md:text-6xl font-black text-slate-900 mb-6 leading-tight">
                Productos que están <br/> 
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  transformando el mañana.
                </span>
              </h1>
              <p className="text-slate-500 text-lg md:text-xl font-medium">
                Descubre y apoya el talento local. Desde tecnología de punta hasta productos sostenibles, todo en un solo lugar.
              </p>
            </div>
            
            <div className="flex items-center gap-4 bg-white p-2 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
              <div className="flex items-center gap-3 px-6 py-3 bg-blue-50 text-blue-700 rounded-2xl">
                <ShoppingBag size={20} />
                <span className="font-bold">128 Proyectos</span>
              </div>
            </div>
          </div>

          {/* Error display */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-2xl border border-red-100 font-bold">
              {error}
            </div>
          )}

          {/* Search and Filter Bar */}
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-grow w-full">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                type="text" 
                placeholder="Buscar productos o servicios..."
                className="w-full bg-white border-none rounded-3xl py-5 pl-16 pr-8 shadow-xl shadow-slate-200/40 text-slate-700 font-medium focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
              />
            </div>
            
            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat === 'Todos' ? 'All' : cat)}
                  className={`px-6 py-4 rounded-2xl font-bold whitespace-nowrap transition-all ${
                    (activeCategory === 'All' && cat === 'Todos') || activeCategory === cat
                      ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/20' 
                      : 'bg-white text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </header>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-3xl h-[450px] animate-pulse border border-slate-100" />
            ))}
          </div>
        ) : (
          <motion.div 
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {products.map((product) => (
              <div
                key={product.id}
                onClick={() => setSelectedProduct(product)}
                className="cursor-pointer"
              >
                <ProductCard product={product} />
              </div>
            ))}
          </motion.div>
        )}

        {products.length === 0 && !loading && (
          <div className="text-center py-32">
            <div className="bg-slate-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search size={40} className="text-slate-300" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">No encontramos resultados</h3>
            <p className="text-slate-500">Prueba ajustando tus filtros o términos de búsqueda.</p>
          </div>
        )}

        {selectedProduct ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/60 backdrop-blur-sm">
            <div className="relative w-full max-w-3xl rounded-[32px] border border-white/10 bg-white/10 shadow-2xl shadow-slate-900/40 backdrop-blur-xl overflow-hidden">
              <button
                onClick={() => setSelectedProduct(null)}
                className="absolute right-5 top-5 text-slate-200 hover:text-white"
              >
                <X size={24} />
              </button>
              <div className="p-10 bg-gradient-to-br from-white/10 to-slate-100/10">
                <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <p className="uppercase tracking-[0.3em] text-xs font-semibold text-sky-200">{selectedProduct.category}</p>
                      <h2 className="text-4xl font-black text-white">{selectedProduct.name}</h2>
                      <p className="text-slate-300 leading-8">{selectedProduct.description}</p>
                    </div>
                    <div className="rounded-3xl border border-white/10 bg-white/10 p-6 shadow-lg shadow-slate-900/10">
                      <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Precio</p>
                      <p className="mt-3 text-5xl font-black text-white">${selectedProduct.price.toLocaleString()}</p>
                    </div>
                    <div className="rounded-3xl border border-white/10 bg-white/10 p-6 shadow-lg shadow-slate-900/10">
                      <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Emprendedor</p>
                      <p className="mt-3 text-lg font-bold text-white">{selectedProduct.ownerName}</p>
                    </div>
                  </div>
                  <div className="space-y-6 rounded-3xl border border-white/10 bg-white/10 p-8 shadow-xl shadow-slate-900/20">
                    <p className="text-sm text-slate-300">Conecta directamente con el emprendedor y comienza la conversación con toda la información necesaria.</p>
                    <a
                      href={`mailto:${selectedProduct.ownerEmail || 'contacto@emprendeia.com'}?subject=${encodeURIComponent(`Interés en ${selectedProduct.name}`)}`}
                      className="inline-flex w-full items-center justify-center rounded-3xl bg-slate-900 px-6 py-4 text-center text-white font-bold shadow-lg shadow-slate-900/30 hover:bg-slate-800 transition-all"
                    >
                      Contactar Emprendedor
                    </a>
                    <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-5 text-slate-300">
                      <p className="text-sm uppercase tracking-[0.3em] text-slate-400 mb-2">Descripción extendida</p>
                      <p className="leading-7 text-slate-200">{selectedProduct.description}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
