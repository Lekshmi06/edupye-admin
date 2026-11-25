import React, { useState, useEffect, useCallback } from 'react';
import {
  tuitionAdminService,
  type AcademyExpenseItem,
  type FinanceSummaryResponse,
} from '../../../services/tuitionAdmin.service';
import { useToast } from '../../../hooks/useToast';
import { Loader } from '../../common/Loader';

interface ExpensesFinanceViewProps {
  academicSession: string;
}

export const ExpensesFinanceView: React.FC<ExpensesFinanceViewProps> = ({
  academicSession,
}) => {
  const { showToast } = useToast();
  const [selectedMonth, setSelectedMonth] = useState<string>(
    new Date().toISOString().slice(0, 7)
  );
  const [expenses, setExpenses] = useState<AcademyExpenseItem[]>([]);
  const [financeSummary, setFinanceSummary] = useState<FinanceSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [category, setCategory] = useState<AcademyExpenseItem['category']>('Rent & Utilities');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMode, setPaymentMode] = useState('Bank Transfer');
  const [paidTo, setPaidTo] = useState('');
  const [notes, setNotes] = useState('');

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [expList, summary] = await Promise.all([
        tuitionAdminService.getExpenses({
          month: selectedMonth,
          category: selectedCategory !== 'all' ? selectedCategory : undefined,
          session: academicSession,
        }),
        tuitionAdminService.getFinanceSummary(selectedMonth, academicSession),
      ]);
      setExpenses(expList);
      setFinanceSummary(summary);
    } catch (err: any) {
      showToast(err.message || 'Failed to fetch financial data', 'error');
    } finally {
      setLoading(false);
    }
  }, [academicSession, selectedCategory, selectedMonth, showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !amount || !paidTo.trim()) {
      showToast('Please fill all required fields.', 'warning');
      return;
    }

    try {
      setSubmitting(true);
      await tuitionAdminService.createExpense({
        category,
        title: title.trim(),
        amount: Number(amount),
        date,
        paymentMode,
        paidTo: paidTo.trim(),
        notes: notes.trim(),
        session: academicSession,
      });

      showToast(`Expense of ₹${Number(amount).toLocaleString()} recorded.`, 'success');
      setShowAddModal(false);
      setTitle('');
      setAmount('');
      setPaidTo('');
      setNotes('');
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to record expense', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const isNetSurplus = (financeSummary?.netSurplus || 0) >= 0;

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
              FINANCIAL LEDGER & P&L
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
            Tuition Center Financials & Profit & Loss
          </h2>
          <p style={{ margin: 0, fontSize: '13px', color: '#64748B' }}>
            Live revenue collections compared against center facility expenses, marketing, and tutor payroll.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid #CBD5E1',
              fontSize: '13px',
              fontWeight: 700,
              backgroundColor: '#FFFFFF',
              outline: 'none',
            }}
          />

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            style={{
              padding: '9px 16px',
              backgroundColor: '#E11D48',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              fontSize: '12.5px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 8px rgba(225, 29, 72, 0.25)',
            }}
          >
            <i className="fas fa-plus" /> + Record Expense
          </button>
        </div>
      </div>

      {/* 2. P&L Comparison Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
        {/* Total Fee Income */}
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
              Monthly Fee Income
            </div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#10B981', marginTop: '2px' }}>
              ₹{(financeSummary?.totalFeeIncome || 0).toLocaleString()}
            </div>
            <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
              &bull; {financeSummary?.transactionCounts.feeReceipts || 0} Receipts
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
            <i className="fas fa-arrow-down" />
          </div>
        </div>

        {/* Total Expenses */}
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
              Center Operating Expenses
            </div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#E11D48', marginTop: '2px' }}>
              ₹{(financeSummary?.totalCenterExpenses || 0).toLocaleString()}
            </div>
            <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
              &bull; {financeSummary?.transactionCounts.expenses || 0} Vouchers
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
            <i className="fas fa-arrow-up" />
          </div>
        </div>

        {/* Tutor Payouts */}
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
              Faculty Disbursed Payouts
            </div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#7C3AED', marginTop: '2px' }}>
              ₹{(financeSummary?.totalTutorPayouts || 0).toLocaleString()}
            </div>
            <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
              &bull; {financeSummary?.transactionCounts.tutorsPaid || 0} Tutors Paid
            </div>
          </div>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              backgroundColor: '#F5F3FF',
              color: '#7C3AED',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
            }}
          >
            <i className="fas fa-chalkboard-teacher" />
          </div>
        </div>

        {/* Net Surplus / Deficit */}
        <div
          style={{
            backgroundColor: isNetSurplus ? '#ECFDF5' : '#FFF1F2',
            padding: '18px 20px',
            borderRadius: '12px',
            border: `1px solid ${isNetSurplus ? '#A7F3D0' : '#FECDD3'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontSize: '11.5px', fontWeight: 700, color: isNetSurplus ? '#065F46' : '#9F1239', textTransform: 'uppercase' }}>
              Net Center {isNetSurplus ? 'Surplus' : 'Deficit'}
            </div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: isNetSurplus ? '#059669' : '#DC2626', marginTop: '2px' }}>
              {isNetSurplus ? '+' : ''}₹{(financeSummary?.netSurplus || 0).toLocaleString()}
            </div>
            <div style={{ fontSize: '11px', color: isNetSurplus ? '#047857' : '#BE123C', marginTop: '2px', fontWeight: 600 }}>
              &bull; {isNetSurplus ? 'Profitable Operating Margin' : 'Expenses Exceed Revenue'}
            </div>
          </div>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              backgroundColor: isNetSurplus ? '#D1FAE5' : '#FFE4E6',
              color: isNetSurplus ? '#059669' : '#E11D48',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
            }}
          >
            <i className={`fas ${isNetSurplus ? 'fa-chart-pie' : 'fa-balance-scale'}`} />
          </div>
        </div>
      </div>

      {/* 3. Filter Bar */}
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
        <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#475569' }}>Category:</span>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          style={{
            padding: '8px 12px',
            borderRadius: '8px',
            border: '1px solid #CBD5E1',
            fontSize: '12.5px',
            backgroundColor: '#FFFFFF',
            outline: 'none',
          }}
        >
          <option value="all">All Expense Categories</option>
          <option value="Rent & Utilities">Rent & Utilities</option>
          <option value="Study Material & Printing">Study Material & Printing</option>
          <option value="Tutor Payouts">Tutor Payouts</option>
          <option value="Software & Equipment">Software & Equipment</option>
          <option value="Marketing">Marketing & Promotion</option>
          <option value="Other">Other Miscellaneous</option>
        </select>
      </div>

      {/* 4. Expenses Ledger Table */}
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
            Expense Transactions ({expenses.length}) &bull; {selectedMonth}
          </span>
          <button
            type="button"
            onClick={loadData}
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
        ) : expenses.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px 20px' }}>
            <i className="fas fa-receipt" style={{ fontSize: '32px', color: '#94A3B8', marginBottom: '10px' }} />
            <h4 style={{ margin: '0 0 4px', fontSize: '15px', color: '#0F1E36' }}>No expenses recorded for {selectedMonth}</h4>
            <p style={{ margin: 0, fontSize: '13px', color: '#64748B' }}>
              Click "+ Record Expense" to log rent, utility bills, study materials, or equipment costs.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                  <th style={{ padding: '12px 18px', fontWeight: 700, color: '#475569' }}>EXPENSE TITLE</th>
                  <th style={{ padding: '12px 18px', fontWeight: 700, color: '#475569' }}>CATEGORY</th>
                  <th style={{ padding: '12px 18px', fontWeight: 700, color: '#475569' }}>PAID TO</th>
                  <th style={{ padding: '12px 18px', fontWeight: 700, color: '#475569' }}>MODE</th>
                  <th style={{ padding: '12px 18px', fontWeight: 700, color: '#475569' }}>DATE</th>
                  <th style={{ padding: '12px 18px', fontWeight: 700, color: '#475569' }}>AMOUNT (₹)</th>
                  <th style={{ padding: '12px 18px', fontWeight: 700, color: '#475569' }}>NOTES</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((exp, idx) => (
                  <tr
                    key={exp._id}
                    style={{
                      borderBottom: idx === expenses.length - 1 ? 'none' : '1px solid #F1F5F9',
                      backgroundColor: idx % 2 === 0 ? '#FFFFFF' : '#FAFAFA',
                    }}
                  >
                    <td style={{ padding: '14px 18px', fontWeight: 700, color: '#0F1E36' }}>
                      {exp.title}
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <span
                        style={{
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: 700,
                          backgroundColor:
                            exp.category === 'Tutor Payouts'
                              ? '#F5F3FF'
                              : exp.category === 'Rent & Utilities'
                              ? '#FEF3C7'
                              : '#EFF6FF',
                          color:
                            exp.category === 'Tutor Payouts'
                              ? '#7C3AED'
                              : exp.category === 'Rent & Utilities'
                              ? '#D97706'
                              : '#2563EB',
                        }}
                      >
                        {exp.category}
                      </span>
                    </td>
                    <td style={{ padding: '14px 18px', color: '#334155', fontWeight: 600 }}>
                      {exp.paidTo}
                    </td>
                    <td style={{ padding: '14px 18px', color: '#64748B' }}>{exp.paymentMode}</td>
                    <td style={{ padding: '14px 18px', color: '#64748B' }}>{exp.date}</td>
                    <td style={{ padding: '14px 18px', fontWeight: 800, color: '#E11D48', fontSize: '14px' }}>
                      ₹{exp.amount.toLocaleString()}
                    </td>
                    <td style={{ padding: '14px 18px', color: '#64748B', fontSize: '12px' }}>
                      {exp.notes || '--'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 5. Add Expense Modal */}
      {showAddModal && (
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
          onClick={() => setShowAddModal(false)}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '500px',
              padding: '24px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    backgroundColor: '#FFF1F2',
                    color: '#E11D48',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px',
                  }}
                >
                  <i className="fas fa-file-invoice-dollar" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#0F1E36' }}>
                    Record Center Expense
                  </h3>
                  <p style={{ margin: 0, fontSize: '12px', color: '#64748B' }}>
                    Log operational or facility expenditure
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                style={{ background: 'none', border: 'none', color: '#94A3B8', fontSize: '16px', cursor: 'pointer' }}
              >
                <i className="fas fa-times" />
              </button>
            </div>

            <form onSubmit={handleCreateExpense} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Expense Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '13px',
                    outline: 'none',
                    backgroundColor: '#FFFFFF',
                  }}
                >
                  <option value="Rent & Utilities">Rent & Utilities</option>
                  <option value="Study Material & Printing">Study Material & Printing</option>
                  <option value="Software & Equipment">Software & Equipment</option>
                  <option value="Marketing">Marketing & Promotion</option>
                  <option value="Other">Other Miscellaneous</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Title / Description *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. November Center Electricity Bill or Practice Booklet Printing"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '13px',
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Amount (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '13px',
                      outline: 'none',
                      fontWeight: 700,
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '13px',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Paid To / Vendor *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. State Electricity Board or ABC Printers"
                    value={paidTo}
                    onChange={(e) => setPaidTo(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '13px',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Payment Mode
                  </label>
                  <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '13px',
                      outline: 'none',
                      backgroundColor: '#FFFFFF',
                    }}
                  >
                    <option value="Bank Transfer">Bank Transfer / NEFT</option>
                    <option value="UPI">UPI / QR</option>
                    <option value="Card">Debit / Credit Card</option>
                    <option value="Cash">Cash</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Notes / Invoice Reference
                </label>
                <input
                  type="text"
                  placeholder="e.g. Bill #INV-9821, Paid via HDFC"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '13px',
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    backgroundColor: '#FFFFFF',
                    color: '#334155',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    padding: '8px 20px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: '#E11D48',
                    color: '#FFFFFF',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {submitting ? 'Recording...' : 'Record Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
