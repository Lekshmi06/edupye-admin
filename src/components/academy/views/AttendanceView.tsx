import React, { useState, useEffect, useCallback } from 'react';
import type {
  AdminTuitionProgram,
  AdminTeacherItem,
  AcademyAttendanceSessionItem,
  StudentAttendanceRecordItem,
} from '../../../services/tuitionAdmin.service';
import { tuitionAdminService } from '../../../services/tuitionAdmin.service';
import { useToast } from '../../../hooks/useToast';

interface AttendanceViewProps {
  programs: AdminTuitionProgram[];
  teachers: AdminTeacherItem[];
  academicSession: string;
}

export const AttendanceView: React.FC<AttendanceViewProps> = ({
  programs,
  teachers,
  academicSession,
}) => {
  const { showToast } = useToast();

  const [selectedProgramId, setSelectedProgramId] = useState<string>(programs[0]?._id || '');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('17:00 - 18:00');
  const [sessionOutcome, setSessionOutcome] = useState<'Completed' | 'Rescheduled' | 'Cancelled'>('Completed');
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);

  // Active Session State
  const [currentSession, setCurrentSession] = useState<AcademyAttendanceSessionItem | null>(null);
  const [isExisting, setIsExisting] = useState<boolean>(false);
  const [teacherId, setTeacherId] = useState<string>('');

  // Selected Program Object
  const currentProgram = programs.find((p) => p._id === selectedProgramId) || programs[0];

  const fetchAttendance = useCallback(async () => {
    if (!selectedProgramId) return;
    try {
      setLoading(true);
      const res = await tuitionAdminService.getAttendance(selectedProgramId, selectedDate, selectedTimeSlot);
      if (res.isExisting && res.attendance) {
        setCurrentSession(res.attendance);
        setSessionOutcome(res.attendance.sessionOutcome || 'Completed');
        setTeacherId(res.attendance.teacherId);
        setIsExisting(true);
      } else if (res.prefill) {
        setCurrentSession(res.prefill);
        setSessionOutcome(res.prefill.sessionOutcome || 'Completed');
        setTeacherId(res.prefill.teacherId || teachers[0]?.id || '');
        setIsExisting(false);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to load session attendance', 'error');
    } finally {
      setLoading(false);
    }
  }, [selectedProgramId, selectedDate, selectedTimeSlot, teachers, showToast]);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  // Update a single student's status or quota
  const handleUpdateRecord = (
    studentId: string,
    updates: Partial<StudentAttendanceRecordItem>
  ) => {
    if (!currentSession) return;
    const updatedRecords = currentSession.records.map((r) => {
      if (r.studentId === studentId) {
        return { ...r, ...updates };
      }
      return r;
    });
    setCurrentSession({
      ...currentSession,
      records: updatedRecords,
    });
  };

  // Mark all students Present (for 1-to-N batch)
  const handleMarkAll = (status: 'Present' | 'Absent') => {
    if (!currentSession) return;
    const updated = currentSession.records.map((r) => ({
      ...r,
      status,
      countTowardsQuota: status === 'Present',
    }));
    setCurrentSession({ ...currentSession, records: updated });
    showToast(`Marked all students ${status}`, 'info');
  };

  // Save Attendance to Backend
  const handleSave = async () => {
    if (!currentSession) return;
    try {
      setSaving(true);
      const assignedTeacher = teachers.find((t) => t.id === teacherId) || teachers[0];
      const payload: Partial<AcademyAttendanceSessionItem> = {
        programId: selectedProgramId,
        programTitle: currentProgram?.title || currentSession.programTitle,
        sessionType: currentSession.sessionType,
        teacherId: assignedTeacher?.id || teacherId,
        teacherCode: assignedTeacher?.teacherCode || currentSession.teacherCode || 'TCH-GEN',
        teacherName: assignedTeacher?.name || currentSession.teacherName || 'Assigned Faculty',
        date: selectedDate,
        timeSlot: selectedTimeSlot,
        sessionOutcome,
        source: 'Manual',
        session: academicSession,
        records: currentSession.records,
      };

      const res = await tuitionAdminService.saveAttendance(payload);
      showToast(res.message || 'Session attendance saved successfully!', 'success');
      setIsExisting(true);
      setCurrentSession(res.attendance);
    } catch (err: any) {
      showToast(err.message || 'Failed to save attendance', 'error');
    } finally {
      setSaving(false);
    }
  };

  const isOneOnOne = currentSession?.sessionType === '1-on-1';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 1. Header & Controls */}
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
          boxShadow: '0 1px 4px rgba(0, 0, 0, 0.02)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#0F1E36', letterSpacing: '-0.02em' }}>
              Tuition Attendance Studio
            </h2>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 800,
                padding: '3px 10px',
                borderRadius: '12px',
                backgroundColor: isOneOnOne ? '#EEF2FF' : '#EFF6FF',
                color: isOneOnOne ? '#4338CA' : '#1D4ED8',
                border: isOneOnOne ? '1px solid #C7D2FE' : '1px solid #BFDBFE',
              }}
            >
              <i className={`fas ${isOneOnOne ? 'fa-user' : 'fa-users'}`} style={{ marginRight: '5px' }} />
              {isOneOnOne ? '1-on-1 Personal Tuition' : '1-to-N Group Batch'}
            </span>
          </div>
          <p style={{ margin: '3px 0 0', fontSize: '13px', color: '#64748B' }}>
            Tuition session verification, quota session deduction, and educator conduct logging.
          </p>
        </div>

        {/* Existing Status Pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {isExisting ? (
            <span
              style={{
                fontSize: '12px',
                fontWeight: 700,
                color: '#065F46',
                backgroundColor: '#D1FAE5',
                padding: '6px 12px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <i className="fas fa-check-double" /> Verified & Saved Record
            </span>
          ) : (
            <span
              style={{
                fontSize: '12px',
                fontWeight: 700,
                color: '#92400E',
                backgroundColor: '#FEF3C7',
                padding: '6px 12px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <i className="fas fa-pencil-alt" /> New / Draft Session
            </span>
          )}
        </div>
      </div>

      {/* 2. Selection Parameters Bar */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '14px',
          border: '1px solid #E2E8F0',
          padding: '18px 24px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '14px',
          alignItems: 'center',
        }}
      >
        {/* Program / Batch */}
        <div>
          <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#475569', marginBottom: '5px' }}>
            SELECT TUITION PROGRAM / BATCH
          </label>
          <select
            value={selectedProgramId}
            onChange={(e) => setSelectedProgramId(e.target.value)}
            style={{
              width: '100%',
              padding: '9px 12px',
              borderRadius: '8px',
              border: '1px solid #CBD5E1',
              fontSize: '13px',
              fontWeight: 600,
              color: '#0F172A',
              backgroundColor: '#FFFFFF',
              outline: 'none',
            }}
          >
            {programs.map((p) => {
              const count = p.enrolledStudentIds?.length || 0;
              const isP1 = count === 1;
              return (
                <option key={p._id} value={p._id}>
                  {p.title} ({p.code}) &bull; {isP1 ? '1-on-1' : `${count} Students`}
                </option>
              );
            })}
          </select>
        </div>

        {/* Assigned Faculty */}
        <div>
          <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#475569', marginBottom: '5px' }}>
            EDUCATOR IN-CHARGE
          </label>
          <select
            value={teacherId}
            onChange={(e) => setTeacherId(e.target.value)}
            style={{
              width: '100%',
              padding: '9px 12px',
              borderRadius: '8px',
              border: '1px solid #CBD5E1',
              fontSize: '13px',
              fontWeight: 600,
              color: '#0F172A',
              backgroundColor: '#FFFFFF',
              outline: 'none',
            }}
          >
            {teachers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.teacherCode || 'TCH'})
              </option>
            ))}
          </select>
        </div>

        {/* Date Selector */}
        <div>
          <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#475569', marginBottom: '5px' }}>
            SESSION DATE
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid #CBD5E1',
              fontSize: '13px',
              outline: 'none',
            }}
          />
        </div>

        {/* Time Slot */}
        <div>
          <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#475569', marginBottom: '5px' }}>
            TIME SLOT
          </label>
          <input
            type="text"
            placeholder="e.g. 17:00 - 18:00"
            value={selectedTimeSlot}
            onChange={(e) => setSelectedTimeSlot(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid #CBD5E1',
              fontSize: '13px',
              outline: 'none',
            }}
          />
        </div>

        {/* Session Outcome */}
        <div>
          <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#475569', marginBottom: '5px' }}>
            SESSION OUTCOME
          </label>
          <select
            value={sessionOutcome}
            onChange={(e) => setSessionOutcome(e.target.value as any)}
            style={{
              width: '100%',
              padding: '9px 12px',
              borderRadius: '8px',
              border: '1px solid #CBD5E1',
              fontSize: '13px',
              fontWeight: 700,
              color: sessionOutcome === 'Completed' ? '#065F46' : sessionOutcome === 'Rescheduled' ? '#92400E' : '#991B1B',
              backgroundColor: sessionOutcome === 'Completed' ? '#D1FAE5' : sessionOutcome === 'Rescheduled' ? '#FEF3C7' : '#FEE2E2',
              outline: 'none',
            }}
          >
            <option value="Completed">Completed (Deduct Quota)</option>
            <option value="Rescheduled">Rescheduled (No Deduction)</option>
            <option value="Cancelled">Cancelled (No Deduction)</option>
          </select>
        </div>
      </div>

      {/* 3. Main Attendance Marking Area */}
      {loading ? (
        <div style={{ backgroundColor: '#FFFFFF', padding: '60px', borderRadius: '14px', textAlign: 'center', border: '1px solid #E2E8F0' }}>
          <i className="fas fa-spinner fa-spin" style={{ fontSize: '28px', color: '#2563EB', marginBottom: '12px' }} />
          <div style={{ fontSize: '14px', fontWeight: 600, color: '#64748B' }}>Fetching session attendance roster...</div>
        </div>
      ) : !currentSession || currentSession.records.length === 0 ? (
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '14px',
            border: '1px solid #E2E8F0',
            padding: '40px',
            textAlign: 'center',
          }}
        >
          <i className="fas fa-users-slash" style={{ fontSize: '36px', color: '#CBD5E1', marginBottom: '10px' }} />
          <h4 style={{ margin: '0 0 6px', fontSize: '16px', fontWeight: 800, color: '#0F172A' }}>
            No students enrolled in this batch yet.
          </h4>
          <p style={{ margin: 0, fontSize: '13px', color: '#64748B' }}>
            Please enroll students from the &quot;All Students&quot; or &quot;Class-Subject Map&quot; view.
          </p>
        </div>
      ) : isOneOnOne ? (
        /* 1-on-1 Personal Tuition Dedicated Card */
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: '2px solid #3B82F6',
            padding: '28px',
            boxShadow: '0 4px 20px rgba(37, 99, 235, 0.08)',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  backgroundColor: '#EFF6FF',
                  color: '#2563EB',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '22px',
                  fontWeight: 800,
                  border: '2px solid #BFDBFE',
                }}
              >
                {currentSession.records[0]?.studentName[0]?.toUpperCase() || 'S'}
              </div>
              <div>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    backgroundColor: '#EEF2FF',
                    color: '#4338CA',
                    padding: '2px 8px',
                    borderRadius: '10px',
                    textTransform: 'uppercase',
                  }}
                >
                  1-on-1 Private Learner
                </span>
                <h3 style={{ margin: '4px 0 2px', fontSize: '19px', fontWeight: 800, color: '#0F1E36' }}>
                  {currentSession.records[0]?.studentName}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#64748B' }}>
                  <span style={{ fontFamily: 'monospace', fontWeight: 700, backgroundColor: '#F1F5F9', padding: '1px 6px', borderRadius: '4px' }}>
                    {currentSession.records[0]?.studentCode}
                  </span>
                  <span>&bull; Batch: {currentProgram?.title}</span>
                </div>
              </div>
            </div>

            {/* Attendance Status Pills */}
            <div style={{ display: 'flex', gap: '8px' }}>
              {(['Present', 'Absent', 'Late', 'Excused'] as const).map((st) => {
                const isActive = currentSession.records[0]?.status === st;
                return (
                  <button
                    key={st}
                    type="button"
                    onClick={() =>
                      handleUpdateRecord(currentSession.records[0].studentId, {
                        status: st,
                        countTowardsQuota: st === 'Present' || st === 'Absent',
                      })
                    }
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      border: isActive ? 'none' : '1px solid #CBD5E1',
                      backgroundColor: isActive
                        ? st === 'Present'
                          ? '#10B981'
                          : st === 'Absent'
                          ? '#EF4444'
                          : st === 'Late'
                          ? '#F59E0B'
                          : '#6B7280'
                        : '#FFFFFF',
                      color: isActive ? '#FFFFFF' : '#334155',
                      fontSize: '12.5px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {st === 'Present' && <i className="fas fa-check" style={{ marginRight: '6px' }} />}
                    {st === 'Absent' && <i className="fas fa-times" style={{ marginRight: '6px' }} />}
                    {st}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quota Deduction & Notes */}
          <div
            style={{
              backgroundColor: '#F8FAFC',
              borderRadius: '12px',
              padding: '18px',
              border: '1px solid #E2E8F0',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '16px',
              alignItems: 'center',
            }}
          >
            {/* Quota Toggle */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input
                type="checkbox"
                id="quotaCheck"
                checked={currentSession.records[0]?.countTowardsQuota}
                onChange={(e) =>
                  handleUpdateRecord(currentSession.records[0].studentId, {
                    countTowardsQuota: e.target.checked,
                  })
                }
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <label htmlFor="quotaCheck" style={{ fontSize: '13px', fontWeight: 700, color: '#0F1E36', cursor: 'pointer' }}>
                Deduct 1 Session from Student Quota Package
              </label>
            </div>

            {/* Session Notes */}
            <div>
              <input
                type="text"
                placeholder="Topic covered or reason for absence/reschedule..."
                value={currentSession.records[0]?.remarks || ''}
                onChange={(e) =>
                  handleUpdateRecord(currentSession.records[0].studentId, {
                    remarks: e.target.value,
                  })
                }
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  fontSize: '12.5px',
                  outline: 'none',
                  backgroundColor: '#FFFFFF',
                }}
              />
            </div>
          </div>
        </div>
      ) : (
        /* 1-to-N Group Batch Attendance Table */
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '14px',
            border: '1px solid #E2E8F0',
            overflow: 'hidden',
            boxShadow: '0 1px 4px rgba(0, 0, 0, 0.02)',
          }}
        >
          {/* Quick Header Toolbar */}
          <div
            style={{
              padding: '14px 20px',
              backgroundColor: '#F8FAFC',
              borderBottom: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '10px',
            }}
          >
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>
              Enrolled Students Roster ({currentSession.records.length} students)
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => handleMarkAll('Present')}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: '1px solid #A7F3D0',
                  backgroundColor: '#ECFDF5',
                  color: '#065F46',
                  fontSize: '11.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Mark All Present
              </button>
              <button
                type="button"
                onClick={() => handleMarkAll('Absent')}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: '1px solid #FECACA',
                  backgroundColor: '#FEF2F2',
                  color: '#991B1B',
                  fontSize: '11.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Mark All Absent
              </button>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
              <thead>
                <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#64748B', textAlign: 'left' }}>
                  <th style={{ padding: '10px 14px', width: '40px' }}>#</th>
                  <th style={{ padding: '10px 14px' }}>STUDENT CODE</th>
                  <th style={{ padding: '10px 14px' }}>NAME</th>
                  <th style={{ padding: '10px 14px' }}>ATTENDANCE STATUS</th>
                  <th style={{ padding: '10px 14px' }}>COUNT IN QUOTA</th>
                  <th style={{ padding: '10px 14px' }}>REMARKS / NOTES</th>
                </tr>
              </thead>
              <tbody>
                {currentSession.records.map((rec, idx) => (
                  <tr
                    key={rec.studentId}
                    style={{ borderBottom: '1px solid #F1F5F9', transition: 'background-color 0.1s' }}
                  >
                    <td style={{ padding: '12px 14px', color: '#94A3B8', fontWeight: 600 }}>{idx + 1}</td>
                    <td style={{ padding: '12px 14px' }}>
                      <span
                        style={{
                          fontFamily: 'monospace',
                          fontWeight: 700,
                          backgroundColor: '#F1F5F9',
                          padding: '2px 6px',
                          borderRadius: '4px',
                        }}
                      >
                        {rec.studentCode}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px', fontWeight: 700, color: '#0F172A' }}>
                      {rec.studentName}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ display: 'inline-flex', gap: '4px' }}>
                        {(['Present', 'Absent', 'Late', 'Excused'] as const).map((st) => {
                          const isAct = rec.status === st;
                          return (
                            <button
                              key={st}
                              type="button"
                              onClick={() =>
                                handleUpdateRecord(rec.studentId, {
                                  status: st,
                                  countTowardsQuota: st === 'Present' || st === 'Absent',
                                })
                              }
                              style={{
                                padding: '4px 8px',
                                borderRadius: '4px',
                                border: 'none',
                                fontSize: '11px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                backgroundColor: isAct
                                  ? st === 'Present'
                                    ? '#10B981'
                                    : st === 'Absent'
                                    ? '#EF4444'
                                    : st === 'Late'
                                    ? '#F59E0B'
                                    : '#6B7280'
                                  : '#F1F5F9',
                                color: isAct ? '#FFFFFF' : '#475569',
                              }}
                            >
                              {st}
                            </button>
                          );
                        })}
                      </div>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <input
                        type="checkbox"
                        checked={rec.countTowardsQuota}
                        onChange={(e) =>
                          handleUpdateRecord(rec.studentId, {
                            countTowardsQuota: e.target.checked,
                          })
                        }
                        style={{ cursor: 'pointer' }}
                      />
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <input
                        type="text"
                        placeholder="Optional remarks..."
                        value={rec.remarks || ''}
                        onChange={(e) =>
                          handleUpdateRecord(rec.studentId, {
                            remarks: e.target.value,
                          })
                        }
                        style={{
                          width: '100%',
                          padding: '5px 8px',
                          borderRadius: '6px',
                          border: '1px solid #CBD5E1',
                          fontSize: '12px',
                          outline: 'none',
                        }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. Save Session Action Footer */}
      {currentSession && currentSession.records.length > 0 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#FFFFFF',
            padding: '16px 24px',
            borderRadius: '14px',
            border: '1px solid #E2E8F0',
          }}
        >
          <div style={{ fontSize: '12.5px', color: '#64748B' }}>
            Saving will update the batch log and sync sessions with the student quota counter.
          </div>

          <button
            type="button"
            disabled={saving}
            onClick={handleSave}
            style={{
              padding: '10px 24px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#2563EB',
              color: '#FFFFFF',
              fontSize: '13px',
              fontWeight: 700,
              cursor: saving ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
            }}
          >
            {saving ? (
              <>
                <i className="fas fa-spinner fa-spin" /> Saving Session...
              </>
            ) : (
              <>
                <i className="fas fa-save" /> Save Session Attendance
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
