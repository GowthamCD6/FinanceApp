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

const otpAnimation = require('../../../../../../animation/OTP-Verification.json');

const OTPRequests = ({ onBack }) => {
  const [requests, setRequests] = useState([
    { id: '1', name: 'Murugan Textiles', phone: '+91 98401 22345', purpose: 'Collection PIN Verification', time: '2 mins ago', code: '4928' },
    { id: '2', name: 'Lakshmi Traders', phone: '+91 94440 98112', purpose: 'Loan Disbursement Consent', time: '5 mins ago', code: '8103' },
    { id: '3', name: 'Ravi Groceries', phone: '+91 98840 55678', purpose: 'Profile Update', time: '12 mins ago', code: '6619' },
  ]);

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

  const handleAction = (id, type) => {
    setRequests(prev => prev.filter(r => r.id !== id));
    Alert.alert(
      type === 'approve' ? 'OTP Approved' : 'OTP Rejected',
      `Request #${id} marked as ${type}.`
    );
  };

  return (
    <View style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <Header
        title="Pending OTP Requests"
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
            source={otpAnimation}
            autoPlay
            loop
            style={{ width: 150, height: 150 }}
          />
        </View>

        <Text style={styles.subtitle}>
          Manage and approve field verification requests in real-time.
        </Text>

        {/* OTP Requests List */}
        {requests.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconCircle}>
              <MaterialCommunityIcons name="check-circle-outline" size={52} color="#10B981" />
            </View>
            <Text style={styles.emptyTitle}>No Pending OTPs</Text>
            <Text style={styles.emptySubtitle}>All verification requests are cleared.</Text>
          </View>
        ) : (
          <View style={styles.cardContainer}>
            {requests.map((r) => (
              <View key={r.id} style={styles.otpCard}>
                <View style={styles.otpCardHeader}>
                  <View style={styles.otpCardInfo}>
                    <Text style={styles.otpName}>{r.name}</Text>
                    <Text style={styles.otpPhone}>{r.phone} • {r.time}</Text>
                    <View style={styles.purposeBadge}>
                      <MaterialCommunityIcons name="shield-key-outline" size={13} color="#3B82F6" />
                      <Text style={styles.otpPurpose}>{r.purpose}</Text>
                    </View>
                  </View>
                  <View style={styles.otpCodeBadge}>
                    <Text style={styles.otpCodeText}>{r.code}</Text>
                  </View>
                </View>

                <View style={styles.otpActions}>
                  <TouchableOpacity
                    style={[styles.otpBtn, styles.approveBtn]}
                    onPress={() => handleAction(r.id, 'approve')}
                    activeOpacity={0.8}
                  >
                    <MaterialCommunityIcons name="check-bold" size={16} color="#FFFFFF" style={{ marginRight: 4 }} />
                    <Text style={styles.otpBtnText}>Approve OTP</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.otpBtn, styles.rejectBtn]}
                    onPress={() => handleAction(r.id, 'reject')}
                    activeOpacity={0.8}
                  >
                    <MaterialCommunityIcons name="close-thick" size={16} color="#FFFFFF" style={{ marginRight: 4 }} />
                    <Text style={styles.otpBtnText}>Reject</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
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
  emptyState: {
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyIconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#D1FAE5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#374151',
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Bold' : 'Poppins-Bold',
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 4,
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Regular' : 'Poppins-Regular',
  },
  cardContainer: {
    gap: 14,
  },
  otpCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  otpCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  otpCardInfo: {
    flex: 1,
  },
  otpName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Bold' : 'Poppins-Bold',
  },
  otpPhone: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 3,
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Regular' : 'Poppins-Regular',
  },
  purposeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  otpPurpose: {
    fontSize: 12,
    color: '#3B82F6',
    fontWeight: '600',
    marginLeft: 4,
    fontFamily: Platform.OS === 'android' ? 'Gilroy-SemiBold' : 'Poppins-SemiBold',
  },
  otpCodeBadge: {
    backgroundColor: '#E0E7FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  otpCodeText: {
    color: '#4338CA',
    fontWeight: '800',
    fontSize: 16,
    letterSpacing: 2,
    fontFamily: Platform.OS === 'android' ? 'Gilroy-ExtraBold' : 'Poppins-ExtraBold',
  },
  otpActions: {
    flexDirection: 'row',
    marginTop: 14,
    gap: 10,
  },
  otpBtn: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  approveBtn: {
    backgroundColor: '#10B981',
  },
  rejectBtn: {
    backgroundColor: '#EF4444',
  },
  otpBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 13,
    fontFamily: Platform.OS === 'android' ? 'Gilroy-SemiBold' : 'Poppins-SemiBold',
  },
});

export default OTPRequests;
