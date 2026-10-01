import { Platform } from 'react-native';

/**
 * Central Typography & Font Family Reference
 * Specification:
 * 1. Header Component Font:
 *    - Android: 'Roboto-Medium'
 *    - iOS: 'System'
 * 2. Pages Font Families:
 *    - Android:
 *      * Roboto Family: 'Roboto', 'Roboto-Regular', 'Roboto-Medium', 'Roboto-Bold', 'Roboto-Black', 'sans-serif-light'
 *      * Gilroy Family: 'Gilroy-Regular', 'Gilroy-Medium', 'Gilroy-SemiBold', 'Gilroy-Bold'
 *      * Poppins Family: 'Poppins-Regular', 'Poppins-Medium', 'Poppins-SemiBold', 'Poppins-Bold'
 *      * DM Sans: 'DMSans-Regular'
 *    - iOS:
 *      * 'System' (Default across most screens)
 *      * 'SF Pro Text', 'SF Pro Display' (Group Cards / UI cards)
 *      * 'Poppins' (Counterpart for Gilroy in Admin pages)
 */

export const Fonts = {
  // 1. Header Component Typography
  header: Platform.OS === 'android' ? 'Roboto-Medium' : 'System',

  // 2. Roboto Family (Android default, fallback to System on iOS)
  roboto: {
    regular: Platform.OS === 'android' ? 'Roboto' : 'System',
    normal: Platform.OS === 'android' ? 'Roboto-Regular' : 'System',
    medium: Platform.OS === 'android' ? 'Roboto-Medium' : 'System',
    bold: Platform.OS === 'android' ? 'Roboto-Bold' : 'System',
    black: Platform.OS === 'android' ? 'Roboto-Black' : 'System',
    light: Platform.OS === 'android' ? 'sans-serif-light' : 'System',
  },

  // 3. Gilroy Family (with iOS fallback to Poppins)
  gilroy: {
    regular: Platform.OS === 'android' ? 'Gilroy-Regular' : 'Poppins-Regular',
    medium: Platform.OS === 'android' ? 'Gilroy-Medium' : 'Poppins-Medium',
    semiBold: Platform.OS === 'android' ? 'Gilroy-SemiBold' : 'Poppins-SemiBold',
    bold: Platform.OS === 'android' ? 'Gilroy-Bold' : 'Poppins-Bold',
  },

  // 4. Poppins Family
  poppins: {
    regular: 'Poppins-Regular',
    medium: 'Poppins-Medium',
    semiBold: 'Poppins-SemiBold',
    bold: 'Poppins-Bold',
  },

  // 5. DM Sans Family
  dmSans: {
    regular: Platform.OS === 'android' ? 'DMSans-Regular' : 'System',
  },

  // 6. iOS Cards / Display Fonts (SF Pro)
  sfPro: {
    text: Platform.OS === 'ios' ? 'SF Pro Text' : 'Roboto-Regular',
    display: Platform.OS === 'ios' ? 'SF Pro Display' : 'Roboto-Medium',
  },

  // 7. Universal Page Defaults
  pageRegular: Platform.OS === 'android' ? 'Roboto-Regular' : 'System',
  pageMedium: Platform.OS === 'android' ? 'Roboto-Medium' : 'System',
  pageBold: Platform.OS === 'android' ? 'Roboto-Bold' : 'System',
  pageSemiBold: Platform.OS === 'android' ? 'Gilroy-SemiBold' : 'Poppins-SemiBold',
};

export default Fonts;