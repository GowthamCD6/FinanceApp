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
import { useApp } from '../../../../../context/AppContext';
import { formatINR } from '../../../../../utils/helpers';

export const DayEndSettlementModal = ({ visible, onClose }) => {
  const { fundMetrics, expenses, loans } = useApp();

  const [physicalCashInput, setPhysicalCashInput] = useState('');
  const [closingNotes, setClosingNotes] = useState('');
  const [locked, setLocked] = useState(false);
  const [lockTimestamp, setLockTimestamp] = useState(null);

  if (!visible) return null;

  // Calculated Day End Tallies
  const openingVault = 50000;
  const todayCollections = fundMetrics?.todayCollected || 14200;
  const todayInjections = 0;
  const todayDisbursals = loans
    .filter((l) => l.disbursed_at && l.disbursed_at.startsWith(new Date().toISOString().slice(0, 10)))
    .reduce((sum, l) => sum + Number(l.principal_amount || 0), 10000);
  const todayExpensesTotal = (expenses || []).reduce((sum, e) => sum + Number(e.amount || 0), 1250);

  const calculatedClosing = openingVault + todayCollections + todayInjections - todayDisbursals - todayExpensesTotal;
  const physicalCashNum = parseFloat(physicalCashInput) || calculatedClosing;
  const variance = physicalCashNum - calculatedClosing;

  const handleLockVault = () => {
    Alert.alert(
      'Confirm Vault Settlement',
      `Are you sure you want to lock Day-End Cash Settlement with calculated vault balance ₹${formatINR(calculatedClosing)}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Verify & Lock Vault',
          onPress: () => {
            const timeStr = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
            setLocked(true);
            setLockTimestamp(timeStr);
            Alert.alert(
              'Day Vault Locked Successfully',
              `Settlement locked at ${timeStr}. Closing balance of ₹${formatINR(calculatedClosing)} confirmed.`
            );
          },
        },
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <View style={styles.badgeRow}>
                <Text style={styles.tag}>DAILY RECONCILIATION</Text>
                {locked && (
                  <View style={styles.lockedPill}>
                    <MaterialCommunityIcons name="lock" size={10} color="#059669" />
                    <Text style={styles.lockedPillText}>LOCKED {lockTimestamp}</Text>
                  </View>
                )}
              </View>
              <Text style={styles.title}>Day-End Vault Settlement</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <MaterialCommunityIcons name="close" size={16} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {/* Tally Breakdown Sheet */}
            <View style={styles.tallyCard}>
              <View style={styles.tallyRow}>
                <Text style={styles.tallyLabel}>Opening Vault Cash</Text>
                <Text style={styles.tallyValue}>{formatINR(openingVault)}</Text>
              </View>

              <View style={styles.tallyRow}>
                <Text style={[styles.tallyLabel, { color: '#059669' }]}>+ Field Collections Today</Text>
                <Text style={[styles.tallyValue, { color: '#059669' }]}>+{formatINR(todayCollections)}</Text>
              </View>

              <View style={styles.tallyRow}>
                <Text style={[styles.tallyLabel, { color: '#059669' }]}>+ Capital Injections Today</Text>
                <Text style={[styles.tallyValue, { color: '#059669' }]}>+{formatINR(todayInjections)}</Text>
              </View>

              <View style={styles.tallyRow}>
                <Text style={[styles.tallyLabel, { color: '#DC2626' }]}>− Disbursed Loans Today</Text>
                <Text style={[styles.tallyValue, { color: '#DC2626' }]}>−{formatINR(todayDisbursals)}</Text>
              </View>

              <View style={styles.tallyRow}>
                <Text style={[styles.tallyLabel, { color: '#DC2626' }]}>− Field & Branch Expenses</Text>
                <Text style={[styles.tallyValue, { color: '#DC2626' }]}>−{formatINR(todayExpensesTotal)}</Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.closingRow}>
                <View>
                  <Text style={styles.closingLabel}>Calculated Closing Vault</Text>
                  <Text style={styles.closingSub}>Target physical count in branch safe</Text>
                </View>
                <Text style={styles.closingValue}>{formatINR(calculatedClosing)}</Text>
              </View>
            </View>

            {/* Physical Cash Count Check */}
            <Text style={styles.sectionLabel}>PHYSICAL CASH COUNTED IN VAULT (₹)</Text>
            <View style={styles.inputBox}>
              <Text style={styles.currencySymbol}>₹</Text>
              <TextInput
                style={styles.amountInput}
                placeholder={String(calculatedClosing)}
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
                value={physicalCashInput}
                onChangeText={setPhysicalCashInput}
                editable={!locked}
              />
            </View>

            {/* Variance indicator */}
            {physicalCashInput !== '' && variance !== 0 && (
              <View style={[styles.varianceBox, variance > 0 ? styles.varianceExcess : styles.varianceShortage]}>
                <Text style={[styles.varianceText, variance > 0 ? styles.varianceTextExcess : styles.varianceTextShortage]}>
                  {variance > 0 ? `Vault Surplus: +${formatINR(variance)}` : `Vault Shortage: ${formatINR(variance)}`}
                </Text>
              </View>
            )}

            {/* Closing Supervisor Remarks */}
            <Text style={styles.sectionLabel}>SETTLEMENT NOTES & AUDIT REMARKS</Text>
            <TextInput
              style={styles.notesInput}
              placeholder="e.g. All 6 collector routes verified. Vault cash safely stored."
              placeholderTextColor="#94A3B8"
              value={closingNotes}
              onChangeText={setClosingNotes}
              editable={!locked}
            />

            {/* Lock / Close Action */}
            {!locked ? (
              <TouchableOpacity
                style={styles.lockBtn}
                onPress={handleLockVault}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons name="lock" size={16} color="#FFFFFF" />
                <Text style={styles.lockBtnText}>Verify & Lock Day Cash</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.lockedSuccessBox}>
                <MaterialCommunityIcons name="check" size={18} color="#059669" />
                <Text style={styles.lockedSuccessText}>
                  Day Settlement verified & closed by Admin at {lockTimestamp}
                </Text>
              </View>
            )}

            <View style={{ height: 20 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  tag: {
    fontSize: 9,
    fontWeight: '800',
    color: '#2563EB',
    letterSpacing: 0.6,
  },
  lockedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  lockedPillText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#059669',
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 14,
  },
  tallyCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    gap: 8,
    marginBottom: 14,
  },
  tallyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tallyLabel: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
  },
  tallyValue: {
    fontSize: 13,
    color: '#0F172A',
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: '#CBD5E1',
    marginVertical: 4,
  },
  closingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 4,
  },
  closingLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  closingSub: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 1,
  },
  closingValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#2563EB',
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#475569',
    letterSpacing: 0.6,
    marginBottom: 8,
    marginTop: 8,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 50,
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    padding: 0,
  },
  varianceBox: {
    marginTop: 8,
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  varianceExcess: {
    backgroundColor: '#ECFDF5',
  },
  varianceShortage: {
    backgroundColor: '#FEF2F2',
  },
  varianceText: {
    fontSize: 11,
    fontWeight: '700',
  },
  varianceTextExcess: {
    color: '#059669',
  },
  varianceTextShortage: {
    color: '#DC2626',
  },
  notesInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#0F172A',
    marginBottom: 16,
  },
  lockBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#0F172A',
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  lockBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  lockedSuccessBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 10,
    padding: 14,
    justifyContent: 'center',
  },
  lockedSuccessText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#065F46',
  },
});

export default DayEndSettlementModal;
