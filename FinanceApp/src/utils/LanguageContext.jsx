import React, { createContext, useContext, useState, useEffect } from 'react';

let AsyncStorage;
try {
  AsyncStorage = require('@react-native-async-storage/async-storage').default;
} catch {
  AsyncStorage = {
    getItem: async () => null,
    setItem: async () => {},
  };
}

const translations = {
  en: {
    'Settings': 'Settings',
    'Account': 'Account',
    'Edit Profile': 'Edit Profile',
    'Update your personal information': 'Update your personal information',
    'Password Management': 'Password Management',
    'View and manage user passwords': 'View and manage user passwords',
    'Password & Security': 'Password & Security',
    'Password and authentication': 'Password and authentication',
    'App Settings': 'App Settings',
    'Notifications': 'Notifications',
    'Manage notification preferences': 'Manage notification preferences',
    'Language': 'Language',
    'Group Management': 'Group & Loan Management',
    'OTP Requests': 'OTP Requests',
    'Manage user OTP verification requests': 'Manage user OTP verification requests',
    'Auction Settings': 'Auction & Loan Rules',
    'Set default auction rules and duration': 'Set default loan/auction rules and duration',
    'Data & Privacy': 'Data & Privacy',
    'Data Export': 'Data Export',
    'Download all your group data and history': 'Download all your group data and history',
    'Block User': 'Block / Blacklist User',
    'Location & Tracking': 'Location & Tracking',
    'User Location Map': 'User Location Map',
    'Location Sharing': 'Location Sharing',
    'Control location sharing preferences': 'Control location sharing preferences',
    'Support': 'Support',
    'Help & Support': 'Help & Support',
    'FAQs, tutorials, contact support': 'FAQs, tutorials, contact support',
    'Privacy Controls': 'Privacy Controls',
    'Control privacy policies and profile data': 'Control privacy policies and profile data',
    'Share App': 'Share App',
    'Invite friends to join': 'Invite friends to join',
    'Rate App': 'Rate App',
    'Rate us on Play Store': 'Rate us on Play Store',
    'Follow Us': 'Follow Us',
    'Logout': 'Logout',
    'Version': 'Version',
  },
  ta: {
    'Settings': 'அமைப்புகள் (Settings)',
    'Account': 'கணக்கு (Account)',
    'Edit Profile': 'சுயவிவரத்தை திருத்து (Edit Profile)',
    'Update your personal information': 'தனிப்பட்ட தகவலை புதுப்பிக்கவும்',
    'Password Management': 'கடவுச்சொல் மேலாண்மை',
    'View and manage user passwords': 'பயனர் கடவுச்சொற்களை நிர்வகிக்கவும்',
    'Password & Security': 'கடவுச்சொல் & பாதுகாப்பு',
    'Password and authentication': 'பாதுகாப்பு & அங்கீகரிப்பு',
    'App Settings': 'செயலி அமைப்புகள்',
    'Notifications': 'அறிவிப்புகள் (Notifications)',
    'Manage notification preferences': 'அறிவிப்பு விருப்பங்களை மாற்றவும்',
    'Language': 'மொழி (Language)',
    'Group Management': 'குழு & கடன் மேலாண்மை',
    'OTP Requests': 'OTP கோரிக்கைகள்',
    'Manage user OTP verification requests': 'OTP சரிபார்ப்பு கோரிக்கைகளை நிர்வகிக்கவும்',
    'Auction Settings': 'ஏல & கடன் விதிகள்',
    'Set default auction rules and duration': 'கடன் விதிகள் மற்றும் கால அளவை அமைக்கவும்',
    'Data & Privacy': 'தரவு & தனியுரிமை',
    'Data Export': 'தரவு ஏற்றுமதி (Data Export)',
    'Download all your group data and history': 'அனைத்து தரவு அறிக்கைகளையும் பதிவிறக்கவும்',
    'Block User': 'பயனரைத் தடு (Block User)',
    'Location & Tracking': 'இருப்பிடம் & கண்காணிப்பு',
    'User Location Map': 'பயனர் இருப்பிட வரைபடம்',
    'Location Sharing': 'இருப்பிடப் பகிர்வு',
    'Control location sharing preferences': 'இருப்பிட அமைப்புகளை நிர்வகிக்கவும்',
    'Support': 'உதவி மற்றும் ஆதரவு',
    'Help & Support': 'உதவி மையம் & கேள்விகள்',
    'FAQs, tutorials, contact support': 'அடிக்கடி கேட்கப்படும் கேள்விகள் & ஆதரவு',
    'Privacy Controls': 'தனியுரிமைக் கட்டுப்பாடுகள்',
    'Control privacy policies and profile data': 'தனியுரிமைக் கொள்கைகள் மற்றும் தரவு',
    'Share App': 'செயலியைப் பகிரவும்',
    'Invite friends to join': 'நண்பர்களை அழைக்கவும்',
    'Rate App': 'மதிப்பீடு வழங்கவும்',
    'Rate us on Play Store': 'Play Store இல் மதிப்பிடவும்',
    'Follow Us': 'எங்களை பின்தொடரவும்',
    'Logout': 'வெளியேறு (Logout)',
    'Version': 'பதிப்பு',
  }
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    AsyncStorage.getItem('appLanguage').then((savedLang) => {
      if (savedLang) setLanguage(savedLang);
    });
  }, []);

  const changeLanguage = async (newLang) => {
    setLanguage(newLang);
    await AsyncStorage.setItem('appLanguage', newLang);
  };

  const t = (key) => {
    if (translations[language] && translations[language][key]) {
      return translations[language][key];
    }
    return key;
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    // Fallback if not wrapped in provider
    return {
      language: 'en',
      changeLanguage: () => {},
      t: (key) => key,
    };
  }
  return context;
};

export default LanguageContext;
