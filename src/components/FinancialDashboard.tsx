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
import { TrendingUp, AlertTriangle, ShieldCheck, BarChart3, Sparkles } from 'lucide-react';
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
  isEditing?: boolean;
  onChange?: (updated: any) => void;
}

export function FinancialDashboard({ analysis, isEditing, onChange }: FinancialDashboardProps) {
  const handleFieldChange = (field: string, value: string) => {
    if (onChange) {
      onChange({ ...analysis, [field]: value });
    }
  };

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
          {isEditing 
            ? "Estás editando el informe financiero. Los cambios se guardarán permanentemente en tu proyecto."
            : "Este informe ha sido generado automáticamente por nuestro modelo de IA analizando tu Business Model Canvas."
          }
        </p>
      </div>

      {/* Analysis Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FinancialCard 
          title="Proyecciones de Ingresos" 
          content={analysis.revenueProjections} 
          isEditing={isEditing}
          onChange={(val) => handleFieldChange('revenueProjections', val)}
          icon={<TrendingUp className="text-blue-600" />}
        />
        <FinancialCard 
          title="Análisis de Costos" 
          content={analysis.costAnalysis} 
          isEditing={isEditing}
          onChange={(val) => handleFieldChange('costAnalysis', val)}
          icon={<AlertTriangle className="text-red-600" />}
        />
        <FinancialCard 
          title="Punto de Equilibrio" 
          content={analysis.breakEvenAnalysis} 
          isEditing={isEditing}
          onChange={(val) => handleFieldChange('breakEvenAnalysis', val)}
          icon={<ShieldCheck className="text-green-600" />}
        />
        <FinancialCard 
          title="Requerimientos de Inversión" 
          content={analysis.fundingRequirements} 
          isEditing={isEditing}
          onChange={(val) => handleFieldChange('fundingRequirements', val)}
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
        {isEditing ? (
          <textarea
            value={analysis.keyIndicators}
            onChange={(e) => handleFieldChange('keyIndicators', e.target.value)}
            className="w-full bg-slate-50 border-none rounded-2xl p-6 text-slate-700 min-h-[200px] outline-none focus:ring-1 focus:ring-amber-500"
          />
        ) : (
          <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed">
            {analysis.keyIndicators?.split('\n').map((line, i) => (
              <p key={i} className="mb-2">{line}</p>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function FinancialCard({ 
  title, content, icon, isEditing, onChange 
}: { 
  title: string, content: string, icon: React.ReactNode, isEditing?: boolean, onChange?: (val: string) => void 
}) {
  return (
    <div className="bg-white p-8 rounded-3xl shadow-lg border border-slate-100 hover:shadow-xl transition-shadow group flex flex-col">
      <div className="flex items-center gap-4 mb-6">
        <div className="p-3 bg-slate-50 rounded-2xl group-hover:bg-blue-50 transition-colors">
          {icon}
        </div>
        <h3 className="text-xl font-bold text-slate-800">{title}</h3>
      </div>
      {isEditing ? (
        <textarea
          value={content}
          onChange={(e) => onChange?.(e.target.value)}
          className="flex-1 w-full bg-slate-50 border-none rounded-xl p-4 text-sm leading-relaxed outline-none focus:ring-1 focus:ring-blue-500 min-h-[150px] resize-none"
        />
      ) : (
        <div className="text-slate-600 text-sm leading-relaxed max-h-48 overflow-y-auto custom-scrollbar">
          {content?.split('\n').map((line, i) => (
            <p key={i} className={line.startsWith('-') || line.startsWith('*') ? "ml-4 mb-1" : "mb-2"}>
              {line}
            </p>
          )) || 'No disponible'}
        </div>
      )}
    </div>
  )
}
