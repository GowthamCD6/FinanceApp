import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  Pressable,
  Platform,
  KeyboardAvoidingView,
  Alert,
  Animated,
  Image,
  StatusBar,
  BackHandler,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { apiService } from '../../../../../services/apiService';
import Header from '../../../../../components/HeaderComponent/Header';
import { useApp } from '../../../../../context/AppContext';

const getAvatarUrl = (avatarPath) => {
  if (!avatarPath || typeof avatarPath !== 'string') return null;
  const trimmed = avatarPath.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:image/')) {
    return trimmed;
  }
  const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  const base = (apiService.baseUrl || 'http://localhost:5000').replace(/\/+$/, '').replace(/\/api\/?$/, '');
  return `${base}${cleanPath}`;
};

const SkeletonBox = ({ width, height, borderRadius = 6, style }) => {
  const animatedValue = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 0.85,
          duration: 750,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0.3,
          duration: 750,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [animatedValue]);

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: '#CBD5E1',
          opacity: animatedValue,
        },
        style,
      ]}
    />
  );
};

const UserRowSkeleton = () => (
  <View style={[customStyles.userCard, { paddingVertical: 14 }]}>
    <View style={customStyles.userInfo}>
      <SkeletonBox width={40} height={40} borderRadius={20} />
      <View style={{ marginLeft: 12, gap: 6 }}>
        <SkeletonBox width={140} height={16} borderRadius={4} />
        <SkeletonBox width={100} height={12} borderRadius={4} />
      </View>
    </View>
    <SkeletonBox width={20} height={20} borderRadius={10} />
  </View>
);

const ViewDetailsSkeleton = () => (
  <View style={{ paddingTop: 6, paddingBottom: 24 }}>
    <View style={{ alignItems: 'center', marginVertical: 14 }}>
      <SkeletonBox width={80} height={80} borderRadius={40} style={{ marginBottom: 12 }} />
      <SkeletonBox width={160} height={20} borderRadius={6} style={{ marginBottom: 8 }} />
      <SkeletonBox width={90} height={22} borderRadius={12} />
    </View>

    {[1, 2, 3, 4, 5, 6].map((key) => (
      <View key={key} style={customStyles.inputGroup}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
          <SkeletonBox width={18} height={18} borderRadius={4} />
          <SkeletonBox width={130} height={14} borderRadius={4} />
        </View>
        <SkeletonBox width="100%" height={52} borderRadius={12} />
      </View>
    ))}
  </View>
);

export const ManageU = ({ visible, onBack, onClose, onOpenAddUser }) => {
  const { customers, loans, currentOrganization, refreshData } = useApp();
  const orgId = currentOrganization?.id || 1;

  // Stable top-level Hook declarations
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [activeModal, setActiveModal] = useState(null); // 'MENU' | 'EDIT' | 'DELETE' | 'VIEW' | null
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [selectedUserDetails, setSelectedUserDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const [editFormData, setEditFormData] = useState({
    name: '',
    phone: '',
    type: 'user',
    occupation: '',
    shopName: '',
    address: '',
    city: '',
    nickname: '',
    dateOfYear: '',
  });

  const menuButtonRefs = useRef({});

  // Hardware Back button handling
  useEffect(() => {
    const backAction = () => {
      if (activeModal) {
        setActiveModal(null);
        return true;
      }
      handleDismiss();
      return true;
    };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [activeModal]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const data = await apiService.getUsers({ organizationId: orgId }).catch(() => []);
      const usersArray = Array.isArray(data) ? data : (data?.users || data?.data || []);
      if (usersArray && usersArray.length > 0) {
        setUsers(usersArray);
      } else if (customers && customers.length > 0) {
        setUsers(customers);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      if (customers) setUsers(customers);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [orgId]);

  const getUserLoanInfo = (user) => {
    if (!user) return null;

    // 1. Direct loans array from backend getUserById
    const backendLoans = Array.isArray(user.loans) ? user.loans : [];
    // 2. Or matching loans from AppContext
    const contextLoans = (loans || []).filter((l) =>
      (l.customer_id && String(l.customer_id) === String(user.id || user.customer_id)) ||
      (l.customerId && String(l.customerId) === String(user.id || user.customer_id)) ||
      (l.customer_phone && String(l.customer_phone) === String(user.phone)) ||
      (l.phone && String(l.phone) === String(user.phone))
    );

    const allLoans = backendLoans.length > 0 ? backendLoans : contextLoans;

    if (!allLoans || allLoans.length === 0) {
      return null;
    }

    const activeLoan = allLoans.find((l) =>
      ['ACTIVE', 'OVERDUE', 'DISBURSED', 'PARTIALLY_PAID', 'RUNNING'].includes((l.status || '').toUpperCase())
    ) || allLoans[0];

    if (!activeLoan) return null;

    const principal = parseFloat(
      activeLoan.principal_amount ||
      activeLoan.principal ||
      activeLoan.amount ||
      activeLoan.loan_amount ||
      0
    );

    if (principal <= 0) return null;

    const freq = (activeLoan.repayment_frequency || activeLoan.frequency || '').toUpperCase();
    const prodName = (activeLoan.product_name || activeLoan.loan_type || '').toLowerCase();
    const code = (activeLoan.category_code || '').toUpperCase();

    let schemeType = 'Weekly';
    if (freq === 'DAILY' || prodName.includes('daily') || prodName.includes('shop') || code.includes('DLY')) {
      schemeType = 'Shop (Daily)';
    } else if (freq === 'MONTHLY' || prodName.includes('monthly') || code.includes('MO')) {
      schemeType = 'Monthly';
    } else if (freq === 'WEEKLY' || prodName.includes('weekly') || code.includes('WK')) {
      schemeType = 'Weekly';
    }

    const status = (activeLoan.status || 'ACTIVE').toUpperCase();
    const totalPaid = parseFloat(activeLoan.total_paid || 0);
    const remaining = parseFloat(
      activeLoan.remaining_balance ??
      (parseFloat(activeLoan.total_repayment_amount || 0) - totalPaid)
    );

    return {
      amountText: `₹${principal.toLocaleString('en-IN')}`,
      schemeType,
      status,
      totalLoansCount: allLoans.length,
      totalPaidText: totalPaid > 0 ? `₹${totalPaid.toLocaleString('en-IN')}` : null,
      remainingText: remaining > 0 ? `₹${remaining.toLocaleString('en-IN')}` : null,
    };
  };

  const handleDismiss = () => {
    setActiveModal(null);
    setSelectedUserDetails(null);
    if (onClose) onClose();
    if (onBack) onBack();
  };

  // Sort and filter users
  const filteredUsers = useMemo(() => {
    const q = searchQuery.toLowerCase();
    let filtered = users.filter((user) => {
      const name = (user.name || user.full_name || user.nickname || '').toString();
      const phone = (user.phone || '').toString();
      const shop = (user.shop_name || user.shopName || user.occupation || '').toString();
      return name.toLowerCase().includes(q) || phone.includes(searchQuery) || shop.toLowerCase().includes(q);
    });
    return filtered.sort((a, b) => {
      const aType = (a.type || a.role || '').toString().toLowerCase();
      const bType = (b.type || b.role || '').toString().toLowerCase();
      if (aType.includes('admin') && !bType.includes('admin')) return -1;
      if (!aType.includes('admin') && bType.includes('admin')) return 1;
      const aName = (a.name || a.full_name || a.nickname || '').toString();
      const bName = (b.name || b.full_name || b.nickname || '').toString();
      return aName.localeCompare(bName);
    });
  }, [users, searchQuery]);

  // Handlers
  const handleMenuPress = (user, buttonRef) => {
    setSelectedUser(user);
    const refCurrent = buttonRef && buttonRef.current ? buttonRef.current : null;
    if (refCurrent && typeof refCurrent.measure === 'function') {
      refCurrent.measure((_x, _y, _width, _height, pageX, pageY) => {
        setMenuPosition({
          top: (pageY || 0) + (_height || 0) + 5,
          right: Platform.OS === 'ios' ? 16 : 24,
        });
        setActiveModal('MENU');
      });
    } else {
      setMenuPosition({ top: 120, right: Platform.OS === 'ios' ? 16 : 24 });
      setActiveModal('MENU');
    }
  };

  const handleEdit = () => {
    if (!selectedUser) return;
    const roleStr = (selectedUser.role || selectedUser.type || '').toString().toLowerCase();
    const dob = selectedUser.birthYear || selectedUser.yearOfBirth || selectedUser.dateOfBirth || selectedUser.date_of_birth || '';

    setEditFormData({
      name: selectedUser.name || selectedUser.full_name || selectedUser.nickname || '',
      phone: selectedUser.phone || '',
      type: roleStr.includes('admin') ? 'admin' : 'user',
      occupation: selectedUser.occupation || '',
      shopName: selectedUser.shop_name || selectedUser.shopName || '',
      address: selectedUser.address || '',
      city: selectedUser.city || '',
      nickname: selectedUser.nickname || '',
      dateOfYear: dob && String(dob).length >= 4 ? String(dob).substring(0, 4) : '',
    });

    setActiveModal('EDIT');
  };

  const handleDelete = () => {
    setActiveModal('DELETE');
  };

  const handleView = async () => {
    if (!selectedUser) return;
    setActiveModal('VIEW');
    setSelectedUserDetails(null);
    setLoadingDetails(true);

    try {
      const res = await apiService.getUserById(selectedUser.id);
      const fullData = res?.user || res?.data || res;
      if (fullData && fullData.id) {
        setSelectedUserDetails(fullData);
      }
    } catch (err) {
      console.warn('Notice loading user details from API:', err?.message || err);
    } finally {
      setLoadingDetails(false);
    }
  };

  const confirmEdit = async () => {
    if (!selectedUser?.id) return;
    if (!editFormData.phone || editFormData.phone.trim().length !== 10) {
      Alert.alert('Validation Error', 'Please enter a valid 10-digit phone number');
      return;
    }

    try {
      const birthYearVal = editFormData.dateOfYear.trim() ? parseInt(editFormData.dateOfYear.trim(), 10) : null;
      await apiService.updateUser(selectedUser.id, {
        name: editFormData.name.trim(),
        phone: editFormData.phone.trim(),
        role: editFormData.type === 'admin' ? 'ADMIN' : (selectedUser.role || 'COMMON_CUSTOMER'),
        type: editFormData.type === 'admin' ? 'Admin' : 'User',
        occupation: editFormData.occupation.trim(),
        shopName: editFormData.shopName.trim(),
        shop_name: editFormData.shopName.trim(),
        address: editFormData.address.trim(),
        city: editFormData.city.trim(),
        birthYear: birthYearVal,
        birth_year: birthYearVal,
        dateOfBirth: birthYearVal ? `${birthYearVal}-01-01` : null,
        date_of_birth: birthYearVal ? `${birthYearVal}-01-01` : null,
      });

      setUsers(
        users.map((user) =>
          user.id === selectedUser.id
            ? {
                ...user,
                name: editFormData.name.trim(),
                phone: editFormData.phone.trim(),
                type: editFormData.type === 'admin' ? 'Admin' : 'User',
                role: editFormData.type === 'admin' ? 'ADMIN' : (user.role || 'COMMON_CUSTOMER'),
                occupation: editFormData.occupation.trim(),
                shopName: editFormData.shopName.trim(),
                shop_name: editFormData.shopName.trim(),
                address: editFormData.address.trim(),
                city: editFormData.city.trim(),
                birthYear: birthYearVal,
                dateOfBirth: birthYearVal ? `${birthYearVal}-01-01` : user.dateOfBirth,
              }
            : user,
        ),
      );
      if (refreshData) refreshData();
      Alert.alert('Success', 'User profile updated successfully');
      setActiveModal(null);
    } catch (error) {
      console.error('Error updating user:', error);
      Alert.alert('Error', error?.message || 'An error occurred while updating the user');
    }
  };

  const confirmDelete = async () => {
    if (!selectedUser?.id) return;

    try {
      await apiService.updateUserStatus(selectedUser.id, 'INACTIVE', 'Removed via Manage Users').catch(() => {});
      setUsers(users.filter((user) => user.id !== selectedUser.id));
      if (refreshData) refreshData();
      Alert.alert('Success', 'User deleted successfully');
    } catch (error) {
      console.error('Error deleting user:', error);
      Alert.alert('Error', error?.message || 'An error occurred while deleting the user');
    } finally {
      setActiveModal(null);
    }
  };

  const content = (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      {/* Header */}
      <Header
        title="Manage Users"
        onBack={handleDismiss}
        showBackButton={true}
        showDivider={true}
      />

      {/* Search Bar */}
      <View style={customStyles.searchContainer}>
        <View style={customStyles.searchBar}>
          <MaterialCommunityIcons name="magnify" size={22} color="#6B7280" />
          <TextInput
            style={customStyles.searchInput}
            placeholder="Search users..."
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

      {/* Users List */}
      <ScrollView
        style={customStyles.content}
        showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <>
            <UserRowSkeleton />
            <UserRowSkeleton />
            <UserRowSkeleton />
            <UserRowSkeleton />
            <UserRowSkeleton />
          </>
        ) : filteredUsers.length > 0 ? (
          filteredUsers.map((user) => {
            const buttonRef =
              menuButtonRefs.current[user.id] ||
              (menuButtonRefs.current[user.id] = React.createRef());
            const userType = (user.type || user.role || '').toString().toLowerCase();
            const isAdmin = userType.includes('admin');
            const displayName = user.name || user.full_name || user.nickname || 'Unnamed';
            const displayPhone = user.phone || 'N/A';
            return (
              <View key={user.id} style={customStyles.userCard}>
                <View style={customStyles.userInfo}>
                  <View
                    style={[
                      customStyles.userIconContainer,
                      {
                        backgroundColor: isAdmin ? '#EDE9FE' : '#DBEAFE',
                        overflow: 'hidden',
                      },
                    ]}>
                    {getAvatarUrl(user.profile_image || user.avatar) ? (
                      <Image
                        source={{ uri: getAvatarUrl(user.profile_image || user.avatar) }}
                        style={{ width: 40, height: 40, borderRadius: 20 }}
                      />
                    ) : (
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: '700',
                          color: isAdmin ? '#7C3AED' : '#3B82F6',
                        }}>
                        {displayName.charAt(0).toUpperCase()}
                      </Text>
                    )}
                  </View>
                  <View>
                    <Text style={customStyles.userName}>{displayName}</Text>
                    <Text style={customStyles.userPhone}>{displayPhone}</Text>
                  </View>
                </View>
                <TouchableOpacity
                  ref={buttonRef}
                  onPress={() => handleMenuPress(user, buttonRef)}
                  style={customStyles.menuButton}>
                  <MaterialCommunityIcons
                    name="dots-vertical"
                    size={22}
                    color="#6B7280"
                  />
                </TouchableOpacity>
              </View>
            );
          })
        ) : (
          <View style={customStyles.emptyState}>
            <MaterialCommunityIcons
              name="account-search-outline"
              size={64}
              color="#D1D5DB"
            />
            <Text style={customStyles.emptyStateText}>No users found</Text>
          </View>
        )}
      </ScrollView>

      {/* Actions Menu Modal */}
      <Modal
        visible={activeModal === 'MENU'}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setActiveModal(null)}>
        <Pressable
          style={customStyles.menuOverlay}
          onPress={() => setActiveModal(null)}>
          <View
            style={[
              customStyles.menuModal,
              { top: menuPosition.top, right: menuPosition.right },
            ]}>
            <TouchableOpacity
              style={customStyles.menuItem}
              onPress={handleView}>
              <MaterialCommunityIcons
                name="eye-outline"
                size={20}
                color="#4B5563"
              />
              <Text style={customStyles.menuText}>View Details</Text>
            </TouchableOpacity>
            <View style={customStyles.menuDivider} />
            <TouchableOpacity
              style={customStyles.menuItem}
              onPress={handleEdit}>
              <MaterialCommunityIcons
                name="pencil-outline"
                size={20}
                color="#3B82F6"
              />
              <Text style={[customStyles.menuText, { color: '#3B82F6' }]}>
                Edit User
              </Text>
            </TouchableOpacity>
            <View style={customStyles.menuDivider} />
            <TouchableOpacity
              style={customStyles.menuItem}
              onPress={handleDelete}>
              <MaterialCommunityIcons
                name="delete-outline"
                size={20}
                color="#EF4444"
              />
              <Text style={[customStyles.menuText, { color: '#EF4444' }]}>
                Delete User
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        visible={activeModal === 'EDIT'}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setActiveModal(null)}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={customStyles.centeredModalOverlay}>
          <View style={customStyles.modalContainer}>
            <View style={customStyles.modalHeader}>
              <TouchableOpacity onPress={() => setActiveModal(null)}>
                <MaterialCommunityIcons
                  name="arrow-left"
                  size={24}
                  color="#000000"
                />
              </TouchableOpacity>
              <Text style={customStyles.modalTitle}>Edit User</Text>
              <View style={{ width: 24 }} />
            </View>
            <View style={customStyles.modalHeaderSeparator} />

            <ScrollView style={customStyles.modalContent}>
              {/* Full Name */}
              <View style={customStyles.inputGroup}>
                <View style={customStyles.labelContainer}>
                  <MaterialCommunityIcons
                    name="account-outline"
                    size={20}
                    color="#000000"
                  />
                  <Text style={styles.inputLabel}>Full Name</Text>
                  <Text style={styles.requiredStar}>*</Text>
                </View>
                <TextInput
                  style={styles.textInput}
                  value={editFormData.name}
                  onChangeText={(val) => setEditFormData((prev) => ({ ...prev, name: val.replace(/[<>&'"]/g, '') }))}
                  placeholder="Enter full name"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              {/* Phone Number */}
              <View style={customStyles.inputGroup}>
                <View style={customStyles.labelContainer}>
                  <MaterialCommunityIcons
                    name="phone-outline"
                    size={20}
                    color="#000000"
                  />
                  <Text style={styles.inputLabel}>Phone Number</Text>
                  <Text style={styles.requiredStar}>*</Text>
                </View>
                <TextInput
                  style={styles.textInput}
                  value={editFormData.phone}
                  onChangeText={(val) => setEditFormData((prev) => ({ ...prev, phone: val.replace(/[^0-9]/g, '') }))}
                  keyboardType="phone-pad"
                  maxLength={10}
                  placeholder="Enter 10-digit phone number"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              {/* Occupation / Profession */}
              <View style={customStyles.inputGroup}>
                <View style={customStyles.labelContainer}>
                  <MaterialCommunityIcons
                    name="briefcase-outline"
                    size={20}
                    color="#000000"
                  />
                  <Text style={styles.inputLabel}>Occupation / Profession</Text>
                </View>
                <TextInput
                  style={styles.textInput}
                  value={editFormData.occupation}
                  onChangeText={(val) => setEditFormData((prev) => ({ ...prev, occupation: val }))}
                  placeholder="e.g. Tailor, Fabrication Worker, Driver"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              {/* Shop / Enterprise Name */}
              <View style={customStyles.inputGroup}>
                <View style={customStyles.labelContainer}>
                  <MaterialCommunityIcons
                    name="store-outline"
                    size={20}
                    color="#000000"
                  />
                  <Text style={styles.inputLabel}>Shop / Stall Name</Text>
                </View>
                <TextInput
                  style={styles.textInput}
                  value={editFormData.shopName}
                  onChangeText={(val) => setEditFormData((prev) => ({ ...prev, shopName: val }))}
                  placeholder="e.g. Sri Balaji General Stores"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              {/* Birth Year */}
              <View style={customStyles.inputGroup}>
                <View style={customStyles.labelContainer}>
                  <MaterialCommunityIcons
                    name="calendar-blank"
                    size={20}
                    color="#000000"
                  />
                  <Text style={styles.inputLabel}>Birth Year</Text>
                </View>
                <TextInput
                  style={styles.textInput}
                  value={editFormData.dateOfYear}
                  onChangeText={(val) => setEditFormData((prev) => ({ ...prev, dateOfYear: val }))}
                  keyboardType="numeric"
                  maxLength={4}
                  placeholder="YYYY (e.g. 1990)"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              {/* Address */}
              <View style={customStyles.inputGroup}>
                <View style={customStyles.labelContainer}>
                  <MaterialCommunityIcons
                    name="map-marker-outline"
                    size={20}
                    color="#000000"
                  />
                  <Text style={styles.inputLabel}>Address</Text>
                </View>
                <TextInput
                  style={styles.textInput}
                  value={editFormData.address}
                  onChangeText={(val) => setEditFormData((prev) => ({ ...prev, address: val }))}
                  placeholder="e.g. 42 Bazaar Road, Saidapet"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              {/* City */}
              <View style={customStyles.inputGroup}>
                <View style={customStyles.labelContainer}>
                  <MaterialCommunityIcons
                    name="city"
                    size={20}
                    color="#000000"
                  />
                  <Text style={styles.inputLabel}>City</Text>
                </View>
                <TextInput
                  style={styles.textInput}
                  value={editFormData.city}
                  onChangeText={(val) => setEditFormData((prev) => ({ ...prev, city: val }))}
                  placeholder="e.g. Chennai"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              {/* User Role */}
              <View style={[customStyles.inputGroup, { marginBottom: 36 }]}>
                <View style={customStyles.labelContainer}>
                  <MaterialCommunityIcons
                    name="account-group-outline"
                    size={20}
                    color="#000000"
                  />
                  <Text style={styles.inputLabel}>User Role</Text>
                  <Text style={styles.requiredStar}>*</Text>
                </View>
                <View style={customStyles.typeSelector}>
                  <TouchableOpacity
                    style={[
                      customStyles.typeOption,
                      editFormData.type === 'user' && customStyles.typeOptionActive,
                    ]}
                    onPress={() => setEditFormData((prev) => ({ ...prev, type: 'user' }))}>
                    <MaterialCommunityIcons
                      name="account"
                      size={18}
                      color={editFormData.type === 'user' ? '#3B82F6' : '#6B7280'}
                    />
                    <Text
                      style={[
                        customStyles.typeOptionText,
                        editFormData.type === 'user' && { color: '#3B82F6' },
                      ]}>
                      User
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      customStyles.typeOption,
                      editFormData.type === 'admin' && customStyles.typeOptionActive,
                    ]}
                    onPress={() => setEditFormData((prev) => ({ ...prev, type: 'admin' }))}>
                    <MaterialCommunityIcons
                      name="shield-crown"
                      size={18}
                      color={editFormData.type === 'admin' ? '#7C3AED' : '#6B7280'}
                    />
                    <Text
                      style={[
                        customStyles.typeOptionText,
                        editFormData.type === 'admin' && { color: '#7C3AED' },
                      ]}>
                      Admin
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={{ height: 28 }} />
            </ScrollView>

            <View style={customStyles.modalActions}>
              <TouchableOpacity
                style={customStyles.saveButtonFull}
                onPress={confirmEdit}>
                <MaterialCommunityIcons
                  name="check-circle-outline"
                  size={20}
                  color="#FFFFFF"
                />
                <Text style={[customStyles.buttonText, { color: '#FFFFFF' }]}>
                  Update User Profile
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ===== VIEW MODAL ===== */}
      <Modal
        visible={activeModal === 'VIEW'}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setActiveModal(null)}>
        <View style={customStyles.centeredModalOverlay}>
          <View style={customStyles.viewModalContainer}>
            <View style={customStyles.modalHeader}>
              <TouchableOpacity onPress={() => setActiveModal(null)}>
                <MaterialCommunityIcons
                  name="arrow-left"
                  size={24}
                  color="#000000"
                />
              </TouchableOpacity>
              <Text style={customStyles.viewModalTitle}>User Details</Text>
              <View style={{ width: 24 }} />
            </View>
            <View style={customStyles.modalHeaderSeparator} />

            <ScrollView
              style={customStyles.modalContent}
              contentContainerStyle={{ paddingBottom: 24 }}>
              {loadingDetails ? (
                <ViewDetailsSkeleton />
              ) : (() => {
                const effectiveUser = selectedUserDetails || selectedUser;
                if (!effectiveUser) return null;

                const displayName = effectiveUser.name || effectiveUser.full_name || effectiveUser.nickname || 'User';
                const isAdmin = String(effectiveUser.type || effectiveUser.role || '').toLowerCase().includes('admin');
                const avatar = getAvatarUrl(effectiveUser.profile_image || effectiveUser.avatar);

                return (
                  <>
                    {/* User Avatar Card Header */}
                    <View style={{ alignItems: 'center', marginVertical: 14 }}>
                      <View
                        style={{
                          width: 80,
                          height: 80,
                          borderRadius: 40,
                          backgroundColor: isAdmin ? '#EDE9FE' : '#DBEAFE',
                          justifyContent: 'center',
                          alignItems: 'center',
                          overflow: 'hidden',
                          borderWidth: 2,
                          borderColor: isAdmin ? '#7C3AED' : '#3B82F6',
                          marginBottom: 8,
                        }}>
                        {avatar ? (
                          <Image
                            source={{ uri: avatar }}
                            style={{ width: 80, height: 80, borderRadius: 40 }}
                          />
                        ) : (
                          <Text
                            style={{
                              fontSize: 32,
                              fontWeight: '800',
                              color: isAdmin ? '#7C3AED' : '#3B82F6',
                            }}>
                            {displayName.charAt(0).toUpperCase()}
                          </Text>
                        )}
                      </View>
                      <Text style={{ fontSize: 18, fontWeight: '800', color: '#1F2937' }}>
                        {displayName}
                      </Text>
                      <View
                        style={{
                          backgroundColor: isAdmin ? '#EDE9FE' : '#F3F4F6',
                          paddingHorizontal: 10,
                          paddingVertical: 4,
                          borderRadius: 12,
                          marginTop: 4,
                        }}>
                        <Text
                          style={{
                            color: isAdmin ? '#7C3AED' : '#4B5563',
                            fontSize: 12,
                            fontWeight: '700',
                          }}>
                          {effectiveUser.type || (isAdmin ? 'Admin' : 'User')}
                        </Text>
                      </View>
                    </View>

                    {/* Full Name */}
                    <View style={customStyles.inputGroup}>
                      <View style={customStyles.labelContainer}>
                        <MaterialCommunityIcons
                          name="account-outline"
                          size={20}
                          color="#000000"
                        />
                        <Text style={styles.inputLabel}>Full Name</Text>
                      </View>
                      <View style={customStyles.viewDataContainer}>
                        <Text style={customStyles.viewDataText}>{displayName}</Text>
                      </View>
                    </View>

                    {/* Phone Number */}
                    <View style={customStyles.inputGroup}>
                      <View style={customStyles.labelContainer}>
                        <MaterialCommunityIcons
                          name="phone-outline"
                          size={20}
                          color="#000000"
                        />
                        <Text style={styles.inputLabel}>Phone Number</Text>
                      </View>
                      <View style={customStyles.viewDataContainer}>
                        <Text style={customStyles.viewDataText}>
                          {effectiveUser.phone || 'N/A'}
                        </Text>
                      </View>
                    </View>

                    {/* Occupation / Profession */}
                    {effectiveUser.occupation ? (
                      <View style={customStyles.inputGroup}>
                        <View style={customStyles.labelContainer}>
                          <MaterialCommunityIcons
                            name="briefcase-outline"
                            size={20}
                            color="#000000"
                          />
                          <Text style={styles.inputLabel}>Occupation / Profession</Text>
                        </View>
                        <View style={customStyles.viewDataContainer}>
                          <Text style={customStyles.viewDataText}>
                            {effectiveUser.occupation}
                          </Text>
                        </View>
                      </View>
                    ) : null}

                    {/* Shop Name */}
                    {(effectiveUser.shop_name || effectiveUser.shopName) ? (
                      <View style={customStyles.inputGroup}>
                        <View style={customStyles.labelContainer}>
                          <MaterialCommunityIcons
                            name="store-outline"
                            size={20}
                            color="#000000"
                          />
                          <Text style={styles.inputLabel}>Shop / Stall Name</Text>
                        </View>
                        <View style={customStyles.viewDataContainer}>
                          <Text style={customStyles.viewDataText}>
                            {effectiveUser.shop_name || effectiveUser.shopName}
                          </Text>
                        </View>
                      </View>
                    ) : null}

                    {/* Birth Year / Date of Birth */}
                    {(effectiveUser.birthYear || effectiveUser.birth_year || effectiveUser.dateOfBirth || effectiveUser.date_of_birth) ? (
                      <View style={customStyles.inputGroup}>
                        <View style={customStyles.labelContainer}>
                          <MaterialCommunityIcons
                            name="calendar-blank"
                            size={20}
                            color="#000000"
                          />
                          <Text style={styles.inputLabel}>Date of Birth / Year</Text>
                        </View>
                        <View style={customStyles.viewDataContainer}>
                          <Text style={customStyles.viewDataText}>
                            {effectiveUser.birthYear || effectiveUser.birth_year || (effectiveUser.dateOfBirth ? String(effectiveUser.dateOfBirth).split('T')[0] : effectiveUser.yearOfBirth || 'N/A')}
                          </Text>
                        </View>
                      </View>
                    ) : null}

                    {/* Address & City */}
                    {(effectiveUser.address || effectiveUser.city) ? (
                      <View style={customStyles.inputGroup}>
                        <View style={customStyles.labelContainer}>
                          <MaterialCommunityIcons
                            name="map-marker-outline"
                            size={20}
                            color="#000000"
                          />
                          <Text style={styles.inputLabel}>Address / Location</Text>
                        </View>
                        <View style={customStyles.viewDataContainer}>
                          <Text style={customStyles.viewDataText}>
                            {[effectiveUser.address, effectiveUser.city].filter(Boolean).join(', ')}
                          </Text>
                        </View>
                      </View>
                    ) : null}

                    {/* Member Since */}
                    <View style={customStyles.inputGroup}>
                      <View style={customStyles.labelContainer}>
                        <MaterialCommunityIcons
                          name="calendar-check"
                          size={20}
                          color="#000000"
                        />
                        <Text style={styles.inputLabel}>Member Since</Text>
                      </View>
                      <View style={customStyles.viewDataContainer}>
                        <Text style={customStyles.viewDataText}>
                          {effectiveUser.dateJoined || (effectiveUser.joinedDate && effectiveUser.joinedDate !== 'N/A'
                            ? String(effectiveUser.joinedDate).split('T')[0]
                            : effectiveUser.createdAt
                            ? String(effectiveUser.createdAt).split('T')[0]
                            : 'N/A')}
                        </Text>
                      </View>
                    </View>

                    {/* Live Backend Loan Data or No-Loan State */}
                    {(() => {
                      const loanInfo = getUserLoanInfo(effectiveUser);
                      if (!loanInfo) {
                        return (
                          <View style={[customStyles.inputGroup, { marginBottom: 24 }]}>
                            <View style={customStyles.labelContainer}>
                              <MaterialCommunityIcons
                                name="cash-off"
                                size={20}
                                color="#94A3B8"
                              />
                              <Text style={styles.inputLabel}>Active Loan Details</Text>
                            </View>
                            <View style={[customStyles.viewDataContainer, { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0', borderWidth: 1 }]}>
                              <Text style={[customStyles.viewDataText, { color: '#64748B', fontStyle: 'italic' }]}>
                                No active loan or loan history
                              </Text>
                            </View>
                          </View>
                        );
                      }

                      return (
                        <>
                          <View style={customStyles.inputGroup}>
                            <View style={customStyles.labelContainer}>
                              <MaterialCommunityIcons
                                name="cash-multiple"
                                size={20}
                                color="#059669"
                              />
                              <Text style={styles.inputLabel}>Loan Amount Taken</Text>
                            </View>
                            <View style={[customStyles.viewDataContainer, { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0', borderWidth: 1 }]}>
                              <Text style={[customStyles.viewDataText, { color: '#047857', fontWeight: '700', fontSize: 17 }]}>
                                {loanInfo.amountText}
                              </Text>
                            </View>
                          </View>

                          <View style={[customStyles.inputGroup, { marginBottom: 24 }]}>
                            <View style={customStyles.labelContainer}>
                              <MaterialCommunityIcons
                                name="layers-outline"
                                size={20}
                                color="#6B46C1"
                              />
                              <Text style={styles.inputLabel}>Lending Scheme Type</Text>
                            </View>
                            <View style={[customStyles.viewDataContainer, { backgroundColor: '#F5F3FF', borderColor: '#DDD6FE', borderWidth: 1 }]}>
                              <Text style={[customStyles.viewDataText, { color: '#6B46C1', fontWeight: '700', fontSize: 16 }]}>
                                {loanInfo.schemeType}
                              </Text>
                            </View>
                          </View>
                        </>
                      );
                    })()}
                  </>
                );
              })()}
            </ScrollView>

            <View style={customStyles.modalActions}>
              <TouchableOpacity
                style={customStyles.saveButtonFull}
                onPress={() => setActiveModal(null)}>
                <Text style={[customStyles.buttonText, { color: '#FFFFFF' }]}>
                  Close
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={activeModal === 'DELETE'}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setActiveModal(null)}>
        <View style={customStyles.centeredModalOverlay}>
          <View style={customStyles.deleteModal}>
            <MaterialCommunityIcons
              name="alert-circle-outline"
              size={56}
              color="#F59E0B"
            />
            <Text style={customStyles.deleteTitle}>Confirm Deletion</Text>
            <Text style={customStyles.deleteMessage}>
              Are you sure you want to delete{' '}
              <Text style={{ fontWeight: 'bold' }}>
                {selectedUser?.name || selectedUser?.full_name || selectedUser?.nickname || 'this user'}
              </Text>
              ? This cannot be undone.
            </Text>
            <View style={customStyles.deleteActions}>
              <TouchableOpacity
                style={customStyles.cancelButton}
                onPress={() => setActiveModal(null)}>
                <Text style={customStyles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[customStyles.saveButton, { backgroundColor: '#EF4444' }]}
                onPress={confirmDelete}>
                <Text style={[customStyles.buttonText, { color: '#FFFFFF' }]}>
                  Delete
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );

  if (visible !== undefined) {
    return (
      <Modal visible={visible} animationType="slide" onRequestClose={handleDismiss}>
        {content}
      </Modal>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
  textInput: {
    height: 52,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#1F2937',
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Regular' : 'Poppins-Regular',
  },
});

const customStyles = StyleSheet.create({
  searchContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 58,
    marginBottom: -10,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#1F2937',
  },
  content: {
    flex: 1,
    paddingTop: 8,
    paddingHorizontal: 16,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
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
    marginTop: 2,
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Bold' : 'Poppins-Bold',
  },
  menuButton: {
    padding: 4,
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
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  menuModal: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    width: 220,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  menuText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
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
    maxHeight: '85%',
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
  inputGroup: {
    marginBottom: 15,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 6,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 10,
  },
  typeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: '#F3F4F6',
  },
  typeOptionActive: {
    borderColor: '#3B82F6',
    backgroundColor: '#FFFFFF',
  },
  typeOptionText: {
    fontSize: 15,
    fontWeight: '500',
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Medium' : 'Poppins-Medium',
  },
  modalActions: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: Platform.OS === 'android' ? 'Gilroy-SemiBold' : 'Poppins-SemiBold',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  saveButton: {
    flex: 1.5,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#3B82F6',
  },
  saveButtonFull: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#0066FF',
  },
  deleteModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    width: '90%',
    maxWidth: 360,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  deleteTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  deleteMessage: {
    fontSize: 15,
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  deleteActions: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  viewModalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    width: '90%',
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -5,
    },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 10,
    overflow: 'hidden',
  },
  viewModalTitle: {
    fontSize: 23,
    fontWeight: '600',
    color: '#111827',
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Bold' : 'Poppins-Bold',
  },
  viewDataContainer: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  viewDataText: {
    fontSize: 16,
    color: '#1F2937',
  },
});

export default ManageU;