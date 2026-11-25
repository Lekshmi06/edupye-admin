import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  tuitionAdminService,
  type AcademyExamItem,
  type AdminTuitionProgram,
} from '../../../services/tuitionAdmin.service';
import { useToast } from '../../../hooks/useToast';
import { Loader } from '../../common/Loader';

interface MarksEntryViewProps {
  programs: AdminTuitionProgram[];
  academicSession: string;
  initialExamId?: string;
}

export const MarksEntryView: React.FC<MarksEntryViewProps> = ({
  programs,
  academicSession,
  initialExamId,
}) => {
  const { showToast } = useToast();
  const [exams, setExams] = useState<AcademyExamItem[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<string>(initialExamId || '');
  const [currentExam, setCurrentExam] = useState<AcademyExamItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Editable marks state: Array<{ studentId, studentCode, studentName, marksObtained, isAbsent, remarks }>
  const [rosterScores, setRosterScores] = useState<
    Array<{
      studentId: string;
      studentCode: string;
      studentName: string;
      marksObtained: number;
      isAbsent: boolean;
      remarks?: string;
    }>
  >([]);

  // 1. Fetch exams list
  const loadExams = useCallback(async () => {
    try {
      setLoading(true);
      const data = await tuitionAdminService.getExams({ session: academicSession });
      setExams(data);
      if (data.length > 0) {
        const target = initialExamId
          ? data.find((e) => e._id === initialExamId) || data[0]
          : data[0];
        setSelectedExamId(target._id);
        setCurrentExam(target);
        setRosterScores(target.results || []);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to fetch assessments for marks entry', 'error');
    } finally {
      setLoading(false);
    }
  }, [academicSession, initialExamId, showToast]);

  useEffect(() => {
    loadExams();
  }, [loadExams]);

  // Handle changing selected exam
  const handleSelectExam = (examId: string) => {
    setSelectedExamId(examId);
    const found = exams.find((e) => e._id === examId);
    if (found) {
      setCurrentExam(found);
      setRosterScores(found.results || []);
    }
  };

  const handleScoreChange = (index: number, val: number) => {
    setRosterScores((prev) => {
      const copy = [...prev];
      const maxM = currentExam?.maxMarks || 100;
      const sanitized = Math.min(Math.max(0, val), maxM);
      copy[index] = { ...copy[index], marksObtained: sanitized, isAbsent: false };
      return copy;
    });
  };

  const handleAbsentToggle = (index: number) => {
    setRosterScores((prev) => {
      const copy = [...prev];
      const nextAbsent = !copy[index].isAbsent;
      copy[index] = {
        ...copy[index],
        isAbsent: nextAbsent,
        marksObtained: nextAbsent ? 0 : copy[index].marksObtained,
      };
      return copy;
    });
  };

  const handleRemarksChange = (index: number, remarks: string) => {
    setRosterScores((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], remarks };
      return copy;
    });
  };

  const handleSaveMarks = async () => {
    if (!currentExam) return;

    try {
      setSaving(true);
      const updated = await tuitionAdminService.saveExamMarks(currentExam._id, rosterScores);
      setCurrentExam(updated);
      showToast(`Marks for "${updated.title}" saved successfully!`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to save marks', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Aggregated Stats
  const stats = useMemo(() => {
    if (!currentExam || rosterScores.length === 0) {
      return { avgScore: 0, highest: 0, passRate: 0, absentCount: 0 };
    }
    const maxMarks = currentExam.maxMarks || 1;
    const passingMarks = currentExam.passingMarks || 0;

    let totalMarks = 0;
    let highest = 0;
    let passed = 0;
    let appeared = 0;
    let absent = 0;

    rosterScores.forEach((r) => {
      if (r.isAbsent) {
        absent += 1;
      } else {
        appeared += 1;
        totalMarks += r.marksObtained;
        if (r.marksObtained > highest) highest = r.marksObtained;
        if (r.marksObtained >= passingMarks) passed += 1;
      }
    });

    const avgScore = appeared > 0 ? Number((totalMarks / appeared).toFixed(1)) : 0;
    const passRate = appeared > 0 ? Number(((passed / appeared) * 100).toFixed(1)) : 0;

    return { avgScore, highest, passRate, absentCount: absent };
  }, [currentExam, rosterScores]);

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
                backgroundColor: '#ECFDF5',
                color: '#059669',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 800,
                letterSpacing: '0.04em',
              }}
            >
              MARKS ENTRY ROSTER
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
            Tuition Marks & Score Register
          </h2>
          <p style={{ margin: 0, fontSize: '13px', color: '#64748B' }}>
            Enter marks, mark absentees, evaluate student percentages, and record teacher feedback.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSaveMarks}
          disabled={saving || !currentExam}
          style={{
            padding: '10px 22px',
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
          <i className="fas fa-save" /> {saving ? 'Saving...' : 'Save All Marks'}
        </button>
      </div>

      {/* 2. Assessment Selector Bar */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '14px',
          padding: '16px 20px',
          border: '1px solid #E2E8F0',
          display: 'flex',
          gap: '16px',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flex: '1 1 320px' }}>
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>Select Test:</span>
          <select
            value={selectedExamId}
            onChange={(e) => handleSelectExam(e.target.value)}
            style={{
              flex: 1,
              padding: '9px 12px',
              borderRadius: '8px',
              border: '1px solid #CBD5E1',
              fontSize: '13px',
              backgroundColor: '#FFFFFF',
              outline: 'none',
              fontWeight: 600,
            }}
          >
            {exams.map((ex) => (
              <option key={ex._id} value={ex._id}>
                {ex.title} &bull; {ex.programTitle} ({ex.date})
              </option>
            ))}
          </select>
        </div>

        {currentExam && (
          <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
            <span
              style={{
                fontSize: '12px',
                fontWeight: 700,
                padding: '4px 10px',
                borderRadius: '6px',
                backgroundColor: '#EFF6FF',
                color: '#2563EB',
              }}
            >
              Max Marks: {currentExam.maxMarks}
            </span>
            <span
              style={{
                fontSize: '12px',
                fontWeight: 700,
                padding: '4px 10px',
                borderRadius: '6px',
                backgroundColor: '#FEF3C7',
                color: '#D97706',
              }}
            >
              Passing Score: {currentExam.passingMarks}
            </span>
          </div>
        )}
      </div>

      {/* 3. Performance Summary Pills */}
      {currentExam && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          <div
            style={{
              backgroundColor: '#FFFFFF',
              padding: '14px 18px',
              borderRadius: '12px',
              border: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
                Batch Average
              </div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#0F1E36', marginTop: '2px' }}>
                {stats.avgScore} / {currentExam.maxMarks}
              </div>
            </div>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: '#EFF6FF',
                color: '#2563EB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
              }}
            >
              <i className="fas fa-chart-line" />
            </div>
          </div>

          <div
            style={{
              backgroundColor: '#FFFFFF',
              padding: '14px 18px',
              borderRadius: '12px',
              border: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
                Highest Score
              </div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#059669', marginTop: '2px' }}>
                {stats.highest} / {currentExam.maxMarks}
              </div>
            </div>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: '#ECFDF5',
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
              }}
            >
              <i className="fas fa-trophy" />
            </div>
          </div>

          <div
            style={{
              backgroundColor: '#FFFFFF',
              padding: '14px 18px',
              borderRadius: '12px',
              border: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
                Pass Rate
              </div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#2563EB', marginTop: '2px' }}>
                {stats.passRate}%
              </div>
            </div>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: '#EFF6FF',
                color: '#2563EB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
              }}
            >
              <i className="fas fa-user-check" />
            </div>
          </div>

          <div
            style={{
              backgroundColor: '#FFFFFF',
              padding: '14px 18px',
              borderRadius: '12px',
              border: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
                Absentees
              </div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#E11D48', marginTop: '2px' }}>
                {stats.absentCount} Students
              </div>
            </div>
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
              <i className="fas fa-user-slash" />
            </div>
          </div>
        </div>
      )}

      {/* 4. Student Roster Table */}
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
            Enrolled Students ({rosterScores.length}) &bull; {currentExam?.programTitle || ''}
          </span>
          <span style={{ fontSize: '12px', color: '#64748B' }}>
            Tip: Press <kbd style={{ padding: '2px 5px', border: '1px solid #CBD5E1', borderRadius: '4px' }}>Tab</kbd> to move between score fields
          </span>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
            <Loader />
          </div>
        ) : rosterScores.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px 20px' }}>
            <i className="fas fa-user-friends" style={{ fontSize: '32px', color: '#94A3B8', marginBottom: '10px' }} />
            <h4 style={{ margin: '0 0 4px', fontSize: '15px', color: '#0F1E36' }}>No students enrolled in this batch</h4>
            <p style={{ margin: 0, fontSize: '13px', color: '#64748B' }}>
              Assign students to the tuition batch from the Batch Management view first.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                  <th style={{ padding: '12px 18px', fontWeight: 700, color: '#475569' }}>ROLL / CODE</th>
                  <th style={{ padding: '12px 18px', fontWeight: 700, color: '#475569' }}>STUDENT NAME</th>
                  <th style={{ padding: '12px 18px', fontWeight: 700, color: '#475569' }}>MARKS (MAX {currentExam?.maxMarks})</th>
                  <th style={{ padding: '12px 18px', fontWeight: 700, color: '#475569' }}>ABSENT?</th>
                  <th style={{ padding: '12px 18px', fontWeight: 700, color: '#475569' }}>% SCORE</th>
                  <th style={{ padding: '12px 18px', fontWeight: 700, color: '#475569' }}>OUTCOME</th>
                  <th style={{ padding: '12px 18px', fontWeight: 700, color: '#475569' }}>TEACHER REMARKS</th>
                </tr>
              </thead>
              <tbody>
                {rosterScores.map((r, idx) => {
                  const maxM = currentExam?.maxMarks || 1;
                  const passingM = currentExam?.passingMarks || 0;
                  const pct = r.isAbsent ? 0 : Number(((r.marksObtained / maxM) * 100).toFixed(1));
                  const isPassed = !r.isAbsent && r.marksObtained >= passingM;
                  const isTopScorer = !r.isAbsent && r.marksObtained > 0 && r.marksObtained === stats.highest;

                  return (
                    <tr
                      key={r.studentId}
                      style={{
                        borderBottom: idx === rosterScores.length - 1 ? 'none' : '1px solid #F1F5F9',
                        backgroundColor: r.isAbsent ? '#FFF1F2' : idx % 2 === 0 ? '#FFFFFF' : '#FAFAFA',
                      }}
                    >
                      <td style={{ padding: '12px 18px', fontFamily: 'monospace', fontWeight: 700, color: '#0F1E36' }}>
                        {r.studentCode}
                      </td>
                      <td style={{ padding: '12px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontWeight: 700, color: '#0F1E36' }}>{r.studentName}</span>
                          {isTopScorer && (
                            <span
                              style={{
                                fontSize: '10px',
                                fontWeight: 800,
                                backgroundColor: '#FEF3C7',
                                color: '#D97706',
                                padding: '2px 6px',
                                borderRadius: '4px',
                              }}
                            >
                              ★ Top
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '12px 18px' }}>
                        <input
                          type="number"
                          disabled={r.isAbsent}
                          min={0}
                          max={currentExam?.maxMarks || 100}
                          value={r.marksObtained}
                          onChange={(e) => handleScoreChange(idx, Number(e.target.value))}
                          style={{
                            width: '90px',
                            padding: '6px 10px',
                            borderRadius: '6px',
                            border: '1px solid #CBD5E1',
                            fontSize: '13px',
                            fontWeight: 700,
                            color: r.isAbsent ? '#94A3B8' : '#0F1E36',
                            backgroundColor: r.isAbsent ? '#F1F5F9' : '#FFFFFF',
                            outline: 'none',
                          }}
                        />
                      </td>
                      <td style={{ padding: '12px 18px' }}>
                        <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={r.isAbsent}
                            onChange={() => handleAbsentToggle(idx)}
                            style={{ cursor: 'pointer' }}
                          />
                          <span style={{ fontSize: '12px', color: r.isAbsent ? '#E11D48' : '#64748B', fontWeight: 600 }}>
                            {r.isAbsent ? 'Absent' : 'Present'}
                          </span>
                        </label>
                      </td>
                      <td style={{ padding: '12px 18px', fontWeight: 700, color: r.isAbsent ? '#94A3B8' : '#0F1E36' }}>
                        {r.isAbsent ? '--' : `${pct}%`}
                      </td>
                      <td style={{ padding: '12px 18px' }}>
                        {r.isAbsent ? (
                          <span style={{ padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700, backgroundColor: '#FEE2E2', color: '#DC2626' }}>
                            Absent
                          </span>
                        ) : isPassed ? (
                          <span style={{ padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700, backgroundColor: '#ECFDF5', color: '#059669' }}>
                            Passed
                          </span>
                        ) : (
                          <span style={{ padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700, backgroundColor: '#FEF3C7', color: '#D97706' }}>
                            Needs Attention
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '12px 18px' }}>
                        <input
                          type="text"
                          placeholder="e.g. Excellent grasp of concepts, revise integration"
                          value={r.remarks || ''}
                          onChange={(e) => handleRemarksChange(idx, e.target.value)}
                          style={{
                            width: '100%',
                            minWidth: '220px',
                            padding: '6px 10px',
                            borderRadius: '6px',
                            border: '1px solid #CBD5E1',
                            fontSize: '12px',
                            outline: 'none',
                          }}
                        />
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
