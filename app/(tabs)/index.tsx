// app/splash/splash-lawyer.tsx

import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function SplashLawyer() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animación de fade-in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Redirección automática
    const timeout = setTimeout(() => {
      router.replace('/login/login');
    }, 2500);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Animated.View
        style={{ opacity: fadeAnim }}
        className="items-center justify-center flex-1 px-6"
      >
        {/* Icono */}
        <View className="p-6 mb-6 bg-blue-600 rounded-full">
          <Ionicons name="scale" size={64} color="white" />
        </View>

        {/* Nombre App */}
        <Text className="mb-4 text-3xl font-bold text-slate-900">
          LegalApp Pro
        </Text>

        {/* Loader */}
        <ActivityIndicator size="large" color="#2563eb" />

        {/* Texto */}
        <Text className="mt-6 text-sm text-slate-500">
          Cargando aplicación...
        </Text>
      </Animated.View>
    </SafeAreaView>
  );
}
