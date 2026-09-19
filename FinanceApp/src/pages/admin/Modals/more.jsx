import React, { useState } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Platform,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AddUser from './page/AddUser/AddU.jsx';
import ManageU from './page/ManageUser/ManageU.jsx';
import InterestRatesModal from './page/InterestRates/InterestRatesModal.jsx';

const MoreModal = ({ visible, onClose, onAction }) => {
  const [showAddUser, setShowAddUser] = useState(false);
  const [showManageUser, setShowManageUser] = useState(false);
  const [showInterestRates, setShowInterestRates] = useState(false);

  const handleAddUserPress = () => {
    if (onAction) {
      onAction('add_user');
    } else {
      setShowAddUser(true);
    }
  };

  const handleManageUserPress = () => {
    if (onAction) {
      onAction('manage_users');
    } else {
      setShowManageUser(true);
    }
  };

  const handleInterestRatesPress = () => {
    if (onAction) {
      onAction('interest_rates');
    } else {
      setShowInterestRates(true);
    }
  };

  const handleAddUserBack = () => {
    setShowAddUser(false);
  };

  const handleManageUserBack = () => {
    setShowManageUser(false);
  };

  const handleInterestRatesBack = () => {
    setShowInterestRates(false);
  };

  const handleModalClose = () => {
    setShowAddUser(false);
    setShowManageUser(false);
    setShowInterestRates(false);
    if (onClose) onClose();
  };

  if (showAddUser) {
    return (
      <Modal
        animationType="slide"
        transparent={false}
        visible={visible}
        onRequestClose={handleAddUserBack}
      >
        <AddUser onBack={handleAddUserBack} onClose={handleModalClose} />
      </Modal>
    );
  }

  if (showManageUser) {
    return (
      <Modal
        animationType="slide"
        transparent={false}
        visible={visible}
        onRequestClose={handleManageUserBack}
      >
        <ManageU
          onBack={handleManageUserBack}
          onClose={handleModalClose}
          onOpenAddUser={() => {
            setShowManageUser(false);
            setShowAddUser(true);
          }}
        />
      </Modal>
    );
  }

  if (showInterestRates) {
    return (
      <Modal
        animationType="slide"
        transparent={false}
        visible={visible}
        onRequestClose={handleInterestRatesBack}
      >
        <InterestRatesModal onBack={handleInterestRatesBack} onClose={handleInterestRatesBack} />
      </Modal>
    );
  }

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity
          style={styles.container}
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Handle bar */}
          <View style={styles.handleBar} />

          {/* Modal Content */}
          <View style={styles.menuList}>
            <MenuItem
              icon={<MaterialCommunityIcons name="account-plus" size={24} color="#6B46C1" />}
              title="Add User"
              description="Onboard new borrower and configure loan terms"
              onPress={handleAddUserPress}
            />
            <MenuItem
              icon={<MaterialCommunityIcons name="account-cog" size={24} color="#6B46C1" />}
              title="Manage User"
              description="View or manage existing borrowers & statuses"
              onPress={handleManageUserPress}
            />
            <MenuItem
              icon={<MaterialCommunityIcons name="percent" size={24} color="#6B46C1" />}
              title="Interest Rates"
              description="Configure Daily, Weekly & Monthly lending rates"
              onPress={handleInterestRatesPress}
            />
          </View>

          {/* X Button */}
          <TouchableOpacity style={styles.xButton} onPress={handleModalClose} activeOpacity={0.8}>
            <Text style={styles.xButtonText}>×</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const MenuItem = ({ icon, title, description, onPress }) => (
  <TouchableOpacity style={styles.menuItemRow} onPress={onPress} activeOpacity={onPress ? 0.7 : 1}>
    <View style={styles.menuIconWrap}>
      <View style={styles.menuIconCircle}>
        {icon}
      </View>
    </View>
    <View style={styles.menuTextWrap}>
      <Text style={styles.menuTitle}>{title}</Text>
      <Text style={styles.menuDesc}>{description}</Text>
    </View>
    <MaterialCommunityIcons name="chevron-right" size={20} color="#9CA3AF" />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 14,
    paddingHorizontal: 0,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    minHeight: 300,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
  },
  handleBar: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E5E7EB',
    marginBottom: 12,
  },
  menuList: {
    width: '100%',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  menuItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  menuIconWrap: {
    marginRight: 16,
  },
  menuIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F3F0FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuTextWrap: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2D1E5B',
    marginBottom: 2,
  },
  menuDesc: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  xButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#6B46C1',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 8,
    shadowColor: '#6B46C1',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 5,
  },
  xButtonText: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '600',
    marginTop: -3,
    lineHeight: 34,
  },
});

export default MoreModal;
