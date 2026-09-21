import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  StatusBar,
  Alert,
  Image,
  Share,
  Linking,
  Modal,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

let AsyncStorage;
try {
  AsyncStorage = require('@react-native-async-storage/async-storage').default;
} catch {
  AsyncStorage = {
    getItem: async () => null,
    setItem: async () => {},
  };
}

import { useApp } from '../../../../context/AppContext';
import { useLanguage } from '../../../../utils/LanguageContext';
import Colors from '../../../../theme/colors';
import { formatINR } from '../../../../utils/helpers';

// Dedicated Profile Subpages
import EditProfile from './Pages/AccountDetails/EditProfile';
import PasswordManagement from './Pages/PasswordManagement/PasswordManagement';
import SecurPermis from './Pages/SecurityLock/SecurityPermision';
import LanguageSettings from './Pages/LanguageSettings/LanguageSettings';
import BlockUserScreen from './Pages/BlockUser/BlockUser';
import UserL from './Pages/UserLocation/UserL';
import MyLocation from './Pages/MyLocation/MyLocation';
import NotificationSettings from './Pages/NotificationSettings/NotificationSettings';
import OTPRequests from './Pages/OTPRequests/OTPRequests';
import DataExport from './Pages/DataExport/DataExport';
import HelpSupport from './Pages/HelpSupport/HelpSupport';
import PrivacyPolicy from './Pages/PrivacyPolicy/PrivacyPolicy';

export const AdminProfile = () => {
  const { currentUser, logout, fundMetrics, customers, loans } = useApp();
  const { t, language } = useLanguage();

  const [imageError, setImageError] = useState(false);
  const [userData, setUserData] = useState({
    name: currentUser?.name || 'Administrator',
    role: currentUser?.role_type || currentUser?.role || 'Admin',
    phone: currentUser?.phone || '',
    email: currentUser?.email || '',
    branch: currentUser?.branch_name || 'Central Operations Route',
    userImage: '',
  });

  // Modal active states
  const [activeModal, setActiveModal] = useState(null);

  useEffect(() => {
    loadUserData();
  }, [currentUser]);

  const loadUserData = async () => {
    try {
      const storedName = await AsyncStorage.getItem('userName');
      const storedPhone = await AsyncStorage.getItem('userPhone');
      const storedRole = await AsyncStorage.getItem('userRole');
      const storedImage = await AsyncStorage.getItem('userImage');
      const storedEmail = await AsyncStorage.getItem('userEmail');

      setUserData(prev => ({
        ...prev,
        name: storedName || currentUser?.name || prev.name,
        phone: storedPhone || currentUser?.phone || prev.phone,
        email: storedEmail || currentUser?.email || prev.email,
        role: storedRole || currentUser?.role_type || currentUser?.role || prev.role,
        branch: currentUser?.branch_name || prev.branch,
        userImage: storedImage || prev.userImage,
      }));
      setImageError(false);
    } catch (error) {
      console.error('Error loading user profile data:', error);
    }
  };

  const displayName = userData.name || 'Admin';
  const displayPhone = userData.phone || currentUser?.phone || '';
  const displayEmail = userData.email || currentUser?.email || '';
  const profileInitial = displayName ? displayName.charAt(0).toUpperCase() : 'A';

  // Dynamic metrics calculation
  const totalBorrowers = useMemo(() => {
    if (Array.isArray(customers)) return customers.length;
    return 0;
  }, [customers]);

  const activeLoansCount = useMemo(() => {
    if (Array.isArray(loans)) {
      const active = loans.filter(l => l.status === 'ACTIVE' || l.status === 'DISBURSED');
      return active.length > 0 ? active.length : loans.length;
    }
    return 0;
  }, [loans]);

  const todayCollectedAmt = useMemo(() => {
    if (fundMetrics?.todayCollected !== undefined) {
      return fundMetrics.todayCollected;
    }
    return 0;
  }, [fundMetrics]);

  const handleLogout = () => {
    Alert.alert(
      t('Logout'),
      'Are you sure you want to sign out from this administration session?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: t('Logout'),
          style: 'destructive',
          onPress: async () => {
            try {
              logout();
            } catch (error) {
              console.error('Error logging out:', error);
            }
          },
        },
      ]
    );
  };

  const handleOpenSocial = async (url, fallbackName) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Follow Us', `Join Apex Microfinance on ${fallbackName}!`);
      }
    } catch {
      Alert.alert('Follow Us', `Join Apex Microfinance on ${fallbackName}!`);
    }
  };

  const handleShareApp = async () => {
    try {
      await Share.share({
        title: 'Apex Microfinance Operations Platform',
        message: 'Manage your micro-lending loans, daily collections, and portfolio records securely with Apex Finance App!\nDownload now: https://play.google.com/store/apps/details?id=com.apexfinance',
      });
    } catch (error) {
      console.log('Error sharing app:', error);
    }
  };

  const handleRateApp = () => {
    Alert.alert('Rate App', 'Thank you for supporting Apex Microfinance on Google Play Store!');
  };

  const settingSections = [
    {
      title: 'Profile & Security',
      items: [
        {
          icon: 'account-edit-outline',
          title: t('Edit Profile'),
          subtitle: 'Update personal contact, address & photo',
          iconColor: '#7C3AED',
          bgColor: '#F5F3FF',
          onPress: () => setActiveModal('EDIT_PROFILE'),
        },
        {
          icon: 'shield-lock-outline',
          title: 'App Biometric & PIN Lock',
          subtitle: 'Secure app access with device fingerprint / PIN',
          iconColor: '#059669',
          bgColor: '#ECFDF5',
          onPress: () => setActiveModal('SECURITY_PERM'),
        },
        {
          icon: 'key-change',
          title: t('Password Management'),
          subtitle: 'Manage passwords and staff credentials',
          iconColor: '#2563EB',
          bgColor: '#EFF6FF',
          onPress: () => setActiveModal('PASSWORD_MGMT'),
        },
      ],
    },
    {
      title: 'Field & Collection Operations',
      items: [
        {
          icon: 'map-marker-radius-outline',
          title: t('User Location Map'),
          subtitle: 'Live collection route & borrower GPS directory',
          iconColor: '#10B981',
          bgColor: '#ECFDF5',
          onPress: () => setActiveModal('USER_LOCATION'),
        },
        {
          icon: 'crosshairs-gps',
          title: 'Agent GPS Tracking',
          subtitle: 'Field officer live location and route sharing',
          iconColor: '#6366F1',
          bgColor: '#EEF2FF',
          onPress: () => setActiveModal('MY_LOCATION'),
        },
        {
          icon: 'shield-key-outline',
          title: 'Field OTP Verifications',
          subtitle: 'Approve real-time field collection verification codes',
          iconColor: '#3B82F6',
          bgColor: '#EFF6FF',
          onPress: () => setActiveModal('OTP_REQUESTS'),
        },
      ],
    },
    {
      title: 'Data & System Preferences',
      items: [
        {
          icon: 'file-download-outline',
          title: t('Data Export'),
          subtitle: 'Download CSV collection sheets, loan books & KYC',
          iconColor: '#0D9488',
          bgColor: '#F0FDFA',
          onPress: () => setActiveModal('DATA_EXPORT'),
        },
        {
          icon: 'account-cancel-outline',
          title: t('Block User'),
          subtitle: 'Manage blocked or defaulting accounts',
          iconColor: '#EF4444',
          bgColor: '#FEF2F2',
          onPress: () => setActiveModal('BLOCK_USER'),
        },
        {
          icon: 'bell-ring-outline',
          title: t('Notifications'),
          subtitle: 'Morning targets, overdue alerts & SMS receipts',
          iconColor: '#D97706',
          bgColor: '#FFFBEB',
          onPress: () => setActiveModal('NOTIFICATIONS'),
        },
        {
          icon: 'translate',
          title: t('Language'),
          subtitle: language === 'ta' ? 'தமிழ் (Tamil)' : 'English',
          iconColor: '#8B5CF6',
          bgColor: '#F5F3FF',
          onPress: () => setActiveModal('LANGUAGE'),
        },
      ],
    },
    {
      title: t('Support'),
      items: [
        {
          icon: 'help-circle-outline',
          title: t('Help & Support'),
          subtitle: 'Helpline, WhatsApp support & FAQs',
          iconColor: '#0284C7',
          bgColor: '#F0F9FF',
          onPress: () => setActiveModal('HELP_SUPPORT'),
        },
        {
          icon: 'shield-check-outline',
          title: 'Privacy Policy & Compliance',
          subtitle: 'RBI lending directions & data security policy',
          iconColor: '#475569',
          bgColor: '#F8FAFC',
          onPress: () => setActiveModal('PRIVACY_POLICY'),
        },
        {
          icon: 'share-variant-outline',
          title: t('Share App'),
          subtitle: 'Recommend Apex Finance to partner institutions',
          iconColor: '#6B7280',
          bgColor: '#F3F4F6',
          onPress: handleShareApp,
        },
        {
          icon: 'star-outline',
          title: t('Rate App'),
          subtitle: 'Leave your review on Play Store',
          iconColor: '#EAB308',
          bgColor: '#FEFCE8',
          onPress: handleRateApp,
        },
      ],
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Dedicated Subpages (Modal Slides) */}
      <Modal
        visible={activeModal === 'EDIT_PROFILE'}
        animationType="slide"
        onRequestClose={() => {
          loadUserData();
          setActiveModal(null);
        }}
      >
        <EditProfile
          onBack={() => {
            loadUserData();
            setActiveModal(null);
          }}
        />
      </Modal>

      <Modal
        visible={activeModal === 'PASSWORD_MGMT'}
        animationType="slide"
        onRequestClose={() => setActiveModal(null)}
      >
        <PasswordManagement
          onBack={() => setActiveModal(null)}
          onClose={() => setActiveModal(null)}
        />
      </Modal>

      <Modal
        visible={activeModal === 'SECURITY_PERM'}
        animationType="slide"
        onRequestClose={() => setActiveModal(null)}
      >
        <SecurPermis
          onBack={() => setActiveModal(null)}
        />
      </Modal>

      <Modal
        visible={activeModal === 'LANGUAGE'}
        animationType="slide"
        onRequestClose={() => setActiveModal(null)}
      >
        <LanguageSettings
          onBack={() => setActiveModal(null)}
        />
      </Modal>

      <Modal
        visible={activeModal === 'BLOCK_USER'}
        animationType="slide"
        onRequestClose={() => setActiveModal(null)}
      >
        <BlockUserScreen
          onBack={() => setActiveModal(null)}
        />
      </Modal>

      <Modal
        visible={activeModal === 'USER_LOCATION'}
        animationType="slide"
        onRequestClose={() => setActiveModal(null)}
      >
        <UserL
          onBack={() => setActiveModal(null)}
        />
      </Modal>

      <Modal
        visible={activeModal === 'MY_LOCATION'}
        animationType="slide"
        onRequestClose={() => setActiveModal(null)}
      >
        <MyLocation
          onBack={() => setActiveModal(null)}
        />
      </Modal>

      <Modal
        visible={activeModal === 'NOTIFICATIONS'}
        animationType="slide"
        onRequestClose={() => setActiveModal(null)}
      >
        <NotificationSettings
          onBack={() => setActiveModal(null)}
        />
      </Modal>

      <Modal
        visible={activeModal === 'OTP_REQUESTS'}
        animationType="slide"
        onRequestClose={() => setActiveModal(null)}
      >
        <OTPRequests
          onBack={() => setActiveModal(null)}
        />
      </Modal>

      <Modal
        visible={activeModal === 'DATA_EXPORT'}
        animationType="slide"
        onRequestClose={() => setActiveModal(null)}
      >
        <DataExport
          onBack={() => setActiveModal(null)}
        />
      </Modal>

      <Modal
        visible={activeModal === 'HELP_SUPPORT'}
        animationType="slide"
        onRequestClose={() => setActiveModal(null)}
      >
        <HelpSupport
          onBack={() => setActiveModal(null)}
        />
      </Modal>

      <Modal
        visible={activeModal === 'PRIVACY_POLICY'}
        animationType="slide"
        onRequestClose={() => setActiveModal(null)}
      >
        <PrivacyPolicy
          onBack={() => setActiveModal(null)}
        />
      </Modal>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card Header */}
        <View style={styles.profileSection}>
          <TouchableOpacity
            style={styles.avatarWrap}
            onPress={() => setActiveModal('EDIT_PROFILE')}
            activeOpacity={0.85}
          >
            <View style={styles.avatar}>
              {userData.userImage && !imageError ? (
                <Image
                  source={{ uri: userData.userImage }}
                  style={styles.avatarImage}
                  onError={() => setImageError(true)}
                />
              ) : (
                <Text style={styles.avatarInitial}>{profileInitial}</Text>
              )}
            </View>
            <View style={styles.avatarEditBadge}>
              <MaterialCommunityIcons name="camera" size={14} color="#FFFFFF" />
            </View>
          </TouchableOpacity>

          <Text style={styles.userName}>{displayName.toUpperCase()}</Text>

          {Boolean(displayPhone) && (
            <View style={styles.contactRow}>
              <MaterialCommunityIcons name="phone-outline" size={14} color="#64748B" />
              <Text style={styles.userPhone}>{displayPhone}</Text>
            </View>
          )}

          {Boolean(displayEmail) && (
            <View style={styles.contactRow}>
              <MaterialCommunityIcons name="email-outline" size={14} color="#64748B" />
              <Text style={styles.userEmail}>{displayEmail}</Text>
            </View>
          )}

          <View style={styles.roleTag}>
            <MaterialCommunityIcons name="shield-check" size={13} color="#7C3AED" style={{ marginRight: 4 }} />
            <Text style={styles.roleTagText}>{userData.role || 'Admin'} • Operations Officer</Text>
          </View>

          {/* Quick Edit Profile Action Button */}
          <TouchableOpacity
            style={styles.quickEditBtn}
            onPress={() => setActiveModal('EDIT_PROFILE')}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="account-edit-outline" size={16} color="#7C3AED" style={{ marginRight: 6 }} />
            <Text style={styles.quickEditBtnText}>Edit Profile Information</Text>
          </TouchableOpacity>

          {/* Officer Metrics Bar */}
          <View style={styles.scorecardContainer}>
            <View style={styles.scorecardItem}>
              <Text style={styles.scorecardVal}>{totalBorrowers}</Text>
              <Text style={styles.scorecardLbl}>Borrowers</Text>
            </View>
            <View style={styles.scorecardDivider} />
            <View style={styles.scorecardItem}>
              <Text style={styles.scorecardVal}>{activeLoansCount}</Text>
              <Text style={styles.scorecardLbl}>Active Loans</Text>
            </View>
            <View style={styles.scorecardDivider} />
            <View style={styles.scorecardItem}>
              <Text style={[styles.scorecardVal, { color: '#059669' }]}>
                {formatINR(todayCollectedAmt)}
              </Text>
              <Text style={styles.scorecardLbl}>Today's Collection</Text>
            </View>
          </View>
        </View>

        {/* Grouped Settings Sections */}
        {settingSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.settingsContainer}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.menuCard}>
              {section.items.map((item, itemIndex) => (
                <React.Fragment key={itemIndex}>
                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={item.onPress}
                    activeOpacity={0.7}
                  >
                    <View style={styles.menuItemContent}>
                      <View style={[styles.iconWrap, { backgroundColor: item.bgColor || '#F3F4F6' }]}>
                        <MaterialCommunityIcons
                          name={item.icon}
                          size={20}
                          color={item.iconColor}
                        />
                      </View>
                      <View style={styles.menuItemTextBox}>
                        <Text style={styles.menuItemText}>{item.title}</Text>
                        {item.subtitle ? (
                          <Text style={styles.menuItemSubtitle} numberOfLines={1}>
                            {item.subtitle}
                          </Text>
                        ) : null}
                      </View>
                    </View>
                    <MaterialCommunityIcons
                      name="chevron-right"
                      size={20}
                      color="#94A3B8"
                    />
                  </TouchableOpacity>
                  {itemIndex < section.items.length - 1 && (
                    <View style={styles.divider} />
                  )}
                </React.Fragment>
              ))}
            </View>
          </View>
        ))}

        {/* Follow Us & Social Handles */}
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
            <MaterialCommunityIcons name="logout-variant" size={18} color="#EF4444" style={{ marginRight: 8 }} />
            <Text style={styles.logoutText}>{t('Logout')}</Text>
          </TouchableOpacity>

          <Text style={styles.versionText}>{t('Version')} 1.0.0 • Apex Microfinance Platform</Text>
        </View>
      </ScrollView>
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
  avatarWrap: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#7C3AED',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarImage: {
    width: 84,
    height: 84,
    borderRadius: 42,
  },
  avatarInitial: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#1E1B4B',
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  userName: {
    fontSize: 19,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
    textAlign: 'center',
    fontFamily: Platform.OS === 'android' ? 'Roboto-Bold' : 'System',
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
    gap: 6,
  },
  userPhone: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  userEmail: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  roleTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F3FF',
    borderColor: '#E9D5FF',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 6,
  },
  roleTagText: {
    fontSize: 12,
    color: '#7C3AED',
    fontWeight: '700',
  },
  quickEditBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#F5F3FF',
    borderWidth: 1,
    borderColor: '#DDD6FE',
  },
  quickEditBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#7C3AED',
  },
  scorecardContainer: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 18,
    paddingVertical: 12,
    paddingHorizontal: 16,
    width: '100%',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  scorecardItem: {
    alignItems: 'center',
    flex: 1,
  },
  scorecardVal: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  scorecardLbl: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '600',
  },
  scorecardDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#CBD5E1',
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
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  menuCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#E2E8F0',
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
    marginRight: 8,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
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
    color: '#64748B',
    marginBottom: 12,
    fontWeight: '600',
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
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    paddingVertical: 10,
    paddingHorizontal: 24,
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
    borderWidth: 1,
    borderRadius: 8,
  },
  logoutText: {
    fontSize: 14,
    color: '#EF4444',
    fontWeight: '700',
  },
  versionText: {
    fontSize: 11,
    color: '#94A3B8',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 10,
    fontWeight: '600',
  },
});

export default AdminProfile;
