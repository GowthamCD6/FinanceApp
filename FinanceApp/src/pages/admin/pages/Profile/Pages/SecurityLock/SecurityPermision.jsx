import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
  Platform,
  Alert,
  BackHandler,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import LottieView from 'lottie-react-native';
import BiometricService from '../../../../../../services/BiometricService';
import LockInfo from './Lock-Info-Modal/LockInfo';
import Header from '../../../../../../components/HeaderComponent/Header';
import { useLanguage } from '../../../../../../utils/LanguageContext';

const SecurPermis = ({ onBack }) => {
  const { t, language } = useLanguage ? useLanguage() : { t: (s) => s, language: 'en' };
  const [securityEnabled, setSecurityEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [helpModalVisible, setHelpModalVisible] = useState(false);

  // Load security setting on component mount and subscribe to state changes
  useEffect(() => {
    loadSecuritySetting();

    const unsubscribe = BiometricService.addListener((state) => {
      setSecurityEnabled(state.isSecurityEnabled);
    });

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  // Handle hardware back button to navigate back to profile page
  useEffect(() => {
    const backAction = () => {
      if (helpModalVisible) {
        setHelpModalVisible(false);
        return true;
      }
      if (onBack) {
        onBack();
        return true;
      }
      return false;
    };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [onBack, helpModalVisible]);

  const loadSecuritySetting = async () => {
    try {
      const state = BiometricService.getState();
      setSecurityEnabled(state.isSecurityEnabled);
    } catch (error) {
      console.error('Error loading security setting:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkAuthenticationAvailability = async () => {
    return await BiometricService.checkBiometricAvailability();
  };

  const handleSecurityToggle = async (value) => {
    if (isProcessing) return;
    setIsProcessing(true);

    try {
      if (value) {
        // 1. Check if device has biometrics or PIN/password configured
        const authCheck = await checkAuthenticationAvailability();
        if (!authCheck.available && !authCheck.isDeviceSecure) {
          Alert.alert(
            'Authentication Not Available',
            'Please ensure device security (PIN, pattern, password, or fingerprint) is configured in your device Settings.',
            [
              { text: 'OK', style: 'default' },
              {
                text: 'Help',
                style: 'default',
                onPress: () => {
                  Alert.alert(
                    'Setup Instructions',
                    'Go to your device Settings > Security > Screen Lock to set up PIN, password, pattern, fingerprint, or face unlock.'
                  );
                },
              },
            ]
          );
          return;
        }

        // 2. Turning ON: Smooth transition to lock screen, asks biometric, and opens app on success
        setSecurityEnabled(true);
        const result = await BiometricService.enableSecurity({ lockImmediately: true });
        if (!result.success) {
          setSecurityEnabled(false);
          Alert.alert('Failed to Enable Security', result.error || 'Unable to enable app security. Please try again.');
        }
      } else {
        // 3. Turning OFF: Prompt biometric in this page itself, and turn off on success
        const auth = await BiometricService.authenticate(
          'Verify identity to disable app security lock',
          { force: true }
        );

        if (auth.success) {
          setSecurityEnabled(false);
          await BiometricService.disableSecurity();
        } else {
          // If cancelled or failed, preserve the enabled state
          setSecurityEnabled(true);
          if (!auth.isCancel) {
            Alert.alert('Authentication Failed', auth.error || 'Biometric verification failed.');
          }
        }
      }
    } catch (error) {
      console.error('Error toggling security:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="Security Settings"
        onBack={onBack}
        showBackButton={true}
      />

      {/* Form Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.formContainer}>
          {/* Lottie Animation */}
          <View style={styles.animationContainer}>
            <LottieView
              source={require('../../../../../../animation/Lock_Authentication.1.json')}
              autoPlay={true}
              loop={true}
              speed={0.5}
              resizeMode="contain"
              style={styles.lottieAnimation}
            />
          </View>

          {/* Security Enable Card */}
          <View style={styles.inputContainer}>
            <View style={styles.labelContainer}>
              <MaterialCommunityIcons name="shield-check" size={16} color="#6B7280" />
              <Text style={[styles.inputLabel, language === 'ta' && { fontSize: 14 }]}>
                {t ? t('Biometric Login') : 'Biometric Login'}
              </Text>
            </View>
            <View style={styles.securityCard}>
              <View style={styles.securityContent}>
                <View style={styles.securityInfo}>
                  <MaterialCommunityIcons
                    name={securityEnabled ? 'shield-check' : 'shield-off'}
                    size={24}
                    color={securityEnabled ? '#22C55E' : '#EF4444'}
                  />
                  <View style={styles.securityText}>
                    <Text style={[styles.securityTitle, language === 'ta' && { fontSize: 14 }]}>
                      {securityEnabled
                        ? t ? t('Security Enabled') : 'Security Enabled'
                        : t ? t('Security Disabled') : 'Security Disabled'}
                    </Text>
                    <Text style={styles.securitySubtitle}>
                      {securityEnabled
                        ? 'App locks when you switch apps or device locks'
                        : 'App can be opened without authentication'}
                    </Text>
                  </View>
                </View>
                <Switch
                  value={securityEnabled}
                  onValueChange={handleSecurityToggle}
                  trackColor={{ false: '#E5E7EB', true: '#22C55E' }}
                  thumbColor={'#FFFFFF'}
                  disabled={isLoading || isProcessing}
                />
              </View>
            </View>
          </View>

          {/* Help Button */}
          <TouchableOpacity
            style={styles.helpButton}
            onPress={() => setHelpModalVisible(true)}
          >
            <MaterialCommunityIcons name="help-circle-outline" size={20} color="#3B82F6" />
            <Text style={[styles.helpButtonText, language === 'ta' && { fontSize: 12 }]}>
              {t ? t('How this function works') : 'How this function works'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Help Modal - LockInfo Component */}
      <LockInfo
        visible={helpModalVisible}
        onClose={() => setHelpModalVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  formContainer: {
    paddingTop: 24,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
  },
  animationContainer: {
    alignItems: 'center',
    marginBottom: 32,
    paddingVertical: 16,
    backgroundColor: 'transparent',
  },
  lottieAnimation: {
    width: 380,
    height: 380,
    marginTop: -20,
    marginBottom: -70,
  },
  inputContainer: {
    marginBottom: 28,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#212121',
  },
  securityCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    borderWidth: 0,
    elevation: 0,
    shadowColor: 'transparent',
  },
  securityContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  securityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  securityText: {
    marginLeft: 12,
    flex: 1,
  },
  securityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 4,
  },
  securitySubtitle: {
    fontSize: 14,
    color: '#666666',
  },
  helpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 20,
    borderRadius: 10,
    backgroundColor: '#E3F2FD',
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  helpButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3B82F6',
    marginLeft: 12,
  },
});

export default SecurPermis;