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

export const SuperAdminProfile = () => {
  const { currentUser, logout, fundMetrics, organizations } = useApp();

  const [userData, setUserData] = useState({
    name: currentUser?.name || 'Executive Super Admin',
    role: 'SUPER ADMIN • EXECUTIVE GOVERNANCE',
    phone: currentUser?.phone || '+91 99999 99999',
    email: currentUser?.email || 'superadmin@apexfinance.in',
  });

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editName, setEditName] = useState(userData.name);
  const [editPhone, setEditPhone] = useState(userData.phone);
  const [editEmail, setEditEmail] = useState(userData.email);

  // Preference switches
  const [auditAlerts, setAuditAlerts] = useState(true);
  const [biometricEnabled, setBiometricEnabled] = useState(true);
  const [multiOrgAccess, setMultiOrgAccess] = useState(true);

  const displayName = userData.name || 'Super Admin';
  const displayPhone = userData.phone || '';
  const profileInitial = displayName ? displayName.charAt(0).toUpperCase() : 'S';

  const handleSaveProfile = () => {
    setUserData((prev) => ({
      ...prev,
      name: editName,
      phone: editPhone,
      email: editEmail,
    }));
    setEditModalVisible(false);
    Alert.alert('Profile Saved', 'Master executive credentials updated.');
  };

  const handleLogout = () => {
    Alert.alert(
      'Super Admin Logout',
      'Are you sure you want to exit the Executive Governance session?',
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
        title: 'Apex Microfinance Executive Platform',
        message: 'Master Capital & Lending Portfolio Governance for Microfinance Institutions.',
      });
    } catch (error) {
      console.log('Error sharing:', error);
    }
  };

  const settingSections = [
    {
      title: 'Executive Governance',
      items: [
        {
          icon: 'shield-crown-outline',
          title: 'Master Admin Profile',
          subtitle: 'Executive clearance & master cryptographic key',
          iconColor: '#7C3AED',
          onPress: () => setEditModalVisible(true),
        },
        {
          icon: 'domain',
          title: 'Multi-Tenant Organizations',
          subtitle: `${organizations?.length || 2} Registered Lending Entities`,
          iconColor: '#2563EB',
          onPress: () => Alert.alert('Organizations', 'Entities:\n1. Apex Microfinance (Chennai)\n2. Apex Core Lending Trust'),
        },
        {
          icon: 'key-chain',
          title: 'System Access & Roles',
          subtitle: 'Manage branch officers, collectors & auditors',
          iconColor: '#059669',
          onPress: () => Alert.alert('Role Engine', 'RBAC: SUPER_ADMIN, BRANCH_ADMIN, LOAN_OFFICER, AUDITOR, BORROWER'),
        },
      ],
    },
    {
      title: 'Central Fund & Security',
      items: [
        {
          icon: 'bank-check',
          title: 'Capital Pool Limits',
          subtitle: `Authorized Pool: ${formatINR(fundMetrics?.totalCapital || 1250000)}`,
          iconColor: '#0284C7',
          onPress: () => Alert.alert('Capital Reserve', 'Master Capital Pool limit configured with multi-sig protection.'),
        },
        {
          icon: 'file-document-check-outline',
          title: 'Real-time Audit Ledger Alerts',
          subtitle: 'Immediate ping on capital injection & loan write-offs',
          iconColor: '#D97706',
          hasSwitch: true,
          switchValue: auditAlerts,
          onToggle: setAuditAlerts,
        },
        {
          icon: 'fingerprint',
          title: 'Biometric Master Unlock',
          subtitle: 'Hardware-backed biometric auth for fund transfers',
          iconColor: '#7C3AED',
          hasSwitch: true,
          switchValue: biometricEnabled,
          onToggle: setBiometricEnabled,
        },
      ],
    },
    {
      title: 'Compliance & Export',
      items: [
        {
          icon: 'database-export-outline',
          title: 'Full Audit Trail Export',
          subtitle: 'Download complete tamper-evident audit logs (JSON/CSV)',
          iconColor: '#059669',
          onPress: () => Alert.alert('Audit Export', 'Executive Audit Ledger exported with timestamp verification.'),
        },
        {
          icon: 'scale-balance',
          title: 'Regulatory & RBI Compliance',
          subtitle: 'NBFC-MFI regulatory reporting frameworks',
          iconColor: '#475569',
          onPress: () => Alert.alert('Compliance', 'RBI Microfinance Lending Directions (2022) compliant.'),
        },
      ],
    },
    {
      title: 'Support & System',
      items: [
        {
          icon: 'help-circle-outline',
          title: 'Enterprise Technical Support',
          subtitle: '24/7 dedicated engineering escalation desk',
          iconColor: '#2563EB',
          onPress: () => Linking.openURL('tel:+919999999999'),
        },
        {
          icon: 'share-variant-outline',
          title: 'Share Platform Link',
          subtitle: 'Invite institutional partners and directors',
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
            <MaterialCommunityIcons name="crown" size={36} color="#FFD700" />
          </View>
          <Text style={styles.userName}>{displayName.toUpperCase()}</Text>
          {Boolean(displayPhone) && (
            <Text style={styles.userPhone}>{displayPhone}</Text>
          )}
          <Text style={styles.userStatus}>SUPER ADMIN • EXECUTIVE GOVERNANCE</Text>
        </View>

        {/* Master Portfolio Balance Scorecard */}
        <View style={styles.scorecardContainer}>
          <Text style={styles.sectionTitle}>Central Fund Portfolio</Text>
          <View style={styles.scorecardGrid}>
            <View style={styles.scorecardBox}>
              <Text style={styles.scorecardLabel}>TOTAL CAPITAL</Text>
              <Text style={[styles.scorecardValue, { color: '#0F172A' }]}>
                {formatINR(fundMetrics?.totalCapital || 1250000)}
              </Text>
              <Text style={styles.scorecardSub}>Central equity pool</Text>
            </View>

            <View style={styles.scorecardBox}>
              <Text style={styles.scorecardLabel}>AVAILABLE LIQUID</Text>
              <Text style={[styles.scorecardValue, { color: '#059669' }]}>
                {formatINR(fundMetrics?.availableCash || 340000)}
              </Text>
              <Text style={styles.scorecardSub}>Vault & bank float</Text>
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
                        trackColor={{ false: '#E2E8F0', true: '#E9D5FF' }}
                        thumbColor={item.switchValue ? '#7C3AED' : '#94A3B8'}
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
          <Text style={styles.followText}>Apex Microfinance Master Console</Text>
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
            <Text style={styles.logoutText}>Exit Executive Governance</Text>
          </TouchableOpacity>

          <Text style={styles.versionText}>Apex Executive Core v1.0.0 • Master Clearance</Text>
        </View>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal visible={editModalVisible} animationType="slide" transparent onRequestClose={() => setEditModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Edit Master Credentials</Text>
            <Text style={styles.modalSub}>Update executive contact information</Text>

            <Text style={styles.inputLabel}>EXECUTIVE NAME</Text>
            <TextInput
              style={styles.textInput}
              value={editName}
              onChangeText={setEditName}
              placeholder="Name"
            />

            <Text style={styles.inputLabel}>DIRECT PHONE</Text>
            <TextInput
              style={styles.textInput}
              value={editPhone}
              onChangeText={setEditPhone}
              placeholder="Phone number"
              keyboardType="phone-pad"
            />

            <Text style={styles.inputLabel}>OFFICIAL EMAIL</Text>
            <TextInput
              style={styles.textInput}
              value={editEmail}
              onChangeText={setEditEmail}
              placeholder="Email address"
              keyboardType="email-address"
              autoCapitalize="none"
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
    backgroundColor: '#1E1B4B',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#FDE047',
    shadowColor: '#1E1B4B',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
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
    color: '#7C3AED',
    fontWeight: '800',
    backgroundColor: '#F5F3FF',
    borderColor: '#E9D5FF',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
    textAlign: 'center',
  },
  scorecardContainer: {
    paddingHorizontal: 16,
    marginTop: 18,
  },
  scorecardGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  scorecardBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  scorecardLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
  },
  scorecardValue: {
    fontSize: 17,
    fontWeight: '900',
    marginTop: 4,
  },
  scorecardSub: {
    fontSize: 11,
    color: '#94A3B8',
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
    backgroundColor: '#7C3AED',
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default SuperAdminProfile;
