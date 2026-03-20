import React, { useState } from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { profileService } from '../../services/profileService';
import { DS } from '../../constants/designSystem';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);

  const handleResetPassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Validacion', 'Completa todos los campos');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Validacion', 'La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Validacion', 'La confirmacion no coincide');
      return;
    }

    setSaving(true);
    const response = await profileService.changeLawyerPassword({
      current_password: currentPassword,
      new_password: newPassword,
    });
    setSaving(false);

    if (!response.success) {
      Alert.alert('Error', response.error || 'No se pudo restablecer la contraseña');
      return;
    }

    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    Alert.alert(
      'Contraseña actualizada',
      response.message || 'Tu contraseña fue actualizada correctamente'
    );
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: DS.colors.background }}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24 }}
      >
        <View className="flex-row items-center py-4">
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <Ionicons name="arrow-back" size={28} color="#111827" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-gray-900">
            Restablecer Contraseña
          </Text>
        </View>

        <View className="p-5 bg-white shadow-sm rounded-2xl">
          <Input
            label="Contraseña actual"
            value={currentPassword}
            onChangeText={setCurrentPassword}
            placeholder="••••••••"
            isPassword
            icon="lock-closed-outline"
          />

          <Input
            label="Nueva contraseña"
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="••••••••"
            isPassword
            icon="key-outline"
          />

          <Input
            label="Confirmar nueva contraseña"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="••••••••"
            isPassword
            icon="checkmark-circle-outline"
          />

          <Button
            title="Actualizar contraseña"
            onPress={handleResetPassword}
            loading={saving}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

