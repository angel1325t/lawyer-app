import api from './api';

export interface DashboardSummary {
  active_cases: number;
  completed_cases: number;
  average_rating: number;
  total_ratings: number;
}

export interface DashboardRecentCase {
  id: number;
  name: string;
  description: string;
  stage: string;
  stage_code?: string;
  client_id: number;
  client_name: string;
  updated_at?: string | null;
  created_at?: string | null;
}

export interface DashboardResponse {
  success: boolean;
  dashboard?: DashboardSummary;
  recent_cases?: DashboardRecentCase[];
  error?: string;
}

class DashboardService {
  async getLawyerDashboard(): Promise<DashboardResponse> {
    try {
      const response = await api.get('/api/lawyer/dashboard');
      const payload = response.data;

      if (!payload?.success) {
        return {
          success: false,
          error: payload?.error || 'No se pudo obtener el dashboard',
        };
      }

      return {
        success: true,
        dashboard: payload.dashboard,
        recent_cases: payload.recent_cases || [],
      };
    } catch (error: any) {
      console.error('Error getting lawyer dashboard:', error);
      return {
        success: false,
        error: error?.response?.data?.error || error?.message || 'Error de conexion',
      };
    }
  }
}

export default new DashboardService();
