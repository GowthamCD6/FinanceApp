import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Platform,
  BackHandler,
  Alert,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import LottieView from 'lottie-react-native';
import Header from '../../../../../../components/HeaderComponent/Header';

const supportAnimation = require('../../../../../../animation/Customer_care.json');

const HelpSupport = ({ onBack }) => {
  const [expandedFaq, setExpandedFaq] = useState(null);

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

  const faqs = [
    {
      q: 'How do I disburse a new micro-loan?',
      a: 'Go to Borrowers list, select a verified customer, tap Disburse Loan, enter the principal, daily tenure, and confirm OTP.',
    },
    {
      q: 'How does daily offline settlement work?',
      a: 'Tapping Day-End Settlement tallies all collected cash against open receipts and produces a balanced ledger closure.',
    },
    {
      q: 'What if a borrower pays via UPI instead of cash?',
      a: 'Select UPI as payment method during payment collection and input the 12-digit UPI reference number.',
    },
    {
      q: 'Can I export collection data?',
      a: 'Yes! Go to Data Export under Profile settings to download CSV, Excel, or PDF reports of all your transactions.',
    },
  ];

  const contactActions = [
    {
      icon: 'phone-in-talk',
      color: '#10B981',
      bgColor: '#D1FAE5',
      label: 'Call Hotline',
      onPress: () => Alert.alert('Call Support', 'Direct helpline: +91 44 2840 5000 (Mon-Sat 9AM-7PM)'),
    },
    {
      icon: 'whatsapp',
      color: '#25D366',
      bgColor: '#D1FAE5',
      label: 'WhatsApp',
      onPress: () => Alert.alert('WhatsApp Help', 'Opening official WhatsApp support channel.'),
    },
    {
      icon: 'email-outline',
      color: '#3B82F6',
      bgColor: '#DBEAFE',
      label: 'Email Us',
      onPress: () => Alert.alert('Email Support', 'Send us a mail at support@apexfinance.in'),
    },
  ];

  return (
    <View style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <Header
        title="Help & Support"
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
            source={supportAnimation}
            autoPlay
            loop
            style={{ width: 160, height: 160 }}
          />
        </View>

        <Text style={styles.subtitle}>
          Frequently asked questions and direct support contacts.
        </Text>

        {/* Quick Contact Actions */}
        <View style={styles.contactRow}>
          {contactActions.map((action, index) => (
            <TouchableOpacity
              key={index}
              style={styles.contactCard}
              onPress={action.onPress}
              activeOpacity={0.7}
            >
              <View style={[styles.contactIconCircle, { backgroundColor: action.bgColor }]}>
                <MaterialCommunityIcons name={action.icon} size={24} color={action.color} />
              </View>
              <Text style={styles.contactLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* FAQ Section */}
        <Text style={styles.sectionHeading}>Frequently Asked Questions</Text>

        <View style={styles.faqContainer}>
          {faqs.map((faq, idx) => {
            const isOpen = expandedFaq === idx;
            return (
              <TouchableOpacity
                key={idx}
                style={[styles.faqCard, isOpen && styles.faqCardActive]}
                onPress={() => setExpandedFaq(isOpen ? null : idx)}
                activeOpacity={0.7}
              >
                <View style={styles.faqHeader}>
                  <Text style={styles.faqQuestion}>{faq.q}</Text>
                  <View style={[styles.faqChevronBox, isOpen && styles.faqChevronBoxActive]}>
                    <MaterialCommunityIcons
                      name={isOpen ? 'chevron-up' : 'chevron-down'}
                      size={18}
                      color={isOpen ? '#6B46C1' : '#6B7280'}
                    />
                  </View>
                </View>
                {isOpen && (
                  <View style={styles.faqAnswerBox}>
                    <Text style={styles.faqAnswer}>{faq.a}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
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
    marginTop: 8,
    marginBottom: 0,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Medium' : 'Poppins-Medium',
  },
  contactRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 28,
  },
  contactCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  contactIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  contactLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
    fontFamily: Platform.OS === 'android' ? 'Gilroy-SemiBold' : 'Poppins-SemiBold',
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 14,
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Bold' : 'Poppins-Bold',
  },
  faqContainer: {
    gap: 10,
  },
  faqCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  faqCardActive: {
    borderColor: '#DDD6FE',
    backgroundColor: '#FEFBFF',
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestion: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
    marginRight: 8,
    fontFamily: Platform.OS === 'android' ? 'Gilroy-SemiBold' : 'Poppins-SemiBold',
  },
  faqChevronBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  faqChevronBoxActive: {
    backgroundColor: '#EDE9FE',
  },
  faqAnswerBox: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    marginTop: 12,
    paddingTop: 10,
  },
  faqAnswer: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 20,
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Regular' : 'Poppins-Regular',
  },
});

export default HelpSupport;
