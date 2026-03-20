import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { DS } from '../constants/designSystem';

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
      style={[styles.button, isDisabled && styles.buttonDisabled]}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text style={styles.label}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    minHeight: 48,
    borderRadius: DS.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: DS.colors.primary,
  },
  buttonDisabled: {
    opacity: 0.55,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    color: DS.colors.surface,
  },
});
