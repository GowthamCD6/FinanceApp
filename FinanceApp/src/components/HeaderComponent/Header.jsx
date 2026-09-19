import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import LeftArrowIcon from './LeftArrowIcon';

const Header = ({
  title,
  subtitle,
  onBack,
  showBackButton = true,
  backIconWidth = 22,
  backIconHeight = 22,
  backIconFill = '#111827',
  titleStyle = {},
  headerStyle = {},
  showDivider = true,
  dividerStyle = {},
  rightComponent = null,
}) => {
  return (
    <View style={[styles.container, headerStyle]}>
      {/* Header Content */}
      <View style={styles.header}>
        {showBackButton && (
          <TouchableOpacity
            onPress={onBack}
            style={styles.backButton}
            activeOpacity={0.6}
            hitSlop={{ top: 14, bottom: 14, left: 14, right: 14 }}
          >
            <LeftArrowIcon
              size={backIconWidth || 22}
              color={backIconFill || '#111827'}
            />
          </TouchableOpacity>
        )}

        <View style={[styles.titleContainer, !showBackButton && { marginLeft: 0 }]}>
          <Text
            style={[
              styles.headerTitle,
              titleStyle,
            ]}
            numberOfLines={1}
          >
            {title}
          </Text>
          {subtitle ? (
            <Text style={styles.headerSubtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>

        {/* Right side component (optional) */}
        {rightComponent && (
          <View style={styles.rightComponent}>
            {rightComponent}
          </View>
        )}
      </View>

      {/* Separator/Divider */}
      {showDivider && (
        <View style={[styles.separator, dividerStyle]} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    width: '100%',
    alignSelf: 'stretch',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 12 : 16,
    paddingBottom: 14,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginLeft: -4,
  },
  titleContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Bold' : 'System',
    letterSpacing: -0.2,
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
    marginTop: 1,
  },
  rightComponent: {
    marginLeft: 12,
  },
  separator: {
    height: 1,
    backgroundColor: '#F3F4F6',
  },
});

export default Header;