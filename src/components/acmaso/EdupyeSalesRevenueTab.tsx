import React, { useEffect, useState } from 'react';
import { tuitionAdminService, type EdupyeAccountsData } from '../../services/tuitionAdmin.service';
import { Button } from '../common/Button';
import { Loader } from '../common/Loader';
import { useToast } from '../../hooks/useToast';

export const EdupyeSalesRevenueTab: React.FC = () => {
  const { showToast } = useToast();
  const [data, setData] = useState<EdupyeAccountsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAccounts();
  }, []);

  async function loadAccounts() {
    setLoading(true);
    try {
      const res = await tuitionAdminService.getEdupyeAccounts();
      setData(res);
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Failed to load EduPye financial accounts', 'error');
    } finally {
      setLoading(false);
    }
  }

  if (loading || !data) {
    return (
      <div style={{ padding: 48, textAlign: 'center' }}>
        <Loader label="Loading EduPye Tuition & Course Sales Data..." />
      </div>
    );
  }

  const { summary, recentTransactions, payoutsBreakdown } = data;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header and Refresh */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#1a2540', margin: 0, letterSpacing: -0.3 }}>
            EduPye Sales & Revenue Hub
          </h2>
          <p style={{ margin: '4px 0 0 0', fontSize: 13, color: '#64748b' }}>
            Real-time tuition transaction receipts, course enrollment revenue, and verified teacher payout reconciliation.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <Button variant="secondary" onClick={loadAccounts}>
            <i className="fas fa-arrows-rotate" style={{ marginRight: 6 }} /> Refresh
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 16 }}>
        {/* Total Gross Revenue */}
        <div className="panel" style={{ padding: '20px 22px', borderLeft: '4px solid #2563eb' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ fontSize: 12.5, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.4 }}>
              Total Gross Sales
            </span>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className="fas fa-indian-rupee-sign" />
            </div>
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#1a2540' }}>
            ₹{summary.totalGrossRevenue.toLocaleString('en-IN')}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, fontSize: 11.5, color: '#64748b' }}>
            <span>Paid Transactions: <strong>{summary.totalPaidTransactions}</strong></span>
            <span style={{ color: '#059669' }}>Status: <strong>Active</strong></span>
          </div>
        </div>

        {/* Platform Net Revenue */}
        <div className="panel" style={{ padding: '20px 22px', borderLeft: '4px solid #059669' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ fontSize: 12.5, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.4 }}>
              Platform Net Retained
            </span>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className="fas fa-vault" />
            </div>
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#1a2540' }}>
            ₹{summary.platformNetRevenue.toLocaleString('en-IN')}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, fontSize: 11.5, color: '#64748b' }}>
            <span>After Disbursed Payouts</span>
            <span style={{ color: '#059669' }}>INR</span>
          </div>
        </div>

        {/* Enrollments */}
        <div className="panel" style={{ padding: '20px 22px', borderLeft: '4px solid #8b5cf6' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ fontSize: 12.5, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.4 }}>
              Total Enrollments
            </span>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: '#f5f3ff', color: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className="fas fa-graduation-cap" />
            </div>
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#1a2540' }}>
            {summary.totalEnrollments.toLocaleString('en-IN')}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, fontSize: 11.5, color: '#64748b' }}>
            <span>Tuition: <strong>{summary.tuitionEnrollments}</strong></span>
            <span>Courses: <strong>{summary.courseEnrollments}</strong></span>
          </div>
        </div>

        {/* Pending Teacher Payouts */}
        <div className="panel" style={{ padding: '20px 22px', borderLeft: '4px solid #f59e0b' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ fontSize: 12.5, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.4 }}>
              Pending Payouts
            </span>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: '#fffbeb', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className="fas fa-clock" />
            </div>
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#d97706' }}>
            ₹{summary.pendingPayoutsAmount.toLocaleString('en-IN')}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, fontSize: 11.5, color: '#64748b' }}>
            <span>Under Review: <strong>{summary.pendingPayoutsCount}</strong></span>
            <span>Disbursed: <strong>₹{summary.disbursedPayoutsAmount.toLocaleString('en-IN')}</strong></span>
          </div>
        </div>
      </div>

      {/* Payout Reconciliation Summary Bar */}
      <div className="panel" style={{ padding: '16px 20px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#334155' }}>
              Teacher Payout Pipeline:
            </span>
            <span style={{ fontSize: 12.5, color: '#64748b', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b', display: 'inline-block' }} />
              Pending: <strong>{payoutsBreakdown.pendingReview.count} (₹{payoutsBreakdown.pendingReview.amount.toLocaleString('en-IN')})</strong>
            </span>
            <span style={{ fontSize: 12.5, color: '#64748b', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#3b82f6', display: 'inline-block' }} />
              Approved: <strong>{payoutsBreakdown.approved.count} (₹{payoutsBreakdown.approved.amount.toLocaleString('en-IN')})</strong>
            </span>
            <span style={{ fontSize: 12.5, color: '#64748b', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
              Disbursed: <strong>{payoutsBreakdown.disbursed.count} (₹{payoutsBreakdown.disbursed.amount.toLocaleString('en-IN')})</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Recent Tuition Sales Table */}
      <div className="panel" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#1e293b' }}>
              Recent Student Tuition Receipts
            </h3>
            <p style={{ margin: '3px 0 0 0', fontSize: 12.5, color: '#64748b' }}>
              Live recorded tuition payments and auto-generated receipt IDs.
            </p>
          </div>
        </div>

        {recentTransactions.length === 0 ? (
          <div style={{ padding: '36px 0', textAlign: 'center', color: '#94a3b8', fontSize: 13.5 }}>
            <i className="fas fa-receipt" style={{ fontSize: 32, marginBottom: 12, display: 'block', opacity: 0.5 }} />
            No student tuition transactions recorded yet. Live student transactions will appear here automatically.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e2e8f0', textAlign: 'left', color: '#64748b', fontSize: 12, textTransform: 'uppercase' }}>
                  <th style={{ padding: '10px 12px' }}>Receipt / TX</th>
                  <th style={{ padding: '10px 12px' }}>Student</th>
                  <th style={{ padding: '10px 12px' }}>Tuition Teacher</th>
                  <th style={{ padding: '10px 12px' }}>Subject / Program</th>
                  <th style={{ padding: '10px 12px' }}>Amount</th>
                  <th style={{ padding: '10px 12px' }}>Payment Mode</th>
                  <th style={{ padding: '10px 12px' }}>Status</th>
                  <th style={{ padding: '10px 12px' }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map((tx) => (
                  <tr key={tx.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px', fontWeight: 600, color: '#1e3a8a' }}>
                      {tx.receiptNumber}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ fontWeight: 600, color: '#1e293b' }}>{tx.studentName}</div>
                      {tx.studentCode && (
                        <div style={{ fontSize: 11, color: '#059669', fontWeight: 600 }}>{tx.studentCode}</div>
                      )}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ fontWeight: 600, color: '#1e293b' }}>{tx.teacherName}</div>
                      {tx.teacherCode && (
                        <div style={{ fontSize: 11, color: '#2563eb', fontWeight: 600 }}>{tx.teacherCode}</div>
                      )}
                    </td>
                    <td style={{ padding: '12px', color: '#475569' }}>
                      {tx.subject}
                    </td>
                    <td style={{ padding: '12px', fontWeight: 700, color: '#0f172a' }}>
                      ₹{tx.amount.toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '12px', color: '#64748b', fontSize: 12 }}>
                      {tx.paymentMethod}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span
                        style={{
                          padding: '3px 8px',
                          borderRadius: 6,
                          fontSize: 11,
                          fontWeight: 600,
                          background: tx.status === 'paid' ? '#dcfce7' : tx.status === 'refunded' ? '#fee2e2' : '#fef3c7',
                          color: tx.status === 'paid' ? '#15803d' : tx.status === 'refunded' ? '#b91c1c' : '#b45309',
                          textTransform: 'capitalize',
                        }}
                      >
                        {tx.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px', color: '#94a3b8', fontSize: 12 }}>
                      {new Date(tx.createdAt).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
