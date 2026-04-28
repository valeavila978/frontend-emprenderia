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
  const labels = analysis.projections.map(p => `Año ${p.year}`);

  const barData = {
    labels,
    datasets: [
      {
        label: 'Ingresos',
        data: analysis.projections.map(p => p.revenue),
        backgroundColor: 'rgba(59, 130, 246, 0.6)',
      },
      {
        label: 'Gastos',
        data: analysis.projections.map(p => p.expenses),
        backgroundColor: 'rgba(239, 68, 68, 0.6)',
      },
    ],
  };

  const lineData = {
    labels,
    datasets: [
      {
        label: 'Flujo de Caja',
        data: analysis.projections.map(p => p.cashFlow),
        borderColor: 'rgb(34, 197, 94)',
        tension: 0.3,
        fill: true,
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
      },
    ],
  };

  const riskColors = {
    Low: 'text-green-600 bg-green-100',
    Medium: 'text-yellow-600 bg-yellow-100',
    High: 'text-red-600 bg-red-100',
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
              <TrendingUp size={20} />
            </div>
            <h3 className="font-bold text-gray-700">Puntaje de Viabilidad</h3>
          </div>
          <p className="text-4xl font-black text-blue-600">{analysis.viabilityScore}%</p>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-1000" 
              style={{ width: `${analysis.viabilityScore}%` }}
            ></div>
          </div>
        </div>

        <div className={`p-6 rounded-xl shadow-md border border-gray-100 ${riskColors[analysis.riskLevel]}`}>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-white/50 rounded-lg">
              <AlertTriangle size={20} />
            </div>
            <h3 className="font-bold">Nivel de Riesgo</h3>
          </div>
          <p className="text-4xl font-black uppercase">{analysis.riskLevel}</p>
          <p className="text-sm mt-2 font-medium opacity-80">Evaluado por IA</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-100 rounded-lg text-green-600">
              <ShieldCheck size={20} />
            </div>
            <h3 className="font-bold text-gray-700">Factores de Éxito</h3>
          </div>
          <ul className="text-sm space-y-2">
            {analysis.riskFactors.slice(0, 3).map((factor, i) => (
              <li key={i} className="flex gap-2 items-start text-gray-600">
                <span className="text-green-500">•</span> {factor}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
            📊 Comparativa Ingresos vs Gastos
          </h3>
          <div className="h-64">
            <Bar 
              data={barData} 
              options={{ 
                responsive: true, 
                maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom' } }
              }} 
            />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
            📈 Proyección de Flujo de Caja
          </h3>
          <div className="h-64">
            <Line 
              data={lineData} 
              options={{ 
                responsive: true, 
                maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom' } }
              }} 
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
