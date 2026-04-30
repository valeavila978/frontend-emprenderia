import { Project, CreateProjectRequest, CreateProjectResponse } from '@/types'

import { API_URL } from '@/config'

export class ProjectService {
  static async createProject(
    data: CreateProjectRequest,
    token: string
  ): Promise<CreateProjectResponse> {
    try {
      const response = await fetch(`${API_URL}/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('No se pudo crear el proyecto')
      }

      return await response.json()
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error desconocido')
    }
  }

  static async getProjects(token: string): Promise<Project[]> {
    try {
      const response = await fetch(`${API_URL}/projects`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('No se pudieron obtener los proyectos')
      }

      return await response.json()
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error desconocido')
    }
  }

  static async getProjectById(id: string, token: string): Promise<Project> {
    try {
      const response = await fetch(`${API_URL}/projects/${id}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('No se pudo obtener el proyecto')
      }

      return await response.json()
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error desconocido')
    }
  }

  // 🔥 NUEVO MÉTODO PARA IA
  static async generateBmc(id: string, token: string): Promise<any> {
    try {
      const response = await fetch(`${API_URL}/projects/${id}/generate-bmc`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Error al generar el análisis de IA')
      }

      return await response.json()
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error de IA')
    }
  }

  static async getBmc(id: string, token: string): Promise<any> {
    try {
      const response = await fetch(`${API_URL}/projects/${id}/bmc`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        if (response.status === 404) return null
        throw new Error('Error al obtener el BMC')
      }

      return await response.json()
    } catch (error) {
      console.error('Error in getBmc:', error)
      return null
    }
  }
}