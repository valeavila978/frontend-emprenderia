import { ChatMessage, ChatSession, FinancialAnalysis } from '@/types'
import { API_URL } from '@/config'

// El microservicio de IA suele correr en un puerto diferente, 
// pero asumimos que el API Gateway o el backend principal lo redirecciona.
// Si es directo al ms-ia, podríamos necesitar otra URL.
const AI_API_URL = process.env.NEXT_PUBLIC_AI_API_URL || API_URL

export class AIService {
  static async sendMessage(message: string, sessionId: string | null, projectId: string | null, token: string): Promise<any> {
    try {
      const response = await fetch(`${API_URL}/assistant/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          projectId, 
          messages: [{ role: 'user', content: message }] 
        }),
      })

      if (!response.ok) {
        throw new Error('Error al conectar con el asistente de IA')
      }

      return await response.json()
    } catch (error) {
      console.error('Error in AIService.sendMessage:', error)
      throw error
    }
  }

  static async generateFinancialAnalysis(projectId: string, token: string): Promise<FinancialAnalysis> {
    const response = await fetch(`${API_URL}/financial/projects/${projectId}/generate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    if (!response.ok) throw new Error('Error generando análisis financiero')
    return await response.json()
  }
}
