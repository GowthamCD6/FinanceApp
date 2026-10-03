import React from 'react';
import singleHeroImg from '../../../assets/singleHero.png';
import singleBottomHeroImg from '../../../assets/singleBottomhero.png';
import sphere1Img from '../../../assets/sphere-1.png';
import sphere2Img from '../../../assets/sphere-2.png';
import sphere3Img from '../../../assets/sphere-3.png';
import sphere4Img from '../../../assets/sphere-4.png';

/**
 * LiquidHeroArtwork.jsx
 * 
 * Built with:
 * 1. Single official singleHero.png wave artwork at the top with aligned midnight SVG backdrop.
 * 2. Single official singleBottomhero.png wave artwork in the left-side bottom.
 * 3. Complementary flowing vector contours.
 * 4. Authentic floating 3D spheres/balls positioned in their exact reference places.
 */
export const LiquidHeroArtwork = () => {
  return (
    <div className="liquid-hero-stage">
      {/* 1. Midnight Navy Fluid Wave Backdrop (behind top waves only) */}
      <svg
        className="liquid-top-backdrop-svg"
        viewBox="0 0 2170 725"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="heroNavyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#030038" />
            <stop offset="35%" stopColor="#050044" />
            <stop offset="65%" stopColor="#080150" />
            <stop offset="100%" stopColor="#0c025c" />
          </linearGradient>
          <radialGradient id="heroPurpleGlow" cx="12%" cy="0%" r="55%">
            <stop offset="0%" stopColor="#3c0278" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#3c0278" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="heroRightGlow" cx="88%" cy="0%" r="50%">
            <stop offset="0%" stopColor="#1a0256" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#1a0256" stopOpacity="0" />
          </radialGradient>
        </defs>
        {/* Navy base fill tracing safely inside the singleHero wave body */}
        <path
          d="M0,0 L2170,0 L2170,168 C2014,168 1859,265 1704,265 C1549,317 1394,233 1239,205 C1085,293 930,298 775,290 C620,287 465,335 310,322 C155,287 0,287 0,287 Z"
          fill="url(#heroNavyGrad)"
        />
        <path
          d="M0,0 L2170,0 L2170,168 C2014,168 1859,265 1704,265 C1549,317 1394,233 1239,205 C1085,293 930,298 775,290 C620,287 465,335 310,322 C155,287 0,287 0,287 Z"
          fill="url(#heroPurpleGlow)"
        />
        <path
          d="M0,0 L2170,0 L2170,168 C2014,168 1859,265 1704,265 C1549,317 1394,233 1239,205 C1085,293 930,298 775,290 C620,287 465,335 310,322 C155,287 0,287 0,287 Z"
          fill="url(#heroRightGlow)"
        />
      </svg>

      {/* 2. Official Single Hero Liquid Wave Artwork Layer */}
      <div className="single-hero-flow" aria-hidden="true">
        <img
          src={singleHeroImg}
          alt="Finance Portal Liquid Wave Artwork"
          className="single-hero-img"
          draggable="false"
        />
      </div>

      {/* 3. Official Single Bottom Hero Liquid Wave Artwork (Left Side Bottom) */}
      <div className="single-bottom-hero-flow" aria-hidden="true">
        <img
          src={singleBottomHeroImg}
          alt=""
          className="single-bottom-hero-img"
          draggable="false"
        />
      </div>

      {/* 3. Authentic Floating 3D Spheres Layer (Exact Placement from Reference) */}
      <div className="hero-spheres-stage" aria-hidden="true">
        {/* Sphere 1: Lower-Left Floating Sphere */}
        <div className="hero-sphere-item sphere-lower-left float-anim-1">
          <img src={sphere2Img} alt="" draggable="false" />
        </div>

        {/* Sphere 2: Mid-Left Pair - Left Sphere */}
        <div className="hero-sphere-item sphere-pair-left float-anim-2">
          <img src={sphere2Img} alt="" draggable="false" />
        </div>

        {/* Sphere 3: Mid-Left Pair - Right Sphere (Largest) */}
        <div className="hero-sphere-item sphere-pair-right float-anim-3">
          <img src={sphere1Img} alt="" draggable="false" />
        </div>

        {/* Sphere 4: Center Valley Dip Sphere */}
        <div className="hero-sphere-item sphere-center-valley float-anim-4">
          <img src={sphere4Img} alt="" draggable="false" />
        </div>

        {/* Sphere 5: Right Wave Curve Sphere */}
        <div className="hero-sphere-item sphere-right-wave float-anim-5">
          <img src={sphere4Img} alt="" draggable="false" />
        </div>

        {/* Sphere 6: Far-Right Ambient Edge Sphere */}
        <div className="hero-sphere-item sphere-far-right-ambient float-anim-6">
          <img src={sphere3Img} alt="" draggable="false" />
        </div>
      </div>
    </div>
  );
};

export default LiquidHeroArtwork;