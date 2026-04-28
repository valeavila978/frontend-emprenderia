'use client'

import { useState, useEffect } from 'react'
import { MarketplaceProduct } from '@/types'
import { MarketplaceService } from '@/services/marketplaceService'
import { ProductCard } from '@/components/ProductCard'
import { Search, Filter, Sparkles, ShoppingBag } from 'lucide-react'
import { motion } from 'framer-motion'

export default function MarketplacePage() {
  const [products, setProducts] = useState<MarketplaceProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('All')

  const categories = ['All', 'Tech', 'Agro', 'Services', 'Retail', 'Health']

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      const data = await MarketplaceService.getProducts(activeCategory === 'All' ? undefined : activeCategory)
      setProducts(data)
      setLoading(false)
    }
    fetchProducts()
  }, [activeCategory])

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
                  onClick={() => setActiveCategory(cat)}
                  className={`px-6 py-4 rounded-2xl font-bold whitespace-nowrap transition-all ${
                    activeCategory === cat 
                      ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/20' 
                      : 'bg-white text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  {cat === 'All' ? 'Todos' : cat}
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
              <ProductCard key={product.id} product={product} />
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
      </div>
    </div>
  )
}
