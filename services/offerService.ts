// LAWYER APP - services/offerService.ts

import api from './api';

export interface LawyerOffer {
  id: number;
  case_id: number;
  case_name: string;
  lawyer_id: number;
  lawyer_name: string;
  price: number;
  message: string;
  state: 'sent' | 'accepted' | 'rejected' | 'cancelled';
  created_at: string | null;
  viewed_at: string | null;
  is_favorite: boolean;
}

export interface CreateOfferData {
  price: number;
  message: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class OfferService {
  /**
   * Crear una oferta para un caso
   */
  async createOffer(
    caseId: number,
    offerData: CreateOfferData
  ): Promise<ApiResponse<LawyerOffer>> {
    try {
      const response = await api.post(
        `/api/lawyer/cases/${caseId}/offer`,
        offerData
      );
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.offer,
        };
      }
      
      return {
        success: false,
        error: response.data.error || 'Error al crear la oferta',
      };
    } catch (error: any) {
      console.error('Error creating offer:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Error de conexión',
      };
    }
  }

  /**
   * Obtener todas las ofertas del abogado
   */
  async listOffers(): Promise<ApiResponse<LawyerOffer[]>> {
    try {
      const response = await api.get('/api/lawyer/offers');
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.offers,
        };
      }
      
      return {
        success: false,
        error: response.data.error || 'Error al obtener las ofertas',
      };
    } catch (error: any) {
      console.error('Error listing offers:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Error de conexión',
      };
    }
  }

  /**
   * Obtener detalle de una oferta específica
   */
  async getOffer(offerId: number): Promise<ApiResponse<LawyerOffer>> {
    try {
      const response = await api.get(`/api/lawyer/offers/${offerId}`);
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.offer,
        };
      }
      
      return {
        success: false,
        error: response.data.error || 'Error al obtener la oferta',
      };
    } catch (error: any) {
      console.error('Error getting offer:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Error de conexión',
      };
    }
  }

  /**
   * Cancelar una oferta
   */
  async cancelOffer(offerId: number): Promise<ApiResponse<null>> {
    try {
      const response = await api.post(`/api/lawyer/offers/${offerId}/cancel`);
      
      if (response.data.success) {
        return {
          success: true,
          message: response.data.message,
        };
      }
      
      return {
        success: false,
        error: response.data.error || 'Error al cancelar la oferta',
      };
    } catch (error: any) {
      console.error('Error canceling offer:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Error de conexión',
      };
    }
  }

  /**
   * Obtener casos ganados con ofertas aceptadas
   */
  async getWonCases(): Promise<ApiResponse<any[]>> {
    try {
      const response = await api.get('/api/lawyer/cases/won');
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.cases,
        };
      }
      
      return {
        success: false,
        error: response.data.error || 'Error al obtener casos ganados',
      };
    } catch (error: any) {
      console.error('Error getting won cases:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Error de conexión',
      };
    }
  }
}

export default new OfferService();
