import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, Alert, ScrollView } from 'react-native';
import Icon from '../common/Icon';
import { useApp } from '../../context/AppContext';

export const AddUserModal = ({ visible, onClose }) => {
  if (!visible) return null;

  const { addUser, currentOrganization } = useApp();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('COMMON_CUSTOMER');
  const [creditLimit, setCreditLimit] = useState('25000');
  const [occupation, setOccupation] = useState('');
  const [city, setCity] = useState('');

  const roles = [
    { id: 'COMMON_CUSTOMER', label: 'Borrower (Weekly)' },
    { id: 'SHOPKEEPER', label: 'Merchant (Daily)' },
    { id: 'ADMIN', label: 'Branch Admin' },
    { id: 'FIELD_AGENT', label: 'Field Agent' },
  ];

  const handleSave = async () => {
    if (!name.trim() || !phone.trim()) {
      Alert.alert('Validation Error', 'Full Name and Phone Number are required.');
      return;
    }

    try {
      await addUser({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        role: role === 'ADMIN' ? 'ADMIN' : (role === 'FIELD_AGENT' ? 'FIELD_AGENT' : 'USER'),
        type: role,
        creditLimit: parseFloat(creditLimit) || 25000,
        occupation: occupation.trim() || (role === 'SHOPKEEPER' ? 'Retail Merchant' : 'Self-Employed'),
        city: city.trim() || 'Central',
        isCustomer: role === 'COMMON_CUSTOMER' || role === 'SHOPKEEPER',
      });

      Alert.alert('User Enrolled', `${name} registered successfully into ${currentOrganization?.name || 'Organization'}.`);
      setName('');
      setPhone('');
      setEmail('');
      setOccupation('');
      setCity('');
      onClose();
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to onboard user.');
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.header}>
            <View>
              <View style={styles.orgTag}>
                <Text style={styles.orgTagText}>{currentOrganization?.name || 'Apex Finance Ltd'}</Text>
              </View>
              <Text style={styles.title}>Onboard User / Borrower</Text>
              <Text style={styles.sub}>Register client, staff, or field agent to this organization</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Icon name="close" size={16} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Account Role / Category */}
            <Text style={styles.label}>Account Category</Text>
            <View style={styles.roleGrid}>
              {roles.map((r) => (
                <TouchableOpacity
                  key={r.id}
                  style={[styles.roleBtn, role === r.id && styles.roleBtnActive]}
                  onPress={() => setRole(r.id)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.roleBtnText, role === r.id && styles.roleBtnTextActive]}>
                    {r.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Name */}
            <Text style={styles.label}>Full Legal Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Meenakshi Sundaram"
              placeholderTextColor="#94A3B8"
              value={name}
              onChangeText={setName}
            />

            {/* Phone */}
            <Text style={styles.label}>Phone Number *</Text>
            <TextInput
              style={styles.input}
              placeholder="+91 98412 34567"
              placeholderTextColor="#94A3B8"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />

            {/* Email */}
            <Text style={styles.label}>Email Address (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="meenakshi@gmail.com"
              placeholderTextColor="#94A3B8"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />

            {/* Credit Limit (if borrower/merchant) */}
            {(role === 'COMMON_CUSTOMER' || role === 'SHOPKEEPER') && (
              <>
                <Text style={styles.label}>Initial Credit Limit (INR)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="25000"
                  placeholderTextColor="#94A3B8"
                  keyboardType="numeric"
                  value={creditLimit}
                  onChangeText={setCreditLimit}
                />
              </>
            )}

            {/* Occupation */}
            <Text style={styles.label}>Occupation / Trade / Job Title</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Grocery Merchant, Tailor"
              placeholderTextColor="#94A3B8"
              value={occupation}
              onChangeText={setOccupation}
            />

            {/* City */}
            <Text style={styles.label}>City / Locality</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Chennai Central"
              placeholderTextColor="#94A3B8"
              value={city}
              onChangeText={setCity}
            />

            {/* Submit */}
            <TouchableOpacity style={styles.submitBtn} onPress={handleSave} activeOpacity={0.8}>
              <Icon name="plus" size={18} color="#FFFFFF" />
              <Text style={styles.submitBtnText}>Complete Onboarding</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'flex-end',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 36,
    maxHeight: '90%',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 14,
  },
  orgTag: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  orgTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#2563EB',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  sub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
    marginTop: 12,
  },
  roleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  roleBtn: {
    flexBasis: '48%',
    flexGrow: 1,
    paddingVertical: 9,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  roleBtnActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  roleBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    textAlign: 'center',
  },
  roleBtnTextActive: {
    color: '#FFFFFF',
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
  },
  submitBtn: {
    backgroundColor: '#2563EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 24,
    gap: 8,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});

export default AddUserModal;
