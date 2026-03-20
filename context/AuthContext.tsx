import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../services/authService';
import notificationService from '../services/notificationService';
import type { User, LoginData, RegisterLawyerData } from '../services/authService';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isPendingVerification: boolean;
  login: (data: LoginData) => Promise<User>;
  registerLawyer: (data: RegisterLawyerData) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPendingVerification, setIsPendingVerification] = useState(false);

  useEffect(() => {
    checkSession();
  }, []);

  // ✅ Cuando se restaura sesión (o cambia user), asegura token push (sin repetir si ya existe)
  useEffect(() => {
    if (user?.user_id) {
      initializeNotificationsIfNeeded(user);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.user_id]);

  const checkSession = async () => {
    try {
      const savedUser = await AsyncStorage.getItem('lawyer_user');
      if (!savedUser) return;

      const userData: User = JSON.parse(savedUser);

      // ✅ VALIDACIÓN ABOGADO
      if (!userData.is_lawyer) {
        console.warn('⚠️ Usuario guardado NO es abogado, limpiando sesión');
        await AsyncStorage.removeItem('lawyer_user');
        setUser(null);
        return;
      }

      // ✅ Estado de aprobación
      if (userData.lawyer_state === 'pending') {
        console.warn('⚠️ Abogado pendiente de verificación');
        setIsPendingVerification(true);
        setUser(null);
        return;
      }

      if (userData.lawyer_state === 'rejected') {
        console.warn('⚠️ Abogado rechazado, limpiando sesión');
        await AsyncStorage.removeItem('lawyer_user');
        setUser(null);
        return;
      }

      if (userData.lawyer_state === 'approved') {
        setUser(userData);

        // Intentar refrescar del servidor
        try {
          const freshUser = await authService.getCurrentUser();

          if (!freshUser.is_lawyer || freshUser.lawyer_state !== 'approved') {
            console.warn('⚠️ Estado del usuario cambió, cerrando sesión');
            await logout();
            return;
          }

          setUser(freshUser);
          await AsyncStorage.setItem('lawyer_user', JSON.stringify(freshUser));
        } catch {
          console.log('No se pudo refrescar el usuario, usando datos locales');
        }
      }
    } catch (error) {
      console.error('Error verificando sesión:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const initializeNotificationsIfNeeded = async (u: User) => {
    try {
      // Si ya tienes token guardado en user, no fuerces otro registro cada render.
      // Aun así, si quieres revalidar cada arranque, puedes quitar este if.
      if (u.expo_push_token) return;

      console.log('🔔 Obteniendo token push en login/restore para:', u.name);

      const token = await notificationService.registerForPushNotifications();
      if (!token) return;

      const ok = await notificationService.registerTokenWithServer(u.user_id);
      if (!ok) return;

      const updatedUser: User = { ...u, expo_push_token: token };
      setUser(updatedUser);
      await AsyncStorage.setItem('lawyer_user', JSON.stringify(updatedUser));
    } catch (error) {
      console.error('❌ Error inicializando notificaciones:', error);
    }
  };

  const login = async (data: LoginData): Promise<User> => {
    try {
      const response = await authService.login(data);

      if (!response.success || !response.user_id) {
        throw new Error(response.error || 'Error al iniciar sesión');
      }

      // ✅ VALIDACIÓN 1: SÍ sea abogado
      if (!response.is_lawyer) {
        throw new Error('Esta cuenta es de cliente. Por favor, usa la app de clientes.');
      }

      // ✅ VALIDACIÓN 2: estado aprobación
      if (response.lawyer_state === 'pending') {
        setIsPendingVerification(true);
        throw new Error('PENDING_VERIFICATION');
      }

      if (response.lawyer_state === 'rejected') {
        throw new Error('Tu cuenta ha sido rechazada. Contacta con soporte.');
      }

      if (response.lawyer_state !== 'approved') {
        throw new Error('Tu cuenta no está aprobada aún.');
      }

      const userData: User = {
        user_id: response.user_id,
        partner_id: response.partner_id || null,
        name: response.name || '',
        email: response.email || data.email,
        login: data.email,
        is_lawyer: true,
        lawyer_state: 'approved',
        expo_push_token: undefined,
      };

      setUser(userData);
      setIsPendingVerification(false);
      await AsyncStorage.setItem('lawyer_user', JSON.stringify(userData));

      // ✅ AQUÍ MISMO (LOGIN): obtener token y registrarlo en Odoo
      await initializeNotificationsIfNeeded(userData);

      // ✅ Retornar user para que LoginScreen lo tenga si lo necesita
      return userData;
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  };

  const registerLawyer = async (data: RegisterLawyerData) => {
    try {
      const response = await authService.registerLawyer(data);

      if (response.success) {
        setIsPendingVerification(true);
        throw new Error('PENDING_VERIFICATION');
      } else {
        throw new Error(response.error || 'Error al registrar abogado');
      }
    } catch (error) {
      console.error('Error en registerLawyer:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await notificationService.setBadgeCount(0);
      await authService.logout();
    } catch (error) {
      console.error('Error al hacer logout en el servidor:', error);
    } finally {
      setUser(null);
      setIsPendingVerification(false);
      await AsyncStorage.removeItem('lawyer_user');
    }
  };

  const refreshUser = async () => {
    try {
      const freshUser = await authService.getCurrentUser();

      if (!freshUser.is_lawyer || freshUser.lawyer_state !== 'approved') {
        console.warn('⚠️ Usuario no es abogado aprobado, cerrando sesión');
        await logout();
        return;
      }

      setUser(freshUser);
      await AsyncStorage.setItem('lawyer_user', JSON.stringify(freshUser));
    } catch (error) {
      console.error('Error refrescando usuario:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        isPendingVerification,
        login,
        registerLawyer,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return context;
};
