import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useApp } from '../../../context/AppContext';
import { FadeInView } from '../../../animation/FadeInView';
import { BouncyPressable } from '../../../animation/BouncyPressable';
import styles from './Loginsty';
import Colors from '../../../theme/colors';

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
      color: Colors.primaryVivid,
      bg: Colors.purpleTintLightest,
      border: Colors.purpleBorderLight,
    },
    {
      role: 'ADMIN',
      icon: 'shield-check',
      label: 'Branch Admin',
      identifier: '8888888888',
      pass: 'Admin@123',
      desc: 'Daily Collections & User Onboarding',
      color: Colors.success,
      bg: Colors.successBg,
      border: '#A7F3D0',
    },
    {
      role: 'USER',
      icon: 'account',
      label: 'Borrower / Client',
      identifier: '9876543210',
      pass: 'Kumar@123',
      desc: 'Personal Loans & Repayments',
      color: Colors.secondaryBlue,
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
        <FadeInView duration={600}>
          {/* Brand Header */}
          <View style={styles.brandHeader}>
            <View style={styles.brandLogoCircle}>
              <MaterialCommunityIcons name="finance" size={32} color={Colors.primary} />
            </View>
            <Text style={styles.brandTitle}>Finance App</Text>
            <Text style={styles.brandSubtitle}>Microfinance & Lending Platform</Text>
            <View style={styles.decorativeLine} />
          </View>

          {/* Main Credentials Card */}
          <View style={styles.card}>
            <Text style={styles.cardHeading}>Sign In to Account</Text>
            <Text style={styles.cardSub}>Enter your registered phone or email address</Text>

            {/* Error Banner */}
            {errorMessage ? (
              <View style={styles.errorBox}>
                <MaterialCommunityIcons name="alert-circle" size={18} color={Colors.errorIcon} />
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            ) : null}

            {/* Identifier Input */}
            <Text style={styles.inputLabel}>MOBILE OR EMAIL</Text>
            <View style={styles.inputRow}>
              <View style={styles.inputIconBox}>
                <MaterialCommunityIcons name="account-outline" size={20} color={Colors.secondaryBlue} />
              </View>
              <TextInput
                style={styles.input}
                value={identifier}
                onChangeText={(t) => { setIdentifier(t); setErrorMessage(''); }}
                placeholder="e.g. 9876543210"
                placeholderTextColor={Colors.gray100}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            {/* Password Input */}
            <Text style={styles.inputLabel}>PASSWORD</Text>
            <View style={styles.inputRow}>
              <View style={styles.inputIconBox}>
                <MaterialCommunityIcons name="lock-outline" size={20} color={Colors.secondaryBlue} />
              </View>
              <TextInput
                style={[styles.input, { paddingRight: 40 }]}
                value={password}
                onChangeText={(t) => { setPassword(t); setErrorMessage(''); }}
                placeholder="Enter password"
                placeholderTextColor={Colors.gray100}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                style={styles.eyeBtn}
                onPress={() => setShowPassword(!showPassword)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <MaterialCommunityIcons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={Colors.secondaryBlue}
                />
              </TouchableOpacity>
            </View>

            {/* Submit Button */}
            <BouncyPressable
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
              onPress={() => handleLogin()}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={Colors.white} size="small" />
              ) : (
                <View style={styles.submitRow}>
                  <Text style={styles.submitText}>Continue Securely</Text>
                  <MaterialCommunityIcons name="arrow-right" size={18} color={Colors.white} />
                </View>
              )}
            </BouncyPressable>
          </View>

          {/* Quick Demo Access Roles */}
          <View style={styles.quickSection}>
            <Text style={styles.quickHeader}>ONE-TAP DEMO ACCESS</Text>
            <Text style={styles.quickSub}>Select a preset role to quickly sign in</Text>

            <View style={styles.demoList}>
              {demoAccounts.map((acc) => {
                const isCurrent = identifier === acc.identifier;
                return (
                  <TouchableOpacity
                    key={acc.role}
                    style={[
                      styles.demoCard,
                      { backgroundColor: acc.bg, borderColor: isCurrent ? acc.color : acc.border },
                    ]}
                    onPress={() => {
                      handleQuickSelect(acc);
                      handleLogin(acc.identifier, acc.pass);
                    }}
                    activeOpacity={0.8}
                  >
                    <View style={styles.demoTopRow}>
                      <View style={styles.roleTitleRow}>
                        <View style={[styles.roleIconCircle, { backgroundColor: `${acc.color}22` }]}>
                          <MaterialCommunityIcons name={acc.icon} size={16} color={acc.color} />
                        </View>
                        <Text style={[styles.demoRoleTitle, { color: acc.color }]}>
                          {acc.label}
                        </Text>
                      </View>
                      {isCurrent && (
                        <View style={[styles.selectedPill, { backgroundColor: acc.color }]}>
                          <Text style={styles.selectedPillText}>SELECTED</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.demoMeta}>
                      ID: <Text style={styles.demoHighlight}>{acc.identifier}</Text>
                    </Text>
                    <Text style={styles.demoDesc}>{acc.desc}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <View style={styles.footerRow}>
              <MaterialCommunityIcons name="shield-check-outline" size={14} color={Colors.gray200} />
              <Text style={styles.footerText}>Bank-Grade 256-Bit Encrypted</Text>
            </View>
          </View>
        </FadeInView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default Login;
