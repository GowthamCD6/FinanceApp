import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, typography, borderRadius, spacing } from '../../theme/theme';
import { formatINR } from '../../utils/helpers';
import { BouncyPressable } from '../../animations/BouncyPressable';

interface MetricCardProps {
  title: string;
  amount: number;
  subtitle?: string;
  trend?: string;
  trendType?: 'positive' | 'negative' | 'neutral';
  accentColor?: string;
  icon?: string;
  onPress?: () => void;
  style?: ViewStyle;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  amount,
  subtitle,
  trend,
  trendType = 'neutral',
  accentColor = colors.primary,
  icon,
  onPress,
  style,
}) => {
  const CardContent = (
    <View style={[styles.card, { borderLeftColor: accentColor }, style]}>
      <View style={styles.topRow}>
        <Text style={styles.title}>{title}</Text>
        {icon && <Text style={styles.icon}>{icon}</Text>}
      </View>

      <Text style={[styles.amount, { color: accentColor }]}>
        {formatINR(amount)}
      </Text>

      <View style={styles.footerRow}>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        {trend && (
          <Text
            style={[
              styles.trend,
              {
                color:
                  trendType === 'positive'
                    ? colors.success
                    : trendType === 'negative'
                    ? colors.danger
                    : '#64748B',
              },
            ]}
          >
            {trend}
          </Text>
        )}
      </View>
    </View>
  );

  if (onPress) {
    return <BouncyPressable onPress={onPress}>{CardContent}</BouncyPressable>;
  }

  return CardContent;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginVertical: spacing.xs,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: typography.sizes.sm,
    color: '#64748B',
    fontWeight: typography.weights.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  icon: {
    fontSize: 16,
  },
  amount: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.heavy,
    marginVertical: 2,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  subtitle: {
    fontSize: typography.sizes.xs,
    color: '#94A3B8',
  },
  trend: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
  },
});
