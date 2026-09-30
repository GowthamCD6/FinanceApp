import React, { useState, useEffect } from 'react';
import { StatusBar, StyleSheet, View, ActivityIndicator } from 'react-native';
import { SafeAreaProvider, SafeAreaView, initialWindowMetrics } from 'react-native-safe-area-context';
import { AppProvider } from './src/context/AppContext';
import { LanguageProvider } from './src/utils/LanguageContext';
import Routes from './src/components/Routes/Routes';
import BiometricService from './src/services/BiometricService';
import SecurityLockScreen from './src/pages/Admin/pages/Profile/Pages/SecurityLock/SecurityLockScreen';

const AppContent = () => {
  const [securityState, setSecurityState] = useState({
    isLocked: false,
    isSecurityEnabled: false,
    isLoading: true,
  });

  useEffect(() => {
    let isMounted = true;

    const initSecurity = async () => {
      try {
        await BiometricService.init();
        await new Promise((resolve) => setTimeout(resolve, 100));
        const state = BiometricService.getState();
        if (isMounted) {
          setSecurityState({
            ...state,
            isLoading: false,
          });
        }
      } catch (error) {
        if (isMounted) {
          setSecurityState((prev) => ({ ...prev, isLoading: false }));
        }
      }
    };

    initSecurity();

    // Listen for security state updates (lock/unlock)
    const unsubscribe = BiometricService.addListener((state) => {
      if (isMounted) {
        setSecurityState((prev) => ({
          ...prev,
          ...state,
        }));
      }
    });

    return () => {
      isMounted = false;
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  const handleUnlock = () => {
    BiometricService.unlockApp();
  };

  if (securityState.isLoading) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          { justifyContent: 'center', alignItems: 'center', backgroundColor: '#6B46C1' },
        ]}
      >
        <StatusBar barStyle="light-content" backgroundColor="#6B46C1" />
        <ActivityIndicator size="large" color="#FFFFFF" />
      </SafeAreaView>
    );
  }

  // Show lock screen if biometric security triggered a lock
  if (securityState.isLocked) {
    return (
      <SecurityLockScreen onAuthenticationSuccess={handleUnlock} />
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <Routes />
    </View>
  );
};

export default function App() {
  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <LanguageProvider>
        <AppProvider>
          <AppContent />
        </AppProvider>
      </LanguageProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1120',
  },
});
