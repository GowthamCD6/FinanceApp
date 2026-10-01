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
import { Colors, Fonts } from '../../theme';

const Header = ({
  title,
  onBack,
  showBackButton = true,
  backIconWidth = 20,
  backIconHeight = 20,
  backIconFill = Colors.textPrimary,
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
    backgroundColor: Colors.background,
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
    fontSize: 22,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginLeft: 12,
    fontFamily: Fonts.header,
    flex: 1,
  },
  rightComponent: {
    marginLeft: 12,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.separator, // #d7dce4ff
  },
});

export default Header;