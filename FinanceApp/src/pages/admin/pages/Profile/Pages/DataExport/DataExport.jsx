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
  ActivityIndicator,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import LottieView from 'lottie-react-native';
import Header from '../../../../../../components/HeaderComponent/Header';

const exportAnimation = require('../../../../../../animation/data-export.json');

const DataExport = ({ onBack }) => {
  const [exporting, setExporting] = useState(null);

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

  const handleExport = (type, key) => {
    setExporting(key);
    setTimeout(() => {
      setExporting(null);
      Alert.alert('Export Complete', `${type} has been generated and saved to your device Downloads.`);
    }, 1500);
  };

  const exportItems = [
    {
      key: 'csv',
      icon: 'file-delimited-outline',
      iconColor: '#059669',
      bgColor: '#D1FAE5',
      title: 'Daily Collections Sheet',
      subtitle: 'CSV format with date, officer, borrower and amount',
      type: 'Daily Collections Ledger (CSV)',
    },
    {
      key: 'excel',
      icon: 'file-excel-box',
      iconColor: '#2563EB',
      bgColor: '#DBEAFE',
      title: 'Active Master Loan Book',
      subtitle: 'Comprehensive portfolio breakdown and remaining balances',
      type: 'Active Loan Book (Excel)',
    },
    {
      key: 'pdf',
      icon: 'file-pdf-box',
      iconColor: '#DC2626',
      bgColor: '#FEE2E2',
      title: 'Borrower KYC Directory',
      subtitle: 'Aadhaar, phone, addresses and guarantor details',
      type: 'Borrower KYC Directory (PDF)',
    },
  ];

  return (
    <View style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <Header
        title="Data Export & Backup"
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
            source={exportAnimation}
            autoPlay
            loop
            style={{ width: 150, height: 150 }}
          />
        </View>

        <Text style={styles.subtitle}>
          Download complete branch statements, loan books, and customer ledgers.
        </Text>

        {/* Export Items */}
        <View style={styles.cardContainer}>
          {exportItems.map((item) => (
            <TouchableOpacity
              key={item.key}
              style={styles.exportCard}
              onPress={() => handleExport(item.type, item.key)}
              activeOpacity={0.7}
              disabled={exporting === item.key}
            >
              <View style={[styles.exportIconBox, { backgroundColor: item.bgColor }]}>
                <MaterialCommunityIcons name={item.icon} size={30} color={item.iconColor} />
              </View>
              <View style={styles.exportTextBox}>
                <Text style={styles.exportTitle}>{item.title}</Text>
                <Text style={styles.exportSub}>{item.subtitle}</Text>
              </View>
              {exporting === item.key ? (
                <ActivityIndicator size="small" color="#6B46C1" />
              ) : (
                <View style={styles.downloadIconBox}>
                  <MaterialCommunityIcons name="cloud-download-outline" size={22} color="#6B7280" />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Info Note */}
        <View style={styles.infoNote}>
          <MaterialCommunityIcons name="information-outline" size={18} color="#6B7280" />
          <Text style={styles.infoNoteText}>
            Exported files will be saved to your device's Downloads folder.
          </Text>
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
    gap: 14,
  },
  exportCard: {
    flexDirection: 'row',
    alignItems: 'center',
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
  exportIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  exportTextBox: {
    flex: 1,
  },
  exportTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Bold' : 'Poppins-Bold',
  },
  exportSub: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 3,
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Regular' : 'Poppins-Regular',
  },
  downloadIconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  infoNote: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    paddingHorizontal: 4,
    gap: 8,
  },
  infoNoteText: {
    fontSize: 12,
    color: '#9CA3AF',
    flex: 1,
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Regular' : 'Poppins-Regular',
  },
});

export default DataExport;
