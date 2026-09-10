import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import LottieView from 'lottie-react-native';
import Icon from '../../../../components/common/Icon';
import { useApp } from '../../../../context/AppContext';

const ADD_USER_ANIM = require('../../../../animations/Add-user.json');

export const AddUserModal = ({ visible, onClose, onBack, onUserAdded }) => {
  const { addUser, currentOrganization } = useApp();

  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    yearOfBirth: '',
    role: 'user',
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Close / Back handler
  const handleDismiss = () => {
    setFormData({ name: '', phoneNumber: '', yearOfBirth: '', role: 'user' });
    setErrors({});
    if (onClose) onClose();
    if (onBack) onBack();
  };

  // Helpers
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
      newErrors.phoneNumber = 'Enter a valid 10-digit phone number';

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

      // Add user through AppContext
      await addUser({
        name: formData.name.trim(),
        phone: formData.phoneNumber.trim(),
        yearOfBirth: formData.yearOfBirth.trim(),
        role: formData.role === 'admin' ? 'ADMIN' : 'USER',
        type: formData.role === 'admin' ? 'ADMIN' : 'COMMON_CUSTOMER',
        isCustomer: formData.role !== 'admin',
      });

      Alert.alert(
        'Success',
        `User added successfully!\n\nName: ${formData.name}\nPhone: ${formData.phoneNumber}\nYear of Birth: ${formData.yearOfBirth}\nRole: ${formData.role === 'admin' ? 'Admin' : 'User'}`
      );

      setFormData({ name: '', phoneNumber: '', yearOfBirth: '', role: 'user' });
      setErrors({});
      if (onUserAdded) onUserAdded();
      handleDismiss();
    } catch (err) {
      console.error('Error adding user:', err);
      Alert.alert('Error', err?.message || 'Failed to add user. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const content = (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleDismiss} activeOpacity={0.7}>
          <Icon name="arrow-left" size={20} color="#212121" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add New User</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View style={styles.content}>
            {/* Lottie Animation */}
            <View style={styles.animationContainer}>
              <LottieView
                source={ADD_USER_ANIM}
                autoPlay
                loop
                style={styles.animation}
              />
            </View>

            <View style={styles.formContainer}>
              {/* Form Fields */}
              <View style={styles.formSection}>
                <InputField
                  label="User Name"
                  placeholder="Enter user's name"
                  value={formData.name}
                  onChangeText={handleNameChange}
                  icon="account-outline"
                  required
                  error={errors.name}
                />

                <InputField
                  label="Phone Number"
                  placeholder="Enter phone number"
                  value={formData.phoneNumber}
                  onChangeText={handlePhoneChange}
                  icon="phone-outline"
                  keyboardType="phone-pad"
                  maxLength={10}
                  required
                  error={errors.phoneNumber}
                />

                <View style={styles.row}>
                  <View style={[styles.halfWidth, { marginRight: 8 }]}>
                    <InputField
                      label="Year of Birth"
                      placeholder="YYYY"
                      value={formData.yearOfBirth}
                      onChangeText={handleYearChange}
                      icon="calendar-blank-outline"
                      keyboardType="numeric"
                      maxLength={4}
                      required
                      error={errors.yearOfBirth}
                    />
                  </View>
                  <View style={[styles.halfWidth, { marginLeft: 8 }]}>
                    <RoleDropdown
                      label="Role"
                      value={formData.role}
                      onChangeRole={(role) => setFormData((s) => ({ ...s, role }))}
                      icon="shield-account"
                      required
                    />
                  </View>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.createButton, submitting && styles.createButtonDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
          activeOpacity={0.8}
        >
          {submitting ? (
            <Text style={styles.createButtonText}>Adding...</Text>
          ) : (
            <>
              <Icon name="account-plus" size={20} color="#FFFFFF" />
              <Text style={styles.createButtonText}>Add User</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            setFormData({ name: '', phoneNumber: '', yearOfBirth: '', role: 'user' });
            setErrors({});
          }}
          activeOpacity={0.8}
          style={styles.clearButton}
        >
          <Text style={styles.clearButtonText}>Clear Form</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (visible === undefined) {
    return content;
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={handleDismiss}
    >
      {content}
    </Modal>
  );
};

const InputField = ({
  label,
  placeholder,
  value,
  onChangeText,
  icon,
  keyboardType = 'default',
  maxLength,
  required = false,
  error,
}) => (
  <View style={styles.inputContainer}>
    <View style={styles.labelContainer}>
      <Icon name={icon} size={18} color="#212121" />
      <Text style={styles.inputLabel}>
        {label} {required && <Text style={styles.required}>*</Text>}
      </Text>
    </View>
    <TextInput
      style={styles.textInput}
      placeholder={placeholder}
      placeholderTextColor="#999999"
      value={value}
      onChangeText={onChangeText}
      keyboardType={keyboardType}
      maxLength={maxLength}
    />
    {error ? <Text style={styles.errorText}>{error}</Text> : null}
  </View>
);

const RoleDropdown = ({ label, value, onChangeRole, icon, required = false }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const roles = [
    { label: 'User', value: 'user' },
    { label: 'Admin', value: 'admin' },
  ];

  const handleRoleSelect = (roleValue) => {
    onChangeRole(roleValue);
    setDropdownOpen(false);
  };

  return (
    <View style={[styles.inputContainer, { zIndex: 100 }]}>
      <View style={styles.labelContainer}>
        <Icon name={icon} size={18} color="#212121" />
        <Text style={styles.inputLabel}>
          {label} {required && <Text style={styles.required}>*</Text>}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.dropdownContainer}
        onPress={() => setDropdownOpen(!dropdownOpen)}
        activeOpacity={0.8}
      >
        <Text style={styles.dropdownText}>
          {roles.find((role) => role.value === value)?.label || 'Select Role'}
        </Text>
        <Icon
          name={dropdownOpen ? 'chevron-up' : 'chevron-down'}
          size={16}
          color="#666666"
        />
      </TouchableOpacity>

      {dropdownOpen && (
        <View style={styles.dropdownOptions}>
          {roles.map((role) => (
            <TouchableOpacity
              key={role.value}
              style={[
                styles.dropdownOption,
                value === role.value && styles.dropdownOptionSelected,
              ]}
              onPress={() => handleRoleSelect(role.value)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.dropdownOptionText,
                  value === role.value && styles.dropdownOptionTextSelected,
                ]}
              >
                {role.label}
              </Text>
              {value === role.value && (
                <Icon name="check" size={16} color="#007AFF" />
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#212121',
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  animationContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  animation: {
    width: 160,
    height: 160,
  },
  formContainer: {
    paddingBottom: 24,
    marginTop: 0,
  },
  formSection: {
    gap: 20,
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  halfWidth: {
    flex: 1,
  },
  inputContainer: {
    width: '100%',
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#212121',
  },
  required: {
    color: '#EF4444',
    fontSize: 14,
  },
  textInput: {
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 15,
    backgroundColor: '#F5F5F5',
    color: '#212121',
    width: '100%',
    height: 48,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 6,
  },
  dropdownContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
  },
  dropdownText: {
    fontSize: 15,
    color: '#212121',
  },
  dropdownOptions: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginTop: 4,
    zIndex: 1000,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
  },
  dropdownOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  dropdownOptionSelected: {
    backgroundColor: '#F0F8FF',
  },
  dropdownOptionText: {
    fontSize: 15,
    color: '#212121',
  },
  dropdownOptionTextSelected: {
    color: '#007AFF',
    fontWeight: '700',
  },
  buttonContainer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 24,
    gap: 8,
  },
  createButtonDisabled: {
    opacity: 0.6,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  clearButton: {
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 6,
  },
  clearButtonText: {
    color: '#666666',
    fontSize: 15,
    fontWeight: '500',
  },
});

export default AddUserModal;
