import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const supportContacts = [
  {
    icon: 'mail-outline' as const,
    title: 'Correo de soporte',
    value: 'soporte@legalmarketplace.app',
    hint: 'Respuesta estimada: 24-48 horas habiles',
  },
  {
    icon: 'chatbubbles-outline' as const,
    title: 'Chat de ayuda',
    value: 'Disponible de lunes a viernes',
    hint: 'Horario provisional: 9:00 a.m. - 6:00 p.m.',
  },
  {
    icon: 'call-outline' as const,
    title: 'Linea de asistencia',
    value: '+1 (000) 000-0000',
    hint: 'Canal temporal para etapa de prueba',
  },
];

export default function HelpSupportScreen() {
  const router = useRouter();

  const handleComingSoon = () => {
    Alert.alert('Modulo provisional', 'Este canal esta en fase de prueba y se habilitara completamente pronto.');
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="px-6 pt-4 pb-6 bg-white border-b border-slate-200">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
              <Ionicons name="arrow-back" size={24} color="#0f172a" />
            </TouchableOpacity>
            <Text className="ml-2 text-2xl font-bold text-slate-900">Ayuda y Soporte</Text>
          </View>
          <Text className="mt-3 text-sm leading-6 text-slate-500">
            Centro de asistencia provisional para abogados. Esta version prioriza respuestas rapidas y seguimiento
            basico de incidencias.
          </Text>
        </View>

        <View className="p-6">
          <View className="p-4 mb-4 border border-amber-200 bg-amber-50 rounded-2xl">
            <View className="flex-row items-center">
              <Ionicons name="flask-outline" size={18} color="#b45309" />
              <Text className="ml-2 text-sm font-semibold text-amber-800">Version de prueba</Text>
            </View>
            <Text className="mt-1 text-sm leading-6 text-amber-700">
              Las funcionalidades de soporte son provisionales y pueden ajustarse en futuras versiones.
            </Text>
          </View>

          <Text className="mb-3 text-xs font-semibold tracking-widest text-slate-500 uppercase">
            Canales disponibles
          </Text>

          {supportContacts.map((contact) => (
            <View key={contact.title} className="p-5 mb-3 bg-white border border-slate-100 shadow-sm rounded-2xl">
              <View className="flex-row items-start">
                <View className="p-3 rounded-xl bg-slate-100">
                  <Ionicons name={contact.icon} size={20} color="#2563eb" />
                </View>
                <View className="flex-1 ml-3">
                  <Text className="text-base font-bold text-slate-800">{contact.title}</Text>
                  <Text className="mt-1 text-sm font-medium text-slate-700">{contact.value}</Text>
                  <Text className="mt-1 text-sm text-slate-500">{contact.hint}</Text>
                </View>
              </View>
            </View>
          ))}

          <View className="p-5 mt-1 bg-white border border-slate-100 shadow-sm rounded-2xl">
            <Text className="text-base font-bold text-slate-800">Preguntas frecuentes</Text>
            <Text className="mt-2 text-sm leading-6 text-slate-600">
              Para dudas sobre ofertas, estado de casos, notificaciones o acceso, usa primero el correo de soporte
              para recibir una guia inicial.
            </Text>

            <TouchableOpacity
              onPress={handleComingSoon}
              className="items-center py-3 mt-4 bg-slate-900 rounded-xl"
              activeOpacity={0.85}
            >
              <Text className="font-semibold text-white">Solicitar asistencia</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
