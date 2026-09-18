import React from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Share,
  Alert,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { formatINR } from '../../../../utils/helpers';
import Colors from '../../../../theme/colors';

export const DigitalReceiptModal = ({ visible, onClose, receipt }) => {
  if (!visible || !receipt) return null;

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Finance App Digital Payment Receipt\nReceipt ID: ${receipt.receipt_id || receipt.id || 'RCP-8821'}\nAmount Paid: ₹${receipt.amount || 2000}\nLoan: ${receipt.loan_code || 'LN-2026'}\nDate: ${receipt.date || 'Today'}\nStatus: SUCCESS (Verified)`,
      });
    } catch (err) {
      Alert.alert('Share', 'Could not share receipt.');
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.topBadge}>
            <MaterialCommunityIcons name="check-decagram" size={32} color={Colors.success} />
            <Text style={styles.topTitle}>Payment Verified & Recorded</Text>
            <Text style={styles.topSub}>Digital Ledger Passbook Entry</Text>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            <View style={styles.amountBox}>
              <Text style={styles.amountLabel}>AMOUNT RECEIVED</Text>
              <Text style={styles.amountVal}>{formatINR(receipt.amount || 2000)}</Text>
              <View style={styles.modePill}>
                <Text style={styles.modePillText}>{receipt.payment_mode || receipt.mode || 'UPI DIGITAL'}</Text>
              </View>
            </View>

            <View style={styles.detailsBox}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Receipt Number</Text>
                <Text style={styles.detailVal}>{receipt.receipt_id || receipt.id || 'RCP-8821-2026'}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Loan Account</Text>
                <Text style={styles.detailVal}>{receipt.loan_code || 'LN-WK-2024-001'}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Borrower Name</Text>
                <Text style={styles.detailVal}>{receipt.customer_name || 'Borrower'}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Date & Time</Text>
                <Text style={styles.detailVal}>{receipt.date || new Date().toLocaleDateString()}</Text>
              </View>
              <View style={[styles.detailRow, { borderBottomWidth: 0 }]}>
                <Text style={styles.detailLabel}>Remaining Balance</Text>
                <Text style={[styles.detailVal, { color: Colors.error }]}>
                  {formatINR(receipt.remaining_balance || 0)}
                </Text>
              </View>
            </View>
          </ScrollView>

          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
              <MaterialCommunityIcons name="share-variant" size={18} color={Colors.primary} />
              <Text style={styles.shareBtnText}>Share</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Text style={styles.closeBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    width: '100%',
    maxWidth: 380,
    maxHeight: '85%',
    padding: 20,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  topBadge: {
    alignItems: 'center',
    marginBottom: 16,
  },
  topTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.gray800,
    marginTop: 6,
  },
  topSub: {
    fontSize: 11,
    color: Colors.gray200,
    marginTop: 2,
  },
  body: {
    maxHeight: 340,
  },
  amountBox: {
    backgroundColor: Colors.purpleTintLightest,
    borderWidth: 1,
    borderColor: Colors.purpleBorderLight,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  amountLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: 0.8,
  },
  amountVal: {
    fontSize: 26,
    fontWeight: '900',
    color: Colors.gray800,
    marginTop: 4,
  },
  modePill: {
    backgroundColor: Colors.white,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    marginTop: 8,
  },
  modePillText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.primary,
  },
  detailsBox: {
    backgroundColor: Colors.lightGray50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.lightGray400,
    paddingHorizontal: 14,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray200,
  },
  detailLabel: {
    fontSize: 12,
    color: Colors.gray200,
  },
  detailVal: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.gray800,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  shareBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.purpleTintLightest,
    borderWidth: 1,
    borderColor: Colors.purpleBorderLight,
    height: 44,
    borderRadius: 12,
  },
  shareBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  closeBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    height: 44,
    borderRadius: 12,
  },
  closeBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.white,
  },
});

export default DigitalReceiptModal;
