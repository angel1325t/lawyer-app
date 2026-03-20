import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
}

export const Button = ({
  title,
  onPress,
  loading = false,
  disabled = false,
}: ButtonProps) => {
  const isDisabled = loading || disabled;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
      className={`py-4 rounded-lg items-center ${
        isDisabled ? 'bg-gray-400' : 'bg-gray-800'
      }`}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text className="text-base font-semibold text-white">
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};
