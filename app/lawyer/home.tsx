// LAWYER APP - app/screens/home.tsx

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Image,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import BottomNavigationBar from '@/components/BottomNavigationBar';
import dashboardService, {
  DashboardRecentCase,
  DashboardSummary,
} from '../../services/dashboardService';
import notificationService from '../../services/notificationService';

const EMPTY_SUMMARY: DashboardSummary = {
  active_cases: 0,
  completed_cases: 0,
  average_rating: 0,
  total_ratings: 0,
};

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [summary, setSummary] = useState<DashboardSummary>(EMPTY_SUMMARY);
  const [recentCases, setRecentCases] = useState<DashboardRecentCase[]>([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const profileImageUri = useMemo(() => {
    const image = user?.profile_image;
    if (!image) return null;
    if (image.startsWith('data:')) return image;
    return `data:image/jpeg;base64,${image}`;
  }, [user?.profile_image]);

  const stats = useMemo(
    () => [
      {
        id: 'active',
        label: 'Casos Activos',
        value: String(summary.active_cases || 0),
        icon: 'folder-open',
        color: 'bg-blue-500',
      },
      {
        id: 'completed',
        label: 'Completados',
        value: String(summary.completed_cases || 0),
        icon: 'checkmark-circle',
        color: 'bg-green-500',
      },
      {
        id: 'rating',
        label: `Rating (${summary.total_ratings || 0})`,
        value: (summary.average_rating || 0).toFixed(1),
        icon: 'star',
        color: 'bg-yellow-500',
      },
    ],
    [summary]
  );

  const loadHomeData = useCallback(async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);

      const [dashboardResult, unreadCount] = await Promise.all([
        dashboardService.getLawyerDashboard(),
        notificationService.getUnreadCount(),
      ]);

      if (dashboardResult.success) {
        setSummary(dashboardResult.dashboard || { ...EMPTY_SUMMARY });
        setRecentCases(dashboardResult.recent_cases || []);
      } else {
        setSummary({ ...EMPTY_SUMMARY });
        setRecentCases([]);
      }

      setUnreadNotifications(unreadCount);
    } catch (error) {
      console.error('Error loading home dashboard:', error);
      setSummary({ ...EMPTY_SUMMARY });
      setRecentCases([]);
      setUnreadNotifications(0);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadHomeData(true);
    }, [loadHomeData])
  );

  useEffect(() => {
    const subscription = Notifications.addNotificationReceivedListener(async () => {
      const unreadCount = await notificationService.getUnreadCount();
      setUnreadNotifications(unreadCount);
    });

    return () => subscription.remove();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadHomeData(false);
  }, [loadHomeData]);

  const renderStat = ({ item }: any) => (
    <View className={`${item.color} rounded-2xl p-4 mr-3 w-40 shadow-lg`}>
      <Ionicons name={item.icon as any} size={28} color="white" />
      <Text className="mt-2 text-2xl font-bold text-white">{item.value}</Text>
      <Text className="mt-1 text-sm text-white">{item.label}</Text>
    </View>
  );

  const getStatusColor = (status: string, statusCode?: string) => {
    const normalizedStatus = (status || '').toLowerCase();
    const normalizedCode = (statusCode || '').toLowerCase();

    if (normalizedCode === 'case_in_progress' || normalizedStatus.includes('progreso')) {
      return { bg: 'bg-blue-100', text: 'text-blue-700' };
    }
    if (normalizedCode === 'case_won' || normalizedStatus.includes('cerrado')) {
      return { bg: 'bg-green-100', text: 'text-green-700' };
    }
    if (normalizedCode === 'case_cancelled' || normalizedStatus.includes('cancel')) {
      return { bg: 'bg-red-100', text: 'text-red-700' };
    }
    return { bg: 'bg-gray-100', text: 'text-gray-700' };
  };

  const formatDate = (dateValue?: string | null) => {
    if (!dateValue) return '-';
    const parsed = new Date(dateValue.replace(' ', 'T'));
    if (Number.isNaN(parsed.getTime())) return dateValue;
    return parsed.toLocaleDateString('es-ES');
  };

  const renderCase = ({ item }: { item: DashboardRecentCase }) => {
    const statusColors = getStatusColor(item.stage, item.stage_code);
    const caseDate = formatDate(item.updated_at || item.created_at);

    return (
      <TouchableOpacity
        className="p-4 mx-4 mb-3 bg-white shadow-sm rounded-2xl"
        activeOpacity={0.8}
        onPress={() =>
          router.push({
            pathname: '/lawyer/case-detail/[id]',
            params: { id: String(item.id) },
          })
        }
      >
        <View className="flex-row items-start justify-between mb-3">
          <View className="flex-1 pr-3">
            <Text className="mb-1 text-lg font-bold text-gray-800">{item.name}</Text>
            <Text className="text-sm text-gray-500">{item.client_name}</Text>
          </View>
          <View className={`px-3 py-1 rounded-lg ${statusColors.bg}`}>
            <Text className={`text-xs font-semibold ${statusColors.text}`}>{item.stage}</Text>
          </View>
        </View>

        {!!item.description && (
          <Text className="mb-2 text-sm text-gray-600" numberOfLines={2}>
            {item.description}
          </Text>
        )}

        <View className="flex-row items-center">
          <Ionicons name="calendar-outline" size={16} color="#6B7280" />
          <Text className="ml-2 text-sm text-gray-500">{caseDate}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View className="px-6 pt-4 pb-6 bg-white">
          <View className="flex-row items-center justify-between mb-4">
            <View>
              <Text className="text-sm text-gray-500">Bienvenido,</Text>
              <Text className="text-2xl font-bold text-gray-800">
                {user?.name || 'Abogado'}
              </Text>
            </View>
            <View className="flex-row items-center">
              <View className="relative mr-3">
                <TouchableOpacity
                  onPress={() => router.push('/notifications/notifications')}
                  className="p-3 bg-gray-100 rounded-full"
                >
                  <Ionicons name="notifications-outline" size={22} color="#1F2937" />
                </TouchableOpacity>
                {unreadNotifications > 0 && (
                  <View
                    className="absolute items-center justify-center px-1 bg-red-500 rounded-full"
                    style={{ minWidth: 18, height: 18, top: -2, right: -2 }}
                  >
                    <Text style={{ color: '#fff', fontSize: 10, fontWeight: '700' }}>
                      {unreadNotifications > 99 ? '99+' : unreadNotifications}
                    </Text>
                  </View>
                )}
              </View>

              <TouchableOpacity
                onPress={() => router.push('/lawyer/profile')}
                className="items-center justify-center w-12 h-12 overflow-hidden bg-gray-100 rounded-full"
              >
                {profileImageUri ? (
                  <Image
                    source={{ uri: profileImageUri }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                ) : (
                  <Ionicons name="person-outline" size={24} color="#1F2937" />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Verification Badge */}
          {user?.lawyer_state === 'approved' && (
            <View className="flex-row items-center p-3 bg-green-50 rounded-xl">
              <Ionicons name="checkmark-circle" size={20} color="#22C55E" />
              <Text className="ml-2 font-semibold text-green-700">
                Perfil Verificado
              </Text>
            </View>
          )}
        </View>

        {/* Stats */}
        <View className="mt-6">
          <Text className="px-6 mb-4 text-xl font-bold text-gray-800">Resumen</Text>
          <FlatList
            data={stats}
            renderItem={renderStat}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 24 }}
          />
        </View>

        {/* Recent Cases */}
        <View className="mt-8 mb-6">
          <View className="flex-row items-center justify-between px-6 mb-4">
            <Text className="text-xl font-bold text-gray-800">Casos Recientes</Text>
            <TouchableOpacity onPress={() => router.push('/lawyer/cases')}>
              <Text className="font-semibold text-blue-600">Ver todos</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View className="items-center justify-center py-10">
              <ActivityIndicator size="large" color="#2563eb" />
              <Text className="mt-3 text-gray-500">Cargando casos...</Text>
            </View>
          ) : recentCases.length > 0 ? (
            recentCases.map((caseItem) => (
              <View key={caseItem.id}>
                {renderCase({ item: caseItem })}
              </View>
            ))
          ) : (
            <View className="items-center justify-center px-6 py-10">
              <View className="p-4 mb-3 bg-gray-100 rounded-full">
                <Ionicons name="folder-open-outline" size={28} color="#6B7280" />
              </View>
              <Text className="font-semibold text-gray-800">
                No tienes casos en progreso
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNavigationBar />
    </SafeAreaView>
  );
}
