import * as Haptics from 'expo-haptics';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { C, radius } from '../lib/colors';

interface Props {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  variant?: 'accent' | 'dark' | 'ghost';
  fullWidth?: boolean;
}

export function PrimaryButton({ label, onPress, loading, disabled, icon, variant = 'accent', fullWidth = true }: Props) {
  const bg = variant === 'accent' ? C.accent : variant === 'dark' ? C.fg : 'transparent';
  const textColor = variant === 'accent' ? C.accentInk : variant === 'dark' ? C.bg : C.fg2;
  const borderColor = variant === 'ghost' ? C.line : 'transparent';

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.82}
      style={[
        styles.btn,
        { backgroundColor: bg, borderColor, width: fullWidth ? '100%' : undefined },
        (disabled || loading) && styles.disabled,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <View style={styles.inner}>
          {icon && <View style={styles.iconWrap}>{icon}</View>}
          <Text style={[styles.label, { color: textColor }]}>{label}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconWrap: { marginRight: 2 },
  label: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  disabled: { opacity: 0.45 },
});
