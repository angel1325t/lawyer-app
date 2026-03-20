import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { VerificationCodeInput } from '../../components/VerificationCodeInput';
import { authService } from '../../services/authService';

const emailRegex = /\S+@\S+\.\S+/;

const normalizeEmail = (email: string) => email.trim().toLowerCase();

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [requestSent, setRequestSent] = useState(false);
  const [requestLoading, setRequestLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const validateEmail = () => {
    const normalized = normalizeEmail(email);
    if (!normalized || !emailRegex.test(normalized)) {
      Alert.alert('Validacion', 'Ingresa un correo valido');
      return false;
    }
    return true;
  };

  const handleForgotRequest = async () => {
    if (!validateEmail()) return;

    setRequestLoading(true);
    const response = await authService.forgotPassword(normalizeEmail(email));
    setRequestLoading(false);

    if (!response.success) {
      Alert.alert('Error', response.error || 'No se pudo enviar el codigo');
      return;
    }

    setRequestSent(true);
    Alert.alert(
      'Codigo enviado',
      response.message || 'Revisa tu correo para continuar con el cambio.'
    );
  };

  const handleResetPassword = async () => {
    if (!validateEmail()) return;

    const cleanedCode = verificationCode.replace(/[^a-zA-Z0-9]/g, '');
    if (cleanedCode.length < 6) {
      Alert.alert('Validacion', 'Ingresa el codigo completo');
      return;
    }

    if (!newPassword || !confirmPassword) {
      Alert.alert('Validacion', 'Completa la nueva contraseña y su confirmacion');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Validacion', 'La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Validacion', 'Las contraseñas no coinciden');
      return;
    }

    setResetLoading(true);
    const response = await authService.resetPassword(
      normalizeEmail(email),
      newPassword,
      cleanedCode
    );
    setResetLoading(false);

    if (!response.success) {
      Alert.alert('Error', response.error || 'No se pudo restablecer la contraseña');
      return;
    }

    Alert.alert(
      'Contraseña actualizada',
      response.message || 'Ya puedes iniciar sesión con tu nueva contraseña',
      [
        {
          text: 'Ir a login',
          onPress: () => router.replace('/login/login'),
        },
      ]
    );
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
          <View className="justify-center flex-1 px-6 py-6">
            <TouchableOpacity onPress={() => router.back()} className="mb-8">
              <Ionicons name="arrow-back" size={28} color="#1F2937" />
            </TouchableOpacity>

            <View className="items-center mb-10">
              <View className="p-5 mb-4 bg-blue-100 rounded-full">
                <Ionicons name="key-outline" size={40} color="#2563eb" />
              </View>
              <Text className="mb-2 text-3xl font-bold text-gray-800">
                Recuperar contraseña
              </Text>
              <Text className="text-center text-gray-500">
                Te enviaremos un codigo de seguridad a tu correo
              </Text>
            </View>

            <Input
              label="Email"
              placeholder="tu@email.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              icon="mail-outline"
            />

            {!requestSent ? (
              <Button
                title="Enviar codigo"
                onPress={handleForgotRequest}
                loading={requestLoading}
              />
            ) : (
              <View>
                <View className="mb-4">
                  <VerificationCodeInput
                    value={verificationCode}
                    onChangeCode={setVerificationCode}
                    label="Secure code"
                    hint="Ingresa el codigo enviado al correo."
                  />
                </View>

                <Input
                  label="Nueva contraseña"
                  placeholder="••••••••"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  isPassword
                  icon="lock-closed-outline"
                />

                <Input
                  label="Confirmar contraseña"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  isPassword
                  icon="checkmark-circle-outline"
                />

                <Button
                  title="Restablecer contraseña"
                  onPress={handleResetPassword}
                  loading={resetLoading}
                />

                <TouchableOpacity
                  className="items-center mt-4"
                  onPress={handleForgotRequest}
                  disabled={requestLoading}
                >
                  <Text className="font-medium text-blue-600">Reenviar codigo</Text>
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity
              className="items-center mt-8"
              onPress={() => router.replace('/login/login')}
            >
              <Text className="font-medium text-blue-600">
                Volver a iniciar sesión
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

