import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Platform,
  BackHandler,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import LottieView from 'lottie-react-native';
import { useNavigation } from '@react-navigation/native';
import Header from '../../../../../../components/HeaderComponent/Header';
import { useLanguage } from '../../../../../../utils/LanguageContext';

const languageAnimation = require('../../../../../../animation/language.json');

const LanguageSettings = ({ onBack }) => {
  let navigation;
  try {
    navigation = useNavigation();
  } catch (e) {
    navigation = { goBack: () => onBack && onBack() };
  }

  const { language, changeLanguage, t } = useLanguage();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (navigation && navigation.goBack) {
      navigation.goBack();
    }
  };

  // Handle hardware back button for Android devices
  useEffect(() => {
    const backAction = () => {
      handleBack();
      return true;
    };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [onBack]);

  const handleSelectLanguage = (lang) => {
    if (lang === 'en' || lang === 'ta') {
      if (changeLanguage) {
        changeLanguage(lang);
      }
    }
  };

  return (
    <View style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <Header
        title={t('Language Settings')}
        onBack={handleBack}
        showBackButton={true}
      />

      <View style={styles.container}>
        {/* Visual Lottie Animation Badge */}
        <View style={styles.animationContainer}>
          <LottieView
            source={languageAnimation}
            autoPlay
            loop
            style={{ width: 140, height: 140 }}
          />
        </View>

        {/* Subtitle */}
        <Text style={[styles.subtitle, language === 'ta' && { fontSize: 13 }]}>
          {t('Choose your preferred language')}
        </Text>

        {/* English Option */}
        <TouchableOpacity
          style={[
            styles.languageCard,
            language === 'en' && styles.languageCardActive,
          ]}
          onPress={() => handleSelectLanguage('en')}
          activeOpacity={0.7}
        >
          <View style={styles.languageCardLeft}>
            <View style={[styles.flagCircle, { backgroundColor: '#EEF2FF' }]}>
              <Text style={styles.flagEmoji}>🇬🇧</Text>
            </View>
            <View style={styles.languageInfo}>
              <Text
                style={[
                  styles.languageName,
                  language === 'en' && styles.languageNameActive,
                ]}
              >
                English
              </Text>
              <Text style={styles.languageNative}>English (Default)</Text>
              {language === 'en' && (
                <View style={styles.defaultBadge}>
                  <Text style={styles.defaultBadgeText}>{t('Default') || 'Active'}</Text>
                </View>
              )}
            </View>
          </View>
          {language === 'en' && (
            <View style={styles.checkCircle}>
              <MaterialCommunityIcons name="check" size={18} color="#FFFFFF" />
            </View>
          )}
        </TouchableOpacity>

        {/* Tamil Option */}
        <TouchableOpacity
          style={[
            styles.languageCard,
            language === 'ta' && styles.languageCardActive,
          ]}
          onPress={() => handleSelectLanguage('ta')}
          activeOpacity={0.7}
        >
          <View style={styles.languageCardLeft}>
            <View style={[styles.flagCircle, { backgroundColor: '#FEF3C7' }]}>
              <Text style={styles.flagEmoji}>🇮🇳</Text>
            </View>
            <View style={styles.languageInfo}>
              <Text
                style={[
                  styles.languageName,
                  language === 'ta' && styles.languageNameActive,
                ]}
              >
                தமிழ்
              </Text>
              <Text style={styles.languageNative}>Tamil (தமிழ்)</Text>
              {language === 'ta' && (
                <View style={styles.defaultBadge}>
                  <Text style={styles.defaultBadgeText}>செயலில் உள்ளது</Text>
                </View>
              )}
            </View>
          </View>
          {language === 'ta' && (
            <View style={styles.checkCircle}>
              <MaterialCommunityIcons name="check" size={18} color="#FFFFFF" />
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
    backgroundColor: '#FAFAFA',
  },
  animationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#F3E8FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#E9D5FF',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: '500',
  },
  languageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  languageCardActive: {
    borderColor: '#6B46C1',
    backgroundColor: '#FAF5FF',
  },
  languageCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  flagCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  flagEmoji: {
    fontSize: 22,
  },
  languageInfo: {
    flex: 1,
  },
  languageName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  languageNameActive: {
    color: '#6B46C1',
  },
  languageNative: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  defaultBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#E9D5FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 4,
  },
  defaultBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B46C1',
  },
  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#6B46C1',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default LanguageSettings;
