import React from 'react';
import { Platform } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

let Svg, Path, G;
try {
  const SvgModule = require('react-native-svg');
  Svg = SvgModule.Svg || SvgModule.default;
  Path = SvgModule.Path;
  G = SvgModule.G;
} catch (e) {
  // Graceful fallback if react-native-svg is not linked
}

export const LeftArrowIcon = ({ size = 24, color = '#1F2937' }) => {
  if (Svg && Path && G) {
    return (
      <Svg width={size} height={size} viewBox="0 -6.5 38 38">
        <G stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
          <G transform="translate(-1641, -158)" fill={color} fillRule="nonzero">
            <G transform="translate(1350, 120)">
              <Path
                d="M317.812138,38.5802109 L328.325224,49.0042713 L328.41312,49.0858421 C328.764883,49.4346574 328.96954,49.8946897 329,50.4382227 L328.998248,50.6209428 C328.97273,51.0514917 328.80819,51.4628128 328.48394,51.8313977 L328.36126,51.9580208 L317.812138,62.4197891 C317.031988,63.1934036 315.770571,63.1934036 314.990421,62.4197891 C314.205605,61.6415481 314.205605,60.3762573 314.990358,59.5980789 L322.274264,52.3739093 L292.99947,52.3746291 C291.897068,52.3746291 291,51.4850764 291,50.3835318 C291,49.2819872 291.897068,48.3924345 292.999445,48.3924345 L322.039203,48.3917152 L314.990421,41.4019837 C314.205605,40.6237427 314.205605,39.3584519 314.990421,38.5802109 C315.770571,37.8065964 317.031988,37.8065964 317.812138,38.5802109 Z"
                transform="translate(310.000000, 50.500000) scale(-1, 1) translate(-310.000000, -50.500000)"
              />
            </G>
          </G>
        </G>
      </Svg>
    );
  }

  return (
    <MaterialCommunityIcons
      name="arrow-left"
      size={size}
      color={color}
    />
  );
};

export default LeftArrowIcon;
