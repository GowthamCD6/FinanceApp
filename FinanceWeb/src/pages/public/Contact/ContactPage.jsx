import React, { useState, useEffect } from 'react';
import { PublicHeader } from '../PublicHeader';
import { PublicFooter } from '../PublicFooter';
import { Mail, Phone, MapPin, Send, CheckCircle2, MessageSquare, Building2, HelpCircle } from 'lucide-react';
import '../PublicLayout.css';

export const ContactPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    orgName: '',
    schemeInterest: 'DAILY_100_DAY',
    message: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormSubmitted(true);
  };

  return (
    <div className="public-page-wrapper">
      <PublicHeader />

      <main className="public-main-content">
        {/* Hero Banner */}
        <section className="public-hero-section">
          <div className="standard-container">
            <div className="public-hero-badge">
              <MessageSquare size={14} />
              <span>ENTERPRISE ADVISORY & SUPPORT</span>
            </div>
            <h1 className="public-hero-title">Get in Touch</h1>
            <p className="public-hero-subtitle">
              Connect with our enterprise lending infrastructure architects to configure multi-tenant portals, branch cashier safes, and field collector fleets.
            </p>
          </div>
        </section>

        {/* Contact Grid Section */}
        <section className="public-doc-section">
          <div className="standard-container contact-split-grid">
            {/* Left: Contact Information & Cards */}
            <div className="contact-info-col">
              <h3>Direct Enterprise Channels</h3>
              <p className="contact-lead-text">
                Our support engineers provide 24/7 mission-critical assistance for double-entry vault reconciliation and offline sync operations.
              </p>

              <div className="contact-cards-list">
                <div className="contact-item-card">
                  <div className="c-icon"><Building2 size={22} /></div>
                  <div>
                    <h5>Enterprise Onboarding</h5>
                    <p>Request high-throughput dedicated tenant clusters and custom subdomains.</p>
                    <span className="c-highlight">enterprise@financeportal.io</span>
                  </div>
                </div>

                <div className="contact-item-card">
                  <div className="c-icon"><Phone size={22} /></div>
                  <div>
                    <h5>Technical & Route Support</h5>
                    <p>Direct priority line for field staff offline Bluetooth thermal printer setup.</p>
                    <span className="c-highlight">+91 800-FINANCE-OPS</span>
                  </div>
                </div>

                <div className="contact-item-card">
                  <div className="c-icon"><MapPin size={22} /></div>
                  <div>
                    <h5>Global Infrastructure Centers</h5>
                    <p>Cloud Vault Region: AWS Mumbai (ap-south-1) & Azure Central India.</p>
                    <span className="c-highlight">FinTech Innovation Tower, Sector 62</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Contact Form */}
            <div className="contact-form-col">
              <div className="contact-form-card">
                {formSubmitted ? (
                  <div className="form-success-state">
                    <CheckCircle2 size={48} className="text-emerald" />
                    <h4>Inquiry Received</h4>
                    <p>
                      Thank you for reaching out. An enterprise platform specialist will contact your organization within 2 business hours.
                    </p>
                    <button
                      type="button"
                      className="btn-form-reset"
                      onClick={() => setFormSubmitted(false)}
                    >
                      Send Another Message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="public-contact-form">
                    <h4>Deploy Your Organization Workspace</h4>
                    <p className="form-desc">Fill out the details below to request a tenant demo.</p>

                    <div className="form-row-2">
                      <div className="form-field">
                        <label>Your Name *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Rajesh Kumar"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                      </div>
                      <div className="form-field">
                        <label>Corporate Email *</label>
                        <input
                          type="email"
                          required
                          placeholder="rajesh@company.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="form-row-2">
                      <div className="form-field">
                        <label>Contact Phone *</label>
                        <input
                          type="tel"
                          required
                          placeholder="+91 98765 43210"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                      </div>
                      <div className="form-field">
                        <label>Organization / Firm Name *</label>
                        <input
                          type="text"
                          required
                          placeholder="Sunrise Microfinance Ltd."
                          value={formData.orgName}
                          onChange={(e) => setFormData({ ...formData, orgName: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="form-field">
                      <label>Primary Lending Scheme</label>
                      <select
                        value={formData.schemeInterest}
                        onChange={(e) => setFormData({ ...formData, schemeInterest: e.target.value })}
                      >
                        <option value="DAILY_100_DAY">Daily Merchant Advance (100-Day Bazaar Cycle)</option>
                        <option value="WEEKLY_CHIT">Weekly Chit Fund & Market Syndicate</option>
                        <option value="MONTHLY_SME">Monthly SME Business Term Loans</option>
                        <option value="MULTI_BRANCH">Multi-Branch Vault Treasury Network</option>
                      </select>
                    </div>

                    <div className="form-field">
                      <label>Message / Requirements</label>
                      <textarea
                        rows={4}
                        placeholder="Tell us about your branch network, collector count, and daily circulation volume..."
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      />
                    </div>

                    <button type="submit" className="btn-contact-submit">
                      <span>Submit Enterprise Request</span>
                      <Send size={16} />
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
};
