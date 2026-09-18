import React from 'react';
import { View, Text, StatusBar } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import styles from './SplashStyle';
import Colors from '../../../theme/colors';

export const Splash = () => {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primaryDeep} />
      <View style={styles.logoContainer}>
        <View style={styles.brandLogoCircle}>
          <MaterialCommunityIcons name="finance" size={42} color={Colors.gold} />
        </View>
        <Text style={styles.brandTitle}>Finance App</Text>
        <View style={styles.taglineRow}>
          <View style={styles.taglineDot} />
          <Text style={styles.taglineText}>Smart Microfinance & Chit Funds</Text>
        </View>
      </View>
    </View>
  );
};

export default Splash;