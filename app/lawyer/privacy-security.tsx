import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const privacyItems = [
  {
    icon: 'shield-checkmark-outline' as const,
    title: 'Proteccion de cuenta',
    detail: 'Usa contrasena segura, activa cambios periodicos y evita compartir credenciales.',
  },
  {
    icon: 'lock-closed-outline' as const,
    title: 'Resguardo de datos',
    detail: 'Los datos de casos y ofertas se gestionan bajo controles de acceso por rol y trazabilidad.',
  },
  {
    icon: 'alert-circle-outline' as const,
    title: 'Reporte de incidentes',
    detail: 'Si detectas actividad sospechosa, reportala al soporte para revision prioritaria.',
  },
];

export default function PrivacySecurityScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="px-6 pt-4 pb-6 bg-white border-b border-slate-200">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
              <Ionicons name="arrow-back" size={24} color="#0f172a" />
            </TouchableOpacity>
            <Text className="ml-2 text-2xl font-bold text-slate-900">Privacidad y Seguridad</Text>
          </View>
          <Text className="mt-3 text-sm leading-6 text-slate-500">
            Marco provisional de privacidad y seguridad para la app de abogados en fase de prueba controlada.
          </Text>
        </View>

        <View className="p-6">
          <View className="p-4 mb-4 border border-blue-200 bg-blue-50 rounded-2xl">
            <View className="flex-row items-center">
              <Ionicons name="information-circle-outline" size={18} color="#1d4ed8" />
              <Text className="ml-2 text-sm font-semibold text-blue-800">Politica provisional</Text>
            </View>
            <Text className="mt-1 text-sm leading-6 text-blue-700">
              Este apartado resume lineamientos temporales mientras se publica la version final de politicas.
            </Text>
          </View>

          {privacyItems.map((item) => (
            <View key={item.title} className="p-5 mb-3 bg-white border border-slate-100 shadow-sm rounded-2xl">
              <View className="flex-row items-start">
                <View className="p-3 rounded-xl bg-slate-100">
                  <Ionicons name={item.icon} size={20} color="#2563eb" />
                </View>
                <View className="flex-1 ml-3">
                  <Text className="text-base font-bold text-slate-800">{item.title}</Text>
                  <Text className="mt-1 text-sm leading-6 text-slate-600">{item.detail}</Text>
                </View>
              </View>
            </View>
          ))}

          <View className="p-5 mt-1 bg-white border border-slate-100 shadow-sm rounded-2xl">
            <Text className="text-sm font-semibold tracking-widest text-slate-500 uppercase">Estado actual</Text>
            <Text className="mt-2 text-sm leading-6 text-slate-600">
              Ultima revision interna: febrero 2026. El contenido final podria cambiar conforme avance la validacion
              legal y operativa de la plataforma.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
