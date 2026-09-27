import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  StatusBar,
  Modal,
  Alert,
  Platform,
  ScrollView,
  KeyboardAvoidingView,
  BackHandler,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from '../../../../../../components/HeaderComponent/Header';
import apiService from '../../../../../../services/apiService';
import { useLanguage } from '../../../../../../utils/LanguageContext';

const BlockUserScreen = ({ onBack }) => {
  const { t } = useLanguage();
  let navigation;
  try {
    navigation = useNavigation();
  } catch (e) {
    navigation = { goBack: () => onBack && onBack() };
  }

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (navigation && navigation.goBack) {
      navigation.goBack();
    }
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('blocked');
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [blockReason, setBlockReason] = useState('');

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const backAction = () => {
      if (showBlockModal) {
        setShowBlockModal(false);
        return true;
      }
      handleBack();
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove();
  }, [onBack, showBlockModal]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fallbackSampleUsers = [
    { id: '1', name: 'Kumar Swaminathan', phone: '+91 98765 43210', role: 'BORROWER', status: 'ACTIVE', isActive: 1 },
    { id: '2', name: 'Meena Ramesh', phone: '+91 98402 11223', role: 'BORROWER', status: 'BLOCKED', isActive: 0, blockReason: 'Multiple overdue missed payments' },
    { id: '3', name: 'Senthil Nathan', phone: '+91 94441 55667', role: 'COLLECTION_AGENT', status: 'ACTIVE', isActive: 1 },
    { id: '4', name: 'Karthik Raja', phone: '+91 97910 88990', role: 'BORROWER', status: 'ACTIVE', isActive: 1 },
  ];

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await apiService.makeRequest('/admin/users/getAllUsers', {
        method: 'GET',
      });
      const data = await response.json();
      if (data.success && Array.isArray(data.data) && data.data.length > 0) {
        setUsers(data.data);
      } else {
        setUsers(fallbackSampleUsers);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers(fallbackSampleUsers);
    } finally {
      setLoading(false);
    }
  };

  const handleForceLogout = user => {
    if (submitting) return;
    Alert.alert(
      t('Force Logout') || 'Force Logout',
      `Are you sure you want to force logout ${user.name}? This will immediately terminate their active session on their device.`,
      [
        { text: t('Cancel') || 'Cancel', style: 'cancel' },
        {
          text: t('Force Logout') || 'Force Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              setSubmitting(true);
              const response = await apiService.forceLogout(user.id, 'Session terminated by administrator');
              if (response && (response.success || response.data)) {
                Alert.alert('Success', `${user.name} has been force-logged out. Their session will end automatically.`);
                fetchUsers();
              } else {
                Alert.alert('Error', response?.message || 'Failed to force logout user');
              }
            } catch (error) {
              console.error('Error force logging out user:', error);
              Alert.alert('Error', error.message || 'Failed to force logout user.');
            } finally {
              setSubmitting(false);
            }
          },
        },
      ]
    );
  };

  const handleUnblock = userId => {
    if (submitting) return;
    Alert.alert(t('Reactivate User') || 'Reactivate User', t('Are you sure you want to unblock and reactivate this user account?') || 'Are you sure you want to unblock and reactivate this user account?', [
      {
        text: t('Cancel') || 'Cancel',
        style: 'cancel',
      },
      {
        text: t('Reactivate') || 'Reactivate',
        onPress: async () => {
          try {
            setSubmitting(true);
            const response = await apiService.unblockUser(userId);
            if (response && (response.success || response.data)) {
              Alert.alert('Success', t('User account has been reactivated successfully'));
              fetchUsers();
            } else {
              Alert.alert('Error', response?.message || 'Failed to unblock user');
            }
          } catch (error) {
            console.error('Error unblocking user:', error);
            Alert.alert('Error', error.message || 'Failed to unblock user. Please try again.');
          } finally {
            setSubmitting(false);
          }
        },
      },
    ]);
  };

  const handleBlockUser = user => {
    setSelectedUser(user);
    setBlockReason(''); // Clear reason when opening for new block
    setShowBlockModal(true);
  };

  const confirmBlock = async () => {
    if (submitting) return;
    if (!blockReason.trim()) {
      Alert.alert('Error', t('Provide a reason for deactivating') || 'Please provide a reason for deactivating/blocking');
      return;
    }

    try {
      setSubmitting(true);
      const response = await apiService.blockUser(selectedUser.id, blockReason.trim());
      if (response && (response.success || response.data)) {
        Alert.alert('Success', t('User account has been deactivated and blocked.') || 'User account has been deactivated and blocked.');
        setShowBlockModal(false);
        setBlockReason('');
        setSelectedUser(null);
        fetchUsers();
      } else {
        Alert.alert('Error', response?.message || 'Failed to deactivate user');
      }
    } catch (error) {
      console.error('Error blocking user:', error);
      Alert.alert('Error', error.message || 'Failed to deactivate user. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderBlockedUser = ({ item }) => (
    <View style={styles.userCard}>
      <View style={styles.cardContent}>
        <View style={styles.userInfoWrapper}>
          <View style={[styles.avatarContainer, styles.blockedAvatar]}>
            <Text style={[styles.avatarText, styles.blockedAvatarText]}>{item.name.charAt(0)}</Text>
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{item.name}</Text>
            <Text style={styles.userPhone}>{item.phone}</Text>
            {item.blockReason ? (
              <Text style={styles.blockReason} numberOfLines={2}>
                Reason: {item.blockReason}
              </Text>
            ) : null}
          </View>
        </View>
        <View style={styles.rightSection}>
          <View style={styles.statusContainer}>
            <Text style={[styles.statusText, styles.blockedStatus]}>
              Deactivated
            </Text>
          </View>
          <TouchableOpacity
            style={styles.unblockButton}
            onPress={() => handleUnblock(item.id)}
            disabled={submitting}
          >
            <MaterialCommunityIcons
              name="account-check"
              size={16}
              color="#FFF"
            />
            <Text style={styles.buttonTextSmall}>Reactivate</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderAllUser = ({ item }) => (
    <View style={styles.userCard}>
      <View style={styles.cardContent}>
        <View style={styles.userInfoWrapper}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{item.name}</Text>
            <Text style={styles.userPhone}>{item.phone}</Text>
            <Text style={styles.userRoleText}>{item.role || 'BORROWER'}</Text>
          </View>
        </View>
        <View style={styles.rightSectionActions}>
          <TouchableOpacity
            style={styles.forceLogoutButton}
            onPress={() => handleForceLogout(item)}
            disabled={submitting}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons
              name="logout-variant"
              size={15}
              color="#7C3AED"
            />
            <Text style={styles.forceLogoutButtonText}>Force Logout</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.blockButton}
            onPress={() => handleBlockUser(item)}
            disabled={submitting}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons
              name="account-cancel"
              size={15}
              color="#FFF"
            />
            <Text style={styles.buttonTextSmall}>Deactivate</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const blockedUsersList = users.filter(u => u.isActive === 0);
  const activeUsersList = users.filter(u => u.isActive === 1);

  const filteredBlockedUsers = blockedUsersList.filter(
    user =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.phone.includes(searchQuery),
  );

  const filteredAllUsers = activeUsersList
    .filter(
      user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.phone.includes(searchQuery),
    )
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <Header
        title={t('Block User')}
        onBack={handleBack}
        showBackButton={true}
      />

      {/* Tab Selector */}
      <View style={styles.tabOuterContainer}>
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'blocked' && styles.activeTab]}
            onPress={() => setActiveTab('blocked')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'blocked' && styles.activeTabText,
              ]}
            >
              {t('Blocked Users')} ({blockedUsersList.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'all' && styles.activeTab]}
            onPress={() => setActiveTab('all')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'all' && styles.activeTabText,
              ]}
            >
              {t('All Users')} ({activeUsersList.length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <MaterialCommunityIcons name="magnify" size={22} color="#6B7280" />
          <TextInput
            style={styles.searchInput}
            placeholder={t('Search users...')}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9CA3AF"
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <MaterialCommunityIcons
                name="close-circle"
                size={20}
                color="#9CA3AF"
              />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* User List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7C3AED" />
          <Text style={styles.loadingText}>{t('Loading data...')}</Text>
        </View>
      ) : (
        <FlatList
          data={activeTab === 'blocked' ? filteredBlockedUsers : filteredAllUsers}
          renderItem={activeTab === 'blocked' ? renderBlockedUser : renderAllUser}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContentContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={() => (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons
                name={activeTab === 'blocked' ? 'account-check' : 'account-group'}
                size={64}
                color="#D1D5DB"
              />
              <Text style={styles.emptyStateText}>
                {activeTab === 'blocked'
                  ? 'No blocked users found'
                  : 'No users available'}
              </Text>
            </View>
          )}
        />
      )}

      {/* Block User Modal */}
      <Modal
        visible={showBlockModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowBlockModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.centeredModalOverlay}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowBlockModal(false)}>
                <MaterialCommunityIcons
                  name="arrow-left"
                  size={24}
                  color="#000000"
                />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>{t('Block User')}</Text>
              <View style={{ width: 24 }} />
            </View>
            <View style={styles.modalHeaderSeparator} />

            <ScrollView style={styles.modalContent}>
              {selectedUser && (
                <View style={styles.modalUserInfo}>
                  <View style={styles.modalAvatar}>
                    <Text style={styles.modalAvatarText}>
                      {selectedUser.name.charAt(0)}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.modalUserName}>
                      {selectedUser.name}
                    </Text>
                    <Text style={styles.modalUserPhone}>
                      {selectedUser.phone}
                    </Text>
                  </View>
                </View>
              )}

              <View style={styles.inputGroup}>
                <View style={styles.labelContainer}>
                  <MaterialCommunityIcons
                    name="text-box-outline"
                    size={20}
                    color="#000000"
                  />
                  <Text style={styles.inputLabel}>{t('Deactivation Reason') || 'Deactivation Reason'}</Text>
                  <Text style={styles.requiredStar}>*</Text>
                </View>

                {/* Quick preset reasons */}
                <View style={styles.quickReasonsContainer}>
                  {[
                    'Defaulted loan payments',
                    'Suspicious account activity',
                    'Phone lost / Security risk',
                    'Customer requested closure',
                  ].map((preset, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.quickReasonChip,
                        blockReason === preset && styles.quickReasonChipActive,
                      ]}
                      onPress={() => setBlockReason(preset)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.quickReasonText,
                          blockReason === preset && styles.quickReasonTextActive,
                        ]}
                      >
                        {preset}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <TextInput
                  style={styles.textArea}
                  placeholder={t('Or type specific reason...')}
                  value={blockReason}
                  onChangeText={setBlockReason}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.confirmBlockButton, submitting && { opacity: 0.6 }]}
                onPress={confirmBlock}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <MaterialCommunityIcons
                      name="account-cancel"
                      size={20}
                      color="#FFFFFF"
                    />
                    <Text style={styles.buttonText}>{t('Confirm Deactivation') || 'Confirm Deactivation'}</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  tabOuterContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    backgroundColor: '#FFFFFF',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  activeTab: {
    backgroundColor: '#7C3AED',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    fontFamily:
      Platform.OS === 'android' ? 'Gilroy-SemiBold' : 'Poppins-SemiBold',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 52,
    marginBottom: -6,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: '#1F2937',
    fontFamily:
      Platform.OS === 'android' ? 'Gilroy-Regular' : 'Poppins-Regular',
  },
  listContentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    paddingTop: 10,
  },
  userCard: {
    backgroundColor: '#FFFFFF',
    marginBottom: 10,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#F3E8FF',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userInfoWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  avatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EDE9FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  blockedAvatar: {
    backgroundColor: '#FEE2E2',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#7C3AED',
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Bold' : 'Poppins-Bold',
  },
  blockedAvatarText: {
    color: '#EF4444',
  },
  userDetails: {
    flex: 1,
  },
  userRoleText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#7C3AED',
    marginTop: 3,
    textTransform: 'uppercase',
  },
  rightSectionActions: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 6,
  },
  forceLogoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F3FF',
    borderWidth: 1,
    borderColor: '#DDD6FE',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
    gap: 4,
  },
  forceLogoutButtonText: {
    color: '#7C3AED',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: Platform.OS === 'android' ? 'Gilroy-SemiBold' : 'Poppins-SemiBold',
  },
  quickReasonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  quickReasonChip: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  quickReasonChipActive: {
    backgroundColor: '#F5F3FF',
    borderColor: '#7C3AED',
  },
  quickReasonText: {
    fontSize: 12,
    color: '#4B5563',
    fontWeight: '500',
  },
  quickReasonTextActive: {
    color: '#7C3AED',
    fontWeight: '600',
  },
  rightSection: {
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
    gap: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
    fontFamily:
      Platform.OS === 'android' ? 'Gilroy-SemiBold' : 'Poppins-SemiBold',
  },
  statusText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Medium' : 'Poppins-Medium',
  },
  activeStatus: {
    color: '#10B981',
  },
  blockedStatus: {
    color: '#EF4444',
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Bold' : 'Poppins-Bold',
  },
  userPhone: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
    fontFamily:
      Platform.OS === 'android' ? 'Gilroy-Regular' : 'Poppins-Regular',
  },
  blockReason: {
    fontSize: 12,
    color: '#EF4444',
    fontFamily:
      Platform.OS === 'android' ? 'Gilroy-Regular' : 'Poppins-Regular',
  },
  unblockButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    gap: 6,
  },
  blockButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EF4444',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    gap: 6,
  },
  buttonTextSmall: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    fontFamily:
      Platform.OS === 'android' ? 'Gilroy-SemiBold' : 'Poppins-SemiBold',
  },
  blockedDate: {
    fontSize: 12,
    color: '#9CA3AF',
    fontFamily:
      Platform.OS === 'android' ? 'Gilroy-Regular' : 'Poppins-Regular',
  },
  userStatus: {
    fontSize: 13,
    color: '#10B981',
    fontWeight: '500',
    fontFamily:
      Platform.OS === 'android' ? 'Gilroy-Regular' : 'Poppins-Regular',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 12,
    fontFamily:
      Platform.OS === 'android' ? 'Gilroy-SemiBold' : 'Poppins-SemiBold',
  },
  centeredModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    width: '90%',
    maxHeight: '75%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -5,
    },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#000000',
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Bold' : 'Poppins-Bold',
  },
  modalHeaderSeparator: {
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  modalContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  modalUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
  },
  modalAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  modalAvatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3B82F6',
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Bold' : 'Poppins-Bold',
  },
  modalUserName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Bold' : 'Poppins-Bold',
  },
  modalUserPhone: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily:
      Platform.OS === 'android' ? 'Gilroy-Regular' : 'Poppins-Regular',
  },
  inputGroup: {
    marginBottom: 15,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 6,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: '400',
    color: '#000000',
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Medium' : 'Poppins-Medium',
  },
  requiredStar: {
    fontSize: 15,
    color: '#EF4444',
    marginLeft: 2,
  },
  textArea: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: '#1F2937',
    minHeight: 100,
    textAlignVertical: 'top',
    fontFamily:
      Platform.OS === 'android' ? 'Gilroy-Regular' : 'Poppins-Regular',
  },
  modalActions: {
    padding: 20,
    paddingTop: 0,
    marginTop: -5,
  },
  confirmBlockButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#EF4444',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily:
      Platform.OS === 'android' ? 'Gilroy-SemiBold' : 'Poppins-SemiBold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 80,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Medium' : 'Poppins-Medium',
  },
});

// Export with alias for compatibility
const BlockU = BlockUserScreen;
export default BlockU;
