import { MarketplaceProduct } from '../types';
import { API_URL } from '@/config';

export const MarketplaceService = {
  getProducts: async (category?: string): Promise<MarketplaceProduct[]> => {
    try {
      const url = category ? `${API_URL}/marketplace?category=${category}` : `${API_URL}/marketplace`;
      const response = await fetch(url);

      if (!response.ok) {
        return getMockProducts();
      }

      return await response.json();
    } catch (error) {
      console.warn('Backend connection failed, using mock data for marketplace');
      return getMockProducts();
    }
  },
};

function getMockProducts(): MarketplaceProduct[] {
  return [
    {
      id: '1',
      title: 'Eco-Café de Altura',
      description: 'Café orgánico cultivado con técnicas sostenibles en las montañas de Caldas.',
      price: 25000,
      category: 'Agro',
      imageUrl: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&q=80&w=400',
      entrepreneurId: 'e1',
      entrepreneurName: 'Juan Pérez',
      rating: 4.8
    },
    {
      id: '2',
      title: 'SmartFarm App',
      description: 'Software de gestión para optimizar cultivos mediante sensores IoT.',
      price: 150000,
      category: 'Tech',
      imageUrl: 'https://images.unsplash.com/photo-1560306612-99d8d64803b7?auto=format&fit=crop&q=80&w=400',
      entrepreneurId: 'e2',
      entrepreneurName: 'TechSeeds SAS',
      rating: 4.5
    },
    {
      id: '3',
      title: 'Kit Robótica Educativa',
      description: 'Herramientas interactivas para enseñar programación a niños en zonas rurales.',
      price: 85000,
      category: 'Retail',
      imageUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=400',
      entrepreneurId: 'e3',
      entrepreneurName: 'EduInnovar',
      rating: 4.9
    }
  ];
}
