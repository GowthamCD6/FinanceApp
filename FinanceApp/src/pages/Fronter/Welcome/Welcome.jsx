import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import styles from './Welcomesty';

export const Welcome = ({ onGetStarted }) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Welcome</Text>
        <Text style={styles.mainText}>Empower Your Financial Growth</Text>
        <Text style={styles.subText}>
          Access smart chit funds, micro-loans, and instant repayment tracking all in one secure platform.
        </Text>
      </View>
      <TouchableOpacity
        style={styles.button}
        onPress={onGetStarted}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Welcome;
