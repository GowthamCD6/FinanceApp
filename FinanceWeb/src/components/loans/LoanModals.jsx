import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Pencil,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  Calendar,
  Layers,
  Sparkles,
  Info,
  Check,
  Clock,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';
import { api } from '../../services/api';

/**
 * Helper to format currency
 */
const formatCurrency = (amt) => '₹' + Number(amt || 0).toLocaleString('en-IN');

/**
 * --------------------------------------------------------------------------
 * 1. EDIT LOAN MODAL
 * --------------------------------------------------------------------------
 */
export const EditLoanModal = ({ isOpen, onClose, loan, customer, onSuccess }) => {
  const [formData, setFormData] = useState({
    principal: '',
    interest_rate: '',
    total_installments: '',
    repayment_frequency: 'WEEKLY',
    collection_mode: 'NORMAL',
    disbursement_date: '',
    notes: '',
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (loan && isOpen) {
      const principal = loan.principal_amount || loan.principal || 10000;
      const rate = loan.interest_rate != null ? loan.interest_rate : 12.5;
      const tenure = loan.total_installments || loan.tenure_weeks || loan.tenure_days || loan.tenure_months || 10;
      const freq = loan.repayment_frequency || (loan.type === 'DAILY' ? 'DAILY' : loan.type === 'MONTHLY' ? 'MONTHLY' : 'WEEKLY');
      const mode = loan.collection_mode || customer?.collection_mode || 'NORMAL';
      const disbDate = loan.disbursement_date || loan.issue_date || loan.application_date || new Date().toISOString().slice(0, 10);
      const notes = loan.notes || loan.description || '';

      setFormData({
        principal: String(principal),
        interest_rate: String(rate),
        total_installments: String(tenure),
        repayment_frequency: freq,
        collection_mode: mode,
        disbursement_date: typeof disbDate === 'string' ? disbDate.slice(0, 10) : new Date().toISOString().slice(0, 10),
        notes,
      });
      setError('');
    }
  }, [loan, customer, isOpen]);

  // Calculations
  const calculations = useMemo(() => {
    const p = parseFloat(formData.principal) || 0;
    const r = parseFloat(formData.interest_rate) || 0;
    const t = parseInt(formData.total_installments, 10) || 1;
    const contractedIncome = Math.round(((p * r) / 100) * 100) / 100;
    const totalRepayable = p + contractedIncome;
    const emi = t > 0 ? Math.round(totalRepayable / t) : 0;

    let maturityDate = '';
    if (formData.disbursement_date) {
      try {
        const d = new Date(formData.disbursement_date);
        const daysInterval = formData.repayment_frequency === 'DAILY' ? 1 : (formData.repayment_frequency === 'MONTHLY' ? 30 : 7);
        d.setDate(d.getDate() + t * daysInterval);
        maturityDate = d.toISOString().slice(0, 10);
      } catch (e) {
        maturityDate = '';
      }
    }

    return {
      principal: p,
      interestRate: r,
      tenure: t,
      contractedIncome,
      totalRepayable,
      emi,
      maturityDate,
    };
  }, [formData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!loan) return;
    setError('');

    const p = parseFloat(formData.principal);
    if (isNaN(p) || p <= 0) {
      setError('Please enter a valid principal amount.');
      return;
    }

    const t = parseInt(formData.total_installments, 10);
    if (isNaN(t) || t <= 0) {
      setError('Please enter a valid tenure/installment count.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        principalAmount: p,
        interestRate: parseFloat(formData.interest_rate) || 0,
        totalInstallments: t,
        repayment_frequency: formData.repayment_frequency,
        collection_mode: formData.collection_mode,
        disbursement_date: formData.disbursement_date,
        notes: formData.notes,
      };

      const res = await api.loans.update(loan.id, payload);
      if (onSuccess) {
        onSuccess(res?.data || res || { ...loan, ...payload });
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update loan details.');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen || !loan) return null;

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 9999 }}>
      <div
        className="modal-dialog"
        style={{
          maxWidth: '620px',
          width: '95%',
          background: '#FFFFFF',
          borderRadius: 16,
          boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
          border: '1px solid #E2E8F0',
          overflow: 'hidden',
          fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid #E2E8F0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'linear-gradient(135deg, #F8FAFC 0%, #EEF2FF 100%)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: '#EEF2FF',
                border: '1.5px solid #C7D2FE',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--primary)',
              }}
            >
              <Pencil size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Edit Loan Details
              </h3>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                {loan.loan_number || loan.loan_code || `Loan #${loan.id}`} • {customer?.name || customer?.owner_name || customer?.full_name || 'Borrower'}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="btn btn-secondary btn-icon btn-sm"
            style={{ borderRadius: '50%' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
          {error && (
            <div
              style={{
                padding: '0.75rem 1rem',
                background: '#FEE2E2',
                border: '1px solid #FECACA',
                borderRadius: 8,
                color: '#991B1B',
                fontSize: '0.85rem',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <AlertTriangle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* Repayment Collection Option Toggle */}
          <div
            style={{
              background: formData.collection_mode === 'LUMP_SUM_END' ? '#F5F3FF' : '#F8FAFC',
              border: formData.collection_mode === 'LUMP_SUM_END' ? '1.5px solid #818CF8' : '1.5px solid #E2E8F0',
              borderRadius: 12,
              padding: '1rem',
              marginBottom: '1.25rem',
            }}
          >
            <label style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
              Repayment Collection Mode (Option)
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, collection_mode: 'NORMAL' }))}
                style={{
                  padding: '0.75rem',
                  borderRadius: 10,
                  border: formData.collection_mode === 'NORMAL' ? '2px solid var(--primary)' : '1px solid #CBD5E1',
                  background: formData.collection_mode === 'NORMAL' ? '#EEF2FF' : '#FFFFFF',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 800, fontSize: '0.85rem', color: formData.collection_mode === 'NORMAL' ? 'var(--primary)' : 'var(--text-primary)', marginBottom: 2 }}>
                  <Check size={14} color={formData.collection_mode === 'NORMAL' ? 'var(--primary)' : '#94A3B8'} />
                  Normal Installments
                </div>
                <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                  Regular daily/weekly/monthly installment payments throughout the term.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, collection_mode: 'LUMP_SUM_END' }))}
                style={{
                  padding: '0.75rem',
                  borderRadius: 10,
                  border: formData.collection_mode === 'LUMP_SUM_END' ? '2px solid #7C3AED' : '1px solid #CBD5E1',
                  background: formData.collection_mode === 'LUMP_SUM_END' ? '#EDE9FE' : '#FFFFFF',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 800, fontSize: '0.85rem', color: formData.collection_mode === 'LUMP_SUM_END' ? '#6D28D9' : 'var(--text-primary)', marginBottom: 2 }}>
                  <Check size={14} color={formData.collection_mode === 'LUMP_SUM_END' ? '#6D28D9' : '#94A3B8'} />
                  Get Amount at End
                </div>
                <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                  Borrower settles total balance on the final maturity day.
                </p>
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                Principal Amount (₹)
              </label>
              <input
                type="number"
                step="100"
                min="500"
                required
                className="form-control"
                value={formData.principal}
                onChange={(e) => setFormData((prev) => ({ ...prev, principal: e.target.value }))}
                placeholder="e.g. 10000"
                style={{ fontWeight: 700 }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                Interest Rate (%)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                required
                className="form-control"
                value={formData.interest_rate}
                onChange={(e) => setFormData((prev) => ({ ...prev, interest_rate: e.target.value }))}
                placeholder="e.g. 12.5"
                style={{ fontWeight: 700 }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                Tenure ({formData.repayment_frequency === 'DAILY' ? 'Days' : formData.repayment_frequency === 'MONTHLY' ? 'Months' : 'Weeks'})
              </label>
              <input
                type="number"
                step="1"
                min="1"
                required
                className="form-control"
                value={formData.total_installments}
                onChange={(e) => setFormData((prev) => ({ ...prev, total_installments: e.target.value }))}
                placeholder="e.g. 10"
                style={{ fontWeight: 700 }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                Disbursement / Start Date
              </label>
              <input
                type="date"
                required
                className="form-control"
                value={formData.disbursement_date}
                onChange={(e) => setFormData((prev) => ({ ...prev, disbursement_date: e.target.value }))}
              />
            </div>
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
              Loan Purpose / Admin Notes (Optional)
            </label>
            <input
              type="text"
              className="form-control"
              value={formData.notes}
              onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
              placeholder="e.g. Daily grocery restocking credit line"
            />
          </div>

          {/* Live Loan Calculation Summary Card */}
          <div
            style={{
              background: '#F8FAFC',
              borderRadius: 10,
              padding: '0.85rem 1rem',
              border: '1px solid #E2E8F0',
              marginBottom: '1.5rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                Loan Financial Summary
              </span>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--primary)' }}>
                Matures: {calculations.maturityDate || 'N/A'}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', fontSize: '0.8rem' }}>
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', display: 'block' }}>Interest/Income</span>
                <strong style={{ color: 'var(--text-primary)', fontWeight: 800 }}>
                  {formatCurrency(calculations.contractedIncome)}
                </strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', display: 'block' }}>Total Repayable</span>
                <strong style={{ color: 'var(--text-primary)', fontWeight: 800 }}>
                  {formatCurrency(calculations.totalRepayable)}
                </strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', display: 'block' }}>
                  {formData.collection_mode === 'LUMP_SUM_END' ? 'Due at End' : 'Installment Due'}
                </span>
                <strong style={{ color: formData.collection_mode === 'LUMP_SUM_END' ? '#6D28D9' : '#059669', fontWeight: 900 }}>
                  {formData.collection_mode === 'LUMP_SUM_END' ? formatCurrency(calculations.totalRepayable) : formatCurrency(calculations.emi)}
                </strong>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
              style={{ minWidth: 140, fontWeight: 800 }}
            >
              {saving ? 'Saving...' : 'Save Loan Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/**
 * --------------------------------------------------------------------------
 * 2. DELETE LOAN MODAL
 * --------------------------------------------------------------------------
 */
export const DeleteLoanModal = ({ isOpen, onClose, loan, customer, onSuccess }) => {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !loan) return null;

  const loanNumber = loan.loan_number || loan.loan_code || `Loan #${loan.id}`;
  const borrowerName = customer?.name || customer?.owner_name || customer?.full_name || 'Borrower';
  const principal = loan.principal_amount || loan.principal || 0;
  const remaining = loan.remaining_balance != null ? loan.remaining_balance : (loan.total_repayment_amount || principal);

  const handleDelete = async () => {
    setError('');
    setDeleting(true);
    try {
      await api.loans.delete(loan.id);
      if (onSuccess) {
        onSuccess(loan.id);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to delete loan.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 9999 }}>
      <div
        className="modal-dialog"
        style={{
          maxWidth: '500px',
          width: '95%',
          background: '#FFFFFF',
          borderRadius: 16,
          boxShadow: '0 20px 60px rgba(0,0,0,0.22)',
          border: '1.5px solid #FEE2E2',
          overflow: 'hidden',
          fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid #FEE2E2',
            background: '#FEF2F2',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: '50%',
              background: '#FEE2E2',
              border: '2px solid #FECACA',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#DC2626',
            }}
          >
            <Trash2 size={20} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: '#991B1B' }}>
              Delete Loan Record
            </h3>
            <span style={{ fontSize: '0.78rem', color: '#B91C1C', fontWeight: 600 }}>
              Permanent deletion confirmation
            </span>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: '1.5rem' }}>
          {error && (
            <div
              style={{
                padding: '0.75rem 1rem',
                background: '#FEE2E2',
                border: '1px solid #FECACA',
                borderRadius: 8,
                color: '#991B1B',
                fontSize: '0.85rem',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <AlertTriangle size={16} />
              <span>{error}</span>
            </div>
          )}

          <p style={{ color: 'var(--text-primary)', fontSize: '0.92rem', lineHeight: 1.5, margin: '0 0 1rem 0' }}>
            Are you sure you want to delete <strong style={{ color: '#991B1B' }}>{loanNumber}</strong> for{' '}
            <strong>{borrowerName}</strong>?
          </p>

          <div
            style={{
              background: '#F8FAFC',
              borderRadius: 10,
              padding: '0.85rem 1rem',
              border: '1px solid #E2E8F0',
              marginBottom: '1.25rem',
              fontSize: '0.82rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ color: 'var(--text-muted)' }}>Original Principal:</span>
              <strong style={{ color: 'var(--text-primary)' }}>{formatCurrency(principal)}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ color: 'var(--text-muted)' }}>Repayment Balance:</span>
              <strong style={{ color: '#D97706' }}>{formatCurrency(remaining)}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Repayment Mode:</span>
              <span style={{ fontWeight: 700, color: loan.collection_mode === 'LUMP_SUM_END' ? '#6D28D9' : 'var(--primary)' }}>
                {loan.collection_mode === 'LUMP_SUM_END' ? '🎯 Get at End' : '✅ Normal Installments'}
              </span>
            </div>
          </div>

          <div
            style={{
              background: '#FFFBEB',
              border: '1px solid #FDE68A',
              borderRadius: 8,
              padding: '0.75rem 1rem',
              color: '#92400E',
              fontSize: '0.78rem',
              display: 'flex',
              gap: 8,
              alignItems: 'flex-start',
              marginBottom: '1.5rem',
            }}
          >
            <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
            <span>
              <strong>Warning:</strong> This will remove all generated installment schedules, ledger records, and history for this loan.
            </span>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={deleting}>
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={handleDelete}
              disabled={deleting}
              style={{
                background: '#DC2626',
                borderColor: '#DC2626',
                color: '#FFFFFF',
                fontWeight: 800,
                minWidth: 140,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
              }}
            >
              <Trash2 size={15} />
              {deleting ? 'Deleting...' : 'Yes, Delete Loan'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * --------------------------------------------------------------------------
 * 3. CREATE NEW LOAN MODAL (WITH REPAYMENT MODE OPTION)
 * --------------------------------------------------------------------------
 */
export const CreateLoanModal = ({
  isOpen,
  onClose,
  customer,
  defaultFrequency = 'WEEKLY',
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    principal: '10000',
    interest_rate: '12.5',
    tenure: '10',
    frequency: defaultFrequency,
    collection_mode: customer?.collection_mode || 'NORMAL',
    start_date: new Date().toISOString().slice(0, 10),
    notes: '',
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      const initialFreq = defaultFrequency || (customer?.type === 'DAILY' ? 'DAILY' : customer?.type === 'MONTHLY' ? 'MONTHLY' : 'WEEKLY');
      const defaultRate = initialFreq === 'DAILY' ? '12.5' : initialFreq === 'MONTHLY' ? '18.0' : '10.0';
      const defaultTenure = initialFreq === 'DAILY' ? '25' : initialFreq === 'MONTHLY' ? '12' : '10';
      const defaultPrincipal = initialFreq === 'DAILY' ? '10000' : initialFreq === 'MONTHLY' ? '25000' : '10000';

      setFormData({
        principal: defaultPrincipal,
        interest_rate: defaultRate,
        tenure: defaultTenure,
        frequency: initialFreq,
        collection_mode: customer?.collection_mode || 'NORMAL',
        start_date: new Date().toISOString().slice(0, 10),
        notes: '',
      });
      setError('');
    }
  }, [isOpen, customer, defaultFrequency]);

  // Calculations
  const calculations = useMemo(() => {
    const p = parseFloat(formData.principal) || 0;
    const r = parseFloat(formData.interest_rate) || 0;
    const t = parseInt(formData.tenure, 10) || 1;
    const contractedIncome = Math.round(((p * r) / 100) * 100) / 100;
    const totalRepayable = p + contractedIncome;
    const emi = t > 0 ? Math.round(totalRepayable / t) : 0;

    let maturityDate = '';
    if (formData.start_date) {
      try {
        const d = new Date(formData.start_date);
        const daysInterval = formData.frequency === 'DAILY' ? 1 : (formData.frequency === 'MONTHLY' ? 30 : 7);
        d.setDate(d.getDate() + t * daysInterval);
        maturityDate = d.toISOString().slice(0, 10);
      } catch (e) {
        maturityDate = '';
      }
    }

    return {
      principal: p,
      interestRate: r,
      tenure: t,
      contractedIncome,
      totalRepayable,
      emi,
      maturityDate,
    };
  }, [formData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!customer) return;
    setError('');

    const p = parseFloat(formData.principal);
    if (isNaN(p) || p <= 0) {
      setError('Please enter a valid principal amount.');
      return;
    }

    const t = parseInt(formData.tenure, 10);
    if (isNaN(t) || t <= 0) {
      setError('Please enter a valid tenure/installment count.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        customerId: customer.id || customer.customerId,
        principal: p,
        principalAmount: p,
        interest_rate: parseFloat(formData.interest_rate) || 0,
        tenure: t,
        total_installments: t,
        frequency: formData.frequency,
        repayment_frequency: formData.frequency,
        collection_mode: formData.collection_mode,
        collectionMode: formData.collection_mode,
        disbursement_date: formData.start_date,
        autoDisburse: true,
        status: 'ACTIVE',
        notes: formData.notes,
      };

      const res = await api.createLoan(payload);
      if (onSuccess) {
        onSuccess(res?.data || res);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create new loan.');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen || !customer) return null;

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 9999 }}>
      <div
        className="modal-dialog"
        style={{
          maxWidth: '620px',
          width: '95%',
          background: '#FFFFFF',
          borderRadius: 16,
          boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
          border: '1px solid #E2E8F0',
          overflow: 'hidden',
          fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid #E2E8F0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'linear-gradient(135deg, #F8FAFC 0%, #EEF2FF 100%)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: '#EEF2FF',
                border: '1.5px solid #C7D2FE',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--primary)',
              }}
            >
              <DollarSign size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Issue New Loan
              </h3>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                {customer?.name || customer?.owner_name || customer?.full_name || 'Borrower'} • ({customer?.customer_code || `ID #${customer?.id}`})
              </span>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-secondary btn-icon btn-sm" style={{ borderRadius: '50%' }}>
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
          {error && (
            <div
              style={{
                padding: '0.75rem 1rem',
                background: '#FEE2E2',
                border: '1px solid #FECACA',
                borderRadius: 8,
                color: '#991B1B',
                fontSize: '0.85rem',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <AlertTriangle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* Repayment Collection Option Toggle */}
          <div
            style={{
              background: formData.collection_mode === 'LUMP_SUM_END' ? '#F5F3FF' : '#F8FAFC',
              border: formData.collection_mode === 'LUMP_SUM_END' ? '1.5px solid #818CF8' : '1.5px solid #E2E8F0',
              borderRadius: 12,
              padding: '1rem',
              marginBottom: '1.25rem',
            }}
          >
            <label style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
              Repayment Collection Mode (Option)
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, collection_mode: 'NORMAL' }))}
                style={{
                  padding: '0.75rem',
                  borderRadius: 10,
                  border: formData.collection_mode === 'NORMAL' ? '2px solid var(--primary)' : '1px solid #CBD5E1',
                  background: formData.collection_mode === 'NORMAL' ? '#EEF2FF' : '#FFFFFF',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 800, fontSize: '0.85rem', color: formData.collection_mode === 'NORMAL' ? 'var(--primary)' : 'var(--text-primary)', marginBottom: 2 }}>
                  <Check size={14} color={formData.collection_mode === 'NORMAL' ? 'var(--primary)' : '#94A3B8'} />
                  Normal Installments
                </div>
                <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                  Borrower pays daily/weekly/monthly regular installments.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, collection_mode: 'LUMP_SUM_END' }))}
                style={{
                  padding: '0.75rem',
                  borderRadius: 10,
                  border: formData.collection_mode === 'LUMP_SUM_END' ? '2px solid #7C3AED' : '1px solid #CBD5E1',
                  background: formData.collection_mode === 'LUMP_SUM_END' ? '#EDE9FE' : '#FFFFFF',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 800, fontSize: '0.85rem', color: formData.collection_mode === 'LUMP_SUM_END' ? '#6D28D9' : 'var(--text-primary)', marginBottom: 2 }}>
                  <Check size={14} color={formData.collection_mode === 'LUMP_SUM_END' ? '#6D28D9' : '#94A3B8'} />
                  Get Amount at End
                </div>
                <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                  Borrower settles total balance on the final maturity day.
                </p>
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                Principal Amount (₹)
              </label>
              <input
                type="number"
                step="100"
                min="500"
                required
                className="form-control"
                value={formData.principal}
                onChange={(e) => setFormData((prev) => ({ ...prev, principal: e.target.value }))}
                placeholder="e.g. 10000"
                style={{ fontWeight: 700 }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                Interest Rate (%)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                required
                className="form-control"
                value={formData.interest_rate}
                onChange={(e) => setFormData((prev) => ({ ...prev, interest_rate: e.target.value }))}
                placeholder="e.g. 12.5"
                style={{ fontWeight: 700 }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                Tenure ({formData.frequency === 'DAILY' ? 'Days' : formData.frequency === 'MONTHLY' ? 'Months' : 'Weeks'})
              </label>
              <input
                type="number"
                step="1"
                min="1"
                required
                className="form-control"
                value={formData.tenure}
                onChange={(e) => setFormData((prev) => ({ ...prev, tenure: e.target.value }))}
                placeholder="e.g. 10"
                style={{ fontWeight: 700 }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                Start / Issue Date
              </label>
              <input
                type="date"
                required
                className="form-control"
                value={formData.start_date}
                onChange={(e) => setFormData((prev) => ({ ...prev, start_date: e.target.value }))}
              />
            </div>
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
              Notes / Purpose (Optional)
            </label>
            <input
              type="text"
              className="form-control"
              value={formData.notes}
              onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
              placeholder="e.g. New credit line"
            />
          </div>

          {/* Live Loan Calculation Summary Card */}
          <div
            style={{
              background: '#F8FAFC',
              borderRadius: 10,
              padding: '0.85rem 1rem',
              border: '1px solid #E2E8F0',
              marginBottom: '1.5rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                Contracted Repayment Projection
              </span>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--primary)' }}>
                Matures: {calculations.maturityDate || 'N/A'}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', fontSize: '0.8rem' }}>
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', display: 'block' }}>Interest/Income</span>
                <strong style={{ color: 'var(--text-primary)', fontWeight: 800 }}>
                  {formatCurrency(calculations.contractedIncome)}
                </strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', display: 'block' }}>Total Repayable</span>
                <strong style={{ color: 'var(--text-primary)', fontWeight: 800 }}>
                  {formatCurrency(calculations.totalRepayable)}
                </strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', display: 'block' }}>
                  {formData.collection_mode === 'LUMP_SUM_END' ? 'Due at End' : 'Installment Due'}
                </span>
                <strong style={{ color: formData.collection_mode === 'LUMP_SUM_END' ? '#6D28D9' : '#059669', fontWeight: 900 }}>
                  {formData.collection_mode === 'LUMP_SUM_END' ? formatCurrency(calculations.totalRepayable) : formatCurrency(calculations.emi)}
                </strong>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
              style={{ minWidth: 140, fontWeight: 800 }}
            >
              {saving ? 'Creating...' : 'Disburse & Activate Loan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
