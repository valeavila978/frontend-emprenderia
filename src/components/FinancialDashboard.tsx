'use client'

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import { FinancialAnalysis } from '@/types';
import { TrendingUp, AlertTriangle, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface FinancialDashboardProps {
  analysis: FinancialAnalysis;
}

export function FinancialDashboard({ analysis }: FinancialDashboardProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Header Summary */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 rounded-3xl text-white shadow-xl">
        <div className="flex items-center gap-4 mb-4">
          <TrendingUp size={32} />
          <h2 className="text-3xl font-black">Análisis de Viabilidad Financiera</h2>
        </div>
        <p className="text-blue-100 max-w-2xl text-lg">
          Este informe ha sido generado automáticamente por nuestro modelo de IA analizando tu Business Model Canvas y el contexto del sector.
        </p>
      </div>

      {/* Analysis Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FinancialCard 
          title="Proyecciones de Ingresos" 
          content={analysis.revenueProjections} 
          icon={<TrendingUp className="text-blue-600" />}
        />
        <FinancialCard 
          title="Análisis de Costos" 
          content={analysis.costAnalysis} 
          icon={<AlertTriangle className="text-red-600" />}
        />
        <FinancialCard 
          title="Punto de Equilibrio" 
          content={analysis.breakEvenAnalysis} 
          icon={<ShieldCheck className="text-green-600" />}
        />
        <FinancialCard 
          title="Requerimientos de Inversión" 
          content={analysis.fundingRequirements} 
          icon={<BarChart3 className="text-purple-600" />}
        />
      </div>

      {/* Key Indicators Full Width */}
      <div className="bg-white p-8 rounded-3xl shadow-lg border border-slate-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-amber-100 rounded-2xl text-amber-600">
            <Sparkles size={24} />
          </div>
          <h3 className="text-2xl font-black text-slate-800">Indicadores Clave y Recomendaciones</h3>
        </div>
        <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed">
          {analysis.keyIndicators.split('\n').map((line, i) => (
            <p key={i} className="mb-2">{line}</p>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function FinancialCard({ title, content, icon }: { title: string, content: string, icon: React.ReactNode }) {
  return (
    <div className="bg-white p-8 rounded-3xl shadow-lg border border-slate-100 hover:shadow-xl transition-shadow group">
      <div className="flex items-center gap-4 mb-6">
        <div className="p-3 bg-slate-50 rounded-2xl group-hover:bg-blue-50 transition-colors">
          {icon}
        </div>
        <h3 className="text-xl font-bold text-slate-800">{title}</h3>
      </div>
      <div className="text-slate-600 text-sm leading-relaxed max-h-48 overflow-y-auto custom-scrollbar">
        {content}
      </div>
    </div>
  )
}

import { BarChart3, Sparkles } from 'lucide-react';
