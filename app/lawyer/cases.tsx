// LAWYER APP - app/screens/lawyer/cases.tsx

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
import lawyerCaseService, { LawyerCase } from '../../services/caseService';
import offerService from '../../services/offerService';
import OfferDialog from '../../components/offerDialog';
import BottomNavigationBar from '@/components/BottomNavigationBar';

export default function CasesScreen() {
  const router = useRouter();
  const [cases, setCases] = useState<LawyerCase[]>([]);
  const [offeredCaseIds, setOfferedCaseIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [offerDialogVisible, setOfferDialogVisible] = useState(false);
  const [selectedCase, setSelectedCase] = useState<LawyerCase | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadCases();
  }, []);

  const loadCases = async () => {
    try {
      const [casesResponse, offersResponse] = await Promise.all([
        lawyerCaseService.listCases(),
        offerService.listOffers(),
      ]);

      if (casesResponse.success && casesResponse.data) {
        setCases(casesResponse.data);
      } else {
        setCases([]);
      }

      if (offersResponse.success && offersResponse.data) {
        const caseIdsWithOffer = new Set(
          offersResponse.data
            .map((offer) => offer.case_id)
            .filter((caseId): caseId is number => Number.isFinite(caseId))
        );
        setOfferedCaseIds(caseIdsWithOffer);
      }
    } catch (error) {
      console.error('Error loading cases:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadCases();
    setRefreshing(false);
  }, []);

  const handleOpenOfferDialog = (caseItem: LawyerCase, e: any) => {
    e.stopPropagation();
    if (offeredCaseIds.has(caseItem.id)) {
      Alert.alert('Oferta enviada', 'Ya enviaste una oferta para este caso.');
      return;
    }
    setSelectedCase(caseItem);
    setOfferDialogVisible(true);
  };

  const handleCreateOffer = async (price: number, message: string) => {
    if (!selectedCase || submitting) return;

    setSubmitting(true);
    try {
      const response = await offerService.createOffer(selectedCase.id, { price, message });
      
      if (response.success) {
        setOfferedCaseIds((prev) => {
          const next = new Set(prev);
          next.add(selectedCase.id);
          return next;
        });
        Alert.alert(
          'Éxito',
          'Tu oferta ha sido enviada correctamente',
          [
            {
              text: 'Ver Ofertas',
              onPress: () => {
                setOfferDialogVisible(false);
                router.push('/lawyer/offers');
              },
            },
            {
              text: 'Aceptar',
              onPress: () => setOfferDialogVisible(false),
            },
          ]
        );
        setSelectedCase(null);
      } else {
        Alert.alert('Error', response.error || 'No se pudo crear la oferta');
      }
    } catch (error) {
      Alert.alert('Error', 'Error al crear la oferta');
    } finally {
      setSubmitting(false);
    }
  };

  const getStageColor = (stage: string) => {
    const stageLower = stage.toLowerCase();
    if (stageLower.includes('new') || stageLower.includes('nuevo')) {
      return { bg: 'bg-blue-100', text: 'text-blue-700', icon: 'sparkles' };
    }
    if (stageLower.includes('progress') || stageLower.includes('progreso')) {
      return { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: 'time' };
    }
    if (stageLower.includes('won') || stageLower.includes('ganado')) {
      return { bg: 'bg-green-100', text: 'text-green-700', icon: 'checkmark-circle' };
    }
    return { bg: 'bg-gray-100', text: 'text-gray-700', icon: 'document' };
  };

  if (loading) {
    return (
      <SafeAreaView className="items-center justify-center flex-1 bg-gray-50">
        <ActivityIndicator size="large" color="#2563eb" />
        <Text className="mt-4 text-gray-600">Cargando casos...</Text>
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
          Casos Disponibles
        </Text>
        <Text className="mt-1 text-gray-500">
          {cases.length} {cases.length === 1 ? 'caso' : 'casos'} disponibles
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {cases.length === 0 ? (
          <View className="items-center px-6 mt-20">
            <View className="p-6 mb-4 bg-gray-100 rounded-full">
              <Ionicons name="folder-open-outline" size={48} color="#6B7280" />
            </View>
            <Text className="mb-2 text-xl font-semibold text-gray-800">
              No hay casos disponibles
            </Text>
            <Text className="text-center text-gray-500">
              Los casos compatibles con tus especialidades aparecerán aquí
            </Text>
          </View>
        ) : (
          <View className="px-6 py-4">
            {cases.map((caseItem) => {
              const stageStyle = getStageColor(caseItem.stage);
              const hasSentOffer = offeredCaseIds.has(caseItem.id);
              
              return (
                <TouchableOpacity
                  key={caseItem.id}
                  className="p-5 mb-4 bg-white shadow-sm rounded-2xl"
                  activeOpacity={0.7}
                    onPress={() =>
    router.push({
      pathname: '/lawyer/case-detail/[id]',
      params: { id: String(caseItem.id) },
    })
  }
                >
                  {/* Header */}
                  <View className="flex-row items-start justify-between mb-3">
                    <View className="flex-1 mr-3">
                      <Text className="mb-1 text-lg font-bold text-gray-800">
                        {caseItem.name}
                      </Text>
                      <View className="flex-row items-center">
                        <Ionicons name="person-outline" size={16} color="#6B7280" />
                        <Text className="ml-1 text-sm text-gray-600">
                          {caseItem.client_name}
                        </Text>
                      </View>
                    </View>
                    <View className={`px-3 py-1.5 rounded-lg ${stageStyle.bg}`}>
                      <Text className={`text-xs font-semibold ${stageStyle.text}`}>
                        {caseItem.stage}
                      </Text>
                    </View>
                  </View>

                  {/* Description */}
                  {caseItem.description && (
                    <Text className="mb-3 text-sm leading-5 text-gray-600" numberOfLines={2}>
                      {caseItem.description}
                    </Text>
                  )}

                  {/* Actions */}
                  <View className="flex-row items-center justify-between pt-3 border-t border-gray-100">
                    <TouchableOpacity
  onPress={() =>
    router.push({
      pathname: '/lawyer/case-detail/[id]',
      params: { id: String(caseItem.id) },
    })
  }
  className="flex-row items-center"
>

                      <Ionicons name="eye-outline" size={18} color="#2563eb" />
                      <Text className="ml-2 text-sm font-medium text-blue-600">
                        Ver detalles
                      </Text>
                    </TouchableOpacity>

                    {hasSentOffer ? (
                      <View className="flex-row items-center px-4 py-2 bg-green-100 rounded-lg">
                        <Ionicons name="checkmark-circle" size={16} color="#047857" />
                        <Text className="ml-1 text-sm font-semibold text-green-700">
                          Oferta enviada
                        </Text>
                      </View>
                    ) : (
                      <TouchableOpacity
                        onPress={(e) => handleOpenOfferDialog(caseItem, e)}
                        className="flex-row items-center px-4 py-2 bg-blue-600 rounded-lg"
                        activeOpacity={0.8}
                      >
                        <Ionicons name="cash" size={16} color="white" />
                        <Text className="ml-1 text-sm font-semibold text-white">
                          Ofertar
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Offer Dialog */}
      <OfferDialog
        visible={offerDialogVisible}
        onClose={() => setOfferDialogVisible(false)}
        onSubmit={handleCreateOffer}
        loading={submitting}
        caseTitle={selectedCase?.name || ''}
      />

      {/* Bottom Navigation */}
      <BottomNavigationBar/>
    </SafeAreaView>
  );
}
