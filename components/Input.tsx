import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, TextInputProps, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DS } from '../constants/designSystem';

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
    <View style={styles.container}>
      {label && (
        <Text style={styles.label}>
          {label}
        </Text>
      )}

      <View style={[styles.inputWrap, error && styles.inputWrapError]}>
        {icon && (
          <Ionicons
            name={icon}
            size={18}
            color={DS.colors.textMuted}
            style={styles.icon}
          />
        )}

        <TextInput
          style={styles.input}
          placeholderTextColor="#8b95ac"
          secureTextEntry={secure}
          {...props}
        />

        {isPassword && (
          <TouchableOpacity onPress={() => setSecure(!secure)}>
            <Ionicons
              name={secure ? 'eye-off' : 'eye'}
              size={18}
              color={DS.colors.textMuted}
            />
          </TouchableOpacity>
        )}
      </View>

      {error && (
        <Text style={styles.error}>{error}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 6,
    fontSize: 13,
    fontWeight: '600',
    color: DS.colors.textStrong,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 48,
    borderWidth: 1,
    borderColor: DS.colors.border,
    borderRadius: DS.radius.md,
    backgroundColor: DS.colors.surface,
    paddingHorizontal: 14,
  },
  inputWrapError: {
    borderColor: DS.colors.danger,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    color: DS.colors.textStrong,
    fontSize: 15,
    paddingVertical: 12,
  },
  error: {
    marginTop: 4,
    fontSize: 12,
    color: DS.colors.danger,
  },
});
