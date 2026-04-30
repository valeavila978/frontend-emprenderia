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

  generateAnalysis: async (projectId: string, token: string): Promise<FinancialAnalysis> => {
    try {
      const response = await fetch(`${API_URL}/financial/projects/${projectId}/generate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Error al generar el análisis económico');
      }

      return await response.json();
    } catch (error) {
      console.error('Error in generateAnalysis:', error);
      throw error;
    }
  }
};
