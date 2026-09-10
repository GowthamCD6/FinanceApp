import React from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Platform,
} from 'react-native';
import Icon from '../../../components/common/Icon';

export const MoreModal = ({
  visible,
  onClose,
  onAction,
}) => {
  if (!visible) return null;

  const adminActions = [
    {
      id: 'add_user',
      title: 'Add User / Staff',
      description: 'Onboard new borrower, merchant, or staff',
      icon: 'plus',
      iconBg: '#F0FDF4',
      iconColor: '#059669',
    },
    {
      id: 'manage_users',
      title: 'Manage Users & Status',
      description: 'Audit user accounts, KYC, and statuses',
      icon: 'customers',
      iconBg: '#FFFBEB',
      iconColor: '#D97706',
    },
  ];

  const handleItemPress = (actionId) => {
    onClose();
    if (onAction) onAction(actionId);
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity
          style={styles.container}
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Handle bar */}
          <View style={styles.handleBar} />

          {/* Sheet Header */}
          <View style={styles.header}>
            <Text style={styles.sheetTitle}>Quick Operations</Text>
            <Text style={styles.sheetSubtitle}>Fast actions for Admin Operations</Text>
          </View>

          {/* Menu List */}
          <View style={styles.menuList}>
            {adminActions.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.menuItemRow}
                onPress={() => handleItemPress(item.id)}
                activeOpacity={0.7}
              >
                <View style={[styles.menuIconCircle, { backgroundColor: item.iconBg }]}>
                  <Icon name={item.icon} size={18} color={item.iconColor} />
                </View>
                <View style={styles.menuTextWrap}>
                  <Text style={styles.menuTitle}>{item.title}</Text>
                  <Text style={styles.menuDesc}>{item.description}</Text>
                </View>
                <Icon name="arrow-right" size={14} color="#94A3B8" />
              </TouchableOpacity>
            ))}
          </View>

          {/* Circular Close Button at bottom */}
          <TouchableOpacity
            style={styles.xButton}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Icon name="close" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    alignItems: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
  },
  handleBar: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E2E8F0',
    marginBottom: 14,
  },
  header: {
    alignItems: 'center',
    marginBottom: 10,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  sheetSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  menuList: {
    width: '100%',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  menuItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  menuIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  menuTextWrap: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  menuDesc: {
    fontSize: 12,
    color: '#64748B',
  },
  xButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#059669',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 6,
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 6,
  },
});

export default MoreModal;
