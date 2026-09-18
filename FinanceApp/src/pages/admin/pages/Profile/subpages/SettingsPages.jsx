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
  Platform,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Colors from '../../../../../theme/colors';
import { useLanguage } from '../../../../../utils/LanguageContext';

// -------------------------------------------------------------
// 1. Edit Profile Modal
// -------------------------------------------------------------
export const EditProfileModal = ({ visible, onClose, userData, onSave }) => {
  const [name, setName] = useState(userData?.name || '');
  const [phone, setPhone] = useState(userData?.phone || '');
  const [email, setEmail] = useState(userData?.email || '');
  const [branch, setBranch] = useState(userData?.branch || 'Apex Central Branch - Route 4');

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={subStyles.modalOverlay}>
        <View style={subStyles.modalContainer}>
          <View style={subStyles.modalHeader}>
            <Text style={subStyles.modalTitle}>Edit Profile Information</Text>
            <TouchableOpacity onPress={onClose} style={subStyles.closeBtn}>
              <MaterialCommunityIcons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
            <View style={subStyles.inputGroup}>
              <Text style={subStyles.inputLabel}>Full Name</Text>
              <TextInput
                style={subStyles.textInput}
                value={name}
                onChangeText={setName}
                placeholder="Enter full name"
                placeholderTextColor="#9CA3AF"
              />
            </View>
            <View style={subStyles.inputGroup}>
              <Text style={subStyles.inputLabel}>Phone Number</Text>
              <TextInput
                style={subStyles.textInput}
                value={phone}
                onChangeText={setPhone}
                placeholder="+91 98765 43210"
                placeholderTextColor="#9CA3AF"
                keyboardType="phone-pad"
              />
            </View>
            <View style={subStyles.inputGroup}>
              <Text style={subStyles.inputLabel}>Email Address</Text>
              <TextInput
                style={subStyles.textInput}
                value={email}
                onChangeText={setEmail}
                placeholder="admin@apexfinance.in"
                placeholderTextColor="#9CA3AF"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            <View style={subStyles.inputGroup}>
              <Text style={subStyles.inputLabel}>Assigned Branch / Territory</Text>
              <TextInput
                style={subStyles.textInput}
                value={branch}
                onChangeText={setBranch}
                placeholder="Branch name"
                placeholderTextColor="#9CA3AF"
              />
            </View>
            <TouchableOpacity
              style={subStyles.primaryButton}
              onPress={() => {
                onSave({ name, phone, email, branch });
                onClose();
              }}
            >
              <Text style={subStyles.primaryButtonText}>Save Changes</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

// -------------------------------------------------------------
// 2. Password Management Modal
// -------------------------------------------------------------
export const PasswordManagementModal = ({ visible, onClose }) => {
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showPass, setShowPass] = useState(false);

  const handleUpdate = () => {
    if (!newPass || !confirmPass) {
      Alert.alert('Error', 'Please fill in all password fields.');
      return;
    }
    if (newPass !== confirmPass) {
      Alert.alert('Mismatch', 'New password and confirmation password do not match.');
      return;
    }
    Alert.alert('Success', 'Officer password has been securely updated.');
    setCurrentPass('');
    setNewPass('');
    setConfirmPass('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={subStyles.modalOverlay}>
        <View style={subStyles.modalContainer}>
          <View style={subStyles.modalHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <MaterialCommunityIcons name="key-change" size={24} color="#6B46C1" style={{ marginRight: 8 }} />
              <Text style={subStyles.modalTitle}>Password Management</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={subStyles.closeBtn}>
              <MaterialCommunityIcons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={subStyles.subtitleText}>Manage your master account password and user login credentials.</Text>
            
            <View style={subStyles.inputGroup}>
              <Text style={subStyles.inputLabel}>Current Password</Text>
              <TextInput
                style={subStyles.textInput}
                value={currentPass}
                onChangeText={setCurrentPass}
                secureTextEntry={!showPass}
                placeholder="Enter current password"
                placeholderTextColor="#9CA3AF"
              />
            </View>
            <View style={subStyles.inputGroup}>
              <Text style={subStyles.inputLabel}>New Password</Text>
              <TextInput
                style={subStyles.textInput}
                value={newPass}
                onChangeText={setNewPass}
                secureTextEntry={!showPass}
                placeholder="Minimum 8 characters"
                placeholderTextColor="#9CA3AF"
              />
            </View>
            <View style={subStyles.inputGroup}>
              <Text style={subStyles.inputLabel}>Confirm New Password</Text>
              <TextInput
                style={subStyles.textInput}
                value={confirmPass}
                onChangeText={setConfirmPass}
                secureTextEntry={!showPass}
                placeholder="Re-type new password"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <TouchableOpacity
              style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}
              onPress={() => setShowPass(!showPass)}
            >
              <MaterialCommunityIcons
                name={showPass ? 'checkbox-marked' : 'checkbox-blank-outline'}
                size={20}
                color="#6B46C1"
              />
              <Text style={{ marginLeft: 8, color: '#374151', fontSize: 14 }}>Show passwords</Text>
            </TouchableOpacity>

            <TouchableOpacity style={subStyles.primaryButton} onPress={handleUpdate}>
              <Text style={subStyles.primaryButtonText}>Update Password</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

// -------------------------------------------------------------
// 3. Password & Security Modal
// -------------------------------------------------------------
export const SecurityPermModal = ({ visible, onClose }) => {
  const [twoFactor, setTwoFactor] = useState(true);
  const [biometric, setBiometric] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState('15 mins');

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={subStyles.modalOverlay}>
        <View style={subStyles.modalContainer}>
          <View style={subStyles.modalHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <MaterialCommunityIcons name="shield-account" size={24} color="#059669" style={{ marginRight: 8 }} />
              <Text style={subStyles.modalTitle}>Password & Security</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={subStyles.closeBtn}>
              <MaterialCommunityIcons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={subStyles.subtitleText}>Configure authentication layers and biometric permissions.</Text>

            <View style={subStyles.settingRow}>
              <View style={{ flex: 1 }}>
                <Text style={subStyles.rowTitle}>Two-Factor Authentication (2FA)</Text>
                <Text style={subStyles.rowSub}>Require OTP code upon sign in</Text>
              </View>
              <Switch value={twoFactor} onValueChange={setTwoFactor} trackColor={{ true: '#6B46C1' }} />
            </View>

            <View style={subStyles.settingRow}>
              <View style={{ flex: 1 }}>
                <Text style={subStyles.rowTitle}>Biometric Authentication</Text>
                <Text style={subStyles.rowSub}>Unlock using fingerprint or Face ID</Text>
              </View>
              <Switch value={biometric} onValueChange={setBiometric} trackColor={{ true: '#6B46C1' }} />
            </View>

            <View style={subStyles.settingRow}>
              <View style={{ flex: 1 }}>
                <Text style={subStyles.rowTitle}>Session Auto-Lock</Text>
                <Text style={subStyles.rowSub}>Lock app after inactivity ({sessionTimeout})</Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  setSessionTimeout(prev => prev === '15 mins' ? '30 mins' : prev === '30 mins' ? '5 mins' : '15 mins');
                }}
                style={subStyles.badgePill}
              >
                <Text style={subStyles.badgePillText}>{sessionTimeout}</Text>
              </TouchableOpacity>
            </View>

            <View style={subStyles.infoCard}>
              <MaterialCommunityIcons name="cellphone-check" size={22} color="#2563EB" />
              <View style={{ marginLeft: 12, flex: 1 }}>
                <Text style={subStyles.infoCardTitle}>Active Device</Text>
                <Text style={subStyles.infoCardSub}>Samsung Galaxy S23 • Chennai, IN (Current)</Text>
              </View>
            </View>

            <TouchableOpacity style={[subStyles.primaryButton, { marginTop: 24 }]} onPress={onClose}>
              <Text style={subStyles.primaryButtonText}>Done</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

// -------------------------------------------------------------
// 4. Notifications Settings Modal
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
// 5. Language Settings Modal
// -------------------------------------------------------------
export const LanguageSettingsModal = ({ visible, onClose }) => {
  const { language, changeLanguage } = useLanguage();

  const languages = [
    { code: 'en', label: 'English', sub: 'Default system language' },
    { code: 'ta', label: 'தமிழ் (Tamil)', sub: 'தமிழ் மொழியில் பயன்படுத்தவும்' },
  ];

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={subStyles.modalOverlay}>
        <View style={subStyles.modalContainer}>
          <View style={subStyles.modalHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <MaterialCommunityIcons name="earth" size={24} color="#6B46C1" style={{ marginRight: 8 }} />
              <Text style={subStyles.modalTitle}>Select Language</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={subStyles.closeBtn}>
              <MaterialCommunityIcons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
          <View>
            <Text style={subStyles.subtitleText}>Choose your preferred language for menus and statements.</Text>
            {languages.map((item) => {
              const isSelected = language === item.code;
              return (
                <TouchableOpacity
                  key={item.code}
                  style={[subStyles.langCard, isSelected && subStyles.langCardActive]}
                  onPress={() => {
                    changeLanguage(item.code);
                    Alert.alert('Language Updated', `Application language set to ${item.label}`);
                    onClose();
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={[subStyles.langLabel, isSelected && { color: '#6B46C1', fontWeight: 'bold' }]}>
                      {item.label}
                    </Text>
                    <Text style={subStyles.langSub}>{item.sub}</Text>
                  </View>
                  {isSelected && (
                    <MaterialCommunityIcons name="check-circle" size={24} color="#6B46C1" />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
};

// -------------------------------------------------------------
// 6. OTP Requests Modal
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
// 7. Auction / Loan Settings Modal
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
// 8. Data Export Modal
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
// 9. Block User Modal
// -------------------------------------------------------------
export const BlockUserModal = ({ visible, onClose }) => {
  const [blockedUsers, setBlockedUsers] = useState([
    { id: '1', name: 'Karthik Raja', phone: '+91 98402 11223', reason: 'Defaulted > 45 days', date: '12 Sep 2026' },
  ]);
  const [search, setSearch] = useState('');

  const handleUnblock = (id, name) => {
    Alert.alert(
      'Unblock User',
      `Are you sure you want to restore full borrowing access for ${name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unblock',
          onPress: () => {
            setBlockedUsers(prev => prev.filter(u => u.id !== id));
            Alert.alert('User Unblocked', `${name} account access has been restored.`);
          }
        }
      ]
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={subStyles.modalOverlay}>
        <View style={subStyles.modalContainer}>
          <View style={subStyles.modalHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <MaterialCommunityIcons name="account-cancel" size={24} color="#EF4444" style={{ marginRight: 8 }} />
              <Text style={subStyles.modalTitle}>Blocked & Blacklisted Users</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={subStyles.closeBtn}>
              <MaterialCommunityIcons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={subStyles.subtitleText}>Manage suspended accounts and credit blacklists.</Text>
            {blockedUsers.length === 0 ? (
              <View style={{ paddingVertical: 36, alignItems: 'center' }}>
                <MaterialCommunityIcons name="shield-check" size={48} color="#10B981" />
                <Text style={{ fontSize: 16, color: '#374151', fontWeight: '600', marginTop: 12 }}>No Blocked Accounts</Text>
                <Text style={{ fontSize: 13, color: '#9CA3AF', marginTop: 4 }}>All borrowers have active standing.</Text>
              </View>
            ) : (
              blockedUsers.map((u) => (
                <View key={u.id} style={subStyles.blockedCard}>
                  <View style={{ flex: 1 }}>
                    <Text style={subStyles.blockedName}>{u.name}</Text>
                    <Text style={subStyles.blockedPhone}>{u.phone}</Text>
                    <Text style={subStyles.blockedReason}>Reason: {u.reason}</Text>
                  </View>
                  <TouchableOpacity
                    style={subStyles.unblockBtn}
                    onPress={() => handleUnblock(u.id, u.name)}
                  >
                    <Text style={subStyles.unblockBtnText}>Unblock</Text>
                  </TouchableOpacity>
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
// 10. User Location Map Modal
// -------------------------------------------------------------
export const UserLocationMapModal = ({ visible, onClose }) => {
  const routes = [
    { id: '1', customer: 'Murugan Textiles', address: '24 Bazaar St, Mylapore', status: 'Collected Today', lat: '13.0334° N, 80.2678° E', color: '#10B981' },
    { id: '2', customer: 'Lakshmi Traders', address: '108 Triplicane High Rd', status: 'Pending Route', lat: '13.0544° N, 80.2762° E', color: '#F59E0B' },
    { id: '3', customer: 'Ravi Groceries', address: '15 Anna Salai, Royapettah', status: 'Due Today', lat: '13.0583° N, 80.2641° E', color: '#EF4444' },
  ];

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={subStyles.modalOverlay}>
        <View style={subStyles.modalContainer}>
          <View style={subStyles.modalHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <MaterialCommunityIcons name="map-marker-radius" size={24} color="#10B981" style={{ marginRight: 8 }} />
              <Text style={subStyles.modalTitle}>Field Collection Route Map</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={subStyles.closeBtn}>
              <MaterialCommunityIcons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* GPS Live Route Graphic Mockup */}
            <View style={subStyles.mapGraphic}>
              <MaterialCommunityIcons name="crosshairs-gps" size={36} color="#6B46C1" />
              <Text style={{ fontSize: 14, fontWeight: '700', color: '#111827', marginTop: 8 }}>
                Route 4 • Central Chennai Grid
              </Text>
              <Text style={{ fontSize: 12, color: '#6B7280' }}>GPS Active • 3 Route Waypoints</Text>
            </View>

            <Text style={[subStyles.subtitleText, { marginTop: 16 }]}>Active borrower check-in stops:</Text>

            {routes.map((r) => (
              <View key={r.id} style={subStyles.routeCard}>
                <View style={[subStyles.routeDot, { backgroundColor: r.color }]} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={subStyles.routeName}>{r.customer}</Text>
                  <Text style={subStyles.routeAddress}>{r.address}</Text>
                  <Text style={subStyles.routeCoord}>{r.lat}</Text>
                </View>
                <View style={[subStyles.statusBadge, { backgroundColor: `${r.color}15` }]}>
                  <Text style={[subStyles.statusBadgeText, { color: r.color }]}>{r.status}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

// -------------------------------------------------------------
// 11. Location Sharing Modal
// -------------------------------------------------------------
export const LocationSharingModal = ({ visible, onClose }) => {
  const [liveSharing, setLiveSharing] = useState(true);
  const [highAccuracy, setHighAccuracy] = useState(true);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={subStyles.modalOverlay}>
        <View style={subStyles.modalContainer}>
          <View style={subStyles.modalHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <MaterialCommunityIcons name="crosshairs-gps" size={24} color="#6B46C1" style={{ marginRight: 8 }} />
              <Text style={subStyles.modalTitle}>Location Sharing</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={subStyles.closeBtn}>
              <MaterialCommunityIcons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={subStyles.subtitleText}>Control background telemetry and collection geotagging.</Text>

            <View style={subStyles.settingRow}>
              <View style={{ flex: 1 }}>
                <Text style={subStyles.rowTitle}>Live Field Geotagging</Text>
                <Text style={subStyles.rowSub}>Attach GPS coordinates to cash receipts</Text>
              </View>
              <Switch value={liveSharing} onValueChange={setLiveSharing} trackColor={{ true: '#6B46C1' }} />
            </View>

            <View style={subStyles.settingRow}>
              <View style={{ flex: 1 }}>
                <Text style={subStyles.rowTitle}>High-Accuracy Route Mode</Text>
                <Text style={subStyles.rowSub}>Use GPS + Cellular tower triangulations</Text>
              </View>
              <Switch value={highAccuracy} onValueChange={setHighAccuracy} trackColor={{ true: '#6B46C1' }} />
            </View>

            <TouchableOpacity style={[subStyles.primaryButton, { marginTop: 24 }]} onPress={onClose}>
              <Text style={subStyles.primaryButtonText}>Save Location Settings</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

// -------------------------------------------------------------
// 12. Help & Support Modal
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
// 13. Privacy Policy Modal
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
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#EFF6FF',
    borderRadius: 10,
    padding: 14,
    marginTop: 16,
    alignItems: 'center',
  },
  infoCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E40AF',
  },
  infoCardSub: {
    fontSize: 12,
    color: '#3B82F6',
    marginTop: 2,
  },
  langCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    marginBottom: 12,
  },
  langCardActive: {
    borderColor: '#6B46C1',
    backgroundColor: '#FAF5FF',
  },
  langLabel: {
    fontSize: 16,
    color: '#111827',
  },
  langSub: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
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
  blockedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FEE2E2',
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
  },
  blockedName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#991B1B',
  },
  blockedPhone: {
    fontSize: 12,
    color: '#B91C1C',
    marginTop: 2,
  },
  blockedReason: {
    fontSize: 12,
    color: '#DC2626',
    fontWeight: '500',
    marginTop: 4,
  },
  unblockBtn: {
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  unblockBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 12,
  },
  mapGraphic: {
    backgroundColor: '#F3E8FF',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E9D5FF',
  },
  routeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 12,
    marginBottom: 10,
  },
  routeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  routeName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  routeAddress: {
    fontSize: 12,
    color: '#4B5563',
    marginTop: 2,
  },
  routeCoord: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
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
