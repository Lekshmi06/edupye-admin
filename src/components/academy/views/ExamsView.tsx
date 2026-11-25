import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  tuitionAdminService,
  type AcademyExamItem,
  type AdminTuitionProgram,
} from '../../../services/tuitionAdmin.service';
import { useToast } from '../../../hooks/useToast';
import { Loader } from '../../common/Loader';

interface ExamsViewProps {
  programs: AdminTuitionProgram[];
  academicSession: string;
  onNavigateMarksEntry: (examId: string, programId: string) => void;
}

export const ExamsView: React.FC<ExamsViewProps> = ({
  programs,
  academicSession,
  onNavigateMarksEntry,
}) => {
  const { showToast } = useToast();
  const [exams, setExams] = useState<AcademyExamItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProgramId, setSelectedProgramId] = useState<string>('all');
  const [selectedTestType, setSelectedTestType] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [programId, setProgramId] = useState<string>(programs[0]?.id || '');
  const [title, setTitle] = useState('');
  const [testType, setTestType] = useState<'Weekly Test' | 'Chapter Assessment' | 'Mock Exam' | '1-on-1 Evaluation'>('Weekly Test');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [maxMarks, setMaxMarks] = useState('50');
  const [passingMarks, setPassingMarks] = useState('20');

  const loadExams = useCallback(async () => {
    try {
      setLoading(true);
      const data = await tuitionAdminService.getExams({
        programId: selectedProgramId !== 'all' ? selectedProgramId : undefined,
        testType: selectedTestType !== 'all' ? selectedTestType : undefined,
        session: academicSession,
      });
      setExams(data);
    } catch (err: any) {
      showToast(err.message || 'Failed to fetch assessments', 'error');
    } finally {
      setLoading(false);
    }
  }, [academicSession, selectedProgramId, selectedTestType, showToast]);

  useEffect(() => {
    loadExams();
  }, [loadExams]);

  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!programId || !title.trim() || !date) {
      showToast('Please fill all required fields.', 'warning');
      return;
    }

    try {
      setSubmitting(true);
      const created = await tuitionAdminService.createExam({
        programId,
        title: title.trim(),
        testType,
        date,
        maxMarks: Number(maxMarks),
        passingMarks: Number(passingMarks),
        session: academicSession,
      });

      showToast(`Assessment "${created.title}" scheduled successfully!`, 'success');
      setShowCreateModal(false);
      setTitle('');
      loadExams();
    } catch (err: any) {
      showToast(err.message || 'Failed to schedule exam', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const totalExams = exams.length;
  const weeklyTestsCount = exams.filter((e) => e.testType === 'Weekly Test').length;
  const mockExamsCount = exams.filter((e) => e.testType === 'Mock Exam').length;

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
              ACADEMIC ASSESSMENTS
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
            Tuition Tests & Mock Exams Schedule
          </h2>
          <p style={{ margin: 0, fontSize: '13px', color: '#64748B' }}>
            Schedule weekly topic evaluations, chapter unit tests, full-syllabus mock exams, and enter marks.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            if (programs.length > 0 && !programId) setProgramId(programs[0]?.id || '');
            setShowCreateModal(true);
          }}
          style={{
            padding: '10px 18px',
            backgroundColor: '#2563EB',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)',
          }}
        >
          <i className="fas fa-plus" /> + Schedule New Test
        </button>
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
              Total Tests Scheduled
            </div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#0F1E36', marginTop: '2px' }}>
              {totalExams} Tests
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
            <i className="fas fa-clipboard-list" />
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
              Weekly Topic Tests
            </div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#059669', marginTop: '2px' }}>
              {weeklyTestsCount} Tests
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
            <i className="fas fa-check-double" />
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
              Full Mock Exams
            </div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#7C3AED', marginTop: '2px' }}>
              {mockExamsCount} Mocks
            </div>
          </div>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              backgroundColor: '#F5F3FF',
              color: '#7C3AED',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
            }}
          >
            <i className="fas fa-graduation-cap" />
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
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#475569' }}>Filter Batch:</span>
          <select
            value={selectedProgramId}
            onChange={(e) => setSelectedProgramId(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid #CBD5E1',
              fontSize: '12.5px',
              backgroundColor: '#FFFFFF',
              outline: 'none',
              maxWidth: '280px',
            }}
          >
            <option value="all">-- All Tuition Batches & 1-on-1 --</option>
            {programs.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title} ({p.subject})
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#475569' }}>Test Type:</span>
          <select
            value={selectedTestType}
            onChange={(e) => setSelectedTestType(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid #CBD5E1',
              fontSize: '12.5px',
              backgroundColor: '#FFFFFF',
              outline: 'none',
            }}
          >
            <option value="all">All Types</option>
            <option value="Weekly Test">Weekly Test</option>
            <option value="Chapter Assessment">Chapter Assessment</option>
            <option value="Mock Exam">Mock Exam</option>
            <option value="1-on-1 Evaluation">1-on-1 Evaluation</option>
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
            Showing {exams.length} Assessments
          </span>
          <button
            type="button"
            onClick={loadExams}
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
            <i className="fas fa-sync-alt" /> Refresh
          </button>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
            <Loader />
          </div>
        ) : exams.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px 20px' }}>
            <i className="fas fa-clipboard-list" style={{ fontSize: '32px', color: '#94A3B8', marginBottom: '10px' }} />
            <h4 style={{ margin: '0 0 4px', fontSize: '15px', color: '#0F1E36' }}>No assessments scheduled</h4>
            <p style={{ margin: 0, fontSize: '13px', color: '#64748B' }}>
              Click "+ Schedule New Test" to create weekly topic tests or full mock exams.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                  <th style={{ padding: '12px 18px', fontWeight: 700, color: '#475569' }}>TEST TITLE</th>
                  <th style={{ padding: '12px 18px', fontWeight: 700, color: '#475569' }}>BATCH / PROGRAM</th>
                  <th style={{ padding: '12px 18px', fontWeight: 700, color: '#475569' }}>SUBJECT</th>
                  <th style={{ padding: '12px 18px', fontWeight: 700, color: '#475569' }}>TYPE</th>
                  <th style={{ padding: '12px 18px', fontWeight: 700, color: '#475569' }}>DATE</th>
                  <th style={{ padding: '12px 18px', fontWeight: 700, color: '#475569' }}>MAX MARKS</th>
                  <th style={{ padding: '12px 18px', fontWeight: 700, color: '#475569' }}>ENROLLED</th>
                  <th style={{ padding: '12px 18px', fontWeight: 700, color: '#475569' }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {exams.map((ex, idx) => {
                  const evaluatedCount = (ex.results || []).filter((r) => r.marksObtained > 0 || r.isAbsent).length;
                  const totalRoster = ex.results?.length || 0;
                  const isFullyGraded = totalRoster > 0 && evaluatedCount >= totalRoster;

                  return (
                    <tr
                      key={ex._id}
                      style={{
                        borderBottom: idx === exams.length - 1 ? 'none' : '1px solid #F1F5F9',
                        backgroundColor: idx % 2 === 0 ? '#FFFFFF' : '#FAFAFA',
                      }}
                    >
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ fontWeight: 700, color: '#0F1E36' }}>{ex.title}</div>
                        <div style={{ fontSize: '11px', color: '#64748B' }}>
                          Passing: {ex.passingMarks} / {ex.maxMarks}
                        </div>
                      </td>
                      <td style={{ padding: '14px 18px', color: '#334155', fontWeight: 600 }}>
                        {ex.programTitle}
                      </td>
                      <td style={{ padding: '14px 18px', color: '#475569' }}>{ex.subject}</td>
                      <td style={{ padding: '14px 18px' }}>
                        <span
                          style={{
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: 700,
                            backgroundColor:
                              ex.testType === 'Mock Exam'
                                ? '#F5F3FF'
                                : ex.testType === 'Weekly Test'
                                ? '#EFF6FF'
                                : '#FEF3C7',
                            color:
                              ex.testType === 'Mock Exam'
                                ? '#7C3AED'
                                : ex.testType === 'Weekly Test'
                                ? '#2563EB'
                                : '#D97706',
                          }}
                        >
                          {ex.testType}
                        </span>
                      </td>
                      <td style={{ padding: '14px 18px', color: '#0F1E36', fontWeight: 600 }}>
                        {ex.date}
                      </td>
                      <td style={{ padding: '14px 18px', fontWeight: 800, color: '#0F1E36' }}>
                        {ex.maxMarks}
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <span
                          style={{
                            fontSize: '11.5px',
                            fontWeight: 600,
                            color: isFullyGraded ? '#059669' : '#D97706',
                          }}
                        >
                          {evaluatedCount} / {totalRoster} Graded
                        </span>
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <button
                          type="button"
                          onClick={() => onNavigateMarksEntry(ex._id, typeof ex.programId === 'string' ? ex.programId : ex.programId?._id || ex.programId)}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: isFullyGraded ? '#EFF6FF' : '#10B981',
                            color: isFullyGraded ? '#2563EB' : '#FFFFFF',
                            border: isFullyGraded ? '1px solid #BFDBFE' : 'none',
                            borderRadius: '6px',
                            fontSize: '11.5px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <i className="fas fa-pen-alt" /> {isFullyGraded ? 'Edit Marks' : 'Enter Marks'}
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

      {/* 5. Schedule Modal */}
      {showCreateModal && (
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
          onClick={() => setShowCreateModal(false)}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '520px',
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
                    backgroundColor: '#EFF6FF',
                    color: '#2563EB',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px',
                  }}
                >
                  <i className="fas fa-file-signature" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#0F1E36' }}>
                    Schedule Tuition Assessment
                  </h3>
                  <p style={{ margin: 0, fontSize: '12px', color: '#64748B' }}>
                    Session {academicSession} test configuration
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                style={{ background: 'none', border: 'none', color: '#94A3B8', fontSize: '16px', cursor: 'pointer' }}
              >
                <i className="fas fa-times" />
              </button>
            </div>

            <form onSubmit={handleCreateExam} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Target Batch / 1-on-1 Program *
                </label>
                <select
                  required
                  value={programId}
                  onChange={(e) => setProgramId(e.target.value)}
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
                  {programs.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title} &bull; {p.subject} ({p.grade})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Test Title / Topic *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Electrostatics Weekly Test #4 or Term 1 Mock Exam"
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
                    Assessment Type
                  </label>
                  <select
                    value={testType}
                    onChange={(e) => setTestType(e.target.value as any)}
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
                    <option value="Weekly Test">Weekly Topic Test</option>
                    <option value="Chapter Assessment">Chapter Assessment</option>
                    <option value="Mock Exam">Full Mock Exam</option>
                    <option value="1-on-1 Evaluation">1-on-1 Evaluation</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Scheduled Date *
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
                    Max Marks *
                  </label>
                  <input
                    type="number"
                    required
                    min={10}
                    max={500}
                    value={maxMarks}
                    onChange={(e) => setMaxMarks(e.target.value)}
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
                    Passing Marks *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={500}
                    value={passingMarks}
                    onChange={(e) => setPassingMarks(e.target.value)}
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

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
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
                    backgroundColor: '#2563EB',
                    color: '#FFFFFF',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {submitting ? 'Scheduling...' : 'Save & Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
