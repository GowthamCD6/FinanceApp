import { StyleSheet, Platform } from 'react-native';

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Bold' : 'Poppins-Bold',
    color: '#4A5E6D',
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  image: {
    resizeMode: 'contain',
    alignSelf: 'center',
  },
  mainText: {
    color: '#111827',
    letterSpacing: 1,
    fontSize: 26,
    fontWeight: '800',
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Bold' : 'Poppins-Bold',
    textAlign: 'center',
    marginTop: 18,
  },
  text2: {
    color: '#4B5563',
    fontSize: 15,
    fontWeight: '500',
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Medium' : 'Poppins-Medium',
    letterSpacing: 0.3,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 20,
    lineHeight: 22,
  },
  pressablebtn: {
    marginTop: 28,
    alignSelf: 'center',
  },
  btn: {
    width: 220,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2842C4',
    borderRadius: 12,
    shadowColor: '#2842C4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  btntext: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '700',
    fontFamily: Platform.OS === 'android' ? 'Gilroy-Bold' : 'Poppins-Bold',
    letterSpacing: 1,
  },
});

export default styles;
