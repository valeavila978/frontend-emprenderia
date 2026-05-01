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

  static async updateProject(id: string, projectData: any, token: string): Promise<void> {
    const response = await fetch(`${API_URL}/projects/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ id, ...projectData })
    });
    if (!response.ok) throw new Error('Error al actualizar el proyecto');
  }

  static async updateBmc(projectId: string, bmcData: any, token: string): Promise<void> {
    const formatList = (val: any) => {
      if (Array.isArray(val)) return val;
      if (typeof val === 'string') return val.split('\n').filter(s => s.trim());
      return [];
    };

    const formattedData = {
      projectId,
      customerSegments: formatList(bmcData.customerSegments || bmcData.customer_segments),
      valueProposition: formatList(bmcData.valueProposition || bmcData.value_proposition),
      channels: formatList(bmcData.channels),
      customerRelationships: formatList(bmcData.customerRelationships || bmcData.customer_relationships),
      revenueStreams: formatList(bmcData.revenueStreams || bmcData.revenue_streams),
      keyResources: formatList(bmcData.keyResources || bmcData.key_resources),
      keyActivities: formatList(bmcData.keyActivities || bmcData.key_activities),
      keyPartners: formatList(bmcData.keyPartners || bmcData.key_partners),
      costStructure: formatList(bmcData.costStructure || bmcData.cost_structure)
    };

    const response = await fetch(`${API_URL}/projects/${projectId}/bmc`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(formattedData)
    });
    if (!response.ok) throw new Error('Error al actualizar el BMC');
  }
}