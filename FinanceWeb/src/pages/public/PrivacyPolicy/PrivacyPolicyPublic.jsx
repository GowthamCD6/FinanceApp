import React, { useEffect } from 'react';
import { PublicHeader } from '../PublicHeader';
import { PublicFooter } from '../PublicFooter';
import { Shield, Lock, EyeOff, Database, Server, Smartphone, CheckCircle } from 'lucide-react';
import '../PublicLayout.css';

export const PrivacyPolicyPublic = () => {
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
              <Shield size={14} />
              <span>DATA PROTECTION & PRIVACY CHARTER</span>
            </div>
            <h1 className="public-hero-title">Privacy Policy</h1>
            <p className="public-hero-subtitle">
              How Finance Portal SaaS guarantees cryptographic tenant isolation, zero borrower data leakage, and end-to-end encryption across all cloud ledgers and mobile field devices.
            </p>
            <div className="public-meta-bar">
              <span><strong>Effective Date:</strong> October 2026</span>
              <span>•</span>
              <span><strong>Scope:</strong> Global Multi-Tenant Architecture</span>
              <span>•</span>
              <span><strong>Encryption:</strong> AES-256 & TLS 1.3 Strict</span>
            </div>
          </div>
        </section>

        {/* Content Document */}
        <section className="public-doc-section">
          <div className="standard-container public-doc-grid">
            <aside className="doc-sidebar">
              <div className="doc-toc-card">
                <h5>Privacy Architecture</h5>
                <ul>
                  <li><a href="#priv-1">1. Information We Collect</a></li>
                  <li><a href="#priv-2">2. Cryptographic Tenant Separation</a></li>
                  <li><a href="#priv-3">3. Field Agent & Borrower Privacy</a></li>
                  <li><a href="#priv-4">4. WhatsApp & SMS Notifications</a></li>
                  <li><a href="#priv-5">5. Local Device Storage (SQLite)</a></li>
                  <li><a href="#priv-6">6. Data Retention & Deletion</a></li>
                  <li><a href="#priv-7">7. Zero Data Selling Guarantee</a></li>
                  <li><a href="#priv-8">8. Contact Our Data Protection Officer</a></li>
                </ul>
              </div>
            </aside>

            <div className="doc-article-body">
              <section id="priv-1" className="doc-block">
                <h3>1. Information We Collect</h3>
                <p>
                  We collect information strictly necessary to provision and maintain your organization's lending workspace:
                </p>
                <div className="doc-callout-grid">
                  <div className="callout-card">
                    <h4>Organization & Tenant Data</h4>
                    <p>Company legal name, tenant subdomain, admin email, authorized branch managers, and cashier profile credentials.</p>
                  </div>
                  <div className="callout-card">
                    <h4>Operational Lending Data</h4>
                    <p>Principal amounts, collection routes, 100-day schedule entries, chit group subscriptions, and vault balance records.</p>
                  </div>
                </div>
              </section>

              <section id="priv-2" className="doc-block">
                <h3>2. Cryptographic Tenant Separation</h3>
                <p>
                  Our multi-tenant database enforces row-level security and tenant-specific key encapsulation. Each organization's database records are segregated with unique Organization UUIDs. No query from Tenant A can ever resolve, read, or infer borrower records or transaction totals belonging to Tenant B.
                </p>
              </section>

              <section id="priv-3" className="doc-block">
                <h3>3. Field Agent & Borrower Privacy</h3>
                <p>
                  When field agents collect daily bazaar dues or weekly chits, only essential operational parameters (shopkeeper name, stall number, route sequence, and pending balance) are displayed on the mobile interface. Sensitive personal identifiers are masked and transmitted via encrypted TLS 1.3 channels.
                </p>
              </section>

              <section id="priv-4" className="doc-block">
                <h3>4. WhatsApp & SMS Notifications</h3>
                <p>
                  When automated digital collection receipts are dispatched to borrowers via WhatsApp or SMS, receipts include only:
                </p>
                <ul className="doc-list">
                  <li>Tenant Organization Name and verified contact number.</li>
                  <li>Installment amount received and timestamp token.</li>
                  <li>Remaining balance and current cycle day (e.g. Day 42 of 100).</li>
                </ul>
                <p>Internal tenant accounting keys or platform metadata are never exposed in outward communication.</p>
              </section>

              <section id="priv-5" className="doc-block">
                <h3>5. Local Device Storage (SQLite)</h3>
                <p>
                  Mobile applications store offline cached transaction ledgers inside encrypted SQLite databases protected by hardware-backed Android Keystore / iOS Keychain encryption. When agents issue thermal Bluetooth receipts offline, the cryptographic hash ensures data cannot be modified before cloud synchronization.
                </p>
              </section>

              <section id="priv-6" className="doc-block">
                <h3>6. Data Retention & Deletion</h3>
                <p>
                  Tenants retain complete sovereignty over their data. Upon request of subscription termination, a cryptographic wipe of all tenant records, borrower entries, and vault audit journals is executed within 30 days, with an immutable certificate of deletion issued to the tenant administrator.
                </p>
              </section>

              <section id="priv-7" className="doc-block">
                <h3>7. Zero Data Selling Guarantee</h3>
                <p>
                  We never sell, rent, monetize, or share tenant loan performance data, borrower demographics, or collection recovery statistics with third-party advertising networks or external credit scoring syndicates.
                </p>
              </section>

              <section id="priv-8" className="doc-block">
                <h3>8. Contact Our Data Protection Officer</h3>
                <p>
                  For privacy inquiries, audit requests, or tenant encryption key verification, contact our dedicated security team at <code>privacy@financeportal.io</code>.
                </p>
              </section>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
};
