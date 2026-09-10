import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../utils/helpers';

export const Badge = ({
  label,
  variant = 'neutral',
  size = 'md',
  style,
}) => {
  const getColors = () => {
    switch (variant) {
      case 'success':
        return { bg: colors.successBg, text: colors.successText, border: '#A7F3D0' };
      case 'warning':
        return { bg: colors.warningBg, text: colors.warningText, border: '#FDE68A' };
      case 'danger':
        return { bg: colors.dangerBg, text: colors.dangerText, border: '#FECACA' };
      case 'info':
        return { bg: colors.infoBg, text: colors.infoText, border: '#BAE6FD' };
      case 'primary':
        return { bg: colors.primaryBg, text: colors.primaryDark, border: '#99F6E4' };
      case 'secondary':
        return { bg: colors.secondaryBg, text: colors.secondaryDark, border: '#BFDBFE' };
      case 'neutral':
      default:
        return { bg: '#F1F5F9', text: '#475569', border: '#E2E8F0' };
    }
  };

  const c = getColors();
  const isSm = size === 'sm';

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: c.bg,
          borderColor: c.border,
          paddingVertical: isSm ? 2 : 4,
          paddingHorizontal: isSm ? 6 : 10,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            color: c.text,
            fontSize: isSm ? 10 : 12,
          },
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 9999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
});

export default Badge;

