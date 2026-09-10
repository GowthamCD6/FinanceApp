import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { useApp } from '../../../../context/AppContext';
import { formatINR } from '../../../../utils/helpers';
import Icon from '../../../../components/common/Icon';

const AdminProfile = () => {
  const { currentUser, currentOrganization, logout, fundMetrics, customers } = useApp();

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [name, setName] = useState(currentUser?.name || 'Admin Officer');
  const [phone, setPhone] = useState(currentUser?.phone || '+91 98401 55678');
  const [email, setEmail] = useState(currentUser?.email || 'admin@apexmicro.in');
  const [route, setRoute] = useState('Triplicane & Mylapore Route 4');

  const handleSaveProfile = () => {
    Alert.alert('Profile Updated', 'Officer field credentials successfully updated.');
    setEditModalVisible(false);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Officer Hero Banner */}
      <View style={styles.heroCard}>
        <View style={styles.heroTop}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{name.charAt(0)}</Text>
          </View>
          <View style={styles.heroDetails}>
            <View style={styles.roleTag}>
              <Text style={styles.roleTagText}>FIELD OPERATIONS ADMIN</Text>
            </View>
            <Text style={styles.heroName}>{name}</Text>
            <Text style={styles.heroOrg}>{currentOrganization?.name || 'Apex Microfinance Ltd'}</Text>
          </View>
        </View>

        <View style={styles.heroDivider} />

        <View style={styles.heroFooter}>
          <View style={styles.statusPill}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>ACTIVE ON-FIELD</Text>
          </View>
          <TouchableOpacity
            style={styles.editProfileBtn}
            onPress={() => setEditModalVisible(true)}
            activeOpacity={0.8}
          >
            <Icon name="user" size={13} color="#2563EB" />
            <Text style={styles.editProfileBtnText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 4 FIELD METRICS SUMMARY */}
      <Text style={styles.sectionTitle}>Operating Scorecard</Text>
      <View style={styles.metricGrid}>
        <View style={styles.metricBox}>
          <Text style={styles.metricLabel}>TODAY RECOVERED</Text>
          <Text style={[styles.metricValue, { color: '#059669' }]}>
            {formatINR(fundMetrics?.todayCollection || 14200)}
          </Text>
          <Text style={styles.metricSub}>92% daily target</Text>
        </View>

        <View style={styles.metricBox}>
          <Text style={styles.metricLabel}>TOTAL COLLECTED</Text>
          <Text style={[styles.metricValue, { color: '#2563EB' }]}>
            ₹5,20,000
          </Text>
          <Text style={styles.metricSub}>Lifetime field recovery</Text>
        </View>

        <View style={styles.metricBox}>
          <Text style={styles.metricLabel}>ASSIGNED BORROWERS</Text>
          <Text style={[styles.metricValue, { color: '#7C3AED' }]}>
            {customers.length || 38}
          </Text>
          <Text style={styles.metricSub}>Active portfolio</Text>
        </View>

        <View style={styles.metricBox}>
          <Text style={styles.metricLabel}>COMPLIANCE SCORE</Text>
          <Text style={[styles.metricValue, { color: '#0284C7' }]}>
            99.4%
          </Text>
          <Text style={styles.metricSub}>Audit grade A+</Text>
        </View>
      </View>

      {/* OFFICER CONTACT & ROUTE CREDENTIALS */}
      <Text style={styles.sectionTitle}>Officer Identity & Territory</Text>
      <View style={styles.credentialsCard}>
        <View style={styles.credentialRow}>
          <View style={styles.credIconBox}>
            <Icon name="user" size={15} color="#475569" />
          </View>
          <View style={styles.credInfo}>
            <Text style={styles.credLabel}>EMPLOYEE ID</Text>
            <Text style={styles.credValue}>EMP-ADM-0428</Text>
          </View>
        </View>

        <View style={styles.rowDivider} />

        <View style={styles.credentialRow}>
          <View style={styles.credIconBox}>
            <Icon name="receipt" size={15} color="#475569" />
          </View>
          <View style={styles.credInfo}>
            <Text style={styles.credLabel}>PHONE NUMBER</Text>
            <Text style={styles.credValue}>{phone}</Text>
          </View>
        </View>

        <View style={styles.rowDivider} />

        <View style={styles.credentialRow}>
          <View style={styles.credIconBox}>
            <Icon name="document" size={15} color="#475569" />
          </View>
          <View style={styles.credInfo}>
            <Text style={styles.credLabel}>OFFICIAL EMAIL</Text>
            <Text style={styles.credValue}>{email}</Text>
          </View>
        </View>

        <View style={styles.rowDivider} />

        <View style={styles.credentialRow}>
          <View style={styles.credIconBox}>
            <Icon name="dashboard" size={15} color="#475569" />
          </View>
          <View style={styles.credInfo}>
            <Text style={styles.credLabel}>ASSIGNED ROUTE TERRITORY</Text>
            <Text style={styles.credValue}>{route}</Text>
          </View>
        </View>
      </View>

      {/* PRIVILEGES & SECURITY */}
      <Text style={styles.sectionTitle}>System Governance & Privileges</Text>
      <View style={styles.privilegeCard}>
        <View style={styles.privilegeItem}>
          <Icon name="check" size={15} color="#059669" />
          <Text style={styles.privilegeText}>Daily field cash & UPI collection authorization</Text>
        </View>
        <View style={styles.privilegeItem}>
          <Icon name="check" size={15} color="#059669" />
          <Text style={styles.privilegeText}>Borrower onboarding & credit limit inspection</Text>
        </View>
        <View style={styles.privilegeItem}>
          <Icon name="check" size={15} color="#059669" />
          <Text style={styles.privilegeText}>Account suspension and NPA flag governance</Text>
        </View>
        <View style={styles.privilegeItem}>
          <Icon name="check" size={15} color="#059669" />
          <Text style={styles.privilegeText}>Day-end vault settlement submission</Text>
        </View>
      </View>

      {/* LOGOUT BUTTON */}
      <TouchableOpacity
        style={styles.logoutBtn}
        onPress={() => {
          Alert.alert(
            'Confirm Sign Out',
            'Are you sure you want to end your active administrative shift?',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Sign Out', style: 'destructive', onPress: logout },
            ]
          );
        }}
        activeOpacity={0.8}
      >
        <Icon name="close" size={15} color="#DC2626" />
        <Text style={styles.logoutBtnText}>Sign Out of Admin Console</Text>
      </TouchableOpacity>

      {/* EDIT PROFILE MODAL */}
      <Modal visible={editModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Officer Profile</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <Icon name="close" size={16} color="#64748B" />
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.fieldLabel}>FULL NAME</Text>
              <TextInput style={styles.fieldInput} value={name} onChangeText={setName} />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.fieldLabel}>CONTACT PHONE</Text>
              <TextInput style={styles.fieldInput} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.fieldLabel}>EMAIL ADDRESS</Text>
              <TextInput style={styles.fieldInput} value={email} onChangeText={setEmail} keyboardType="email-address" />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.fieldLabel}>ASSIGNED ROUTE TERRITORY</Text>
              <TextInput style={styles.fieldInput} value={route} onChangeText={setRoute} />
            </View>

            <TouchableOpacity style={styles.saveBtn} onPress={handleSaveProfile}>
              <Icon name="check" size={16} color="#FFFFFF" />
              <Text style={styles.saveBtnText}>Save Credentials</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    padding: 16,
    paddingBottom: 50,
  },
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 18,
    marginBottom: 20,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  heroDetails: {
    flex: 1,
  },
  roleTag: {
    backgroundColor: '#EFF6FF',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 4,
  },
  roleTagText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#2563EB',
    letterSpacing: 0.5,
  },
  heroName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  heroOrg: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  heroDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 14,
  },
  heroFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#059669',
    marginRight: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#059669',
    letterSpacing: 0.5,
  },
  editProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    backgroundColor: '#EFF6FF',
  },
  editProfileBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#475569',
    letterSpacing: 0.6,
    marginBottom: 10,
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  metricBox: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
  },
  metricLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748B',
    marginBottom: 6,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '900',
  },
  metricSub: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 4,
  },
  credentialsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    marginBottom: 20,
  },
  credentialRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  credIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  credInfo: {
    flex: 1,
  },
  credLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748B',
  },
  credValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 2,
  },
  rowDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  privilegeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    gap: 10,
    marginBottom: 20,
  },
  privilegeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  privilegeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
    flex: 1,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FECACA',
    paddingVertical: 14,
    borderRadius: 10,
  },
  logoutBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#DC2626',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 36,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  formGroup: {
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 4,
  },
  fieldInput: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
    color: '#0F172A',
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 10,
  },
  saveBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default AdminProfile;
