import api from './api';

export interface LawyerProfile {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  document_id?: string | null;
  professional_license?: string | null;
  average_rating?: number | null;
  total_ratings?: number | null;
  lawyer_state?: 'pending' | 'approved' | 'rejected';
  profile_image?: string | null;
}

interface ProfileResponse {
  success: boolean;
  profile?: LawyerProfile;
  message?: string;
  error?: string;
}

interface UpdateLawyerProfileData {
  name?: string;
  email?: string;
  profile_image?: string | null;
}

interface PasswordChangeData {
  current_password: string;
  new_password: string;
}

interface PasswordChangeResponse {
  success: boolean;
  message?: string;
  error?: string;
}

interface EmailChangeCodeResponse {
  success: boolean;
  message?: string;
  error?: string;
  new_email?: string;
  requires_email_verification?: boolean;
}

export const profileService = {
  getLawyerProfile: async (): Promise<ProfileResponse> => {
    try {
      const response = await api.get('/api/lawyer/profile');
      return response.data;
    } catch (error: any) {
      console.error('Error en getLawyerProfile:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Error al obtener el perfil',
      };
    }
  },

  updateLawyerProfile: async (
    data: UpdateLawyerProfileData
  ): Promise<ProfileResponse> => {
    try {
      const response = await api.put('/api/lawyer/profile', data);
      return response.data;
    } catch (error: any) {
      console.error('Error en updateLawyerProfile:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Error al actualizar el perfil',
      };
    }
  },

  changeLawyerPassword: async (
    data: PasswordChangeData
  ): Promise<PasswordChangeResponse> => {
    try {
      const response = await api.post('/api/lawyer/profile/password', data);
      return response.data;
    } catch (error: any) {
      console.error('Error en changeLawyerPassword:', error);
      return {
        success: false,
        error:
          error.response?.data?.error ||
          'Error al restablecer la contraseña del perfil',
      };
    }
  },

  requestEmailChangeCode: async (
    newEmail: string
  ): Promise<EmailChangeCodeResponse> => {
    try {
      const response = await api.post('/api/lawyer/profile/email/request-code', {
        new_email: newEmail.toLowerCase().trim(),
      });
      return response.data;
    } catch (error: any) {
      console.error('Error en requestEmailChangeCode:', error);
      return {
        success: false,
        error:
          error.response?.data?.error ||
          'Error al enviar codigo de verificacion de correo',
      };
    }
  },

  verifyEmailChangeCode: async (
    newEmail: string,
    verificationCode: string
  ): Promise<ProfileResponse> => {
    try {
      const response = await api.post('/api/lawyer/profile/email/verify-code', {
        new_email: newEmail.toLowerCase().trim(),
        verification_code: verificationCode,
      });
      return response.data;
    } catch (error: any) {
      console.error('Error en verifyEmailChangeCode:', error);
      return {
        success: false,
        error:
          error.response?.data?.error ||
          'Error al verificar el codigo de correo',
      };
    }
  },
};
