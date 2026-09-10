import React from 'react';
import { Text, StyleSheet, ViewStyle, TextStyle, ActivityIndicator } from 'react-native';
import { colors, typography, borderRadius, spacing } from '../../theme/theme';
import { BouncyPressable } from '../../animations/BouncyPressable';

export type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'outline' | 'ghost';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  style,
  textStyle,
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'secondary':
        return { bg: colors.secondary, text: '#FFFFFF', border: 'transparent' };
      case 'success':
        return { bg: colors.success, text: '#FFFFFF', border: 'transparent' };
      case 'danger':
        return { bg: colors.danger, text: '#FFFFFF', border: 'transparent' };
      case 'outline':
        return { bg: 'transparent', text: colors.primary, border: colors.primary };
      case 'ghost':
        return { bg: 'transparent', text: '#64748B', border: 'transparent' };
      case 'primary':
      default:
        return { bg: colors.primary, text: '#FFFFFF', border: 'transparent' };
    }
  };

  const v = getVariantStyles();

  const getPadding = () => {
    switch (size) {
      case 'sm':
        return { pv: 6, ph: 12, fontSize: 13 };
      case 'lg':
        return { pv: 14, ph: 24, fontSize: 16 };
      case 'md':
      default:
        return { pv: 10, ph: 18, fontSize: 14 };
    }
  };

  const p = getPadding();

  return (
    <BouncyPressable
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        {
          backgroundColor: disabled ? '#CBD5E1' : v.bg,
          borderColor: disabled ? '#CBD5E1' : v.border,
          paddingVertical: p.pv,
          paddingHorizontal: p.ph,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={v.text} />
      ) : (
        <Text
          style={[
            styles.text,
            {
              color: disabled ? '#94A3B8' : v.text,
              fontSize: p.fontSize,
            },
            textStyle,
          ]}
        >
          {icon ? `${icon} ` : ''}{title}
        </Text>
      )}
    </BouncyPressable>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: borderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  text: {
    fontWeight: typography.weights.semibold,
    textAlign: 'center',
  },
});
