import { FinancialAnalysis } from '../types';
import { API_URL } from '@/config';

export const FinancialService = {
  getAnalysisByProjectId: async (projectId: string, token: string): Promise<FinancialAnalysis | null> => {
    try {
      const response = await fetch(`${API_URL}/financial/projects/${projectId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) return null;

      return await response.json();
    } catch (error) {
      console.error('Error fetching financial analysis', error);
      return null;
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
