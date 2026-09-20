import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  Switch,
  Alert,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import LottieView from 'lottie-react-native';

const otpAnimation = require('../../../../../animation/OTP-Verification.json');
const exportAnimation = require('../../../../../animation/data-export.json');
const supportAnimation = require('../../../../../animation/Customer_care.json');

// -------------------------------------------------------------
// 1. Notifications Settings Modal
// -------------------------------------------------------------
export const NotificationSettingsModal = ({ visible, onClose }) => {
  const [dailyTarget, setDailyTarget] = useState(true);
  const [overdueAlert, setOverdueAlert] = useState(true);
  const [smsReceipts, setSmsReceipts] = useState(true);
  const [whatsappAlerts, setWhatsappAlerts] = useState(true);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={subStyles.modalOverlay}>
        <View style={subStyles.modalContainer}>
          <View style={subStyles.modalHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <MaterialCommunityIcons name="bell-outline" size={24} color="#D97706" style={{ marginRight: 8 }} />
              <Text style={subStyles.modalTitle}>Notification Preferences</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={subStyles.closeBtn}>
              <MaterialCommunityIcons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={subStyles.subtitleText}>Manage push alerts, collection reminders, and SMS notifications.</Text>

            <View style={subStyles.settingRow}>
              <View style={{ flex: 1 }}>
                <Text style={subStyles.rowTitle}>Morning Collection Targets</Text>
                <Text style={subStyles.rowSub}>Daily 8:00 AM route briefing alert</Text>
              </View>
              <Switch value={dailyTarget} onValueChange={setDailyTarget} trackColor={{ true: '#6B46C1' }} />
            </View>

            <View style={subStyles.settingRow}>
              <View style={{ flex: 1 }}>
                <Text style={subStyles.rowTitle}>Overdue Installment Warnings</Text>
                <Text style={subStyles.rowSub}>Instant alert when an EMI exceeds grace period</Text>
              </View>
              <Switch value={overdueAlert} onValueChange={setOverdueAlert} trackColor={{ true: '#6B46C1' }} />
            </View>

            <View style={subStyles.settingRow}>
              <View style={{ flex: 1 }}>
                <Text style={subStyles.rowTitle}>Borrower SMS Receipts</Text>
                <Text style={subStyles.rowSub}>Send instant SMS receipt on collection</Text>
              </View>
              <Switch value={smsReceipts} onValueChange={setSmsReceipts} trackColor={{ true: '#6B46C1' }} />
            </View>

            <View style={subStyles.settingRow}>
              <View style={{ flex: 1 }}>
                <Text style={subStyles.rowTitle}>WhatsApp Alerts & Ledger</Text>
                <Text style={subStyles.rowSub}>Send digital statements on payment confirmation</Text>
              </View>
              <Switch value={whatsappAlerts} onValueChange={setWhatsappAlerts} trackColor={{ true: '#6B46C1' }} />
            </View>

            <TouchableOpacity style={[subStyles.primaryButton, { marginTop: 24 }]} onPress={onClose}>
              <Text style={subStyles.primaryButtonText}>Save Preferences</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

// -------------------------------------------------------------
// 2. OTP Requests Modal
// -------------------------------------------------------------
export const OTPRequestsModal = ({ visible, onClose }) => {
  const [requests, setRequests] = useState([
    { id: '1', name: 'Murugan Textiles', phone: '+91 98401 22345', purpose: 'Collection PIN Verification', time: '2 mins ago', code: '4928' },
    { id: '2', name: 'Lakshmi Traders', phone: '+91 94440 98112', purpose: 'Loan Disbursement Consent', time: '5 mins ago', code: '8103' },
    { id: '3', name: 'Ravi Groceries', phone: '+91 98840 55678', purpose: 'Profile Update', time: '12 mins ago', code: '6619' },
  ]);

  const handleAction = (id, type) => {
    setRequests(prev => prev.filter(r => r.id !== id));
    Alert.alert(type === 'approve' ? 'OTP Approved' : 'OTP Rejected', `Request #${id} marked as ${type}.`);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={subStyles.modalOverlay}>
        <View style={subStyles.modalContainer}>
          <View style={subStyles.modalHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <MaterialCommunityIcons name="key-chain" size={24} color="#3B82F6" style={{ marginRight: 8 }} />
              <Text style={subStyles.modalTitle}>Pending OTP Requests</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={subStyles.closeBtn}>
              <MaterialCommunityIcons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={{ alignItems: 'center', marginVertical: 8 }}>
              <LottieView
                source={otpAnimation}
                autoPlay
                loop
                style={{ width: 120, height: 120 }}
              />
            </View>
            <Text style={subStyles.subtitleText}>Manage and approve field verification requests in real-time.</Text>
            {requests.length === 0 ? (
              <View style={{ paddingVertical: 40, alignItems: 'center' }}>
                <MaterialCommunityIcons name="check-circle-outline" size={48} color="#10B981" />
                <Text style={{ fontSize: 16, color: '#374151', fontWeight: '600', marginTop: 12 }}>No Pending OTPs</Text>
                <Text style={{ fontSize: 13, color: '#9CA3AF', marginTop: 4 }}>All verification requests are cleared.</Text>
              </View>
            ) : (
              requests.map((r) => (
                <View key={r.id} style={subStyles.otpCard}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <View>
                      <Text style={subStyles.otpName}>{r.name}</Text>
                      <Text style={subStyles.otpPhone}>{r.phone} • {r.time}</Text>
                      <Text style={subStyles.otpPurpose}>{r.purpose}</Text>
                    </View>
                    <View style={subStyles.otpCodeBadge}>
                      <Text style={subStyles.otpCodeText}>{r.code}</Text>
                    </View>
                  </View>
                  <View style={{ flexDirection: 'row', marginTop: 12, gap: 8 }}>
                    <TouchableOpacity
                      style={[subStyles.otpBtn, { backgroundColor: '#10B981' }]}
                      onPress={() => handleAction(r.id, 'approve')}
                    >
                      <Text style={subStyles.otpBtnText}>Approve OTP</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[subStyles.otpBtn, { backgroundColor: '#EF4444' }]}
                      onPress={() => handleAction(r.id, 'reject')}
                    >
                      <Text style={subStyles.otpBtnText}>Reject</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

// -------------------------------------------------------------
// 3. Auction / Loan Settings Modal
// -------------------------------------------------------------
export const AuctionSettingsModal = ({ visible, onClose }) => {
  const [interestRate, setInterestRate] = useState('2.0% Monthly');
  const [dailyTenure, setDailyTenure] = useState('100 Days');
  const [penaltyFee, setPenaltyFee] = useState('₹50 / Day');

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={subStyles.modalOverlay}>
        <View style={subStyles.modalContainer}>
          <View style={subStyles.modalHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <MaterialCommunityIcons name="gavel" size={24} color="#6B46C1" style={{ marginRight: 8 }} />
              <Text style={subStyles.modalTitle}>Auction & Loan Rules</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={subStyles.closeBtn}>
              <MaterialCommunityIcons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={subStyles.subtitleText}>Configure standard micro-lending tenure, interest cap, and penalties.</Text>
            
            <View style={subStyles.inputGroup}>
              <Text style={subStyles.inputLabel}>Default Standard Interest Rate</Text>
              <TextInput
                style={subStyles.textInput}
                value={interestRate}
                onChangeText={setInterestRate}
                placeholder="e.g. 2.0% Monthly"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={subStyles.inputGroup}>
              <Text style={subStyles.inputLabel}>Standard Daily Loan Cycle</Text>
              <TextInput
                style={subStyles.textInput}
                value={dailyTenure}
                onChangeText={setDailyTenure}
                placeholder="e.g. 100 Days"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={subStyles.inputGroup}>
              <Text style={subStyles.inputLabel}>Overdue Late Penalty Slab</Text>
              <TextInput
                style={subStyles.textInput}
                value={penaltyFee}
                onChangeText={setPenaltyFee}
                placeholder="e.g. ₹50 / Day"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <TouchableOpacity
              style={subStyles.primaryButton}
              onPress={() => {
                Alert.alert('Rules Updated', 'Loan disbursement and auction configuration parameters saved.');
                onClose();
              }}
            >
              <Text style={subStyles.primaryButtonText}>Save Rules</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

// -------------------------------------------------------------
// 4. Data Export Modal
// -------------------------------------------------------------
export const DataExportModal = ({ visible, onClose }) => {
  const [exporting, setExporting] = useState(false);

  const handleExport = (type) => {
    setExporting(true);
    setTimeout(() => {
      setExporting(false);
      Alert.alert('Export Complete', `${type} has been generated and saved to your device Downloads.`);
    }, 1200);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={subStyles.modalOverlay}>
        <View style={subStyles.modalContainer}>
          <View style={subStyles.modalHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <MaterialCommunityIcons name="download" size={24} color="#6B46C1" style={{ marginRight: 8 }} />
              <Text style={subStyles.modalTitle}>Data Export & Backup</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={subStyles.closeBtn}>
              <MaterialCommunityIcons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={{ alignItems: 'center', marginVertical: 8 }}>
              <LottieView
                source={exportAnimation}
                autoPlay
                loop
                style={{ width: 120, height: 120 }}
              />
            </View>
            <Text style={subStyles.subtitleText}>Download complete branch statements, loan books, and customer ledgers.</Text>

            <TouchableOpacity
              style={subStyles.exportItem}
              onPress={() => handleExport('Daily Collections Ledger (CSV)')}
            >
              <MaterialCommunityIcons name="file-delimited-outline" size={28} color="#059669" />
              <View style={{ marginLeft: 14, flex: 1 }}>
                <Text style={subStyles.exportItemTitle}>Daily Collections Sheet</Text>
                <Text style={subStyles.exportItemSub}>CSV format with date, officer, borrower and amount</Text>
              </View>
              <MaterialCommunityIcons name="cloud-download-outline" size={22} color="#6B7280" />
            </TouchableOpacity>

            <TouchableOpacity
              style={subStyles.exportItem}
              onPress={() => handleExport('Active Loan Book (Excel)')}
            >
              <MaterialCommunityIcons name="file-excel-box" size={28} color="#2563EB" />
              <View style={{ marginLeft: 14, flex: 1 }}>
                <Text style={subStyles.exportItemTitle}>Active Master Loan Book</Text>
                <Text style={subStyles.exportItemSub}>Comprehensive portfolio breakdown and remaining balances</Text>
              </View>
              <MaterialCommunityIcons name="cloud-download-outline" size={22} color="#6B7280" />
            </TouchableOpacity>

            <TouchableOpacity
              style={subStyles.exportItem}
              onPress={() => handleExport('Borrower KYC Directory (PDF)')}
            >
              <MaterialCommunityIcons name="file-pdf-box" size={28} color="#DC2626" />
              <View style={{ marginLeft: 14, flex: 1 }}>
                <Text style={subStyles.exportItemTitle}>Borrower KYC Directory</Text>
                <Text style={subStyles.exportItemSub}>Aadhaar, phone, addresses and guarantor details</Text>
              </View>
              <MaterialCommunityIcons name="cloud-download-outline" size={22} color="#6B7280" />
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

// -------------------------------------------------------------
// 5. Help & Support Modal
// -------------------------------------------------------------
export const HelpSupportModal = ({ visible, onClose }) => {
  const [expandedFaq, setExpandedFaq] = useState(null);

  const faqs = [
    {
      q: 'How do I disburse a new micro-loan?',
      a: 'Go to Borrowers list, select a verified customer, tap Disburse Loan, enter the principal, daily tenure, and confirm OTP.'
    },
    {
      q: 'How does daily offline settlement work?',
      a: 'Tapping Day-End Settlement tallies all collected cash against open receipts and produces a balanced ledger closure.'
    },
    {
      q: 'What if a borrower pays via UPI instead of cash?',
      a: 'Select UPI as payment method during payment collection and input the 12-digit UPI reference number.'
    }
  ];

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={subStyles.modalOverlay}>
        <View style={subStyles.modalContainer}>
          <View style={subStyles.modalHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <MaterialCommunityIcons name="help-circle" size={24} color="#6B46C1" style={{ marginRight: 8 }} />
              <Text style={subStyles.modalTitle}>Help & Support</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={subStyles.closeBtn}>
              <MaterialCommunityIcons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={{ alignItems: 'center', marginVertical: 8 }}>
              <LottieView
                source={supportAnimation}
                autoPlay
                loop
                style={{ width: 130, height: 130 }}
              />
            </View>
            <Text style={subStyles.subtitleText}>Frequently asked questions and direct support contacts.</Text>

            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
              <TouchableOpacity
                style={subStyles.supportActionCard}
                onPress={() => Alert.alert('Call Support', 'Direct helpline: +91 44 2840 5000 (Mon-Sat 9AM-7PM)')}
              >
                <MaterialCommunityIcons name="phone-in-talk" size={26} color="#10B981" />
                <Text style={subStyles.supportActionText}>Call Hotline</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={subStyles.supportActionCard}
                onPress={() => Alert.alert('WhatsApp Help', 'Opening official WhatsApp support channel.')}
              >
                <MaterialCommunityIcons name="whatsapp" size={26} color="#25D366" />
                <Text style={subStyles.supportActionText}>WhatsApp</Text>
              </TouchableOpacity>
            </View>

            <Text style={[subStyles.sectionHeading, { marginBottom: 10 }]}>Frequently Asked Questions</Text>
            {faqs.map((faq, idx) => {
              const isOpen = expandedFaq === idx;
              return (
                <TouchableOpacity
                  key={idx}
                  style={subStyles.faqCard}
                  onPress={() => setExpandedFaq(isOpen ? null : idx)}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={subStyles.faqQuestion}>{faq.q}</Text>
                    <MaterialCommunityIcons
                      name={isOpen ? 'chevron-up' : 'chevron-down'}
                      size={20}
                      color="#6B7280"
                    />
                  </View>
                  {isOpen && <Text style={subStyles.faqAnswer}>{faq.a}</Text>}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

// -------------------------------------------------------------
// 6. Privacy Policy Modal
// -------------------------------------------------------------
export const PrivacyPolicyModal = ({ visible, onClose }) => {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={subStyles.modalOverlay}>
        <View style={subStyles.modalContainer}>
          <View style={subStyles.modalHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <MaterialCommunityIcons name="lock-outline" size={24} color="#6B46C1" style={{ marginRight: 8 }} />
              <Text style={subStyles.modalTitle}>Privacy Controls & Policy</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={subStyles.closeBtn}>
              <MaterialCommunityIcons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={subStyles.subtitleText}>RBI Microfinance & Chit Fund Regulatory Compliance Guidelines.</Text>

            <View style={subStyles.policySection}>
              <Text style={subStyles.policyHeading}>1. Data Security & Storage</Text>
              <Text style={subStyles.policyBody}>
                All customer financial records, loan ledgers, Aadhaar numbers, and transaction logs are encrypted using 256-bit AES encryption at rest and in transit.
              </Text>
            </View>

            <View style={subStyles.policySection}>
              <Text style={subStyles.policyHeading}>2. Location & Telemetry</Text>
              <Text style={subStyles.policyBody}>
                Field agent GPS telemetry is recorded strictly during working business hours to verify on-site cash collections and prevent fraudulent entries.
              </Text>
            </View>

            <View style={subStyles.policySection}>
              <Text style={subStyles.policyHeading}>3. Customer Rights</Text>
              <Text style={subStyles.policyBody}>
                Borrowers have full right to request digital statement copies via WhatsApp or SMS anytime upon loan closure without penalty.
              </Text>
            </View>

            <TouchableOpacity style={[subStyles.primaryButton, { marginTop: 24 }]} onPress={onClose}>
              <Text style={subStyles.primaryButtonText}>I Understand</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const subStyles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  closeBtn: {
    padding: 4,
  },
  subtitleText: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#111827',
  },
  primaryButton: {
    backgroundColor: '#6B46C1',
    borderRadius: 8,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 10,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  rowSub: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  badgePill: {
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  badgePillText: {
    color: '#6B46C1',
    fontWeight: '700',
    fontSize: 12,
  },
  otpCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 14,
    marginBottom: 12,
  },
  otpName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  otpPhone: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  otpPurpose: {
    fontSize: 12,
    color: '#3B82F6',
    fontWeight: '600',
    marginTop: 4,
  },
  otpCodeBadge: {
    backgroundColor: '#E0E7FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  otpCodeText: {
    color: '#4338CA',
    fontWeight: '800',
    fontSize: 14,
    letterSpacing: 1.5,
  },
  otpBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  otpBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 13,
  },
  exportItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
  },
  exportItemTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  exportItemSub: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  supportActionCard: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
  },
  supportActionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
    marginTop: 6,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  faqCard: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  faqQuestion: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  faqAnswer: {
    fontSize: 13,
    color: '#4B5563',
    marginTop: 8,
    lineHeight: 18,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 8,
  },
  policySection: {
    marginBottom: 16,
  },
  policyHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  policyBody: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 19,
  },
});
