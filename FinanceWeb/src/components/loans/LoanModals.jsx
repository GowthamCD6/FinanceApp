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
  Target,
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
    <div
      className="modal-overlay"
      onClick={onClose}
      style={{
        zIndex: 9999,
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        padding: '1rem',
      }}
    >
      <div
        className="modal-dialog"
        style={{
          maxWidth: '640px',
          width: '100%',
          background: '#FFFFFF',
          borderRadius: 20,
          boxShadow: '0 25px 60px -15px rgba(0,0,0,0.3)',
          border: '1px solid #E2E8F0',
          overflow: 'hidden',
          fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
          animation: 'fadeIn 0.2s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '1.25rem 1.75rem',
            borderBottom: '1px solid #E2E8F0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'linear-gradient(135deg, #F8FAFC 0%, #EEF2FF 100%)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: '#FFFFFF',
                border: '1.5px solid #C7D2FE',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--primary)',
                boxShadow: '0 2px 8px rgba(79, 70, 229, 0.12)',
              }}
            >
              <Pencil size={20} color="var(--primary)" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                  Edit Loan Details
                </h3>
                <span
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: 4,
                    background: '#EEF2FF',
                    color: 'var(--primary)',
                    border: '1px solid #C7D2FE',
                  }}
                >
                  {loan.loan_number || loan.loan_code || `Loan #${loan.id}`}
                </span>
              </div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginTop: 2 }}>
                Borrower: <strong style={{ color: 'var(--text-secondary)' }}>{customer?.name || customer?.owner_name || customer?.full_name || 'Borrower'}</strong>
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="btn btn-secondary btn-icon btn-sm"
            style={{ borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem 1.75rem' }}>
          {error && (
            <div
              style={{
                padding: '0.75rem 1rem',
                background: '#FFF1F2',
                border: '1px solid #FECDD3',
                borderRadius: 10,
                color: '#BE123C',
                fontSize: '0.85rem',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <AlertTriangle size={16} color="#BE123C" />
              <span style={{ fontWeight: 600 }}>{error}</span>
            </div>
          )}

          {/* Repayment Collection Option Toggle */}
          <div
            style={{
              background: formData.collection_mode === 'LUMP_SUM_END' ? 'linear-gradient(135deg, #F5F3FF 0%, #FFFFFF 100%)' : '#F8FAFC',
              border: formData.collection_mode === 'LUMP_SUM_END' ? '1.5px solid #818CF8' : '1.5px solid #E2E8F0',
              borderRadius: 12,
              padding: '1rem',
              marginBottom: '1.25rem',
            }}
          >
            <label style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)', display: 'block', marginBottom: 8 }}>
              Repayment Collection Mode
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, collection_mode: 'NORMAL' }))}
                style={{
                  padding: '0.85rem',
                  borderRadius: 10,
                  border: formData.collection_mode === 'NORMAL' ? '2px solid var(--primary)' : '1px solid #CBD5E1',
                  background: formData.collection_mode === 'NORMAL' ? '#EEF2FF' : '#FFFFFF',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                  boxShadow: formData.collection_mode === 'NORMAL' ? '0 2px 8px rgba(79, 70, 229, 0.12)' : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 800, fontSize: '0.85rem', color: formData.collection_mode === 'NORMAL' ? 'var(--primary)' : 'var(--text-primary)', marginBottom: 3 }}>
                  <Check size={15} color={formData.collection_mode === 'NORMAL' ? 'var(--primary)' : '#94A3B8'} strokeWidth={formData.collection_mode === 'NORMAL' ? 3 : 2} />
                  Normal Installments
                </div>
                <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: 1.35 }}>
                  Standard scheduled installment collections throughout tenure.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, collection_mode: 'LUMP_SUM_END' }))}
                style={{
                  padding: '0.85rem',
                  borderRadius: 10,
                  border: formData.collection_mode === 'LUMP_SUM_END' ? '2px solid #7C3AED' : '1px solid #CBD5E1',
                  background: formData.collection_mode === 'LUMP_SUM_END' ? '#EDE9FE' : '#FFFFFF',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                  boxShadow: formData.collection_mode === 'LUMP_SUM_END' ? '0 2px 8px rgba(124, 58, 237, 0.2)' : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 800, fontSize: '0.85rem', color: formData.collection_mode === 'LUMP_SUM_END' ? '#6D28D9' : 'var(--text-primary)', marginBottom: 3 }}>
                  <Check size={15} color={formData.collection_mode === 'LUMP_SUM_END' ? '#6D28D9' : '#94A3B8'} strokeWidth={formData.collection_mode === 'LUMP_SUM_END' ? 3 : 2} />
                  Get Amount at End
                </div>
                <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: 1.35 }}>
                  Total loan balance collected on the final maturity day.
                </p>
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.03em', color: 'var(--text-secondary)', marginBottom: 5 }}>
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
                style={{ fontWeight: 800, fontSize: '0.95rem', borderRadius: 8, padding: '0.55rem 0.75rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.03em', color: 'var(--text-secondary)', marginBottom: 5 }}>
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
                style={{ fontWeight: 800, fontSize: '0.95rem', borderRadius: 8, padding: '0.55rem 0.75rem' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.03em', color: 'var(--text-secondary)', marginBottom: 5 }}>
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
                style={{ fontWeight: 800, fontSize: '0.95rem', borderRadius: 8, padding: '0.55rem 0.75rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.03em', color: 'var(--text-secondary)', marginBottom: 5 }}>
                Disbursement / Start Date
              </label>
              <input
                type="date"
                required
                className="form-control"
                value={formData.disbursement_date}
                onChange={(e) => setFormData((prev) => ({ ...prev, disbursement_date: e.target.value }))}
                style={{ fontWeight: 800, fontSize: '0.95rem', borderRadius: 8, padding: '0.55rem 0.75rem' }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.03em', color: 'var(--text-secondary)', marginBottom: 5 }}>
              Loan Purpose / Admin Notes (Optional)
            </label>
            <input
              type="text"
              className="form-control"
              value={formData.notes}
              onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
              placeholder="e.g. Daily grocery restocking credit line"
              style={{ borderRadius: 8, padding: '0.55rem 0.75rem' }}
            />
          </div>

          {/* Live Loan Calculation Summary Card */}
          <div
            style={{
              background: '#F8FAFC',
              borderRadius: 12,
              padding: '1rem 1.15rem',
              border: '1.5px solid #E2E8F0',
              marginBottom: '1.5rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)' }}>
                Loan Financial Calculation Summary
              </span>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--primary)', background: '#EEF2FF', padding: '2px 8px', borderRadius: 4, border: '1px solid #C7D2FE' }}>
                Matures: {calculations.maturityDate || 'N/A'}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', fontSize: '0.8rem' }}>
              <div style={{ background: '#FFFFFF', padding: '0.6rem 0.75rem', borderRadius: 8, border: '1px solid #E2E8F0' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.68rem', display: 'block', fontWeight: 700, textTransform: 'uppercase' }}>Interest / Profit</span>
                <strong style={{ color: 'var(--text-primary)', fontWeight: 800, fontSize: '0.95rem' }}>
                  {formatCurrency(calculations.contractedIncome)}
                </strong>
              </div>
              <div style={{ background: '#FFFFFF', padding: '0.6rem 0.75rem', borderRadius: 8, border: '1px solid #E2E8F0' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.68rem', display: 'block', fontWeight: 700, textTransform: 'uppercase' }}>Total Repayable</span>
                <strong style={{ color: 'var(--text-primary)', fontWeight: 800, fontSize: '0.95rem' }}>
                  {formatCurrency(calculations.totalRepayable)}
                </strong>
              </div>
              <div style={{ background: '#FFFFFF', padding: '0.6rem 0.75rem', borderRadius: 8, border: '1px solid #E2E8F0' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.68rem', display: 'block', fontWeight: 700, textTransform: 'uppercase' }}>
                  {formData.collection_mode === 'LUMP_SUM_END' ? 'Due at End' : 'Installment Due'}
                </span>
                <strong style={{ color: formData.collection_mode === 'LUMP_SUM_END' ? '#6D28D9' : '#059669', fontWeight: 900, fontSize: '0.95rem' }}>
                  {formData.collection_mode === 'LUMP_SUM_END' ? formatCurrency(calculations.totalRepayable) : formatCurrency(calculations.emi)}
                </strong>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={saving}
              style={{ fontWeight: 700, padding: '0.6rem 1.25rem', borderRadius: 8 }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
              style={{
                minWidth: 160,
                fontWeight: 800,
                padding: '0.6rem 1.45rem',
                borderRadius: 8,
                background: 'linear-gradient(135deg, #4F46E5 0%, #6366F1 100%)',
                boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)',
              }}
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
    <div
      className="modal-overlay"
      onClick={onClose}
      style={{
        zIndex: 9999,
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        padding: '1rem',
      }}
    >
      <div
        className="modal-dialog"
        style={{
          maxWidth: '520px',
          width: '100%',
          background: '#FFFFFF',
          borderRadius: 20,
          boxShadow: '0 25px 60px -15px rgba(0,0,0,0.3)',
          border: '1.5px solid #FECDD3',
          overflow: 'hidden',
          fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.25rem 1.75rem',
            borderBottom: '1px solid #FECDD3',
            background: 'linear-gradient(135deg, #FFF1F2 0%, #FFE4E6 100%)',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: '#FFFFFF',
              border: '2px solid #FECDD3',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#BE123C',
              boxShadow: '0 2px 8px rgba(190, 18, 60, 0.12)',
            }}
          >
            <Trash2 size={20} color="#BE123C" />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900, color: '#9F1239', letterSpacing: '-0.02em' }}>
              Delete Loan Record
            </h3>
            <span style={{ fontSize: '0.78rem', color: '#BE123C', fontWeight: 600 }}>
              Permanent deletion confirmation
            </span>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: '1.5rem 1.75rem' }}>
          {error && (
            <div
              style={{
                padding: '0.75rem 1rem',
                background: '#FFF1F2',
                border: '1px solid #FECDD3',
                borderRadius: 10,
                color: '#BE123C',
                fontSize: '0.85rem',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <AlertTriangle size={16} color="#BE123C" />
              <span style={{ fontWeight: 600 }}>{error}</span>
            </div>
          )}

          <p style={{ color: 'var(--text-primary)', fontSize: '0.92rem', lineHeight: 1.5, margin: '0 0 1rem 0' }}>
            Are you sure you want to delete <strong style={{ color: '#BE123C' }}>{loanNumber}</strong> for{' '}
            <strong>{borrowerName}</strong>?
          </p>

          <div
            style={{
              background: '#F8FAFC',
              borderRadius: 12,
              padding: '0.85rem 1.15rem',
              border: '1px solid #E2E8F0',
              marginBottom: '1.25rem',
              fontSize: '0.82rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
              <span style={{ color: 'var(--text-muted)' }}>Original Principal:</span>
              <strong style={{ color: 'var(--text-primary)', fontWeight: 800 }}>{formatCurrency(principal)}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
              <span style={{ color: 'var(--text-muted)' }}>Repayment Balance:</span>
              <strong style={{ color: '#D97706', fontWeight: 900 }}>{formatCurrency(remaining)}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-muted)' }}>Repayment Mode:</span>
              <span style={{ fontWeight: 700, color: loan.collection_mode === 'LUMP_SUM_END' ? '#6D28D9' : 'var(--primary)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                {loan.collection_mode === 'LUMP_SUM_END' ? (
                  <>
                    <Target size={13} color="#6D28D9" />
                    <span>Get at End</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={13} color="var(--primary)" />
                    <span>Normal Installments</span>
                  </>
                )}
              </span>
            </div>
          </div>

          <div
            style={{
              background: '#FFFBEB',
              border: '1px solid #FDE68A',
              borderRadius: 10,
              padding: '0.75rem 1rem',
              color: '#92400E',
              fontSize: '0.78rem',
              display: 'flex',
              gap: 8,
              alignItems: 'flex-start',
              marginBottom: '1.5rem',
            }}
          >
            <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 2 }} color="#D97706" />
            <span>
              <strong>Warning:</strong> This will remove all generated installment schedules, ledger records, and collection history for this loan.
            </span>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={deleting}
              style={{ fontWeight: 700, padding: '0.6rem 1.25rem', borderRadius: 8 }}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={handleDelete}
              disabled={deleting}
              style={{
                background: 'linear-gradient(135deg, #E11D48 0%, #BE123C 100%)',
                borderColor: '#BE123C',
                color: '#FFFFFF',
                fontWeight: 800,
                minWidth: 150,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                padding: '0.6rem 1.25rem',
                borderRadius: 8,
                boxShadow: '0 4px 12px rgba(190, 18, 60, 0.25)',
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
    <div
      className="modal-overlay"
      onClick={onClose}
      style={{
        zIndex: 9999,
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        padding: '1rem',
      }}
    >
      <div
        className="modal-dialog"
        style={{
          maxWidth: '640px',
          width: '100%',
          background: '#FFFFFF',
          borderRadius: 20,
          boxShadow: '0 25px 60px -15px rgba(0,0,0,0.3)',
          border: '1px solid #E2E8F0',
          overflow: 'hidden',
          fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
          animation: 'fadeIn 0.2s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.25rem 1.75rem',
            borderBottom: '1px solid #E2E8F0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'linear-gradient(135deg, #F8FAFC 0%, #EEF2FF 100%)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: '#FFFFFF',
                border: '1.5px solid #C7D2FE',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--primary)',
                boxShadow: '0 2px 8px rgba(79, 70, 229, 0.12)',
              }}
            >
              <DollarSign size={20} color="var(--primary)" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                  Issue New Loan
                </h3>
                <span
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: 4,
                    background: '#EEF2FF',
                    color: 'var(--primary)',
                    border: '1px solid #C7D2FE',
                  }}
                >
                  {customer?.customer_code || `ID #${customer?.id}`}
                </span>
              </div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginTop: 2 }}>
                Borrower: <strong style={{ color: 'var(--text-secondary)' }}>{customer?.name || customer?.owner_name || customer?.full_name || 'Borrower'}</strong>
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="btn btn-secondary btn-icon btn-sm"
            style={{ borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem 1.75rem' }}>
          {error && (
            <div
              style={{
                padding: '0.75rem 1rem',
                background: '#FFF1F2',
                border: '1px solid #FECDD3',
                borderRadius: 10,
                color: '#BE123C',
                fontSize: '0.85rem',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <AlertTriangle size={16} color="#BE123C" />
              <span style={{ fontWeight: 600 }}>{error}</span>
            </div>
          )}

          {/* Repayment Collection Option Toggle */}
          <div
            style={{
              background: formData.collection_mode === 'LUMP_SUM_END' ? 'linear-gradient(135deg, #FAF5FF 0%, #F3E8FF 100%)' : '#F8FAFC',
              border: formData.collection_mode === 'LUMP_SUM_END' ? '1.5px solid #C084FC' : '1.5px solid #E2E8F0',
              borderRadius: 14,
              padding: '1rem 1.15rem',
              marginBottom: '1.25rem',
              transition: 'all 0.2s ease',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)' }}>
                Repayment Collection Method
              </label>
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  padding: '2px 7px',
                  borderRadius: 4,
                  background: formData.collection_mode === 'LUMP_SUM_END' ? '#7C3AED' : 'var(--primary)',
                  color: '#FFFFFF',
                }}
              >
                {formData.collection_mode === 'LUMP_SUM_END' ? 'End Settlement' : 'Regular Installments'}
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, collection_mode: 'NORMAL' }))}
                style={{
                  padding: '0.85rem',
                  borderRadius: 10,
                  border: formData.collection_mode === 'NORMAL' ? '2px solid var(--primary)' : '1px solid #E2E8F0',
                  background: formData.collection_mode === 'NORMAL' ? '#EEF2FF' : '#FFFFFF',
                  cursor: 'pointer',
                  textAlign: 'left',
                  boxShadow: formData.collection_mode === 'NORMAL' ? '0 2px 8px rgba(79, 70, 229, 0.15)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 800, fontSize: '0.86rem', color: formData.collection_mode === 'NORMAL' ? 'var(--primary)' : 'var(--text-primary)', marginBottom: 3 }}>
                  <div
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: '50%',
                      background: formData.collection_mode === 'NORMAL' ? 'var(--primary)' : '#E2E8F0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Check size={11} color={formData.collection_mode === 'NORMAL' ? '#FFFFFF' : '#94A3B8'} />
                  </div>
                  Normal Installments
                </div>
                <p style={{ margin: 0, fontSize: '0.73rem', color: 'var(--text-secondary)', lineHeight: 1.35 }}>
                  Collect standard dues on regular business schedule.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, collection_mode: 'LUMP_SUM_END' }))}
                style={{
                  padding: '0.85rem',
                  borderRadius: 10,
                  border: formData.collection_mode === 'LUMP_SUM_END' ? '2px solid #7C3AED' : '1px solid #E2E8F0',
                  background: formData.collection_mode === 'LUMP_SUM_END' ? '#EDE9FE' : '#FFFFFF',
                  cursor: 'pointer',
                  textAlign: 'left',
                  boxShadow: formData.collection_mode === 'LUMP_SUM_END' ? '0 2px 8px rgba(124, 58, 237, 0.15)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 800, fontSize: '0.86rem', color: formData.collection_mode === 'LUMP_SUM_END' ? '#6D28D9' : 'var(--text-primary)', marginBottom: 3 }}>
                  <div
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: '50%',
                      background: formData.collection_mode === 'LUMP_SUM_END' ? '#7C3AED' : '#E2E8F0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Check size={11} color={formData.collection_mode === 'LUMP_SUM_END' ? '#FFFFFF' : '#94A3B8'} />
                  </div>
                  Get Amount at End
                </div>
                <p style={{ margin: 0, fontSize: '0.73rem', color: 'var(--text-secondary)', lineHeight: 1.35 }}>
                  Zero daily collection; full principal + interest paid at maturity.
                </p>
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 5 }}>
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
                style={{ fontWeight: 700, borderRadius: 8, padding: '0.55rem 0.75rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 5 }}>
                Contracted Rate (%)
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
                style={{ fontWeight: 700, borderRadius: 8, padding: '0.55rem 0.75rem' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 5 }}>
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
                style={{ fontWeight: 700, borderRadius: 8, padding: '0.55rem 0.75rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 5 }}>
                Disbursement Date
              </label>
              <input
                type="date"
                required
                className="form-control"
                value={formData.start_date}
                onChange={(e) => setFormData((prev) => ({ ...prev, start_date: e.target.value }))}
                style={{ fontWeight: 600, borderRadius: 8, padding: '0.55rem 0.75rem' }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 5 }}>
              Notes / Purpose (Optional)
            </label>
            <input
              type="text"
              className="form-control"
              value={formData.notes}
              onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
              placeholder="e.g. Festival inventory expansion"
              style={{ borderRadius: 8, padding: '0.55rem 0.75rem' }}
            />
          </div>

          {/* Live Loan Calculation Summary Card */}
          <div
            style={{
              background: 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)',
              borderRadius: 12,
              padding: '1rem 1.15rem',
              border: '1px solid #E2E8F0',
              marginBottom: '1.5rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)' }}>
                Contracted Repayment Projection
              </span>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--primary)', background: '#EEF2FF', padding: '2px 8px', borderRadius: 4, border: '1px solid #C7D2FE' }}>
                Matures: {calculations.maturityDate || 'N/A'}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', fontSize: '0.8rem' }}>
              <div style={{ background: '#FFFFFF', padding: '0.6rem 0.75rem', borderRadius: 8, border: '1px solid #E2E8F0' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.68rem', fontWeight: 700, display: 'block', textTransform: 'uppercase' }}>Interest / Income</span>
                <strong style={{ color: 'var(--text-primary)', fontSize: '0.95rem', fontWeight: 800 }}>
                  {formatCurrency(calculations.contractedIncome)}
                </strong>
              </div>
              <div style={{ background: '#FFFFFF', padding: '0.6rem 0.75rem', borderRadius: 8, border: '1px solid #E2E8F0' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.68rem', fontWeight: 700, display: 'block', textTransform: 'uppercase' }}>Total Repayable</span>
                <strong style={{ color: 'var(--text-primary)', fontSize: '0.95rem', fontWeight: 800 }}>
                  {formatCurrency(calculations.totalRepayable)}
                </strong>
              </div>
              <div style={{ background: '#FFFFFF', padding: '0.6rem 0.75rem', borderRadius: 8, border: '1px solid #E2E8F0' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.68rem', fontWeight: 700, display: 'block', textTransform: 'uppercase' }}>
                  {formData.collection_mode === 'LUMP_SUM_END' ? 'Due at Maturity' : 'Installment Due'}
                </span>
                <strong style={{ color: formData.collection_mode === 'LUMP_SUM_END' ? '#6D28D9' : '#059669', fontSize: '0.95rem', fontWeight: 900 }}>
                  {formData.collection_mode === 'LUMP_SUM_END' ? formatCurrency(calculations.totalRepayable) : formatCurrency(calculations.emi)}
                </strong>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={saving}
              style={{ fontWeight: 700, padding: '0.6rem 1.25rem', borderRadius: 8 }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
              style={{ minWidth: 160, fontWeight: 800, padding: '0.6rem 1.25rem', borderRadius: 8, boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)' }}
            >
              {saving ? 'Creating...' : 'Disburse & Activate Loan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
