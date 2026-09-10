import React, { useEffect, useRef } from 'react';
import { Animated, ViewStyle, StyleProp } from 'react-native';

interface PulseViewProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  minScale?: number;
  maxScale?: number;
  duration?: number;
}

export const PulseView: React.FC<PulseViewProps> = ({
  children,
  style,
  minScale = 0.95,
  maxScale = 1.05,
  duration = 1000,
}) => {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulseAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, {
          toValue: maxScale,
          duration,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: minScale,
          duration,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: duration / 2,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnim.start();

    return () => pulseAnim.stop();
  }, [duration, maxScale, minScale, scale]);

  return (
    <Animated.View style={[style, { transform: [{ scale }] }]}>
      {children}
    </Animated.View>
  );
};
