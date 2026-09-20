import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Platform,
  BackHandler,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import LottieView from 'lottie-react-native';
import Header from '../../../../../../components/HeaderComponent/Header';

const lockAnimation = require('../../../../../../animation/Lock_Authentication.1.json');

const PrivacyPolicy = ({ onBack }) => {
  const handleBack = () => {
    if (onBack) {
      onBack();
    }
  };

  useEffect(() => {
    const backAction = () => {
      handleBack();
      return true;
    };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [onBack]);

  const policySections = [
    {
      icon: 'shield-lock-outline',
      iconColor: '#6B46C1',
      heading: '1. Data Security & Storage',
      body: 'All customer financial records, loan ledgers, Aadhaar numbers, and transaction logs are encrypted using 256-bit AES encryption at rest and in transit.',
    },
    {
      icon: 'map-marker-check-outline',
      iconColor: '#3B82F6',
      heading: '2. Location & Telemetry',
      body: 'Field agent GPS telemetry is recorded strictly during working business hours to verify on-site cash collections and prevent fraudulent entries.',
    },
    {
      icon: 'account-check-outline',
      iconColor: '#10B981',
      heading: '3. Customer Rights',
      body: 'Borrowers have full right to request digital statement copies via WhatsApp or SMS anytime upon loan closure without penalty.',
    },
    {
      icon: 'database-lock-outline',
      iconColor: '#F59E0B',
      heading: '4. Data Retention',
      body: 'Customer records are retained for a minimum of 8 years as per RBI microfinance regulatory requirements. Post retention, data is securely purged.',
    },
    {
      icon: 'account-group-outline',
      iconColor: '#EF4444',
      heading: '5. Third-Party Sharing',
      body: 'No personal or financial data is shared with third parties except when mandated by regulatory authorities such as RBI, SEBI, or law enforcement agencies.',
    },
  ];

  return (
    <View style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <Header
        title="Privacy Controls & Policy"
        onBack={handleBack}
        showBackButton={true}
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Lottie Animation */}
        <View style={styles.animationContainer}>
          <LottieView
            source={lockAnimation}
            autoPlay
            loop
            style={{ width: 130, height: 130 }}
          />
        </View>

        <Text style={styles.subtitle}>
          RBI Microfinance & Chit Fund Regulatory Compliance Guidelines.
        </Text>

        {/* Policy Sections */}
        <View style={styles.cardContainer}>
          {policySections.map((section, index) => (
            <View key={index} style={styles.policyCard}>
              <View style={styles.policyHeader}>
                <View style={[styles.policyIconBox, { backgroundColor: section.iconColor + '15' }]}>
                  <MaterialCommunityIcons name={section.icon} size={20} color={section.iconColor} />
                </View>
                <Text style={styles.policyHeading}>{section.heading}</Text>
              </View>
              <Text style={styles.policyBody}>{section.body}</Text>
            </View>
          ))}
        </View>

        {/* Acknowledge Button */}
        <TouchableOpacity style={styles.acknowledgeButton} onPress={handleBack} activeOpacity={0.8}>
          <MaterialCommunityIcons name="check-circle-outline" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text style={styles.acknowledgeButtonText}>I Understand</Text>
        </TouchableOpacity>

        {/* Footer Note */}
        <Text style={styles.footerNote}>
          Last updated: September 2026 • Apex Finance Pvt. Ltd.
        </Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  animationContainer: {
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Medium' : 'Poppins-Medium',
  },
  cardContainer: {
    gap: 12,
  },
  policyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  policyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  policyIconBox: {
    width: 34,
    height: 34,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  policyHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Bold' : 'Poppins-Bold',
  },
  policyBody: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 20,
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Regular' : 'Poppins-Regular',
  },
  acknowledgeButton: {
    flexDirection: 'row',
    backgroundColor: '#6B46C1',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 28,
    shadowColor: '#6B46C1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  acknowledgeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: Platform.OS === 'android' ? 'Gilroy-SemiBold' : 'Poppins-SemiBold',
  },
  footerNote: {
    fontSize: 11,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 20,
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Regular' : 'Poppins-Regular',
  },
});

export default PrivacyPolicy;
