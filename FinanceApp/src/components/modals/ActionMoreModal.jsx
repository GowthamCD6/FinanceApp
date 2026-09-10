import React from 'react';
import { Modal, View, StyleSheet, TouchableOpacity, Text, Platform } from 'react-native';
import Icon from '../common/Icon';

export const ActionMoreModal = ({
  visible,
  onClose,
  currentRole = 'SUPER_ADMIN',
  onAction,
}) => {
  if (!visible) return null;

  const superAdminActions = [
    {
      id: 'add_organization',
      title: 'Register Organisation',
      description: 'Provision new tenant branch or company',
      icon: 'fund',
      iconBg: '#EFF6FF',
      iconColor: '#2563EB',
    },
    {
      id: 'manage_users',
      title: 'Manage Users & Status',
      description: 'Audit user accounts, KYC, and statuses',
      icon: 'customers',
      iconBg: '#FFFBEB',
      iconColor: '#D97706',
    },
    {
      id: 'add_user',
      title: 'Add User / Staff',
      description: 'Onboard new borrower, merchant, or staff',
      icon: 'plus',
      iconBg: '#F0FDF4',
      iconColor: '#059669',
    },
    {
      id: 'disburse_loan',
      title: 'Disburse New Loan',
      description: 'Originate Weekly (10 wk) or Daily (25 d) loan',
      icon: 'loans',
      iconBg: '#EFF6FF',
      iconColor: '#2563EB',
    },
    {
      id: 'add_capital',
      title: 'Inject Capital Equity',
      description: 'Deposit funds into Cash Vault, Bank, or UPI pool',
      icon: 'fund',
      iconBg: '#ECFDF5',
      iconColor: '#059669',
    },
    {
      id: 'add_expense',
      title: 'Record Daily Expense',
      description: 'Log transport, fuel, or office operational expense',
      icon: 'receipt',
      iconBg: '#FEF2F2',
      iconColor: '#DC2626',
    },
  ];

  const adminActions = [
    {
      id: 'manage_users',
      title: 'Manage Users & Status',
      description: 'Audit user accounts, KYC, and statuses',
      icon: 'customers',
      iconBg: '#FFFBEB',
      iconColor: '#D97706',
    },
    {
      id: 'add_user',
      title: 'Add User / Staff',
      description: 'Onboard new borrower, merchant, or staff',
      icon: 'plus',
      iconBg: '#F0FDF4',
      iconColor: '#059669',
    },
    {
      id: 'disburse_loan',
      title: 'Disburse New Loan',
      description: 'Originate Weekly (10 wk) or Daily (25 d) loan',
      icon: 'loans',
      iconBg: '#EFF6FF',
      iconColor: '#2563EB',
    },
    {
      id: 'collect_payment',
      title: 'Collect Installment',
      description: '1-tap field recovery & instant receipt generation',
      icon: 'collections',
      iconBg: '#ECFDF5',
      iconColor: '#059669',
    },
    {
      id: 'day_end_settlement',
      title: 'Day-End Cash Handover',
      description: 'Reconcile field bag and transfer cash to vault',
      icon: 'lock',
      iconBg: '#F0FDF4',
      iconColor: '#059669',
    },
  ];

  const userActions = [
    {
      id: 'pay_due',
      title: 'Pay Next Installment',
      description: 'Instant self-payment via UPI (GPay/PhonePe)',
      icon: 'check',
      iconBg: '#EFF6FF',
      iconColor: '#2563EB',
    },
    {
      id: 'view_schedule',
      title: 'Repayment Schedule',
      description: 'Check upcoming dues and installment timeline',
      icon: 'calendar',
      iconBg: '#FFFBEB',
      iconColor: '#D97706',
    },
    {
      id: 'view_receipts',
      title: 'Payment Receipts',
      description: 'View verified vouchers and download statements',
      icon: 'receipt',
      iconBg: '#ECFDF5',
      iconColor: '#059669',
    },
  ];

  const actions = 
    currentRole === 'SUPER_ADMIN' ? superAdminActions :
    currentRole === 'ADMIN' ? adminActions : userActions;

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
            <Text style={styles.sheetSubtitle}>Fast actions for {currentRole.replace('_', ' ')}</Text>
          </View>

          {/* Menu List */}
          <View style={styles.menuList}>
            {actions.map((item) => (
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
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 6,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 6,
  },
});

export default ActionMoreModal;
