// LAWYER APP - app/screens/login/pending-verification.tsx

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../components/Button';

export default function PendingVerificationScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="items-center justify-center flex-1 px-6">
        {/* Icon */}
        <View className="p-8 mb-6 bg-yellow-100 rounded-full">
          <Ionicons name="time-outline" size={80} color="#EAB308" />
        </View>

        {/* Title */}
        <Text className="mb-4 text-3xl font-bold text-center text-gray-800">
          Cuenta Pendiente
        </Text>

        {/* Description */}
        <Text className="px-4 mb-8 text-lg text-center text-gray-600">
          Tu registro como abogado ha sido recibido exitosamente. 
          {'\n\n'}
          Estamos verificando tu información y te notificaremos por email cuando tu cuenta sea aprobada.
          {'\n\n'}
          Este proceso puede tomar de 24 a 48 horas.
        </Text>

        {/* Info Box */}
        <View className="w-full p-4 mb-8 bg-blue-50 rounded-xl">
          <View className="flex-row items-center mb-2">
            <Ionicons name="information-circle" size={24} color="#2563eb" />
            <Text className="ml-2 font-semibold text-blue-800">
              ¿Qué sigue?
            </Text>
          </View>
          <Text className="ml-8 text-blue-700">
            • Verificaremos tus credenciales{'\n'}
            • Recibirás un email de confirmación{'\n'}
            • Podrás iniciar sesión una vez aprobado
          </Text>
        </View>

        {/* Button */}
        <Button
          title="Volver al Inicio"
          onPress={() => router.replace('/splash/splash')}
        />

        {/* Support Link */}
        <TouchableOpacity className="mt-6">
          <Text className="text-gray-500">
            ¿Necesitas ayuda?{' '}
            <Text className="font-semibold text-blue-600">
              Contáctanos
            </Text>
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}