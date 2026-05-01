import { API_URL } from '@/config';

export interface MarketplaceProduct {
  id: string;
  projectId: string;
  projectName: string;
  ownerName: string;
  name: string;
  description: string;
  price: number;
  category: 'Servicio' | 'Consultoria' | 'Digital' | 'Otro';
  images: string[];
  visibility: boolean;
  createdAt: string;
}

export const MarketplaceService = {
  getProducts: async (): Promise<MarketplaceProduct[]> => {
    try {
      const response = await fetch(`${API_URL}/Marketplace`);
      if (!response.ok) throw new Error('Error al cargar el marketplace');
      return await response.json();
    } catch (error) {
      console.error('Error in getProducts:', error);
      return [];
    }
  },

  createProduct: async (productData: any, token: string): Promise<any> => {
    const response = await fetch(`${API_URL}/Products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(productData)
    });
    if (!response.ok) throw new Error('Error al crear el producto');
    return await response.json();
  },

  updateProduct: async (id: string, productData: any, token: string): Promise<void> => {
    const response = await fetch(`${API_URL}/Products/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ id, ...productData })
    });
    if (!response.ok) throw new Error('Error al actualizar el producto');
  },

  deleteProduct: async (id: string, token: string): Promise<void> => {
    const response = await fetch(`${API_URL}/Products/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) throw new Error('Error al eliminar el producto');
  }
};
