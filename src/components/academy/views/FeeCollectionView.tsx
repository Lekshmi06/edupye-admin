import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  tuitionAdminService,
  type AcademyFeePaymentItem,
  type AdminStudentItem,
  type AdminTuitionProgram,
} from '../../../services/tuitionAdmin.service';
import { useToast } from '../../../hooks/useToast';
import { Loader } from '../../common/Loader';

interface FeeCollectionViewProps {
  students: AdminStudentItem[];
  programs: AdminTuitionProgram[];
  academicSession: string;
  onOpenQuickFee: () => void;
}

export const FeeCollectionView: React.FC<FeeCollectionViewProps> = ({
  students,
  programs,
  academicSession,
  onOpenQuickFee,
}) => {
  const { showToast } = useToast();
  const [payments, setPayments] = useState<AcademyFeePaymentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Paid' | 'Partial' | 'Pending'>('All');
  const [modeFilter, setModeFilter] = useState<'All' | 'Cash' | 'UPI' | 'Bank Transfer' | 'Card'>('All');

  // Receipt Modal
  const [selectedReceipt, setSelectedReceipt] = useState<AcademyFeePaymentItem | null>(null);

  const loadPayments = useCallback(async () => {
    try {
      setLoading(true);
      const data = await tuitionAdminService.getFeePayments({ session: academicSession });
      setPayments(data);
    } catch (err: any) {
      showToast(err.message || 'Failed to fetch payment register', 'error');
    } finally {
      setLoading(false);
    }
  }, [academicSession, showToast]);

  useEffect(() => {
    loadPayments();
  }, [loadPayments]);

  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      const matchSearch =
        p.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.studentCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.receiptNo.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus = statusFilter === 'All' || p.status === statusFilter;
      const matchMode = modeFilter === 'All' || p.paymentMode === modeFilter;

      return matchSearch && matchStatus && matchMode;
    });
  }, [payments, searchTerm, statusFilter, modeFilter]);

  // Aggregate Metrics
  const totalCollected = useMemo(() => {
    return payments.reduce((sum, p) => sum + (p.amountPaid || 0), 0);
  }, [payments]);

  const totalOutstanding = useMemo(() => {
    return payments.reduce((sum, p) => sum + (p.balance || 0), 0);
  }, [payments]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 1. Header Bar */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '14px',
          padding: '20px 24px',
          border: '1px solid #E2E8F0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                backgroundColor: '#EFF6FF',
                color: '#2563EB',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 800,
                letterSpacing: '0.04em',
              }}
            >
              FEE REGISTER
            </span>
            <span style={{ fontSize: '12.5px', color: '#64748B', fontWeight: 600 }}>
              Session {academicSession}
            </span>
          </div>
          <h2
            style={{
              margin: '6px 0 2px',
              fontSize: '22px',
              fontWeight: 800,
              color: '#0F1E36',
              letterSpacing: '-0.02em',
            }}
          >
            Fee Collection Register
          </h2>
          <p style={{ margin: 0, fontSize: '13px', color: '#64748B' }}>
            Full ledger of tuition receipts, payments collected, mode of payment, and printable receipts.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenQuickFee}
          style={{
            padding: '10px 18px',
            backgroundColor: '#10B981',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 2px 8px rgba(16, 185, 129, 0.25)',
          }}
        >
          <i className="fas fa-bolt" /> + Record Payment
        </button>
      </div>

      {/* 2. Metrics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
        <div
          style={{
            backgroundColor: '#FFFFFF',
            padding: '18px 20px',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
              Total Revenue Collected
            </div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#10B981', marginTop: '2px' }}>
              ₹{totalCollected.toLocaleString()}
            </div>
          </div>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              backgroundColor: '#ECFDF5',
              color: '#10B981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
            }}
          >
            <i className="fas fa-receipt" />
          </div>
        </div>

        <div
          style={{
            backgroundColor: '#FFFFFF',
            padding: '18px 20px',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
              Recorded Transactions
            </div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#0F1E36', marginTop: '2px' }}>
              {payments.length} Receipts
            </div>
          </div>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              backgroundColor: '#EFF6FF',
              color: '#2563EB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
            }}
          >
            <i className="fas fa-file-invoice-dollar" />
          </div>
        </div>

        <div
          style={{
            backgroundColor: '#FFFFFF',
            padding: '18px 20px',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
              Unpaid / Balance
            </div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#E11D48', marginTop: '2px' }}>
              ₹{totalOutstanding.toLocaleString()}
            </div>
          </div>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              backgroundColor: '#FFF1F2',
              color: '#E11D48',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
            }}
          >
            <i className="fas fa-exclamation-circle" />
          </div>
        </div>
      </div>

      {/* 3. Filters Bar */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '14px',
          padding: '16px 20px',
          border: '1px solid #E2E8F0',
          display: 'flex',
          gap: '12px',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <div style={{ flex: '1 1 240px', position: 'relative' }}>
          <i
            className="fas fa-search"
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#94A3B8',
              fontSize: '13px',
            }}
          />
          <input
            type="text"
            placeholder="Search student, STU-code, or RCP-..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '9px 12px 9px 34px',
              borderRadius: '8px',
              border: '1px solid #CBD5E1',
              fontSize: '13px',
              outline: 'none',
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#475569' }}>Status:</span>
          {(['All', 'Paid', 'Partial', 'Pending'] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: statusFilter === st ? 'none' : '1px solid #E2E8F0',
                backgroundColor: statusFilter === st ? '#0F1E36' : '#FFFFFF',
                color: statusFilter === st ? '#FFFFFF' : '#475569',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {st}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#475569' }}>Mode:</span>
          <select
            value={modeFilter}
            onChange={(e) => setModeFilter(e.target.value as any)}
            style={{
              padding: '7px 10px',
              borderRadius: '6px',
              border: '1px solid #CBD5E1',
              fontSize: '12px',
              backgroundColor: '#FFFFFF',
              outline: 'none',
            }}
          >
            <option value="All">All Modes</option>
            <option value="UPI">UPI</option>
            <option value="Cash">Cash</option>
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="Card">Card</option>
          </select>
        </div>
      </div>

      {/* 4. Table */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '14px',
          border: '1px solid #E2E8F0',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: '14px 20px',
            borderBottom: '1px solid #E2E8F0',
            backgroundColor: '#F8FAFC',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#0F1E36' }}>
            Showing {filteredPayments.length} Payments
          </span>
          <button
            type="button"
            onClick={loadPayments}
            style={{
              background: 'none',
              border: 'none',
              color: '#2563EB',
              fontSize: '12.5px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <i className="fas fa-sync-alt" /> Refresh Ledger
          </button>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
            <Loader />
          </div>
        ) : filteredPayments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px 20px' }}>
            <i className="fas fa-receipt" style={{ fontSize: '32px', color: '#94A3B8', marginBottom: '10px' }} />
            <h4 style={{ margin: '0 0 4px', fontSize: '15px', color: '#0F1E36' }}>No payment records found</h4>
            <p style={{ margin: 0, fontSize: '13px', color: '#64748B' }}>
              Record a fee payment or clear filters to view ledger items.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                  <th style={{ padding: '12px 18px', fontWeight: 700, color: '#475569' }}>RECEIPT NO</th>
                  <th style={{ padding: '12px 18px', fontWeight: 700, color: '#475569' }}>STUDENT NAME</th>
                  <th style={{ padding: '12px 18px', fontWeight: 700, color: '#475569' }}>FEE HEAD</th>
                  <th style={{ padding: '12px 18px', fontWeight: 700, color: '#475569' }}>MODE</th>
                  <th style={{ padding: '12px 18px', fontWeight: 700, color: '#475569' }}>PAID (₹)</th>
                  <th style={{ padding: '12px 18px', fontWeight: 700, color: '#475569' }}>BALANCE</th>
                  <th style={{ padding: '12px 18px', fontWeight: 700, color: '#475569' }}>STATUS</th>
                  <th style={{ padding: '12px 18px', fontWeight: 700, color: '#475569' }}>DATE</th>
                  <th style={{ padding: '12px 18px', fontWeight: 700, color: '#475569' }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((p, idx) => {
                  const isPaid = p.status === 'Paid';
                  const isPartial = p.status === 'Partial';
                  return (
                    <tr
                      key={p._id || p.receiptNo}
                      style={{
                        borderBottom: idx === filteredPayments.length - 1 ? 'none' : '1px solid #F1F5F9',
                        backgroundColor: idx % 2 === 0 ? '#FFFFFF' : '#FAFAFA',
                      }}
                    >
                      <td style={{ padding: '14px 18px' }}>
                        <button
                          type="button"
                          onClick={() => setSelectedReceipt(p)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#2563EB',
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            cursor: 'pointer',
                            fontSize: '12.5px',
                            textDecoration: 'underline',
                          }}
                        >
                          {p.receiptNo}
                        </button>
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ fontWeight: 700, color: '#0F1E36' }}>{p.studentName}</div>
                        <div style={{ fontSize: '11px', color: '#64748B', fontFamily: 'monospace' }}>
                          {p.studentCode}
                        </div>
                      </td>
                      <td style={{ padding: '14px 18px', color: '#334155', fontWeight: 600 }}>
                        {p.monthOrTerm}
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <span
                          style={{
                            backgroundColor: '#F1F5F9',
                            color: '#334155',
                            padding: '3px 7px',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: 600,
                          }}
                        >
                          {p.paymentMode}
                        </span>
                      </td>
                      <td style={{ padding: '14px 18px', fontWeight: 800, color: '#10B981' }}>
                        ₹{p.amountPaid.toLocaleString()}
                      </td>
                      <td style={{ padding: '14px 18px', color: p.balance > 0 ? '#E11D48' : '#64748B', fontWeight: p.balance > 0 ? 700 : 500 }}>
                        {p.balance > 0 ? `₹${p.balance.toLocaleString()}` : '₹0'}
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <span
                          style={{
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: 700,
                            backgroundColor: isPaid ? '#ECFDF5' : isPartial ? '#FEF3C7' : '#FEE2E2',
                            color: isPaid ? '#059669' : isPartial ? '#D97706' : '#DC2626',
                          }}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td style={{ padding: '14px 18px', color: '#64748B', fontSize: '12px' }}>
                        {new Date(p.paidAt).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <button
                          type="button"
                          onClick={() => setSelectedReceipt(p)}
                          style={{
                            padding: '5px 10px',
                            backgroundColor: '#EFF6FF',
                            color: '#2563EB',
                            border: '1px solid #BFDBFE',
                            borderRadius: '6px',
                            fontSize: '11.5px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <i className="fas fa-print" /> Receipt
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 5. Printable Receipt Modal */}
      {selectedReceipt && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            zIndex: 120,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => setSelectedReceipt(null)}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '480px',
              padding: '24px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ textAlign: 'center', borderBottom: '1px solid #F1F5F9', paddingBottom: '14px' }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#0F1E36',
                  color: '#FFFFFF',
                  padding: '4px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 800,
                  marginBottom: '8px',
                }}
              >
                <i className="fas fa-graduation-cap" /> EDUPYE ACADEMY
              </div>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0F1E36' }}>
                Tuition Fee Payment Receipt
              </h3>
              <p style={{ margin: '3px 0 0', fontSize: '12px', color: '#64748B' }}>
                Receipt No: <strong style={{ fontFamily: 'monospace', color: '#0F1E36' }}>{selectedReceipt.receiptNo}</strong>
              </p>
            </div>

            <div
              style={{
                backgroundColor: '#F8FAFC',
                borderRadius: '10px',
                padding: '16px',
                border: '1px solid #E2E8F0',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                fontSize: '13px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>Student Name:</span>
                <span style={{ fontWeight: 700, color: '#0F1E36' }}>{selectedReceipt.studentName}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>Student Code:</span>
                <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{selectedReceipt.studentCode}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>Fee Description:</span>
                <span style={{ fontWeight: 600 }}>{selectedReceipt.monthOrTerm}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>Payment Mode:</span>
                <span style={{ fontWeight: 600 }}>{selectedReceipt.paymentMode}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>Date of Payment:</span>
                <span>{new Date(selectedReceipt.paidAt).toLocaleDateString()}</span>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  borderTop: '1px solid #CBD5E1',
                  paddingTop: '10px',
                  marginTop: '4px',
                  fontSize: '15px',
                  fontWeight: 800,
                  color: '#0F1E36',
                }}
              >
                <span>Total Amount Paid:</span>
                <span style={{ color: '#10B981' }}>₹{selectedReceipt.amountPaid.toLocaleString()}</span>
              </div>
              {selectedReceipt.balance > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#E11D48', fontWeight: 700 }}>
                  <span>Remaining Dues:</span>
                  <span>₹{selectedReceipt.balance.toLocaleString()}</span>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={() => window.print()}
                style={{
                  flex: 1,
                  padding: '9px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: '#2563EB',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <i className="fas fa-print" /> Print Receipt
              </button>
              <button
                type="button"
                onClick={() => setSelectedReceipt(null)}
                style={{
                  padding: '9px 18px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  backgroundColor: '#FFFFFF',
                  color: '#334155',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
