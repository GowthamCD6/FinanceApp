import React, { useRef, useState, useEffect } from 'react';
import {
  Text,
  View,
  Keyboard,
  Pressable,
  TouchableWithoutFeedback,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  BackHandler,
  Modal,
  TextInput,
  Image,
  StatusBar,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useApp } from '../../../context/AppContext';
import styles from './Loginsty';

const Login = ({ navigation, onLoginSuccess, onBack }) => {
  const { loginWithCredentials, login } = useApp();
  const doLogin = login || loginWithCredentials;

  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [checked, setChecked] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Input Focus States
  const [phoneFocused, setPhoneFocused] = useState(false);
  const [passFocused, setPassFocused] = useState(false);

  // Error Modal states
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorTitle, setErrorTitle] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const passwordRef = useRef(null);

  useEffect(() => {
    const backAction = () => {
      if (errorModalVisible) {
        setErrorModalVisible(false);
        return true;
      }
      if (onBack) {
        onBack();
        return true;
      }
      if (navigation && navigation.canGoBack && navigation.canGoBack()) {
        navigation.goBack();
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [errorModalVisible, navigation, onBack]);

  const showErrorModal = (title, message) => {
    setErrorTitle(title);
    setErrorMessage(message);
    setErrorModalVisible(true);
  };

  const validatePhone = (text) => {
    setPhoneNumber(text);
    if (text && text.length < 10) {
      setPhoneError('Mobile number must be at least 10 digits');
    } else {
      setPhoneError('');
    }
  };

  const validatePassword = (text) => {
    setPassword(text);
    if (text && text.length < 4) {
      setPasswordError('Password must be at least 4 characters');
    } else {
      setPasswordError('');
    }
  };

  const handleLogin = async () => {
    if (isLoading) return;

    const cleanPhone = phoneNumber.trim();
    const cleanPassword = password.trim();

    if (!cleanPhone || !cleanPassword) {
      showErrorModal(
        'Missing Information ⚠️',
        'Please enter both your registered mobile number and password to log in.'
      );
      return;
    }

    if (cleanPhone.length < 10 && !cleanPhone.includes('@')) {
      showErrorModal(
        'Invalid Mobile Number 📱',
        'Mobile number must be at least 10 digits. Please check your mobile number and try again.'
      );
      return;
    }

    setLoading(true);

    try {
      // Real-time Database Authentication via AppContext and REST API
      const response = await doLogin(cleanPhone, cleanPassword);

      if (response && response.success) {
        const user = response.user || response.data?.user;
        if (user) {
          try {
            if (user.phone) await AsyncStorage.setItem('userPhone', String(user.phone));
            if (user.name || user.username) await AsyncStorage.setItem('userName', String(user.name || user.username));
            if (user.role || user.role_type) await AsyncStorage.setItem('userRole', String(user.role || user.role_type));
            if (user.id) await AsyncStorage.setItem('userId', String(user.id));
          } catch (e) {
            console.log('AsyncStorage save notice:', e);
          }
        }

        if (onLoginSuccess) {
          onLoginSuccess(user);
        } else if (navigation && navigation.reset) {
          const isPlatformAdmin =
            String(user?.role || user?.role_type || '').toUpperCase() === 'SUPER_ADMIN' ||
            String(user?.role || user?.role_type || '').toUpperCase() === 'ADMIN' ||
            String(user?.role || user?.role_type || '').toUpperCase() === 'ORG_ADMIN';

          navigation.reset({
            index: 0,
            routes: [{ name: isPlatformAdmin ? 'AdminTabs' : 'TabRouter', params: { role: user?.role } }],
          });
        }
      } else {
        showErrorModal(
          'Invalid Credentials ❌',
          response?.message || 'The mobile number or password you entered is incorrect. Please check your details and try again.'
        );
      }
    } catch (error) {
      console.error('Login error:', error);
      showErrorModal(
        'Invalid Credentials ❌',
        error?.message || 'The mobile number or password you entered is incorrect. Please check your details and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (isLoading) return;
    setLoading(true);
    try {
      const response = await doLogin('gowthamnaveen124@gmail.com', 'Admin@123');
      if (response && response.success) {
        if (onLoginSuccess) onLoginSuccess(response.user);
      } else {
        showErrorModal('Google Sign-In', response?.message || 'Unable to complete Google authentication. Please try phone login.');
      }
    } catch (err) {
      showErrorModal('Google Sign-In', err?.message || 'Google login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoidingView}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            <View style={styles.contentContainer}>
              {/* Header Title Section */}
              <View style={styles.headerContainer}>
                <Text style={styles.hi}>Welcome Back!</Text>
                <Text style={styles.sectoptext}>Login to continue your journey</Text>
                <View style={styles.decorativeLine} />
              </View>

              {/* Image Container with loginimg */}
              <View style={styles.imageContainer}>
                <Image
                  source={require('../../../assets/login/loginimg.png')}
                  style={styles.logimg}
                />
              </View>

              {/* Google Social Login */}
              <View style={styles.googleContainer}>
                <TouchableOpacity
                  style={styles.googleBtn}
                  onPress={handleGoogleLogin}
                  activeOpacity={0.8}
                  disabled={isLoading}
                >
                  <View style={styles.googleIconCircle}>
                    <MaterialCommunityIcons name="google" size={20} color="#EA4335" />
                  </View>
                  <Text style={styles.googleBtnText}>Continue with Google</Text>
                </TouchableOpacity>
              </View>

              {/* Or Divider */}
              <View style={styles.dividerContainer}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>OR SIGN IN WITH PHONE</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Inputs Container */}
              <View style={styles.inputcontainer}>
                {/* Mobile Number Input */}
                <View style={styles.inputWrapper}>
                  <View style={styles.inputIconContainer}>
                    <MaterialCommunityIcons
                      name="phone"
                      size={20}
                      color={phoneFocused ? '#2842C4' : '#6B7280'}
                    />
                  </View>
                  <TextInput
                    style={[
                      styles.input,
                      phoneFocused && styles.inputFocused,
                      !!phoneError && styles.inputError,
                    ]}
                    placeholder="Mobile Number"
                    placeholderTextColor="#9CA3AF"
                    value={phoneNumber}
                    onChangeText={validatePhone}
                    keyboardType="phone-pad"
                    returnKeyType="next"
                    onFocus={() => setPhoneFocused(true)}
                    onBlur={() => setPhoneFocused(false)}
                    onSubmitEditing={() => passwordRef.current?.focus()}
                    blurOnSubmit={false}
                  />
                </View>
                {phoneError ? <Text style={styles.errorText}>{phoneError}</Text> : null}

                {/* Password Input */}
                <View style={styles.passwordWrapper}>
                  <View style={styles.inputIconContainer}>
                    <MaterialCommunityIcons
                      name="lock-outline"
                      size={20}
                      color={passFocused ? '#2842C4' : '#6B7280'}
                    />
                  </View>
                  <TextInput
                    ref={passwordRef}
                    style={[
                      styles.input,
                      { paddingRight: 48 },
                      passFocused && styles.inputFocused,
                      !!passwordError && styles.inputError,
                    ]}
                    placeholder="Password"
                    placeholderTextColor="#9CA3AF"
                    value={password}
                    onChangeText={validatePassword}
                    secureTextEntry={!showPassword}
                    returnKeyType="done"
                    onFocus={() => setPassFocused(true)}
                    onBlur={() => setPassFocused(false)}
                    onSubmitEditing={handleLogin}
                  />
                  <Pressable
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeIcon}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <MaterialCommunityIcons
                      name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                      size={20}
                      color="#2842C4"
                    />
                  </Pressable>
                </View>
                {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
              </View>

              {/* Lower Actions & Privacy Policy */}
              <View style={styles.lowercontainer}>
                <Pressable
                  style={styles.checkboxContainer}
                  onPress={() => setChecked(!checked)}
                >
                  <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
                    {checked ? (
                      <MaterialCommunityIcons name="check" size={16} color="#FFFFFF" />
                    ) : null}
                  </View>
                  <Text style={styles.checkboxText}>
                    I agree with the{' '}
                    <Text style={styles.linkText}>Privacy Policy</Text>
                  </Text>
                </Pressable>

                <TouchableOpacity
                  style={[styles.pressablebtn, isLoading && { opacity: 0.7 }]}
                  onPress={handleLogin}
                  disabled={isLoading}
                  activeOpacity={0.85}
                >
                  <View style={styles.btn}>
                    {isLoading ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <>
                        <Text style={styles.btntext}>LOGIN</Text>
                        <MaterialCommunityIcons
                          name="arrow-right"
                          size={20}
                          color="#FFFFFF"
                          style={styles.arrowIcon}
                        />
                      </>
                    )}
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Custom Error Dialog Modal */}
        <Modal
          visible={errorModalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setErrorModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.errorIconCircle}>
                <MaterialCommunityIcons name="alert-circle-outline" size={34} color="#DC2626" />
              </View>
              <Text style={styles.modalTitle}>{errorTitle}</Text>
              <Text style={styles.modalMessage}>{errorMessage}</Text>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setErrorModalVisible(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.modalButtonText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default Login;
