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
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../../../../../components/HeaderComponent/Header';
import { useApp } from '../../../../../../context/AppContext';
import apiService from '../../../../../../services/apiService';

const NotificationSettings = ({ onBack }) => {
  const { currentUser } = useApp();
  const [dailyTarget, setDailyTarget] = useState(true);
  const [overdueAlert, setOverdueAlert] = useState(true);
  const [smsReceipts, setSmsReceipts] = useState(true);
  const [whatsappAlerts, setWhatsappAlerts] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

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

  // Load preferences from backend on mount
  useEffect(() => {
    const loadPreferences = async () => {
      if (!currentUser?.id) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const res = await apiService.getNotificationPreferences(currentUser.id);
        const data = res?.data || res;
        if (data) {
          if (data.dailyTarget !== undefined) setDailyTarget(Boolean(data.dailyTarget));
          else if (data.daily_target !== undefined) setDailyTarget(Boolean(data.daily_target));

          if (data.overdueAlert !== undefined) setOverdueAlert(Boolean(data.overdueAlert));
          else if (data.overdue_alert !== undefined) setOverdueAlert(Boolean(data.overdue_alert));

          if (data.smsReceipts !== undefined) setSmsReceipts(Boolean(data.smsReceipts));
          else if (data.sms_receipts !== undefined) setSmsReceipts(Boolean(data.sms_receipts));

          if (data.whatsappAlerts !== undefined) setWhatsappAlerts(Boolean(data.whatsappAlerts));
          else if (data.whatsapp_alerts !== undefined) setWhatsappAlerts(Boolean(data.whatsapp_alerts));
        }
      } catch (err) {
        console.warn('Error loading preferences:', err.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadPreferences();
  }, [currentUser?.id]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await apiService.saveNotificationPreferences(currentUser?.id, {
        dailyTarget,
        overdueAlert,
        smsReceipts,
        whatsappAlerts,
      });
      Alert.alert('Preferences Saved', 'Your notification preferences have been updated successfully.');
      handleBack();
    } catch (error) {
      Alert.alert('Save Failed', error.message || 'Could not save notification preferences. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const notificationItems = [
    {
      icon: 'weather-sunset-up',
      iconColor: '#F59E0B',
      title: 'Morning Collection Targets',
      subtitle: 'Daily 8:00 AM route briefing alert',
      value: dailyTarget,
      onValueChange: setDailyTarget,
    },
    {
      icon: 'alert-circle-outline',
      iconColor: '#EF4444',
      title: 'Overdue Installment Warnings',
      subtitle: 'Instant alert when an EMI exceeds grace period',
      value: overdueAlert,
      onValueChange: setOverdueAlert,
    },
    {
      icon: 'message-text-outline',
      iconColor: '#3B82F6',
      title: 'Borrower SMS Receipts',
      subtitle: 'Send instant SMS receipt on collection',
      value: smsReceipts,
      onValueChange: setSmsReceipts,
    },
    {
      icon: 'whatsapp',
      iconColor: '#25D366',
      title: 'WhatsApp Alerts & Ledger',
      subtitle: 'Send digital statements on payment confirmation',
      value: whatsappAlerts,
      onValueChange: setWhatsappAlerts,
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <Header
        title="Notification Preferences"
        onBack={handleBack}
        showBackButton={true}
      />

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7C3AED" />
          <Text style={styles.loadingText}>Loading preferences...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Icon Header */}
          <View style={styles.animationContainer}>
            <View style={styles.iconCircle}>
              <MaterialCommunityIcons name="bell-ring-outline" size={48} color="#D97706" />
            </View>
          </View>

          <Text style={styles.subtitle}>
            Manage push alerts, collection reminders, and SMS notifications.
          </Text>

          {/* Notification Toggle Cards */}
          <View style={styles.cardContainer}>
            {notificationItems.map((item, index) => (
              <View key={index} style={styles.settingCard}>
                <View style={styles.settingCardLeft}>
                  <View style={[styles.settingIconBox, { backgroundColor: item.iconColor + '15' }]}>
                    <MaterialCommunityIcons name={item.icon} size={22} color={item.iconColor} />
                  </View>
                  <View style={styles.settingTextBox}>
                    <Text style={styles.settingTitle}>{item.title}</Text>
                    <Text style={styles.settingSub}>{item.subtitle}</Text>
                  </View>
                </View>
                <Switch
                  value={item.value}
                  onValueChange={item.onValueChange}
                  trackColor={{ false: '#E5E7EB', true: '#7C3AED' }}
                  thumbColor={item.value ? '#FFFFFF' : '#9CA3AF'}
                />
              </View>
            ))}
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={[styles.saveButton, isSaving && { opacity: 0.7 }]}
            onPress={handleSave}
            disabled={isSaving}
            activeOpacity={0.8}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 8 }} />
            ) : (
              <MaterialCommunityIcons name="content-save-check-outline" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
            )}
            <Text style={styles.saveButtonText}>{isSaving ? 'Saving...' : 'Save Preferences'}</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </SafeAreaView>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Medium' : 'Poppins-Medium',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  animationContainer: {
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 6,
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
    marginTop: 8,
    paddingHorizontal: 20,
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Medium' : 'Poppins-Medium',
  },
  cardContainer: {
    gap: 12,
  },
  settingCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  settingCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  settingIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingTextBox: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    fontFamily: Platform.OS === 'android' ? 'Gilroy-SemiBold' : 'Poppins-SemiBold',
  },
  settingSub: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Regular' : 'Poppins-Regular',
  },
  saveButton: {
    flexDirection: 'row',
    backgroundColor: '#7C3AED',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    shadowColor: '#7C3AED',
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

export default NotificationSettings;