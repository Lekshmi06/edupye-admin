import React, { useState } from 'react';
import type { AdminStudentItem, AdminTuitionProgram } from '../../../services/tuitionAdmin.service';
import { useToast } from '../../../hooks/useToast';

interface ArchivePromotionViewProps {
  students: AdminStudentItem[];
  programs: AdminTuitionProgram[];
  academicSession: string;
  viewId: string;
}

export const ArchivePromotionView: React.FC<ArchivePromotionViewProps> = ({
  students,
  programs,
  academicSession,
  viewId,
}) => {
  const { showToast } = useToast();
  const [selectedProgramId, setSelectedProgramId] = useState<string>(programs[0]?.id || '');
  const [targetGrade, setTargetGrade] = useState<string>('Class 12');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'promotion' | 'archive' | 'report'>(
    viewId === 'students-archive' ? 'archive' : viewId === 'students-session-report' ? 'report' : 'promotion'
  );

  const toggleStudent = (id: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedStudentIds.length === students.length) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(students.map((s) => s.id));
    }
  };

  const handlePromote = () => {
    if (selectedStudentIds.length === 0) {
      showToast('Please select at least one student to promote.', 'warning');
      return;
    }
    showToast(`Successfully promoted ${selectedStudentIds.length} students to ${targetGrade} (${academicSession})!`, 'success');
    setSelectedStudentIds([]);
  };

  const handleArchive = () => {
    if (selectedStudentIds.length === 0) {
      showToast('Please select at least one student to archive.', 'warning');
      return;
    }
    showToast(`Archived ${selectedStudentIds.length} students as Passed-Out Alumni.`, 'info');
    setSelectedStudentIds([]);
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
              STUDENT LIFECYCLE
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
            Batch Progression, Alumni Archive & Session Reports
          </h2>
          <p style={{ margin: 0, fontSize: '13px', color: '#64748B' }}>
            Promote tuition batches into subsequent academic years, maintain graduated student archives, and review session stats.
          </p>
        </div>

        {/* Tab switch */}
        <div style={{ display: 'flex', gap: '8px', backgroundColor: '#F1F5F9', padding: '4px', borderRadius: '8px' }}>
          <button
            type="button"
            onClick={() => setActiveTab('promotion')}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: activeTab === 'promotion' ? '#FFFFFF' : 'transparent',
              color: activeTab === 'promotion' ? '#0F1E36' : '#64748B',
              fontSize: '12.5px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: activeTab === 'promotion' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            }}
          >
            Promotion
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('archive')}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: activeTab === 'archive' ? '#FFFFFF' : 'transparent',
              color: activeTab === 'archive' ? '#0F1E36' : '#64748B',
              fontSize: '12.5px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: activeTab === 'archive' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            }}
          >
            Alumni Archive
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('report')}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: activeTab === 'report' ? '#FFFFFF' : 'transparent',
              color: activeTab === 'report' ? '#0F1E36' : '#64748B',
              fontSize: '12.5px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: activeTab === 'report' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            }}
          >
            Session Report
          </button>
        </div>
      </div>

      {activeTab === 'report' ? (
        /* Session Report Summary */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
          <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748B' }}>TOTAL ENROLLED STUDENTS</span>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#0F1E36', marginTop: '4px' }}>{students.length}</div>
            <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#10B981' }}>&bull; Active Tuition Center Learners</p>
          </div>
          <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748B' }}>ACTIVE BATCHES</span>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#2563EB', marginTop: '4px' }}>{programs.length}</div>
            <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#64748B' }}>&bull; 1-on-1 and Group Cohorts</p>
          </div>
          <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748B' }}>CURRENT SESSION</span>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#7C3AED', marginTop: '4px' }}>{academicSession}</div>
            <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#64748B' }}>&bull; EduPye Academic Year</p>
          </div>
        </div>
      ) : (
        /* Selection and Action Table */
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
              padding: '16px 20px',
              borderBottom: '1px solid #E2E8F0',
              backgroundColor: '#F8FAFC',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                type="button"
                onClick={handleSelectAll}
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #CBD5E1',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {selectedStudentIds.length === students.length ? 'Deselect All' : 'Select All'}
              </button>
              <span style={{ fontSize: '13px', color: '#475569' }}>
                {selectedStudentIds.length} of {students.length} students selected
              </span>
            </div>

            {activeTab === 'promotion' ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#475569' }}>Promote to:</span>
                <select
                  value={targetGrade}
                  onChange={(e) => setTargetGrade(e.target.value)}
                  style={{
                    padding: '7px 12px',
                    borderRadius: '6px',
                    border: '1px solid #CBD5E1',
                    fontSize: '12.5px',
                    backgroundColor: '#FFFFFF',
                    outline: 'none',
                  }}
                >
                  <option value="Class 12">Class 12</option>
                  <option value="Class 11">Class 11</option>
                  <option value="Passed Out Alumni">Passed Out / Completed</option>
                </select>
                <button
                  type="button"
                  onClick={handlePromote}
                  style={{
                    padding: '7px 16px',
                    backgroundColor: '#2563EB',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Confirm Promotion
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleArchive}
                style={{
                  padding: '7px 16px',
                  backgroundColor: '#0F1E36',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <i className="fas fa-archive" /> Move to Alumni Vault
              </button>
            )}
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                  <th style={{ padding: '12px 18px', width: '40px' }} />
                  <th style={{ padding: '12px 18px', fontWeight: 700, color: '#475569' }}>STUDENT ID</th>
                  <th style={{ padding: '12px 18px', fontWeight: 700, color: '#475569' }}>STUDENT NAME</th>
                  <th style={{ padding: '12px 18px', fontWeight: 700, color: '#475569' }}>CURRENT GRADE</th>
                  <th style={{ padding: '12px 18px', fontWeight: 700, color: '#475569' }}>PARENT PHONE</th>
                  <th style={{ padding: '12px 18px', fontWeight: 700, color: '#475569' }}>JOINED DATE</th>
                </tr>
              </thead>
              <tbody>
                {students.map((st, idx) => {
                  const isChecked = selectedStudentIds.includes(st.id);
                  return (
                    <tr
                      key={st.id}
                      onClick={() => toggleStudent(st.id)}
                      style={{
                        borderBottom: idx === students.length - 1 ? 'none' : '1px solid #F1F5F9',
                        backgroundColor: isChecked ? '#EFF6FF' : idx % 2 === 0 ? '#FFFFFF' : '#FAFAFA',
                        cursor: 'pointer',
                      }}
                    >
                      <td style={{ padding: '14px 18px' }}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}} // handled by row click
                          style={{ cursor: 'pointer' }}
                        />
                      </td>
                      <td style={{ padding: '14px 18px', fontFamily: 'monospace', fontWeight: 700, color: '#2563EB' }}>
                        {st.studentCode || `STU-${st.id.slice(-6).toUpperCase()}`}
                      </td>
                      <td style={{ padding: '14px 18px', fontWeight: 700, color: '#0F1E36' }}>
                        {st.name}
                      </td>
                      <td style={{ padding: '14px 18px', color: '#475569' }}>
                        {st.grade || 'Class 12'}
                      </td>
                      <td style={{ padding: '14px 18px', color: '#475569' }}>
                        {st.parentPhone || st.phone || '--'}
                      </td>
                      <td style={{ padding: '14px 18px', color: '#64748B', fontSize: '12px' }}>
                        {st.createdAt ? new Date(st.createdAt).toLocaleDateString() : 'Active'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
