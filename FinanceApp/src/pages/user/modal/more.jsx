import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Pressable } from 'react-native';
import Icon from '../../../components/common/Icon';

const ACTIONS = [
  { id: 'apply_loan',    label: 'Apply for Loan',   iconName: 'reports', color: '#2563EB' },
  { id: 'make_payment',  label: 'Make a Payment',   iconName: 'wallet',  color: '#059669' },
  { id: 'contact',       label: 'Contact Support',  iconName: 'user',    color: '#0EA5E9' },
];

const UserMoreModal = ({ visible, onClose, onAction }) => (
  <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
    <Pressable style={styles.backdrop} onPress={onClose} />
    <View style={styles.sheet}>
      <View style={styles.handle} />
      <Text style={styles.title}>Quick Actions</Text>
      {ACTIONS.map((a) => (
        <TouchableOpacity key={a.id} style={styles.row} onPress={() => onAction && onAction(a.id)} activeOpacity={0.75}>
          <View style={[styles.iconBox, { backgroundColor: a.color + '18' }]}>
            <Icon name={a.iconName} size={18} color={a.color} />
          </View>
          <Text style={styles.label}>{a.label}</Text>
          <Icon name="chevron-right" size={16} color="#94A3B8" />
        </TouchableOpacity>
      ))}
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  backdrop:  { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)' },
  sheet:     { backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  handle:    { width: 40, height: 4, backgroundColor: '#E2E8F0', borderRadius: 2, alignSelf: 'center', marginBottom: 18 },
  title:     { fontSize: 16, fontWeight: '800', color: '#0F172A', marginBottom: 16 },
  row:       { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  iconBox:   { width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  label:     { flex: 1, fontSize: 14, fontWeight: '600', color: '#1E293B' },
});

export default UserMoreModal;
