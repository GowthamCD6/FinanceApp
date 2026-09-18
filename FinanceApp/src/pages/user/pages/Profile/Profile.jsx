import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Alert,
  Share,
  Linking,
  Modal,
  TextInput,
  Switch,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useApp } from '../../../../context/AppContext';
import { formatINR } from '../../../../utils/helpers';
import Colors from '../../../../theme/colors';

export const UserProfile = () => {
  const { currentUser, logout, loans } = useApp();

  const [userData, setUserData] = useState({
    name: currentUser?.name || 'Kumar Swaminathan',
    role: 'Borrower / Client',
    phone: currentUser?.phone || '+91 98765 43210',
    email: currentUser?.email || 'kumar.s@gmail.com',
    customerCode: 'CUST-WK-092',
    address: 'No. 42, Triplicane High Rd, Chennai - 600005',
  });

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editName, setEditName] = useState(userData.name);
  const [editPhone, setEditPhone] = useState(userData.phone);
  const [editAddress, setEditAddress] = useState(userData.address);

  // Preference switches
  const [smsReceipts, setSmsReceipts] = useState(true);
  const [biometricEnabled, setBiometricEnabled] = useState(true);
  const [paymentReminders, setPaymentReminders] = useState(true);

  const activeLoan = loans.find((l) => l.status === 'ACTIVE' || l.status === 'DISBURSED') || loans[0] || {
    loan_number: 'LN-2026-001',
    principal_amount: 20000,
    total_paid: 14400,
    outstanding_amount: 9600,
  };

  const displayName = userData.name || 'Kumar';
  const displayPhone = userData.phone || '';
  const profileInitial = displayName ? displayName.charAt(0).toUpperCase() : 'K';

  const handleSaveProfile = () => {
    setUserData((prev) => ({
      ...prev,
      name: editName,
      phone: editPhone,
      address: editAddress,
    }));
    setEditModalVisible(false);
    Alert.alert('Profile Updated', 'Personal contact information successfully updated.');
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to sign out from your borrower account?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            logout();
          },
        },
      ]
    );
  };

  const handleOpenSocial = async (url, platformName) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Follow Us', `Join Apex Finance on ${platformName}!`);
      }
    } catch {
      Alert.alert('Follow Us', `Join Apex Finance on ${platformName}!`);
    }
  };

  const handleShareApp = async () => {
    try {
      await Share.share({
        title: 'Apex Borrower Portal',
        message: 'View loan schedules, download digital receipts, and manage repayments with Apex Microfinance App!',
      });
    } catch (error) {
      console.log('Error sharing:', error);
    }
  };

  const settingSections = [
    {
      title: 'Borrower Account',
      items: [
        {
          icon: 'account-edit-outline',
          title: 'Personal Information',
          subtitle: 'Update address, phone & nominee details',
          iconColor: Colors.secondaryBlue,
          onPress: () => setEditModalVisible(true),
        },
        {
          icon: 'card-account-details-outline',
          title: 'KYC & Aadhaar Verification',
          subtitle: 'Aadhaar Verified • KYC Grade Tier-1',
          iconColor: '#059669',
          onPress: () => Alert.alert('KYC Status', 'Your Aadhaar and PAN KYC verification is 100% complete.'),
        },
        {
          icon: 'store-outline',
          title: 'Shop & Business Details',
          subtitle: 'Kumar Provisions • Triplicane Market',
          iconColor: '#7C3AED',
          onPress: () => Alert.alert('Registered Business', 'Merchant Business: Kumar Provisions.'),
        },
      ],
    },
    {
      title: 'Alerts & Reminders',
      items: [
        {
          icon: 'bell-ring-outline',
          title: 'Due Date Reminders',
          subtitle: 'Receive notification 24 hours before due date',
          iconColor: '#D97706',
          hasSwitch: true,
          switchValue: paymentReminders,
          onToggle: setPaymentReminders,
        },
        {
          icon: 'message-text-outline',
          title: 'Instant SMS Payment Receipts',
          subtitle: 'Get SMS confirmation for every installment paid',
          iconColor: '#059669',
          hasSwitch: true,
          switchValue: smsReceipts,
          onToggle: setSmsReceipts,
        },
        {
          icon: 'fingerprint',
          title: 'Biometric Access',
          subtitle: 'Unlock portfolio with Fingerprint / Face ID',
          iconColor: '#2563EB',
          hasSwitch: true,
          switchValue: biometricEnabled,
          onToggle: setBiometricEnabled,
        },
      ],
    },
    {
      title: 'Documents & Receipts',
      items: [
        {
          icon: 'receipt-text-outline',
          title: 'Download Payment Statements',
          subtitle: 'Generate annual lending ledger statement',
          iconColor: '#6B46C1',
          onPress: () => Alert.alert('Statement Download', 'Repayment statement for FY 2025-26 exported.'),
        },
        {
          icon: 'file-certificate-outline',
          title: 'Loan Agreement Copy',
          subtitle: 'View signed microfinance loan sanction agreement',
          iconColor: '#0284C7',
          onPress: () => Alert.alert('Loan Agreement', 'Loan Sanction Certificate LN-2026-001 opened.'),
        },
      ],
    },
    {
      title: 'Support & Help',
      items: [
        {
          icon: 'phone-in-talk-outline',
          title: 'Call Field Officer',
          subtitle: 'Direct line to your assigned loan officer',
          iconColor: '#059669',
          onPress: () => Linking.openURL('tel:+919840155678'),
        },
        {
          icon: 'help-circle-outline',
          title: 'Help Center & Grievances',
          subtitle: 'Repayment FAQs & grievance redressal',
          iconColor: '#2563EB',
          onPress: () => Alert.alert('Support Helpline', 'Toll-free customer helpline: 1800-425-9988'),
        },
        {
          icon: 'share-variant-outline',
          title: 'Share with Friends',
          subtitle: 'Recommend Apex Microfinance to peer merchants',
          iconColor: '#7C3AED',
          onPress: handleShareApp,
        },
      ],
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profile Card Header */}
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarInitial}>{profileInitial}</Text>
          </View>
          <Text style={styles.userName}>{displayName.toUpperCase()}</Text>
          {Boolean(displayPhone) && (
            <Text style={styles.userPhone}>{displayPhone}</Text>
          )}
          <Text style={styles.userStatus}>BORROWER ACCOUNT • {userData.customerCode}</Text>
        </View>

        {/* Loan Repayment Health Card */}
        <View style={styles.loanCardContainer}>
          <Text style={styles.sectionTitle}>Active Loan Summary</Text>
          <View style={styles.loanCard}>
            <View style={styles.loanTopRow}>
              <View>
                <Text style={styles.loanNum}>{activeLoan.loan_number}</Text>
                <Text style={styles.loanType}>10-Week Microfinance Loan</Text>
              </View>
              <View style={styles.statusBadge}>
                <Text style={styles.statusBadgeText}>IN GOOD STANDING</Text>
              </View>
            </View>

            <View style={styles.loanMetricsRow}>
              <View>
                <Text style={styles.loanMetricLabel}>PRINCIPAL</Text>
                <Text style={styles.loanMetricVal}>{formatINR(activeLoan.principal_amount || 20000)}</Text>
              </View>
              <View>
                <Text style={styles.loanMetricLabel}>TOTAL REPAID</Text>
                <Text style={[styles.loanMetricVal, { color: '#059669' }]}>
                  {formatINR(activeLoan.total_paid || 14400)}
                </Text>
              </View>
              <View>
                <Text style={styles.loanMetricLabel}>BALANCE</Text>
                <Text style={[styles.loanMetricVal, { color: '#DC2626' }]}>
                  {formatINR(activeLoan.outstanding_amount || 9600)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Categorized Settings Sections */}
        {settingSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.settingsContainer}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.menuCard}>
              {section.items.map((item, itemIndex) => (
                <React.Fragment key={itemIndex}>
                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={item.onPress}
                    disabled={item.hasSwitch}
                    activeOpacity={0.7}
                  >
                    <View style={styles.menuItemContent}>
                      <View style={[styles.iconWrap, { backgroundColor: `${item.iconColor}15` }]}>
                        <MaterialCommunityIcons
                          name={item.icon}
                          size={20}
                          color={item.iconColor}
                        />
                      </View>
                      <View style={styles.menuItemTextBox}>
                        <Text style={styles.menuItemText}>{item.title}</Text>
                        {item.subtitle ? (
                          <Text style={styles.menuItemSubtitle}>
                            {item.subtitle}
                          </Text>
                        ) : null}
                      </View>
                    </View>

                    {item.hasSwitch ? (
                      <Switch
                        value={item.switchValue}
                        onValueChange={item.onToggle}
                        trackColor={{ false: '#E2E8F0', true: '#BFDBFE' }}
                        thumbColor={item.switchValue ? Colors.secondaryBlue : '#94A3B8'}
                      />
                    ) : (
                      <MaterialCommunityIcons
                        name="chevron-right"
                        size={20}
                        color="#94A3B8"
                      />
                    )}
                  </TouchableOpacity>
                  {itemIndex < section.items.length - 1 && (
                    <View style={styles.divider} />
                  )}
                </React.Fragment>
              ))}
            </View>
          </View>
        ))}

        {/* Social Follow & Footer Section */}
        <View style={styles.followSection}>
          <Text style={styles.followText}>Connect with Apex Microfinance</Text>
          <View style={styles.socialIcons}>
            <TouchableOpacity
              style={styles.socialIcon}
              onPress={() => handleOpenSocial('https://facebook.com', 'Facebook')}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="facebook" size={22} color="#1877F2" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.socialIcon}
              onPress={() => handleOpenSocial('https://instagram.com', 'Instagram')}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="instagram" size={22} color="#E4405F" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.socialIcon}
              onPress={() => handleOpenSocial('https://youtube.com', 'YouTube')}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="youtube" size={22} color="#FF0000" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.socialIcon}
              onPress={() => handleOpenSocial('https://wa.me', 'WhatsApp')}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="whatsapp" size={22} color="#25D366" />
            </TouchableOpacity>
          </View>

          {/* Logout Button */}
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton} activeOpacity={0.8}>
            <MaterialCommunityIcons name="logout-variant" size={18} color="#EF4444" style={{ marginRight: 6 }} />
            <Text style={styles.logoutText}>Log Out Account</Text>
          </TouchableOpacity>

          <Text style={styles.versionText}>Apex Borrower App v1.0.0 • Verified Client</Text>
        </View>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal visible={editModalVisible} animationType="slide" transparent onRequestClose={() => setEditModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Edit Borrower Profile</Text>
            <Text style={styles.modalSub}>Update your residential address & contact</Text>

            <Text style={styles.inputLabel}>FULL NAME</Text>
            <TextInput
              style={styles.textInput}
              value={editName}
              onChangeText={setEditName}
              placeholder="Your Name"
            />

            <Text style={styles.inputLabel}>CONTACT PHONE</Text>
            <TextInput
              style={styles.textInput}
              value={editPhone}
              onChangeText={setEditPhone}
              placeholder="Phone number"
              keyboardType="phone-pad"
            />

            <Text style={styles.inputLabel}>RESIDENTIAL ADDRESS</Text>
            <TextInput
              style={[styles.textInput, { height: 60, textAlignVertical: 'top' }]}
              value={editAddress}
              onChangeText={setEditAddress}
              placeholder="Address details"
              multiline
            />

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSaveProfile}>
                <Text style={styles.saveBtnText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    paddingBottom: 90,
  },
  profileSection: {
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: Colors.secondaryBlue,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: Colors.secondaryBlue,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  avatarInitial: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  userName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 2,
    textAlign: 'center',
    fontFamily: Platform.OS === 'android' ? 'Roboto-Bold' : 'System',
  },
  userPhone: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 6,
    fontWeight: '500',
    textAlign: 'center',
  },
  userStatus: {
    fontSize: 11,
    color: Colors.secondaryBlue,
    fontWeight: '800',
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
    textAlign: 'center',
  },
  loanCardContainer: {
    paddingHorizontal: 16,
    marginTop: 18,
  },
  loanCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  loanTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  loanNum: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  loanType: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  statusBadge: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#059669',
  },
  loanMetricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 12,
  },
  loanMetricLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
  },
  loanMetricVal: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 2,
  },
  settingsContainer: {
    paddingHorizontal: 16,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#475569',
    marginBottom: 8,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  menuCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItemTextBox: {
    marginLeft: 12,
    flex: 1,
  },
  menuItemText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  menuItemSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginLeft: 62,
  },
  followSection: {
    alignItems: 'center',
    marginTop: 28,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  followText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 12,
  },
  socialIcons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 20,
  },
  socialIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    marginBottom: 16,
  },
  logoutText: {
    fontSize: 14,
    color: '#EF4444',
    fontWeight: '700',
  },
  versionText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    marginTop: 10,
    marginBottom: 4,
  },
  textInput: {
    height: 42,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#0F172A',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  cancelBtn: {
    flex: 1,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
  },
  saveBtn: {
    flex: 1,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: Colors.secondaryBlue,
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default UserProfile;
