// LAWYER APP - app/screens/login/register-lawyer.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { Ionicons } from '@expo/vector-icons';
import categoryService, { LegalCategory } from '../../services/categoryService';
import { getCategoryIcon, getCategoryColor } from '../../constants/categories';

export default function RegisterLawyerScreen() {
  const router = useRouter();
  const { registerLawyer } = useAuth();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [categories, setCategories] = useState<LegalCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoadingCategories(true);
    try {
      const response = await categoryService.listCategories();
      if (response.success && response.data) {
        setCategories(response.data);
      } else {
        Alert.alert('Error', response.error || 'No se pudieron cargar las categorías');
      }
    } catch (error) {
      Alert.alert('Error', 'Error al cargar las categorías');
    } finally {
      setLoadingCategories(false);
    }
  };

  const toggleCategory = (categoryId: number) => {
    if (selectedCategories.includes(categoryId)) {
      setSelectedCategories(selectedCategories.filter(id => id !== categoryId));
    } else {
      setSelectedCategories([...selectedCategories, categoryId]);
    }
  };

  const validateForm = () => {
    const newErrors: any = {};
    
    if (!name.trim()) {
      newErrors.name = 'El nombre es requerido';
    } else if (name.trim().length < 3) {
      newErrors.name = 'El nombre debe tener al menos 3 caracteres';
    }
    
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
    
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }
    
    if (selectedCategories.length === 0) {
      newErrors.categories = 'Selecciona al menos una especialidad';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      await registerLawyer({
        name,
        email,
        password,
        category_ids: selectedCategories,
      });
      
      // Siempre mostrar mensaje de pending
      router.replace('/login/pending-verification');
    } catch (error: any) {
      if (error.message === 'PENDING_VERIFICATION') {
        router.replace('/login/pending-verification');
      } else {
        Alert.alert(
          'Error',
          error.message || 'No se pudo registrar. Intenta nuevamente.'
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
          <View className="flex-1 px-6 pt-4 pb-6">
            {/* Back Button */}
            <TouchableOpacity
              onPress={() => router.back()}
              className="mb-6"
            >
              <Ionicons name="arrow-back" size={28} color="#1F2937" />
            </TouchableOpacity>

            {/* Header */}
            <View className="mb-8">
              <Text className="mb-2 text-3xl font-bold text-gray-800">
                Registro de Abogado
              </Text>
              <Text className="text-gray-500">
                Crea tu perfil profesional
              </Text>
            </View>

            {/* Form */}
            <View>
              <Input
                label="Nombre Completo"
                placeholder="Dr. Juan Pérez"
                value={name}
                onChangeText={setName}
                icon="person-outline"
                error={errors.name}
              />

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

              <Input
                label="Confirmar Contraseña"
                placeholder="••••••••"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                isPassword
                icon="lock-closed-outline"
                error={errors.confirmPassword}
              />

              {/* Categories Section */}
              <View className="mb-6">
                <Text className="mb-3 ml-1 font-medium text-gray-700">
                  Especialidades *
                </Text>
                
                {loadingCategories ? (
                  <View className="items-center py-8">
                    <ActivityIndicator size="large" color="#2563eb" />
                    <Text className="mt-2 text-gray-500">Cargando especialidades...</Text>
                  </View>
                ) : (
                  <View className="flex-row flex-wrap">
                    {categories.map((category) => {
                      const isSelected = selectedCategories.includes(category.id);
                      const icon = getCategoryIcon(category.name);
                      
                      return (
                        <TouchableOpacity
                          key={category.id}
                          className={`mr-2 mb-2 px-4 py-3 rounded-xl flex-row items-center ${
                            isSelected
                              ? 'bg-blue-600'
                              : 'bg-gray-100 border border-gray-300'
                          }`}
                          onPress={() => toggleCategory(category.id)}
                          activeOpacity={0.7}
                        >
                          <Ionicons
                            name={icon as any}
                            size={18}
                            color={isSelected ? '#ffffff' : '#6B7280'}
                          />
                          <Text
                            className={`ml-2 font-medium ${
                              isSelected ? 'text-white' : 'text-gray-700'
                            }`}
                          >
                            {category.name}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
                
                {errors.categories && (
                  <Text className="mt-1 ml-1 text-sm text-red-500">
                    {errors.categories}
                  </Text>
                )}
              </View>

              <Button
                title="Registrarse"
                onPress={handleRegister}
                loading={loading}
                disabled={loadingCategories}
              />

              <TouchableOpacity
                className="items-center mt-6"
                onPress={() => router.push('/login/login')}
              >
                <Text className="text-gray-600">
                  ¿Ya tienes cuenta?{' '}
                  <Text className="font-semibold text-blue-600">
                    Inicia Sesión
                  </Text>
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}