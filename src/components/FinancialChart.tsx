'use client';

import React, { useMemo } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ChartOptions } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { FinancialAnalysis } from '@/types';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface FinancialChartProps {
  analysis: FinancialAnalysis;
  className?: string;
}

export const FinancialChart: React.FC<FinancialChartProps> = ({ analysis, className = '' }) => {
  const chartData = useMemo(() => {
    // Proyecciones a 3 años
    const years = ['Año 1', 'Año 2', 'Año 3'];
    
    // Intentar extraer datos de proyecciones
    const projectedRevenue = analysis.projectedRevenue 
      ? [
          analysis.projectedRevenue.year1 || 0,
          analysis.projectedRevenue.year2 || 0,
          analysis.projectedRevenue.year3 || 0
        ]
      : [0, 0, 0];

    const projectedExpenses = analysis.projectedExpenses
      ? [
          analysis.projectedExpenses.year1 || 0,
          analysis.projectedExpenses.year2 || 0,
          analysis.projectedExpenses.year3 || 0
        ]
      : [0, 0, 0];

    return {
      labels: years,
      datasets: [
        {
          label: 'Ingresos Proyectados',
          data: projectedRevenue,
          backgroundColor: 'rgba(34, 197, 94, 0.8)', // Green
          borderColor: 'rgb(34, 197, 94)',
          borderWidth: 2,
          borderRadius: 8,
          hoverBackgroundColor: 'rgba(34, 197, 94, 1)',
        },
        {
          label: 'Gastos Proyectados',
          data: projectedExpenses,
          backgroundColor: 'rgba(239, 68, 68, 0.8)', // Red
          borderColor: 'rgb(239, 68, 68)',
          borderWidth: 2,
          borderRadius: 8,
          hoverBackgroundColor: 'rgba(239, 68, 68, 1)',
        },
      ],
    };
  }, [analysis]);

  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          font: {
            size: 14,
            weight: 'bold',
          },
          padding: 20,
          boxWidth: 12,
          borderRadius: 4,
          usePointStyle: false,
        },
      },
      title: {
        display: true,
        text: 'Proyecciones Financieras 3 Años',
        font: {
          size: 18,
          weight: 'bold',
        },
        padding: {
          top: 10,
          bottom: 30,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: {
          size: 14,
          weight: 'bold',
        },
        bodyFont: {
          size: 13,
        },
        padding: 12,
        borderRadius: 8,
        displayColors: true,
        callbacks: {
          label: function (context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('es-CO', {
                style: 'currency',
                currency: 'COP',
                minimumFractionDigits: 0,
              }).format(context.parsed.y);
            }
            return label;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
          drawBorder: true,
        },
        ticks: {
          font: {
            size: 12,
          },
          callback: function (value) {
            return new Intl.NumberFormat('es-CO', {
              notation: 'compact',
              compactDisplay: 'short',
            }).format(value as number);
          },
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 12,
            weight: 'bold',
          },
        },
      },
    },
  };

  return (
    <div className={`w-full bg-white p-6 rounded-3xl border border-slate-100 shadow-sm ${className}`}>
      <div className="relative h-96">
        <Bar data={chartData} options={options} />
      </div>
      
      {/* Resumen de diferencias */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        {[0, 1, 2].map((yearIdx) => {
          const revenue = chartData.datasets[0].data[yearIdx] || 0;
          const expenses = chartData.datasets[1].data[yearIdx] || 0;
          const profit = (revenue as number) - (expenses as number);
          
          return (
            <div key={yearIdx} className="bg-gradient-to-br from-slate-50 to-slate-100 p-4 rounded-2xl border border-slate-200">
              <h4 className="text-sm font-bold text-slate-600 uppercase tracking-wide mb-3">
                {chartData.labels[yearIdx]}
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-600">Ingresos:</span>
                  <span className="font-bold text-green-600">
                    {new Intl.NumberFormat('es-CO', {
                      style: 'currency',
                      currency: 'COP',
                      minimumFractionDigits: 0,
                    }).format(revenue as number)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-600">Gastos:</span>
                  <span className="font-bold text-red-600">
                    {new Intl.NumberFormat('es-CO', {
                      style: 'currency',
                      currency: 'COP',
                      minimumFractionDigits: 0,
                    }).format(expenses as number)}
                  </span>
                </div>
                <div className="border-t border-slate-300 pt-2 flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-700">Ganancia:</span>
                  <span className={`font-black ${profit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                    {new Intl.NumberFormat('es-CO', {
                      style: 'currency',
                      currency: 'COP',
                      minimumFractionDigits: 0,
                    }).format(profit)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FinancialChart;
