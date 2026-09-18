import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Pressable } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Colors from '../../../theme/colors';

const ACTIONS = [
  { id: 'apply_loan',    label: 'Apply for Loan',   icon: 'chart-line',     color: Colors.primary },
  { id: 'make_payment',  label: 'Make a Payment',   icon: 'wallet-outline', color: Colors.success },
  { id: 'contact',       label: 'Contact Support',  icon: 'account-circle', color: Colors.secondaryBlue },
];

export const More = ({ visible, onClose, onAction }) => (
  <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
    <Pressable style={styles.backdrop} onPress={onClose} />
    <View style={styles.sheet}>
      <View style={styles.handle} />
      <Text style={styles.title}>Quick Actions</Text>
      {ACTIONS.map((a) => (
        <TouchableOpacity key={a.id} style={styles.row} onPress={() => onAction && onAction(a.id)} activeOpacity={0.75}>
          <View style={[styles.iconBox, { backgroundColor: a.color + '18' }]}>
            <MaterialCommunityIcons name={a.icon} size={18} color={a.color} />
          </View>
          <Text style={styles.label}>{a.label}</Text>
          <MaterialCommunityIcons name="chevron-right" size={18} color={Colors.gray100} />
        </TouchableOpacity>
      ))}
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.lightGray400,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 18,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.gray800,
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray200,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.gray800,
  },
});

export default More;
