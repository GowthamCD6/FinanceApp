import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { isSensorAvailable, simplePrompt } from '@sbaiahmed1/react-native-biometrics';
import apiService from './apiService';

class BiometricService {
  constructor() {
    this.isLocked = false;
    this.isSecurityEnabled = false;
    this.isAuthenticated = false; // Track if user has authenticated in this session
    this.lastActiveTime = null; // Track when user was last active
    this.backgroundTime = null; // Track when app went to background
    this.listeners = [];
    this.appStateSubscription = null;
    this.lockTimeoutMinutes = 5; // 5 minutes timeout
    this.isInitialized = false;
    
    console.log('BiometricService: Constructor called');
  }

  async init() {
    if (this.isInitialized) {
      console.log('BiometricService: Already initialized');
      this.notifyListeners(); // Notify listeners even if already initialized
      return;
    }
    try {
      console.log('BiometricService: Starting initialization...');
      
      // Check if security is enabled locally
      const enabled = await AsyncStorage.getItem('securityEnabled');
      let isEnabled = enabled === 'true';

      // Attempt to sync from backend database user_preferences with 1500ms timeout
      try {
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Preferences timeout')), 1500)
        );
        const prefRes = await Promise.race([
          apiService.getUserPreferences(),
          timeoutPromise
        ]);
        if (prefRes && prefRes.success && prefRes.data && prefRes.data.securityEnabled !== undefined) {
          isEnabled = Boolean(prefRes.data.securityEnabled);
          await AsyncStorage.setItem('securityEnabled', isEnabled ? 'true' : 'false');
        }
      } catch (backendErr) {
        console.log('BiometricService: Backend preferences offline or unauthenticated, using local setting:', backendErr.message);
      }

      this.isSecurityEnabled = isEnabled;
      console.log('BiometricService: Security enabled resolved to:', this.isSecurityEnabled);
      
      // Session data is memory-only - always start unauthenticated
      this.isAuthenticated = false;
      console.log('BiometricService: Starting fresh session - not authenticated');
      
      // Session data is memory-only - no last active time on startup
      this.lastActiveTime = null;
      console.log('BiometricService: Starting fresh session - no last active time');
      
      // Determine if app should be locked
      this.determineInitialLockState();
      
      if (this.isSecurityEnabled) {
        this.setupAppStateListener();
      }
      
      this.isInitialized = true;
      console.log('BiometricService: Initialization complete');
      
      // Notify listeners about the initial state
      this.notifyListeners();
    } catch (error) {
      console.error('BiometricService: Init error:', error);
      this.isInitialized = true; // Still mark as initialized to prevent infinite loops
    }
  }

  determineInitialLockState() {
    if (!this.isSecurityEnabled) {
      console.log('BiometricService: Security disabled, not locking');
      this.isLocked = false;
      return;
    }

    // If never authenticated in this session, lock the app
    if (!this.isAuthenticated) {
      console.log('BiometricService: Never authenticated, locking app');
      this.isLocked = true;
      return;
    }

    // If was authenticated, check if enough time has passed since last active
    if (this.lastActiveTime) {
      const now = new Date();
      const timeDiff = now - this.lastActiveTime;
      const minutesDiff = timeDiff / (1000 * 60);
      
      console.log('BiometricService: Time since last active:', minutesDiff, 'minutes');
      
      if (minutesDiff > this.lockTimeoutMinutes) {
        console.log('BiometricService: Timeout exceeded, locking app');
        this.isLocked = true;
        this.isAuthenticated = false;
      } else {
        console.log('BiometricService: Within timeout, not locking');
        this.isLocked = false;
        this.updateLastActiveTime();
      }
    } else {
      // No last active time recorded, lock the app
      console.log('BiometricService: No last active time, locking app');
      this.isLocked = true;
      this.isAuthenticated = false;
    }
  }

  setupAppStateListener() {
    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
    }

    console.log('BiometricService: Setting up app state listener');
    this.appStateSubscription = AppState.addEventListener('change', (nextAppState) => {
      console.log('BiometricService: App state changed to:', nextAppState);
      
      if (nextAppState === 'background') {
        this.handleAppGoingToBackground();
      } else if (nextAppState === 'active') {
        this.handleAppComingToForeground();
      }
    });
  }

  handleAppGoingToBackground() {
    if (!this.isSecurityEnabled || !this.isAuthenticated) return;
    
    console.log('BiometricService: App going to background');
    this.backgroundTime = new Date();
    this.updateLastActiveTime();
    
    // Session data is memory-only - no persistent storage
  }

  handleAppComingToForeground() {
    if (!this.isSecurityEnabled) return;
    
    console.log('BiometricService: App coming to foreground');
    
    // Only check timeout if user was previously authenticated and went to background
    if (this.isAuthenticated && this.backgroundTime) {
      const now = new Date();
      const timeDiff = now - this.backgroundTime;
      const minutesDiff = timeDiff / (1000 * 60);
      
      console.log('BiometricService: Background time:', minutesDiff, 'minutes');
      
      if (minutesDiff > this.lockTimeoutMinutes) {
        console.log('BiometricService: Timeout exceeded, locking app');
        this.lockApp();
        this.isAuthenticated = false; // Reset authentication
      } else {
        console.log('BiometricService: Within timeout, staying unlocked');
        this.updateLastActiveTime();
      }
    }
    
    this.backgroundTime = null;
  }

  updateLastActiveTime() {
    this.lastActiveTime = new Date();
    // Session data is memory-only - no persistent storage
  }

  async checkBiometricAvailability() {
    try {
      const result = await isSensorAvailable();
      return { available: result.available, biometryType: result.biometryType };
    } catch (error) {
      console.error('Biometric check error:', error);
      return { available: false, biometryType: null };
    }
  }

  async isBiometricAvailable() {
    return this.checkBiometricAvailability();
  }

  async authenticate(reason = 'Authenticate to unlock app') {
    try {
      console.log('BiometricService: Starting authentication...');
      
      if (!this.isSecurityEnabled) {
        console.log('BiometricService: Security not enabled, skipping authentication');
        return { success: true };
      }

      const { available } = await this.checkBiometricAvailability();
      
      if (available) {
        // Use simplePrompt with the new API: simplePrompt(promptMessage)
        try {
          const result = await simplePrompt(reason);
          
          if (result.success || result === true) {
            this.unlockApp();
            this.isAuthenticated = true;
            this.updateLastActiveTime();
            console.log('BiometricService: Authentication successful');
            return { success: true };
          } else {
            return { success: false, error: 'Authentication cancelled' };
          }
        } catch (promptError) {
          // User cancelled or authentication failed
          console.log('BiometricService: Prompt error/cancel:', promptError.message);
          return { success: false, error: promptError.message || 'Authentication cancelled' };
        }
      } else {
        // No biometric available, try simplePrompt anyway - it may use device credentials
        try {
          const result = await simplePrompt(reason);
          
          if (result.success || result === true) {
            this.unlockApp();
            this.isAuthenticated = true;
            this.updateLastActiveTime();
            console.log('BiometricService: Device credentials authentication successful');
            return { success: true };
          } else {
            return { success: false, error: 'Authentication cancelled' };
          }
        } catch (promptError) {
          console.log('BiometricService: Device credentials error:', promptError.message);
          return { success: false, error: promptError.message || 'Authentication failed' };
        }
      }
    } catch (error) {
      console.error('Authentication error:', error);
      return { success: false, error: error.message || 'Authentication failed' };
    }
  }

  async authenticateWithDeviceCredentials(reason = 'Unlock GDK Chit Fund with device credentials') {
    return this.authenticate(reason);
  }

  async enableSecurity() {
    try {
      await AsyncStorage.setItem('securityEnabled', 'true');
      this.isSecurityEnabled = true;
      this.isLocked = true; // Lock immediately when security is enabled
      this.setupAppStateListener();
      this.notifyListeners();

      try {
        if (apiService.token) {
          await apiService.updateUserPreferences({ securityEnabled: true });
        }
      } catch (backendErr) {
        console.log('BiometricService: Local security enabled (backend offline):', backendErr?.message);
      }

      return { success: true };
    } catch (error) {
      console.error('Enable security error:', error);
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
      
      console.log('BiometricService: Security disabled and session data cleared');
      this.notifyListeners();

      try {
        if (apiService.token) {
          await apiService.updateUserPreferences({ securityEnabled: false });
        }
      } catch (backendErr) {
        console.log('BiometricService: Local security disabled (backend offline):', backendErr?.message);
      }

      return { success: true };
    } catch (error) {
      console.error('Disable security error:', error);
      return { success: false, error: error.message };
    }
  }

  lockApp() {
    if (this.isSecurityEnabled) {
      this.isLocked = true;
      this.notifyListeners();
    }
  }

  async unlockApp() {
    console.log('BiometricService: Unlocking app');
    this.isLocked = false;
    await this.startSession();
    this.notifyListeners();
  }

  async startSession() {
    // Initialize session - keep authentication state in memory only
    this.updateLastActiveTime();
    console.log('BiometricService: Session started');
  }

  addListener(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  notifyListeners() {
    this.listeners.forEach(callback => {
      callback({
        isLocked: this.isLocked,
        isSecurityEnabled: this.isSecurityEnabled
      });
    });
  }

  getState() {
    return {
      isLocked: this.isLocked,
      isSecurityEnabled: this.isSecurityEnabled
    };
  }
}

export default new BiometricService();