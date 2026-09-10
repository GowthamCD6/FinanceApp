import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
} from 'react-native';
import Icon from '../../../../components/common/Icon';
import { useApp } from '../../../../context/AppContext';

export const AddUserModal = ({ visible, onClose, onUserAdded }) => {
  if (!visible) return null;

  const { addUser, currentOrganization } = useApp();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('COMMON_CUSTOMER');
  const [creditLimit, setCreditLimit] = useState('25000');
  const [occupation, setOccupation] = useState('');
  const [city, setCity] = useState('Triplicane, Chennai');
  const [address, setAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const roles = [
    { id: 'COMMON_CUSTOMER', label: 'Borrower (Weekly)', desc: '10-Week installment loans' },
    { id: 'SHOPKEEPER', label: 'Merchant (Daily)', desc: '25-Day rapid installments' },
    { id: 'FIELD_AGENT', label: 'Field Agent', desc: 'Route collections' },
    { id: 'ADMIN', label: 'Branch Staff', desc: 'Administrative staff' },
  ];

  const handleSave = async () => {
    if (!name.trim() || !phone.trim()) {
      Alert.alert('Validation Error', 'Full Name and Phone Number are required.');
      return;
    }

    setSubmitting(true);
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
        address: address.trim(),
        isCustomer: role === 'COMMON_CUSTOMER' || role === 'SHOPKEEPER',
      });

      Alert.alert('User Enrolled', `${name} registered successfully into ${currentOrganization?.name || 'Organization'}.`);
      setName('');
      setPhone('');
      setEmail('');
      setOccupation('');
      setAddress('');
      if (onUserAdded) onUserAdded();
      onClose();
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to onboard user.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Header */}
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

          <ScrollView style={styles.formScroll} showsVerticalScrollIndicator={false}>
            {/* Category / Role Selector */}
            <Text style={styles.label}>Client Category / Role *</Text>
            <View style={styles.roleGrid}>
              {roles.map((r) => {
                const isSelected = role === r.id;
                return (
                  <TouchableOpacity
                    key={r.id}
                    style={[styles.roleChip, isSelected && styles.roleChipActive]}
                    onPress={() => setRole(r.id)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.roleChipHeader}>
                      <Text style={[styles.roleText, isSelected && styles.roleTextActive]}>
                        {r.label}
                      </Text>
                      {isSelected && <Icon name="check" size={12} color="#2563EB" />}
                    </View>
                    <Text style={[styles.roleDesc, isSelected && styles.roleDescActive]}>
                      {r.desc}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Full Name */}
            <Text style={styles.label}>Full Legal Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Ramesh K"
              placeholderTextColor="#94A3B8"
              value={name}
              onChangeText={setName}
            />

            {/* Phone */}
            <Text style={styles.label}>Primary Phone Number *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 9876543210"
              placeholderTextColor="#94A3B8"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />

            {/* Email */}
            <Text style={styles.label}>Email Address (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. ramesh@gmail.com"
              placeholderTextColor="#94A3B8"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />

            {/* Credit Limit */}
            <Text style={styles.label}>Approved Credit Limit (₹ INR) *</Text>
            <TextInput
              style={styles.input}
              placeholder="25000"
              placeholderTextColor="#94A3B8"
              keyboardType="numeric"
              value={creditLimit}
              onChangeText={setCreditLimit}
            />

            {/* Occupation */}
            <Text style={styles.label}>Occupation / Trade Business</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Retail Grocery Store Owner"
              placeholderTextColor="#94A3B8"
              value={occupation}
              onChangeText={setOccupation}
            />

            {/* City */}
            <Text style={styles.label}>City / Field Territory</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Triplicane, Chennai"
              placeholderTextColor="#94A3B8"
              value={city}
              onChangeText={setCity}
            />

            {/* Address */}
            <Text style={styles.label}>Physical Street / Shop Location</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="e.g. No 28 Bazaar Street, Triplicane, Chennai"
              placeholderTextColor="#94A3B8"
              multiline
              numberOfLines={2}
              value={address}
              onChangeText={setAddress}
            />
          </ScrollView>

          {/* Action Footer */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose} activeOpacity={0.8}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveBtn, submitting && { opacity: 0.6 }]}
              onPress={handleSave}
              disabled={submitting}
              activeOpacity={0.8}
            >
              <Icon name="check" size={16} color="#FFFFFF" />
              <Text style={styles.saveText}>{submitting ? 'Enrolling...' : 'Enroll User'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  orgTag: {
    alignSelf: 'flex-start',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 4,
  },
  orgTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#2563EB',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 17,
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
    backgroundColor: '#F8FAFC',
  },
  formScroll: {
    paddingHorizontal: 20,
    paddingTop: 14,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
    marginTop: 10,
  },
  roleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 6,
  },
  roleChip: {
    width: '48%',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 10,
  },
  roleChipActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#2563EB',
  },
  roleChipHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  roleText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  roleTextActive: {
    color: '#1D4ED8',
  },
  roleDesc: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 2,
  },
  roleDescActive: {
    color: '#3B82F6',
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#0F172A',
  },
  textArea: {
    minHeight: 56,
    textAlignVertical: 'top',
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    marginTop: 10,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  saveBtn: {
    flex: 2,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#059669',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  saveText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default AddUserModal;
