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
  TextInput,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { SafeAreaView } from 'react-native-safe-area-context';

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
import NotificationSettings from './Pages/NotificationSettings/NotificationSettings';
import HelpSupport from './Pages/HelpSupport/HelpSupport';
import BlockUserScreen from './Pages/BlockUser/BlockUser';
import UserL from './Pages/UserLocation/UserL';
import MyLocation from './Pages/MyLocation/MyLocation';
import OTPRequests from './Pages/OTPRequests/OTPRequests';
import DataExport from './Pages/DataExport/DataExport';

export const AdminProfile = () => {
  const { currentUser, logout, fundMetrics, customers, loans, currentOrganization } = useApp();
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

  // In-place Rate Us Modal State
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [selectedRatingTags, setSelectedRatingTags] = useState([]);

  // In-place Share App Modal State
  const [copiedLink, setCopiedLink] = useState(false);

  // In-place Privacy Policy Tab State
  const [privacyTab, setPrivacyTab] = useState('SECURITY');

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
      title: t('Support') + ' & Legal',
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
          onPress: () => setActiveModal('SHARE_APP'),
        },
        {
          icon: 'star-outline',
          title: t('Rate App'),
          subtitle: 'Leave your review and feedback',
          iconColor: '#EAB308',
          bgColor: '#FEFCE8',
          onPress: () => setActiveModal('RATE_APP'),
        },
      ],
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Subpage Modals */}
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
        visible={activeModal === 'NOTIFICATIONS'}
        animationType="slide"
        onRequestClose={() => setActiveModal(null)}
      >
        <NotificationSettings
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

      {/* Interactive Rate Us Modal */}
      <Modal
        visible={activeModal === 'RATE_APP'}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setActiveModal(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.rateModalCard}>
            <View style={styles.rateHeaderBadge}>
              <MaterialCommunityIcons name="star-face" size={34} color="#D97706" />
            </View>
            <Text style={styles.rateModalTitle}>Rate Apex Finance</Text>
            <Text style={styles.rateModalSubtitle}>
              How has your micro-lending operations experience been so far?
            </Text>

            {/* Stars */}
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setRating(star)}
                  style={styles.starTouch}
                  activeOpacity={0.7}
                >
                  <MaterialCommunityIcons
                    name={star <= rating ? 'star' : 'star-outline'}
                    size={38}
                    color="#F59E0B"
                  />
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.ratingLabelText}>
              {rating === 5 && '🌟 Outstanding Experience!'}
              {rating === 4 && '👍 Very Good & Reliable'}
              {rating === 3 && '🙂 Satisfactory Operations'}
              {rating === 2 && '😐 Needs Improvement'}
              {rating === 1 && '👎 Poor Experience'}
            </Text>

            {/* Quick Feedback Tags */}
            <View style={styles.tagsContainer}>
              {['Easy Collection', 'Accurate Ledger', 'Fast & Reliable', 'Good Support'].map((tag) => {
                const isSelected = selectedRatingTags.includes(tag);
                return (
                  <TouchableOpacity
                    key={tag}
                    style={[styles.tagChip, isSelected && styles.tagChipActive]}
                    onPress={() => {
                      if (isSelected) {
                        setSelectedRatingTags(selectedRatingTags.filter((t) => t !== tag));
                      } else {
                        setSelectedRatingTags([...selectedRatingTags, tag]);
                      }
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.tagChipText, isSelected && styles.tagChipTextActive]}>
                      {tag}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Comment Box */}
            <TextInput
              style={styles.rateTextInput}
              placeholder="Tell us any suggestions or feedback (optional)..."
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={3}
              value={reviewText}
              onChangeText={setReviewText}
            />

            {/* Action Buttons */}
            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setActiveModal(null)}
                activeOpacity={0.7}
              >
                <Text style={styles.modalCancelText}>Maybe Later</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.rateSubmitBtn}
                onPress={() => {
                  Alert.alert(
                    'Thank You!',
                    `We appreciate your ${rating}-star feedback. Your review helps us continuously improve Apex Microfinance platform.`
                  );
                  setReviewText('');
                  setSelectedRatingTags([]);
                  setActiveModal(null);
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.rateSubmitBtnText}>Submit Rating</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Interactive Share App Modal */}
      <Modal
        visible={activeModal === 'SHARE_APP'}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setActiveModal(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.shareModalCard}>
            <View style={styles.shareHeaderBadge}>
              <MaterialCommunityIcons name="share-variant" size={28} color="#7C3AED" />
            </View>
            <Text style={styles.shareModalTitle}>Share Apex Finance</Text>
            <Text style={styles.shareModalSubtitle}>
              Recommend this platform to partner lending branches, staff, or field collection officers.
            </Text>

            {/* Referral / Link Box */}
            <View style={styles.linkCopyBox}>
              <View style={styles.linkTextWrap}>
                <Text style={styles.linkLabel}>INVITATION LINK & CODE</Text>
                <Text style={styles.linkUrlText} numberOfLines={1}>
                  https://apexfinance.app/join?code=APEX-ORG-2026
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.copyBtn, copiedLink && styles.copyBtnDone]}
                onPress={async () => {
                  setCopiedLink(true);
                  setTimeout(() => setCopiedLink(false), 2500);
                  try {
                    await Share.share({
                      title: 'Apex Microfinance Platform',
                      message: 'Manage your micro-lending loans, daily collections, and portfolio records securely with Apex Finance App!\nJoin using code: APEX-ORG-2026\nDownload now: https://play.google.com/store/apps/details?id=com.apexfinance',
                    });
                  } catch (e) {}
                }}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons
                  name={copiedLink ? 'check' : 'content-copy'}
                  size={16}
                  color={copiedLink ? '#059669' : '#7C3AED'}
                />
                <Text style={[styles.copyBtnText, copiedLink && { color: '#059669' }]}>
                  {copiedLink ? 'Copied' : 'Share'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Social Sharing Quick Channels */}
            <View style={styles.shareChannelsRow}>
              <TouchableOpacity
                style={[styles.shareChannelBtn, { backgroundColor: '#DCFCE7' }]}
                onPress={() => {
                  const msg = encodeURIComponent(
                    'Hey! I am using Apex Microfinance Platform for managing daily collections, borrowers, and loan books. Check it out: https://play.google.com/store/apps/details?id=com.apexfinance (Code: APEX-ORG-2026)'
                  );
                  Linking.openURL(`whatsapp://send?text=${msg}`).catch(() => {
                    handleShareApp();
                  });
                }}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons name="whatsapp" size={24} color="#16A34A" />
                <Text style={[styles.shareChannelLabel, { color: '#16A34A' }]}>WhatsApp</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.shareChannelBtn, { backgroundColor: '#E0E7FF' }]}
                onPress={() => {
                  const msg = encodeURIComponent(
                    'Join Apex Finance micro-lending platform: https://play.google.com/store/apps/details?id=com.apexfinance (Invite: APEX-ORG-2026)'
                  );
                  Linking.openURL(`sms:?body=${msg}`).catch(() => {
                    handleShareApp();
                  });
                }}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons name="message-text-outline" size={24} color="#4F46E5" />
                <Text style={[styles.shareChannelLabel, { color: '#4F46E5' }]}>SMS</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.shareChannelBtn, { backgroundColor: '#F3F4F6' }]}
                onPress={handleShareApp}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons name="dots-horizontal-circle-outline" size={24} color="#374151" />
                <Text style={[styles.shareChannelLabel, { color: '#374151' }]}>More</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.modalCloseOutBtn}
              onPress={() => setActiveModal(null)}
              activeOpacity={0.7}
            >
              <Text style={styles.modalCloseOutText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Interactive Privacy Policy Modal */}
      <Modal
        visible={activeModal === 'PRIVACY_POLICY'}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setActiveModal(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.privacyModalCard}>
            <View style={styles.privacyHeader}>
              <View style={styles.privacyShieldBox}>
                <MaterialCommunityIcons name="shield-check" size={22} color="#059669" />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.privacyTitle}>Privacy Policy & Compliance</Text>
                <Text style={styles.privacySubtitle}>RBI Fair Lending & Data Security Norms</Text>
              </View>
              <TouchableOpacity onPress={() => setActiveModal(null)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <MaterialCommunityIcons name="close" size={22} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {/* Segmented Tabs */}
            <View style={styles.privacyTabsRow}>
              {[
                { id: 'SECURITY', label: 'Data Security' },
                { id: 'LENDING', label: 'Fair Lending' },
                { id: 'RIGHTS', label: 'Your Rights' },
              ].map((tab) => (
                <TouchableOpacity
                  key={tab.id}
                  style={[styles.privacyTabBtn, privacyTab === tab.id && styles.privacyTabBtnActive]}
                  onPress={() => setPrivacyTab(tab.id)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.privacyTabText, privacyTab === tab.id && styles.privacyTabTextActive]}>
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Tab Content */}
            <ScrollView style={styles.privacyScroll} showsVerticalScrollIndicator={false}>
              {privacyTab === 'SECURITY' && (
                <View style={styles.privacyContentBox}>
                  <View style={styles.policyPoint}>
                    <MaterialCommunityIcons name="lock-check" size={20} color="#7C3AED" style={{ marginTop: 2, marginRight: 10 }} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.policyPointTitle}>Bank-Grade 256-Bit Encryption</Text>
                      <Text style={styles.policyPointDesc}>
                        All customer KYC, loan balances, collections, and financial data are encrypted both in transit (TLS 1.3) and at rest (AES-256).
                      </Text>
                    </View>
                  </View>

                  <View style={styles.policyPoint}>
                    <MaterialCommunityIcons name="database-eye-off" size={20} color="#7C3AED" style={{ marginTop: 2, marginRight: 10 }} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.policyPointTitle}>No Third-Party Sharing</Text>
                      <Text style={styles.policyPointDesc}>
                        Apex Microfinance never sells or monetizes borrower personal contact details, location logs, or transaction histories.
                      </Text>
                    </View>
                  </View>

                  <View style={styles.policyPoint}>
                    <MaterialCommunityIcons name="fingerprint" size={20} color="#7C3AED" style={{ marginTop: 2, marginRight: 10 }} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.policyPointTitle}>Biometric Isolation</Text>
                      <Text style={styles.policyPointDesc}>
                        Fingerprint and biometric keys remain protected inside Android KeyStore hardware security module and are never sent to remote servers.
                      </Text>
                    </View>
                  </View>
                </View>
              )}

              {privacyTab === 'LENDING' && (
                <View style={styles.privacyContentBox}>
                  <View style={styles.policyPoint}>
                    <MaterialCommunityIcons name="scale-balance" size={20} color="#059669" style={{ marginTop: 2, marginRight: 10 }} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.policyPointTitle}>RBI Fair Practices Code</Text>
                      <Text style={styles.policyPointDesc}>
                        Interest rates, total repayable amount, repayment schedule, and EMI cycle terms are transparently presented before loan disbursement.
                      </Text>
                    </View>
                  </View>

                  <View style={styles.policyPoint}>
                    <MaterialCommunityIcons name="file-certificate-outline" size={20} color="#059669" style={{ marginTop: 2, marginRight: 10 }} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.policyPointTitle}>No Hidden Penalties</Text>
                      <Text style={styles.policyPointDesc}>
                        All fees, payment receipts, and collection adjustments are logged with real-time digital ledger audit trails.
                      </Text>
                    </View>
                  </View>
                </View>
              )}

              {privacyTab === 'RIGHTS' && (
                <View style={styles.privacyContentBox}>
                  <View style={styles.policyPoint}>
                    <MaterialCommunityIcons name="account-check-outline" size={20} color="#2563EB" style={{ marginTop: 2, marginRight: 10 }} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.policyPointTitle}>Right to Access & Rectify</Text>
                      <Text style={styles.policyPointDesc}>
                        Borrowers and admins can review personal contact info and request corrections anytime via the Profile management console.
                      </Text>
                    </View>
                  </View>

                  <View style={styles.policyPoint}>
                    <MaterialCommunityIcons name="trash-can-outline" size={20} color="#2563EB" style={{ marginTop: 2, marginRight: 10 }} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.policyPointTitle}>Account Deactivation</Text>
                      <Text style={styles.policyPointDesc}>
                        Upon complete closure of all loan dues, users can request account suspension or permanent record archiving.
                      </Text>
                    </View>
                  </View>
                </View>
              )}
            </ScrollView>

            <TouchableOpacity
              style={styles.privacyAcknowledgeBtn}
              onPress={() => setActiveModal(null)}
              activeOpacity={0.8}
            >
              <Text style={styles.privacyAcknowledgeText}>I Acknowledge & Understand</Text>
            </TouchableOpacity>
          </View>
        </View>
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

          {Boolean(currentOrganization?.name || currentUser?.organization_name) && (
            <View style={styles.orgTag}>
              <MaterialCommunityIcons name="office-building" size={13} color="#2563EB" style={{ marginRight: 4 }} />
              <Text style={styles.orgTagText}>
                {currentOrganization?.name || currentUser?.organization_name}
                {Boolean(currentOrganization?.code) ? ` (${currentOrganization.code})` : ''}
              </Text>
            </View>
          )}

          {/* Quick Edit Profile Action Button */}
          <TouchableOpacity
            style={styles.quickEditBtn}
            onPress={() => setActiveModal('EDIT_PROFILE')}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="account-edit-outline" size={16} color="#7C3AED" style={{ marginRight: 6 }} />
            <Text style={styles.quickEditBtnText}>Edit Profile Information</Text>
          </TouchableOpacity>
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
    backgroundColor: '#FFFFFF', // Single uniform background
  },
  scrollContent: {
    paddingBottom: 90,
  },
  profileSection: {
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 12,
    paddingBottom: 20,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  avatarWrap: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#6B46C1',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: '#6B46C1',
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
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Bold' : 'Poppins-Bold',
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
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Medium' : 'Poppins-Medium',
  },
  userEmail: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Medium' : 'Poppins-Medium',
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
    color: '#6B46C1',
    fontWeight: '700',
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Bold' : 'Poppins-Bold',
  },
  orgTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 6,
  },
  orgTagText: {
    fontSize: 12,
    color: '#1D4ED8',
    fontWeight: '700',
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Bold' : 'Poppins-Bold',
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
    color: '#6B46C1',
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Bold' : 'Poppins-Bold',
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
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Bold' : 'Poppins-Bold',
  },
  menuCard: {
    backgroundColor: '#F3F4F6', // Gray card
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
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

  // Interactive Modals Styles (Rate, Share, Privacy)
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  rateModalCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  rateHeaderBadge: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  rateModalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
    textAlign: 'center',
  },
  rateModalSubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  starsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 10,
  },
  starTouch: {
    padding: 4,
  },
  ratingLabelText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#D97706',
    marginBottom: 16,
    textAlign: 'center',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  tagChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tagChipActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6',
  },
  tagChipText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
  },
  tagChipTextActive: {
    color: '#2563EB',
    fontWeight: '700',
  },
  rateTextInput: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 12,
    fontSize: 13,
    color: '#0F172A',
    minHeight: 76,
    textAlignVertical: 'top',
    marginBottom: 18,
  },
  modalBtnRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
  },
  rateSubmitBtn: {
    flex: 1.3,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#7C3AED',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  rateSubmitBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Share Modal
  shareModalCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  shareHeaderBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F5F3FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  shareModalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
    textAlign: 'center',
  },
  shareModalSubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 18,
    paddingHorizontal: 8,
  },
  linkCopyBox: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 12,
    marginBottom: 18,
  },
  linkTextWrap: {
    flex: 1,
    marginRight: 8,
  },
  linkLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  linkUrlText: {
    fontSize: 12,
    color: '#334155',
    fontWeight: '600',
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F5F3FF',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DDD6FE',
  },
  copyBtnDone: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  copyBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#7C3AED',
  },
  shareChannelsRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 18,
  },
  shareChannelBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 14,
  },
  shareChannelLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
  },
  modalCloseOutBtn: {
    width: '100%',
    paddingVertical: 11,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseOutText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
  },

  // Privacy Policy Modal
  privacyModalCard: {
    width: '100%',
    maxWidth: 400,
    maxHeight: '82%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  privacyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  privacyShieldBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  privacyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  privacySubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
    fontWeight: '500',
  },
  privacyTabsRow: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  privacyTabBtn: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    borderRadius: 9,
  },
  privacyTabBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  privacyTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  privacyTabTextActive: {
    color: '#7C3AED',
    fontWeight: '800',
  },
  privacyScroll: {
    maxHeight: 280,
    marginBottom: 16,
  },
  privacyContentBox: {
    gap: 12,
  },
  policyPoint: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  policyPointTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 3,
  },
  policyPointDesc: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 17,
  },
  privacyAcknowledgeBtn: {
    width: '100%',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#7C3AED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  privacyAcknowledgeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default AdminProfile;
