import { API_URL } from '@/config';

export interface MatchDto {
  id: string;
  projectId: string;
  projectTitle: string;
  investorId: string;
  investorName: string;
  matchScore: number;
  createdAt: string;
}

export interface GenerateMatchesResult {
  message: string;
  matches: string[];
}

export const MatchingService = {
  /** GET /api/Projects/Matches — Matches del usuario autenticado (todos los proyectos) */
  getUserMatches: async (token: string): Promise<MatchDto[]> => {
    const res = await fetch(`${API_URL}/Projects/Matches`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Error al obtener matches');
    return res.json();
  },

  /** GET /api/Projects/Matches/{projectId} — Matches de un proyecto específico */
  getProjectMatches: async (projectId: string, token: string): Promise<MatchDto[]> => {
    const res = await fetch(`${API_URL}/Projects/Matches/${projectId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Error al obtener matches del proyecto');
    return res.json();
  },

  /** POST /api/Projects/Matches/generate — Lanza el motor de IA para calcular matches */
  generateMatches: async (projectId: string, bmcText: string, token: string): Promise<GenerateMatchesResult> => {
    const res = await fetch(`${API_URL}/Projects/Matches/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ projectId, bmcText })
    });
    if (!res.ok) throw new Error('Error al generar matches con IA');
    return res.json();
  }
};
