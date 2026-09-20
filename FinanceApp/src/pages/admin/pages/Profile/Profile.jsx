import React, { useState, useEffect } from 'react';
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

// Dedicated Profile Pages
import EditProfile from './Pages/AccountDetails/EditProfile';
import PasswordManagement from './Pages/PasswordManagement/PasswordManagement';
import SecurPermis from './Pages/SecurityLock/SecurityPermision';
import LanguageSettings from './Pages/LanguageSettings/LanguageSettings';
import BlockUserScreen from './Pages/BlockUser/BlockUser';
import UserL from './Pages/UserLocation/UserL';
import MyLocation from './Pages/MyLocation/MyLocation';

// Additional Dedicated Pages
import NotificationSettings from './Pages/NotificationSettings/NotificationSettings';
import OTPRequests from './Pages/OTPRequests/OTPRequests';
import AuctionSettings from './Pages/AuctionSettings/AuctionSettings';
import DataExport from './Pages/DataExport/DataExport';
import HelpSupport from './Pages/HelpSupport/HelpSupport';
import PrivacyPolicy from './Pages/PrivacyPolicy/PrivacyPolicy';

export const AdminProfile = () => {
  const { currentUser, logout, fundMetrics, customers, loans } = useApp();
  const { t, language } = useLanguage();

  const [imageError, setImageError] = useState(false);
  const [userData, setUserData] = useState({
    name: currentUser?.name || 'Gowtham Admin',
    role: currentUser?.role_type || currentUser?.role || 'Admin',
    phone: currentUser?.phone || '+91 98401 55678',
    email: currentUser?.email || 'admin@apexfinance.in',
    branch: 'Apex Central Branch - Route 4',
    userImage: '',
  });

  // Modal active states
  const [activeModal, setActiveModal] = useState(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const storedName = await AsyncStorage.getItem('userName');
      const storedPhone = await AsyncStorage.getItem('userPhone');
      const storedRole = await AsyncStorage.getItem('userRole');
      const storedImage = await AsyncStorage.getItem('userImage');

      setUserData(prev => ({
        ...prev,
        name: storedName || currentUser?.name || prev.name,
        phone: storedPhone || currentUser?.phone || prev.phone,
        role: storedRole || currentUser?.role_type || prev.role,
        userImage: storedImage || prev.userImage,
      }));
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const displayName = userData.name || 'Admin';
  const displayPhone = userData.phone || '';
  const profileInitial = displayName ? displayName.charAt(0).toUpperCase() : 'A';

  const handleLogout = () => {
    Alert.alert(
      t('Logout'),
      'Are you sure you want to logout from this device?',
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
        Alert.alert('Follow Us', `Join Apex Finance on ${fallbackName}!`);
      }
    } catch {
      Alert.alert('Follow Us', `Join Apex Finance on ${fallbackName}!`);
    }
  };

  const handleShareApp = async () => {
    try {
      await Share.share({
        title: 'Apex Microfinance Platform',
        message: 'Manage your micro-lending loans, daily collections, and portfolio records securely with Apex Finance App!\nDownload now: https://play.google.com/store/apps/details?id=com.apexfinance',
      });
    } catch (error) {
      console.log('Error sharing app:', error);
    }
  };

  const handleRateApp = () => {
    Alert.alert('Rate App', 'Thank you for rating Apex Microfinance App on Play Store!');
  };

  const settingSections = [
    {
      title: t('Account'),
      items: [
        {
          icon: 'account-edit',
          title: t('Edit Profile'),
          subtitle: t('Update your personal information'),
          iconColor: '#555555',
          onPress: () => setActiveModal('EDIT_PROFILE'),
        },
        {
          icon: 'key-change',
          title: t('Password Management'),
          subtitle: t('View and manage user passwords'),
          iconColor: '#6B46C1',
          onPress: () => setActiveModal('PASSWORD_MGMT'),
        },
        {
          icon: 'shield-account',
          title: t('Password & Security'),
          subtitle: t('Password and authentication'),
          iconColor: '#555555',
          onPress: () => setActiveModal('SECURITY_PERM'),
        },
      ],
    },
    {
      title: t('App Settings'),
      items: [
        {
          icon: 'bell-outline',
          title: t('Notifications'),
          subtitle: t('Manage notification preferences'),
          iconColor: '#555555',
          onPress: () => setActiveModal('NOTIFICATIONS'),
        },
        {
          icon: 'earth',
          title: t('Language'),
          subtitle: language === 'ta' ? 'தமிழ் (Tamil)' : 'English, Tamil',
          iconColor: '#555555',
          onPress: () => setActiveModal('LANGUAGE'),
        },
      ],
    },
    {
      title: t('Group Management'),
      items: [
        {
          icon: 'key-chain',
          title: t('OTP Requests'),
          subtitle: t('Manage user OTP verification requests'),
          iconColor: '#3B82F6',
          onPress: () => setActiveModal('OTP_REQUESTS'),
        },
        {
          icon: 'gavel',
          title: t('Auction Settings'),
          subtitle: t('Set default auction rules and duration'),
          iconColor: '#555555',
          onPress: () => setActiveModal('AUCTION_SETTINGS'),
        },
      ],
    },
    {
      title: t('Data & Privacy'),
      items: [
        {
          icon: 'download',
          title: t('Data Export'),
          subtitle: t('Download all your group data and history'),
          iconColor: '#555555',
          onPress: () => setActiveModal('DATA_EXPORT'),
        },
        {
          icon: 'account-cancel',
          title: t('Block User'),
          subtitle: 'Manage blocked or defaulting accounts',
          iconColor: '#EF4444',
          onPress: () => setActiveModal('BLOCK_USER'),
        },
      ],
    },
    {
      title: t('Location & Tracking'),
      items: [
        {
          icon: 'map-marker-radius',
          title: t('User Location Map'),
          subtitle: 'Live collection route & borrower map',
          iconColor: '#10B981',
          onPress: () => setActiveModal('USER_LOCATION'),
        },
        {
          icon: 'crosshairs-gps',
          title: t('Location Sharing'),
          subtitle: t('Control location sharing preferences'),
          iconColor: '#555555',
          onPress: () => setActiveModal('MY_LOCATION'),
        },
      ],
    },
    {
      title: t('Support'),
      items: [
        {
          icon: 'help-circle',
          title: t('Help & Support'),
          subtitle: t('FAQs, tutorials, contact support'),
          iconColor: '#555555',
          onPress: () => setActiveModal('HELP_SUPPORT'),
        },
        {
          icon: 'lock-outline',
          title: t('Privacy Controls'),
          subtitle: t('Control privacy policies and profile data'),
          iconColor: '#555555',
          onPress: () => setActiveModal('PRIVACY_POLICY'),
        },
        {
          icon: 'share-variant-outline',
          title: t('Share App'),
          subtitle: t('Invite friends to join'),
          iconColor: '#555555',
          onPress: handleShareApp,
        },
        {
          icon: 'star-outline',
          title: t('Rate App'),
          subtitle: t('Rate us on Play Store'),
          iconColor: '#555555',
          onPress: handleRateApp,
        },
      ],
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Dedicated Separate Pages (Full-Screen Slide) */}
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
        visible={activeModal === 'AUCTION_SETTINGS'}
        animationType="slide"
        onRequestClose={() => setActiveModal(null)}
      >
        <AuctionSettings
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
          <Text style={styles.userName}>{displayName.toUpperCase()}</Text>
          {Boolean(displayPhone) && (
            <Text style={styles.userPhone}>{displayPhone}</Text>
          )}
          <Text style={styles.userStatus}>{userData.role || 'Admin'} Account</Text>

          {/* Officer Metrics Bar */}
          <View style={styles.scorecardContainer}>
            <View style={styles.scorecardItem}>
              <Text style={styles.scorecardVal}>{customers?.length || 18}</Text>
              <Text style={styles.scorecardLbl}>Borrowers</Text>
            </View>
            <View style={styles.scorecardDivider} />
            <View style={styles.scorecardItem}>
              <Text style={styles.scorecardVal}>{loans?.length || 12}</Text>
              <Text style={styles.scorecardLbl}>Active Loans</Text>
            </View>
            <View style={styles.scorecardDivider} />
            <View style={styles.scorecardItem}>
              <Text style={[styles.scorecardVal, { color: '#10B981' }]}>
                {formatINR(fundMetrics?.todayCollected || 48500)}
              </Text>
              <Text style={styles.scorecardLbl}>Collected Today</Text>
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
                      <MaterialCommunityIcons
                        name={item.icon}
                        size={24}
                        color={item.iconColor}
                      />
                      <View style={styles.menuItemTextBox}>
                        <Text style={styles.menuItemText}>{item.title}</Text>
                        {item.subtitle ? (
                          <Text style={styles.menuItemSubtitle}>
                            {item.subtitle}
                          </Text>
                        ) : null}
                      </View>
                    </View>
                    <MaterialCommunityIcons
                      name="chevron-right"
                      size={24}
                      color="#CCCCCC"
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
          <Text style={styles.followText}>{t('Follow Us')}</Text>
          <View style={styles.socialIcons}>
            <TouchableOpacity
              style={styles.socialIcon}
              onPress={() => handleOpenSocial('https://facebook.com', 'Facebook')}
            >
              <MaterialCommunityIcons name="facebook" size={24} color="#1877F2" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.socialIcon}
              onPress={() => handleOpenSocial('https://instagram.com', 'Instagram')}
            >
              <MaterialCommunityIcons name="instagram" size={24} color="#E4405F" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.socialIcon}
              onPress={() => handleOpenSocial('https://youtube.com', 'YouTube')}
            >
              <MaterialCommunityIcons name="youtube" size={24} color="#FF0000" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.socialIcon}
              onPress={() => handleOpenSocial('https://wa.me', 'WhatsApp')}
            >
              <MaterialCommunityIcons name="whatsapp" size={24} color="#25D366" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Text style={styles.logoutText}>{t('Logout')}</Text>
          </TouchableOpacity>
          <Text style={styles.versionText}>{t('Version')} 1.0.0 • Apex Finance</Text>
        </View>
      </ScrollView>


    </View>
  );
};

const styles = StyleSheet.create({
  fullscreenContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
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
    borderBottomColor: '#F0F0F0',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#6B46C1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#6B46C1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarInitial: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
    textAlign: 'center',
    fontFamily: Platform.OS === 'android' ? 'Roboto-Regular' : 'System',
  },
  userPhone: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
    textAlign: 'center',
  },
  userStatus: {
    fontSize: 13,
    color: '#6B46C1',
    fontWeight: '600',
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 4,
    textAlign: 'center',
  },
  scorecardContainer: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
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
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
  },
  scorecardLbl: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
    fontWeight: '500',
  },
  scorecardDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E5E7EB',
  },
  settingsContainer: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 10,
  },
  menuCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuItemTextBox: {
    marginLeft: 16,
    flex: 1,
  },
  menuItemText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  menuItemSubtitle: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginLeft: 56,
  },
  followSection: {
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  followText: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 14,
    fontWeight: '600',
    fontFamily: Platform.OS === 'android' ? 'Roboto-Regular' : 'System',
  },
  socialIcons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 20,
  },
  socialIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  logoutButton: {
    marginBottom: 16,
    paddingVertical: 10,
    paddingHorizontal: 24,
    backgroundColor: '#FEE2E2',
    borderRadius: 20,
  },
  logoutText: {
    fontSize: 15,
    color: '#EF4444',
    fontWeight: '700',
  },
  versionText: {
    fontSize: 12,
    color: '#9CA3AF',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
    fontFamily: Platform.OS === 'android' ? 'Roboto-Regular' : 'System',
  },
});

export default AdminProfile;
