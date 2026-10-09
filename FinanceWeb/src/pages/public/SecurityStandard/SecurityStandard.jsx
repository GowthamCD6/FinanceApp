import React, { useEffect } from 'react';
import { PublicHeader } from '../PublicHeader';
import { PublicFooter } from '../PublicFooter';
import { Lock, ShieldCheck, Key, Cpu, Server, CheckCircle, Award, Terminal } from 'lucide-react';
import '../PublicLayout.css';

export const SecurityStandard = () => {
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
              <Lock size={14} />
              <span>CRYPTOGRAPHIC ENCLAVE & ZERO-LEAKAGE ARCHITECTURE</span>
            </div>
            <h1 className="public-hero-title">Tenant Data Encryption Standard</h1>
            <p className="public-hero-subtitle">
              Detailed technical specification of our multi-tenant cryptographic boundaries, double-entry vault protection, and hardware-backed key rotation protocols.
            </p>
            <div className="public-meta-bar">
              <span><strong>Standard:</strong> FIPS 140-2 Level 3 Hardware Security</span>
              <span>•</span>
              <span><strong>Audit:</strong> Real-Time Immutable Ledger</span>
              <span>•</span>
              <span><strong>Zero Knowledge:</strong> Tenant-Isolated DB</span>
            </div>
          </div>
        </section>

        {/* Security Architecture Grid */}
        <section className="public-doc-section">
          <div className="standard-container">
            <div className="security-pillars-grid">
              <div className="sec-pillar-card">
                <div className="sec-pillar-icon"><Key size={26} /></div>
                <h4>Tenant-Specific Key Encapsulation</h4>
                <p>Every tenant organization is assigned a unique 256-bit AES master key stored inside dedicated Hardware Security Modules (HSMs). Database columns containing borrower balances are encrypted at rest with envelope encryption.</p>
              </div>

              <div className="sec-pillar-card">
                <div className="sec-pillar-icon"><Cpu size={26} /></div>
                <h4>Offline SQLite Hardware Keystores</h4>
                <p>Field agent mobile devices store local 100-day collection caches inside encrypted SQLite tables locked with biometric and device-bound asymmetric cryptographic keys.</p>
              </div>

              <div className="sec-pillar-card">
                <div className="sec-pillar-icon"><Server size={26} /></div>
                <h4>Strict Multi-Tenant Row Separation</h4>
                <p>Platform microservices enforce cryptographic organization UUID tagging at the database connection pool layer. Cross-tenant queries are blocked before query evaluation.</p>
              </div>

              <div className="sec-pillar-card">
                <div className="sec-pillar-icon"><Terminal size={26} /></div>
                <h4>Immutable Audit Journaling</h4>
                <p>Every double-entry vault balance transfer, manager cashier cash drop, or lending configuration update generates a cryptographically signed broadcast audit event that cannot be purged.</p>
              </div>
            </div>

            {/* Technical Deep Dive */}
            <div className="security-deep-dive">
              <h3>Role-Based Access Control (RBAC) Hierarchy</h3>
              <div className="rbac-table-wrapper">
                <table className="public-data-table">
                  <thead>
                    <tr>
                      <th>Tier Level</th>
                      <th>Role Identifier</th>
                      <th>Permitted Operations</th>
                      <th>Token Expiry</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><strong>Tier 1</strong></td>
                      <td>SuperAdmin Overseer</td>
                      <td>Tenant provisioning, Kubernetes nodes, API analytics, global cluster monitoring</td>
                      <td>2 Hours + MFA</td>
                    </tr>
                    <tr>
                      <td><strong>Tier 2</strong></td>
                      <td>Organization Admin</td>
                      <td>Branch creation, interest scheme setup, cashier authorization, ledger reporting</td>
                      <td>8 Hours</td>
                    </tr>
                    <tr>
                      <td><strong>Tier 3</strong></td>
                      <td>Branch Cashier</td>
                      <td>Physical safe balance acceptance, agent route check-in, daily cash drops</td>
                      <td>12 Hours</td>
                    </tr>
                    <tr>
                      <td><strong>Tier 4</strong></td>
                      <td>Field Collection Agent</td>
                      <td>Assigned route shopkeeper visits, offline collection receipt issuing, Bluetooth sync</td>
                      <td>24 Hours (Offline Cached)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
};
