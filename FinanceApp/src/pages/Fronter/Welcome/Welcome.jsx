import React from 'react';
import { Text, TouchableOpacity, View, ScrollView, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LottieView from 'lottie-react-native';
import styles from './Welcomesty';

const Welcome = ({ onGetStarted, navigation }) => {
  const handleLoginPress = () => {
    if (onGetStarted) {
      onGetStarted();
    } else if (navigation && navigation.navigate) {
      navigation.navigate('Login');
    }
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <Text style={styles.title}>ஸ்ரீ பெரியநாயகி அம்மன் FINANCE</Text>

        <LottieView
          source={require('../../../animation/Revenue.json')}
          autoPlay
          loop={true}
          style={{ width: 290, height: 300, backgroundColor: 'transparent' }}
          resizeMode="contain"
        />

        <Text style={styles.mainText}>Hello !</Text>

        <Text style={styles.text2}>
          Welcome back! Please log{'\n'}in to continue
        </Text>

        <TouchableOpacity
          style={styles.pressablebtn}
          onPress={handleLoginPress}
          activeOpacity={0.8}
        >
          <View style={styles.btn}>
            <Text style={styles.btntext}>LOGIN</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Welcome;