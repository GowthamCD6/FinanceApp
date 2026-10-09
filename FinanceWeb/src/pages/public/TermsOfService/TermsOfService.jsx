import React, { useEffect } from 'react';
import { PublicHeader } from '../PublicHeader';
import { PublicFooter } from '../PublicFooter';
import { ShieldCheck, FileText, Scale, Lock, Clock, AlertCircle } from 'lucide-react';
import '../PublicLayout.css';

export const TermsOfService = () => {
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
              <Scale size={14} />
              <span>LEGAL AGREEMENT & TENANT GOVERNANCE</span>
            </div>
            <h1 className="public-hero-title">Terms & Conditions</h1>
            <p className="public-hero-subtitle">
              Master Subscription and Operating Agreement governing multi-tenant access, lending data isolation, cryptographic keys, and offline field collection synchronization.
            </p>
            <div className="public-meta-bar">
              <span><strong>Last Updated:</strong> October 2026</span>
              <span>•</span>
              <span><strong>Version:</strong> 4.2 Enterprise SaaS</span>
              <span>•</span>
              <span><strong>Compliance:</strong> Multi-Tenant RBI & FinTech Standards</span>
            </div>
          </div>
        </section>

        {/* Content Document */}
        <section className="public-doc-section">
          <div className="standard-container public-doc-grid">
            {/* Sidebar Table of Contents */}
            <aside className="doc-sidebar">
              <div className="doc-toc-card">
                <h5>Table of Contents</h5>
                <ul>
                  <li><a href="#section-1">1. Acceptance of Terms</a></li>
                  <li><a href="#section-2">2. Multi-Tenant Workspace License</a></li>
                  <li><a href="#section-3">3. Lending Schemes & Disbursal Rules</a></li>
                  <li><a href="#section-4">4. Field Collection & Offline Sync</a></li>
                  <li><a href="#section-5">5. Double-Entry Safe & Vault Rules</a></li>
                  <li><a href="#section-6">6. Cryptographic Data Isolation</a></li>
                  <li><a href="#section-7">7. Service Availability & SLAs</a></li>
                  <li><a href="#section-8">8. Limitation of Liability</a></li>
                  <li><a href="#section-9">9. Governing Law & Dispute Resolution</a></li>
                </ul>
              </div>
            </aside>

            {/* Document Content */}
            <div className="doc-article-body">
              <section id="section-1" className="doc-block">
                <h3>1. Acceptance of Terms</h3>
                <p>
                  By registering for an account, accessing a tenant organization subdomain (e.g. <code>tenant.financeportal.io</code>), or deploying field agent collection terminals on the Finance Portal platform ("Service"), you agree to be bound by these Terms and Conditions ("Terms"). If you represent an organization or financial institution, you represent and warrant that you possess the full corporate authority to bind such entity to these Terms.
                </p>
              </section>

              <section id="section-2" className="doc-block">
                <h3>2. Multi-Tenant Workspace License</h3>
                <p>
                  Subject to subscription compliance, Finance Portal grants your organization a non-exclusive, non-transferable, revocable license to configure an isolated cryptographic tenant workspace. Tenant administrators maintain sovereign authority over:
                </p>
                <ul className="doc-list">
                  <li><strong>Branch Creation:</strong> Establishing physical regional branches, branch managers, and cashier safes.</li>
                  <li><strong>Route Collector Allocation:</strong> Assigning field collection agents to localized bazaar zones and customer routes.</li>
                  <li><strong>Access Credentials:</strong> Provisioning and revoking staff access tokens with zero cross-tenant credential leakage.</li>
                </ul>
              </section>

              <section id="section-3" className="doc-block">
                <h3>3. Lending Schemes & Disbursal Rules</h3>
                <p>
                  The platform provides automated mathematical calculation engines for:
                </p>
                <div className="doc-callout-grid">
                  <div className="callout-card">
                    <h4>Daily Merchant 100-Day Advances</h4>
                    <p>Calculated amortizations with fixed dynamic fee rates (e.g. ₹10,000 principal yielding ₹12,500 total at ₹125/day recovery), automated grace periods, and overdue penalty flags.</p>
                  </div>
                  <div className="callout-card">
                    <h4>Weekly Chit Funds & Market Syndicates</h4>
                    <p>Deterministic 10-week, 20-week, or monthly tenure tracking with dividend auction distributions and subscriber ledgers.</p>
                  </div>
                </div>
                <p>
                  Each tenant is solely responsible for ensuring that interest rates, processing fees, and collection schedules configured on their tenant workspace comply with applicable state and national lending regulations.
                </p>
              </section>

              <section id="section-4" className="doc-block">
                <h3>4. Field Collection & Offline Sync</h3>
                <p>
                  Field collection staff may utilize our encrypted mobile applications in environments with intermittent or zero internet connectivity. All offline transactions are written to local AES-256 SQLite ledgers and assigned deterministic transaction hashes. Upon reconnecting to cellular networks, records synchronize automatically with central double-entry vault servers. Alteration of local device logs or timestamp tampering constitutes a material breach and triggers automated session revocation.
                </p>
              </section>

              <section id="section-5" className="doc-block">
                <h3>5. Double-Entry Safe & Vault Rules</h3>
                <p>
                  The platform enforces rigorous double-entry accounting across physical branch safes and organization treasuries. Every credit entry must be balanced with an offsetting debit entry. No administrative user or platform superadmin can mutate historical ledger records without generating a tamper-evident audit journal entry.
                </p>
              </section>

              <section id="section-6" className="doc-block">
                <h3>6. Cryptographic Data Isolation</h3>
                <p>
                  Every tenant database record is indexed with a dedicated organization UUID and encrypted using tenant-specific cryptographic enclave keys. We guarantee zero cross-tenant leakage. Finance Portal platform engineers cannot inspect customer borrower phone numbers, double-entry ledger amounts, or collection records without explicit break-glass authorization logged in the public audit trail.
                </p>
              </section>

              <section id="section-7" className="doc-block">
                <h3>7. Service Availability & SLAs</h3>
                <p>
                  We strive to maintain a 99.99% monthly uptime across our distributed Kubernetes cluster infrastructure. Scheduled maintenance windows are communicated at least 48 hours in advance through the SuperAdmin Broadcast channel.
                </p>
              </section>

              <section id="section-8" className="doc-block">
                <h3>8. Limitation of Liability</h3>
                <p>
                  To the maximum extent permitted by applicable law, Finance Portal SaaS Inc. shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, loan defaults, field collection discrepancies, or data loss resulting from unauthorized third-party access to tenant credentials.
                </p>
              </section>

              <section id="section-9" className="doc-block">
                <h3>9. Governing Law & Dispute Resolution</h3>
                <p>
                  These Terms shall be governed by and construed in accordance with the laws of India and applicable international FinTech governance frameworks. Any dispute arising out of or in connection with this agreement shall be submitted to confidential binding arbitration.
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
