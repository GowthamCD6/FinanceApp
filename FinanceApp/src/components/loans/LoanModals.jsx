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
  StatusBar,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Header from '../HeaderComponent/Header';
import { apiService } from '../../services/apiService';
import { formatINR } from '../../utils/helpers';

/**
 * --------------------------------------------------------------------------
 * 1. EDIT LOAN MODAL (MATCHING ADD USER PAGE UI & LAST DATE COLLECTION)
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

  const borrowerName = customer?.name || customer?.full_name || customer?.owner_name || loan.customer_name || 'Borrower';
  const loanNumber = loan.loan_number || loan.loan_code || `Loan #${loan.id}`;

  return (
    <Modal
      animationType="slide"
      visible={visible}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
        <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />

        {/* Clean Standard Header as in Add User */}
        <Header
          title="Edit Loan Details"
          onBack={onClose}
          showBackButton={true}
          rightComponent={
            <View style={styles.loanBadge}>
              <Text style={styles.loanBadgeText}>{loanNumber}</Text>
            </View>
          }
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.container}
        >
          <ScrollView
            style={styles.scrollContainer}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Borrower Profile Overview Banner */}
            <View style={styles.borrowerCard}>
              <View style={styles.borrowerAvatar}>
                <Text style={styles.borrowerAvatarText}>
                  {borrowerName.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.borrowerName} numberOfLines={1}>{borrowerName}</Text>
                <Text style={styles.borrowerPhone}>
                  {customer?.phone || loan.customer_phone || 'Borrower Account'}
                </Text>
              </View>
              <View style={styles.frequencyPill}>
                <Text style={styles.frequencyPillText}>
                  {formData.repayment_frequency}
                </Text>
              </View>
            </View>

            {error ? (
              <View style={styles.errorBanner}>
                <MaterialCommunityIcons name="alert-circle-outline" size={16} color="#DC2626" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* Repayment Collection Mode Division Chips (Add User Style) */}
            <View style={styles.formSection}>
              <View style={styles.sectionHeadingRow}>
                <MaterialCommunityIcons name="swap-horizontal-circle-outline" size={18} color="#6B46C1" />
                <Text style={styles.sectionHeading}>Repayment Collection Mode</Text>
              </View>

              <View style={styles.divisionRow}>
                {/* Mode 1: Normal Installments */}
                <TouchableOpacity
                  style={[
                    styles.divisionChip,
                    formData.collection_mode === 'NORMAL' && styles.divisionChipSelected,
                  ]}
                  onPress={() => setFormData((prev) => ({ ...prev, collection_mode: 'NORMAL' }))}
                  activeOpacity={0.8}
                >
                  <MaterialCommunityIcons
                    name={formData.collection_mode === 'NORMAL' ? 'check-circle' : 'calendar-clock'}
                    size={22}
                    color={formData.collection_mode === 'NORMAL' ? '#6B46C1' : '#64748B'}
                  />
                  <Text
                    style={[
                      styles.divisionChipTitle,
                      formData.collection_mode === 'NORMAL' && styles.divisionChipTitleSelected,
                    ]}
                  >
                    Normal Installments
                  </Text>
                  <Text style={styles.divisionChipSubtitle}>
                    Regular scheduled dues throughout tenure
                  </Text>
                </TouchableOpacity>

                {/* Mode 2: Get Amount at Last Date */}
                <TouchableOpacity
                  style={[
                    styles.divisionChip,
                    formData.collection_mode === 'LUMP_SUM_END' && styles.divisionChipSelected,
                  ]}
                  onPress={() => setFormData((prev) => ({ ...prev, collection_mode: 'LUMP_SUM_END' }))}
                  activeOpacity={0.8}
                >
                  <MaterialCommunityIcons
                    name={formData.collection_mode === 'LUMP_SUM_END' ? 'check-circle' : 'target'}
                    size={22}
                    color={formData.collection_mode === 'LUMP_SUM_END' ? '#6B46C1' : '#64748B'}
                  />
                  <Text
                    style={[
                      styles.divisionChipTitle,
                      formData.collection_mode === 'LUMP_SUM_END' && styles.divisionChipTitleSelected,
                    ]}
                  >
                    Get Amount at Last Date
                  </Text>
                  <Text style={styles.divisionChipSubtitle}>
                    Total balance collected on final maturity date
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Loan Specifications Form (Add User Input Style) */}
            <View style={styles.formSection}>
              <View style={styles.sectionHeadingRow}>
                <MaterialCommunityIcons name="clipboard-edit-outline" size={18} color="#6B46C1" />
                <Text style={styles.sectionHeading}>Loan Specifications</Text>
              </View>

              {/* Row 1: Principal Amount & Interest Rate */}
              <View style={styles.rowTwoInputs}>
                <View style={[styles.inputContainer, { flex: 1 }]}>
                  <View style={styles.labelContainer}>
                    <Text style={styles.inputLabel}>
                      Principal Amount (₹) <Text style={styles.requiredStar}>*</Text>
                    </Text>
                  </View>
                  <TextInput
                    style={styles.textInput}
                    keyboardType="numeric"
                    value={formData.principal}
                    onChangeText={(val) => setFormData((prev) => ({ ...prev, principal: val }))}
                    placeholder="10000"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>

                <View style={[styles.inputContainer, { flex: 1 }]}>
                  <View style={styles.labelContainer}>
                    <Text style={styles.inputLabel}>
                      Interest Rate (%) <Text style={styles.requiredStar}>*</Text>
                    </Text>
                  </View>
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

              {/* Row 2: Tenure & Disbursement Date */}
              <View style={styles.rowTwoInputs}>
                <View style={[styles.inputContainer, { flex: 1 }]}>
                  <View style={styles.labelContainer}>
                    <Text style={styles.inputLabel}>
                      Tenure ({formData.repayment_frequency === 'DAILY' ? 'Days' : formData.repayment_frequency === 'MONTHLY' ? 'Months' : 'Weeks'}) <Text style={styles.requiredStar}>*</Text>
                    </Text>
                  </View>
                  <TextInput
                    style={styles.textInput}
                    keyboardType="numeric"
                    value={formData.total_installments}
                    onChangeText={(val) => setFormData((prev) => ({ ...prev, total_installments: val }))}
                    placeholder="10"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>

                <View style={[styles.inputContainer, { flex: 1 }]}>
                  <View style={styles.labelContainer}>
                    <Text style={styles.inputLabel}>
                      Start / Disb. Date <Text style={styles.requiredStar}>*</Text>
                    </Text>
                  </View>
                  <TextInput
                    style={styles.textInput}
                    value={formData.disbursement_date}
                    onChangeText={(val) => setFormData((prev) => ({ ...prev, disbursement_date: val }))}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              </View>

              {/* Purpose / Notes */}
              <View style={styles.inputContainer}>
                <View style={styles.labelContainer}>
                  <Text style={styles.inputLabel}>Loan Purpose / Notes (Optional)</Text>
                </View>
                <TextInput
                  style={styles.textInput}
                  value={formData.notes}
                  onChangeText={(val) => setFormData((prev) => ({ ...prev, notes: val }))}
                  placeholder="e.g. Business expansion credit line"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>

            {/* Repayment Calculation Preview Box (Add User PreviewBox Style) */}
            <View style={styles.previewBox}>
              <View style={styles.previewHeader}>
                <MaterialCommunityIcons name="calculator-variant-outline" size={16} color="#6B46C1" />
                <Text style={styles.previewTitle}>LOAN CALCULATION SUMMARY</Text>
                <View style={styles.maturityBadge}>
                  <Text style={styles.maturityBadgeText}>
                    Matures: {calculations.maturityDate || 'N/A'}
                  </Text>
                </View>
              </View>

              <View style={styles.previewGrid}>
                <View style={styles.previewItem}>
                  <Text style={styles.previewLabel}>INTEREST INCOME</Text>
                  <Text style={styles.previewValue}>{formatINR(calculations.contractedIncome)}</Text>
                </View>

                <View style={styles.previewItem}>
                  <Text style={styles.previewLabel}>TOTAL REPAYABLE</Text>
                  <Text style={styles.previewValue}>{formatINR(calculations.totalRepayable)}</Text>
                </View>

                <View style={[styles.previewItem, formData.collection_mode === 'LUMP_SUM_END' && styles.previewHighlight]}>
                  <Text style={[styles.previewLabel, formData.collection_mode === 'LUMP_SUM_END' && { color: '#6B46C1' }]}>
                    {formData.collection_mode === 'LUMP_SUM_END' ? 'DUE AT LAST DATE' : 'INSTALLMENT DUE'}
                  </Text>
                  <Text
                    style={[
                      styles.previewValue,
                      formData.collection_mode === 'LUMP_SUM_END' ? styles.previewValueHighlight : { color: '#059669' },
                    ]}
                  >
                    {formData.collection_mode === 'LUMP_SUM_END'
                      ? formatINR(calculations.totalRepayable)
                      : formatINR(calculations.emi)}
                  </Text>
                </View>
              </View>

              {formData.collection_mode === 'LUMP_SUM_END' && (
                <View style={styles.lumpSumNotice}>
                  <MaterialCommunityIcons name="target" size={15} color="#6B46C1" />
                  <Text style={styles.lumpSumNoticeText}>
                    Zero periodic dues during the tenure. The full loan amount of{' '}
                    <Text style={{ fontWeight: '800' }}>{formatINR(calculations.totalRepayable)}</Text> will be collected on the last maturity date ({calculations.maturityDate}).
                  </Text>
                </View>
              )}
            </View>

            {/* Primary Submit Button as in Add User */}
            <View style={styles.actionWrap}>
              <TouchableOpacity
                style={[styles.createButton, saving && styles.createButtonDisabled]}
                onPress={handleSubmit}
                disabled={saving}
                activeOpacity={0.85}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <MaterialCommunityIcons name="check" size={20} color="#FFFFFF" />
                    <Text style={styles.createButtonText}>Save Changes</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelLink}
                onPress={onClose}
                disabled={saving}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelLinkText}>Cancel and return</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.bottomSpacing} />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
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
      <View style={styles.deleteOverlay}>
        <View style={styles.deleteCard}>
          {/* Header */}
          <View style={styles.deleteHeader}>
            <View style={styles.deleteIconCircle}>
              <MaterialCommunityIcons name="trash-can-outline" size={22} color="#DC2626" />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.deleteTitle}>Delete Loan</Text>
              <Text style={styles.deleteSubtitle}>Permanent deletion confirmation</Text>
            </View>
            <TouchableOpacity style={styles.deleteCloseBtn} onPress={onClose} activeOpacity={0.7}>
              <MaterialCommunityIcons name="close" size={18} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <View style={styles.deleteBody}>
            {error ? (
              <View style={styles.errorBanner}>
                <MaterialCommunityIcons name="alert-circle-outline" size={16} color="#DC2626" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <Text style={styles.deletePromptText}>
              Are you sure you want to delete <Text style={{ fontFamily: Platform.OS === 'android' ? 'Gilroy-Bold' : 'Poppins-Bold', color: '#DC2626' }}>{loanNumber}</Text> for{' '}
              <Text style={{ fontFamily: Platform.OS === 'android' ? 'Gilroy-Bold' : 'Poppins-Bold', color: '#111827' }}>{borrowerName}</Text>?
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
                <Text style={[styles.deleteVal, { color: loan.collection_mode === 'LUMP_SUM_END' ? '#6B46C1' : '#334155' }]}>
                  {loan.collection_mode === 'LUMP_SUM_END' ? '🎯 Get Amount at Last Date' : 'Normal Installments'}
                </Text>
              </View>
            </View>

            {/* Warning Note */}
            <View style={styles.deleteWarningBox}>
              <MaterialCommunityIcons name="alert-outline" size={16} color="#D97706" style={{ marginTop: 2 }} />
              <Text style={styles.deleteWarningText}>
                <Text style={{ fontFamily: Platform.OS === 'android' ? 'Gilroy-Bold' : 'Poppins-Bold' }}>Warning: </Text>
                This will delete all installment schedules, collection history, and ledger records for this loan.
              </Text>
            </View>

            {/* Actions */}
            <View style={styles.deleteActions}>
              <TouchableOpacity
                style={styles.deleteCancelBtn}
                onPress={onClose}
                disabled={deleting}
                activeOpacity={0.7}
              >
                <Text style={styles.deleteCancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.deleteSubmitBtn}
                onPress={handleDelete}
                disabled={deleting}
                activeOpacity={0.85}
              >
                {deleting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <MaterialCommunityIcons name="trash-can-outline" size={16} color="#FFFFFF" />
                    <Text style={styles.deleteSubmitBtnText}>Yes, Delete</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  // Full-screen Modal Container matching Add User
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 44 : 32,
  },

  // Borrower Profile Card
  borrowerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    padding: 14,
    marginBottom: 20,
  },
  borrowerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#6B46C1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  borrowerAvatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Bold' : 'Poppins-Bold',
  },
  borrowerName: {
    fontSize: 16,
    color: '#212121',
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Bold' : 'Poppins-Bold',
  },
  borrowerPhone: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Medium' : 'Poppins-Medium',
  },
  frequencyPill: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  frequencyPillText: {
    fontSize: 11,
    color: '#6B46C1',
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Bold' : 'Poppins-Bold',
  },
  loanBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  loanBadgeText: {
    fontSize: 11,
    color: '#6B46C1',
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Bold' : 'Poppins-Bold',
  },

  // Form Sections
  formSection: {
    marginBottom: 20,
  },
  sectionHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionHeading: {
    fontSize: 15,
    color: '#212121',
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Bold' : 'Poppins-Bold',
  },

  // Mode Selection Chips (Exact Add User divisionChip Pattern)
  divisionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  divisionChip: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divisionChipSelected: {
    backgroundColor: '#F5F3FF',
    borderColor: '#6B46C1',
  },
  divisionChipTitle: {
    fontSize: 12,
    color: '#334155',
    marginTop: 8,
    textAlign: 'center',
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Bold' : 'Poppins-Bold',
  },
  divisionChipTitleSelected: {
    color: '#6B46C1',
  },
  divisionChipSubtitle: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 4,
    textAlign: 'center',
    lineHeight: 13,
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Medium' : 'Poppins-Medium',
  },

  // Inputs matching Add User
  rowTwoInputs: {
    flexDirection: 'row',
    gap: 12,
  },
  inputContainer: {
    marginBottom: 16,
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 14,
    color: '#212121',
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Bold' : 'Poppins-Bold',
  },
  requiredStar: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '700',
  },
  textInput: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    backgroundColor: '#F5F5F5',
    color: '#212121',
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Bold' : 'Poppins-Bold',
    borderWidth: 1,
    borderColor: 'transparent',
  },

  // Preview Box matching Add User
  previewBox: {
    backgroundColor: '#F5F3FF',
    borderRadius: 14,
    padding: 14,
    marginTop: 4,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#DDD6FE',
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  previewTitle: {
    fontSize: 12,
    color: '#6B46C1',
    marginLeft: 6,
    flex: 1,
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Bold' : 'Poppins-Bold',
  },
  maturityBadge: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  maturityBadgeText: {
    fontSize: 10,
    color: '#6B46C1',
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Bold' : 'Poppins-Bold',
  },
  previewGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  previewItem: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  previewHighlight: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#6B46C1',
  },
  previewLabel: {
    fontSize: 9,
    color: '#64748B',
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Bold' : 'Poppins-Bold',
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  previewValue: {
    fontSize: 13,
    color: '#212121',
    marginTop: 4,
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Bold' : 'Poppins-Bold',
  },
  previewValueHighlight: {
    fontSize: 13,
    color: '#6B46C1',
    marginTop: 4,
    textAlign: 'center',
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Bold' : 'Poppins-Bold',
  },
  lumpSumNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#DDD6FE',
  },
  lumpSumNoticeText: {
    flex: 1,
    fontSize: 11,
    color: '#6B46C1',
    lineHeight: 16,
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Medium' : 'Poppins-Medium',
  },

  // Action Buttons matching Add User
  actionWrap: {
    marginTop: 6,
    marginBottom: Platform.OS === 'ios' ? 28 : 20,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6B46C1',
    borderRadius: 14,
    paddingVertical: 16,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 4,
  },
  createButtonDisabled: {
    opacity: 0.6,
  },
  createButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Bold' : 'Poppins-Bold',
  },
  cancelLink: {
    alignItems: 'center',
    marginTop: 14,
    paddingVertical: 6,
  },
  cancelLinkText: {
    fontSize: 14,
    color: '#64748B',
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Medium' : 'Poppins-Medium',
  },
  bottomSpacing: {
    height: 24,
  },

  // Error Banner
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
    gap: 8,
  },
  errorText: {
    flex: 1,
    fontSize: 12,
    color: '#DC2626',
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Medium' : 'Poppins-Medium',
  },

  // Delete Modal Styles
  deleteOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  deleteCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#FECDD3',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  deleteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFF1F2',
    borderBottomWidth: 1,
    borderBottomColor: '#FECDD3',
  },
  deleteIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FFE4E6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FECDD3',
  },
  deleteTitle: {
    fontSize: 17,
    color: '#9F1239',
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Bold' : 'Poppins-Bold',
  },
  deleteSubtitle: {
    fontSize: 12,
    color: '#BE123C',
    marginTop: 2,
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Medium' : 'Poppins-Medium',
  },
  deleteCloseBtn: {
    padding: 4,
  },
  deleteBody: {
    padding: 18,
  },
  deletePromptText: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 20,
    marginBottom: 14,
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Medium' : 'Poppins-Medium',
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
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Medium' : 'Poppins-Medium',
  },
  deleteVal: {
    fontSize: 13,
    color: '#111827',
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Bold' : 'Poppins-Bold',
  },
  deleteWarningBox: {
    flexDirection: 'row',
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 10,
    padding: 10,
    gap: 8,
    marginBottom: 18,
  },
  deleteWarningText: {
    flex: 1,
    fontSize: 11,
    color: '#92400E',
    lineHeight: 16,
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Regular' : 'Poppins-Regular',
  },
  deleteActions: {
    flexDirection: 'row',
    gap: 10,
  },
  deleteCancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteCancelBtnText: {
    fontSize: 14,
    color: '#475569',
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Bold' : 'Poppins-Bold',
  },
  deleteSubmitBtn: {
    flex: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#DC2626',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 3,
  },
  deleteSubmitBtnText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Bold' : 'Poppins-Bold',
  },
});

export default EditLoanModal;
