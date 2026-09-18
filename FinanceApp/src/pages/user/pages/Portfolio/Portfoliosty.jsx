import { StyleSheet } from 'react-native';
import Colors from '../../../../theme/colors';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.gray800,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.gray200,
    marginTop: 2,
  },
  selectorRow: {
    flexDirection: 'row',
    backgroundColor: Colors.lightGray100,
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  selectorChip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeSelectorChip: {
    backgroundColor: Colors.primary, // #6B46C1
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  selectorChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.gray350, // #4B5563
  },
  activeChipText: {
    color: Colors.white,
    fontWeight: '700',
  },
  loanCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EFF2F5',
    padding: 16,
    marginBottom: 14,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  loanTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  loanCode: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.gray800,
  },
  loanPurpose: {
    fontSize: 12,
    color: Colors.gray200,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: Colors.lightGray50,
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
    justifyContent: 'space-around',
  },
  statCol: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 10,
    color: Colors.gray200,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  statValue: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.gray800,
    marginTop: 2,
  },
  payButton: {
    backgroundColor: Colors.primary, // #6B46C1
    borderRadius: 12,
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  payButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  emptyCard: {
    backgroundColor: Colors.lightGray50,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.lightGray400,
  },
  emptyText: {
    fontSize: 13,
    color: Colors.gray200,
    marginTop: 8,
  },
});
