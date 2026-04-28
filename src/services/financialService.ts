import { FinancialAnalysis } from '../types';
import { API_URL } from '@/config';

export const FinancialService = {
  getAnalysisByProjectId: async (projectId: string, token: string): Promise<FinancialAnalysis> => {
    try {
      const response = await fetch(`${API_URL}/projects/${projectId}/financial-analysis`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        // Si el backend no tiene el endpoint aún, devolvemos mock data para demostrar la UI
        return getMockFinancialData(projectId);
      }

      return await response.json();
    } catch (error) {
      console.warn('Backend connection failed, using mock data for financials');
      return getMockFinancialData(projectId);
    }
  },
};

function getMockFinancialData(projectId: string): FinancialAnalysis {
  return {
    projectId,
    projections: [
      { year: 2026, revenue: 15000, expenses: 12000, profit: 3000, cashFlow: 2500 },
      { year: 2027, revenue: 45000, expenses: 28000, profit: 17000, cashFlow: 14000 },
      { year: 2028, revenue: 120000, expenses: 65000, profit: 55000, cashFlow: 48000 },
    ],
    riskLevel: 'Medium',
    riskFactors: [
      'Dependencia de proveedores locales',
      'Alta competencia en el sector digital',
      'Necesidad de capital semilla adicional en año 2'
    ],
    viabilityScore: 78
  };
}
