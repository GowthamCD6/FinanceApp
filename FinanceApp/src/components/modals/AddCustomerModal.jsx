import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, Alert, ScrollView } from 'react-native';
import Icon from '../common/Icon';

export const AddCustomerModal = ({ visible, onClose, onAddCustomer }) => {
  if (!visible) return null;

  const [type, setType] = useState('COMMON_CUSTOMER');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [shopName, setShopName] = useState('');
  const [address, setAddress] = useState('');
  const [creditLimit, setCreditLimit] = useState('50000');

  const handleSave = () => {
    if (!name.trim() || !phone.trim()) {
      Alert.alert('Validation Error', 'Full Name and Phone Number are required.');
      return;
    }

    if (onAddCustomer) {
      onAddCustomer({
        full_name: name.trim(),
        name: name.trim(),
        phone: phone.trim(),
        customer_type: type,
        shop_name: type === 'SHOPKEEPER' ? (shopName.trim() || 'Retail Shop') : undefined,
        address: address.trim() || 'Main Road',
        city: 'Ahmedabad',
        credit_limit: parseFloat(creditLimit) || 50000,
        registration_date: new Date().toISOString().slice(0, 10),
      });
    }

    Alert.alert('Borrower Enrolled', `Customer ${name} registered into lending registry.`);
    setName('');
    setPhone('');
    setShopName('');
    setAddress('');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Enroll New Borrower</Text>
              <Text style={styles.sub}>Onboard client into the Central Fund Registry</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Icon name="close" size={16} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.label}>Borrower Classification</Text>
            <View style={styles.typeRow}>
              <TouchableOpacity
                style={[styles.typeBtn, type === 'COMMON_CUSTOMER' && styles.typeBtnActive]}
                onPress={() => setType('COMMON_CUSTOMER')}
                activeOpacity={0.8}
              >
                <View style={styles.typeBtnInner}>
                  <Icon name="user" size={14} color={type === 'COMMON_CUSTOMER' ? '#2563EB' : '#64748B'} />
                  <Text style={[styles.typeBtnText, type === 'COMMON_CUSTOMER' && styles.typeBtnTextActive]}>
                    Regular Client (Weekly)
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.typeBtn, type === 'SHOPKEEPER' && styles.typeBtnActive]}
                onPress={() => setType('SHOPKEEPER')}
                activeOpacity={0.8}
              >
                <View style={styles.typeBtnInner}>
                  <Icon name="shop" size={14} color={type === 'SHOPKEEPER' ? '#2563EB' : '#64748B'} />
                  <Text style={[styles.typeBtnText, type === 'SHOPKEEPER' && styles.typeBtnTextActive]}>
                    Shopkeeper (Daily)
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Full Legal Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Ramesh Patel"
              placeholderTextColor="#94A3B8"
              value={name}
              onChangeText={setName}
            />

            <Text style={styles.label}>Mobile Phone Number *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 9876543210"
              placeholderTextColor="#94A3B8"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />

            {type === 'SHOPKEEPER' && (
              <>
                <Text style={styles.label}>Store / Commercial Business Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Patel General Store"
                  placeholderTextColor="#94A3B8"
                  value={shopName}
                  onChangeText={setShopName}
                />
              </>
            )}

            <Text style={styles.label}>Residential / Shop Address</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Ward 4, Station Road"
              placeholderTextColor="#94A3B8"
              value={address}
              onChangeText={setAddress}
            />

            <Text style={styles.label}>Initial Authorized Credit Limit (₹)</Text>
            <TextInput
              style={styles.input}
              placeholder="50000"
              placeholderTextColor="#94A3B8"
              keyboardType="numeric"
              value={creditLimit}
              onChangeText={setCreditLimit}
            />

            <View style={styles.actions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={onClose} activeOpacity={0.8}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmBtn} onPress={handleSave} activeOpacity={0.8}>
                <Text style={styles.confirmBtnText}>Enroll Borrower</Text>
              </TouchableOpacity>
            </View>
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
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '90%',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
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
    padding: 4,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 5,
    marginTop: 8,
  },
  typeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 6,
  },
  typeBtn: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  typeBtnActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#2563EB',
  },
  typeBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  typeBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  typeBtnTextActive: {
    color: '#2563EB',
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
    color: '#0F172A',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    marginBottom: 4,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
    marginBottom: 16,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  confirmBtn: {
    flex: 1.6,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#2563EB',
    alignItems: 'center',
  },
  confirmBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});

export default AddCustomerModal;
