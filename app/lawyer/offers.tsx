// LAWYER APP - app/screens/lawyer/offers.tsx

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
import offerService, { LawyerOffer } from '../../services/offerService';
import BottomNavigationBar from '@/components/BottomNavigationBar';

export default function OffersScreen() {
  const router = useRouter();
  const [offers, setOffers] = useState<LawyerOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadOffers();
  }, []);

  const loadOffers = async () => {
    try {
      const response = await offerService.listOffers();
      if (response.success && response.data) {
        setOffers(response.data);
      } else {
        Alert.alert('Error', response.error || 'No se pudieron cargar las ofertas');
      }
    } catch (error) {
      console.error('Error loading offers:', error);
      Alert.alert('Error', 'Error al cargar las ofertas');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadOffers();
    setRefreshing(false);
  }, []);

  const handleCancelOffer = (offerId: number, caseName: string) => {
    Alert.alert(
      'Cancelar Oferta',
      `¿Estás seguro de cancelar la oferta para "${caseName}"?`,
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Sí, Cancelar',
          style: 'destructive',
          onPress: () => confirmCancelOffer(offerId),
        },
      ]
    );
  };

  const confirmCancelOffer = async (offerId: number) => {
    try {
      const response = await offerService.cancelOffer(offerId);
      if (response.success) {
        Alert.alert('Éxito', 'Oferta cancelada correctamente');
        loadOffers(); // Recargar la lista
      } else {
        Alert.alert('Error', response.error || 'No se pudo cancelar la oferta');
      }
    } catch {
      Alert.alert('Error', 'Error al cancelar la oferta');
    }
  };

  const getStateStyle = (state: string) => {
    switch (state) {
      case 'sent':
        return { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Enviada', icon: 'paper-plane' };
      case 'accepted':
        return { bg: 'bg-green-100', text: 'text-green-700', label: 'Aceptada', icon: 'checkmark-circle' };
      case 'rejected':
        return { bg: 'bg-red-100', text: 'text-red-700', label: 'Rechazada', icon: 'close-circle' };
      case 'cancelled':
        return { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Cancelada', icon: 'ban' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-700', label: state, icon: 'document' };
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-DO', {
      style: 'currency',
      currency: 'DOP',
    }).format(price);
  };

  const formatViewedAgo = (viewedAt: string | null) => {
    if (!viewedAt) return 'No vista por el cliente';
    const viewedTime = new Date(viewedAt).getTime();
    const diffMs = Date.now() - viewedTime;
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    if (diffMinutes < 1) return 'Vista hace unos segundos';
    if (diffMinutes < 60) return `Vista hace ${diffMinutes} min`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `Vista hace ${diffHours} h`;
    const diffDays = Math.floor(diffHours / 24);
    return `Vista hace ${diffDays} d`;
  };

  if (loading) {
    return (
      <SafeAreaView className="items-center justify-center flex-1 bg-gray-50">
        <ActivityIndicator size="large" color="#2563eb" />
        <Text className="mt-4 text-gray-600">Cargando ofertas...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="px-6 pt-4 pb-6 bg-white border-b border-gray-200">
        <View className="flex-row items-center justify-between mb-2">
          <TouchableOpacity
            onPress={() => router.back()}
            className="p-2 -ml-2"
          >
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onRefresh}
            className="p-2 -mr-2"
          >
            <Ionicons name="refresh" size={24} color="#2563eb" />
          </TouchableOpacity>
        </View>
        <Text className="text-2xl font-bold text-gray-800">
          Mis Ofertas
        </Text>
        <Text className="mt-1 text-gray-500">
          {offers.length} {offers.length === 1 ? 'oferta' : 'ofertas'} en total
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {offers.length === 0 ? (
          <View className="items-center px-6 mt-20">
            <View className="p-6 mb-4 bg-gray-100 rounded-full">
              <Ionicons name="cash-outline" size={48} color="#6B7280" />
            </View>
            <Text className="mb-2 text-xl font-semibold text-gray-800">
              No tienes ofertas
            </Text>
            <Text className="mb-6 text-center text-gray-500">
              Las ofertas que envíes a los casos aparecerán aquí
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/lawyer/cases')}
              className="px-6 py-3 bg-blue-600 rounded-xl"
            >
              <Text className="font-semibold text-white">Ver Casos</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="px-6 py-4">
            {offers.map((offer) => {
              const stateStyle = getStateStyle(offer.state);
              
              return (
                <View
                  key={offer.id}
                  className="p-5 mb-4 bg-white shadow-sm rounded-2xl"
                >
                  {/* Header */}
                  <View className="flex-row items-start justify-between mb-3">
                    <View className="flex-1 mr-3">
                      <Text className="mb-1 text-lg font-bold text-gray-800">
                        {offer.case_name}
                      </Text>
                      <Text className="text-2xl font-bold text-blue-600">
                        {formatPrice(offer.price)}
                      </Text>
                    </View>
                    <View className={`px-3 py-1.5 rounded-lg ${stateStyle.bg}`}>
                      <Text className={`text-xs font-semibold ${stateStyle.text}`}>
                        {stateStyle.label}
                      </Text>
                    </View>
                  </View>

                  {/* Message */}
                  {offer.message && (
                    <View className="p-3 mb-3 bg-gray-50 rounded-xl">
                      <Text className="text-sm leading-5 text-gray-600">
                        {offer.message}
                      </Text>
                    </View>
                  )}

                  {/* Client activity */}
                  <View className="p-3 mb-3 border border-gray-100 rounded-xl bg-slate-50">
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center flex-1">
                        <Ionicons name="eye-outline" size={16} color="#334155" />
                        <Text className="ml-2 text-sm font-medium text-slate-700">
                          {formatViewedAgo(offer.viewed_at)}
                        </Text>
                      </View>
                      <View className={`px-2.5 py-1 rounded-full ${offer.is_favorite ? 'bg-pink-100' : 'bg-gray-100'}`}>
                        <Text className={`text-xs font-semibold ${offer.is_favorite ? 'text-pink-700' : 'text-gray-600'}`}>
                          {offer.is_favorite ? 'Favorita' : 'No favorita'}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Actions */}
                  <View className="flex-row items-center justify-between pt-3 border-t border-gray-100">
                    <TouchableOpacity
  onPress={() =>
    router.push({
      pathname: '/lawyer/case-detail/[id]',
      params: { id: String(offer.case_id) },
    })
  }
  className="flex-row items-center"
>

                      <Ionicons name="eye-outline" size={18} color="#2563eb" />
                      <Text className="ml-2 font-medium text-blue-600">Ver Caso</Text>
                    </TouchableOpacity>

                    {offer.state === 'sent' && (
                      <TouchableOpacity
                        onPress={() => handleCancelOffer(offer.id, offer.case_name)}
                        className="flex-row items-center"
                      >
                        <Ionicons name="close-circle-outline" size={18} color="#EF4444" />
                        <Text className="ml-2 font-medium text-red-600">Cancelar</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNavigationBar/>
    </SafeAreaView>
  );
}
