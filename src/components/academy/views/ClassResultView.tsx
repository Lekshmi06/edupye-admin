import React, { useState, useEffect, useCallback } from 'react';
import {
  tuitionAdminService,
  type StudentProgressItem,
  type StudentProgressResponse,
  type AdminTuitionProgram,
} from '../../../services/tuitionAdmin.service';
import { useToast } from '../../../hooks/useToast';
import { Loader } from '../../common/Loader';

interface ClassResultViewProps {
  programs: AdminTuitionProgram[];
  academicSession: string;
}

export const ClassResultView: React.FC<ClassResultViewProps> = ({
  programs,
  academicSession,
}) => {
  const { showToast } = useToast();
  const [selectedProgramId, setSelectedProgramId] = useState<string>(programs[0]?.id || '');
  const [progressData, setProgressData] = useState<StudentProgressResponse | null>(null);
  const [loading, setLoading] = useState(false);

  // Parent Progress Report Modal State
  const [selectedStudentReport, setSelectedStudentReport] = useState<StudentProgressItem | null>(null);

  const loadProgress = useCallback(async (progId: string) => {
    if (!progId) return;
    try {
      setLoading(true);
      const data = await tuitionAdminService.getStudentProgress(progId, academicSession);
      setProgressData(data);
    } catch (err: any) {
      showToast(err.message || 'Failed to fetch batch progress', 'error');
    } finally {
      setLoading(false);
    }
  }, [academicSession, showToast]);

  useEffect(() => {
    if (programs.length > 0) {
      const targetId = selectedProgramId || programs[0]?.id || '';
      if (targetId) {
        setSelectedProgramId(targetId);
        loadProgress(targetId);
      }
    }
  }, [programs, loadProgress, selectedProgramId]);

  const students = progressData?.studentsProgress || [];

  const getPerformanceGrade = (pct: number) => {
    if (pct >= 90) return { grade: 'A+', color: '#059669', label: 'Outstanding' };
    if (pct >= 80) return { grade: 'A', color: '#10B981', label: 'Excellent' };
    if (pct >= 70) return { grade: 'B+', color: '#2563EB', label: 'Very Good' };
    if (pct >= 60) return { grade: 'B', color: '#6366F1', label: 'Good' };
    if (pct >= 50) return { grade: 'C', color: '#D97706', label: 'Average' };
    return { grade: 'D', color: '#DC2626', label: 'Needs Improvement' };
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
                backgroundColor: '#EFF6FF',
                color: '#2563EB',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 800,
                letterSpacing: '0.04em',
              }}
            >
              STUDENT PROGRESS & REPORT CARDS
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
            Batch Leaderboard & Parent Progress Reports
          </h2>
          <p style={{ margin: 0, fontSize: '13px', color: '#64748B' }}>
            Consolidated tuition assessments, topic test marks, attendance rates, and one-click Parent Progress Reports.
          </p>
        </div>

        {/* Batch Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#475569' }}>Select Batch:</span>
          <select
            value={selectedProgramId}
            onChange={(e) => {
              setSelectedProgramId(e.target.value);
              loadProgress(e.target.value);
            }}
            style={{
              padding: '9px 14px',
              borderRadius: '8px',
              border: '1px solid #CBD5E1',
              fontSize: '13px',
              fontWeight: 600,
              backgroundColor: '#FFFFFF',
              outline: 'none',
              maxWidth: '300px',
            }}
          >
            {programs.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title} &bull; {p.subject} ({p.grade})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 2. Leaderboard Table */}
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
            Batch Standings &bull; {progressData?.program.title || 'All Enrolled Students'}
          </span>
          <button
            type="button"
            onClick={() => loadProgress(selectedProgramId)}
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
            <i className="fas fa-sync-alt" /> Refresh Progress
          </button>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
            <Loader />
          </div>
        ) : students.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px 20px' }}>
            <i className="fas fa-user-graduate" style={{ fontSize: '32px', color: '#94A3B8', marginBottom: '10px' }} />
            <h4 style={{ margin: '0 0 4px', fontSize: '15px', color: '#0F1E36' }}>No student records found in this batch</h4>
            <p style={{ margin: 0, fontSize: '13px', color: '#64748B' }}>
              Ensure students are assigned to this tuition batch and tests have been scheduled.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                  <th style={{ padding: '12px 18px', fontWeight: 700, color: '#475569' }}>RANK</th>
                  <th style={{ padding: '12px 18px', fontWeight: 700, color: '#475569' }}>STUDENT NAME</th>
                  <th style={{ padding: '12px 18px', fontWeight: 700, color: '#475569' }}>TESTS APPEARED</th>
                  <th style={{ padding: '12px 18px', fontWeight: 700, color: '#475569' }}>MARKS EARNED</th>
                  <th style={{ padding: '12px 18px', fontWeight: 700, color: '#475569' }}>ACADEMIC %</th>
                  <th style={{ padding: '12px 18px', fontWeight: 700, color: '#475569' }}>ATTENDANCE</th>
                  <th style={{ padding: '12px 18px', fontWeight: 700, color: '#475569' }}>QUOTA USED</th>
                  <th style={{ padding: '12px 18px', fontWeight: 700, color: '#475569' }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {students.map((st, idx) => {
                  const gradeInfo = getPerformanceGrade(st.overallAcademicPercentage);
                  const isTop3 = (st.rank || idx + 1) <= 3;

                  return (
                    <tr
                      key={st.studentId}
                      style={{
                        borderBottom: idx === students.length - 1 ? 'none' : '1px solid #F1F5F9',
                        backgroundColor: idx % 2 === 0 ? '#FFFFFF' : '#FAFAFA',
                      }}
                    >
                      <td style={{ padding: '14px 18px' }}>
                        <div
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            backgroundColor: isTop3 ? '#FEF3C7' : '#F1F5F9',
                            color: isTop3 ? '#D97706' : '#64748B',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 800,
                            fontSize: '12px',
                          }}
                        >
                          {st.rank || idx + 1}
                        </div>
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ fontWeight: 700, color: '#0F1E36' }}>{st.studentName}</div>
                        <div style={{ fontSize: '11px', color: '#64748B', fontFamily: 'monospace' }}>
                          {st.studentCode}
                        </div>
                      </td>
                      <td style={{ padding: '14px 18px', color: '#334155' }}>
                        {st.testsAppeared} Tests {st.testsAbsent > 0 && <span style={{ color: '#E11D48' }}>({st.testsAbsent} absent)</span>}
                      </td>
                      <td style={{ padding: '14px 18px', fontWeight: 700, color: '#0F1E36' }}>
                        {st.totalMarksEarned} / {st.totalMaxMarks}
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '14px', fontWeight: 800, color: gradeInfo.color }}>
                            {st.overallAcademicPercentage}%
                          </span>
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: 700,
                              padding: '2px 6px',
                              borderRadius: '4px',
                              backgroundColor: `${gradeInfo.color}15`,
                              color: gradeInfo.color,
                            }}
                          >
                            {gradeInfo.grade}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <span
                          style={{
                            fontWeight: 700,
                            color: st.attendancePercentage >= 80 ? '#059669' : '#D97706',
                          }}
                        >
                          {st.attendancePercentage}%
                        </span>
                        <div style={{ fontSize: '11px', color: '#64748B' }}>
                          {st.sessionsPresent} / {st.totalScheduledSessions} Sessions
                        </div>
                      </td>
                      <td style={{ padding: '14px 18px', color: '#4B5563', fontWeight: 600 }}>
                        {st.quotaConsumed} Quota Consumed
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <button
                          type="button"
                          onClick={() => setSelectedStudentReport(st)}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#0F1E36',
                            color: '#FFFFFF',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '11.5px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                          }}
                        >
                          <i className="fas fa-file-invoice" /> Parent Report
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

      {/* 3. Parent Progress Report Modal */}
      {selectedStudentReport && (
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
          onClick={() => setSelectedStudentReport(null)}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '680px',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '28px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
              display: 'flex',
              flexDirection: 'column',
              gap: '18px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header & Brand */}
            <div style={{ borderBottom: '2px solid #0F1E36', paddingBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
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
                <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#0F1E36' }}>
                  Student Progress & Performance Report
                </h3>
                <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748B' }}>
                  Academic Session {academicSession} &bull; Official Tuition Center Evaluation
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedStudentReport(null)}
                style={{ background: 'none', border: 'none', color: '#94A3B8', fontSize: '18px', cursor: 'pointer' }}
              >
                <i className="fas fa-times" />
              </button>
            </div>

            {/* Student Info Card */}
            <div
              style={{
                backgroundColor: '#F8FAFC',
                borderRadius: '12px',
                padding: '16px 20px',
                border: '1px solid #E2E8F0',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '12px',
                fontSize: '13px',
              }}
            >
              <div>
                <span style={{ color: '#64748B', display: 'block', fontSize: '11.5px' }}>Student Name:</span>
                <strong style={{ color: '#0F1E36', fontSize: '14px' }}>{selectedStudentReport.studentName}</strong>
              </div>
              <div>
                <span style={{ color: '#64748B', display: 'block', fontSize: '11.5px' }}>Student ID:</span>
                <strong style={{ fontFamily: 'monospace', color: '#2563EB' }}>{selectedStudentReport.studentCode}</strong>
              </div>
              <div>
                <span style={{ color: '#64748B', display: 'block', fontSize: '11.5px' }}>Batch / Class:</span>
                <strong style={{ color: '#0F1E36' }}>{progressData?.program.title} ({selectedStudentReport.grade})</strong>
              </div>
              <div>
                <span style={{ color: '#64748B', display: 'block', fontSize: '11.5px' }}>Class Standing:</span>
                <strong style={{ color: '#D97706' }}>Rank #{selectedStudentReport.rank}</strong>
              </div>
            </div>

            {/* Performance Overview Banner */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div
                style={{
                  backgroundColor: '#EFF6FF',
                  border: '1px solid #BFDBFE',
                  borderRadius: '10px',
                  padding: '14px',
                  textAlign: 'center',
                }}
              >
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#1E40AF', textTransform: 'uppercase' }}>
                  Overall Academic Score
                </span>
                <div style={{ fontSize: '26px', fontWeight: 800, color: '#1E40AF', marginTop: '2px' }}>
                  {selectedStudentReport.overallAcademicPercentage}%
                </div>
                <div style={{ fontSize: '11.5px', color: '#3B82F6', marginTop: '2px', fontWeight: 600 }}>
                  Grade: {getPerformanceGrade(selectedStudentReport.overallAcademicPercentage).grade} &bull;{' '}
                  {getPerformanceGrade(selectedStudentReport.overallAcademicPercentage).label}
                </div>
              </div>

              <div
                style={{
                  backgroundColor: '#ECFDF5',
                  border: '1px solid #A7F3D0',
                  borderRadius: '10px',
                  padding: '14px',
                  textAlign: 'center',
                }}
              >
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#065F46', textTransform: 'uppercase' }}>
                  Session Attendance
                </span>
                <div style={{ fontSize: '26px', fontWeight: 800, color: '#065F46', marginTop: '2px' }}>
                  {selectedStudentReport.attendancePercentage}%
                </div>
                <div style={{ fontSize: '11.5px', color: '#059669', marginTop: '2px', fontWeight: 600 }}>
                  {selectedStudentReport.sessionsPresent} Attended / {selectedStudentReport.totalScheduledSessions} Scheduled
                </div>
              </div>
            </div>

            {/* Detailed Assessments Table */}
            <div>
              <h4 style={{ margin: '0 0 8px', fontSize: '14px', fontWeight: 800, color: '#0F1E36' }}>
                Topic & Chapter Test Breakdown
              </h4>
              <div style={{ border: '1px solid #E2E8F0', borderRadius: '8px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12.5px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                      <th style={{ padding: '8px 12px', fontWeight: 700, color: '#475569' }}>TEST TITLE</th>
                      <th style={{ padding: '8px 12px', fontWeight: 700, color: '#475569' }}>TYPE</th>
                      <th style={{ padding: '8px 12px', fontWeight: 700, color: '#475569' }}>DATE</th>
                      <th style={{ padding: '8px 12px', fontWeight: 700, color: '#475569' }}>MARKS</th>
                      <th style={{ padding: '8px 12px', fontWeight: 700, color: '#475569' }}>% SCORE</th>
                      <th style={{ padding: '8px 12px', fontWeight: 700, color: '#475569' }}>STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(selectedStudentReport.examDetails || []).map((ex) => (
                      <tr key={ex.examId} style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '9px 12px', fontWeight: 600, color: '#0F1E36' }}>{ex.title}</td>
                        <td style={{ padding: '9px 12px', color: '#64748B' }}>{ex.testType}</td>
                        <td style={{ padding: '9px 12px', color: '#64748B' }}>{ex.date}</td>
                        <td style={{ padding: '9px 12px', fontWeight: 700, color: '#0F1E36' }}>
                          {ex.isAbsent ? 'Absent' : `${ex.marksObtained} / ${ex.maxMarks}`}
                        </td>
                        <td style={{ padding: '9px 12px', fontWeight: 700 }}>
                          {ex.isAbsent ? '--' : `${ex.percentage}%`}
                        </td>
                        <td style={{ padding: '9px 12px' }}>
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: 700,
                              padding: '2px 6px',
                              borderRadius: '4px',
                              backgroundColor: ex.isAbsent ? '#FEE2E2' : ex.status === 'Passed' ? '#ECFDF5' : '#FEF3C7',
                              color: ex.isAbsent ? '#DC2626' : ex.status === 'Passed' ? '#059669' : '#D97706',
                            }}
                          >
                            {ex.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Signatures & Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1px solid #E2E8F0', paddingTop: '16px' }}>
              <div style={{ fontSize: '12px', color: '#64748B' }}>
                <div style={{ borderBottom: '1px solid #CBD5E1', width: '160px', height: '24px', marginBottom: '4px' }} />
                <span>Academic Director / Tutor Signature</span>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => window.print()}
                  style={{
                    padding: '9px 18px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: '#2563EB',
                    color: '#FFFFFF',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <i className="fas fa-print" /> Print Report Card
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedStudentReport(null)}
                  style={{
                    padding: '9px 16px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    backgroundColor: '#FFFFFF',
                    color: '#334155',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
