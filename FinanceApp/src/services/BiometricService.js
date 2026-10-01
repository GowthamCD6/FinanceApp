import { AppState, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  isSensorAvailable,
  authenticateWithOptions,
  simplePrompt,
  BiometricStrength,
} from '@sbaiahmed1/react-native-biometrics';
import apiService from './apiService';

class BiometricService {
  constructor() {
    this.isLocked = false;
    this.isSecurityEnabled = false;
    this.isAuthenticated = false; // Track if user has authenticated in current session
    this.lastActiveTime = null; // Track when user was last active
    this.backgroundTime = null; // Track timestamp when app went to background
    this.listeners = [];
    this.appStateSubscription = null;
    this.isInitialized = false;
    this.isAuthenticatingPrompt = false; // Prevents re-entrancy and background false-positives during biometric dialog
    
    console.log('BiometricService: Initialized singleton');
  }

  async init() {
    if (this.isInitialized) {
      this.notifyListeners();
      return;
    }

    try {
      console.log('BiometricService: Starting initialization...');

      // 1. Check local storage first for quick startup
      const localSetting = await AsyncStorage.getItem('securityEnabled');
      let isEnabled = localSetting === 'true';

      // 2. Try to sync with backend user preferences with 1200ms timeout
      try {
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Preferences timeout')), 1200)
        );
        const prefRes = await Promise.race([
          apiService.getUserPreferences(),
          timeoutPromise,
        ]);
        if (prefRes && prefRes.success && prefRes.data && prefRes.data.securityEnabled !== undefined) {
          isEnabled = Boolean(prefRes.data.securityEnabled);
          await AsyncStorage.setItem('securityEnabled', isEnabled ? 'true' : 'false');
        }
      } catch (backendErr) {
        console.log('BiometricService: Using local security setting:', isEnabled);
      }

      this.isSecurityEnabled = isEnabled;
      this.isAuthenticated = false;

      // 3. Determine if app should be locked on startup
      if (this.isSecurityEnabled) {
        this.isLocked = true;
        this.setupAppStateListener();
      } else {
        this.isLocked = false;
      }

      this.isInitialized = true;
      this.notifyListeners();
    } catch (error) {
      console.error('BiometricService: Initialization error:', error);
      this.isInitialized = true;
    }
  }

  setupAppStateListener() {
    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
    }

    this.appStateSubscription = AppState.addEventListener('change', (nextAppState) => {
      console.log('BiometricService: AppState changed to:', nextAppState);

      if (nextAppState === 'background') {
        this.handleAppGoingToBackground();
      } else if (nextAppState === 'active') {
        this.handleAppComingToForeground();
      }
    });
  }

  handleAppGoingToBackground() {
    if (!this.isSecurityEnabled) return;
    // If biometric dialog is actively displayed, ignore state transition
    if (this.isAuthenticatingPrompt) return;

    this.backgroundTime = Date.now();
    this.updateLastActiveTime();
  }

  handleAppComingToForeground() {
    if (!this.isSecurityEnabled) return;
    if (this.isAuthenticatingPrompt) return;

    if (this.backgroundTime) {
      const elapsedMs = Date.now() - this.backgroundTime;
      // If the app was backgrounded for more than 1200ms (user switched apps or locked phone), lock the app
      if (elapsedMs > 1200) {
        console.log(`BiometricService: App backgrounded for ${elapsedMs}ms, locking app`);
        this.lockApp();
        this.isAuthenticated = false;
      }
    }
    this.backgroundTime = null;
  }

  updateLastActiveTime() {
    this.lastActiveTime = Date.now();
  }

  /**
   * Check whether biometrics (fingerprint/face) or device credentials (PIN/pattern) are available
   */
  async checkBiometricAvailability() {
    try {
      const result = await isSensorAvailable({
        biometricStrength: BiometricStrength.Weak,
      });

      const hasBiometrics = Boolean(result && result.available);
      const isDeviceSecure = Boolean(result && result.isDeviceSecure);

      let biometryType = result?.biometryType || null;
      if (!biometryType && hasBiometrics) {
        biometryType = Platform.OS === 'ios' ? 'FaceID' : 'Biometrics';
      }

      return {
        available: hasBiometrics || isDeviceSecure,
        hasBiometrics,
        isDeviceSecure,
        biometryType,
        error: result?.error,
        errorCode: result?.errorCode,
      };
    } catch (error) {
      console.warn('BiometricService: isSensorAvailable error, trying fallback:', error.message);
      try {
        const fallback = await isSensorAvailable();
        return {
          available: Boolean(fallback && (fallback.available || fallback.isDeviceSecure)),
          hasBiometrics: Boolean(fallback && fallback.available),
          isDeviceSecure: Boolean(fallback && fallback.isDeviceSecure),
          biometryType: fallback?.biometryType || null,
        };
      } catch (e) {
        return {
          available: false,
          hasBiometrics: false,
          isDeviceSecure: false,
          biometryType: null,
          error: error.message,
        };
      }
    }
  }

  /**
   * Prompts the user with Biometrics (fingerprint / face ID) and allows device PIN / Pattern fallback.
   */
  async authenticate(reason = 'Unlock GDK Chit Fund', options = {}) {
    try {
      if (!this.isSecurityEnabled && !options.force) {
        return { success: true };
      }

      if (this.isAuthenticatingPrompt) {
        return { success: false, error: 'Authentication already in progress' };
      }

      this.isAuthenticatingPrompt = true;

      const title = options.title || reason || 'Unlock GDK Chit Fund';
      const subtitle = options.subtitle || 'Verify your fingerprint, face, or device PIN';
      const cancelLabel = options.cancelLabel || 'Cancel';

      try {
        // Primary modern method: supports biometrics + device PIN/pattern fallback
        const result = await authenticateWithOptions({
          title,
          subtitle,
          cancelLabel,
          allowDeviceCredentials: true,
          disableDeviceFallback: false,
          biometricStrength: BiometricStrength.Weak,
          returnAuthType: true,
        });

        if (result && result.success) {
          this.unlockApp();
          this.isAuthenticated = true;
          this.updateLastActiveTime();
          return { success: true, authType: result.authType };
        }

        return { success: false, error: result?.error || 'Authentication failed' };
      } catch (primaryErr) {
        const errMsg = primaryErr?.message || '';
        const errCode = primaryErr?.code || primaryErr?.errorCode || '';

        console.log(`BiometricService: authenticateWithOptions rejected: [${errCode}] ${errMsg}`);

        // Check if user actively dismissed or cancelled
        if (
          errMsg.toLowerCase().includes('cancel') ||
          errMsg.toLowerCase().includes('user') ||
          errCode.includes('CANCEL') ||
          errCode.includes('Cancel') ||
          errCode === '13' || // BIOMETRIC_ERROR_USER_CANCELED
          errCode === '10'    // BIOMETRIC_ERROR_NEGATIVE_BUTTON
        ) {
          return { success: false, error: 'Authentication cancelled', isCancel: true };
        }

        // Try simplePrompt as a fallback for older Android devices or ROM edge cases
        try {
          console.log('BiometricService: Falling back to simplePrompt...');
          const simpleRes = await simplePrompt(title, {
            biometricStrength: BiometricStrength.Weak,
          });

          if (simpleRes && (simpleRes.success || simpleRes === true)) {
            this.unlockApp();
            this.isAuthenticated = true;
            this.updateLastActiveTime();
            return { success: true };
          }

          return { success: false, error: simpleRes?.error || 'Authentication failed' };
        } catch (fallbackErr) {
          const fbMsg = fallbackErr?.message || '';
          if (fbMsg.toLowerCase().includes('cancel')) {
            return { success: false, error: 'Authentication cancelled', isCancel: true };
          }
          return { success: false, error: fbMsg || 'Authentication failed' };
        }
      }
    } catch (unexpectedErr) {
      console.error('BiometricService: Unexpected authentication error:', unexpectedErr);
      return { success: false, error: unexpectedErr.message || 'Authentication error' };
    } finally {
      // Clear flag quickly so user can toggle smoothly
      setTimeout(() => {
        this.isAuthenticatingPrompt = false;
      }, 100);
    }
  }

  /**
   * Specifically triggers Device Credentials (PIN, Pattern, Password)
   */
  async authenticateWithDeviceCredentials(reason = 'Unlock GDK Chit Fund with device credentials') {
    return this.authenticate(reason, {
      title: 'Device Security Lock',
      subtitle: 'Enter your device PIN, pattern, or password',
      allowDeviceCredentials: true,
      force: true,
    });
  }

  async enableSecurity(options = {}) {
    try {
      await AsyncStorage.setItem('securityEnabled', 'true');
      this.isSecurityEnabled = true;
      this.isAuthenticated = false;
      // When enabled, lock immediately to show lock screen: "when its on it need to go to lock screen and ask the biometric and open the app"
      this.isLocked = options.lockImmediately !== undefined ? options.lockImmediately : true;
      this.updateLastActiveTime();
      this.setupAppStateListener();
      this.notifyListeners();

      // Non-blocking deferred backend update for smooth zero-lag UI
      if (apiService.token) {
        apiService.updateUserPreferences({ securityEnabled: true }).catch((backendErr) => {
          console.log('BiometricService: Backend preferences update deferred:', backendErr?.message);
        });
      }

      return { success: true };
    } catch (error) {
      console.error('BiometricService: Enable security error:', error);
      return { success: false, error: error.message };
    }
  }

  async disableSecurity() {
    try {
      await AsyncStorage.setItem('securityEnabled', 'false');
      this.isSecurityEnabled = false;
      this.isLocked = false;
      this.isAuthenticated = false;
      this.lastActiveTime = null;
      this.backgroundTime = null;

      if (this.appStateSubscription) {
        this.appStateSubscription.remove();
        this.appStateSubscription = null;
      }

      this.notifyListeners();

      // Non-blocking deferred backend update for smooth zero-lag UI
      if (apiService.token) {
        apiService.updateUserPreferences({ securityEnabled: false }).catch((backendErr) => {
          console.log('BiometricService: Backend preferences update deferred:', backendErr?.message);
        });
      }

      return { success: true };
    } catch (error) {
      console.error('BiometricService: Disable security error:', error);
      return { success: false, error: error.message };
    }
  }

  lockApp() {
    if (this.isSecurityEnabled && !this.isLocked) {
      this.isLocked = true;
      this.notifyListeners();
    }
  }

  unlockApp() {
    if (this.isLocked) {
      console.log('BiometricService: Unlocking app');
      this.isLocked = false;
      this.isAuthenticated = true;
      this.updateLastActiveTime();
      this.notifyListeners();
    }
  }

  addListener(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((listener) => listener !== callback);
    };
  }

  notifyListeners() {
    const state = this.getState();
    this.listeners.forEach((callback) => {
      try {
        callback(state);
      } catch (err) {
        console.error('BiometricService listener error:', err);
      }
    });
  }

  getState() {
    return {
      isLocked: this.isLocked,
      isSecurityEnabled: this.isSecurityEnabled,
    };
  }
}

export default new BiometricService();