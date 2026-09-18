import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useApp } from '../../../../context/AppContext';
import { formatINR } from '../../../../utils/helpers';
import styles from './Portfoliosty';
import Colors from '../../../../theme/colors';

export const Portfolio = ({ onSelectLoan }) => {
  const { loans = [], currentUser } = useApp();
  const [activeTab, setActiveTab] = useState('ACTIVE'); // 'ACTIVE' | 'COMPLETED'

  const userLoans = loans.filter((l) => l.customerId === currentUser?.id || l.borrowerPhone === currentUser?.phone);
  const activeLoans = userLoans.filter((l) => l.status === 'DISBURSED' || l.status === 'ACTIVE' || l.status === 'OVERDUE');
  const completedLoans = userLoans.filter((l) => l.status === 'COMPLETED' || l.status === 'CLOSED');

  const displayedLoans = activeTab === 'ACTIVE' ? activeLoans : completedLoans;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>My Portfolio</Text>
        <Text style={styles.subtitle}>Track active borrowings, installments and closed cycles</Text>
      </View>

      {/* Filter Selector Chips */}
      <View style={styles.selectorRow}>
        <TouchableOpacity
          style={[styles.selectorChip, activeTab === 'ACTIVE' && styles.activeSelectorChip]}
          onPress={() => setActiveTab('ACTIVE')}
          activeOpacity={0.8}
        >
          <Text style={[styles.selectorChipText, activeTab === 'ACTIVE' && styles.activeChipText]}>
            Active Loans ({activeLoans.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.selectorChip, activeTab === 'COMPLETED' && styles.activeSelectorChip]}
          onPress={() => setActiveTab('COMPLETED')}
          activeOpacity={0.8}
        >
          <Text style={[styles.selectorChipText, activeTab === 'COMPLETED' && styles.activeChipText]}>
            Completed ({completedLoans.length})
          </Text>
        </TouchableOpacity>
      </View>

      {displayedLoans.length === 0 ? (
        <View style={styles.emptyCard}>
          <MaterialCommunityIcons name="file-document-outline" size={36} color={Colors.gray100} />
          <Text style={styles.emptyText}>
            No {activeTab.toLowerCase()} loans found.
          </Text>
        </View>
      ) : (
        displayedLoans.map((loan) => (
          <TouchableOpacity
            key={loan.id}
            style={styles.loanCard}
            onPress={() => onSelectLoan && onSelectLoan(loan)}
            activeOpacity={0.85}
          >
            <View style={styles.loanTop}>
              <View>
                <Text style={styles.loanCode}>{loan.loan_code || 'LOAN-001'}</Text>
                <Text style={styles.loanPurpose}>{loan.purpose || 'Business Expansion'}</Text>
              </View>
              <View style={{
                backgroundColor: loan.status === 'COMPLETED' ? Colors.successBg : Colors.purpleTintLightest,
                paddingHorizontal: 8,
                paddingVertical: 3,
                borderRadius: 6,
              }}>
                <Text style={{
                  fontSize: 10,
                  fontWeight: '800',
                  color: loan.status === 'COMPLETED' ? Colors.success : Colors.primary,
                }}>
                  {loan.status}
                </Text>
              </View>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statCol}>
                <Text style={styles.statLabel}>Principal</Text>
                <Text style={styles.statValue}>{formatINR(loan.principal || 0)}</Text>
              </View>
              <View style={styles.statCol}>
                <Text style={styles.statLabel}>Balance</Text>
                <Text style={[styles.statValue, { color: Colors.error }]}>
                  {formatINR(loan.balance || 0)}
                </Text>
              </View>
              <View style={styles.statCol}>
                <Text style={styles.statLabel}>Daily Due</Text>
                <Text style={styles.statValue}>{formatINR(loan.daily_installment || 0)}</Text>
              </View>
            </View>

            {loan.status !== 'COMPLETED' && (
              <TouchableOpacity
                style={styles.payButton}
                onPress={() => onSelectLoan && onSelectLoan(loan)}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons name="credit-card-outline" size={18} color={Colors.white} />
                <Text style={styles.payButtonText}>Pay Installment</Text>
              </TouchableOpacity>
            )}
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );
};

export default Portfolio;
