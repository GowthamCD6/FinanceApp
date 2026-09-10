import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useApp } from '../../../context/AppContext';
import Icon from '../../../components/common/Icon';

export const Login = ({ onLoginSuccess }) => {
  const { loginWithCredentials } = useApp();

  const [identifier, setIdentifier] = useState('9999999999');
  const [password, setPassword] = useState('Admin@123');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Quick 1-Tap Role Selector Cards
  const demoAccounts = [
    {
      role: 'SUPER_ADMIN',
      icon: 'crown',
      label: 'Super Admin',
      identifier: '9999999999',
      pass: 'Admin@123',
      desc: 'Central Fund & Portfolio Control',
      color: '#7C3AED',
      bg: '#F5F3FF',
      border: '#DDD6FE',
    },
    {
      role: 'ADMIN',
      icon: 'shield',
      label: 'Branch Admin',
      identifier: '8888888888',
      pass: 'Admin@123',
      desc: 'Daily Collections & User Onboarding',
      color: '#059669',
      bg: '#ECFDF5',
      border: '#A7F3D0',
    },
    {
      role: 'USER',
      icon: 'user',
      label: 'Borrower / Client',
      identifier: '9876543210',
      pass: 'Kumar@123',
      desc: 'Personal Loans & Repayments',
      color: '#2563EB',
      bg: '#EFF6FF',
      border: '#BFDBFE',
    },
  ];

  const handleQuickSelect = (acc) => {
    setIdentifier(acc.identifier);
    setPassword(acc.pass);
    setErrorMessage('');
  };

  const handleLogin = async (overrideId, overridePass) => {
    const idToUse = overrideId || identifier;
    const passToUse = overridePass || password;

    if (!idToUse.trim() || !passToUse.trim()) {
      setErrorMessage('Please enter your phone/email and password.');
      return;
    }

    setErrorMessage('');
    setLoading(true);
    try {
      const result = await loginWithCredentials(idToUse.trim(), passToUse.trim());
      if (!result.success) {
        setErrorMessage(result.message || 'Invalid credentials.');
      } else if (onLoginSuccess) {
        onLoginSuccess(result.user);
      }
    } catch (error) {
      setErrorMessage(error?.message || 'Authentication error.');
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
        {/* Brand Banner Header */}
        <View style={styles.brandContainer}>
          <View style={styles.logoBadge}>
            <Icon name="fund" size={26} color="#2563EB" />
          </View>
          <Text style={styles.brandTitle}>FUND FLOW</Text>
          <Text style={styles.brandSubtitle}>Central Fund Circulation & Lending Engine</Text>
        </View>

        {/* 1-Click Fast Admin Sign-In Box */}
        <TouchableOpacity
          style={styles.instantAccessBox}
          onPress={() => handleLogin('8888888888', 'Admin@123')}
          activeOpacity={0.85}
          disabled={loading}
        >
          <View style={styles.instantIconBox}>
            <Icon name="shield" size={18} color="#059669" />
          </View>
          <View style={styles.instantTextWrap}>
            <Text style={styles.instantTitle}>1-Click Admin Access</Text>
            <Text style={styles.instantSubtitle}>Sign in as Branch Operations Manager</Text>
          </View>
          <Icon name="arrow-right" size={16} color="#059669" />
        </TouchableOpacity>

        {/* Login Credentials Card */}
        <View style={styles.card}>
          <Text style={styles.cardHeading}>Sign In to Account</Text>
          <Text style={styles.cardSub}>Enter credentials or choose a 1-tap demo role</Text>

          {errorMessage ? (
            <View style={styles.errorBox}>
              <Icon name="close" size={13} color="#DC2626" />
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          {/* Identifier Input */}
          <Text style={styles.inputLabel}>PHONE NUMBER OR EMAIL</Text>
          <View style={styles.inputRow}>
            <View style={styles.inputIconBox}>
              <Icon name="account-outline" size={16} color="#94A3B8" />
            </View>
            <TextInput
              style={styles.input}
              placeholder="e.g. 9999999999 or admin@fundflow.in"
              placeholderTextColor="#94A3B8"
              value={identifier}
              onChangeText={(text) => {
                setIdentifier(text);
                setErrorMessage('');
              }}
              autoCapitalize="none"
              keyboardType="default"
            />
          </View>

          {/* Password Input */}
          <Text style={styles.inputLabel}>SECURITY PASSWORD</Text>
          <View style={styles.inputRow}>
            <View style={styles.inputIconBox}>
              <Icon name="lock" size={16} color="#94A3B8" />
            </View>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Enter your password"
              placeholderTextColor="#94A3B8"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setErrorMessage('');
              }}
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
            onPress={() => handleLogin()}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <View style={styles.submitRow}>
                <Text style={styles.submitText}>Authenticate & Sign In</Text>
                <Icon name="arrow-right" size={15} color="#FFFFFF" />
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Quick Role Fillers (1-Tap Selection) */}
        <View style={styles.quickSection}>
          <Text style={styles.quickHeader}>QUICK ROLE PREFILLS</Text>
          <Text style={styles.quickSub}>Tap any role to load demo credentials:</Text>

          <View style={styles.demoList}>
            {demoAccounts.map((acc) => {
              const isSelected = identifier === acc.identifier;
              return (
                <TouchableOpacity
                  key={acc.role}
                  style={[
                    styles.demoCard,
                    { borderColor: isSelected ? acc.color : '#E2E8F0', backgroundColor: isSelected ? acc.bg : '#FFFFFF' },
                  ]}
                  onPress={() => handleQuickSelect(acc)}
                  activeOpacity={0.8}
                >
                  <View style={styles.demoTopRow}>
                    <View style={styles.roleTitleRow}>
                      <View style={[styles.roleIconCircle, { backgroundColor: acc.color + '18' }]}>
                        <Icon name={acc.icon} size={14} color={acc.color} />
                      </View>
                      <Text style={[styles.demoRoleTitle, { color: isSelected ? acc.color : '#0F172A' }]}>
                        {acc.label}
                      </Text>
                    </View>
                    {isSelected && (
                      <View style={[styles.selectedPill, { backgroundColor: acc.color }]}>
                        <Text style={styles.selectedPillText}>READY</Text>
                      </View>
                    )}
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
            <Icon name="lock" size={13} color="#64748B" />
            <Text style={styles.footerText}>
              Branch Level 2 • 256-bit Encrypted Ledger Terminal
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
    paddingTop: Platform.OS === 'ios' ? 24 : 32,
    paddingBottom: 40,
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoBadge: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#EFF6FF',
    borderWidth: 1.5,
    borderColor: '#BFDBFE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: 1.5,
  },
  brandSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },

  /* ── 1-Click Access Box ── */
  instantAccessBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1.5,
    borderColor: '#A7F3D0',
    borderRadius: 14,
    padding: 12,
    marginBottom: 16,
    gap: 10,
  },
  instantIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  instantTextWrap: {
    flex: 1,
  },
  instantTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#065F46',
  },
  instantSubtitle: {
    fontSize: 11,
    color: '#059669',
    marginTop: 1,
  },

  /* ── Main Form Card ── */
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
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
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  cardSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    marginBottom: 14,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  errorText: {
    fontSize: 12,
    color: '#DC2626',
    fontWeight: '600',
    flex: 1,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#475569',
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  inputIconBox: {
    width: 40,
    height: 44,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRightWidth: 0,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    height: 44,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    paddingHorizontal: 12,
    fontSize: 13,
    color: '#0F172A',
  },
  eyeBtn: {
    position: 'absolute',
    right: 12,
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  eyeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#2563EB',
  },
  submitButton: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  submitText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  /* ── Quick Role Section ── */
  quickSection: {
    marginBottom: 16,
  },
  quickHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: '#475569',
    letterSpacing: 0.8,
  },
  quickSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    marginBottom: 10,
  },
  demoList: {
    gap: 8,
  },
  demoCard: {
    borderRadius: 14,
    borderWidth: 1.5,
    padding: 12,
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
    gap: 8,
  },
  roleIconCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  demoRoleTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  selectedPill: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
  },
  selectedPillText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  demoMeta: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  demoHighlight: {
    fontWeight: '700',
    color: '#0F172A',
  },
  demoDesc: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 2,
  },

  /* ── Footer ── */
  footer: {
    alignItems: 'center',
    marginTop: 8,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  footerText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
});

export default Login;
