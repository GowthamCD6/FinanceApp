import React, { useState, useEffect, useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { apiService } from '../../services/apiService';
import { formatINR } from '../../utils/helpers';

/**
 * --------------------------------------------------------------------------
 * 1. EDIT LOAN MODAL (REACT NATIVE)
 * --------------------------------------------------------------------------
 */
export const EditLoanModal = ({
  visible,
  onClose,
  loan,
  customer,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    principal: '10000',
    interest_rate: '12.5',
    total_installments: '10',
    repayment_frequency: 'WEEKLY',
    collection_mode: 'NORMAL',
    disbursement_date: new Date().toISOString().slice(0, 10),
    notes: '',
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (loan && visible) {
      const principal = loan.principal_amount || loan.principal || 10000;
      const rate = loan.interest_rate != null ? loan.interest_rate : 12.5;
      const tenure = loan.total_installments || loan.tenure_weeks || loan.tenure_days || loan.tenure_months || 10;
      const freq = loan.repayment_frequency || (loan.type === 'DAILY' ? 'DAILY' : loan.type === 'MONTHLY' ? 'MONTHLY' : 'WEEKLY');
      const mode = loan.collection_mode || customer?.collection_mode || 'NORMAL';
      const disbDate = loan.disbursement_date || loan.issue_date || loan.application_date || new Date().toISOString().slice(0, 10);
      const notes = loan.notes || loan.description || '';

      setFormData({
        principal: String(principal),
        interest_rate: String(rate),
        total_installments: String(tenure),
        repayment_frequency: freq,
        collection_mode: mode,
        disbursement_date: typeof disbDate === 'string' ? disbDate.slice(0, 10) : new Date().toISOString().slice(0, 10),
        notes,
      });
      setError('');
    }
  }, [loan, customer, visible]);

  // Real-time Financial Calculations
  const calculations = useMemo(() => {
    const p = parseFloat(formData.principal) || 0;
    const r = parseFloat(formData.interest_rate) || 0;
    const t = parseInt(formData.total_installments, 10) || 1;
    const contractedIncome = Math.round(((p * r) / 100) * 100) / 100;
    const totalRepayable = p + contractedIncome;
    const emi = t > 0 ? Math.round(totalRepayable / t) : 0;

    let maturityDate = '';
    if (formData.disbursement_date) {
      try {
        const d = new Date(formData.disbursement_date);
        const daysInterval = formData.repayment_frequency === 'DAILY' ? 1 : (formData.repayment_frequency === 'MONTHLY' ? 30 : 7);
        d.setDate(d.getDate() + t * daysInterval);
        maturityDate = d.toISOString().slice(0, 10);
      } catch (e) {
        maturityDate = '';
      }
    }

    return {
      principal: p,
      interestRate: r,
      tenure: t,
      contractedIncome,
      totalRepayable,
      emi,
      maturityDate,
    };
  }, [formData]);

  const handleSubmit = async () => {
    if (!loan) return;
    setError('');

    const p = parseFloat(formData.principal);
    if (isNaN(p) || p <= 0) {
      setError('Please enter a valid principal amount.');
      return;
    }

    const t = parseInt(formData.total_installments, 10);
    if (isNaN(t) || t <= 0) {
      setError('Please enter a valid tenure/installment count.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        principalAmount: p,
        interestRate: parseFloat(formData.interest_rate) || 0,
        totalInstallments: t,
        repayment_frequency: formData.repayment_frequency,
        collection_mode: formData.collection_mode,
        disbursement_date: formData.disbursement_date,
        notes: formData.notes,
      };

      const res = await apiService.updateLoan(loan.id, payload);
      Alert.alert('Loan Updated', 'The loan terms and schedules have been recalculated.');
      if (onSuccess) {
        onSuccess(res?.data || res || { ...loan, ...payload });
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update loan details.');
    } finally {
      setSaving(false);
    }
  };

  if (!visible || !loan) return null;

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.headerLeft}>
              <View style={styles.iconCircle}>
                <MaterialCommunityIcons name="pencil" size={20} color="#6B46C1" />
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={styles.modalTitle}>Edit Loan</Text>
                  <View style={styles.loanBadge}>
                    <Text style={styles.loanBadgeText}>
                      {loan.loan_number || `ID #${loan.id}`}
                    </Text>
                  </View>
                </View>
                <Text style={styles.modalSubtitle} numberOfLines={1}>
                  Borrower: {customer?.name || customer?.full_name || customer?.owner_name || 'Borrower'}
                </Text>
              </View>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
              <MaterialCommunityIcons name="close" size={18} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            {error ? (
              <View style={styles.errorBanner}>
                <MaterialCommunityIcons name="alert-circle-outline" size={16} color="#BE123C" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* Repayment Collection Mode Segment */}
            <Text style={styles.fieldLabel}>Repayment Collection Mode</Text>
            <View style={styles.modeContainer}>
              <TouchableOpacity
                style={[
                  styles.modeCard,
                  formData.collection_mode === 'NORMAL' && styles.modeCardSelected,
                ]}
                onPress={() => setFormData((prev) => ({ ...prev, collection_mode: 'NORMAL' }))}
                activeOpacity={0.8}
              >
                <View style={styles.modeCardHeader}>
                  <MaterialCommunityIcons
                    name={formData.collection_mode === 'NORMAL' ? 'check-circle' : 'circle-outline'}
                    size={16}
                    color={formData.collection_mode === 'NORMAL' ? '#6B46C1' : '#9CA3AF'}
                  />
                  <Text style={[styles.modeCardTitle, formData.collection_mode === 'NORMAL' && { color: '#6B46C1' }]}>
                    Normal Dues
                  </Text>
                </View>
                <Text style={styles.modeCardDesc}>
                  Regular daily/weekly/monthly installments.
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modeCard,
                  formData.collection_mode === 'LUMP_SUM_END' && styles.modeCardPurpleSelected,
                ]}
                onPress={() => setFormData((prev) => ({ ...prev, collection_mode: 'LUMP_SUM_END' }))}
                activeOpacity={0.8}
              >
                <View style={styles.modeCardHeader}>
                  <MaterialCommunityIcons
                    name={formData.collection_mode === 'LUMP_SUM_END' ? 'target' : 'circle-outline'}
                    size={16}
                    color={formData.collection_mode === 'LUMP_SUM_END' ? '#7C3AED' : '#9CA3AF'}
                  />
                  <Text style={[styles.modeCardTitle, formData.collection_mode === 'LUMP_SUM_END' && { color: '#7C3AED' }]}>
                    At Maturity
                  </Text>
                </View>
                <Text style={styles.modeCardDesc}>
                  Zero periodic dues; full balance paid at end.
                </Text>
              </TouchableOpacity>
            </View>

            {/* Row: Principal Amount & Interest Rate */}
            <View style={styles.inputRow}>
              <View style={styles.inputCol}>
                <Text style={styles.fieldLabel}>Principal Amount (₹)</Text>
                <TextInput
                  style={styles.textInput}
                  keyboardType="numeric"
                  value={formData.principal}
                  onChangeText={(val) => setFormData((prev) => ({ ...prev, principal: val }))}
                  placeholder="10000"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={styles.inputCol}>
                <Text style={styles.fieldLabel}>Interest Rate (%)</Text>
                <TextInput
                  style={styles.textInput}
                  keyboardType="numeric"
                  value={formData.interest_rate}
                  onChangeText={(val) => setFormData((prev) => ({ ...prev, interest_rate: val }))}
                  placeholder="12.5"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>

            {/* Row: Tenure & Disbursement Date */}
            <View style={styles.inputRow}>
              <View style={styles.inputCol}>
                <Text style={styles.fieldLabel}>
                  Tenure ({formData.repayment_frequency === 'DAILY' ? 'Days' : formData.repayment_frequency === 'MONTHLY' ? 'Months' : 'Weeks'})
                </Text>
                <TextInput
                  style={styles.textInput}
                  keyboardType="numeric"
                  value={formData.total_installments}
                  onChangeText={(val) => setFormData((prev) => ({ ...prev, total_installments: val }))}
                  placeholder="10"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={styles.inputCol}>
                <Text style={styles.fieldLabel}>Disbursement Date</Text>
                <TextInput
                  style={styles.textInput}
                  value={formData.disbursement_date}
                  onChangeText={(val) => setFormData((prev) => ({ ...prev, disbursement_date: val }))}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>

            {/* Notes */}
            <Text style={styles.fieldLabel}>Notes / Purpose (Optional)</Text>
            <TextInput
              style={styles.textInput}
              value={formData.notes}
              onChangeText={(val) => setFormData((prev) => ({ ...prev, notes: val }))}
              placeholder="e.g. Loan term extension"
              placeholderTextColor="#9CA3AF"
            />

            {/* Financial Projection Card */}
            <View style={styles.projectionCard}>
              <View style={styles.projectionHeader}>
                <Text style={styles.projectionTitle}>REPAYMENT PROJECTION</Text>
                <Text style={styles.projectionMaturity}>
                  Matures: {calculations.maturityDate || 'N/A'}
                </Text>
              </View>

              <View style={styles.projectionGrid}>
                <View style={styles.projectionBox}>
                  <Text style={styles.projectionBoxLabel}>Interest Income</Text>
                  <Text style={styles.projectionBoxVal}>
                    {formatINR(calculations.contractedIncome)}
                  </Text>
                </View>
                <View style={styles.projectionBox}>
                  <Text style={styles.projectionBoxLabel}>Total Repayable</Text>
                  <Text style={styles.projectionBoxVal}>
                    {formatINR(calculations.totalRepayable)}
                  </Text>
                </View>
                <View style={styles.projectionBox}>
                  <Text style={styles.projectionBoxLabel}>
                    {formData.collection_mode === 'LUMP_SUM_END' ? 'Due at End' : 'Installment Due'}
                  </Text>
                  <Text style={[styles.projectionBoxVal, { color: formData.collection_mode === 'LUMP_SUM_END' ? '#7C3AED' : '#059669' }]}>
                    {formData.collection_mode === 'LUMP_SUM_END' ? formatINR(calculations.totalRepayable) : formatINR(calculations.emi)}
                  </Text>
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Action Footer */}
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={onClose}
              disabled={saving}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.saveBtn}
              onPress={handleSubmit}
              disabled={saving}
              activeOpacity={0.85}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <MaterialCommunityIcons name="check" size={16} color="#FFFFFF" />
                  <Text style={styles.saveBtnText}>Save Changes</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

/**
 * --------------------------------------------------------------------------
 * 2. DELETE LOAN MODAL (REACT NATIVE)
 * --------------------------------------------------------------------------
 */
export const DeleteLoanModal = ({
  visible,
  onClose,
  loan,
  customer,
  onSuccess,
}) => {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async () => {
    if (!loan) return;
    setDeleting(true);
    setError('');

    try {
      await apiService.deleteLoan(loan.id);
      Alert.alert('Loan Deleted', 'The loan record and all generated schedules have been removed.');
      if (onSuccess) {
        onSuccess(loan.id);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to delete loan.');
    } finally {
      setDeleting(false);
    }
  };

  if (!visible || !loan) return null;

  const loanNumber = loan.loan_number || loan.loan_code || `Loan #${loan.id}`;
  const borrowerName = customer?.name || customer?.owner_name || customer?.full_name || loan.customer_name || 'Borrower';
  const principal = loan.principal_amount || loan.principal || 0;
  const remaining = loan.outstanding_amount ?? loan.remaining_balance ?? 0;

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContainer, { borderColor: '#FECDD3' }]}>
          {/* Header */}
          <View style={[styles.modalHeader, { backgroundColor: '#FFF1F2', borderBottomColor: '#FECDD3' }]}>
            <View style={styles.headerLeft}>
              <View style={[styles.iconCircle, { backgroundColor: '#FFE4E6', borderColor: '#FECDD3' }]}>
                <MaterialCommunityIcons name="trash-can-outline" size={20} color="#BE123C" />
              </View>
              <View style={{ marginLeft: 10 }}>
                <Text style={[styles.modalTitle, { color: '#9F1239' }]}>Delete Loan</Text>
                <Text style={[styles.modalSubtitle, { color: '#BE123C' }]}>Permanent deletion confirmation</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
              <MaterialCommunityIcons name="close" size={18} color="#9F1239" />
            </TouchableOpacity>
          </View>

          <View style={styles.modalBody}>
            {error ? (
              <View style={styles.errorBanner}>
                <MaterialCommunityIcons name="alert-circle-outline" size={16} color="#BE123C" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <Text style={styles.deleteConfirmText}>
              Are you sure you want to delete <Text style={{ fontWeight: '800', color: '#BE123C' }}>{loanNumber}</Text> for{' '}
              <Text style={{ fontWeight: '800', color: '#111827' }}>{borrowerName}</Text>?
            </Text>

            {/* Loan Details Box */}
            <View style={styles.deleteSummaryBox}>
              <View style={styles.deleteRow}>
                <Text style={styles.deleteLabel}>Principal Amount:</Text>
                <Text style={styles.deleteVal}>{formatINR(principal)}</Text>
              </View>
              <View style={styles.deleteRow}>
                <Text style={styles.deleteLabel}>Remaining Balance:</Text>
                <Text style={[styles.deleteVal, { color: '#D97706' }]}>{formatINR(remaining)}</Text>
              </View>
              <View style={styles.deleteRow}>
                <Text style={styles.deleteLabel}>Repayment Mode:</Text>
                <Text style={[styles.deleteVal, { color: loan.collection_mode === 'LUMP_SUM_END' ? '#7C3AED' : '#6B46C1' }]}>
                  {loan.collection_mode === 'LUMP_SUM_END' ? 'Target: At Maturity' : 'Normal Installments'}
                </Text>
              </View>
            </View>

            {/* Warning Note */}
            <View style={styles.warningBox}>
              <MaterialCommunityIcons name="alert-outline" size={16} color="#D97706" style={{ marginTop: 2 }} />
              <Text style={styles.warningText}>
                <Text style={{ fontWeight: '800' }}>Warning: </Text>
                This will delete all installment schedules, collection history, and ledger records for this loan.
              </Text>
            </View>
          </View>

          {/* Action Footer */}
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={onClose}
              disabled={deleting}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: '#BE123C' }]}
              onPress={handleDelete}
              disabled={deleting}
              activeOpacity={0.85}
            >
              {deleting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <MaterialCommunityIcons name="trash-can-outline" size={16} color="#FFFFFF" />
                  <Text style={styles.saveBtnText}>Yes, Delete Loan</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  loanBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  loanBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#6B46C1',
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBody: {
    padding: 18,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF1F2',
    borderWidth: 1,
    borderColor: '#FECDD3',
    padding: 10,
    borderRadius: 8,
    marginBottom: 14,
    gap: 8,
  },
  errorText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: '#BE123C',
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  modeContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  modeCard: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 10,
  },
  modeCardSelected: {
    backgroundColor: '#EEF2FF',
    borderColor: '#6B46C1',
    borderWidth: 1.5,
  },
  modeCardPurpleSelected: {
    backgroundColor: '#FAF5FF',
    borderColor: '#7C3AED',
    borderWidth: 1.5,
  },
  modeCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 4,
  },
  modeCardTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1E293B',
  },
  modeCardDesc: {
    fontSize: 10,
    color: '#64748B',
    lineHeight: 14,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  inputCol: {
    flex: 1,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '600',
    marginBottom: 12,
  },
  projectionCard: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 12,
    marginTop: 4,
    marginBottom: 16,
  },
  projectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  projectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
  },
  projectionMaturity: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6B46C1',
  },
  projectionGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  projectionBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
  },
  projectionBoxLabel: {
    fontSize: 9,
    color: '#64748B',
    fontWeight: '700',
    marginBottom: 2,
    textAlign: 'center',
  },
  projectionBoxVal: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  cancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#6B46C1',
    justifyContent: 'center',
  },
  saveBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  deleteConfirmText: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 20,
    marginBottom: 14,
  },
  deleteSummaryBox: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 12,
    gap: 8,
    marginBottom: 14,
  },
  deleteRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deleteLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  deleteVal: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  warningBox: {
    flexDirection: 'row',
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 10,
    padding: 10,
    gap: 8,
    marginBottom: 10,
  },
  warningText: {
    flex: 1,
    fontSize: 11,
    color: '#92400E',
    lineHeight: 16,
  },
});
