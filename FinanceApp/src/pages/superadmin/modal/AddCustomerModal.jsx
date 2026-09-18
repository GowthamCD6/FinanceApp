import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const AddCustomerModal = ({ visible, onClose, onAddCustomer }) => {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [customerType, setCustomerType] = useState('COMMON_CUSTOMER');
  const [shopName, setShopName] = useState('');
  const [address, setAddress] = useState('');
  const [creditLimit, setCreditLimit] = useState('50000');
  const [submitting, setSubmitting] = useState(false);

  if (!visible) return null;

  const handleSubmit = async () => {
    if (!fullName.trim() || !phone.trim()) {
      Alert.alert('Validation Error', 'Full Name and Phone Number are required.');
      return;
    }

    try {
      setSubmitting(true);
      if (onAddCustomer) {
        await onAddCustomer({
          id: `cust-${Date.now()}`,
          name: fullName.trim(),
          full_name: fullName.trim(),
          phone: phone.trim(),
          customer_type: customerType,
          shop_name: customerType === 'SHOPKEEPER' ? shopName.trim() : '',
          address: address.trim() || 'Ahmedabad',
          credit_limit: parseFloat(creditLimit) || 50000,
          status: 'ACTIVE',
          registration_date: new Date().toISOString().split('T')[0],
        });
      }
      setFullName('');
      setPhone('');
      setShopName('');
      setAddress('');
      onClose();
    } catch (err) {
      Alert.alert('Error', err?.message || 'Failed to add customer.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Register New Borrower</Text>
              <Text style={styles.sub}>Create client profile for loan disbursal</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <MaterialCommunityIcons name="close" size={18} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            <Text style={styles.sectionLabel}>CLIENT CATEGORY</Text>
            <View style={styles.typeRow}>
              {[
                { id: 'COMMON_CUSTOMER', label: 'Regular Client', desc: 'Weekly 10-Wk Cycles' },
                { id: 'SHOPKEEPER', label: 'Shopkeeper', desc: 'Daily 25-Day Cycles' },
              ].map((t) => (
                <TouchableOpacity
                  key={t.id}
                  style={[styles.typeCard, customerType === t.id && styles.typeCardActive]}
                  onPress={() => setCustomerType(t.id)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.typeTitle, customerType === t.id && styles.typeTitleActive]}>
                    {t.label}
                  </Text>
                  <Text style={styles.typeDesc}>{t.desc}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.sectionLabel}>FULL NAME *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Ramesh Patel"
              placeholderTextColor="#94A3B8"
              value={fullName}
              onChangeText={setFullName}
            />

            <Text style={styles.sectionLabel}>CONTACT PHONE *</Text>
            <TextInput
              style={styles.input}
              placeholder="+91 98765 43210"
              placeholderTextColor="#94A3B8"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />

            {customerType === 'SHOPKEEPER' && (
              <>
                <Text style={styles.sectionLabel}>SHOP / BUSINESS NAME</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Patel Provision Store"
                  placeholderTextColor="#94A3B8"
                  value={shopName}
                  onChangeText={setShopName}
                />
              </>
            )}

            <Text style={styles.sectionLabel}>RESIDENTIAL / STORE ADDRESS</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Market Yard Road, Ahmedabad"
              placeholderTextColor="#94A3B8"
              value={address}
              onChangeText={setAddress}
            />

            <Text style={styles.sectionLabel}>AUTHORIZED CREDIT LIMIT (₹)</Text>
            <TextInput
              style={styles.input}
              placeholder="50000"
              placeholderTextColor="#94A3B8"
              keyboardType="numeric"
              value={creditLimit}
              onChangeText={setCreditLimit}
            />

            <TouchableOpacity
              style={[styles.submitBtn, submitting && { opacity: 0.6 }]}
              onPress={handleSubmit}
              disabled={submitting}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="account-plus-outline" size={18} color="#FFFFFF" />
              <Text style={styles.submitBtnText}>
                {submitting ? 'Registering...' : 'Register Borrower'}
              </Text>
            </TouchableOpacity>
            <View style={{ height: 20 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.65)', justifyContent: 'flex-end' },
  container: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '88%', paddingBottom: Platform.OS === 'ios' ? 34 : 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 18, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  title: { fontSize: 17, fontWeight: '800', color: '#0F172A' },
  sub: { fontSize: 11, color: '#64748B', marginTop: 2 },
  closeBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' },
  body: { paddingHorizontal: 20, paddingTop: 14 },
  sectionLabel: { fontSize: 10, fontWeight: '800', color: '#475569', letterSpacing: 0.6, marginBottom: 6, marginTop: 10 },
  typeRow: { flexDirection: 'row', gap: 10, marginBottom: 8 },
  typeCard: { flex: 1, padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0', backgroundColor: '#F8FAFC' },
  typeCardActive: { borderColor: '#2563EB', backgroundColor: '#EFF6FF' },
  typeTitle: { fontSize: 12, fontWeight: '800', color: '#334155' },
  typeTitleActive: { color: '#2563EB' },
  typeDesc: { fontSize: 10, color: '#64748B', marginTop: 2 },
  input: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 13, color: '#0F172A' },
  submitBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#2563EB', paddingVertical: 14, borderRadius: 12, marginTop: 16 },
  submitBtnText: { fontSize: 14, fontWeight: '800', color: '#FFFFFF' },
});

export default AddCustomerModal;
