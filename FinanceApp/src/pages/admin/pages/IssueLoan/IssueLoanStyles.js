import { StyleSheet, Platform } from 'react-native';

export default StyleSheet.create({
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
    backgroundColor: '#FAFAFA',
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 44 : 32,
  },

  // Lottie Animation Hero Header
  animationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 12,
    marginTop: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#6B46C1',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  animation: {
    width: 200,
    height: 200,
  },

  // Borrower Summary Hero Card
  borrowerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  borrowerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F5F3FF',
    borderWidth: 2,
    borderColor: '#DDD6FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 20,
    color: '#6B46C1',
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Bold' : 'Poppins-Bold',
  },
  borrowerName: {
    fontSize: 16,
    color: '#111827',
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Bold' : 'Poppins-Bold',
  },
  borrowerPhoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  borrowerPhone: {
    fontSize: 12,
    color: '#64748B',
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Medium' : 'Poppins-Medium',
  },
  changeBorrowerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F5F3FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DDD6FE',
  },
  changeBorrowerText: {
    fontSize: 11,
    color: '#6B46C1',
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Bold' : 'Poppins-Bold',
  },
  borrowerMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  borrowerMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  borrowerMetaText: {
    fontSize: 12,
    color: '#475569',
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Medium' : 'Poppins-Medium',
  },

  // Borrower Selection Dropdown Card
  borrowerSelectCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#6B46C1',
    marginBottom: 16,
    shadowColor: '#6B46C1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  sectionHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  sectionHeadingTitle: {
    fontSize: 14,
    color: '#111827',
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Bold' : 'Poppins-Bold',
  },
  borrowerSearchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 10,
    gap: 8,
  },
  borrowerSearchInput: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Medium' : 'Poppins-Medium',
    paddingVertical: 0,
  },
  borrowerDropdown: {
    maxHeight: 220,
  },
  borrowerDropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 10,
  },
  borrowerDropdownAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F5F3FF',
    borderWidth: 1,
    borderColor: '#DDD6FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  borrowerDropdownAvatarText: {
    fontSize: 14,
    color: '#6B46C1',
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Bold' : 'Poppins-Bold',
  },
  borrowerDropdownName: {
    fontSize: 14,
    color: '#111827',
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Bold' : 'Poppins-Bold',
  },
  borrowerDropdownSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Regular' : 'Poppins-Regular',
  },

  // Primary Add Loan Trigger Button
  addLoanTriggerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6B46C1',
    borderRadius: 14,
    paddingVertical: 15,
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 16,
    shadowColor: '#6B46C1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  addLoanTriggerBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Bold' : 'Poppins-Bold',
  },

  // Dual Tab Selector (Active vs Completed)
  tabBarContainer: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: 14,
    padding: 4,
    marginBottom: 14,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  tabBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  tabBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Bold' : 'Poppins-Bold',
  },
  tabBtnTextActive: {
    color: '#6B46C1',
  },
  tabCountBadge: {
    backgroundColor: '#CBD5E1',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
  },
  tabCountBadgeActive: {
    backgroundColor: '#F5F3FF',
  },
  tabCountText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#475569',
  },
  tabCountTextActive: {
    color: '#6B46C1',
  },

  // Loan Item Card Styles
  loanItemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    marginBottom: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  loanItemCardOverdue: {
    borderColor: '#FECACA',
    backgroundColor: '#FEF2F2',
  },
  loanItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  loanItemCodeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F5F3FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  loanItemCodeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6B46C1',
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Bold' : 'Poppins-Bold',
  },
  loanStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  loanStatusBadgeActive: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  loanStatusBadgeOverdue: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  loanStatusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Bold' : 'Poppins-Bold',
  },
  loanStatusBadgeTextActive: {
    color: '#059669',
  },
  loanStatusBadgeTextOverdue: {
    color: '#DC2626',
  },
  loanItemGrid: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  loanItemCol: {
    flex: 1,
    alignItems: 'center',
  },
  loanItemColLabel: {
    fontSize: 9,
    color: '#64748B',
    textTransform: 'uppercase',
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Medium' : 'Poppins-Medium',
  },
  loanItemColVal: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111827',
    marginTop: 2,
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Bold' : 'Poppins-Bold',
  },
  loanItemFooterDate: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 8,
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Medium' : 'Poppins-Medium',
  },

  // Empty Loan History Box
  emptyLoanHistory: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 4,
    marginBottom: 16,
  },
  emptyLoanHistoryTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
    marginTop: 8,
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Bold' : 'Poppins-Bold',
  },
  emptyLoanHistorySub: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 17,
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Regular' : 'Poppins-Regular',
  },

  // Inner Allotment Modal Header
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  modalTitle: {
    fontSize: 18,
    color: '#111827',
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Bold' : 'Poppins-Bold',
  },
  modalCloseBtn: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },

  // Scheme / Category Selection (3 Chips)
  divisionContainer: {
    marginBottom: 18,
  },
  divisionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  divisionChip: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    paddingVertical: 12,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divisionChipSelected: {
    backgroundColor: '#F5F3FF',
    borderColor: '#6B46C1',
    shadowColor: '#6B46C1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  divisionChipTitle: {
    fontSize: 12,
    color: '#334155',
    marginTop: 5,
    textAlign: 'center',
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Bold' : 'Poppins-Bold',
  },
  divisionChipTitleSelected: {
    color: '#6B46C1',
  },
  divisionChipRate: {
    fontSize: 10,
    color: '#059669',
    marginTop: 2,
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Bold' : 'Poppins-Bold',
  },

  // Input Groups
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Bold' : 'Poppins-Bold',
  },
  required: {
    color: '#EF4444',
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    height: 48,
    gap: 8,
  },
  inputBoxError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Bold' : 'Poppins-Bold',
    paddingVertical: 0,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 11,
    marginTop: 4,
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Medium' : 'Poppins-Medium',
  },

  // Preset Quick Amount Chips
  presetChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  presetChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  presetChipSelected: {
    backgroundColor: '#F5F3FF',
    borderColor: '#6B46C1',
  },
  presetChipText: {
    fontSize: 11,
    color: '#475569',
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Bold' : 'Poppins-Bold',
  },
  presetChipTextSelected: {
    color: '#6B46C1',
  },

  // Two Column Inputs Row
  twoColumnRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  columnHalf: {
    flex: 1,
  },

  // Live Calculation Breakdown Box
  liveCalculationBox: {
    backgroundColor: '#F5F3FF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#DDD6FE',
    marginBottom: 16,
  },
  calcHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  calcTitle: {
    fontSize: 12,
    color: '#6B46C1',
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Bold' : 'Poppins-Bold',
  },
  calcGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  calcItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  calcLabel: {
    fontSize: 10,
    color: '#64748B',
    textTransform: 'uppercase',
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Medium' : 'Poppins-Medium',
  },
  calcValue: {
    fontSize: 14,
    color: '#111827',
    marginTop: 2,
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Bold' : 'Poppins-Bold',
  },

  // Primary Action Disburse Button
  actionWrap: {
    marginTop: 8,
    marginBottom: 20,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6B46C1',
    borderRadius: 14,
    paddingVertical: 15,
    gap: 8,
    shadowColor: '#6B46C1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  createButtonDisabled: {
    opacity: 0.6,
  },
  createButtonText: {
    fontSize: 15,
    color: '#FFFFFF',
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Bold' : 'Poppins-Bold',
  },
  bottomSpacing: {
    height: 30,
  },
});
