// LAWYER APP - services/lawyerCaseService.ts

import api from './api';

export interface LawyerCase {
  id: number;
  name: string;
  description: string;
  stage: string;
  client_id: number;
  client_name: string;
  price?: number; // Para casos ganados
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class LawyerCaseService {
  /**
   * Obtener todos los casos disponibles para el abogado
   */
  async listCases(): Promise<ApiResponse<LawyerCase[]>> {
    try {
      const response = await api.get('/api/lawyer/cases');
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.cases,
        };
      }
      
      return {
        success: false,
        error: response.data.error || 'Error al obtener los casos',
      };
    } catch (error: any) {
      console.error('Error listing cases:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Error de conexión',
      };
    }
  }

  /**
   * Obtener detalle de un caso específico
   */
  async getCase(caseId: number): Promise<ApiResponse<LawyerCase>> {
    try {
      const response = await api.get(`/api/lawyer/cases/${caseId}`);
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.case,
        };
      }
      
      return {
        success: false,
        error: response.data.error || 'Error al obtener el caso',
      };
    } catch (error: any) {
      console.error('Error getting case:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Error de conexión',
      };
    }
  }

  /**
   * Verificar si el abogado puede hacer oferta en un caso
   */
  async canOffer(caseId: number): Promise<ApiResponse<boolean>> {
    try {
      const response = await api.get(`/api/lawyer/cases/${caseId}/can-offer`);
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.can_offer,
        };
      }
      
      return {
        success: false,
        error: response.data.error || 'Error al verificar si puede ofertar',
      };
    } catch (error: any) {
      console.error('Error checking can offer:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Error de conexión',
      };
    }
  }

  /**
   * Obtener casos ganados (asignados) al abogado
   * Endpoint actualizado: /api/lawyer/cases/won
   */
  async getWonCases(): Promise<ApiResponse<LawyerCase[]>> {
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

export default new LawyerCaseService();