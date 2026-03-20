// LAWYER APP - components/OfferDialog.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from './Button';

interface OfferDialogProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (price: number, message: string) => void;
  loading?: boolean;
  caseTitle?: string;
}

export default function OfferDialog({
  visible,
  onClose,
  onSubmit,
  loading = false,
  caseTitle = '',
}: OfferDialogProps) {
  const [price, setPrice] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<{ price?: string; message?: string }>({});

  const handleClose = () => {
    setPrice('');
    setMessage('');
    setErrors({});
    onClose();
  };

  const validate = () => {
    const newErrors: { price?: string; message?: string } = {};
    
    if (!price.trim()) {
      newErrors.price = 'El precio es requerido';
    } else if (isNaN(Number(price)) || Number(price) <= 0) {
      newErrors.price = 'Ingresa un precio válido';
    }
    
    if (!message.trim()) {
      newErrors.message = 'El mensaje es requerido';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      onSubmit(Number(price), message);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <View className="items-center justify-center flex-1 px-6 bg-black/50">
          <View className="w-full max-w-md bg-white rounded-3xl">
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Header */}
              <View className="items-center p-6 border-b border-gray-100">
                <View className="p-4 mb-3 bg-blue-100 rounded-full">
                  <Ionicons name="cash-outline" size={32} color="#2563eb" />
                </View>
                <Text className="mb-1 text-xl font-bold text-gray-800">
                  Crear Oferta
                </Text>
                {caseTitle && (
                  <Text className="text-sm text-center text-gray-500">
                    {caseTitle}
                  </Text>
                )}
              </View>

              {/* Form */}
              <View className="p-6">
                {/* Price Input */}
                <View className="mb-4">
                  <Text className="mb-2 ml-1 text-sm font-medium text-gray-700">
                    Precio (DOP) *
                  </Text>
                  <View
                    className={`flex-row items-center px-4 py-3 bg-gray-50 border rounded-xl ${
                      errors.price ? 'border-red-500' : 'border-gray-200'
                    }`}
                  >
                    <Text className="mr-2 text-lg text-gray-600">$</Text>
                    <TextInput
                      className="flex-1 text-base text-gray-800"
                      placeholder="0.00"
                      placeholderTextColor="#9CA3AF"
                      value={price}
                      onChangeText={setPrice}
                      keyboardType="decimal-pad"
                    />
                  </View>
                  {errors.price && (
                    <Text className="mt-1 ml-1 text-sm text-red-500">
                      {errors.price}
                    </Text>
                  )}
                </View>

                {/* Message Input */}
                <View className="mb-6">
                  <Text className="mb-2 ml-1 text-sm font-medium text-gray-700">
                    Mensaje *
                  </Text>
                  <TextInput
                    className={`px-4 py-3 bg-gray-50 border rounded-xl text-base text-gray-800 ${
                      errors.message ? 'border-red-500' : 'border-gray-200'
                    }`}
                    placeholder="Describe tu propuesta..."
                    placeholderTextColor="#9CA3AF"
                    value={message}
                    onChangeText={setMessage}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                  {errors.message && (
                    <Text className="mt-1 ml-1 text-sm text-red-500">
                      {errors.message}
                    </Text>
                  )}
                </View>

                {/* Buttons */}
                <View className="space-y-3">
                  <Button
                    title="Enviar Oferta"
                    onPress={handleSubmit}
                    loading={loading}
                  />
                  <TouchableOpacity
                    onPress={handleClose}
                    className="items-center py-3"
                    disabled={loading}
                  >
                    <Text className="font-semibold text-gray-600">Cancelar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}