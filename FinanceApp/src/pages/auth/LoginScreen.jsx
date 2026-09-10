import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, TextInput, TouchableOpacity, 
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Alert 
} from 'react-native';
import { useApp } from '../../context/AppContext';
import Icon from '../../components/common/Icon';

const LoginScreen = () => {
  const { loginWithCredentials } = useApp();

  const [identifier, setIdentifier] = useState('9999999999');
  const [password, setPassword] = useState('Admin@123');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Quick One-Tap Role Fillers (Strict 3 Roles)
  const demoAccounts = [
    {
      role: 'SUPER_ADMIN',
      icon: 'crown',
      label: 'Super Admin',
      identifier: '9999999999',
      pass: 'Admin@123',
      desc: 'Full System Control & Central Fund',
      color: '#2563EB',
    },
    {
      role: 'ADMIN',
      icon: 'shield',
      label: 'Admin Operations',
      identifier: '8888888888',
      pass: 'Admin@123',
      desc: 'Daily Collections & Loan Lifecycle',
      color: '#059669',
    },
    {
      role: 'USER',
      icon: 'customers',
      label: 'Customer (Kumar)',
      identifier: '9876543210',
      pass: 'Kumar@123',
      desc: 'Personal Loans & Repayments Only',
      color: '#D97706',
    },
  ];

  const handleQuickSelect = (acc) => {
    setIdentifier(acc.identifier);
    setPassword(acc.pass);
  };

  const handleLogin = async () => {
    if (!identifier.trim() || !password.trim()) {
      Alert.alert('Validation', 'Please enter your phone/email and password.');
      return;
    }

    setLoading(true);
    try {
      const result = await loginWithCredentials(identifier.trim(), password.trim());
      if (!result.success) {
        Alert.alert('Login Failed', result.message || 'Invalid credentials.');
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Authentication error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Brand Banner */}
        <View style={styles.brandContainer}>
          <View style={styles.logoBadge}>
            <Icon name="fund" size={28} color="#2563EB" />
          </View>
          <Text style={styles.brandTitle}>FUND FLOW</Text>
          <Text style={styles.brandSubtitle}>Central Fund Circulation & Lending Engine</Text>
        </View>

        {/* Login Card */}
        <View style={styles.card}>
          <Text style={styles.cardHeading}>Sign In to Account</Text>
          <Text style={styles.cardSub}>Select your role credentials or enter manually</Text>

          {/* Identifier Input */}
          <Text style={styles.inputLabel}>PHONE NUMBER OR EMAIL</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 9999999999 or admin@fundlending.com"
            placeholderTextColor="#94A3B8"
            value={identifier}
            onChangeText={setIdentifier}
            autoCapitalize="none"
            keyboardType="default"
          />

          {/* Password Input */}
          <Text style={styles.inputLabel}>PASSWORD</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Enter your password"
              placeholderTextColor="#94A3B8"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity 
              style={styles.eyeBtn}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Text style={styles.eyeText}>{showPassword ? 'HIDE' : 'SHOW'}</Text>
            </TouchableOpacity>
          </View>

          {/* Submit Button */}
          <TouchableOpacity 
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <View style={styles.submitRow}>
                <Text style={styles.submitText}>Authenticate & Enter System</Text>
                <Icon name="arrow-right" size={14} color="#FFFFFF" />
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Quick Role Fillers (Strict 3 Roles) */}
        <View style={styles.quickSection}>
          <Text style={styles.quickHeader}>ONE-TAP DEMO CREDENTIALS</Text>
          <Text style={styles.quickSub}>Tap any role below to prefill login credentials:</Text>

          <View style={styles.demoList}>
            {demoAccounts.map((acc) => {
              const isSelected = identifier === acc.identifier;
              return (
                <TouchableOpacity
                  key={acc.role}
                  style={[
                    styles.demoCard,
                    isSelected && styles.demoCardActive,
                  ]}
                  onPress={() => handleQuickSelect(acc)}
                  activeOpacity={0.8}
                >
                  <View style={styles.demoTopRow}>
                    <View style={styles.roleTitleRow}>
                      <Icon name={acc.icon} size={15} color={acc.color} />
                      <Text style={styles.demoRoleTitle}>{acc.label}</Text>
                    </View>
                    {isSelected && <Text style={styles.selectedPill}>SELECTED</Text>}
                  </View>
                  <Text style={styles.demoMeta}>
                    ID: <Text style={styles.demoHighlight}>{acc.identifier}</Text> • Pass: <Text style={styles.demoHighlight}>{acc.pass}</Text>
                  </Text>
                  <Text style={styles.demoDesc}>{acc.desc}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Security / System Footer */}
        <View style={styles.footer}>
          <View style={styles.footerRow}>
            <Icon name="lock" size={12} color="#94A3B8" />
            <Text style={styles.footerText}>
              End-to-end encrypted with immutable double-entry ledger.
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    padding: 20,
    paddingTop: 40,
    paddingBottom: 40,
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: 2,
  },
  brandSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeading: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  cardSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 3,
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 1,
    marginBottom: 6,
    marginTop: 8,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 11,
    color: '#0F172A',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    fontSize: 14,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 11,
    color: '#0F172A',
    fontSize: 14,
  },
  eyeBtn: {
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  eyeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
  },
  submitButton: {
    backgroundColor: '#2563EB',
    borderRadius: 8,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  quickSection: {
    marginTop: 4,
  },
  quickHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 1.2,
  },
  quickSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    marginBottom: 12,
  },
  demoList: {
    gap: 10,
  },
  demoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  demoCardActive: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  demoTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  roleTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  demoRoleTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  selectedPill: {
    fontSize: 9,
    fontWeight: '800',
    color: '#2563EB',
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  demoMeta: {
    fontSize: 12,
    color: '#475569',
    marginTop: 2,
  },
  demoHighlight: {
    color: '#2563EB',
    fontWeight: '700',
  },
  demoDesc: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 4,
  },
  footer: {
    marginTop: 24,
    alignItems: 'center',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  footerText: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
  },
});

export default LoginScreen;
