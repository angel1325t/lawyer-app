// app/notifications/notifications.tsx

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import Toast from 'react-native-toast-message';
import notificationService from '../../services/notificationService';

interface Notification {
  id: number;
  title: string;
  message: string;
  read: boolean;
  type: 'info' | 'alert' | 'message' | 'case' | 'payment';
  sender: string;
  created_at: string;
  read_at?: string;
}

interface NotificationGroup {
  title: string;
  notifications: Notification[];
}

export default function NotificationsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    loadNotifications();
    updateBadgeCount();
  }, []);

  const loadNotifications = async (showLoader = true) => {
    if (!user?.user_id) {
      console.warn('⚠️ No hay usuario autenticado');
      setLoading(false);
      return;
    }

    try {
      if (showLoader) setLoading(true);

      const result = await notificationService.getUserNotifications(user.user_id);

      if (result.success) {
        let nextNotifications = result.data;
        let nextUnreadCount = result.unread_count;

        if (nextUnreadCount > 0) {
          const markResult = await notificationService.markAllAsRead(user.user_id);
          if (markResult.success) {
            const nowIso = new Date().toISOString();
            nextNotifications = nextNotifications.map((notification) => ({
              ...notification,
              read: true,
              read_at: notification.read_at || nowIso,
            }));
            nextUnreadCount = 0;
          }
        }

        setNotifications(nextNotifications);
        setUnreadCount(nextUnreadCount);

        if (nextUnreadCount === 0) {
          await notificationService.setBadgeCount(0);
        }
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: result.message || 'No se pudieron cargar las notificaciones',
        });
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
      Toast.show({
        type: 'error',
        text1: 'Error de Conexión',
        text2: 'No se pudo conectar con el servidor',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadNotifications(false);
  }, []);

  const updateBadgeCount = async () => {
    const currentBadge = await notificationService.getBadgeCount();
    if (currentBadge > 0) {
      await notificationService.setBadgeCount(0);
    }
  };

  const markAsRead = async (notificationId: number) => {
    try {
      const result = await notificationService.markAsRead(notificationId);

      if (result.success) {
        setNotifications(prev =>
          prev.map(n =>
            n.id === notificationId ? { ...n, read: true } : n
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!user?.user_id) return;

    try {
      const result = await notificationService.markAllAsRead(user.user_id);

      if (result.success) {
        setNotifications(prev =>
          prev.map(n => ({ ...n, read: true }))
        );
        setUnreadCount(0);
        
        Toast.show({
          type: 'success',
          text1: 'Listo',
          text2: 'Todas las notificaciones marcadas como leídas',
        });
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'No se pudieron marcar como leídas',
      });
    }
  };

  const deleteNotification = async (notificationId: number) => {
    Alert.alert(
      'Eliminar notificación',
      '¿Estás seguro que deseas eliminar esta notificación?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await notificationService.deleteNotification(notificationId);

              if (result.success) {
                setNotifications(prev => prev.filter(n => n.id !== notificationId));
                
                Toast.show({
                  type: 'success',
                  text1: 'Eliminada',
                  text2: 'La notificación ha sido eliminada',
                });
              }
            } catch (error) {
              console.error('Error deleting notification:', error);
              Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'No se pudo eliminar la notificación',
              });
            }
          },
        },
      ]
    );
  };

  const groupNotificationsByDate = (notifications: Notification[]): NotificationGroup[] => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);

    const groups: { [key: string]: Notification[] } = {
      today: [],
      yesterday: [],
      thisWeek: [],
      older: [],
    };

    notifications.forEach(notification => {
      const notifDate = new Date(notification.created_at);
      const notifDay = new Date(notifDate.getFullYear(), notifDate.getMonth(), notifDate.getDate());

      if (notifDay.getTime() === today.getTime()) {
        groups.today.push(notification);
      } else if (notifDay.getTime() === yesterday.getTime()) {
        groups.yesterday.push(notification);
      } else if (notifDay >= lastWeek) {
        groups.thisWeek.push(notification);
      } else {
        groups.older.push(notification);
      }
    });

    const result: NotificationGroup[] = [];
    
    if (groups.today.length > 0) {
      result.push({ title: 'Hoy', notifications: groups.today });
    }
    if (groups.yesterday.length > 0) {
      result.push({ title: 'Ayer', notifications: groups.yesterday });
    }
    if (groups.thisWeek.length > 0) {
      result.push({ title: 'Esta semana', notifications: groups.thisWeek });
    }
    if (groups.older.length > 0) {
      result.push({ title: 'Anteriores', notifications: groups.older });
    }

    return result;
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'alert':
        return { name: 'alert-circle', color: '#ef4444' };
      case 'message':
        return { name: 'chatbubble', color: '#10b981' };
      case 'case':
        return { name: 'briefcase', color: '#f59e0b' };
      case 'payment':
        return { name: 'card', color: '#8b5cf6' };
      default:
        return { name: 'information-circle', color: '#2563eb' };
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const NotificationItem = ({ notification }: { notification: Notification }) => {
    const icon = getNotificationIcon(notification.type);

    return (
      <TouchableOpacity
        className={`mb-3 bg-white rounded-2xl shadow-sm overflow-hidden ${
          !notification.read ? 'border-l-4 border-blue-500' : ''
        }`}
        onPress={() => {
          if (!notification.read) {
            markAsRead(notification.id);
          }
          // Aquí puedes agregar navegación según el tipo
        }}
        activeOpacity={0.7}
      >
        <View className="flex-row p-4">
          <View
            className="items-center justify-center w-12 h-12 mr-3 rounded-full"
            style={{ backgroundColor: icon.color + '20' }}
          >
            <Ionicons name={icon.name as any} size={24} color={icon.color} />
          </View>

          <View className="flex-1">
            <View className="flex-row items-start justify-between mb-1">
              <Text
                className={`flex-1 text-base ${
                  notification.read ? 'font-medium text-gray-800' : 'font-bold text-gray-900'
                }`}
                numberOfLines={2}
              >
                {notification.title}
              </Text>
              {!notification.read && (
                <View className="w-2 h-2 ml-2 bg-blue-500 rounded-full" />
              )}
            </View>

            <Text className="mb-2 text-sm text-gray-600" numberOfLines={2}>
              {notification.message}
            </Text>

            <View className="flex-row items-center justify-between">
              <Text className="text-xs text-gray-400">
                {formatTime(notification.created_at)}
              </Text>

              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  deleteNotification(notification.id);
                }}
                className="p-1"
              >
                <Ionicons name="trash-outline" size={18} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const filteredNotifications = filter === 'all' 
    ? notifications 
    : notifications.filter(n => !n.read);

  const groupedNotifications = groupNotificationsByDate(filteredNotifications);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="items-center justify-center flex-1">
          <ActivityIndicator size="large" color="#2563eb" />
          <Text className="mt-4 text-gray-500">Cargando notificaciones...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="px-6 pt-4 pb-3 bg-white border-b border-gray-100">
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => router.back()} className="mr-4">
              <Ionicons name="arrow-back" size={28} color="#1F2937" />
            </TouchableOpacity>
            <View>
              <Text className="text-2xl font-bold text-gray-800">
                Notificaciones
              </Text>
              {unreadCount > 0 && (
                <Text className="text-sm text-blue-600">
                  {unreadCount} sin leer
                </Text>
              )}
            </View>
          </View>

          {notifications.length > 0 && unreadCount > 0 && (
            <TouchableOpacity
              onPress={markAllAsRead}
              className="px-3 py-2 bg-blue-50 rounded-xl"
            >
              <Text className="text-sm font-semibold text-blue-600">
                Marcar todas
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Filtros */}
        <View className="flex-row space-x-2">
          <TouchableOpacity
            onPress={() => setFilter('all')}
            className={`px-4 py-2 rounded-xl ${
              filter === 'all' ? 'bg-blue-600' : 'bg-gray-100'
            }`}
          >
            <Text
              className={`text-sm font-semibold ${
                filter === 'all' ? 'text-white' : 'text-gray-600'
              }`}
            >
              Todas ({notifications.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setFilter('unread')}
            className={`px-4 py-2 rounded-xl ${
              filter === 'unread' ? 'bg-blue-600' : 'bg-gray-100'
            }`}
          >
            <Text
              className={`text-sm font-semibold ${
                filter === 'unread' ? 'text-white' : 'text-gray-600'
              }`}
            >
              No leídas ({unreadCount})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Lista de notificaciones agrupadas */}
      <ScrollView
        className="flex-1 px-6"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#2563eb']}
            tintColor="#2563eb"
          />
        }
      >
        <View className="py-4">
          {groupedNotifications.length > 0 ? (
            groupedNotifications.map((group, index) => (
              <View key={index} className="mb-6">
                <Text className="mb-3 ml-1 text-xs font-bold tracking-wider text-gray-500 uppercase">
                  {group.title}
                </Text>
                {group.notifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                  />
                ))}
              </View>
            ))
          ) : (
            <View className="items-center justify-center py-20">
              <View className="items-center justify-center w-20 h-20 mb-4 bg-gray-100 rounded-full">
                <Ionicons name="notifications-outline" size={40} color="#9CA3AF" />
              </View>
              <Text className="text-lg font-semibold text-gray-800">
                {filter === 'all' ? 'No hay notificaciones' : 'No hay notificaciones sin leer'}
              </Text>
              <Text className="mt-1 text-sm text-gray-500">
                {filter === 'all' 
                  ? 'Las notificaciones aparecerán aquí' 
                  : 'Todas tus notificaciones están leídas'}
              </Text>
            </View>
          )}
        </View>

        <View className="h-8" />
      </ScrollView>

      <Toast />
    </SafeAreaView>
  );
}
