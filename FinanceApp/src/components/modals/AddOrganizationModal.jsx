import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, Alert, ScrollView } from 'react-native';
import Icon from '../common/Icon';
import { useApp } from '../../context/AppContext';

export const AddOrganizationModal = ({ visible, onClose }) => {
  if (!visible) return null;

  const { addOrganization } = useApp();
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [plan, setPlan] = useState('PRO');
  const [initialCapital, setInitialCapital] = useState('500000');
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [city, setCity] = useState('');

  const plans = ['PRO', 'ENTERPRISE', 'STARTER'];

  const handleSave = async () => {
    if (!name.trim() || !code.trim()) {
      Alert.alert('Validation Error', 'Organisation Name and unique Org Code are required.');
      return;
    }

    try {
      await addOrganization({
        name: name.trim(),
        code: code.trim().toUpperCase(),
        plan,
        initial_capital: parseFloat(initialCapital) || 500000,
        admin_name: adminName.trim() || 'Branch Admin',
        admin_email: adminEmail.trim() || `${code.toLowerCase()}@fundflow.in`,
        address: city.trim() || 'Main Branch',
      });

      Alert.alert('Organisation Created', `Tenant ${name} (${code.toUpperCase()}) has been provisioned.`);
      setName('');
      setCode('');
      setAdminName('');
      setAdminEmail('');
      setCity('');
      onClose();
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to provision organization.');
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Provision Organisation</Text>
              <Text style={styles.sub}>Register a new tenant company or branch node</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Icon name="close" size={16} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Plan selector */}
            <Text style={styles.label}>Subscription Tier</Text>
            <View style={styles.planRow}>
              {plans.map((p) => (
                <TouchableOpacity
                  key={p}
                  style={[styles.planBtn, plan === p && styles.planBtnActive]}
                  onPress={() => setPlan(p)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.planBtnText, plan === p && styles.planBtnTextActive]}>
                    {p}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Org Name */}
            <Text style={styles.label}>Organisation Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Zenith Credit Corp"
              placeholderTextColor="#94A3B8"
              value={name}
              onChangeText={setName}
            />

            {/* Unique Code */}
            <Text style={styles.label}>Unique Org Code *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. ORG-ZENITH"
              placeholderTextColor="#94A3B8"
              value={code}
              onChangeText={(text) => setCode(text.toUpperCase())}
              autoCapitalize="characters"
            />

            {/* Initial Capital Pool */}
            <Text style={styles.label}>Initial Capital Allocation (INR) *</Text>
            <TextInput
              style={styles.input}
              placeholder="500000"
              placeholderTextColor="#94A3B8"
              keyboardType="numeric"
              value={initialCapital}
              onChangeText={setInitialCapital}
            />

            {/* Admin Name */}
            <Text style={styles.label}>Assigned Branch Admin Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Rajesh Kumar"
              placeholderTextColor="#94A3B8"
              value={adminName}
              onChangeText={setAdminName}
            />

            {/* Admin Email */}
            <Text style={styles.label}>Admin Email</Text>
            <TextInput
              style={styles.input}
              placeholder="admin@tenant.in"
              placeholderTextColor="#94A3B8"
              keyboardType="email-address"
              value={adminEmail}
              onChangeText={setAdminEmail}
            />

            {/* City / Branch Address */}
            <Text style={styles.label}>Branch City / Address</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Madurai, Tamil Nadu"
              placeholderTextColor="#94A3B8"
              value={city}
              onChangeText={setCity}
            />

            {/* Submit */}
            <TouchableOpacity style={styles.submitBtn} onPress={handleSave} activeOpacity={0.8}>
              <Icon name="plus" size={18} color="#FFFFFF" />
              <Text style={styles.submitBtnText}>Provision Organisation</Text>
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
  planRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 4,
  },
  planBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  planBtnActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  planBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  planBtnTextActive: {
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

export default AddOrganizationModal;
