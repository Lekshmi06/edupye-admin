import React, { useState, useEffect, useCallback } from 'react';
import {
  tuitionAdminService,
  type TutorPayrollCalculationItem,
  type AdminTeacherItem,
} from '../../../services/tuitionAdmin.service';
import { useToast } from '../../../hooks/useToast';
import { Loader } from '../../common/Loader';

interface SalaryManagementViewProps {
  teachers: AdminTeacherItem[];
  academicSession: string;
}

export const SalaryManagementView: React.FC<SalaryManagementViewProps> = ({
  teachers,
  academicSession,
}) => {
  const { showToast } = useToast();
  const [selectedMonth, setSelectedMonth] = useState<string>(
    new Date().toISOString().slice(0, 7)
  );
  const [tutorCalculations, setTutorCalculations] = useState<TutorPayrollCalculationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Payslip Modal State
  const [selectedPayslip, setSelectedPayslip] = useState<TutorPayrollCalculationItem | null>(null);

  const loadPayroll = useCallback(async (m: string) => {
    try {
      setLoading(true);
      const data = await tuitionAdminService.calculatePayrollForMonth(m, academicSession);
      setTutorCalculations(data.tutorCalculations);
    } catch (err: any) {
      showToast(err.message || 'Failed to calculate tutor payroll', 'error');
    } finally {
      setLoading(false);
    }
  }, [academicSession, showToast]);

  useEffect(() => {
    loadPayroll(selectedMonth);
  }, [loadPayroll, selectedMonth]);

  const handleSyncSessions = async () => {
    try {
      setSyncing(true);
      const data = await tuitionAdminService.calculatePayrollForMonth(selectedMonth, academicSession);
      setTutorCalculations(data.tutorCalculations);
      showToast(`Sessions synchronized from attendance for ${selectedMonth}!`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to sync sessions', 'error');
    } finally {
      setSyncing(false);
    }
  };

  const handleRateOrFieldChange = (
    index: number,
    field: keyof TutorPayrollCalculationItem,
    val: any
  ) => {
    setTutorCalculations((prev) => {
      const copy = [...prev];
      const item = { ...copy[index], [field]: val };

      // Recompute net payable
      if (item.payoutType === 'Per-Session') {
        item.netPayable = Math.max(
          0,
          item.completed1on1Count * item.ratePer1on1Session +
            item.completedBatchCount * item.ratePerBatchSession +
            item.bonusAmount -
            item.deductions
        );
      } else {
        item.netPayable = Math.max(
          0,
          item.fixedRetainer + item.bonusAmount - item.deductions
        );
      }

      copy[index] = item;
      return copy;
    });
  };

  const handleSaveDraft = async (item: TutorPayrollCalculationItem) => {
    try {
      setProcessingId(item.teacherId);
      const saved = await tuitionAdminService.saveTutorPayout({
        teacherId: item.teacherId,
        teacherCode: item.teacherCode,
        teacherName: item.teacherName,
        month: item.month,
        payoutType: item.payoutType,
        ratePer1on1Session: item.ratePer1on1Session,
        ratePerBatchSession: item.ratePerBatchSession,
        fixedRetainer: item.fixedRetainer,
        completed1on1Count: item.completed1on1Count,
        completedBatchCount: item.completedBatchCount,
        bonusAmount: item.bonusAmount,
        deductions: item.deductions,
        paymentMode: item.paymentMode,
        session: academicSession,
      });

      showToast(`Payout draft saved for ${item.teacherName}`, 'info');
      loadPayroll(selectedMonth);
    } catch (err: any) {
      showToast(err.message || 'Failed to save payout draft', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const handlePayNow = async (item: TutorPayrollCalculationItem) => {
    try {
      setProcessingId(item.teacherId);
      // 1. Ensure payout record exists
      const saved = await tuitionAdminService.saveTutorPayout({
        teacherId: item.teacherId,
        teacherCode: item.teacherCode,
        teacherName: item.teacherName,
        month: item.month,
        payoutType: item.payoutType,
        ratePer1on1Session: item.ratePer1on1Session,
        ratePerBatchSession: item.ratePerBatchSession,
        fixedRetainer: item.fixedRetainer,
        completed1on1Count: item.completed1on1Count,
        completedBatchCount: item.completedBatchCount,
        bonusAmount: item.bonusAmount,
        deductions: item.deductions,
        paymentMode: item.paymentMode,
        session: academicSession,
      });

      // 2. Mark as paid
      await tuitionAdminService.payTutorPayout(saved._id, {
        paymentMode: item.paymentMode || 'Bank Transfer',
      });

      showToast(`Payout of ₹${item.netPayable.toLocaleString()} marked as Paid for ${item.teacherName}!`, 'success');
      loadPayroll(selectedMonth);
    } catch (err: any) {
      showToast(err.message || 'Failed to process payment', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const totalPayrollBudget = tutorCalculations.reduce((sum, t) => sum + t.netPayable, 0);
  const totalPaid = tutorCalculations.filter((t) => t.status === 'Paid').reduce((sum, t) => sum + t.netPayable, 0);
  const totalPending = totalPayrollBudget - totalPaid;

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
              FACULTY PAYROLL
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
            Tutor Payroll & Session Compensation
          </h2>
          <p style={{ margin: 0, fontSize: '13px', color: '#64748B' }}>
            Automated session verification from classroom attendance, 1-on-1 and batch rates, bonuses, and payslips.
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
            onClick={handleSyncSessions}
            disabled={syncing}
            style={{
              padding: '9px 16px',
              backgroundColor: '#2563EB',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              fontSize: '12.5px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)',
            }}
          >
            <i className={`fas fa-sync-alt ${syncing ? 'fa-spin' : ''}`} /> Sync Sessions
          </button>
        </div>
      </div>

      {/* 2. Metric Pills */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
        <div
          style={{
            backgroundColor: '#FFFFFF',
            padding: '16px 20px',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
              Total Month Payroll
            </div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#0F1E36', marginTop: '2px' }}>
              ₹{totalPayrollBudget.toLocaleString()}
            </div>
          </div>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              backgroundColor: '#EFF6FF',
              color: '#2563EB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
            }}
          >
            <i className="fas fa-money-check-alt" />
          </div>
        </div>

        <div
          style={{
            backgroundColor: '#FFFFFF',
            padding: '16px 20px',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
              Disbursed / Paid
            </div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#059669', marginTop: '2px' }}>
              ₹{totalPaid.toLocaleString()}
            </div>
          </div>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              backgroundColor: '#ECFDF5',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
            }}
          >
            <i className="fas fa-check-circle" />
          </div>
        </div>

        <div
          style={{
            backgroundColor: '#FFFFFF',
            padding: '16px 20px',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
              Pending Payouts
            </div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#E11D48', marginTop: '2px' }}>
              ₹{totalPending.toLocaleString()}
            </div>
          </div>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              backgroundColor: '#FFF1F2',
              color: '#E11D48',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
            }}
          >
            <i className="fas fa-hourglass-half" />
          </div>
        </div>
      </div>

      {/* 3. Payroll Table */}
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
            Faculty Members ({tutorCalculations.length}) &bull; Month: {selectedMonth}
          </span>
          <span style={{ fontSize: '12px', color: '#64748B' }}>
            Session counts are verified against completed class attendance logs
          </span>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
            <Loader />
          </div>
        ) : tutorCalculations.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px 20px' }}>
            <i className="fas fa-chalkboard-teacher" style={{ fontSize: '32px', color: '#94A3B8', marginBottom: '10px' }} />
            <h4 style={{ margin: '0 0 4px', fontSize: '15px', color: '#0F1E36' }}>No active faculty members found</h4>
            <p style={{ margin: 0, fontSize: '13px', color: '#64748B' }}>
              Faculty tutors with approved status will appear here for monthly compensation.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12.5px' }}>
              <thead>
                <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                  <th style={{ padding: '12px 16px', fontWeight: 700, color: '#475569' }}>TUTOR NAME</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700, color: '#475569' }}>MODEL</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700, color: '#475569' }}>1-ON-1 SESSIONS</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700, color: '#475569' }}>BATCH SESSIONS</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700, color: '#475569' }}>BONUS (₹)</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700, color: '#475569' }}>DEDUCTIONS (₹)</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700, color: '#475569' }}>NET PAYABLE (₹)</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700, color: '#475569' }}>STATUS</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700, color: '#475569' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {tutorCalculations.map((t, idx) => {
                  const isPaid = t.status === 'Paid';
                  const isProcessing = processingId === t.teacherId;

                  return (
                    <tr
                      key={t.teacherId}
                      style={{
                        borderBottom: idx === tutorCalculations.length - 1 ? 'none' : '1px solid #F1F5F9',
                        backgroundColor: idx % 2 === 0 ? '#FFFFFF' : '#FAFAFA',
                      }}
                    >
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontWeight: 700, color: '#0F1E36' }}>{t.teacherName}</div>
                        <div style={{ fontSize: '11px', color: '#64748B', fontFamily: 'monospace' }}>
                          {t.teacherCode}
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <select
                          disabled={isPaid}
                          value={t.payoutType}
                          onChange={(e) => handleRateOrFieldChange(idx, 'payoutType', e.target.value)}
                          style={{
                            padding: '4px 8px',
                            borderRadius: '6px',
                            border: '1px solid #CBD5E1',
                            fontSize: '11.5px',
                            backgroundColor: isPaid ? '#F1F5F9' : '#FFFFFF',
                            outline: 'none',
                          }}
                        >
                          <option value="Per-Session">Per-Session</option>
                          <option value="Monthly Retainer + Bonus">Fixed Retainer</option>
                        </select>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontWeight: 700, color: '#0F1E36' }}>{t.completed1on1Count}</span>
                          <span style={{ color: '#64748B' }}>&times; ₹</span>
                          <input
                            type="number"
                            disabled={isPaid || t.payoutType !== 'Per-Session'}
                            min={0}
                            value={t.ratePer1on1Session}
                            onChange={(e) => handleRateOrFieldChange(idx, 'ratePer1on1Session', Number(e.target.value))}
                            style={{
                              width: '64px',
                              padding: '3px 6px',
                              borderRadius: '4px',
                              border: '1px solid #CBD5E1',
                              fontSize: '11.5px',
                              outline: 'none',
                            }}
                          />
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontWeight: 700, color: '#0F1E36' }}>{t.completedBatchCount}</span>
                          <span style={{ color: '#64748B' }}>&times; ₹</span>
                          <input
                            type="number"
                            disabled={isPaid || t.payoutType !== 'Per-Session'}
                            min={0}
                            value={t.ratePerBatchSession}
                            onChange={(e) => handleRateOrFieldChange(idx, 'ratePerBatchSession', Number(e.target.value))}
                            style={{
                              width: '64px',
                              padding: '3px 6px',
                              borderRadius: '4px',
                              border: '1px solid #CBD5E1',
                              fontSize: '11.5px',
                              outline: 'none',
                            }}
                          />
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <input
                          type="number"
                          disabled={isPaid}
                          min={0}
                          value={t.bonusAmount}
                          onChange={(e) => handleRateOrFieldChange(idx, 'bonusAmount', Number(e.target.value))}
                          style={{
                            width: '70px',
                            padding: '3px 6px',
                            borderRadius: '4px',
                            border: '1px solid #CBD5E1',
                            fontSize: '11.5px',
                            outline: 'none',
                          }}
                        />
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <input
                          type="number"
                          disabled={isPaid}
                          min={0}
                          value={t.deductions}
                          onChange={(e) => handleRateOrFieldChange(idx, 'deductions', Number(e.target.value))}
                          style={{
                            width: '70px',
                            padding: '3px 6px',
                            borderRadius: '4px',
                            border: '1px solid #CBD5E1',
                            fontSize: '11.5px',
                            outline: 'none',
                          }}
                        />
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: 800, color: '#0F1E36', fontSize: '13.5px' }}>
                        ₹{t.netPayable.toLocaleString()}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span
                          style={{
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: 700,
                            backgroundColor: isPaid ? '#ECFDF5' : '#FEF3C7',
                            color: isPaid ? '#059669' : '#D97706',
                          }}
                        >
                          {t.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                          {!isPaid ? (
                            <>
                              <button
                                type="button"
                                disabled={isProcessing}
                                onClick={() => handleSaveDraft(t)}
                                style={{
                                  padding: '5px 8px',
                                  backgroundColor: '#FFFFFF',
                                  color: '#334155',
                                  border: '1px solid #CBD5E1',
                                  borderRadius: '6px',
                                  fontSize: '11px',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                }}
                              >
                                Save
                              </button>
                              <button
                                type="button"
                                disabled={isProcessing}
                                onClick={() => handlePayNow(t)}
                                style={{
                                  padding: '5px 10px',
                                  backgroundColor: '#10B981',
                                  color: '#FFFFFF',
                                  border: 'none',
                                  borderRadius: '6px',
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                }}
                              >
                                <i className="fas fa-check" /> Pay Now
                              </button>
                            </>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setSelectedPayslip(t)}
                              style={{
                                padding: '5px 10px',
                                backgroundColor: '#EFF6FF',
                                color: '#2563EB',
                                border: '1px solid #BFDBFE',
                                borderRadius: '6px',
                                fontSize: '11px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                            >
                              <i className="fas fa-file-invoice-dollar" /> Payslip
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 4. Payslip Modal */}
      {selectedPayslip && (
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
          onClick={() => setSelectedPayslip(null)}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '540px',
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
                  fontSize: '11.5px',
                  fontWeight: 800,
                  marginBottom: '6px',
                }}
              >
                <i className="fas fa-graduation-cap" /> EDUPYE ACADEMY
              </div>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0F1E36' }}>
                Tutor Compensation & Payslip
              </h3>
              <p style={{ margin: '3px 0 0', fontSize: '12px', color: '#64748B' }}>
                Payroll Month: <strong style={{ color: '#0F1E36' }}>{selectedPayslip.month}</strong> &bull; Session {academicSession}
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
                <span style={{ color: '#64748B' }}>Faculty Educator:</span>
                <span style={{ fontWeight: 700, color: '#0F1E36' }}>{selectedPayslip.teacherName}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>Teacher ID:</span>
                <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{selectedPayslip.teacherCode}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>Payout Model:</span>
                <span style={{ fontWeight: 600 }}>{selectedPayslip.payoutType}</span>
              </div>

              <div style={{ borderTop: '1px dashed #CBD5E1', paddingTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>1-on-1 Sessions ({selectedPayslip.completed1on1Count} &times; ₹{selectedPayslip.ratePer1on1Session}):</span>
                  <span style={{ fontWeight: 600 }}>₹{(selectedPayslip.completed1on1Count * selectedPayslip.ratePer1on1Session).toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Group Batches ({selectedPayslip.completedBatchCount} &times; ₹{selectedPayslip.ratePerBatchSession}):</span>
                  <span style={{ fontWeight: 600 }}>₹{(selectedPayslip.completedBatchCount * selectedPayslip.ratePerBatchSession).toLocaleString()}</span>
                </div>
                {selectedPayslip.bonusAmount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#059669' }}>
                    <span>Performance Incentive:</span>
                    <span style={{ fontWeight: 600 }}>+₹{selectedPayslip.bonusAmount.toLocaleString()}</span>
                  </div>
                )}
                {selectedPayslip.deductions > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#E11D48' }}>
                    <span>Deductions / Leaves:</span>
                    <span style={{ fontWeight: 600 }}>-₹{selectedPayslip.deductions.toLocaleString()}</span>
                  </div>
                )}
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  borderTop: '1px solid #CBD5E1',
                  paddingTop: '10px',
                  fontSize: '15px',
                  fontWeight: 800,
                  color: '#0F1E36',
                }}
              >
                <span>Net Amount Paid:</span>
                <span style={{ color: '#10B981' }}>₹{selectedPayslip.netPayable.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748B' }}>
                <span>Disbursement Mode:</span>
                <span>{selectedPayslip.paymentMode || 'Bank Transfer'}</span>
              </div>
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
                <i className="fas fa-print" /> Print Payslip
              </button>
              <button
                type="button"
                onClick={() => setSelectedPayslip(null)}
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
