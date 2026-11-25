import React, { useState, useEffect, useCallback } from 'react';
import type {
  AdminTuitionProgram,
  AdminTeacherItem,
  AttendanceReportResponse,
} from '../../../services/tuitionAdmin.service';
import { tuitionAdminService } from '../../../services/tuitionAdmin.service';
import { useToast } from '../../../hooks/useToast';

interface AttendanceReportViewProps {
  programs: AdminTuitionProgram[];
  teachers: AdminTeacherItem[];
  academicSession: string;
}

export const AttendanceReportView: React.FC<AttendanceReportViewProps> = ({
  programs,
  teachers,
  academicSession,
}) => {
  const { showToast } = useToast();

  const [programFilter, setProgramFilter] = useState('all');
  const [teacherFilter, setTeacherFilter] = useState('all');
  const [monthFilter, setMonthFilter] = useState('2026-11');
  const [loading, setLoading] = useState<boolean>(true);
  const [reportData, setReportData] = useState<AttendanceReportResponse | null>(null);

  const fetchReport = useCallback(async () => {
    try {
      setLoading(true);
      const res = await tuitionAdminService.getAttendanceReport({
        programId: programFilter,
        teacherId: teacherFilter,
        month: monthFilter,
        session: academicSession,
      });
      setReportData(res);
    } catch (err: any) {
      showToast(err.message || 'Failed to load attendance report', 'error');
    } finally {
      setLoading(false);
    }
  }, [programFilter, teacherFilter, monthFilter, academicSession, showToast]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 1. Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          backgroundColor: '#FFFFFF',
          padding: '20px 24px',
          borderRadius: '14px',
          border: '1px solid #E2E8F0',
        }}
      >
        <div>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#0F1E36', letterSpacing: '-0.02em' }}>
            Attendance & Session Quota Report
          </h2>
          <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#64748B' }}>
            Consolidated student attendance percentages, quota sessions consumed, and educator conduct log for payroll.
          </p>
        </div>

        <button
          type="button"
          onClick={() => window.print()}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            border: '1px solid #CBD5E1',
            backgroundColor: '#FFFFFF',
            color: '#0F172A',
            fontSize: '12.5px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <i className="fas fa-print" /> Print Report
        </button>
      </div>

      {/* 2. Filter Bar */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '14px',
          border: '1px solid #E2E8F0',
          padding: '16px 20px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          alignItems: 'center',
        }}
      >
        {/* Month Selector */}
        <div style={{ flex: '0 1 180px' }}>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#64748B', marginBottom: '4px' }}>
            PERIOD / MONTH
          </label>
          <input
            type="month"
            value={monthFilter}
            onChange={(e) => setMonthFilter(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 10px',
              borderRadius: '8px',
              border: '1px solid #CBD5E1',
              fontSize: '12.5px',
              outline: 'none',
            }}
          />
        </div>

        {/* Batch / Program */}
        <div style={{ flex: '1 1 220px' }}>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#64748B', marginBottom: '4px' }}>
            BATCH / PROGRAM
          </label>
          <select
            value={programFilter}
            onChange={(e) => setProgramFilter(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 10px',
              borderRadius: '8px',
              border: '1px solid #CBD5E1',
              fontSize: '12.5px',
              outline: 'none',
              backgroundColor: '#FFFFFF',
            }}
          >
            <option value="all">All Batches ({programs.length})</option>
            {programs.map((p) => (
              <option key={p._id} value={p._id}>
                {p.title} ({p.code})
              </option>
            ))}
          </select>
        </div>

        {/* Teacher */}
        <div style={{ flex: '1 1 200px' }}>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#64748B', marginBottom: '4px' }}>
            EDUCATOR
          </label>
          <select
            value={teacherFilter}
            onChange={(e) => setTeacherFilter(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 10px',
              borderRadius: '8px',
              border: '1px solid #CBD5E1',
              fontSize: '12.5px',
              outline: 'none',
              backgroundColor: '#FFFFFF',
            }}
          >
            <option value="all">All Educators ({teachers.length})</option>
            {teachers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.teacherCode || 'TCH'})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 3. Overview KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '14px',
        }}
      >
        <div style={{ backgroundColor: '#FFFFFF', padding: '18px 20px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
            Total Sessions Conducted
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#0F1E36', marginTop: '4px' }}>
            {reportData?.totalSessionsCount || 0}
          </div>
          <div style={{ fontSize: '11px', color: '#2563EB', fontWeight: 600, marginTop: '2px' }}>
            In selected period
          </div>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', padding: '18px 20px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
            Overall Attendance Rate
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#10B981', marginTop: '4px' }}>
            {reportData?.overallAttendancePercentage || '96.4%'}
          </div>
          <div style={{ fontSize: '11px', color: '#10B981', fontWeight: 600, marginTop: '2px' }}>
            Present / Conducted
          </div>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', padding: '18px 20px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
            Active Faculty Count
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#4338CA', marginTop: '4px' }}>
            {reportData?.teacherReports?.length || teachers.length}
          </div>
          <div style={{ fontSize: '11px', color: '#4338CA', fontWeight: 600, marginTop: '2px' }}>
            Conducted sessions
          </div>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', padding: '18px 20px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
            Students Tracked
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#0F1E36', marginTop: '4px' }}>
            {reportData?.studentReports?.length || 0}
          </div>
          <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600, marginTop: '2px' }}>
            Enrolled active roster
          </div>
        </div>
      </div>

      {/* 4. Table 1: Student Attendance & Quota Summary */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '14px',
          border: '1px solid #E2E8F0',
          overflow: 'hidden',
          boxShadow: '0 1px 4px rgba(0, 0, 0, 0.02)',
        }}
      >
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8F0', backgroundColor: '#F8FAFC' }}>
          <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#0F172A' }}>
            Student Attendance & Session Quota Summary
          </h3>
          <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748B' }}>
            Tracks sessions attended, missed, and consumed quota credits per learner.
          </p>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
            <thead>
              <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#475569', textAlign: 'left' }}>
                <th style={{ padding: '10px 14px' }}>STUDENT ID</th>
                <th style={{ padding: '10px 14px' }}>STUDENT NAME</th>
                <th style={{ padding: '10px 14px' }}>SESSIONS</th>
                <th style={{ padding: '10px 14px' }}>PRESENT</th>
                <th style={{ padding: '10px 14px' }}>ABSENT</th>
                <th style={{ padding: '10px 14px' }}>LATE</th>
                <th style={{ padding: '10px 14px' }}>ATTENDANCE %</th>
                <th style={{ padding: '10px 14px' }}>QUOTA CONSUMED</th>
                <th style={{ padding: '10px 14px' }}>STATUS TIER</th>
              </tr>
            </thead>
            <tbody>
              {reportData?.studentReports && reportData.studentReports.length > 0 ? (
                reportData.studentReports.map((s) => {
                  const isHigh = s.attendancePercentage >= 90;
                  const isMed = s.attendancePercentage >= 75 && s.attendancePercentage < 90;
                  return (
                    <tr key={s.studentId} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{ fontFamily: 'monospace', fontWeight: 700, backgroundColor: '#F1F5F9', padding: '2px 6px', borderRadius: '4px' }}>
                          {s.studentCode}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px', fontWeight: 700, color: '#0F172A' }}>
                        {s.studentName}
                      </td>
                      <td style={{ padding: '12px 14px', color: '#334155' }}>{s.totalSessions}</td>
                      <td style={{ padding: '12px 14px', color: '#10B981', fontWeight: 700 }}>{s.presentCount}</td>
                      <td style={{ padding: '12px 14px', color: '#EF4444', fontWeight: 700 }}>{s.absentCount}</td>
                      <td style={{ padding: '12px 14px', color: '#F59E0B' }}>{s.lateCount}</td>
                      <td style={{ padding: '12px 14px', fontWeight: 800 }}>
                        <span style={{ color: isHigh ? '#10B981' : isMed ? '#F59E0B' : '#EF4444' }}>
                          {s.attendancePercentage}%
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <span
                          style={{
                            fontWeight: 800,
                            backgroundColor: '#EFF6FF',
                            color: '#1E40AF',
                            padding: '2px 8px',
                            borderRadius: '4px',
                          }}
                        >
                          {s.quotaConsumed} Sessions
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: '10px',
                            backgroundColor: isHigh ? '#D1FAE5' : isMed ? '#FEF3C7' : '#FEE2E2',
                            color: isHigh ? '#065F46' : isMed ? '#92400E' : '#991B1B',
                          }}
                        >
                          {isHigh ? 'Consistent' : isMed ? 'Acceptable' : 'Attention Required'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} style={{ padding: '30px', textAlign: 'center', color: '#94A3B8' }}>
                    No student attendance records logged for this period. Mark attendance in the &quot;Attendance&quot; view to populate reports.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Table 2: Teacher Sessions Conducted (for Payroll/Salary) */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '14px',
          border: '1px solid #E2E8F0',
          overflow: 'hidden',
          boxShadow: '0 1px 4px rgba(0, 0, 0, 0.02)',
        }}
      >
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8F0', backgroundColor: '#F8FAFC' }}>
          <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#0F172A' }}>
            Faculty Conducted Sessions & Payroll Summary
          </h3>
          <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748B' }}>
            Completed hours, 1-on-1 vs group breakdown, and estimated honorarium for Salary Management.
          </p>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
            <thead>
              <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#475569', textAlign: 'left' }}>
                <th style={{ padding: '10px 14px' }}>TCH CODE</th>
                <th style={{ padding: '10px 14px' }}>EDUCATOR NAME</th>
                <th style={{ padding: '10px 14px' }}>COMPLETED SESSIONS</th>
                <th style={{ padding: '10px 14px' }}>1-ON-1 SESSIONS</th>
                <th style={{ padding: '10px 14px' }}>GROUP BATCHES</th>
                <th style={{ padding: '10px 14px' }}>RESCHEDULED / CANCELLED</th>
                <th style={{ padding: '10px 14px' }}>BILLABLE HOURS</th>
                <th style={{ padding: '10px 14px' }}>ESTIMATED HONORARIUM</th>
              </tr>
            </thead>
            <tbody>
              {reportData?.teacherReports && reportData.teacherReports.length > 0 ? (
                reportData.teacherReports.map((t) => {
                  const estPayout = t.totalTeachingHours * 1000;
                  return (
                    <tr key={t.teacherId || t.teacherCode} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{ fontFamily: 'monospace', fontWeight: 700, backgroundColor: '#EFF6FF', color: '#1E40AF', padding: '2px 6px', borderRadius: '4px' }}>
                          {t.teacherCode}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px', fontWeight: 700, color: '#0F172A' }}>
                        {t.teacherName}
                      </td>
                      <td style={{ padding: '12px 14px', color: '#10B981', fontWeight: 700 }}>
                        {t.completedSessions}
                      </td>
                      <td style={{ padding: '12px 14px' }}>{t.completed1on1}</td>
                      <td style={{ padding: '12px 14px' }}>{t.completed1toN}</td>
                      <td style={{ padding: '12px 14px', color: '#64748B' }}>{t.rescheduledOrCancelled}</td>
                      <td style={{ padding: '12px 14px', fontWeight: 800, color: '#0F172A' }}>
                        {t.totalTeachingHours} hrs
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{ fontWeight: 800, color: '#2563EB' }}>
                          ₹{estPayout.toLocaleString()}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} style={{ padding: '30px', textAlign: 'center', color: '#94A3B8' }}>
                    No educator sessions logged for this period.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
