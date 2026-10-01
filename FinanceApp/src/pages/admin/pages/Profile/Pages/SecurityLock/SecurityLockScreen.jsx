import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  StatusBar,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import BiometricService from '../../../../../../services/BiometricService';

const { width, height } = Dimensions.get('window');

const SecurityLockScreen = ({ onAuthenticationSuccess }) => {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [biometricInfo, setBiometricInfo] = useState({
    available: false,
    hasBiometrics: false,
    isDeviceSecure: false,
    biometryType: null,
  });
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    let isMounted = true;

    const checkAvail = async () => {
      try {
        const info = await BiometricService.checkBiometricAvailability();
        if (isMounted) {
          setBiometricInfo(info);
        }
      } catch (error) {
        console.error('Error checking biometric availability:', error);
      }
    };

    checkAvail();

    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Auto-prompt after component mounts
    const timer = setTimeout(() => {
      if (isMounted) {
        handleAuthenticate();
      }
    }, 400);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      clearInterval(timeInterval);
    };
  }, []);

  const handleAuthenticate = async () => {
    if (isAuthenticating) return;
    setIsAuthenticating(true);
    setAuthError(null);

    try {
      const result = await BiometricService.authenticate('Unlock GDK Chit Fund');
      console.log('SecurityLockScreen: Authentication result:', result);

      if (result.success) {
        if (onAuthenticationSuccess) {
          onAuthenticationSuccess();
        }
      } else if (result.isCancel) {
        // User voluntarily cancelled - display a friendly guidance hint instead of a harsh red error
        setAuthError('Authentication cancelled. Tap Verify or icon to unlock.');
      } else {
        setAuthError(result.error || 'Authentication failed. Please try again.');
      }
    } catch (error) {
      console.error('Authentication error:', error);
      setAuthError('An error occurred. Please try again.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handlePinAuth = async () => {
    if (isAuthenticating) return;
    setIsAuthenticating(true);
    setAuthError(null);

    try {
      const result = await BiometricService.authenticateWithDeviceCredentials(
        'Unlock GDK Chit Fund with device credentials'
      );
      console.log('SecurityLockScreen: PIN auth result:', result);

      if (result.success) {
        if (onAuthenticationSuccess) {
          onAuthenticationSuccess();
        }
      } else if (result.isCancel) {
        setAuthError('PIN entry cancelled. Tap to try again.');
      } else {
        setAuthError(result.error || 'Authentication failed. Please try again.');
      }
    } catch (error) {
      console.error('Device authentication error:', error);
      setAuthError('An error occurred. Please try again.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const getBiometricIcon = () => {
    if (biometricInfo.biometryType === 'FaceID') return 'face-recognition';
    if (biometricInfo.hasBiometrics || biometricInfo.available) return 'fingerprint';
    return 'lock-outline';
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" translucent />
      
      {/* Time & Date Header */}
      <View style={styles.timeContainer}>
        <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
        <Text style={styles.dateText}>{formatDate(currentTime)}</Text>
      </View>

      {/* Interactive Center Icon */}
      <View style={styles.content}>
        <TouchableOpacity
          style={styles.biometricTouchArea}
          onPress={handleAuthenticate}
          disabled={isAuthenticating}
          activeOpacity={0.7}
        >
          <View style={styles.biometricRing}>
            <MaterialCommunityIcons
              name={getBiometricIcon()}
              size={110}
              color="#FFFFFF"
              style={styles.biometricIcon}
            />
          </View>
        </TouchableOpacity>

        <Text style={styles.instructionText}>
          {isAuthenticating
            ? 'Scanning...'
            : biometricInfo.hasBiometrics
            ? 'Touch sensor to verify'
            : 'Verify to continue'}
        </Text>

        <Text style={styles.hintText}>
          {isAuthenticating ? 'Please verify identity' : 'Tap icon or button below to unlock'}
        </Text>

        {authError ? (
          <Text style={styles.errorText}>{authError}</Text>
        ) : null}
      </View>

      {/* Action Buttons */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[styles.verifyButton, isAuthenticating && styles.verifyButtonDisabled]}
          onPress={handleAuthenticate}
          disabled={isAuthenticating}
          activeOpacity={0.8}
        >
          {isAuthenticating ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.verifyButtonText}>
              {biometricInfo.hasBiometrics ? 'Verify Biometrics' : 'Verify Identity'}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.alternativeButton}
          onPress={handlePinAuth}
          disabled={isAuthenticating}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name="dialpad"
            size={18}
            color="#A78BFA"
            style={{ marginRight: 8 }}
          />
          <Text style={styles.alternativeText}>Use Device PIN or Pattern</Text>
        </TouchableOpacity>

        {/* Support Info */}
        <View style={styles.supportContainer}>
          <Text style={styles.supportText}>
            For help, contact support at{' '}
            <Text style={styles.supportLink}>+91-8610696889</Text>{' '}
            using your registered number.
          </Text>
          <Text style={styles.supportText}>Or</Text>
          <Text style={styles.supportText}>
            Mail us at{' '}
            <Text style={styles.supportLink}>Gowthamnaveen124@gmail.com</Text>{' '}
            with your registered email.
          </Text>
        </View>
      </View>

      <View style={styles.homeIndicator} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  timeContainer: {
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 60 : 70,
    paddingHorizontal: 24,
    paddingBottom: 15,
  },
  timeText: {
    fontSize: 76,
    fontWeight: '200',
    color: '#FFFFFF',
    letterSpacing: -2,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Roboto-Thin',
    lineHeight: 82,
  },
  dateText: {
    fontSize: 17,
    fontWeight: '400',
    color: '#E2E8F0',
    marginTop: -4,
    letterSpacing: 0.5,
    opacity: 0.85,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  biometricTouchArea: {
    marginBottom: 24,
  },
  biometricRing: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(107, 70, 193, 0.15)',
    borderWidth: 2,
    borderColor: 'rgba(167, 139, 250, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  biometricIcon: {
    opacity: 0.95,
  },
  instructionText: {
    fontSize: 22,
    fontWeight: '500',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 0.4,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Roboto-Medium',
  },
  hintText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 6,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 13,
    fontWeight: '400',
    color: '#F87171',
    textAlign: 'center',
    marginTop: 14,
    paddingHorizontal: 16,
    lineHeight: 18,
  },
  bottomContainer: {
    paddingHorizontal: 32,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
  },
  verifyButton: {
    backgroundColor: '#6B46C1',
    borderRadius: 14,
    paddingVertical: 16,
    marginBottom: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#6B46C1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  verifyButtonDisabled: {
    opacity: 0.6,
  },
  verifyButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.5,
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'Roboto-Medium',
  },
  alternativeButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 20,
  },
  alternativeText: {
    fontSize: 15,
    color: '#A78BFA',
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  supportContainer: {
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  supportText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 17,
    marginBottom: 4,
    fontWeight: '400',
  },
  supportLink: {
    color: '#A78BFA',
    fontWeight: '500',
  },
  homeIndicator: {
    width: 134,
    height: 5,
    backgroundColor: '#FFFFFF',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: Platform.OS === 'ios' ? 8 : 12,
    opacity: 0.25,
  },
});

export default SecurityLockScreen;