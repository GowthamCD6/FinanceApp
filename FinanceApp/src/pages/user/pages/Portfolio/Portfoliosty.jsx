import { StyleSheet } from 'react-native';
import { Colors, Fonts } from '../../../../theme';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
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
    fontFamily: Fonts.gilroy.bold,
    color: Colors.gray800,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.gray200,
    fontFamily: Fonts.gilroy.regular,
    marginTop: 2,
  },
  selectorRow: {
    flexDirection: 'row',
    backgroundColor: Colors.backgroundContainer, // #F3F4F6
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.lightGray400,
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
    fontFamily: Fonts.gilroy.medium,
    color: Colors.gray350, // #4B5563
  },
  activeChipText: {
    color: Colors.white,
    fontFamily: Fonts.gilroy.bold,
    fontWeight: '700',
  },
  loanCard: {
    backgroundColor: '#FFFFFF', // Pure White loan card as requested
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0', // Box side line width and darkness from reference
    padding: 16,
    marginBottom: 14,
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
    fontFamily: Fonts.gilroy.bold,
    color: '#1E1B4B', // Sleek deep title color from reference
  },
  loanPurpose: {
    fontSize: 12,
    color: Colors.gray200,
    fontFamily: Fonts.gilroy.regular,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
    justifyContent: 'space-around',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statCol: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 10,
    color: Colors.gray200,
    fontWeight: '600',
    fontFamily: Fonts.gilroy.medium,
    textTransform: 'uppercase',
  },
  statValue: {
    fontSize: 15,
    fontWeight: '800',
    fontFamily: Fonts.gilroy.bold,
    color: '#1E1B4B',
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
    fontFamily: Fonts.gilroy.bold,
  },
  emptyCard: {
    backgroundColor: Colors.backgroundContainer,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.lightGray400,
  },
  emptyText: {
    fontSize: 13,
    fontFamily: Fonts.gilroy.regular,
    color: Colors.gray200,
    marginTop: 8,
  },
});
