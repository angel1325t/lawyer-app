import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { VerificationCodeInput } from '../../components/VerificationCodeInput';
import { useAuth } from '../../context/AuthContext';
import { profileService } from '../../services/profileService';
import { DS } from '../../constants/designSystem';

const emailRegex = /\S+@\S+\.\S+/;

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const normalizeImageUri = (image?: string | null): string | null => {
  if (!image) return null;
  if (image.startsWith('data:')) return image;
  return `data:image/jpeg;base64,${image}`;
};

const extractBase64Image = (image?: string | null): string | null => {
  if (!image) return null;
  if (image.startsWith('data:') && image.includes(',')) {
    return image.split(',', 2)[1] || null;
  }
  return image;
};

export default function EditProfileScreen() {
  const router = useRouter();
  const { refreshUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [requestingCode, setRequestingCode] = useState(false);
  const [verifyingCode, setVerifyingCode] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [initialEmail, setInitialEmail] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const [pendingEmailVerification, setPendingEmailVerification] = useState<
    string | null
  >(null);
  const [verificationCode, setVerificationCode] = useState('');

  const imageUri = useMemo(() => normalizeImageUri(profileImage), [profileImage]);

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      const response = await profileService.getLawyerProfile();
      if (!response.success || !response.profile) {
        Alert.alert('Error', response.error || 'No se pudo cargar el perfil');
        setLoading(false);
        return;
      }

      const profileEmail = normalizeEmail(response.profile.email || '');
      setName(response.profile.name || '');
      setEmail(profileEmail);
      setInitialEmail(profileEmail);
      setProfileImage(response.profile.profile_image || null);
      setLoading(false);
    };

    loadProfile();
  }, []);

  const onEmailChange = (value: string) => {
    setEmail(value);
    const normalized = normalizeEmail(value);
    if (pendingEmailVerification && normalized !== pendingEmailVerification) {
      setPendingEmailVerification(null);
      setVerificationCode('');
    }
  };

  const handlePickImage = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'image/*',
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (result.canceled) return;

      const asset = result.assets[0];
      if (!asset?.uri) {
        Alert.alert('Error', 'No se pudo leer la imagen seleccionada');
        return;
      }

      const base64 = await FileSystem.readAsStringAsync(asset.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const mimeType = asset.mimeType || 'image/jpeg';
      setProfileImage(`data:${mimeType};base64,${base64}`);
    } catch (error) {
      console.error('Error seleccionando imagen:', error);
      Alert.alert('Error', 'No se pudo seleccionar la imagen');
    }
  };

  const requestEmailCode = async (targetEmail: string): Promise<boolean> => {
    setRequestingCode(true);
    const response = await profileService.requestEmailChangeCode(targetEmail);
    setRequestingCode(false);

    if (!response.success) {
      Alert.alert(
        'Error',
        response.error || 'No se pudo enviar el codigo de verificacion'
      );
      return false;
    }

    setPendingEmailVerification(targetEmail);
    setVerificationCode('');
    Alert.alert(
      'Codigo enviado',
      'Te enviamos un codigo al nuevo correo para confirmar el cambio.'
    );
    return true;
  };

  const handleSaveProfile = async () => {
    const normalizedEmail = normalizeEmail(email);
    if (!name.trim()) {
      Alert.alert('Validacion', 'El nombre es requerido');
      return;
    }
    if (!normalizedEmail || !emailRegex.test(normalizedEmail)) {
      Alert.alert('Validacion', 'Debes ingresar un correo valido');
      return;
    }

    setSavingProfile(true);
    const profileResponse = await profileService.updateLawyerProfile({
      name: name.trim(),
      profile_image: extractBase64Image(profileImage),
    });
    setSavingProfile(false);

    if (!profileResponse.success) {
      Alert.alert('Error', profileResponse.error || 'No se pudo actualizar perfil');
      return;
    }

    if (normalizedEmail === initialEmail) {
      await refreshUser();
      Alert.alert('Perfil actualizado', 'Tus cambios se guardaron correctamente');
      return;
    }

    await requestEmailCode(normalizedEmail);
  };

  const handleVerifyEmailCode = async () => {
    if (!pendingEmailVerification) {
      Alert.alert('Error', 'No hay un cambio de correo pendiente');
      return;
    }

    const cleaned = verificationCode.replace(/[^a-zA-Z0-9]/g, '');
    if (cleaned.length < 6) {
      Alert.alert('Validacion', 'Ingresa el codigo completo');
      return;
    }

    setVerifyingCode(true);
    const response = await profileService.verifyEmailChangeCode(
      pendingEmailVerification,
      cleaned
    );
    setVerifyingCode(false);

    if (!response.success) {
      Alert.alert('Error', response.error || 'Codigo invalido o expirado');
      return;
    }

    setInitialEmail(pendingEmailVerification);
    setEmail(pendingEmailVerification);
    setPendingEmailVerification(null);
    setVerificationCode('');
    await refreshUser();
    Alert.alert('Correo actualizado', 'Tu nuevo correo fue verificado y aplicado.');
  };

  const handleResendCode = async () => {
    if (!pendingEmailVerification) return;
    await requestEmailCode(pendingEmailVerification);
  };

  if (loading) {
    return (
      <SafeAreaView className="items-center justify-center flex-1" style={{ backgroundColor: DS.colors.background }}>
        <ActivityIndicator size="large" color={DS.colors.primary} />
        <Text className="mt-3 text-gray-600">Cargando perfil...</Text>
      </SafeAreaView>
    );
  }

  const emailChanged = normalizeEmail(email) !== initialEmail;

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: DS.colors.background }}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row items-center py-4">
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <Ionicons name="arrow-back" size={28} color="#111827" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-gray-900">Editar Perfil</Text>
        </View>

        <View className="items-center p-5 mb-6 bg-white shadow-sm rounded-2xl">
          <View className="items-center justify-center w-28 h-28 overflow-hidden bg-blue-100 rounded-full">
            {imageUri ? (
              <Image
                source={{ uri: imageUri }}
                className="w-full h-full"
                resizeMode="cover"
              />
            ) : (
              <Ionicons name="person" size={50} color={DS.colors.primary} />
            )}
          </View>

          <View className="flex-row mt-4">
            <TouchableOpacity
              className="px-4 py-2 mr-2 rounded-lg"
              style={{ backgroundColor: DS.colors.primary }}
              onPress={handlePickImage}
            >
              <Text className="font-semibold text-white">Cambiar imagen</Text>
            </TouchableOpacity>

            {profileImage ? (
              <TouchableOpacity
                className="px-4 py-2 bg-gray-200 rounded-lg"
                onPress={() => setProfileImage(null)}
              >
                <Text className="font-semibold text-gray-700">Quitar</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        <View className="p-5 mb-6 bg-white shadow-sm rounded-2xl">
          <Text className="mb-4 text-lg font-bold text-gray-900">
            Informacion de Perfil
          </Text>

          <Input
            label="Nombre"
            value={name}
            onChangeText={setName}
            placeholder="Tu nombre"
            icon="person-outline"
          />

          <Input
            label="Correo"
            value={email}
            onChangeText={onEmailChange}
            placeholder="tu@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            icon="mail-outline"
          />

          {emailChanged ? (
            <Text className="mb-4 text-sm text-amber-700">
              Al cambiar el correo, te enviaremos un codigo para verificarlo.
            </Text>
          ) : null}

          <Button
            title={requestingCode ? 'Enviando codigo...' : 'Guardar cambios'}
            onPress={handleSaveProfile}
            loading={savingProfile || requestingCode}
          />
        </View>

        {pendingEmailVerification ? (
          <View className="p-5 bg-white shadow-sm rounded-2xl">
            <VerificationCodeInput
              value={verificationCode}
              onChangeCode={setVerificationCode}
              label="Codigo de verificacion"
              hint={`Codigo enviado a ${pendingEmailVerification}`}
            />

            <View className="mt-4">
              <Button
                title="Verificar codigo"
                onPress={handleVerifyEmailCode}
                loading={verifyingCode}
              />
            </View>

            <TouchableOpacity
              className="items-center mt-4"
              onPress={handleResendCode}
              disabled={requestingCode}
            >
              <Text className="font-medium" style={{ color: DS.colors.primary }}>
                Reenviar codigo
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

