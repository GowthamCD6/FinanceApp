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
  TextInput,
  Alert,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import LottieView from 'lottie-react-native';
import Header from '../../../../../../components/HeaderComponent/Header';

const loanAnimation = require('../../../../../../animation/MoneyLending.json');

const AuctionSettings = ({ onBack }) => {
  const [interestRate, setInterestRate] = useState('2.0% Monthly');
  const [dailyTenure, setDailyTenure] = useState('100 Days');
  const [penaltyFee, setPenaltyFee] = useState('₹50 / Day');

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

  const handleSave = () => {
    Alert.alert('Rules Updated', 'Loan disbursement and auction configuration parameters saved.');
    handleBack();
  };

  return (
    <View style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <Header
        title="Auction & Loan Rules"
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
            source={loanAnimation}
            autoPlay
            loop
            style={{ width: 150, height: 150 }}
          />
        </View>

        <Text style={styles.subtitle}>
          Configure standard micro-lending tenure, interest cap, and penalties.
        </Text>

        {/* Input Fields */}
        <View style={styles.inputCard}>
          <View style={styles.inputGroup}>
            <View style={styles.inputLabelRow}>
              <MaterialCommunityIcons name="percent-outline" size={18} color="#6B46C1" />
              <Text style={styles.inputLabel}>Default Standard Interest Rate</Text>
            </View>
            <TextInput
              style={styles.textInput}
              value={interestRate}
              onChangeText={setInterestRate}
              placeholder="e.g. 2.0% Monthly"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.inputGroup}>
            <View style={styles.inputLabelRow}>
              <MaterialCommunityIcons name="calendar-clock-outline" size={18} color="#3B82F6" />
              <Text style={styles.inputLabel}>Standard Daily Loan Cycle</Text>
            </View>
            <TextInput
              style={styles.textInput}
              value={dailyTenure}
              onChangeText={setDailyTenure}
              placeholder="e.g. 100 Days"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.inputGroup}>
            <View style={styles.inputLabelRow}>
              <MaterialCommunityIcons name="currency-inr" size={18} color="#EF4444" />
              <Text style={styles.inputLabel}>Overdue Late Penalty Slab</Text>
            </View>
            <TextInput
              style={styles.textInput}
              value={penaltyFee}
              onChangeText={setPenaltyFee}
              placeholder="e.g. ₹50 / Day"
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSave} activeOpacity={0.8}>
          <MaterialCommunityIcons name="content-save-check-outline" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text style={styles.saveButtonText}>Save Rules</Text>
        </TouchableOpacity>
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
  inputCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  inputGroup: {
    paddingVertical: 4,
  },
  inputLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    fontFamily: Platform.OS === 'android' ? 'Gilroy-SemiBold' : 'Poppins-SemiBold',
  },
  textInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#111827',
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Medium' : 'Poppins-Medium',
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 14,
  },
  saveButton: {
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
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: Platform.OS === 'android' ? 'Gilroy-SemiBold' : 'Poppins-SemiBold',
  },
});

export default AuctionSettings;
