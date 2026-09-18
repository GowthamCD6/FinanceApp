import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import LottieView from 'lottie-react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Header from '../../../../../components/HeaderComponent/Header';
import { useApp } from '../../../../../context/AppContext';
import styles from './AddUsty';
import Colors from '../../../../../theme/colors';

const ADD_USER_ANIM = require('../../../../../animation/Add-user.json');

export const AddU = ({ visible, onClose, onBack, onUserAdded }) => {
  const { addUser } = useApp();

  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    yearOfBirth: '',
    role: 'user',
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleDismiss = () => {
    setFormData({ name: '', phoneNumber: '', yearOfBirth: '', role: 'user' });
    setErrors({});
    if (onClose) onClose();
    if (onBack) onBack();
  };

  const validatePhoneNumber = (phone) => /^[0-9]{10}$/.test((phone || '').trim());
  const validateYear = (year) => {
    const currentYear = new Date().getFullYear();
    const yearNum = parseInt(year, 10);
    return /^\d{4}$/.test(year) && yearNum >= 1900 && yearNum <= currentYear;
  };

  const handleNameChange = (text) => {
    const clean = text.replace(/[<>&'"]/g, '');
    setFormData((s) => ({ ...s, name: clean }));
    if (errors.name) setErrors((e) => ({ ...e, name: '' }));
  };

  const handlePhoneChange = (text) => {
    const clean = text.replace(/[^0-9]/g, '').slice(0, 10);
    setFormData((s) => ({ ...s, phoneNumber: clean }));
    if (errors.phoneNumber) setErrors((e) => ({ ...e, phoneNumber: '' }));
  };

  const handleYearChange = (text) => {
    const clean = text.replace(/[^0-9]/g, '').slice(0, 4);
    setFormData((s) => ({ ...s, yearOfBirth: clean }));
    if (errors.yearOfBirth) setErrors((e) => ({ ...e, yearOfBirth: '' }));
  };

  const handleSubmit = async () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';

    if (!formData.phoneNumber) newErrors.phoneNumber = 'Phone number is required';
    else if (!validatePhoneNumber(formData.phoneNumber))
      newErrors.phoneNumber = 'Enter a 10-digit phone number';

    const currentYr = new Date().getFullYear();
    if (!formData.yearOfBirth) newErrors.yearOfBirth = 'Year of birth is required';
    else if (!validateYear(formData.yearOfBirth))
      newErrors.yearOfBirth = `Enter a valid year (1900-${currentYr})`;

    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }

    try {
      setSubmitting(true);
      await addUser({
        name: formData.name.trim(),
        phone: formData.phoneNumber.trim(),
        yearOfBirth: formData.yearOfBirth.trim(),
        role: formData.role === 'admin' ? 'ADMIN' : 'USER',
        type: formData.role === 'admin' ? 'ADMIN' : 'COMMON_CUSTOMER',
        isCustomer: formData.role !== 'admin',
      });

      Alert.alert('Success', 'User added successfully!');
      setFormData({ name: '', phoneNumber: '', yearOfBirth: '', role: 'user' });
      setErrors({});
      if (onUserAdded) onUserAdded();
      handleDismiss();
    } catch (err) {
      console.error('Error adding user:', err);
      Alert.alert('Error', err?.message || 'Failed to add user.');
    } finally {
      setSubmitting(false);
    }
  };

  const InputField = ({ label, placeholder, value, onChangeText, keyboardType = 'default', error, required = true }) => (
    <View style={styles.inputContainer}>
      <View style={styles.labelContainer}>
        <Text style={styles.inputLabel}>{label}</Text>
        {required && <Text style={styles.required}>*</Text>}
      </View>
      <TextInput
        style={styles.textInput}
        placeholder={placeholder}
        placeholderTextColor={Colors.gray100}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );

  const content = (
    <View style={styles.container}>
      <Header
        title="Add New User"
        onBack={handleDismiss}
        showBackButton={true}
        showDivider={true}
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View style={styles.content}>
            <View style={styles.animationContainer}>
              <LottieView
                source={ADD_USER_ANIM}
                autoPlay
                loop
                style={styles.animation}
              />
            </View>

            <View style={styles.formContainer}>
              <View style={styles.formSection}>
                <InputField
                  label="User Name"
                  placeholder="Enter user's name"
                  value={formData.name}
                  onChangeText={handleNameChange}
                  error={errors.name}
                />
                <InputField
                  label="Phone Number"
                  placeholder="Enter 10-digit number"
                  value={formData.phoneNumber}
                  onChangeText={handlePhoneChange}
                  keyboardType="phone-pad"
                  error={errors.phoneNumber}
                />
                <InputField
                  label="Year of Birth"
                  placeholder="e.g. 1990"
                  value={formData.yearOfBirth}
                  onChangeText={handleYearChange}
                  keyboardType="numeric"
                  error={errors.yearOfBirth}
                />
              </View>
            </View>
          </View>
        </ScrollView>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.createButton, submitting && styles.createButtonDisabled]}
            onPress={handleSubmit}
            disabled={submitting}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="account-plus" size={20} color={Colors.white} />
            <Text style={styles.createButtonText}>
              {submitting ? 'Creating...' : 'Create User'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );

  if (visible !== undefined) {
    return (
      <Modal visible={visible} animationType="slide" onRequestClose={handleDismiss}>
        {content}
      </Modal>
    );
  }

  return content;
};

export default AddU;
