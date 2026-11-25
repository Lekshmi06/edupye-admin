import React, { useState, useMemo } from 'react';
import type { AdminStudentItem, AdminTuitionProgram } from '../../../services/tuitionAdmin.service';
import { tuitionAdminService } from '../../../services/tuitionAdmin.service';
import { useToast } from '../../../hooks/useToast';

interface AllStudentsViewProps {
  students: AdminStudentItem[];
  programs: AdminTuitionProgram[];
  onRefresh: () => void;
  onNavigateNewAdmission: () => void;
  onOpenProfile: (student: AdminStudentItem) => void;
  onOpenIdCard: (student: AdminStudentItem) => void;
  onOpenAssignBatch: (student: AdminStudentItem) => void;
}

export const AllStudentsView: React.FC<AllStudentsViewProps> = ({
  students,
  programs,
  onRefresh,
  onNavigateNewAdmission,
  onOpenProfile,
  onOpenIdCard,
  onOpenAssignBatch,
}) => {
  const { showToast } = useToast();

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState('all');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Applied Filter States (triggered by "Filter" button or Enter)
  const [appliedSearch, setAppliedSearch] = useState('');
  const [appliedClass, setAppliedClass] = useState('all');
  const [appliedSubject, setAppliedSubject] = useState('all');
  const [appliedStatus, setAppliedStatus] = useState('all');

  // Pagination States
  const [pageSize, setPageSize] = useState<number>(25);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Status Action in progress
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Extract unique classes/grades and subjects for dropdowns
  const availableClasses = useMemo(() => {
    const set = new Set<string>();
    ['Class 9', 'Class 10', 'Class 11', 'Class 12', 'Repeater / Dropper'].forEach((c) => set.add(c));
    students.forEach((s) => {
      if (s.grade) set.add(s.grade);
    });
    programs.forEach((p) => {
      if (p.grade) set.add(p.grade);
    });
    return Array.from(set);
  }, [students, programs]);

  const availableSubjects = useMemo(() => {
    const set = new Set<string>();
    ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'English', 'Computer Science'].forEach((s) => set.add(s));
    programs.forEach((p) => {
      if (p.subject) set.add(p.subject);
    });
    return Array.from(set);
  }, [programs]);

  const handleApplyFilter = () => {
    setAppliedSearch(searchTerm);
    setAppliedClass(classFilter);
    setAppliedSubject(subjectFilter);
    setAppliedStatus(statusFilter);
    setCurrentPage(1);
  };

  const handleClearFilter = () => {
    setSearchTerm('');
    setClassFilter('all');
    setSubjectFilter('all');
    setStatusFilter('all');
    setAppliedSearch('');
    setAppliedClass('all');
    setAppliedSubject('all');
    setAppliedStatus('all');
    setCurrentPage(1);
  };

  // Filtered Students List
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      // 1. Search filter (Name or STU-ID)
      if (appliedSearch.trim()) {
        const q = appliedSearch.trim().toLowerCase();
        const matchesName = s.name.toLowerCase().includes(q) || (s.username && s.username.toLowerCase().includes(q));
        const matchesEmail = s.email.toLowerCase().includes(q);
        const matchesCode = s.studentCode && s.studentCode.toLowerCase().includes(q);
        if (!matchesName && !matchesEmail && !matchesCode) return false;
      }

      // 2. Class/Batch filter
      if (appliedClass !== 'all') {
        const matchesStudentGrade = s.grade === appliedClass;
        const matchesBatch = s.enrolledPrograms?.some((p) => p.grade === appliedClass || p.id === appliedClass);
        if (!matchesStudentGrade && !matchesBatch) return false;
      }

      // 3. Subject/Stream filter
      if (appliedSubject !== 'all') {
        const matchesSubjects = s.subjects?.includes(appliedSubject);
        const matchesEnrolled = s.enrolledPrograms?.some((p) => p.subject === appliedSubject);
        if (!matchesSubjects && !matchesEnrolled) return false;
      }

      // 4. Status filter ('Active', 'Inactive', 'Passed Out', 'all')
      if (appliedStatus !== 'all') {
        if (appliedStatus === 'Active' && s.tuitionApprovalStatus !== 'approved') return false;
        if (appliedStatus === 'Inactive' && (s.tuitionApprovalStatus === 'approved' || s.tuitionApprovalStatus === 'pending')) return false;
        if (appliedStatus === 'Pending' && s.tuitionApprovalStatus !== 'pending') return false;
      }

      return true;
    });
  }, [students, appliedSearch, appliedClass, appliedSubject, appliedStatus]);

  // Pagination Slicing
  const totalItems = filteredStudents.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const currentBatch = filteredStudents.slice(startIndex, endIndex);

  // Status toggle handler (Approve / Revoke)
  const handleToggleStatus = async (student: AdminStudentItem) => {
    try {
      setProcessingId(student.id);
      if (student.tuitionApprovalStatus === 'approved') {
        await tuitionAdminService.revokeUser(student.id);
        showToast(`Revoked tuition access for ${student.name}.`, 'info');
      } else {
        await tuitionAdminService.approveStudent(student.id, 'approved');
        showToast(`Approved student ${student.name} and issued code.`, 'success');
      }
      onRefresh();
    } catch (err: any) {
      showToast(err.message || 'Failed to update student status', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      {/* 1. View Header with Action */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#0F1E36', letterSpacing: '-0.02em' }}>
            All Tuition Students
          </h2>
          <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#64748B' }}>
            Search, filter, manage enrollments, and print official tuition ID cards.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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
            <i className="fas fa-sync-alt" /> Refresh
          </button>

          <button
            type="button"
            onClick={onNavigateNewAdmission}
            style={{
              padding: '8px 18px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#10B981',
              color: '#FFFFFF',
              fontSize: '12.5px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 8px rgba(16, 185, 129, 0.25)',
            }}
          >
            <i className="fas fa-user-plus" /> + New Admission
          </button>
        </div>
      </div>

      {/* 2. Top Filter Bar */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '14px',
          border: '1px solid #E2E8F0',
          padding: '16px 20px',
          boxShadow: '0 1px 4px rgba(0, 0, 0, 0.03)',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          alignItems: 'center',
        }}
      >
        {/* Search Box */}
        <div style={{ flex: '1 1 220px', minWidth: '200px' }}>
          <div style={{ position: 'relative' }}>
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
              placeholder="Search Name or STU-ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleApplyFilter()}
              style={{
                width: '100%',
                padding: '9px 12px 9px 34px',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                fontSize: '12.5px',
                outline: 'none',
              }}
            />
          </div>
        </div>

        {/* Classes / Batches Dropdown */}
        <div style={{ flex: '0 1 180px' }}>
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            style={{
              width: '100%',
              padding: '9px 12px',
              borderRadius: '8px',
              border: '1px solid #CBD5E1',
              fontSize: '12.5px',
              outline: 'none',
              backgroundColor: '#FFFFFF',
              color: '#334155',
            }}
          >
            <option value="all">All Classes / Batches</option>
            {availableClasses.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Subjects / Streams Dropdown */}
        <div style={{ flex: '0 1 180px' }}>
          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            style={{
              width: '100%',
              padding: '9px 12px',
              borderRadius: '8px',
              border: '1px solid #CBD5E1',
              fontSize: '12.5px',
              outline: 'none',
              backgroundColor: '#FFFFFF',
              color: '#334155',
            }}
          >
            <option value="all">All Subjects / Streams</option>
            {availableSubjects.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* Status Dropdown */}
        <div style={{ flex: '0 1 150px' }}>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              width: '100%',
              padding: '9px 12px',
              borderRadius: '8px',
              border: '1px solid #CBD5E1',
              fontSize: '12.5px',
              outline: 'none',
              backgroundColor: '#FFFFFF',
              color: '#334155',
            }}
          >
            <option value="all">All Statuses</option>
            <option value="Active">Active (Approved)</option>
            <option value="Pending">Pending Verification</option>
            <option value="Inactive">Inactive / Revoked</option>
          </select>
        </div>

        {/* Filter & Clear Action Buttons */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            onClick={handleApplyFilter}
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
            <i className="fas fa-filter" /> Filter
          </button>

          <button
            type="button"
            onClick={handleClearFilter}
            style={{
              padding: '9px 14px',
              borderRadius: '8px',
              border: '1px solid #CBD5E1',
              backgroundColor: '#FFFFFF',
              color: '#64748B',
              fontSize: '12.5px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
            title="Clear filters"
          >
            Clear
          </button>
        </div>
      </div>

      {/* 3. Students Data Table */}
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
              <tr
                style={{
                  backgroundColor: '#F8FAFC',
                  borderBottom: '1px solid #E2E8F0',
                  color: '#475569',
                  textAlign: 'left',
                }}
              >
                <th style={{ padding: '12px 14px', fontWeight: 700, width: '40px' }}>#</th>
                <th style={{ padding: '12px 14px', fontWeight: 700 }}>ID / ADN NO</th>
                <th style={{ padding: '12px 14px', fontWeight: 700 }}>PHOTO</th>
                <th style={{ padding: '12px 14px', fontWeight: 700 }}>NAME</th>
                <th style={{ padding: '12px 14px', fontWeight: 700 }}>PARENT / GUARDIAN</th>
                <th style={{ padding: '12px 14px', fontWeight: 700 }}>CLASS / BATCH</th>
                <th style={{ padding: '12px 14px', fontWeight: 700 }}>DOB / GENDER / JOINED</th>
                <th style={{ padding: '12px 14px', fontWeight: 700 }}>STATUS</th>
                <th style={{ padding: '12px 14px', fontWeight: 700, textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {currentBatch.length > 0 ? (
                currentBatch.map((student, idx) => {
                  const isApproved = student.tuitionApprovalStatus === 'approved';
                  const isPending = student.tuitionApprovalStatus === 'pending';
                  const code = student.studentCode || 'STU-PENDING';

                  return (
                    <tr
                      key={student.id}
                      style={{
                        borderBottom: '1px solid #F1F5F9',
                        transition: 'background-color 0.15s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#F8FAFC';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      {/* Row Index */}
                      <td style={{ padding: '12px 14px', color: '#94A3B8', fontWeight: 600 }}>
                        {startIndex + idx + 1}
                      </td>

                      {/* ID / ADN NO (Monospaced with copy button) */}
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          <span
                            style={{
                              fontFamily: 'monospace',
                              fontWeight: 800,
                              fontSize: '12px',
                              backgroundColor: '#F1F5F9',
                              color: '#0F1E36',
                              padding: '3px 8px',
                              borderRadius: '4px',
                              border: '1px solid #E2E8F0',
                              letterSpacing: '0.04em',
                            }}
                          >
                            {code}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(code);
                              showToast(`Copied ${code} to clipboard`, 'info');
                            }}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#94A3B8',
                              cursor: 'pointer',
                              padding: '2px',
                            }}
                            title="Copy Student Code"
                          >
                            <i className="fas fa-copy" style={{ fontSize: '11px' }} />
                          </button>
                        </div>
                      </td>

                      {/* Photo / Avatar */}
                      <td style={{ padding: '12px 14px' }}>
                        <div
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            backgroundColor: '#EFF6FF',
                            color: '#2563EB',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 800,
                            fontSize: '13px',
                            border: '1px solid #BFDBFE',
                          }}
                        >
                          {student.name[0]?.toUpperCase() || 'S'}
                        </div>
                      </td>

                      {/* Name & Contact */}
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ fontWeight: 700, color: '#0F172A', fontSize: '13px' }}>
                          {student.name}
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748B', marginTop: '1px' }}>
                          {student.email}
                        </div>
                      </td>

                      {/* Parent / Guardian */}
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ fontWeight: 600, color: '#334155' }}>
                          {student.parentName || 'Guardian / N/A'}
                        </div>
                        <div style={{ fontSize: '11px', color: '#94A3B8' }}>
                          {student.phone || student.parentPhone || 'Phone: N/A'}
                        </div>
                      </td>

                      {/* Class / Batch */}
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                          <span
                            style={{
                              fontSize: '11.5px',
                              fontWeight: 700,
                              color: '#1E40AF',
                              backgroundColor: '#EFF6FF',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              alignSelf: 'flex-start',
                            }}
                          >
                            {student.grade || 'Class 12'}
                          </span>
                          {student.enrolledPrograms && student.enrolledPrograms.length > 0 ? (
                            <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 500 }}>
                              {student.enrolledPrograms.map((p) => p.title).join(', ')}
                            </span>
                          ) : (
                            <span style={{ fontSize: '10.5px', color: '#94A3B8', fontStyle: 'italic' }}>
                              No Batch Assigned
                            </span>
                          )}
                        </div>
                      </td>

                      {/* DOB / Gender / Joined */}
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ color: '#334155', fontWeight: 500 }}>
                          {student.gender || 'Not Specified'}
                        </div>
                        <div style={{ fontSize: '11px', color: '#94A3B8' }}>
                          Joined: {new Date(student.createdAt).toLocaleDateString()}
                        </div>
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
                            display: 'inline-block',
                          }}
                        >
                          {student.tuitionApprovalStatus.toUpperCase()}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          {/* Profile Button */}
                          <button
                            type="button"
                            onClick={() => onOpenProfile(student)}
                            style={{
                              padding: '5px 8px',
                              borderRadius: '6px',
                              border: '1px solid #CBD5E1',
                              backgroundColor: '#FFFFFF',
                              color: '#0F172A',
                              fontSize: '11px',
                              fontWeight: 600,
                              cursor: 'pointer',
                            }}
                            title="View Student Profile"
                          >
                            <i className="fas fa-eye" /> Profile
                          </button>

                          {/* ID Card Button */}
                          <button
                            type="button"
                            onClick={() => onOpenIdCard(student)}
                            style={{
                              padding: '5px 8px',
                              borderRadius: '6px',
                              border: '1px solid #BFDBFE',
                              backgroundColor: '#EFF6FF',
                              color: '#1D4ED8',
                              fontSize: '11px',
                              fontWeight: 700,
                              cursor: 'pointer',
                            }}
                            title="Download/Print EduPye Tuition ID Card"
                          >
                            <i className="fas fa-id-card" /> ID Card
                          </button>

                          {/* Assign Batch Button */}
                          <button
                            type="button"
                            onClick={() => onOpenAssignBatch(student)}
                            style={{
                              padding: '5px 8px',
                              borderRadius: '6px',
                              border: '1px solid #E2E8F0',
                              backgroundColor: '#F8FAFC',
                              color: '#334155',
                              fontSize: '11px',
                              fontWeight: 600,
                              cursor: 'pointer',
                            }}
                            title="Assign to Program/Batch"
                          >
                            <i className="fas fa-layer-group" />
                          </button>

                          {/* Quick Toggle Status */}
                          <button
                            type="button"
                            disabled={processingId === student.id}
                            onClick={() => handleToggleStatus(student)}
                            style={{
                              padding: '5px 8px',
                              borderRadius: '6px',
                              border: 'none',
                              backgroundColor: isApproved ? '#FEE2E2' : '#D1FAE5',
                              color: isApproved ? '#DC2626' : '#059669',
                              fontSize: '11px',
                              fontWeight: 700,
                              cursor: processingId === student.id ? 'not-allowed' : 'pointer',
                              opacity: processingId === student.id ? 0.6 : 1,
                            }}
                            title={isApproved ? 'Revoke Access' : 'Approve Student'}
                          >
                            {isApproved ? 'Revoke' : 'Approve'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} style={{ padding: '40px 20px', textAlign: 'center', color: '#64748B' }}>
                    <div style={{ fontSize: '28px', color: '#CBD5E1', marginBottom: '8px' }}>
                      <i className="fas fa-user-slash" />
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#334155' }}>
                      No students found matching your criteria.
                    </div>
                    <p style={{ fontSize: '12.5px', color: '#94A3B8', marginTop: '4px' }}>
                      Try adjusting the filter options above or clear all filters.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 4. Pagination Footer */}
        <div
          style={{
            padding: '14px 20px',
            borderTop: '1px solid #E2E8F0',
            backgroundColor: '#F8FAFC',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          {/* Show per page dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#64748B' }}>
            <span>Show</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              style={{
                padding: '4px 8px',
                borderRadius: '6px',
                border: '1px solid #CBD5E1',
                fontSize: '12px',
                backgroundColor: '#FFFFFF',
                color: '#0F172A',
                fontWeight: 600,
              }}
            >
              <option value={10}>10 per page</option>
              <option value={25}>25 per page</option>
              <option value={50}>50 per page</option>
              <option value={100}>100 per page</option>
            </select>
            <span>
              &bull; Showing {totalItems > 0 ? startIndex + 1 : 0} to {endIndex} of {totalItems} students
            </span>
          </div>

          {/* Page Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              style={{
                padding: '5px 10px',
                borderRadius: '6px',
                border: '1px solid #CBD5E1',
                backgroundColor: '#FFFFFF',
                color: currentPage <= 1 ? '#CBD5E1' : '#334155',
                fontSize: '12px',
                cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
              }}
            >
              &larr; Prev
            </button>

            <span style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A', padding: '0 6px' }}>
              Page {currentPage} of {totalPages}
            </span>

            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              style={{
                padding: '5px 10px',
                borderRadius: '6px',
                border: '1px solid #CBD5E1',
                backgroundColor: '#FFFFFF',
                color: currentPage >= totalPages ? '#CBD5E1' : '#334155',
                fontSize: '12px',
                cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
              }}
            >
              Next &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
