import React, { useEffect } from 'react';
import { PublicHeader } from '../PublicHeader';
import { PublicFooter } from '../PublicFooter';
import { Building, ShieldCheck, Users, TrendingUp, Cpu, Award, Globe, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../PublicLayout.css';

export const AboutPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="public-page-wrapper">
      <PublicHeader />

      <main className="public-main-content">
        {/* Hero Banner */}
        <section className="public-hero-section">
          <div className="standard-container">
            <div className="public-hero-badge">
              <Building size={14} />
              <span>THE FINANCE PORTAL PLATFORM MISSION</span>
            </div>
            <h1 className="public-hero-title">Pioneering Next-Gen Multi-Tenant FinTech</h1>
            <p className="public-hero-subtitle">
              We empower daily merchant lenders, chit fund managers, and microfinance organizations with cryptographic tenant isolation, double-entry vault mathematics, and seamless offline collection fleets.
            </p>
          </div>
        </section>

        {/* Mission & Stats Grid */}
        <section className="public-doc-section">
          <div className="standard-container">
            <div className="about-intro-grid">
              <div className="about-intro-text">
                <h3>Our Vision for Financial Inclusion</h3>
                <p>
                  Traditional banking infrastructure was never built for the high-velocity realities of local street markets, morning vegetable vendor advances, and weekly chit fund syndicates. Millions of small business owners operate on 100-day cycles with afternoon collections.
                </p>
                <p>
                  Finance Portal was engineered from the ground up to digitize informal bazaar lending with institutional-grade security. Our platform provides multi-tenant cloud workspaces that replace paper ledgers with automated mathematical amortization, instant thermal WhatsApp receipts, and zero collection leakages.
                </p>
              </div>

              <div className="about-highlights-card">
                <h4>Platform Core Metrics</h4>
                <div className="about-metrics-list">
                  <div className="about-m-item">
                    <span className="m-val">100%</span>
                    <span className="m-lbl">Cryptographic Tenant Data Isolation</span>
                  </div>
                  <div className="about-m-item">
                    <span className="m-val">99.8%</span>
                    <span className="m-lbl">On-Time Daily Route Collection Recovery</span>
                  </div>
                  <div className="about-m-item">
                    <span className="m-val">&lt;60s</span>
                    <span className="m-lbl">Instant Physical Branch Setup & Cashier Safe Provisioning</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Core Values / Pillars */}
            <div className="about-values-section">
              <h3>Our Engineering Pillars</h3>
              <div className="security-pillars-grid">
                <div className="sec-pillar-card">
                  <div className="sec-pillar-icon"><ShieldCheck size={26} /></div>
                  <h4>Zero-Leakage Governance</h4>
                  <p>Strict cryptographic separation guarantees that borrower phone numbers, double-entry ledgers, and cash balances remain 100% confidential to each tenant organization.</p>
                </div>

                <div className="sec-pillar-card">
                  <div className="sec-pillar-icon"><Cpu size={26} /></div>
                  <h4>Deterministic Mathematics</h4>
                  <p>Automated 100-day schedules, daily interest splits, weekly chit auction dividends, and grace periods calculated in real-time with zero human rounding errors.</p>
                </div>

                <div className="sec-pillar-card">
                  <div className="sec-pillar-icon"><Globe size={26} /></div>
                  <h4>Offline Field Reliability</h4>
                  <p>Built for the real world. Field agents issue thermal Bluetooth receipts and record collections offline in busy bazaars with instant background vault synchronization.</p>
                </div>

                <div className="sec-pillar-card">
                  <div className="sec-pillar-icon"><Users size={26} /></div>
                  <h4>Multi-Branch Scalability</h4>
                  <p>From single-city lending firms to national microfinance institutions with hundreds of branch cashiers and route collectors.</p>
                </div>
              </div>
            </div>

            {/* CTA Box */}
            <div className="about-cta-box">
              <h3>Ready to transform your organization's lending operations?</h3>
              <p>Launch your isolated tenant portal in under 60 seconds.</p>
              <button
                type="button"
                className="btn-about-launch"
                onClick={() => navigate('/login')}
              >
                <span>Deploy Organization Workspace</span>
                <ArrowRight size={17} />
              </button>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
};
