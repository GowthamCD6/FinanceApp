import React from 'react';

/**
 * LiquidHeroArtwork.jsx
 * 100% pure vector SVG artwork matching liquid-exact-bg.png:
 *  - Continuous, gapless liquid canopy hanging from the top navy header
 *  - Dark navy header band (0 to 95px, #08003a to #14005e) with crisp separator line
 *  - Deep indigo background wave providing rich depth and zero white gaps
 *  - Left vibrant royal-blue tongue extending across to x ~ 42% (650px)
 *  - Left lower blue lobe extending down to y ~ 54% (425px)
 *  - Center indigo mass supporting Spheres 2 & 3 and forming the saddle at x ~ 51% (775px)
 *  - Distinctive orchid/violet droplet lobe (x 58% to 76%, y 95 to 348px)
 *  - Right sweeping royal-to-electric blue wave with high crest (x ~ 92%)
 *  - 5 mathematically measured 3D glossy spheres:
 *      1. Lower-left floating on white (cx=107, cy=440, r=50)
 *      2. Medium sphere (cx=408, cy=384, r=42)
 *      3. Large sphere (cx=555, cy=362, r=77) with seamless horizontal connecting bridge
 *      4. Center saddle sphere (cx=775, cy=230, r=29)
 *      5. Right crest sphere floating in white space (cx=1438, cy=278, r=38)
 *  - Unified drop shadow along bottom boundary with zero internal overlap artifacts
 *  - Soft lilac under-glow beneath the purple lobe
 *  - Pale periwinkle contour wave lines on the white canvas
 */
export const LiquidHeroArtwork = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1536 776"
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMin slice"
      className="exact-code-svg"
      aria-hidden="true"
    >
      <defs>
        {/* Unified drop shadow for the liquid fluid mass */}
        <filter id="liquidOuterShadow" x="-20%" y="-20%" width="150%" height="160%">
          <feDropShadow dx="0" dy="16" stdDeviation="15" floodColor="#060938" floodOpacity="0.30" />
        </filter>

        {/* Sphere drop shadow */}
        <filter id="sphereDropShadow" x="-50%" y="-40%" width="200%" height="200%">
          <feDropShadow dx="0" dy="16" stdDeviation="13" floodColor="#040628" floodOpacity="0.42" />
        </filter>

        {/* Soft lilac under-shadow blur */}
        <filter id="softLilacGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="24" />
        </filter>

        {/* Highlight blur for specular reflections */}
        <filter id="specularBlur" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="2.5" />
        </filter>

        {/* Top header navy gradient */}
        <linearGradient id="gHeaderBar" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#08003a" />
          <stop offset="60%" stopColor="#0d004c" />
          <stop offset="100%" stopColor="#14005e" />
        </linearGradient>

        {/* Continuous deep indigo/violet backbone layer - guarantees zero gaps */}
        <linearGradient id="gBackMass" x1="0%" y1="0%" x2="100%" y2="60%">
          <stop offset="0%" stopColor="#070228" />
          <stop offset="28%" stopColor="#100548" />
          <stop offset="55%" stopColor="#1f0a5e" />
          <stop offset="82%" stopColor="#181270" />
          <stop offset="100%" stopColor="#1228a8" />
        </linearGradient>

        {/* Left blue tongue: electric to royal blue gradient */}
        <linearGradient id="gBlueTongue" x1="0%" y1="15%" x2="100%" y2="85%">
          <stop offset="0%" stopColor="#0064f2" />
          <stop offset="45%" stopColor="#1248db" />
          <stop offset="100%" stopColor="#1e2ea8" />
        </linearGradient>

        {/* Left lower lobe: deep azure to royal blue */}
        <linearGradient id="gLeftLowerLobe" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1858e8" />
          <stop offset="60%" stopColor="#143ecc" />
          <stop offset="100%" stopColor="#0e229c" />
        </linearGradient>

        {/* Center indigo mass supporting spheres 2 & 3 */}
        <linearGradient id="gCenterIndigo" x1="15%" y1="0%" x2="85%" y2="100%">
          <stop offset="0%" stopColor="#10249c" />
          <stop offset="45%" stopColor="#1c127e" />
          <stop offset="100%" stopColor="#240a68" />
        </linearGradient>

        {/* Distinctive Orchid / Violet Droplet Lobe (x 58% to 76%) */}
        <linearGradient id="gPurpleLobe" x1="10%" y1="10%" x2="85%" y2="90%">
          <stop offset="0%" stopColor="#3c0c7a" />
          <stop offset="35%" stopColor="#56159c" />
          <stop offset="70%" stopColor="#701db8" />
          <stop offset="100%" stopColor="#4a0e88" />
        </linearGradient>

        {/* Right sweeping royal-to-electric blue wave */}
        <linearGradient id="gRightBlueWave" x1="0%" y1="80%" x2="100%" y2="10%">
          <stop offset="0%" stopColor="#142ea0" />
          <stop offset="35%" stopColor="#1256df" />
          <stop offset="70%" stopColor="#0c7aee" />
          <stop offset="100%" stopColor="#009eff" />
        </linearGradient>

        {/* Accent shadow fold on the far right upper crest */}
        <linearGradient id="gRightCrestFold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#320b72" />
          <stop offset="60%" stopColor="#480f8e" />
          <stop offset="100%" stopColor="#1c187e" />
        </linearGradient>

        {/* Soft lilac under-glow */}
        <linearGradient id="gLilacUnderGlow" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#b6c2f5" stopOpacity="0.75" />
          <stop offset="60%" stopColor="#cbd4f8" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#eef2fc" stopOpacity="0.05" />
        </linearGradient>

        {/* 3D Glossy Sphere Radial Gradient */}
        <radialGradient id="gGlossySphere" cx="34%" cy="30%" r="72%" fx="30%" fy="26%">
          <stop offset="0%" stopColor="#9ee4ff" />
          <stop offset="12%" stopColor="#3092ff" />
          <stop offset="42%" stopColor="#1244bf" />
          <stop offset="75%" stopColor="#071358" />
          <stop offset="100%" stopColor="#020524" />
        </radialGradient>
      </defs>

      {/* Background plain #F9F9F9 */}
      <rect width="1536" height="776" fill="#F9F9F9" />

      {/* Pale periwinkle contour wave lines (#DDE2F5, 2px) */}
      <g fill="none" stroke="#DDE2F5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M 0 504 C 50 540, 95 620, 150 645 C 210 670, 260 610, 305 590 C 350 570, 395 680, 440 776" />
        <path d="M 0 595 C 45 635, 80 685, 120 700 C 165 720, 205 680, 235 665 C 270 650, 290 715, 315 776" />
        <path d="M 880 776 C 970 752, 1060 726, 1140 722 C 1240 718, 1315 750, 1395 758 C 1460 764, 1500 746, 1536 736" />
      </g>

      {/* Soft lilac under-glow beneath the purple lobe */}
      <path
        d="M 880 300
           C 960 360, 1060 375, 1160 360
           C 1220 350, 1260 325, 1300 300
           C 1220 280, 1130 290, 1040 295
           C 960 300, 915 285, 880 300 Z"
        fill="url(#gLilacUnderGlow)"
        filter="url(#softLilacGlow)"
      />

      {/* ===================================================================
          LIQUID ARTWORK MASS (HANGING FROM THE CEILING)
          Grouped inside a single drop-shadow filter so overlapping shapes
          DO NOT cast shadows inside one another!
          =================================================================== */}
      <g filter="url(#liquidOuterShadow)">
        {/* 1. CONTINUOUS SOLID BACKING CANOPY (Hangs from y=0, fills all gaps) */}
        <path
          d="M 0 0
             L 1536 0
             L 1536 241.0
             C 1466.0 290.7, 1414.0 305.3, 1380.0 285.0
             C 1346.7 292.3, 1286.7 335.3, 1240.0 342.0
             C 1193.3 348.7, 1141.7 324.0, 1100.0 325.0
             C 1058.3 326.0, 1025.0 348.0, 990.0 348.0
             C 955.0 348.0, 924.2 331.3, 890.0 325.0
             C 855.8 318.7, 823.3 310.8, 785.0 310.0
             C 746.7 309.2, 701.5 305.8, 660.0 320.0
             C 618.5 334.2, 582.7 384.2, 536.0 395.0
             C 489.3 405.8, 434.3 381.7, 380.0 385.0
             C 325.7 388.3, 257.5 408.3, 210.0 415.0
             C 162.5 421.7, 130.0 440.8, 95.0 425.0
             C 60.0 409.2, 15.8 337.5, 0.0 320.0 Z"
          fill="url(#gBackMass)"
        />

        {/* 2. RIGHT SWEEPING ROYAL-TO-ELECTRIC BLUE WAVE (Solid fill from y=0 down to bottom contour) */}
        <path
          d="M 720 0
             L 1536 0
             L 1536 241
             C 1466 290, 1414 305, 1380 285
             C 1346 292, 1286 335, 1240 342
             C 1193 348, 1141 324, 1100 325
             C 1058 326, 1025 348, 990 348
             C 955 348, 924 331, 890 325
             C 855 318, 800 300, 720 250 Z"
          fill="url(#gRightBlueWave)"
        />

        {/* 3. CENTER INDIGO MASS (x 16% to 54%, supporting Spheres 2 & 3, saddle at x ~ 51%) */}
        <path
          d="M 210 95
             L 210 200
             C 285 225, 435 245, 555 260
             C 645 272, 680 345, 615 385
             C 540 422, 440 412, 350 392
             C 265 372, 195 305, 210 200
             L 210 95 Z"
          fill="url(#gCenterIndigo)"
        />

        {/* 4. LEFT LOWER BLUE LOBE (descending to y ~ 54% / 425px) */}
        <path
          d="M 0 170
             C 45 195, 95 260, 120 320
             C 140 375, 125 435, 75 425
             C 35 415, 10 365, 0 320 Z"
          fill="url(#gLeftLowerLobe)"
        />

        {/* 5. LEFT BRIGHT BLUE TONGUE (x 0 to 42%, y 160 to 320px) */}
        <path
          d="M 0 160
             C 120 175, 260 190, 400 202
             C 525 212, 620 226, 650 252
             C 665 268, 655 295, 620 312
             C 560 330, 450 315, 340 295
             C 230 275, 110 260, 0 280 Z"
          fill="url(#gBlueTongue)"
        />

        {/* 6. TOP-CENTER INDIGO SADDLE HUMP (x 40% to 58%, y 95 to 280px, cradles Sphere 4) */}
        <path
          d="M 580 95
             C 650 115, 720 140, 770 165
             C 830 195, 890 238, 910 272
             C 930 300, 885 322, 820 308
             C 745 292, 680 232, 620 182
             C 585 152, 570 118, 580 95 Z"
          fill="url(#gCenterIndigo)"
        />

        {/* 7. DISTINCTIVE ORCHID / VIOLET DROPLET LOBE (x 58% to 76%, y 95 to 348px) */}
        <path
          d="M 915 95
             C 920 140, 935 210, 970 270
             C 1005 330, 1055 348, 1095 335
             C 1145 310, 1185 245, 1195 175
             C 1200 125, 1155 95, 1085 95 Z"
          fill="url(#gPurpleLobe)"
        />

        {/* 8. DEEP VIOLET ACCENT FOLD ON RIGHT CREST (x 86% to 100%, y 100 to 180px) */}
        <path
          d="M 1330 115
             C 1390 102, 1460 98, 1536 108
             L 1536 175
             C 1480 170, 1410 160, 1330 115 Z"
          fill="url(#gRightCrestFold)"
          opacity="0.85"
        />
      </g>

      {/* ===================================================================
          TOP NAVY HEADER BAR (0 to 95px across entire width)
          Anchors the navigation bar with crisp separator
          =================================================================== */}
      <rect x="0" y="0" width="1536" height="95" fill="url(#gHeaderBar)" />
      {/* Crisp 2px boundary line */}
      <line x1="0" y1="95" x2="1536" y2="95" stroke="#2c0762" strokeWidth="2" opacity="0.85" />
      {/* Subtle downward shadow onto fluid */}
      <rect x="0" y="95" width="1536" height="14" fill="#000000" opacity="0.18" filter="url(#specularBlur)" />

      {/* ===================================================================
          ORGANIC CONNECTING BRIDGE (Between Sphere 2 and Sphere 3)
          Smooth horizontal cylinder connecting Sphere 2 to Sphere 3
          =================================================================== */}
      <g filter="url(#sphereDropShadow)">
        <path
          d="M 430 366
             C 465 368, 495 358, 525 344
             L 530 405
             C 495 398, 465 396, 430 398 Z"
          fill="url(#gGlossySphere)"
        />
      </g>

      {/* ===================================================================
          5 PERFECTLY CIRCULAR 3D GLOSSY SPHERES
          =================================================================== */}

      {/* Sphere 1: Far-left bottom floating on white canvas (cx=107, cy=440, r=50) */}
      <g filter="url(#sphereDropShadow)" className="floating-sphere-1">
        <circle cx="107" cy="440" r="50" fill="url(#gGlossySphere)" />
        <ellipse cx="92" cy="422" rx="14" ry="9" fill="#FFFFFF" opacity="0.65" filter="url(#specularBlur)" />
        <circle cx="88" cy="417" r="4" fill="#FFFFFF" opacity="0.95" />
      </g>

      {/* Sphere 2: Medium sphere on center lobe (cx=408, cy=384, r=42) */}
      <g filter="url(#sphereDropShadow)" className="floating-sphere-2">
        <circle cx="408" cy="384" r="42" fill="url(#gGlossySphere)" />
        <ellipse cx="395" cy="368" rx="12" ry="8" fill="#FFFFFF" opacity="0.60" filter="url(#specularBlur)" />
        <circle cx="391" cy="364" r="3.5" fill="#FFFFFF" opacity="0.95" />
      </g>

      {/* Sphere 3: Large sphere beside Sphere 2 (cx=555, cy=362, r=77) */}
      <g filter="url(#sphereDropShadow)" className="floating-sphere-3">
        <circle cx="555" cy="362" r="77" fill="url(#gGlossySphere)" />
        <ellipse cx="532" cy="335" rx="22" ry="14" fill="#FFFFFF" opacity="0.60" filter="url(#specularBlur)" />
        <circle cx="524" cy="326" r="5.5" fill="#FFFFFF" opacity="0.95" />
      </g>

      {/* Sphere 4: Center saddle sphere (cx=775, cy=230, r=29) */}
      <g filter="url(#sphereDropShadow)" className="floating-sphere-4">
        <circle cx="775" cy="230" r="29" fill="url(#gGlossySphere)" />
        <ellipse cx="766" cy="221" rx="8" ry="5.5" fill="#FFFFFF" opacity="0.60" filter="url(#specularBlur)" />
        <circle cx="763" cy="217" r="2.5" fill="#FFFFFF" opacity="0.95" />
      </g>

      {/* Sphere 5: Right crest sphere floating in white space (cx=1438, cy=278, r=38) */}
      <g filter="url(#sphereDropShadow)" className="floating-sphere-5">
        <circle cx="1438" cy="278" r="38" fill="url(#gGlossySphere)" />
        <ellipse cx="1426" cy="266" rx="11" ry="7.5" fill="#FFFFFF" opacity="0.60" filter="url(#specularBlur)" />
        <circle cx="1422" cy="262" r="3" fill="#FFFFFF" opacity="0.95" />
      </g>
    </svg>
  );
};

export default LiquidHeroArtwork;