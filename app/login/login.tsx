// LAWYER APP - app/screens/login/login.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};
    
    if (!email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email inválido';
    }
    
    if (!password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      await login({ email, password });
      // La navegación se manejará automáticamente
    } catch (error: any) {
      // Manejar el caso especial de verificación pendiente
      if (error.message === 'PENDING_VERIFICATION') {
        router.replace('/login/pending-verification');
      } else {
        Alert.alert(
          'Error de Inicio de Sesión',
          error.message || 'No se pudo iniciar sesión. Verifica tus credenciales.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="justify-center flex-1 px-6">
            {/* Back Button */}
            <TouchableOpacity
              onPress={() => router.back()}
              className="absolute top-4 left-6"
            >
              <Ionicons name="arrow-back" size={28} color="#1F2937" />
            </TouchableOpacity>

            {/* Logo / Header */}
            <View className="items-center mb-10">
              <View className="p-6 mb-4 bg-blue-600 rounded-full">
                <Ionicons name="briefcase" size={48} color="white" />
              </View>
              <Text className="mb-2 text-3xl font-bold text-gray-800">
                Bienvenido Abogado
              </Text>
              <Text className="text-center text-gray-500">
                Inicia sesión para gestionar tus casos
              </Text>
            </View>

            {/* Form */}
            <View>
              <Input
                label="Email"
                placeholder="tu@email.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                icon="mail-outline"
                error={errors.email}
              />

              <Input
                label="Contraseña"
                placeholder="••••••••"
                value={password}
                onChangeText={setPassword}
                isPassword
                icon="lock-closed-outline"
                error={errors.password}
              />

              <TouchableOpacity
                className="self-end mb-6"
                onPress={() => router.push('/login/forgot-password')}
              >
                <Text className="font-medium text-blue-600">
                  ¿Olvidaste tu contraseña?
                </Text>
              </TouchableOpacity>

              <Button
                title="Iniciar Sesión"
                onPress={handleLogin}
                loading={loading}
              />
            </View>

            {/* Register Link */}
            <View className="items-center mt-8">
              <Text className="mb-4 text-gray-600">¿No tienes cuenta?</Text>
              
              <TouchableOpacity
                className="px-8 py-3 bg-blue-600 rounded-xl"
                onPress={() => router.push('/login/register-lawyer')}
              >
                <Text className="text-base font-semibold text-white">
                  Registrarse como Abogado
                </Text>
              </TouchableOpacity>

              <View className="p-4 mt-6 bg-blue-50 rounded-xl">
                <View className="flex-row items-center">
                  <Ionicons name="information-circle" size={20} color="#2563eb" />
                  <Text className="ml-2 font-semibold text-blue-800">Nota:</Text>
                </View>
                <Text className="mt-1 text-sm text-blue-700">
                  Tu cuenta será verificada antes de poder acceder.
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
