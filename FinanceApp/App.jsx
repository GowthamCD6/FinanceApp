import React, { useState, useEffect } from 'react';
import { StatusBar, StyleSheet, View, ActivityIndicator, Modal, BackHandler } from 'react-native';
import { SafeAreaProvider, SafeAreaView, initialWindowMetrics } from 'react-native-safe-area-context';
import { AppProvider } from './src/context/AppContext';
import { LanguageProvider } from './src/utils/LanguageContext';
import Routes from './src/components/Routes/Routes';
import BiometricService from './src/services/BiometricService';
import SecurityLockScreen from './src/pages/Admin/pages/Profile/Pages/SecurityLock/SecurityLockScreen';
import { Colors } from './src/theme';

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
          { justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.primary },
        ]}
      >
        <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
        <ActivityIndicator size="large" color={Colors.white} />
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle={securityState.isLocked ? 'light-content' : 'dark-content'}
        backgroundColor={securityState.isLocked ? Colors.black : Colors.background}
      />
      {/* Routes stays mounted to maintain state, eliminate reload lag, and keep current page */}
      <Routes />

      {/* Lock screen modal overlays smoothly when locked */}
      <Modal
        visible={securityState.isLocked}
        animationType="fade"
        transparent={false}
        statusBarTranslucent
        onRequestClose={() => {
          // Hardware back button exits app if locked
          BackHandler.exitApp();
        }}
      >
        {securityState.isLocked && (
          <SecurityLockScreen onAuthenticationSuccess={handleUnlock} />
        )}
      </Modal>
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
