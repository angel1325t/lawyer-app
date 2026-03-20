import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import notificationService from '../../services/notificationService';
import { useFocusEffect } from '@react-navigation/native';
import {
  profileService,
  type LawyerProfile,
} from '../../services/profileService';
import { DS } from '../../constants/designSystem';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [testingNotification, setTestingNotification] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [profileData, setProfileData] = useState<LawyerProfile | null>(null);

  const profileImageUri = useMemo(() => {
    const image = profileData?.profile_image || user?.profile_image;
    if (!image) return null;
    if (image.startsWith('data:')) return image;
    return `data:image/jpeg;base64,${image}`;
  }, [profileData?.profile_image, user?.profile_image]);

  const loadProfile = useCallback(async () => {
    setLoadingProfile(true);
    const response = await profileService.getLawyerProfile();
    if (response.success && response.profile) {
      setProfileData(response.profile);
    } else if (response.error) {
      console.error('Error cargando perfil del abogado:', response.error);
    }
    setLoadingProfile(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [loadProfile])
  );

  const handleTestPushNotification = async () => {
    if (!user?.user_id) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Usuario no identificado',
      });
      return;
    }

    // ✅ Asegurar token registrado
    let token = notificationService.getToken();
    if (!token) {
      const newToken = await notificationService.registerForPushNotifications();
      if (newToken) {
        await notificationService.registerTokenWithServer(user.user_id);
        token = newToken;
      }
    }

    setTestingNotification(true);
    try {
      const result = await notificationService.testPush(user.user_id);

      if (result.success) {
        Toast.show({
          type: 'success',
          text1: '✅ Notificación Push Enviada',
          text2: 'Deberías recibirla en unos segundos',
          position: 'top',
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: result.message || 'No se pudo enviar la notificación',
        });
      }
    } catch (error) {
      console.error('Error testing notification:', error);
      Toast.show({
        type: 'error',
        text1: 'Error de Conexión',
        text2: 'No se pudo conectar con el servidor',
      });
    } finally {
      setTestingNotification(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro que deseas cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Salir',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/splash/splash');
          },
        },
      ]
    );
  };

  const MenuItem = ({
    icon,
    title,
    onPress,
    color = 'text-gray-800',
    showArrow = true,
    badge,
    loading = false,
  }: any) => (
    <TouchableOpacity
      className="flex-row items-center justify-between p-4 mb-3 bg-white shadow-sm rounded-2xl"
      onPress={onPress}
      activeOpacity={0.7}
      disabled={loading}
    >
      <View className="flex-row items-center flex-1">
        <View className="p-3 bg-gray-100 rounded-xl">
          <Ionicons name={icon} size={24} color={DS.colors.primary} />
        </View>
        <Text className={`ml-4 font-semibold text-base ${color}`}>
          {title}
        </Text>
        {badge && (
          <View className="px-2 py-1 ml-2 bg-red-500 rounded-full">
            <Text className="text-xs font-bold text-white">{badge}</Text>
          </View>
        )}
      </View>
      {loading ? (
        <ActivityIndicator size="small" color={DS.colors.primary} />
      ) : (
        showArrow && <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: DS.colors.background }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-6 pt-4 pb-6">
          <View className="flex-row items-center mb-6">
            <TouchableOpacity
              onPress={() => router.back()}
              className="mr-4"
            >
              <Ionicons name="arrow-back" size={28} color="#1F2937" />
            </TouchableOpacity>
            <Text className="text-2xl font-bold text-gray-800">
              Mi Perfil
            </Text>
          </View>

          {/* Profile Card */}
          <View className="flex-row items-center p-5 bg-white shadow-sm rounded-3xl">
            <View className="items-center justify-center w-16 h-16 mr-4 overflow-hidden bg-blue-100 rounded-full">
              {profileImageUri ? (
                <Image
                  source={{ uri: profileImageUri }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              ) : (
                <Ionicons name="person" size={28} color={DS.colors.primary} />
              )}
            </View>

            <View className="flex-1">
              <View className="flex-row items-center">
                <Text className="text-lg font-semibold text-gray-900">
                  {profileData?.name || user?.name || 'Abogado'}
                </Text>
                {(profileData?.lawyer_state || user?.lawyer_state) === 'approved' && (
                  <View className="ml-2">
                    <Ionicons name="checkmark-circle" size={18} color="#10b981" />
                  </View>
                )}
                {loadingProfile ? (
                  <ActivityIndicator size="small" color={DS.colors.primary} style={{ marginLeft: 8 }} />
                ) : null}
              </View>

              <Text
                className="text-sm text-gray-500 mt-0.5"
                numberOfLines={1}
              >
                {profileData?.email || user?.email || user?.login}
              </Text>

              <Text className="mt-1 text-xs font-medium" style={{ color: DS.colors.primary }}>
                Abogado
              </Text>
            </View>
          </View>

          {/* Token Info (solo en desarrollo) */}
          {__DEV__ && user?.expo_push_token && (
            <View className="p-3 mt-3 border border-green-200 bg-green-50 rounded-xl">
              <Text className="text-xs font-semibold text-green-800">
                ✅ Token registrado
              </Text>
              <Text className="mt-1 text-xs text-green-600" numberOfLines={1}>
                {user.expo_push_token}
              </Text>
            </View>
          )}
        </View>

        {/* Menu Items */}
        <View className="px-6">
          {/* DESARROLLO/TESTING - Solo visible en desarrollo */}
          {__DEV__ && (
            <>
              <Text className="mb-3 ml-1 font-semibold text-orange-600">
                🔧 DESARROLLO
              </Text>

              <MenuItem
                icon="rocket-outline"
                title="Probar Push Notification"
                onPress={handleTestPushNotification}
                color="text-orange-600"
                showArrow={false}
                loading={testingNotification}
              />
            </>
          )}

          <MenuItem
            icon="person-outline"
            title="Editar Perfil"
            onPress={() => router.push('/lawyer/edit-profile')}
          />
          <MenuItem
            icon="briefcase-outline"
            title="Experiencia Profesional"
            onPress={() => {}}
          />
          <MenuItem
            icon="document-attach-outline"
            title="Documentos"
            onPress={() => router.push('/documents/documents')}
          />

        
          <Text className="mt-6 mb-3 ml-1 font-semibold text-gray-500">
            CONFIGURACIÓN
          </Text>

          <MenuItem
            icon="notifications-outline"
            title="Notificaciones"
            onPress={() => router.push('/notifications/notifications')}
          />
          <MenuItem
            icon="key-outline"
            title="Restablecer Contraseña"
            onPress={() => router.push('/lawyer/reset-password')}
          />
          <MenuItem
            icon="shield-checkmark-outline"
            title="Privacidad y Seguridad"
            onPress={() => router.push('/lawyer/privacy-security')}
            badge="Beta"
          />
          <MenuItem
            icon="help-circle-outline"
            title="Ayuda y Soporte"
            onPress={() => router.push('/lawyer/help-support')}
            badge="Beta"
          />
          <MenuItem
            icon="information-circle-outline"
            title="Acerca de"
            onPress={() => router.push('/lawyer/about')}
            badge="Beta"
          />

          <Text className="mt-6 mb-3 ml-1 font-semibold text-gray-500">
            SESIÓN
          </Text>

          <MenuItem
            icon="log-out-outline"
            title="Cerrar Sesión"
            onPress={handleLogout}
            color="text-red-600"
            showArrow={false}
          />
        </View>

        <View className="h-8" />
      </ScrollView>

      <Toast />
    </SafeAreaView>
  );
}
