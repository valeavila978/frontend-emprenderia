'use client'

import { MarketplaceProduct } from '@/types'
import { motion } from 'framer-motion'
import { Star, ShoppingCart, User } from 'lucide-react'

interface ProductCardProps {
  product: MarketplaceProduct
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <motion.div
      whileHover={{ y: -8 }}
      className="bg-white/80 backdrop-blur-md rounded-3xl overflow-hidden border border-white shadow-xl shadow-slate-200/50 flex flex-col group"
    >
      <div className="relative h-48 overflow-hidden">
        <img 
          src={product.images && product.images.length > 0 ? product.images[0] : 'https://images.unsplash.com/photo-1557821552-17105176677c?auto=format&fit=crop&q=80&w=1000'} 
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
          <Star size={14} className="text-yellow-500 fill-yellow-500" />
          <span className="text-xs font-bold text-slate-800">4.8</span>
        </div>
        <div className="absolute top-4 left-4 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-lg shadow-blue-500/30">
          {product.category}
        </div>
      </div>

      <div className="p-6 flex flex-col flex-grow">
        <div className="flex items-center gap-2 text-slate-400 mb-2">
          <User size={14} />
          <span className="text-xs font-medium">{product.ownerName}</span>
        </div>
        
        <h3 className="text-lg font-bold text-slate-800 mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">
          {product.name}
        </h3>
        
        <p className="text-slate-500 text-sm mb-6 line-clamp-2 flex-grow">
          {product.description}
        </p>

        <div className="flex items-center justify-between mt-auto">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Precio</span>
            <span className="text-xl font-black text-slate-900">
              ${product.price.toLocaleString()}
            </span>
          </div>
          
          <motion.button
            whileTap={{ scale: 0.9 }}
            className="p-3 bg-slate-900 text-white rounded-2xl hover:bg-blue-600 transition-colors shadow-lg shadow-slate-900/10"
          >
            <ShoppingCart size={20} />
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}
