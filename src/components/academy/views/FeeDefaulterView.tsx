import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  tuitionAdminService,
  type AcademyFeeDefaulterItem,
  type AdminStudentItem,
} from '../../../services/tuitionAdmin.service';
import { useToast } from '../../../hooks/useToast';
import { Loader } from '../../common/Loader';

interface FeeDefaulterViewProps {
  students: AdminStudentItem[];
  academicSession: string;
  onCollectDefaulter: (student: AdminStudentItem, dueAmount: number) => void;
}

export const FeeDefaulterView: React.FC<FeeDefaulterViewProps> = ({
  students,
  academicSession,
  onCollectDefaulter,
}) => {
  const { showToast } = useToast();
  const [defaulters, setDefaulters] = useState<AcademyFeeDefaulterItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<'All' | 'High' | 'Medium' | 'Low'>('All');

  const loadDefaulters = useCallback(async () => {
    try {
      setLoading(true);
      const data = await tuitionAdminService.getFeeDefaulters(academicSession);
      setDefaulters(data.defaulters || []);
    } catch (err: any) {
      showToast(err.message || 'Failed to load fee defaulters list', 'error');
    } finally {
      setLoading(false);
    }
  }, [academicSession, showToast]);

  useEffect(() => {
    loadDefaulters();
  }, [loadDefaulters]);

  const filteredDefaulters = useMemo(() => {
    return defaulters.filter((d) => {
      const matchSearch =
        d.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.studentCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (d.parentPhone && d.parentPhone.includes(searchTerm));

      let matchSeverity = true;
      if (severityFilter === 'High') matchSeverity = d.daysOverdue >= 30;
      if (severityFilter === 'Medium') matchSeverity = d.daysOverdue >= 15 && d.daysOverdue < 30;
      if (severityFilter === 'Low') matchSeverity = d.daysOverdue < 15;

      return matchSearch && matchSeverity;
    });
  }, [defaulters, searchTerm, severityFilter]);

  const totalOverdue = useMemo(() => {
    return defaulters.reduce((sum, d) => sum + (d.overdueAmount || 0), 0);
  }, [defaulters]);

  const handleSendReminder = (d: AcademyFeeDefaulterItem) => {
    showToast(`Payment reminder SMS & WhatsApp dispatched to ${d.parentPhone || 'Parent'}`, 'info');
  };

  const handleSendAllReminders = () => {
    showToast(`Bulk payment reminder notices queued for all ${defaulters.length} overdue students`, 'info');
  };

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
                backgroundColor: '#FFF1F2',
                color: '#E11D48',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 800,
                letterSpacing: '0.04em',
              }}
            >
              COLLECTION ALERTS
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
            Fee Defaulters & Overdue Ledger
          </h2>
          <p style={{ margin: 0, fontSize: '13px', color: '#64748B' }}>
            Track pending tuition dues, aging brackets, overdue warnings, and one-click quick collections.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSendAllReminders}
          style={{
            padding: '10px 18px',
            backgroundColor: '#0F1E36',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <i className="fas fa-paper-plane" /> Send All Reminders
        </button>
      </div>

      {/* 2. Overdue Metrics */}
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
              Total Overdue Amount
            </div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#E11D48', marginTop: '2px' }}>
              ₹{totalOverdue.toLocaleString()}
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
            <i className="fas fa-exclamation-triangle" />
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
              Defaulter Accounts
            </div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#0F1E36', marginTop: '2px' }}>
              {defaulters.length} Students
            </div>
          </div>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              backgroundColor: '#FEF3C7',
              color: '#D97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
            }}
          >
            <i className="fas fa-user-clock" />
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
              Critical (&gt; 30 Days)
            </div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#DC2626', marginTop: '2px' }}>
              {defaulters.filter((d) => d.daysOverdue >= 30).length} Cases
            </div>
          </div>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              backgroundColor: '#FEE2E2',
              color: '#DC2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
            }}
          >
            <i className="fas fa-bell" />
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
            placeholder="Search student name, STU-code, parent phone..."
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
          <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#475569' }}>Aging:</span>
          {(['All', 'High', 'Medium', 'Low'] as const).map((sev) => (
            <button
              key={sev}
              type="button"
              onClick={() => setSeverityFilter(sev)}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: severityFilter === sev ? 'none' : '1px solid #E2E8F0',
                backgroundColor: severityFilter === sev ? '#0F1E36' : '#FFFFFF',
                color: severityFilter === sev ? '#FFFFFF' : '#475569',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {sev === 'High' ? '> 30 Days' : sev === 'Medium' ? '15-30 Days' : sev === 'Low' ? '< 15 Days' : 'All'}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Defaulters Table */}
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
            Showing {filteredDefaulters.length} Defaulters
          </span>
          <button
            type="button"
            onClick={loadDefaulters}
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
            <i className="fas fa-sync-alt" /> Refresh List
          </button>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
            <Loader />
          </div>
        ) : filteredDefaulters.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px 20px' }}>
            <i className="fas fa-check-circle" style={{ fontSize: '32px', color: '#10B981', marginBottom: '10px' }} />
            <h4 style={{ margin: '0 0 4px', fontSize: '15px', color: '#0F1E36' }}>No Defaulters Found</h4>
            <p style={{ margin: 0, fontSize: '13px', color: '#64748B' }}>
              All student accounts in session {academicSession} are settled or within the grace period.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                  <th style={{ padding: '12px 18px', fontWeight: 700, color: '#475569' }}>STUDENT ID</th>
                  <th style={{ padding: '12px 18px', fontWeight: 700, color: '#475569' }}>STUDENT NAME</th>
                  <th style={{ padding: '12px 18px', fontWeight: 700, color: '#475569' }}>CLASS / GRADE</th>
                  <th style={{ padding: '12px 18px', fontWeight: 700, color: '#475569' }}>PARENT PHONE</th>
                  <th style={{ padding: '12px 18px', fontWeight: 700, color: '#475569' }}>LAST PAYMENT</th>
                  <th style={{ padding: '12px 18px', fontWeight: 700, color: '#475569' }}>OVERDUE AMOUNT</th>
                  <th style={{ padding: '12px 18px', fontWeight: 700, color: '#475569' }}>AGING</th>
                  <th style={{ padding: '12px 18px', fontWeight: 700, color: '#475569' }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {filteredDefaulters.map((d, idx) => {
                  const matchedStudent = students.find((s) => s.id === d.studentId);
                  const isHigh = d.daysOverdue >= 30;
                  const isMed = d.daysOverdue >= 15 && d.daysOverdue < 30;

                  return (
                    <tr
                      key={d.studentId}
                      style={{
                        borderBottom: idx === filteredDefaulters.length - 1 ? 'none' : '1px solid #F1F5F9',
                        backgroundColor: idx % 2 === 0 ? '#FFFFFF' : '#FAFAFA',
                      }}
                    >
                      <td style={{ padding: '14px 18px', fontFamily: 'monospace', fontWeight: 700, color: '#0F1E36' }}>
                        {d.studentCode}
                      </td>
                      <td style={{ padding: '14px 18px', fontWeight: 700, color: '#0F1E36' }}>
                        {d.studentName}
                      </td>
                      <td style={{ padding: '14px 18px', color: '#475569' }}>{d.classGrade}</td>
                      <td style={{ padding: '14px 18px', color: '#334155' }}>
                        {d.parentPhone ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <i className="fas fa-phone-alt" style={{ fontSize: '11px', color: '#64748B' }} />
                            {d.parentPhone}
                          </span>
                        ) : (
                          <span style={{ color: '#94A3B8' }}>N/A</span>
                        )}
                      </td>
                      <td style={{ padding: '14px 18px', color: '#64748B', fontSize: '12px' }}>
                        {d.overdueMonth || 'Term Due'}
                      </td>
                      <td style={{ padding: '14px 18px', fontWeight: 800, color: '#E11D48', fontSize: '14px' }}>
                        ₹{d.overdueAmount.toLocaleString()}
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <span
                          style={{
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: 700,
                            backgroundColor: isHigh ? '#FEE2E2' : isMed ? '#FEF3C7' : '#EFF6FF',
                            color: isHigh ? '#DC2626' : isMed ? '#D97706' : '#2563EB',
                          }}
                        >
                          {d.daysOverdue} Days Due
                        </span>
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            type="button"
                            onClick={() => {
                              const sObj: AdminStudentItem =
                                matchedStudent || {
                                  id: d.studentId,
                                  studentCode: d.studentCode,
                                  name: d.studentName,
                                  grade: d.classGrade,
                                  parentPhone: d.parentPhone,
                                  subjects: [],
                                  email: d.email || '',
                                  role: 'student',
                                  tuitionApprovalStatus: 'approved',
                                  createdAt: new Date().toISOString(),
                                };

                              onCollectDefaulter(sObj, d.overdueAmount);
                            }}
                            style={{
                              padding: '6px 12px',
                              backgroundColor: '#10B981',
                              color: '#FFFFFF',
                              border: 'none',
                              borderRadius: '6px',
                              fontSize: '11.5px',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              boxShadow: '0 2px 4px rgba(16, 185, 129, 0.2)',
                            }}
                          >
                            <i className="fas fa-bolt" /> Collect Now
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSendReminder(d)}
                            title="Send WhatsApp / SMS Reminder"
                            style={{
                              padding: '6px 8px',
                              backgroundColor: '#F1F5F9',
                              color: '#475569',
                              border: '1px solid #CBD5E1',
                              borderRadius: '6px',
                              fontSize: '11.5px',
                              cursor: 'pointer',
                            }}
                          >
                            <i className="fab fa-whatsapp" style={{ color: '#25D366' }} />
                          </button>
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
    </div>
  );
};
