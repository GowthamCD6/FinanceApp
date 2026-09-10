import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useOrg } from '../../context/OrgContext';
import { StatCard } from '../../components/common/StatCard';
import { StatusBadge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import {
  Store,
  Plus,
  Search,
  Filter,
  DollarSign,
  TrendingUp,
  Receipt,
  Phone,
  MapPin,
  CheckCircle2,
  Clock,
  AlertTriangle,
  CreditCard,
  Printer,
  Calendar,
  Layers,
  ArrowRight,
} from 'lucide-react';

export const Shopkeepers = () => {
  const { activeOrg } = useOrg();
  const [shopkeepers, setShopkeepers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, COLLECTED, PENDING, MISSED
  const [routeFilter, setRouteFilter] = useState('ALL');

  // Modals state
  const [isCollectModalOpen, setIsCollectModalOpen] = useState(false);
  const [selectedShop, setSelectedShop] = useState(null);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [paymentMode, setPaymentMode] = useState('UPI');
  const [receiptData, setReceiptData] = useState(null);

  // New Daily Loan Modal state
  const [isNewLoanModalOpen, setIsNewLoanModalOpen] = useState(false);
  const [loanFormShopId, setLoanFormShopId] = useState('');
  const [newLoanForm, setNewLoanForm] = useState({
    loan_name: '',
    principal: 20000,
    total_installments: 25,
    frequency: 'DAILY',
  });

  // Register New Shopkeeper Modal
  const [isNewShopModalOpen, setIsNewShopModalOpen] = useState(false);
  const [newShopForm, setNewShopForm] = useState({
    shop_name: '',
    market_location: 'Saidapet Bazaar Route',
    stall_no: '',
    owner_name: '',
    phone: '',
    credit_limit: 50000,
    initial_loan_amount: 20000,
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await api.getShopkeepers();
      setShopkeepers(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const formatCurrency = (amt) => '₹' + Number(amt || 0).toLocaleString('en-IN');

  // Filtered list
  const filteredShops = shopkeepers.filter((shop) => {
    const matchesSearch =
      (shop.shop_name && shop.shop_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      shop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shop.phone.includes(searchTerm) ||
      (shop.stall_no && shop.stall_no.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      statusFilter === 'ALL' || shop.today_collection_status === statusFilter;

    const matchesRoute =
      routeFilter === 'ALL' || (shop.market_location && shop.market_location === routeFilter);

    return matchesSearch && matchesStatus && matchesRoute;
  });

  // Aggregate Metrics for Shopkeeper Microfinance
  const totalShops = shopkeepers.length;
  const totalShopCapital = shopkeepers.reduce((sum, s) => sum + (s.total_principal_given || 0), 0);
  const totalDailyTarget = shopkeepers.reduce((sum, s) => sum + (s.daily_collection_target || 0), 0);
  const collectedTodayAmount = shopkeepers.reduce((sum, s) => {
    const coll = s.today_entries
      ? s.today_entries.filter((e) => e.status === 'COLLECTED').reduce((acc, e) => acc + (e.collected_amount || 0), 0)
      : 0;
    return sum + coll;
  }, 0);
  const totalOutstandingMarket = shopkeepers.reduce((sum, s) => sum + (s.total_outstanding || 0), 0);

  // Daily Realized Net Profit (Est. 12.5% yield on collected installments)
  const dailyProfitYield = Math.round(collectedTodayAmount * (1 - 1 / 1.125));
  const dailyRunRatePercent = totalDailyTarget > 0 ? Math.round((collectedTodayAmount / totalDailyTarget) * 100) : 0;

  // Handlers
  const handleOpenCollect = (shop, loan) => {
    setSelectedShop(shop);
    setSelectedLoan(loan || (shop.loans && shop.loans[0]) || null);
    setIsCollectModalOpen(true);
  };

  const handleConfirmCollection = async () => {
    if (!selectedShop || !selectedLoan) return;
    try {
      const res = await api.recordShopkeeperCollection(selectedShop.id, selectedLoan.loan_code, paymentMode);
      setReceiptData({
        ...res,
        shop_name: selectedShop.shop_name || selectedShop.name,
        owner_name: selectedShop.name,
        phone: selectedShop.phone,
        loan_code: selectedLoan.loan_code,
        payment_mode: paymentMode,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
      setIsCollectModalOpen(false);
      loadData();
    } catch (err) {
      alert('Error recording collection: ' + err.message);
    }
  };

  const handleOpenNewLoan = (shopId) => {
    setLoanFormShopId(shopId || (shopkeepers[0] ? shopkeepers[0].id : ''));
    setNewLoanForm({
      loan_name: 'Daily Inventory Restock',
      principal: 20000,
      total_installments: 25,
      frequency: 'DAILY',
    });
    setIsNewLoanModalOpen(true);
  };

  const handleCreateLoanSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.createLoan({
        borrower_id: loanFormShopId,
        loan_name: newLoanForm.loan_name,
        principal: newLoanForm.principal,
        frequency: 'DAILY',
        total_installments: newLoanForm.total_installments,
      });
      setIsNewLoanModalOpen(false);
      loadData();
    } catch (err) {
      alert('Error creating daily loan: ' + err.message);
    }
  };

  const handleCreateShopSubmit = async (e) => {
    e.preventDefault();
    try {
      const newShopUser = await api.addUser({
        name: newShopForm.owner_name,
        phone: newShopForm.phone,
        role: 'SHOPKEEPER',
        shop_name: newShopForm.shop_name,
        market_location: newShopForm.market_location,
        stall_no: newShopForm.stall_no,
        credit_limit: newShopForm.credit_limit,
      });

      if (newShopForm.initial_loan_amount > 0) {
        await api.createLoan({
          borrower_id: newShopUser.id,
          loan_name: 'Initial Merchant Working Capital',
          principal: newShopForm.initial_loan_amount,
          frequency: 'DAILY',
          total_installments: 25,
        });
      }

      setIsNewShopModalOpen(false);
      loadData();
    } catch (err) {
      alert('Error registering shopkeeper: ' + err.message);
    }
  };

  if (loading) return <div className="page-loading">Loading Shopkeeper Daily Ledger...</div>;

  return (
    <div className="shopkeepers-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="org-pill">
            <Store size={14} />
            <span>{activeOrg ? `${activeOrg.name} • Shopkeeper Daily Division` : 'Apex Finance • Shopkeeper Ledger'}</span>
          </div>
          <h1 className="page-title">Shopkeeper Daily Ledger & Collections</h1>
          <p className="page-subtitle">
            Daily market merchant microfinance, 25-day cycle tracking, multi-loan ledger per shop, and instant daily collections.
          </p>
        </div>

        <div className="header-actions">
          <button className="btn btn-emerald" onClick={() => setIsNewShopModalOpen(true)}>
            <Plus size={16} />
            <span>Register New Shop</span>
          </button>
          <button className="btn btn-primary" onClick={() => handleOpenNewLoan()}>
            <CreditCard size={16} />
            <span>Disburse Daily Loan</span>
          </button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid-4" style={{ marginBottom: '1.5rem' }}>
        <StatCard
          label="Daily Capital Invested"
          value={formatCurrency(totalShopCapital)}
          icon={Store}
          trend={`${totalShops} Registered Shops`}
          trendDirection="up"
          meta={`Market Debt: ${formatCurrency(totalOutstandingMarket)}`}
          accentColor="#4F46E5"
          accentBg="#EEF2FF"
        />

        <StatCard
          label="Today's Daily Target"
          value={formatCurrency(totalDailyTarget)}
          icon={Receipt}
          trend={`${dailyRunRatePercent}% Realized`}
          trendDirection="up"
          meta={`Collected: ${formatCurrency(collectedTodayAmount)}`}
          accentColor="#059669"
          accentBg="#ECFDF5"
        />

        <StatCard
          label="Daily Net Profit Yield"
          value={formatCurrency(dailyProfitYield)}
          icon={TrendingUp}
          trend="12.5% Interest Margin"
          trendDirection="up"
          meta="Net Cash Yield Today"
          accentColor="#D97706"
          accentBg="#FFFBEB"
        />

        <StatCard
          label="Route Progress"
          value={`${shopkeepers.filter((s) => s.today_collection_status === 'COLLECTED').length}/${totalShops} Shops`}
          icon={CheckCircle2}
          trend="Today's Field Route"
          trendDirection="up"
          meta={`${shopkeepers.filter((s) => s.today_collection_status === 'PENDING').length} Pending Visits`}
          accentColor="#0284C7"
          accentBg="#F0F9FF"
        />
      </div>

      {/* Filter and Search Bar */}
      <div className="table-card" style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem' }}>
        <div className="filter-row">
          <div className="search-box">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search by Shop Name, Owner, Phone, Stall No..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <div className="filter-select-wrapper">
              <Filter size={14} />
              <select value={routeFilter} onChange={(e) => setRouteFilter(e.target.value)}>
                <option value="ALL">All Market Routes</option>
                <option value="Saidapet Bazaar Route">Saidapet Bazaar Route</option>
                <option value="Triplicane High Road">Triplicane High Road</option>
                <option value="T. Nagar Bus Terminus">T. Nagar Bus Terminus</option>
                <option value="Mylapore Temple Market">Mylapore Temple Market</option>
              </select>
            </div>

            <div className="filter-select-wrapper">
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="ALL">All Collection Status</option>
                <option value="COLLECTED">Collected Today</option>
                <option value="PENDING">Pending Visit</option>
                <option value="MISSED">Missed / Closed</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Shopkeeper Ledger Table */}
      <div className="table-card">
        <div className="table-header-title">
          <div className="tht-left">
            <Store size={18} />
            <span>Market Shopkeeper Ledger & Multi-Loan Registry</span>
          </div>
          <span className="badge badge-info">{filteredShops.length} Stores Listed</span>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Store & Market Stall</th>
                <th>Owner & Contact</th>
                <th>Active Daily Loans</th>
                <th>Daily Due Target</th>
                <th>Total Outstanding</th>
                <th>Today's Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredShops.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-muted">
                    No shopkeepers found matching your search or filters.
                  </td>
                </tr>
              ) : (
                filteredShops.map((shop) => {
                  const activeLoans = (shop.loans || []).filter((l) => l.status === 'ACTIVE' || l.status === 'OVERDUE');
                  const isMultiLoan = activeLoans.length > 1;

                  return (
                    <tr key={shop.id}>
                      {/* Store & Stall */}
                      <td>
                        <div className="store-cell">
                          <div className="store-avatar">
                            <Store size={18} />
                          </div>
                          <div>
                            <div className="store-name">{shop.shop_name || shop.name}</div>
                            <div className="store-location">
                              <MapPin size={12} />
                              <span>{shop.market_location || 'Field Route'} • <strong>{shop.stall_no || 'Stall #N/A'}</strong></span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Owner & Phone */}
                      <td>
                        <div className="owner-cell">
                          <span className="owner-name">{shop.name}</span>
                          <span className="owner-phone">
                            <Phone size={12} />
                            {shop.phone}
                          </span>
                        </div>
                      </td>

                      {/* Active Daily Loans */}
                      <td>
                        <div className="loans-stack">
                          {activeLoans.length === 0 ? (
                            <span className="text-muted text-xs">No active loans</span>
                          ) : (
                            activeLoans.map((loan, idx) => {
                              const progress = Math.round((loan.paid_installments / loan.total_installments) * 100);
                              return (
                                <div key={loan.loan_code} className="loan-mini-card">
                                  <div className="lmc-header">
                                    <span className="lmc-code">{loan.loan_code}</span>
                                    <span className="lmc-days">
                                      Day {loan.paid_installments}/{loan.total_installments}
                                    </span>
                                  </div>
                                  <div className="lmc-name">{loan.loan_name || `Daily Loan #${idx + 1}`}</div>
                                  <div className="lmc-progress-bar">
                                    <div className="lmc-fill" style={{ width: `${progress}%` }} />
                                  </div>
                                </div>
                              );
                            })
                          )}
                          {isMultiLoan && (
                            <span className="badge badge-indigo text-xs" style={{ alignSelf: 'flex-start' }}>
                              ⚡ {activeLoans.length} Active Loans
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Daily Due Target */}
                      <td>
                        <div className="due-cell">
                          <span className="due-amount">{formatCurrency(shop.daily_collection_target)}</span>
                          <span className="due-sub">per day</span>
                        </div>
                      </td>

                      {/* Total Outstanding */}
                      <td>
                        <div className="outstanding-cell">
                          <span className="out-amount">{formatCurrency(shop.total_outstanding)}</span>
                          <span className="out-sub">from {formatCurrency(shop.total_principal_given)} invested</span>
                        </div>
                      </td>

                      {/* Today's Status */}
                      <td>
                        {shop.today_collection_status === 'COLLECTED' ? (
                          <span className="badge badge-success">
                            <CheckCircle2 size={12} />
                            Collected
                          </span>
                        ) : shop.today_collection_status === 'MISSED' ? (
                          <span className="badge badge-danger">
                            <AlertTriangle size={12} />
                            Missed / Closed
                          </span>
                        ) : (
                          <span className="badge badge-warning">
                            <Clock size={12} />
                            Pending Visit
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td style={{ textAlign: 'right' }}>
                        <div className="action-buttons-group">
                          {activeLoans.length > 0 && shop.today_collection_status !== 'COLLECTED' && (
                            <button
                              className="btn btn-emerald btn-sm"
                              onClick={() => handleOpenCollect(shop, activeLoans[0])}
                            >
                              <Receipt size={14} />
                              <span>Collect</span>
                            </button>
                          )}

                          <button
                            className="btn btn-secondary btn-sm"
                            title="Add Another Loan to this Shop"
                            onClick={() => handleOpenNewLoan(shop.id)}
                          >
                            <Plus size={14} />
                            <span>Add Loan</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: RECORD DAILY COLLECTION */}
      {isCollectModalOpen && selectedShop && selectedLoan && (
        <Modal
          title={`Collect Daily Installment • ${selectedShop.shop_name || selectedShop.name}`}
          isOpen={isCollectModalOpen}
          onClose={() => setIsCollectModalOpen(false)}
        >
          <div className="collect-modal-content">
            <div className="cm-summary-card">
              <div className="cm-row">
                <span className="cm-lbl">Shop:</span>
                <span className="cm-val">{selectedShop.shop_name || selectedShop.name} ({selectedShop.stall_no})</span>
              </div>
              <div className="cm-row">
                <span className="cm-lbl">Owner:</span>
                <span className="cm-val">{selectedShop.name} ({selectedShop.phone})</span>
              </div>
              <div className="cm-row">
                <span className="cm-lbl">Loan Contract:</span>
                <span className="cm-val font-mono">{selectedLoan.loan_code} • {selectedLoan.loan_name}</span>
              </div>
              <div className="cm-row">
                <span className="cm-lbl">Cycle Day:</span>
                <span className="cm-val">Day {(selectedLoan.paid_installments || 0) + 1} of {selectedLoan.total_installments}</span>
              </div>
            </div>

            <div className="cm-amount-box">
              <div className="cab-label">DAILY DUE AMOUNT</div>
              <div className="cab-value">{formatCurrency(selectedLoan.installment_amount)}</div>
              <div className="cab-sub">Remaining Balance after payment: {formatCurrency(Math.max(0, selectedLoan.remaining_balance - selectedLoan.installment_amount))}</div>
            </div>

            <div className="form-group" style={{ marginTop: '1.25rem' }}>
              <label className="form-label">Payment Mode</label>
              <div className="payment-mode-selector">
                <button
                  type="button"
                  className={`pm-btn ${paymentMode === 'UPI' ? 'active' : ''}`}
                  onClick={() => setPaymentMode('UPI')}
                >
                  <CreditCard size={16} />
                  <span>UPI / QR Scan</span>
                </button>
                <button
                  type="button"
                  className={`pm-btn ${paymentMode === 'CASH' ? 'active' : ''}`}
                  onClick={() => setPaymentMode('CASH')}
                >
                  <DollarSign size={16} />
                  <span>Cash in Hand</span>
                </button>
              </div>
            </div>

            <div className="modal-actions" style={{ marginTop: '1.5rem' }}>
              <button className="btn btn-secondary" onClick={() => setIsCollectModalOpen(false)}>
                Cancel
              </button>
              <button className="btn btn-emerald" onClick={handleConfirmCollection}>
                <CheckCircle2 size={16} />
                <span>Confirm {formatCurrency(selectedLoan.installment_amount)} Collection</span>
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL 2: RECEIPT GENERATOR */}
      {receiptData && (
        <Modal
          title="Daily Collection Receipt Generated"
          isOpen={Boolean(receiptData)}
          onClose={() => setReceiptData(null)}
        >
          <div className="receipt-view">
            <div className="receipt-box" id="printable-receipt">
              <div className="receipt-header">
                <div className="rh-org">{activeOrg ? activeOrg.name : 'Apex Finance Ltd'}</div>
                <div className="rh-sub">Merchant Daily Collection Acknowledgement</div>
                <div className="rh-receipt-no font-mono">{receiptData.receipt_no}</div>
              </div>

              <div className="receipt-body">
                <div className="rb-row">
                  <span>Store:</span>
                  <strong>{receiptData.shop_name}</strong>
                </div>
                <div className="rb-row">
                  <span>Owner:</span>
                  <span>{receiptData.owner_name}</span>
                </div>
                <div className="rb-row">
                  <span>Phone:</span>
                  <span>{receiptData.phone}</span>
                </div>
                <div className="rb-row">
                  <span>Loan Code:</span>
                  <span className="font-mono">{receiptData.loan_code}</span>
                </div>
                <div className="rb-row">
                  <span>Progress:</span>
                  <span>Day {receiptData.paid_installments} of {receiptData.total_installments} Completed</span>
                </div>
                <div className="rb-row">
                  <span>Payment Mode:</span>
                  <strong>{receiptData.payment_mode}</strong>
                </div>
                <div className="rb-row">
                  <span>Time:</span>
                  <span>{receiptData.timestamp}</span>
                </div>

                <div className="rb-divider" />

                <div className="rb-row rb-total">
                  <span>Amount Received:</span>
                  <strong className="text-emerald">{formatCurrency(receiptData.collected_amount)}</strong>
                </div>
                <div className="rb-row rb-sub">
                  <span>Remaining Debt:</span>
                  <span>{formatCurrency(receiptData.remaining_balance)}</span>
                </div>
              </div>

              <div className="receipt-footer">
                <div className="rf-text">Thank you for your timely payment!</div>
                <div className="rf-auth">Verified by Field Operations Admin</div>
              </div>
            </div>

            <div className="modal-actions" style={{ marginTop: '1.25rem' }}>
              <button className="btn btn-secondary" onClick={() => window.print()}>
                <Printer size={16} />
                <span>Print Receipt</span>
              </button>
              <button className="btn btn-primary" onClick={() => setReceiptData(null)}>
                <span>Done</span>
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL 3: DISBURSE NEW DAILY LOAN */}
      {isNewLoanModalOpen && (
        <Modal
          title="Disburse Daily Micro-Loan to Shopkeeper"
          isOpen={isNewLoanModalOpen}
          onClose={() => setIsNewLoanModalOpen(false)}
        >
          <form onSubmit={handleCreateLoanSubmit}>
            <div className="form-group">
              <label className="form-label">Select Shopkeeper Store</label>
              <select
                className="form-input"
                value={loanFormShopId}
                onChange={(e) => setLoanFormShopId(e.target.value)}
                required
              >
                {shopkeepers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.shop_name || s.name} ({s.stall_no || s.market_location}) — {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Loan Purpose / Label</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Festival Inventory Loan, Morning Dairy Batch..."
                value={newLoanForm.loan_name}
                onChange={(e) => setNewLoanForm({ ...newLoanForm, loan_name: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Principal Amount (₹)</label>
              <div className="preset-chips">
                {[10000, 15000, 20000, 30000, 40000, 50000].map((amt) => (
                  <button
                    type="button"
                    key={amt}
                    className={`preset-chip ${Number(newLoanForm.principal) === amt ? 'active' : ''}`}
                    onClick={() => setNewLoanForm({ ...newLoanForm, principal: amt })}
                  >
                    {formatCurrency(amt)}
                  </button>
                ))}
              </div>
              <input
                type="number"
                className="form-input"
                style={{ marginTop: '0.5rem' }}
                value={newLoanForm.principal}
                onChange={(e) => setNewLoanForm({ ...newLoanForm, principal: parseFloat(e.target.value) || 0 })}
                min="5000"
                max="200000"
                required
              />
            </div>

            {/* Calculations Preview */}
            {(() => {
              const principal = parseFloat(newLoanForm.principal) || 0;
              const interest = Math.round(principal * 0.125);
              const totalRepayable = principal + interest;
              const dailyInstallment = Math.round(totalRepayable / 25);
              return (
                <div className="loan-preview-box">
                  <div className="lpb-title">25-Day Daily Schedule Calculation</div>
                  <div className="lpb-grid">
                    <div>
                      <span className="lpb-lbl">Principal Given:</span>
                      <span className="lpb-val">{formatCurrency(principal)}</span>
                    </div>
                    <div>
                      <span className="lpb-lbl">Expected Interest (12.5%):</span>
                      <span className="lpb-val text-emerald">+{formatCurrency(interest)}</span>
                    </div>
                    <div>
                      <span className="lpb-lbl">Total Repayable:</span>
                      <span className="lpb-val font-bold">{formatCurrency(totalRepayable)}</span>
                    </div>
                    <div>
                      <span className="lpb-lbl">Daily Installment (25 Days):</span>
                      <span className="lpb-val text-indigo font-bold">{formatCurrency(dailyInstallment)} / day</span>
                    </div>
                  </div>
                </div>
              );
            })()}

            <div className="modal-actions" style={{ marginTop: '1.5rem' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setIsNewLoanModalOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                <CreditCard size={16} />
                <span>Disburse Daily Loan</span>
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL 4: REGISTER NEW SHOPKEEPER */}
      {isNewShopModalOpen && (
        <Modal
          title="Register New Shopkeeper & Provision Initial Loan"
          isOpen={isNewShopModalOpen}
          onClose={() => setIsNewShopModalOpen(false)}
        >
          <form onSubmit={handleCreateShopSubmit}>
            <div className="form-group">
              <label className="form-label">Shop / Store Name *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Sri Lakshmi Provision Store"
                value={newShopForm.shop_name}
                onChange={(e) => setNewShopForm({ ...newShopForm, shop_name: e.target.value })}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Market Route *</label>
                <select
                  className="form-input"
                  value={newShopForm.market_location}
                  onChange={(e) => setNewShopForm({ ...newShopForm, market_location: e.target.value })}
                  required
                >
                  <option value="Saidapet Bazaar Route">Saidapet Bazaar Route</option>
                  <option value="Triplicane High Road">Triplicane High Road</option>
                  <option value="T. Nagar Bus Terminus">T. Nagar Bus Terminus</option>
                  <option value="Mylapore Temple Market">Mylapore Temple Market</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Stall / Shop # *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Stall #45-A"
                  value={newShopForm.stall_no}
                  onChange={(e) => setNewShopForm({ ...newShopForm, stall_no: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Owner Full Name *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Venkatesan M"
                  value={newShopForm.owner_name}
                  onChange={(e) => setNewShopForm({ ...newShopForm, owner_name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number (10-Digit) *</label>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="98XXXXXXXX"
                  value={newShopForm.phone}
                  onChange={(e) => setNewShopForm({ ...newShopForm, phone: e.target.value })}
                  maxLength="10"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Initial Working Capital Loan (₹)</label>
              <div className="preset-chips">
                {[10000, 20000, 30000, 40000].map((amt) => (
                  <button
                    type="button"
                    key={amt}
                    className={`preset-chip ${Number(newShopForm.initial_loan_amount) === amt ? 'active' : ''}`}
                    onClick={() => setNewShopForm({ ...newShopForm, initial_loan_amount: amt })}
                  >
                    {formatCurrency(amt)}
                  </button>
                ))}
              </div>
            </div>

            <div className="modal-actions" style={{ marginTop: '1.5rem' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setIsNewShopModalOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-emerald">
                <Store size={16} />
                <span>Onboard Shopkeeper</span>
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Embedded CSS */}
      <style>{`
        .shopkeepers-page {
          display: flex;
          flex-direction: column;
        }

        .filter-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .search-box {
          position: relative;
          flex: 1;
          min-width: 260px;
        }
        .search-icon {
          position: absolute;
          left: 0.85rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
        }
        .search-box input {
          width: 100%;
          padding: 0.65rem 0.85rem 0.65rem 2.4rem;
          border-radius: var(--radius-md);
          border: 1px solid var(--border-color);
          background: #FFFFFF;
          color: var(--text-primary);
          font-size: 0.875rem;
          outline: none;
          transition: border-color var(--transition-fast);
        }
        .search-box input:focus {
          border-color: var(--primary);
        }

        .filter-group {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .filter-select-wrapper {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          background: #F8FAFC;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: 0.25rem 0.65rem;
          color: var(--text-secondary);
        }
        .filter-select-wrapper select {
          background: transparent;
          border: none;
          color: var(--text-primary);
          font-size: 0.82rem;
          font-weight: 600;
          outline: none;
          cursor: pointer;
        }

        .store-cell {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .store-avatar {
          width: 38px;
          height: 38px;
          border-radius: var(--radius-md);
          background: #EEF2FF;
          color: var(--primary);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          border: 1px solid #C7D2FE;
        }
        .store-name {
          font-weight: 700;
          color: var(--text-primary);
          font-size: 0.9rem;
        }
        .store-location {
          display: flex;
          align-items: center;
          gap: 0.3rem;
          font-size: 0.75rem;
          color: var(--text-muted);
          margin-top: 0.15rem;
        }

        .owner-cell {
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
        }
        .owner-name {
          font-weight: 600;
          color: var(--text-primary);
          font-size: 0.85rem;
        }
        .owner-phone {
          display: flex;
          align-items: center;
          gap: 0.3rem;
          font-size: 0.75rem;
          color: var(--text-secondary);
          font-family: monospace;
        }

        .loans-stack {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          min-width: 170px;
        }
        .loan-mini-card {
          background: #F8FAFC;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          padding: 0.4rem 0.55rem;
        }
        .lmc-header {
          display: flex;
          justify-content: space-between;
          font-size: 0.7rem;
          font-family: monospace;
        }
        .lmc-code {
          font-weight: 700;
          color: var(--primary);
        }
        .lmc-days {
          font-weight: 700;
          color: var(--emerald);
        }
        .lmc-name {
          font-size: 0.72rem;
          color: var(--text-secondary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          margin: 0.15rem 0 0.3rem;
        }
        .lmc-progress-bar {
          height: 4px;
          border-radius: 2px;
          background: #E2E8F0;
          overflow: hidden;
        }
        .lmc-fill {
          height: 100%;
          background: var(--emerald);
          border-radius: 2px;
        }

        .due-cell {
          display: flex;
          flex-direction: column;
        }
        .due-amount {
          font-weight: 800;
          font-size: 0.95rem;
          color: var(--text-primary);
        }
        .due-sub {
          font-size: 0.7rem;
          color: var(--text-muted);
        }

        .outstanding-cell {
          display: flex;
          flex-direction: column;
        }
        .out-amount {
          font-weight: 700;
          font-size: 0.88rem;
          color: var(--primary);
        }
        .out-sub {
          font-size: 0.7rem;
          color: var(--text-muted);
        }

        .action-buttons-group {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 0.4rem;
        }

        .collect-modal-content {
          display: flex;
          flex-direction: column;
        }
        .cm-summary-card {
          background: #F8FAFC;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: 0.85rem 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }
        .cm-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.84rem;
        }
        .cm-lbl {
          color: var(--text-secondary);
        }
        .cm-val {
          font-weight: 600;
          color: var(--text-primary);
        }

        .cm-amount-box {
          margin-top: 1rem;
          background: linear-gradient(135deg, #ECFDF5 0%, #EEF2FF 100%);
          border: 1px solid #A7F3D0;
          border-radius: var(--radius-md);
          padding: 1rem;
          text-align: center;
        }
        .cab-label {
          font-size: 0.72rem;
          font-weight: 800;
          color: var(--emerald);
          letter-spacing: 0.05em;
        }
        .cab-value {
          font-size: 1.75rem;
          font-weight: 900;
          color: var(--text-primary);
          margin: 0.25rem 0;
        }
        .cab-sub {
          font-size: 0.75rem;
          color: var(--text-secondary);
        }

        .payment-mode-selector {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.75rem;
          margin-top: 0.35rem;
        }
        .pm-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.75rem;
          border-radius: var(--radius-md);
          background: #FFFFFF;
          border: 1.5px solid var(--border-color);
          color: var(--text-primary);
          font-weight: 700;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        .pm-btn.active {
          border-color: var(--emerald);
          background: #ECFDF5;
          color: var(--emerald);
        }

        .receipt-box {
          background: #FFFFFF;
          border: 1.5px solid #E2E8F0;
          border-radius: var(--radius-md);
          padding: 1.25rem;
          box-shadow: 0 4px 12px rgba(0,0,0,0.03);
        }
        .receipt-header {
          text-align: center;
          padding-bottom: 0.85rem;
          border-bottom: 1px dashed #CBD5E1;
        }
        .rh-org {
          font-weight: 800;
          font-size: 1.1rem;
          color: var(--primary);
        }
        .rh-sub {
          font-size: 0.78rem;
          color: var(--text-secondary);
        }
        .rh-receipt-no {
          font-size: 0.72rem;
          color: var(--emerald);
          font-weight: 700;
          margin-top: 0.25rem;
        }

        .receipt-body {
          padding: 1rem 0;
          display: flex;
          flex-direction: column;
          gap: 0.45rem;
        }
        .rb-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.82rem;
          color: var(--text-secondary);
        }
        .rb-row strong, .rb-row span {
          color: var(--text-primary);
        }
        .rb-divider {
          height: 1px;
          border-top: 1px dashed #CBD5E1;
          margin: 0.5rem 0;
        }
        .rb-total {
          font-size: 1rem;
          font-weight: 800;
        }

        .receipt-footer {
          text-align: center;
          padding-top: 0.85rem;
          border-top: 1px dashed #CBD5E1;
          font-size: 0.72rem;
          color: var(--text-muted);
        }

        .preset-chips {
          display: flex;
          gap: 0.4rem;
          flex-wrap: wrap;
          margin-top: 0.35rem;
        }
        .preset-chip {
          padding: 0.35rem 0.65rem;
          border-radius: var(--radius-sm);
          background: #F8FAFC;
          border: 1px solid var(--border-color);
          font-size: 0.78rem;
          font-weight: 700;
          cursor: pointer;
          color: var(--text-primary);
        }
        .preset-chip.active {
          background: #EEF2FF;
          border-color: #C7D2FE;
          color: var(--primary);
        }

        .loan-preview-box {
          background: #F8FAFC;
          border: 1px solid #CBD5E1;
          border-radius: var(--radius-md);
          padding: 0.85rem;
          margin-top: 1rem;
        }
        .lpb-title {
          font-size: 0.75rem;
          font-weight: 800;
          color: var(--text-secondary);
          margin-bottom: 0.5rem;
          text-transform: uppercase;
        }
        .lpb-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.5rem;
          font-size: 0.82rem;
        }
        .lpb-lbl {
          display: block;
          font-size: 0.72rem;
          color: var(--text-muted);
        }
        .lpb-val {
          font-weight: 700;
        }
      `}</style>
    </div>
  );
};
