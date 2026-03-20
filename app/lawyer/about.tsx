import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const aboutBlocks = [
  {
    icon: 'briefcase-outline' as const,
    title: 'Proposito del modulo abogado',
    text: 'Facilitar la gestion de casos, envio de ofertas y seguimiento profesional desde una sola interfaz.',
  },
  {
    icon: 'flask-outline' as const,
    title: 'Version actual',
    text: 'Edicion provisional de prueba. Algunas funciones y textos estan sujetos a ajustes de producto.',
  },
  {
    icon: 'ribbon-outline' as const,
    title: 'Compromiso de calidad',
    text: 'La experiencia se esta refinando para mantener estandares de claridad, seguridad y rendimiento.',
  },
];

export default function AboutScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="px-6 pt-4 pb-6 bg-white border-b border-slate-200">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
              <Ionicons name="arrow-back" size={24} color="#0f172a" />
            </TouchableOpacity>
            <Text className="ml-2 text-2xl font-bold text-slate-900">Acerca de</Text>
          </View>
          <Text className="mt-3 text-sm leading-6 text-slate-500">
            Informacion institucional del modulo para abogados en entorno de validacion.
          </Text>
        </View>

        <View className="p-6">
          <View className="p-4 mb-4 border border-emerald-200 bg-emerald-50 rounded-2xl">
            <View className="flex-row items-center">
              <Ionicons name="checkmark-circle-outline" size={18} color="#047857" />
              <Text className="ml-2 text-sm font-semibold text-emerald-800">
                Producto en evolucion controlada
              </Text>
            </View>
            <Text className="mt-1 text-sm leading-6 text-emerald-700">
              Esta version combina contenido de prueba con lineamientos profesionales para acelerar validaciones.
            </Text>
          </View>

          {aboutBlocks.map((block) => (
            <View key={block.title} className="p-5 mb-3 bg-white border border-slate-100 shadow-sm rounded-2xl">
              <View className="flex-row items-start">
                <View className="p-3 rounded-xl bg-slate-100">
                  <Ionicons name={block.icon} size={20} color="#2563eb" />
                </View>
                <View className="flex-1 ml-3">
                  <Text className="text-base font-bold text-slate-800">{block.title}</Text>
                  <Text className="mt-1 text-sm leading-6 text-slate-600">{block.text}</Text>
                </View>
              </View>
            </View>
          ))}

          <View className="p-5 mt-1 bg-white border border-slate-100 shadow-sm rounded-2xl">
            <Text className="text-sm font-semibold tracking-widest text-slate-500 uppercase">Detalle tecnico</Text>
            <Text className="mt-2 text-sm leading-6 text-slate-600">Aplicacion: Lawyer App</Text>
            <Text className="text-sm leading-6 text-slate-600">Canal: piloto interno</Text>
            <Text className="text-sm leading-6 text-slate-600">Estado: provisional</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
