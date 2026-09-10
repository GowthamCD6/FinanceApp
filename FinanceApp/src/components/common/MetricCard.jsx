import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, formatINR } from '../../utils/helpers';
import { BouncyPressable } from '../../animations/BouncyPressable';
import Icon from './Icon';

export const MetricCard = ({
  title,
  amount,
  value,
  subtitle,
  trend,
  change,
  trendType = 'neutral',
  isPositive,
  accentColor,
  color,
  icon,
  iconName,
  onPress,
  style,
}) => {
  const finalColor = color || accentColor || '#2563EB';
  const displayValue = value !== undefined ? value : (amount !== undefined ? formatINR(amount) : '₹0');
  const displayTrend = change || trend;
  const finalTrendType = isPositive !== undefined ? (isPositive ? 'positive' : 'negative') : trendType;

  const CardContent = (
    <View style={[styles.card, { borderLeftColor: finalColor }, style]}>
      <View style={styles.topRow}>
        <Text style={styles.title}>{title}</Text>
        {iconName ? (
          <Icon name={iconName} size={16} color={finalColor} />
        ) : icon ? (
          <Text style={styles.icon}>{icon}</Text>
        ) : null}
      </View>

      <Text style={[styles.amount, { color: '#0F172A' }]}>
        {displayValue}
      </Text>

      <View style={styles.footerRow}>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        {displayTrend && (
          <Text
            style={[
              styles.trend,
              {
                color:
                  finalTrendType === 'positive'
                    ? '#059669'
                    : finalTrendType === 'negative'
                    ? '#DC2626'
                    : '#64748B',
              },
            ]}
          >
            {displayTrend}
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
    borderRadius: 12,
    padding: 14,
    marginVertical: 4,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  title: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  icon: {
    fontSize: 16,
  },
  amount: {
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 4,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  subtitle: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
    flex: 1,
  },
  trend: {
    fontSize: 11,
    fontWeight: '700',
  },
});

export default MetricCard;
