import React, { useMemo, useRef } from 'react';
import { Text, TextInput, View } from 'react-native';

interface VerificationCodeInputProps {
  value: string;
  onChangeCode: (code: string) => void;
  length?: number;
  label?: string;
  hint?: string;
  error?: string;
}

const sanitizeCodeValue = (value: string) =>
  value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();

export const VerificationCodeInput = ({
  value,
  onChangeCode,
  length = 6,
  label = 'Codigo de seguridad',
  hint,
  error,
}: VerificationCodeInputProps) => {
  const refs = useRef<Array<TextInput | null>>([]);
  const normalized = sanitizeCodeValue(value).slice(0, length);

  const chars = useMemo(
    () => Array.from({ length }, (_, idx) => normalized[idx] || ''),
    [length, normalized]
  );

  const updateAt = (index: number, rawChar: string) => {
    const char = sanitizeCodeValue(rawChar).slice(-1);
    const next = [...chars];
    next[index] = char;
    onChangeCode(next.join('').trim());

    if (char && index < length - 1) {
      refs.current[index + 1]?.focus();
    }
  };

  const onBackspace = (index: number) => {
    if (chars[index]) {
      return;
    }
    if (index > 0) {
      refs.current[index - 1]?.focus();
      const next = [...chars];
      next[index - 1] = '';
      onChangeCode(next.join('').trim());
    }
  };

  return (
    <View>
      <Text className="mb-2 text-base font-semibold text-gray-800">{label}</Text>

      <View className="flex-row items-center">
        {chars.map((char, idx) => {
          const showDash = length === 6 && idx === 3;
          return (
            <React.Fragment key={idx}>
              {showDash ? (
                <Text className="mx-2 text-2xl font-bold text-gray-400">-</Text>
              ) : null}
              <TextInput
                ref={(ref) => {
                  refs.current[idx] = ref;
                }}
                value={char}
                onChangeText={(text) => updateAt(idx, text)}
                onKeyPress={({ nativeEvent }) => {
                  if (nativeEvent.key === 'Backspace') {
                    onBackspace(idx);
                  }
                }}
                maxLength={1}
                autoCapitalize="characters"
                autoCorrect={false}
                keyboardType="default"
                textAlign="center"
                className={`w-12 h-14 text-2xl font-bold text-gray-800 border rounded-2xl ${
                  error ? 'border-red-500' : 'border-indigo-400'
                }`}
              />
            </React.Fragment>
          );
        })}
      </View>

      {hint ? <Text className="mt-2 text-sm text-gray-500">{hint}</Text> : null}
      {error ? <Text className="mt-2 text-sm text-red-600">{error}</Text> : null}
    </View>
  );
};

