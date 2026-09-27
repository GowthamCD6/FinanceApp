import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import LeftArrowIcon from '../../assets/Icon/left-arrow.svg';

const Header = ({
  title,
  onBack,
  showBackButton = true,
  backIconWidth = 20,
  backIconHeight = 20,
  backIconFill = '#1F2937',
  titleStyle = {},
  headerStyle = {},
  showDivider = true,
  dividerStyle = {},
  rightComponent = null
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
          >
            <LeftArrowIcon
              width={backIconWidth}
              height={backIconHeight}
              fill={backIconFill}
            />
          </TouchableOpacity>
        )}

        <Text style={[styles.headerTitle, titleStyle]} numberOfLines={1}>
          {title}
        </Text>

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
    paddingVertical: 10,
  },
  backButton: {
    padding: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginLeft: 12,
    fontFamily: Platform.OS === 'android' ? 'Roboto-Medium' : 'System',
    flex: 1,
  },
  rightComponent: {
    marginLeft: 12,
  },
  separator: {
    height: 1,
    backgroundColor: '#d7dce4ff', // Darker gray color for better visibility
  },
});

export default Header;