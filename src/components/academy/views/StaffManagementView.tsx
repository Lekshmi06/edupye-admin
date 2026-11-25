import React, { useState } from 'react';
import type { AdminTeacherItem } from '../../../services/tuitionAdmin.service';
import { tuitionAdminService } from '../../../services/tuitionAdmin.service';
import { useToast } from '../../../hooks/useToast';

interface StaffManagementViewProps {
  teachers: AdminTeacherItem[];
  onRefresh: () => void;
}

export const StaffManagementView: React.FC<StaffManagementViewProps> = ({
  teachers,
  onRefresh,
}) => {
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Selected Teacher for Interview / Details
  const [selectedTeacher, setSelectedTeacher] = useState<AdminTeacherItem | null>(null);
  const [interviewDate, setInterviewDate] = useState('');
  const [interviewNotes, setInterviewNotes] = useState('');
  const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false);

  const filteredTeachers = teachers.filter((t) => {
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchName = t.name.toLowerCase().includes(q);
      const matchCode = t.teacherCode && t.teacherCode.toLowerCase().includes(q);
      const matchEmail = t.email.toLowerCase().includes(q);
      if (!matchName && !matchCode && !matchEmail) return false;
    }
    if (statusFilter !== 'all') {
      if (statusFilter === 'approved' && t.tuitionApprovalStatus !== 'approved') return false;
      if (statusFilter === 'pending' && t.tuitionApprovalStatus !== 'pending') return false;
      if (statusFilter === 'rejected' && t.tuitionApprovalStatus !== 'rejected') return false;
    }
    return true;
  });

  const handleAcceptTeacher = async (teacher: AdminTeacherItem) => {
    try {
      setProcessingId(teacher.id);
      const res = await tuitionAdminService.acceptTeacher(teacher.id, 'Approved via EduPye Academy Staff Portal');
      showToast(res.message || `Teacher ${teacher.name} approved! Permanent code issued.`, 'success');
      onRefresh();
    } catch (err: any) {
      showToast(err.message || 'Failed to approve teacher', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectTeacher = async (teacher: AdminTeacherItem) => {
    if (!window.confirm(`Reject tutor application for ${teacher.name}?`)) return;
    try {
      setProcessingId(teacher.id);
      await tuitionAdminService.rejectTeacher(teacher.id, 'Application criteria not met');
      showToast(`Teacher application rejected.`, 'info');
      onRefresh();
    } catch (err: any) {
      showToast(err.message || 'Failed to reject teacher', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const handleScheduleInterviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeacher || !interviewDate) {
      showToast('Please select interview date and time.', 'warning');
      return;
    }
    try {
      setProcessingId(selectedTeacher.id);
      await tuitionAdminService.scheduleInterview(selectedTeacher.id, interviewDate, interviewNotes);
      showToast(`Interview scheduled for ${selectedTeacher.name}.`, 'success');
      setIsInterviewModalOpen(false);
      onRefresh();
    } catch (err: any) {
      showToast(err.message || 'Failed to schedule interview', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      {/* 1. Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#0F1E36', letterSpacing: '-0.02em' }}>
            Faculty & Staff Management
          </h2>
          <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#64748B' }}>
            Certified tuition educators, permanent TCH-IDs, batch assignments, and verification status.
          </p>
        </div>

        <button
          type="button"
          onClick={onRefresh}
          style={{
            padding: '8px 14px',
            borderRadius: '8px',
            border: '1px solid #CBD5E1',
            backgroundColor: '#FFFFFF',
            color: '#334155',
            fontSize: '12.5px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <i className="fas fa-sync-alt" /> Refresh Faculty
        </button>
      </div>

      {/* 2. Filter Bar */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '14px',
          border: '1px solid #E2E8F0',
          padding: '14px 20px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          alignItems: 'center',
        }}
      >
        <div style={{ flex: '1 1 240px' }}>
          <input
            type="text"
            placeholder="Search Faculty Name, TCH-ID, or Email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid #CBD5E1',
              fontSize: '12.5px',
              outline: 'none',
            }}
          />
        </div>

        <div style={{ flex: '0 1 180px' }}>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid #CBD5E1',
              fontSize: '12.5px',
              outline: 'none',
              backgroundColor: '#FFFFFF',
            }}
          >
            <option value="all">All Statuses ({teachers.length})</option>
            <option value="approved">Certified / Approved</option>
            <option value="pending">Pending Verification</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* 3. Faculty Table */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '14px',
          border: '1px solid #E2E8F0',
          overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
            <thead>
              <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#475569', textAlign: 'left' }}>
                <th style={{ padding: '12px 14px', fontWeight: 700 }}>FACULTY ID</th>
                <th style={{ padding: '12px 14px', fontWeight: 700 }}>EDUCATOR</th>
                <th style={{ padding: '12px 14px', fontWeight: 700 }}>SUBJECTS & GRADES</th>
                <th style={{ padding: '12px 14px', fontWeight: 700 }}>ASSIGNED BATCHES</th>
                <th style={{ padding: '12px 14px', fontWeight: 700 }}>INTERVIEW / DEMO</th>
                <th style={{ padding: '12px 14px', fontWeight: 700 }}>STATUS</th>
                <th style={{ padding: '12px 14px', fontWeight: 700, textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredTeachers.length > 0 ? (
                filteredTeachers.map((teacher) => {
                  const isApproved = teacher.tuitionApprovalStatus === 'approved';
                  const isPending = teacher.tuitionApprovalStatus === 'pending';
                  const code = teacher.teacherCode || 'TCH-PENDING';

                  return (
                    <tr
                      key={teacher.id}
                      style={{ borderBottom: '1px solid #F1F5F9', transition: 'background-color 0.15s' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#F8FAFC';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      {/* Code */}
                      <td style={{ padding: '12px 14px' }}>
                        <span
                          style={{
                            fontFamily: 'monospace',
                            fontWeight: 800,
                            fontSize: '12px',
                            backgroundColor: '#EFF6FF',
                            color: '#1E40AF',
                            padding: '3px 8px',
                            borderRadius: '4px',
                            border: '1px solid #BFDBFE',
                          }}
                        >
                          {code}
                        </span>
                      </td>

                      {/* Educator Photo & Name */}
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div
                            style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '50%',
                              backgroundColor: '#EEF2FF',
                              color: '#4338CA',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 800,
                              fontSize: '13px',
                            }}
                          >
                            {teacher.name[0]?.toUpperCase() || 'T'}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: '#0F172A', fontSize: '13px' }}>
                              {teacher.name}
                            </div>
                            <div style={{ fontSize: '11px', color: '#64748B' }}>
                              {teacher.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Subjects & Grades */}
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ fontWeight: 600, color: '#334155' }}>
                          {Array.isArray(teacher.subjects) && teacher.subjects.length > 0
                            ? teacher.subjects.join(', ')
                            : 'General Tuition'}
                        </div>
                        <div style={{ fontSize: '11px', color: '#94A3B8' }}>
                          {Array.isArray(teacher.grades) ? teacher.grades.join(', ') : 'All Grades'}
                        </div>
                      </td>

                      {/* Assigned Batches */}
                      <td style={{ padding: '12px 14px' }}>
                        {teacher.assignedPrograms && teacher.assignedPrograms.length > 0 ? (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                            {teacher.assignedPrograms.map((p) => (
                              <span
                                key={p.id}
                                style={{
                                  fontSize: '10.5px',
                                  fontWeight: 700,
                                  backgroundColor: '#F1F5F9',
                                  color: '#0F172A',
                                  padding: '2px 6px',
                                  borderRadius: '4px',
                                }}
                              >
                                {p.title}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span style={{ fontSize: '11px', color: '#94A3B8', fontStyle: 'italic' }}>
                            No batches assigned
                          </span>
                        )}
                      </td>

                      {/* Interview Status */}
                      <td style={{ padding: '12px 14px' }}>
                        {teacher.interviewStatus ? (
                          <span
                            style={{
                              fontSize: '10.5px',
                              fontWeight: 700,
                              padding: '2px 8px',
                              borderRadius: '10px',
                              backgroundColor: teacher.interviewStatus === 'approved' ? '#D1FAE5' : '#FEF3C7',
                              color: teacher.interviewStatus === 'approved' ? '#065F46' : '#92400E',
                            }}
                          >
                            {teacher.interviewStatus.replace('_', ' ').toUpperCase()}
                          </span>
                        ) : (
                          <span style={{ fontSize: '11px', color: '#94A3B8' }}>Direct Applicant</span>
                        )}
                      </td>

                      {/* Status */}
                      <td style={{ padding: '12px 14px' }}>
                        <span
                          style={{
                            fontSize: '10.5px',
                            fontWeight: 700,
                            padding: '3px 8px',
                            borderRadius: '10px',
                            backgroundColor: isApproved ? '#D1FAE5' : isPending ? '#FEF3C7' : '#FEE2E2',
                            color: isApproved ? '#065F46' : isPending ? '#92400E' : '#991B1B',
                          }}
                        >
                          {teacher.tuitionApprovalStatus.toUpperCase()}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedTeacher(teacher);
                              setIsInterviewModalOpen(true);
                            }}
                            style={{
                              padding: '5px 8px',
                              borderRadius: '6px',
                              border: '1px solid #CBD5E1',
                              backgroundColor: '#FFFFFF',
                              color: '#334155',
                              fontSize: '11px',
                              fontWeight: 600,
                              cursor: 'pointer',
                            }}
                            title="Schedule Interview"
                          >
                            <i className="fas fa-calendar-alt" /> Interview
                          </button>

                          {!isApproved && (
                            <button
                              type="button"
                              disabled={processingId === teacher.id}
                              onClick={() => handleAcceptTeacher(teacher)}
                              style={{
                                padding: '5px 8px',
                                borderRadius: '6px',
                                border: 'none',
                                backgroundColor: '#10B981',
                                color: '#FFFFFF',
                                fontSize: '11px',
                                fontWeight: 700,
                                cursor: processingId === teacher.id ? 'not-allowed' : 'pointer',
                              }}
                            >
                              Approve
                            </button>
                          )}

                          {isPending && (
                            <button
                              type="button"
                              disabled={processingId === teacher.id}
                              onClick={() => handleRejectTeacher(teacher)}
                              style={{
                                padding: '5px 8px',
                                borderRadius: '6px',
                                border: '1px solid #FCA5A5',
                                backgroundColor: '#FEF2F2',
                                color: '#DC2626',
                                fontSize: '11px',
                                fontWeight: 600,
                                cursor: processingId === teacher.id ? 'not-allowed' : 'pointer',
                              }}
                            >
                              Reject
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>
                    No faculty found matching search filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Schedule Interview Modal */}
      {isInterviewModalOpen && selectedTeacher && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            zIndex: 110,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => setIsInterviewModalOpen(false)}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '460px',
              padding: '24px',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              border: '1px solid #E2E8F0',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#0F172A' }}>
                Schedule Faculty Interview
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748B' }}>
                Educator: <strong>{selectedTeacher.name}</strong> ({selectedTeacher.email})
              </p>
            </div>

            <form onSubmit={handleScheduleInterviewSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Interview Date & Time *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={interviewDate}
                  onChange={(e) => setInterviewDate(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Demo / Evaluation Notes
                </label>
                <textarea
                  rows={3}
                  placeholder="Subject demo focus, topic for trial class, meeting link..."
                  value={interviewNotes}
                  onChange={(e) => setInterviewNotes(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', outline: 'none', resize: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => setIsInterviewModalOpen(false)}
                  style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #CBD5E1', backgroundColor: '#FFFFFF', color: '#334155', fontSize: '12.5px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={processingId === selectedTeacher.id}
                  style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', backgroundColor: '#2563EB', color: '#FFFFFF', fontSize: '12.5px', fontWeight: 700, cursor: 'pointer' }}
                >
                  Confirm Interview
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
