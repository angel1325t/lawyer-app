// LAWYER APP - app/screens/lawyer/case-detail/[id].tsx

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import lawyerCaseService, { LawyerCase } from '../../../services/caseService';
import offerService from '../../../services/offerService';
import OfferDialog from '../../../components/offerDialog';

type StageStyle = {
  bg: string;
  text: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
};

export default function CaseDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const caseId = Number(id);

  const [caseData, setCaseData] = useState<LawyerCase | null>(null);
  const [canOffer, setCanOffer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [offerDialogVisible, setOfferDialogVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadCaseDetails = useCallback(async () => {
    setLoading(true);
    try {
      const [caseResponse, canOfferResponse] = await Promise.all([
        lawyerCaseService.getCase(caseId),
        lawyerCaseService.canOffer(caseId),
      ]);

      if (caseResponse.success && caseResponse.data) {
        setCaseData(caseResponse.data);
      } else {
        setCaseData(null);
      }

      if (canOfferResponse.success && canOfferResponse.data !== undefined) {
        setCanOffer(canOfferResponse.data);
      } else {
        setCanOffer(false);
      }
    } catch {
      Alert.alert('Error', 'No se pudo cargar el caso');
    } finally {
      setLoading(false);
    }
  }, [caseId]);

  useEffect(() => {
    loadCaseDetails();
  }, [loadCaseDetails]);

  const handleCreateOffer = async (price: number, message: string) => {
    if (submitting) return;

    setSubmitting(true);
    try {
      const response = await offerService.createOffer(caseId, { price, message });

      if (response.success) {
        setCanOffer(false);
        setOfferDialogVisible(false);
        Alert.alert('Exito', 'Tu oferta ha sido enviada correctamente', [
          {
            text: 'Ver Ofertas',
            onPress: () => router.push('/lawyer/offers'),
          },
          {
            text: 'Aceptar',
          },
        ]);
      } else {
        const alreadyOffered = (response.error || '').toLowerCase().includes('already');
        if (alreadyOffered) {
          setCanOffer(false);
          setOfferDialogVisible(false);
        }
        Alert.alert('Error', response.error || 'No se pudo crear la oferta');
      }
    } catch {
      Alert.alert('Error', 'Error al crear la oferta');
    } finally {
      setSubmitting(false);
    }
  };

  const stageStyle = useMemo<StageStyle>(() => {
    const stageLower = caseData?.stage?.toLowerCase() || '';
    if (stageLower.includes('new') || stageLower.includes('nuevo')) {
      return { bg: 'bg-blue-100', text: 'text-blue-700', icon: 'sparkles-outline' };
    }
    if (stageLower.includes('progress') || stageLower.includes('progreso')) {
      return { bg: 'bg-amber-100', text: 'text-amber-700', icon: 'time-outline' };
    }
    if (stageLower.includes('won') || stageLower.includes('ganado')) {
      return { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: 'checkmark-circle-outline' };
    }
    return { bg: 'bg-slate-100', text: 'text-slate-700', icon: 'document-text-outline' };
  }, [caseData?.stage]);

  if (loading) {
    return (
      <SafeAreaView className="items-center justify-center flex-1 bg-slate-50">
        <ActivityIndicator size="large" color="#2563eb" />
        <Text className="mt-4 text-slate-600">Cargando detalle del caso...</Text>
      </SafeAreaView>
    );
  }

  if (!caseData) {
    return (
      <SafeAreaView className="items-center justify-center flex-1 px-6 bg-slate-50">
        <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
        <Text className="mt-4 text-xl font-semibold text-slate-800">Caso no encontrado</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="px-6 py-3 mt-6 bg-blue-600 rounded-xl"
        >
          <Text className="font-semibold text-white">Volver</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="px-6 pt-4 pb-5 bg-white border-b border-slate-200">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
            <Ionicons name="arrow-back" size={24} color="#0f172a" />
          </TouchableOpacity>
          <TouchableOpacity onPress={loadCaseDetails} className="p-2 -mr-2">
            <Ionicons name="refresh-outline" size={22} color="#2563eb" />
          </TouchableOpacity>
        </View>
        <Text className="mt-4 text-xs font-semibold tracking-widest text-slate-500 uppercase">
          Gestion de caso
        </Text>
        <Text className="mt-1 text-2xl font-bold text-slate-900">Detalle del Caso</Text>
        <Text className="mt-1 text-sm leading-5 text-slate-500">
          Revisa la informacion clave antes de presentar tu propuesta profesional.
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="p-6">
          <View className="p-6 bg-white border border-slate-100 shadow-sm rounded-3xl">
            <View className="flex-row items-start justify-between">
              <View className="flex-1 pr-3">
                <Text className="text-2xl font-extrabold leading-8 text-slate-900">{caseData.name}</Text>
                <Text className="mt-2 text-sm text-slate-500">Caso #{caseData.id}</Text>
              </View>
              <View className={`px-3 py-2 rounded-xl ${stageStyle.bg}`}>
                <View className="flex-row items-center">
                  <Ionicons name={stageStyle.icon} size={16} color="#334155" />
                  <Text className={`ml-1 text-xs font-semibold ${stageStyle.text}`}>
                    {caseData.stage}
                  </Text>
                </View>
              </View>
            </View>

            <View className="h-px my-5 bg-slate-100" />

            <View className="flex-row">
              <View className="flex-1 p-3 mr-2 bg-slate-50 rounded-2xl">
                <Text className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                  Cliente
                </Text>
                <View className="flex-row items-center mt-2">
                  <Ionicons name="person-circle-outline" size={18} color="#2563eb" />
                  <Text className="ml-2 text-sm font-semibold text-slate-700">
                    {caseData.client_name}
                  </Text>
                </View>
              </View>

              <View className="flex-1 p-3 ml-2 bg-slate-50 rounded-2xl">
                <Text className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                  Ofertas
                </Text>
                <View className="flex-row items-center mt-2">
                  <Ionicons
                    name={canOffer ? 'add-circle-outline' : 'checkmark-done-circle-outline'}
                    size={18}
                    color={canOffer ? '#2563eb' : '#16a34a'}
                  />
                  <Text className={`ml-2 text-sm font-semibold ${canOffer ? 'text-blue-700' : 'text-emerald-700'}`}>
                    {canOffer ? 'Disponible' : 'Completado'}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View className="p-6 mt-4 bg-white border border-slate-100 shadow-sm rounded-3xl">
            <View className="flex-row items-center mb-3">
              <View className="p-2 bg-blue-100 rounded-xl">
                <Ionicons name="document-text-outline" size={18} color="#2563eb" />
              </View>
              <Text className="ml-3 text-lg font-bold text-slate-800">Resumen del caso</Text>
            </View>

            <Text className="text-base leading-7 text-slate-600">
              {caseData.description?.trim()
                ? caseData.description
                : 'Este caso aun no incluye una descripcion detallada por parte del cliente.'}
            </Text>
          </View>

          <View className="p-5 mt-4 border border-blue-100 bg-blue-50 rounded-3xl">
            <View className="flex-row items-start">
              <View className="p-2 bg-white rounded-xl">
                <Ionicons name="bulb-outline" size={18} color="#2563eb" />
              </View>
              <View className="flex-1 ml-3">
                <Text className="text-sm font-semibold text-blue-900">
                  Recomendacion para tu propuesta
                </Text>
                <Text className="mt-1 text-sm leading-6 text-blue-800">
                  Enfatiza experiencia en casos similares, tiempos estimados y alcance legal para mejorar la
                  conversion de tu oferta.
                </Text>
              </View>
            </View>
          </View>

          {canOffer ? (
            <View className="p-6 mt-4 overflow-hidden bg-blue-700 shadow-sm rounded-3xl">
              <View className="absolute rounded-full -right-16 -top-14 h-44 w-44 bg-blue-500/30" />
              <Text className="text-xs font-semibold tracking-widest text-blue-100 uppercase">
                Accion principal
              </Text>
              <Text className="mt-2 text-2xl font-bold text-white">Enviar Oferta</Text>
              <Text className="mt-2 text-sm leading-6 text-blue-100">
                Presenta una propuesta clara con precio y estrategia. Solo se permite una oferta por caso.
              </Text>

              <View className="mt-4">
                <View className="flex-row items-center mb-2">
                  <Ionicons name="checkmark-circle-outline" size={16} color="#bfdbfe" />
                  <Text className="ml-2 text-sm text-blue-100">Precio competitivo y transparente</Text>
                </View>
                <View className="flex-row items-center mb-2">
                  <Ionicons name="checkmark-circle-outline" size={16} color="#bfdbfe" />
                  <Text className="ml-2 text-sm text-blue-100">Mensaje enfocado en resultados</Text>
                </View>
                <View className="flex-row items-center">
                  <Ionicons name="checkmark-circle-outline" size={16} color="#bfdbfe" />
                  <Text className="ml-2 text-sm text-blue-100">Tiempos de respuesta realistas</Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => setOfferDialogVisible(true)}
                className="items-center py-4 mt-5 bg-white rounded-2xl"
                activeOpacity={0.85}
              >
                <View className="flex-row items-center">
                  <Ionicons name="add-circle-outline" size={20} color="#1d4ed8" />
                  <Text className="ml-2 text-base font-bold text-blue-700">Crear Oferta</Text>
                </View>
              </TouchableOpacity>
            </View>
          ) : (
            <View className="p-6 mt-4 bg-white border border-slate-200 shadow-sm rounded-3xl">
              <View className="flex-row items-start">
                <View className="p-3 bg-slate-100 rounded-2xl">
                  <Ionicons name="shield-checkmark-outline" size={22} color="#475569" />
                </View>
                <View className="flex-1 ml-3">
                  <Text className="text-lg font-bold text-slate-800">Oferta no disponible</Text>
                  <Text className="mt-1 text-sm leading-6 text-slate-600">
                    Este caso ya no admite nuevas propuestas. Si deseas revisar tu envio anterior, consulta la
                    seccion de ofertas.
                  </Text>
                  <TouchableOpacity
                    onPress={() => router.push('/lawyer/offers')}
                    className="self-start px-4 py-2 mt-4 bg-slate-900 rounded-xl"
                  >
                    <Text className="text-sm font-semibold text-white">Ver mis ofertas</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      <OfferDialog
        visible={offerDialogVisible}
        onClose={() => setOfferDialogVisible(false)}
        onSubmit={handleCreateOffer}
        loading={submitting}
        caseTitle={caseData.name}
      />
    </SafeAreaView>
  );
}
