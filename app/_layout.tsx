// app/_layout.tsx

import '../global.css';
import { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';
import notificationService from '../services/notificationService';

SplashScreen.preventAutoHideAsync();

// Configurar cómo se manejan las notificaciones cuando la app está en foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});


function RootNavigator() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  // Manejar navegación por autenticación
  useEffect(() => {
    if (isLoading) return;

    if (isAuthenticated) {
      router.replace('/lawyer/home');
    } else {
      router.replace('/login/login');
    }
  }, [isAuthenticated, isLoading]);

  // Configurar listeners de notificaciones
  useEffect(() => {
    if (!isAuthenticated) return;

    // Listener cuando llega una notificación (app en foreground)
    const notificationListener = Notifications.addNotificationReceivedListener(
      async (notification) => {
        console.log('🔔 Notificación recibida:', notification);
        
        // Actualizar badge count
        const currentBadge = await notificationService.getBadgeCount();
        await notificationService.setBadgeCount(currentBadge + 1);
      }
    );

    // Listener cuando el usuario toca una notificación
    const responseListener = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log('👆 Usuario tocó notificación:', response);
        
        const data = response.notification.request.content.data;
        
        // Navegar según el tipo de notificación
        if (data.screen) {
          router.push(data.screen as any);
        } else if (data.notification_id) {
          router.push('/notifications/notifications');
        } else {
          // Navegación por defecto
          router.push('/notifications/notifications');
        }
      }
    );

    // Cleanup
    return () => {
      notificationListener.remove();
      responseListener.remove();
    };
  }, [isAuthenticated, router]);

  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({});

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  );
}