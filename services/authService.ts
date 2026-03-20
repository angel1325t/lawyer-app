  // LAWYER APP - services/authService.ts

import api from './api';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

interface RegisterLawyerData {
  name: string;
  email: string;
  password: string;
  category_ids: number[];
}

interface LoginData {
  email: string;
  password: string;
}

interface AuthResponse {
  success: boolean;
  user_id?: number;
  partner_id?: number;
  name?: string;
  email?: string;
  is_lawyer?: boolean;
  lawyer_state?: 'pending' | 'approved' | 'rejected';
  status?: string;
  message?: string;
  error?: string;
}

interface ForgotPasswordResponse {
  success: boolean;
  message?: string;
  error?: string;
}

interface ResetPasswordResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export interface User {
  user_id: number;
  partner_id: number | null;
  name: string;
  email: string;
  login: string;
  is_lawyer: boolean;
  lawyer_state: 'pending' | 'approved' | 'rejected';
  expo_push_token?: string;
  profile_image?: string | null;
}

export const getExpoPushToken = async (): Promise<string | null> => {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();

    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Permisos de notificacion no concedidos');
      return null;
    }

    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ??
      Constants.easConfig?.projectId;

    if (!projectId) {
      console.log('projectId no disponible');
      return null;
    }

    const tokenResponse = await Notifications.getExpoPushTokenAsync({
      projectId,
    });

    console.log('Expo Push Token:', tokenResponse.data);
    return tokenResponse.data;
  } catch (error: any) {
    console.error('Error obteniendo Expo Push Token:', error?.message || error);
    return null;
  }
};

export const authService = {
  registerLawyer: async (data: RegisterLawyerData): Promise<AuthResponse> => {
    try {
      const expoToken = await getExpoPushToken();
      const response = await api.post('/api/auth/register-lawyer', {
        name: data.name,
        email: data.email.toLowerCase().trim(),
        password: data.password,
        category_ids: data.category_ids,
        device_token: expoToken,
      });
      return response.data;
    } catch (error: any) {
      console.error('Error en registerLawyer:', error);
      throw new Error(error.response?.data?.error || 'Error al registrar abogado');
    }
  },

  login: async (data: LoginData): Promise<AuthResponse> => {
    try {
      const response = await api.post('/api/auth/login', {
        email: data.email.toLowerCase().trim(),
        password: data.password,
      });

      if (response.data.success && !response.data.is_lawyer) {
        throw new Error(
          'Esta cuenta es de cliente. Por favor, usa la app de clientes.'
        );
      }

      if (response.data.success && response.data.is_lawyer) {
        if (response.data.lawyer_state === 'pending') {
          throw new Error('PENDING_VERIFICATION');
        }
        if (response.data.lawyer_state === 'rejected') {
          throw new Error('Tu cuenta ha sido rechazada. Contacta con soporte.');
        }
      }

      return response.data;
    } catch (error: any) {
      console.error('Error en login:', error);

      if (
        error.message.includes('cliente') ||
        error.message === 'PENDING_VERIFICATION' ||
        error.message.includes('rechazada')
      ) {
        throw error;
      }

      throw new Error(error.response?.data?.error || 'Error al iniciar sesión');
    }
  },

  forgotPassword: async (email: string): Promise<ForgotPasswordResponse> => {
    try {
      const response = await api.post('/api/auth/forgot-password', {
        email: email.toLowerCase().trim(),
      });
      return response.data;
    } catch (error: any) {
      console.error('Error en forgotPassword:', error);
      return {
        success: false,
        error:
          error.response?.data?.error ||
          'No se pudo iniciar el proceso de recuperación',
      };
    }
  },

  resetPassword: async (
    email: string,
    newPassword: string,
    verificationCode: string
  ): Promise<ResetPasswordResponse> => {
    try {
      const response = await api.post('/api/auth/reset-password', {
        email: email.toLowerCase().trim(),
        new_password: newPassword,
        verification_code: verificationCode,
      });
      return response.data;
    } catch (error: any) {
      console.error('Error en resetPassword:', error);
      return {
        success: false,
        error:
          error.response?.data?.error || 'No se pudo restablecer la contraseña',
      };
    }
  },

  logout: async (): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await api.post('/api/auth/logout');
      return response.data;
    } catch (error: any) {
      console.error('Error en logout:', error);
      throw new Error(error.response?.data?.error || 'Error al cerrar sesión');
    }
  },

  getCurrentUser: async (): Promise<User> => {
    try {
      const response = await api.get('/api/auth/me');
      const data = response.data;
      return {
        user_id: data.user_id,
        partner_id: data.partner_id ?? null,
        name: data.name || '',
        email: data.email || data.login || '',
        login: data.login || data.email || '',
        is_lawyer: !!data.is_lawyer,
        lawyer_state: (data.lawyer_state || 'pending') as
          | 'pending'
          | 'approved'
          | 'rejected',
        profile_image: data.profile_image || null,
      };
    } catch (error: any) {
      console.error('Error en getCurrentUser:', error);
      throw new Error(error.response?.data?.error || 'Error al obtener usuario');
    }
  },
};

export type { RegisterLawyerData, LoginData, AuthResponse };
