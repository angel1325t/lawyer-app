import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import api from './api';

// ✅ Handler compatible con NotificationBehavior nuevo
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface NotificationData {
  notification_id?: number;
  type?: string;
  screen?: string;
  [key: string]: any;
}

export type ApiResult<T> = {
  success: boolean;
  message?: string;
  data?: T;
};

export type NotificationsListResponse<T> = {
  success: boolean;
  message?: string;
  data: T[];
  unread_count: number;
  total?: number;
};

class NotificationService {
  private expoPushToken: string | null = null;

  private notificationListener: { remove: () => void } | null = null;
  private responseListener: { remove: () => void } | null = null;

  private resolveProjectId(): string | undefined {
    const expoConfig: any = Constants.expoConfig;
    const easConfig: any = (Constants as any).easConfig;

    return (
      expoConfig?.extra?.eas?.projectId ??
      easConfig?.projectId ??
      expoConfig?.extra?.projectId
    );
  }

  /**
   * ✅ Obtiene token Expo (PUSH)
   * ⚠️ Requiere Dev Build / APK. En Expo Go no funciona remote push.
   */
  async registerForPushNotifications(): Promise<string | null> {
    try {
      if (!Device.isDevice) {
        console.warn('Las notificaciones push solo funcionan en dispositivos físicos');
        return null;
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.warn('No se obtuvieron permisos para notificaciones');
        return null;
      }

      const projectId = this.resolveProjectId();
      if (!projectId) {
        console.warn('⚠️ projectId no disponible. Revisa extra.eas.projectId');
        return null;
      }

      const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
      this.expoPushToken = tokenData.data;

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'Default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#2563eb',
          sound: 'default',
        });
      }

      return this.expoPushToken;
    } catch (error) {
      console.error('❌ Error registrando notificaciones:', error);
      return null;
    }
  }

  getToken(): string | null {
    return this.expoPushToken;
  }

  setupNotificationListeners(
    onNotificationReceived?: (notification: Notifications.Notification) => void,
    onNotificationTapped?: (response: Notifications.NotificationResponse) => void
  ) {
    this.removeNotificationListeners();

    this.notificationListener = Notifications.addNotificationReceivedListener((notification) => {
      console.log('🔔 Notificación recibida:', notification);
      onNotificationReceived?.(notification);
    });

    this.responseListener = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log('👆 Notificación tocada:', response);
      onNotificationTapped?.(response);
    });
  }

  removeNotificationListeners() {
    this.notificationListener?.remove();
    this.responseListener?.remove();
    this.notificationListener = null;
    this.responseListener = null;
  }

  async getBadgeCount(): Promise<number> {
    return await Notifications.getBadgeCountAsync();
  }

  async setBadgeCount(count: number) {
    await Notifications.setBadgeCountAsync(count);
  }

  async clearAllNotifications() {
    await Notifications.dismissAllNotificationsAsync();
  }

  // ============================
  // ✅ ENDPOINTS ODOO (type='json')
  // ============================

  async registerTokenWithServer(userId: number): Promise<boolean> {
    try {
      const token = this.expoPushToken;
      if (!token) {
        console.warn('No hay token para registrar');
        return false;
      }

      const res = await api.post('/api/notifications/register-token', {
        user_id: userId,
        expo_token: token,
      });

      return !!res.data?.success;
    } catch (error: any) {
      console.error('❌ registerTokenWithServer:', error?.response?.data || error?.message);
      return false;
    }
  }

  async testPush(userId: number): Promise<ApiResult<any>> {
    try {
      // ✅ tu controller solo requiere user_id
      const {data} = await api.post('/api/notifications/test', { user_id: userId });
      return data;
    } catch (e: any) {
      return {
        success: false,
        message: e?.response?.data?.message || e?.message || 'Error probando push',
      };
    }
  }

  async getUserNotifications<T = any>(
    userId: number,
    opts?: { limit?: number; unread_only?: boolean }
  ): Promise<NotificationsListResponse<T>> {
    try {
      const res = await api.post('/api/notifications/user', {
        user_id: userId,
        limit: opts?.limit ?? 50,
        unread_only: opts?.unread_only ?? false,
      });

      return {
        success: !!res.data?.success,
        message: res.data?.message,
        data: res.data?.data || [],
        unread_count: res.data?.unread_count ?? 0,
        total: res.data?.total ?? (res.data?.data?.length ?? 0),
      };
    } catch (e: any) {
      return {
        success: false,
        message: e?.response?.data?.message || e?.message || 'Error obteniendo notificaciones',
        data: [],
        unread_count: 0,
      };
    }
  }

  async getUnreadCount(): Promise<number> {
    try {
      const res = await api.get('/api/notifications/unread-count');
      if (res.data?.success) {
        return res.data?.unread_count ?? 0;
      }
      return 0;
    } catch (e: any) {
      console.error('❌ getUnreadCount:', e?.response?.data || e?.message);
      return 0;
    }
  }

  async markAsRead(notificationId: number): Promise<ApiResult<null>> {
    try {
      const res = await api.post('/api/notifications/mark-read', {
        notification_id: notificationId,
      });
      return res.data;
    } catch (e: any) {
      return {
        success: false,
        message: e?.response?.data?.message || e?.message || 'Error marcando como leída',
        data: null,
      };
    }
  }

  async markAllAsRead(userId: number): Promise<ApiResult<null>> {
    try {
      const res = await api.post('/api/notifications/mark-all-read', { user_id: userId });
      return res.data;
    } catch (e: any) {
      return {
        success: false,
        message: e?.response?.data?.message || e?.message || 'Error marcando todas como leídas',
        data: null,
      };
    }
  }

  async deleteNotification(notificationId: number): Promise<ApiResult<null>> {
    try {
      const res = await api.post('/api/notifications/delete', {
        notification_id: notificationId,
      });
      return res.data;
    } catch (e: any) {
      return {
        success: false,
        message: e?.response?.data?.message || e?.message || 'Error eliminando notificación',
        data: null,
      };
    }
  }
}

export default new NotificationService();
