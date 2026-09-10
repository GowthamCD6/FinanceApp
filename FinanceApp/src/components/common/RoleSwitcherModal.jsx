import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from './Icon';

export const RoleSwitcherModal = ({
  visible,
  currentRole,
  onSelectRole,
  onClose,
}) => {
  const roles = [
    {
      id: 'SUPER_ADMIN',
      iconName: 'crown',
      title: 'Super Admin',
      subtitle: 'Executive fund governance, central vault & audit',
      color: '#2563EB',
    },
    {
      id: 'ADMIN',
      iconName: 'shield',
      title: 'Admin (Operations)',
      subtitle: 'Field collections, day-end cash settlement & loans',
      color: '#059669',
    },
    {
      id: 'USER',
      iconName: 'user',
      title: 'Customer (Kumar)',
      subtitle: 'Borrowing summary, schedule & digital receipts',
      color: '#7C3AED',
    },
  ];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.content}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Switch Perspective</Text>
              <Text style={styles.subtitle}>Strictly 3 dedicated role perspectives</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBox}>
              <Icon name="close" size={16} color="#64748B" />
            </TouchableOpacity>
          </View>

          <View style={styles.rolesList}>
            {roles.map((r) => {
              const isSelected = currentRole === r.id;
              return (
                <TouchableOpacity
                  key={r.id}
                  style={[styles.roleCard, isSelected && { borderColor: r.color, backgroundColor: '#EFF6FF' }]}
                  onPress={() => {
                    onSelectRole(r.id);
                    onClose();
                  }}
                  activeOpacity={0.7}
                >
                  <View style={[styles.roleIconBox, { backgroundColor: isSelected ? r.color : '#F1F5F9' }]}>
                    <Icon name={r.iconName} size={18} color={isSelected ? '#FFFFFF' : '#64748B'} />
                  </View>
                  <View style={styles.roleInfo}>
                    <Text style={[styles.roleTitle, isSelected && { color: r.color }]}>
                      {r.title}
                    </Text>
                    <Text style={styles.roleSubtitle}>{r.subtitle}</Text>
                  </View>
                  {isSelected && (
                    <View style={[styles.checkCircle, { backgroundColor: r.color }]}>
                      <Icon name="check" size={12} color="#FFFFFF" />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 20,
    width: '100%',
    maxWidth: 380,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  closeBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rolesList: {
    gap: 10,
    marginBottom: 16,
  },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  roleIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  roleInfo: {
    flex: 1,
  },
  roleTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  roleSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 15,
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  cancelButton: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelText: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '700',
  },
});

export default RoleSwitcherModal;
