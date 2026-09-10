import React from 'react';
import { View, StyleSheet } from 'react-native';

/**
 * Clean, lightweight, zero-dependency Vector Icon component.
 * Replaces cartoonish emojis with crisp, professional UI icons.
 */
export const Icon = ({ name, size = 18, color = '#2563EB', style }) => {
  const s = size;

  switch (name) {
    case 'dashboard':
    case 'grid': {
      const box = (s - 4) / 2;
      return (
        <View style={[{ width: s, height: s, justifyContent: 'space-between' }, style]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View style={{ width: box, height: box, backgroundColor: color, borderRadius: 2 }} />
            <View style={{ width: box, height: box, backgroundColor: color, borderRadius: 2 }} />
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View style={{ width: box, height: box, backgroundColor: color, borderRadius: 2 }} />
            <View style={{ width: box, height: box, backgroundColor: color, borderRadius: 2 }} />
          </View>
        </View>
      );
    }

    case 'loans':
    case 'document': {
      return (
        <View style={[{ width: s, height: s, borderWidth: 1.6, borderColor: color, borderRadius: 3, padding: 2, justifyContent: 'center', gap: 2 }, style]}>
          <View style={{ width: '80%', height: 1.6, backgroundColor: color, borderRadius: 1 }} />
          <View style={{ width: '60%', height: 1.6, backgroundColor: color, borderRadius: 1 }} />
          <View style={{ width: '70%', height: 1.6, backgroundColor: color, borderRadius: 1 }} />
        </View>
      );
    }

    case 'account-outline':
    case 'account':
    case 'customers':
    case 'users':
    case 'user': {
      const headSize = s * 0.38;
      return (
        <View style={[{ width: s, height: s, alignItems: 'center', justifyContent: 'center' }, style]}>
          <View style={{ width: headSize, height: headSize, borderRadius: headSize / 2, borderWidth: 1.6, borderColor: color }} />
          <View style={{ width: s * 0.8, height: s * 0.35, borderTopLeftRadius: s * 0.4, borderTopRightRadius: s * 0.4, borderWidth: 1.6, borderBottomWidth: 0, borderColor: color, marginTop: 1 }} />
        </View>
      );
    }

    case 'account-plus': {
      const headSize = s * 0.32;
      return (
        <View style={[{ width: s, height: s, justifyContent: 'center' }, style]}>
          <View style={{ alignItems: 'flex-start', paddingLeft: 1 }}>
            <View style={{ width: headSize, height: headSize, borderRadius: headSize / 2, borderWidth: 1.5, borderColor: color }} />
            <View style={{ width: s * 0.65, height: s * 0.3, borderTopLeftRadius: s * 0.3, borderTopRightRadius: s * 0.3, borderWidth: 1.5, borderBottomWidth: 0, borderColor: color, marginTop: 1 }} />
          </View>
          <View style={{ position: 'absolute', right: 0, top: s * 0.25, alignItems: 'center', justifyContent: 'center', width: s * 0.4, height: s * 0.4 }}>
            <View style={{ width: s * 0.35, height: 1.6, backgroundColor: color, borderRadius: 1 }} />
            <View style={{ height: s * 0.35, width: 1.6, backgroundColor: color, borderRadius: 1, position: 'absolute' }} />
          </View>
        </View>
      );
    }

    case 'calendar-blank-outline':
    case 'calendar': {
      return (
        <View style={[{ width: s, height: s, borderWidth: 1.6, borderColor: color, borderRadius: 3, paddingHorizontal: 2, paddingTop: 4, justifyContent: 'space-between' }, style]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-around', position: 'absolute', top: -3, left: 2, right: 2 }}>
            <View style={{ width: 2, height: 4, backgroundColor: color, borderRadius: 1 }} />
            <View style={{ width: 2, height: 4, backgroundColor: color, borderRadius: 1 }} />
          </View>
          <View style={{ width: '100%', height: 1.4, backgroundColor: color }} />
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ width: 4, height: 4, borderRadius: 1, backgroundColor: color }} />
          </View>
        </View>
      );
    }

    case 'fund':
    case 'bank': {
      return (
        <View style={[{ width: s, height: s, alignItems: 'center', justifyContent: 'space-between' }, style]}>
          <View style={{ width: s * 0.9, height: 2, backgroundColor: color, borderRadius: 1 }} />
          <View style={{ flexDirection: 'row', width: s * 0.75, justifyContent: 'space-between', height: s * 0.5 }}>
            <View style={{ width: 2, height: '100%', backgroundColor: color }} />
            <View style={{ width: 2, height: '100%', backgroundColor: color }} />
            <View style={{ width: 2, height: '100%', backgroundColor: color }} />
          </View>
          <View style={{ width: s, height: 2.2, backgroundColor: color, borderRadius: 1 }} />
        </View>
      );
    }

    case 'reports':
    case 'chart': {
      return (
        <View style={[{ width: s, height: s, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', paddingBottom: 1, borderBottomWidth: 1.6, borderColor: color }, style]}>
          <View style={{ width: s * 0.22, height: s * 0.45, backgroundColor: color, borderRadius: 1 }} />
          <View style={{ width: s * 0.22, height: s * 0.75, backgroundColor: color, borderRadius: 1 }} />
          <View style={{ width: s * 0.22, height: s * 0.6, backgroundColor: color, borderRadius: 1 }} />
        </View>
      );
    }

    case 'collections':
    case 'wallet': {
      return (
        <View style={[{ width: s, height: s * 0.75, borderWidth: 1.6, borderColor: color, borderRadius: 3, justifyContent: 'center', paddingRight: 2 }, style]}>
          <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: color, alignSelf: 'flex-end' }} />
        </View>
      );
    }

    case 'search': {
      const c = s * 0.55;
      return (
        <View style={[{ width: s, height: s, justifyContent: 'center', alignItems: 'center' }, style]}>
          <View style={{ width: c, height: c, borderRadius: c / 2, borderWidth: 1.6, borderColor: color }} />
          <View style={{ width: 1.8, height: s * 0.35, backgroundColor: color, transform: [{ rotate: '-45deg' }], position: 'absolute', bottom: 1, right: 2 }} />
        </View>
      );
    }

    case 'plus':
    case 'add': {
      return (
        <View style={[{ width: s, height: s, alignItems: 'center', justifyContent: 'center' }, style]}>
          <View style={{ width: s * 0.8, height: 2, backgroundColor: color, borderRadius: 1 }} />
          <View style={{ height: s * 0.8, width: 2, backgroundColor: color, borderRadius: 1, position: 'absolute' }} />
        </View>
      );
    }

    case 'check': {
      return (
        <View style={[{ width: s, height: s, alignItems: 'center', justifyContent: 'center' }, style]}>
          <View style={{ width: s * 0.35, height: s * 0.65, borderBottomWidth: 2, borderRightWidth: 2, borderColor: color, transform: [{ rotate: '45deg' }], marginTop: -2 }} />
        </View>
      );
    }

    case 'close': {
      return (
        <View style={[{ width: s, height: s, alignItems: 'center', justifyContent: 'center' }, style]}>
          <View style={{ width: s * 0.8, height: 2, backgroundColor: color, transform: [{ rotate: '45deg' }], position: 'absolute' }} />
          <View style={{ width: s * 0.8, height: 2, backgroundColor: color, transform: [{ rotate: '-45deg' }], position: 'absolute' }} />
        </View>
      );
    }

    case 'chevron-down': {
      return (
        <View style={[{ width: s, height: s, alignItems: 'center', justifyContent: 'center' }, style]}>
          <View style={{ width: s * 0.45, height: s * 0.45, borderBottomWidth: 2, borderRightWidth: 2, borderColor: color, transform: [{ rotate: '45deg' }], marginTop: -s * 0.15 }} />
        </View>
      );
    }

    case 'chevron-up': {
      return (
        <View style={[{ width: s, height: s, alignItems: 'center', justifyContent: 'center' }, style]}>
          <View style={{ width: s * 0.45, height: s * 0.45, borderTopWidth: 2, borderLeftWidth: 2, borderColor: color, transform: [{ rotate: '45deg' }], marginTop: s * 0.15 }} />
        </View>
      );
    }

    case 'arrow-right': {
      return (
        <View style={[{ width: s, height: s, alignItems: 'center', justifyContent: 'center' }, style]}>
          <View style={{ width: s * 0.7, height: 1.8, backgroundColor: color }} />
          <View style={{ width: s * 0.35, height: s * 0.35, borderTopWidth: 1.8, borderRightWidth: 1.8, borderColor: color, transform: [{ rotate: '45deg' }], position: 'absolute', right: 2 }} />
        </View>
      );
    }

    case 'back':
    case 'arrow-left': {
      return (
        <View style={[{ width: s, height: s, alignItems: 'center', justifyContent: 'center' }, style]}>
          <View style={{ width: s * 0.7, height: 1.8, backgroundColor: color }} />
          <View style={{ width: s * 0.35, height: s * 0.35, borderBottomWidth: 1.8, borderLeftWidth: 1.8, borderColor: color, transform: [{ rotate: '45deg' }], position: 'absolute', left: 2 }} />
        </View>
      );
    }

    case 'repeat':
    case 'refresh': {
      return (
        <View style={[{ width: s, height: s, borderRadius: s / 2, borderWidth: 1.6, borderColor: color, borderTopColor: 'transparent', transform: [{ rotate: '45deg' }] }, style]} />
      );
    }

    case 'shield-account':
    case 'shield':
    case 'admin': {
      return (
        <View style={[{ width: s * 0.8, height: s, borderWidth: 1.6, borderColor: color, borderTopWidth: 2, borderBottomLeftRadius: s * 0.45, borderBottomRightRadius: s * 0.45 }, style]} />
      );
    }

    case 'crown':
    case 'superadmin': {
      return (
        <View style={[{ width: s, height: s * 0.7, borderWidth: 1.6, borderColor: color, borderTopWidth: 0, borderBottomLeftRadius: 3, borderBottomRightRadius: 3, justifyContent: 'flex-start', flexDirection: 'row', justifyContent: 'space-between' }, style]}>
          <View style={{ width: 2, height: '100%', backgroundColor: color }} />
          <View style={{ width: 2, height: '60%', backgroundColor: color, alignSelf: 'flex-end' }} />
          <View style={{ width: 2, height: '100%', backgroundColor: color }} />
        </View>
      );
    }

    case 'phone-outline':
    case 'phone': {
      return (
        <View style={[{ width: s * 0.65, height: s, borderWidth: 1.6, borderColor: color, borderRadius: 4, justifyContent: 'space-between', alignItems: 'center', paddingVertical: 2 }, style]}>
          <View style={{ width: '40%', height: 1.2, backgroundColor: color }} />
          <View style={{ width: 3, height: 3, borderRadius: 1.5, backgroundColor: color }} />
        </View>
      );
    }

    case 'briefcase': {
      return (
        <View style={[{ width: s, height: s * 0.75, borderWidth: 1.6, borderColor: color, borderRadius: 2, justifyContent: 'flex-start', alignItems: 'center' }, style]}>
          <View style={{ width: s * 0.4, height: 2, borderWidth: 1, borderColor: color, borderBottomWidth: 0, position: 'absolute', top: -3 }} />
          <View style={{ width: '100%', height: 1.4, backgroundColor: color, marginTop: 4 }} />
        </View>
      );
    }

    case 'shop':
    case 'store':
    case 'building': {
      return (
        <View style={[{ width: s, height: s * 0.8, borderWidth: 1.6, borderColor: color, borderRadius: 2, overflow: 'hidden' }, style]}>
          <View style={{ height: '35%', backgroundColor: color }} />
          <View style={{ width: 4, height: '40%', backgroundColor: color, position: 'absolute', bottom: 0, left: '35%' }} />
        </View>
      );
    }

    case 'lock': {
      return (
        <View style={[{ width: s * 0.75, height: s, alignItems: 'center', justifyContent: 'flex-end' }, style]}>
          <View style={{ width: s * 0.5, height: s * 0.45, borderTopLeftRadius: s * 0.25, borderTopRightRadius: s * 0.25, borderWidth: 1.6, borderBottomWidth: 0, borderColor: color, marginBottom: -1 }} />
          <View style={{ width: '100%', height: s * 0.55, backgroundColor: color, borderRadius: 2 }} />
        </View>
      );
    }

    case 'logout': {
      return (
        <View style={[{ width: s, height: s, justifyContent: 'center' }, style]}>
          <View style={{ width: s * 0.5, height: s * 0.8, borderWidth: 1.6, borderRightWidth: 0, borderColor: color, borderRadius: 2 }} />
          <View style={{ position: 'absolute', right: 0, flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ width: s * 0.4, height: 1.8, backgroundColor: color }} />
            <View style={{ width: s * 0.2, height: s * 0.2, borderTopWidth: 1.8, borderRightWidth: 1.8, borderColor: color, transform: [{ rotate: '45deg' }], marginLeft: -4 }} />
          </View>
        </View>
      );
    }

    case 'receipt':
    case 'bill': {
      return (
        <View style={[{ width: s * 0.8, height: s, borderWidth: 1.6, borderColor: color, borderRadius: 2, padding: 2, justifyContent: 'space-around' }, style]}>
          <View style={{ height: 1.5, backgroundColor: color, width: '80%' }} />
          <View style={{ height: 1.5, backgroundColor: color, width: '60%' }} />
          <View style={{ height: 1.5, backgroundColor: color, width: '70%' }} />
        </View>
      );
    }

    default:
      return (
        <View style={[{ width: s, height: s, borderRadius: s / 2, backgroundColor: color }, style]} />
      );
  }
};

export default Icon;
