import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';
import notificationService, { NotificationData } from '../services/notificationService';
import { useAuth } from '../context/AuthContext';

export function useNotifications() {
  const router = useRouter();
  const { user } = useAuth();

  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);

  useEffect(() => {
    // ✅ Solo listeners aquí. El token se maneja en AuthContext (login/restore).
    notificationService.setupNotificationListeners(
      handleNotificationReceived,
      handleNotificationTapped
    );

    // Si quieres exponer token actual del service (si ya fue registrado)
    setExpoPushToken(notificationService.getToken());

    return () => {
      notificationService.removeNotificationListeners();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.user_id]);

  const handleNotificationReceived = (n: Notifications.Notification) => {
    console.log('📨 Notificación recibida en app:', n);
    setNotification(n);
    updateBadgeCount();
  };

  const handleNotificationTapped = (response: Notifications.NotificationResponse) => {
    const data = response.notification.request.content.data as NotificationData;
    console.log('👆 Usuario tocó notificación:', data);

    if (data.screen) {
      router.push(data.screen as any);
      return;
    }

    if (data.notification_id) {
      router.push('/notifications/notifications');
    }
  };

  const updateBadgeCount = async () => {
    try {
      const currentCount = await notificationService.getBadgeCount();
      await notificationService.setBadgeCount(currentCount + 1);
    } catch (error) {
      console.error('Error actualizando badge:', error);
    }
  };

  return {
    expoPushToken,
    notification,
  };
}
