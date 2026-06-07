import { motion } from 'framer-motion'
import { CheckCircle, AlertTriangle } from 'lucide-react'

export function SemaforoFinanciero({ isViable }: { isViable: boolean }) {
  if (isViable) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4 flex items-center gap-4 my-6"
      >
        <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-green-500/40 shrink-0">
          <CheckCircle size={24} />
        </div>
        <div>
          <h3 className="text-xl font-bold text-green-600">PROYECTO VIABLE</h3>
          <p className="text-green-700 text-sm font-medium">Las métricas financieras indican viabilidad (TIR superior al 12%).</p>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-center gap-4 my-6"
    >
      <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-red-500/40 shrink-0">
        <AlertTriangle size={24} />
      </div>
      <div>
        <h3 className="text-xl font-bold text-red-600">REQUIERE MEJORAS</h3>
        <p className="text-red-700 text-sm font-medium">La TIR proyectada no supera el umbral del mercado. Revisa costos y proyección de ingresos.</p>
      </div>
    </motion.div>
  )
}
