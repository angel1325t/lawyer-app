import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, TextInputProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface InputProps extends TextInputProps  {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  error?: string;
  isPassword?: boolean;
}

export const Input = ({
  label,
  icon,
  error,
  isPassword,
  ...props
}: InputProps) => {
  const [secure, setSecure] = useState(isPassword);

  return (
    <View className="mb-4">
      {label && (
        <Text className="mb-1 text-sm font-semibold text-gray-800">
          {label}
        </Text>
      )}

      <View
        className={`flex-row items-center px-4 py-3 border rounded-lg ${
          error ? 'border-red-600' : 'border-gray-400'
        }`}
      >
        {icon && (
          <Ionicons
            name={icon}
            size={18}
            color="#374151"
            style={{ marginRight: 8 }}
          />
        )}

        <TextInput
          className="flex-1 text-gray-900"
          placeholderTextColor="#6B7280"
          secureTextEntry={secure}
          {...props}   // 👈 AQUÍ
        />

        {isPassword && (
          <TouchableOpacity onPress={() => setSecure(!secure)}>
            <Ionicons
              name={secure ? 'eye-off' : 'eye'}
              size={18}
              color="#374151"
            />
          </TouchableOpacity>
        )}
      </View>

      {error && (
        <Text className="mt-1 text-xs text-red-600">{error}</Text>
      )}
    </View>
  );
};
