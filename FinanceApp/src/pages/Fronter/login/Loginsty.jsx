import { StyleSheet, Dimensions, Platform } from 'react-native';

const { height, width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContainer: {
    flexGrow: 1,
    minHeight: height * 0.9,
    backgroundColor: '#FFFFFF',
    paddingBottom: 30,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 12,
  },
  headerContainer: {
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingHorizontal: 24,
  },
  hi: {
    color: '#1A1A2E',
    fontSize: 30,
    fontWeight: '800',
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Bold' : 'Poppins-Bold',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  sectoptext: {
    color: '#6B7280',
    fontSize: 15,
    fontWeight: '500',
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Medium' : 'Poppins-Medium',
    marginBottom: 10,
  },
  decorativeLine: {
    width: 60,
    height: 4,
    backgroundColor: '#2842C4',
    borderRadius: 2,
    marginTop: 4,
  },
  imageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  logimg: {
    alignSelf: 'center',
    width: 250,
    height: 180,
    resizeMode: 'contain',
  },

  // Google Social Sign In
  googleContainer: {
    marginHorizontal: 24,
    marginBottom: 16,
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    height: 52,
  },
  googleIconCircle: {
    marginRight: 10,
  },
  googleBtnText: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: Platform.OS === 'android' ? 'Gilroy-SemiBold' : 'Poppins-SemiBold',
    color: '#1F2937',
  },

  // Divider
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 24,
    marginBottom: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 11,
    fontWeight: '700',
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Bold' : 'Poppins-Bold',
    color: '#9CA3AF',
    letterSpacing: 0.8,
  },

  // Inputs
  inputcontainer: {
    marginHorizontal: 24,
    gap: 14,
  },
  inputWrapper: {
    position: 'relative',
  },
  passwordWrapper: {
    position: 'relative',
  },
  inputIconContainer: {
    position: 'absolute',
    left: 14,
    top: 17,
    zIndex: 10,
    backgroundColor: 'transparent',
  },
  input: {
    backgroundColor: '#FFFFFF',
    paddingLeft: 44,
    paddingRight: 16,
    fontSize: 15,
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Medium' : 'Poppins-Medium',
    color: '#111827',
    height: 54,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 14,
  },
  inputFocused: {
    borderColor: '#2842C4',
  },
  inputError: {
    borderColor: '#FF4444',
    backgroundColor: '#FEF2F2',
  },
  eyeIcon: {
    position: 'absolute',
    right: 12,
    top: 13,
    padding: 6,
    zIndex: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(40, 66, 196, 0.06)',
  },
  errorText: {
    color: '#FF4444',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 8,
    fontWeight: '500',
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Medium' : 'Poppins-Medium',
  },

  // Checkbox & Actions
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 24,
    paddingVertical: 4,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginRight: 10,
  },
  checkboxChecked: {
    backgroundColor: '#2842C4',
    borderColor: '#2842C4',
  },
  checkboxText: {
    fontSize: 13,
    fontWeight: '500',
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Medium' : 'Poppins-Medium',
    color: '#4B5563',
    flex: 1,
    lineHeight: 18,
  },
  linkText: {
    color: '#2842C4',
    fontWeight: '700',
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Bold' : 'Poppins-Bold',
    textDecorationLine: 'underline',
  },
  btn: {
    width: width * 0.88,
    maxWidth: 400,
    height: 54,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2842C4',
    borderRadius: 16,
  },
  btntext: {
    color: '#FFFFFF',
    fontSize: 15,
    textAlign: 'center',
    fontWeight: '700',
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Bold' : 'Poppins-Bold',
    letterSpacing: 1,
  },
  arrowIcon: {
    marginLeft: 8,
  },
  pressablebtn: {
    alignSelf: 'center',
    borderRadius: 16,
  },
  lowercontainer: {
    marginTop: 20,
    gap: 18,
  },

  // Modal Dialog Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalContent: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 10,
  },
  errorIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Bold' : 'Poppins-Bold',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 13,
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Medium' : 'Poppins-Medium',
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 20,
  },
  modalButton: {
    width: '100%',
    height: 48,
    backgroundColor: '#2842C4',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Bold' : 'Poppins-Bold',
  },
});

export default styles;
