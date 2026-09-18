import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useApp } from '../../../../context/AppContext';
import { formatINR } from '../../../../utils/helpers';
import DigitalReceiptModal from '../../Modals/Pages/DigitalReceiptModal';
import styles from './Homesty';
import Colors from '../../../../theme/colors';

const MetricCard = ({ title, value, change, isPositive, color = Colors.secondaryBlue, iconName }) => {
  const iconMap = {
    loans: 'file-document-outline',
    check: 'check-circle-outline',
    receipt: 'receipt-text-outline',
    calendar: 'calendar-clock-outline',
  };

  return (
    <View style={styles.card}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <Text style={{ fontSize: 11, fontWeight: '700', color: Colors.gray200, textTransform: 'uppercase' }} numberOfLines={1}>
          {title}
        </Text>
        {iconName ? (
          <View style={{ width: 28, height: 28, borderRadius: 6, alignItems: 'center', justifyContent: 'center', backgroundColor: `${color}15` }}>
            <MaterialCommunityIcons name={iconMap[iconName] || 'chart-line'} size={14} color={color} />
          </View>
        ) : null}
      </View>
      <Text style={{ fontSize: 18, fontWeight: '800', color: Colors.gray800 }}>{value}</Text>
      {change ? (
        <Text style={{ fontSize: 10, fontWeight: '700', marginTop: 2, color: isPositive ? Colors.success : Colors.error }}>
          {change}
        </Text>
      ) : null}
    </View>
  );
};

export const Home = ({ onNavigate }) => {
  const { loans = [], payments = [], currentUser } = useApp();
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  const myLoans = loans.filter((l) => l.customerId === currentUser?.id || l.borrowerPhone === currentUser?.phone);
  const activeLoans = myLoans.filter((l) => l.status === 'DISBURSED');
  const activeLoan = activeLoans[0] || myLoans[0];

  const totalBorrowed = myLoans.reduce((sum, l) => sum + (l.principal || 0), 0);
  const totalRepaid = payments
    .filter((p) => myLoans.some((l) => l.id === p.loanId))
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const outstandingBalance = activeLoans.reduce((sum, l) => sum + (l.balance || 0), 0);
  const repaymentRatio = totalBorrowed > 0 ? Math.round((totalRepaid / (totalBorrowed * 1.15)) * 100) : 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome back</Text>
        <Text style={styles.userName}>{currentUser?.name || 'Borrower'}</Text>
      </View>

      <View style={styles.grid}>
        <View style={styles.gridItem}>
          <MetricCard
            title="Total Borrowed"
            value={formatINR(totalBorrowed)}
            color={Colors.primary}
            iconName="loans"
          />
        </View>
        <View style={styles.gridItem}>
          <MetricCard
            title="Outstanding"
            value={formatINR(outstandingBalance)}
            color={Colors.secondaryBlue}
            iconName="calendar"
          />
        </View>
        <View style={styles.gridItem}>
          <MetricCard
            title="Total Repaid"
            value={formatINR(totalRepaid)}
            color={Colors.success}
            iconName="check"
          />
        </View>
        <View style={styles.gridItem}>
          <MetricCard
            title="Active Loans"
            value={String(activeLoans.length)}
            color={Colors.purpleBorderLight}
            iconName="receipt"
          />
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.progressHeader}>
          <Text style={styles.cardTitle}>Repayment Progress</Text>
          <Text style={styles.progressPercentage}>{repaymentRatio}%</Text>
        </View>
        <View style={styles.barBackground}>
          <View style={[styles.barFill, { width: `${Math.min(repaymentRatio, 100)}%` }]} />
        </View>
        <View style={styles.progressLabels}>
          <Text style={styles.progressLabelLeft}>Repaid: {formatINR(totalRepaid)}</Text>
          <Text style={styles.progressLabelRight}>Remaining: {formatINR(outstandingBalance)}</Text>
        </View>
        <Text style={styles.progressNote}>
          Prompt repayments improve your internal trust score and unlock higher credit limits.
        </Text>
      </View>

      {activeLoan ? (
        <View style={styles.card}>
          <View style={styles.activeLoanHeader}>
            <View>
              <Text style={styles.activeLoanTag}>CURRENT ACTIVE LOAN</Text>
              <Text style={styles.activeLoanNumber}>{activeLoan.loan_code || 'LOAN-001'}</Text>
            </View>
            <View style={styles.statusBadge}>
              <Text style={styles.statusBadgeText}>{activeLoan.status}</Text>
            </View>
          </View>
          <View style={styles.activeLoanDetails}>
            <View style={styles.detailRow}>
              <Text style={styles.detailKey}>Principal Amount</Text>
              <Text style={styles.detailVal}>{formatINR(activeLoan.principal || 0)}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailKey}>Tenure</Text>
              <Text style={styles.detailVal}>{activeLoan.tenure_days || 100} Days</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailKey}>Daily Installment</Text>
              <Text style={styles.detailVal}>{formatINR(activeLoan.daily_installment || 0)}</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.scheduleActionBtn}
            onPress={() => onNavigate && onNavigate('loans')}
          >
            <Text style={styles.scheduleActionBtnText}>View Repayment Schedule</Text>
            <MaterialCommunityIcons name="chevron-right" size={18} color={Colors.secondaryBlue} />
          </TouchableOpacity>
        </View>
      ) : null}

      <View style={styles.quickGrid}>
        <TouchableOpacity
          style={styles.quickBtn}
          onPress={() => onNavigate && onNavigate('loans')}
        >
          <View style={styles.quickIconBox}>
            <MaterialCommunityIcons name="file-document-outline" size={18} color={Colors.primary} />
          </View>
          <Text style={styles.quickBtnTitle}>My Loans</Text>
          <Text style={styles.quickBtnSub}>Review ongoing loans</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.quickBtn}
          onPress={() => onNavigate && onNavigate('payments')}
        >
          <View style={styles.quickIconBox}>
            <MaterialCommunityIcons name="receipt-text-outline" size={18} color={Colors.success} />
          </View>
          <Text style={styles.quickBtnTitle}>Payment Receipts</Text>
          <Text style={styles.quickBtnSub}>Digital proofs</Text>
        </TouchableOpacity>
      </View>

      {selectedReceipt && (
        <DigitalReceiptModal
          visible={!!selectedReceipt}
          receipt={selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
        />
      )}
    </ScrollView>
  );
};

export default Home;
