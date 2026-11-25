import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  tuitionAdminService,
  type AdminTeacherItem,
  type AdminStudentItem,
  type AdminTuitionProgram,
  type AdminPayoutItem,
  type ComplianceRecordingItem,
  type ComplianceChatItem,
  type AdminComplaintItem,
} from '../../services/tuitionAdmin.service';
import { useToast } from '../../hooks/useToast';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Loader } from '../common/Loader';

interface EdupyeTuitionAdminPageProps {
  onNavigateDashboard?: () => void;
}

type TabType = 'teachers' | 'students' | 'programs' | 'payouts-compliance' | 'complaints';

export const EdupyeTuitionAdminPage: React.FC<EdupyeTuitionAdminPageProps> = ({ onNavigateDashboard }) => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<TabType>('teachers');
  const [loading, setLoading] = useState<boolean>(true);

  // Data states
  const [teachers, setTeachers] = useState<AdminTeacherItem[]>([]);
  const [students, setStudents] = useState<AdminStudentItem[]>([]);
  const [programs, setPrograms] = useState<AdminTuitionProgram[]>([]);
  const [payouts, setPayouts] = useState<AdminPayoutItem[]>([]);
  const [recordings, setRecordings] = useState<ComplianceRecordingItem[]>([]);
  const [chatAudit, setChatAudit] = useState<ComplianceChatItem[]>([]);
  const [complaints, setComplaints] = useState<AdminComplaintItem[]>([]);

  // Search filter
  const [search, setSearch] = useState<string>('');

  // Teacher filters
  const [teacherStatusFilter, setTeacherStatusFilter] = useState<'all' | 'pending' | 'approved' | 'revoked'>('all');
  const [teacherSubjectFilter, setTeacherSubjectFilter] = useState<string>('all');
  const [teacherAssignFilter, setTeacherAssignFilter] = useState<'all' | 'assigned' | 'unassigned'>('all');

  // Student filters
  const [studentStatusFilter, setStudentStatusFilter] = useState<'all' | 'pending' | 'approved' | 'revoked'>('all');
  const [studentGradeFilter, setStudentGradeFilter] = useState<string>('all');
  const [studentEnrollFilter, setStudentEnrollFilter] = useState<'all' | 'enrolled' | 'unassigned'>('all');

  // Complaint filters
  const [complaintStatusFilter, setComplaintStatusFilter] = useState<'all' | 'open' | 'in_review' | 'resolved' | 'closed'>('all');
  const [complaintCategoryFilter, setComplaintCategoryFilter] = useState<string>('all');
  const [complaintReporterFilter, setComplaintReporterFilter] = useState<'all' | 'anonymous' | 'identified'>('all');

  // Complaint Review Modal state
  const [selectedComplaint, setSelectedComplaint] = useState<AdminComplaintItem | null>(null);
  const [newAdminNote, setNewAdminNote] = useState<string>('');
  const [updatingStatus, setUpdatingStatus] = useState<string>('open');
  const [isUpdatingComplaint, setIsUpdatingComplaint] = useState<boolean>(false);

  // Program Modal state
  const [isProgramModalOpen, setIsProgramModalOpen] = useState<boolean>(false);
  const [editingProgram, setEditingProgram] = useState<AdminTuitionProgram | null>(null);
  const [programForm, setProgramForm] = useState({
    title: '',
    subject: 'Physics',
    grade: 'Class 12',
    description: '',
    scheduleDays: 'Monday, Wednesday, Friday',
    startTime: '17:00',
    endTime: '18:30',
    maxCapacity: 30,
    selectedTeacherIds: [] as string[],
    teacherSubjects: {} as Record<string, string>,
    selectedStudentIds: [] as string[],
  });
  const [teacherSearchTerm, setTeacherSearchTerm] = useState('');
  const [studentSearchTerm, setStudentSearchTerm] = useState('');

  // Student Program Assignment Modal
  const [assigningStudent, setAssigningStudent] = useState<AdminStudentItem | null>(null);
  const [selectedProgramId, setSelectedProgramId] = useState<string>('');

  // Tutor Interview Scheduling Modal
  const [interviewingTeacher, setInterviewingTeacher] = useState<AdminTeacherItem | null>(null);
  const [interviewDate, setInterviewDate] = useState<string>('');
  const [interviewNotes, setInterviewNotes] = useState<string>('');
  const [isSubmittingInterview, setIsSubmittingInterview] = useState<boolean>(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [tList, sList, pList, payList, vault, compList] = await Promise.all([
        tuitionAdminService.getTeachers().catch(() => []),
        tuitionAdminService.getStudents().catch(() => []),
        tuitionAdminService.getPrograms().catch(() => []),
        tuitionAdminService.getPayouts().catch(() => []),
        tuitionAdminService.getComplianceVault().catch(() => ({ recordings: [], recentChatAudit: [] })),
        tuitionAdminService.getComplaints().catch(() => []),
      ]);

      setTeachers(tList);
      setStudents(sList);
      setPrograms(pList);
      setPayouts(payList);
      setRecordings(vault.recordings || []);
      setChatAudit(vault.recentChatAudit || []);
      setComplaints(compList);
    } catch (err: any) {
      showToast(err.message || 'Failed to load Tuition Operations data', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Unique subjects and grades for filters
  const teacherSubjects = useMemo(() => {
    const set = new Set<string>();
    teachers.forEach((t) => {
      if (Array.isArray(t.subjects)) {
        t.subjects.forEach((s) => set.add(s));
      }
    });
    return Array.from(set);
  }, [teachers]);

  const studentGrades = useMemo(() => {
    const set = new Set<string>();
    students.forEach((s) => {
      if (s.grade) set.add(s.grade);
      if (s.enrolledPrograms) {
        s.enrolledPrograms.forEach((p) => {
          if (p.grade) set.add(p.grade);
        });
      }
    });
    return Array.from(set);
  }, [students]);

  // Teacher handlers
  const handleVerifyTeacher = async (id: string, status: 'approved' | 'rejected') => {
    try {
      const res = await tuitionAdminService.verifyTeacher(id, status);
      showToast(res.message || `Teacher status updated to ${status}.`, 'success');
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to update teacher verification.', 'error');
    }
  };

  const handleOpenInterviewModal = (t: AdminTeacherItem) => {
    setInterviewingTeacher(t);
    setInterviewDate(t.interviewDate ? new Date(t.interviewDate).toISOString().slice(0, 16) : '');
    setInterviewNotes(t.interviewNotes || '');
  };

  const handleSaveInterview = async () => {
    if (!interviewingTeacher) return;
    try {
      setIsSubmittingInterview(true);
      await tuitionAdminService.scheduleInterview(interviewingTeacher.id, interviewDate, interviewNotes);
      showToast('Interview scheduled successfully.', 'success');
      setInterviewingTeacher(null);
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to schedule interview.', 'error');
    } finally {
      setIsSubmittingInterview(false);
    }
  };

  const handleAcceptTeacher = async (id: string, name: string) => {
    if (!window.confirm(`Approve teacher "${name}" and generate permanent TCH code?`)) return;
    try {
      const res = await tuitionAdminService.acceptTeacher(id);
      showToast(res.message || `Teacher ${name} approved and issued code.`, 'success');
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to accept teacher.', 'error');
    }
  };

  const handleRejectTeacher = async (id: string, name: string) => {
    const reason = window.prompt(`Enter rejection reason for "${name}":`);
    if (reason === null) return;
    try {
      const res = await tuitionAdminService.rejectTeacher(id, reason);
      showToast(res.message || `Teacher application for ${name} rejected.`, 'warning');
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to reject teacher.', 'error');
    }
  };

  // Revoke user handler (works for teachers and students)
  const handleRevokeUser = async (id: string, name: string, role: string) => {
    if (!window.confirm(`Are you sure you want to revoke Tuition Mode access for ${role} "${name}"? They will immediately be removed from all active program rosters.`)) {
      return;
    }
    try {
      const res = await tuitionAdminService.revokeUser(id);
      showToast(res.message || `Tuition access revoked for ${name}.`, 'warning');
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to revoke tuition access.', 'error');
    }
  };

  // Restore user handler
  const handleRestoreUser = async (id: string, name: string) => {
    try {
      const res = await tuitionAdminService.restoreUser(id);
      showToast(res.message || `Tuition access restored for ${name}.`, 'success');
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to restore tuition access.', 'error');
    }
  };

  // Delete user handler
  const handleDeleteUser = async (id: string, name: string, role: string) => {
    if (!window.confirm(`CAUTION: Are you sure you want to permanently delete ${role} account "${name}"? This removes their tuition requests, profile, and roster memberships.`)) {
      return;
    }
    try {
      const res = await tuitionAdminService.deleteUser(id);
      showToast(res.message || `Account for ${name} deleted successfully.`, 'success');
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete account.', 'error');
    }
  };

  // Student handlers
  const handleApproveStudent = async (id: string, programId?: string) => {
    try {
      const res = await tuitionAdminService.approveStudent(id, 'approved', programId);
      showToast(res.message || 'Student tuition access approved successfully.', 'success');
      setAssigningStudent(null);
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to approve student.', 'error');
    }
  };

  // Program handlers
  const handleOpenCreateProgram = () => {
    setEditingProgram(null);
    setProgramForm({
      title: '',
      subject: 'Physics',
      grade: 'Class 12',
      description: '',
      scheduleDays: 'Monday, Wednesday, Friday',
      startTime: '17:00',
      endTime: '18:30',
      maxCapacity: 30,
      selectedTeacherIds: teachers[0]?.id ? [teachers[0].id] : [],
      teacherSubjects: teachers[0]?.id ? { [teachers[0].id]: 'Physics' } : {},
      selectedStudentIds: [],
    });
    setTeacherSearchTerm('');
    setStudentSearchTerm('');
    setIsProgramModalOpen(true);
  };

  const handleOpenEditProgram = (prog: AdminTuitionProgram) => {
    setEditingProgram(prog);
    const daysStr = prog.schedule && prog.schedule.length > 0 ? prog.schedule.map((s) => s.day).join(', ') : 'Monday, Wednesday, Friday';
    const firstSlot = prog.schedule && prog.schedule[0];
    const teacherIds = Array.isArray(prog.teacherIds)
      ? prog.teacherIds.map((t: any) => (t && (t._id || t.id)) ? String(t._id || t.id) : String(t))
      : [];
    const studentIds = Array.isArray(prog.enrolledStudentIds)
      ? prog.enrolledStudentIds.map((s: any) => (s && (s._id || s.id)) ? String(s._id || s.id) : String(s))
      : [];

    const tSubjMap: Record<string, string> = {};
    if (Array.isArray(prog.teacherSubjects)) {
      prog.teacherSubjects.forEach((ts: any) => {
        if (ts && ts.teacherId) {
          const tid = String(ts.teacherId._id || ts.teacherId.id || ts.teacherId);
          tSubjMap[tid] = ts.subject || prog.subject || '';
        }
      });
    }

    setProgramForm({
      title: prog.title,
      subject: prog.subject,
      grade: prog.grade || 'Class 12',
      description: prog.description || '',
      scheduleDays: daysStr,
      startTime: firstSlot?.startTime || '17:00',
      endTime: firstSlot?.endTime || '18:30',
      maxCapacity: prog.maxCapacity || 30,
      selectedTeacherIds: teacherIds,
      teacherSubjects: tSubjMap,
      selectedStudentIds: studentIds,
    });
    setTeacherSearchTerm('');
    setStudentSearchTerm('');
    setIsProgramModalOpen(true);
  };

  const handleSaveProgram = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!programForm.title.trim() || !programForm.subject.trim()) {
      showToast('Title and subject are required.', 'warning');
      return;
    }

    try {
      const days = programForm.scheduleDays.split(',').map((d) => d.trim()).filter(Boolean);
      const schedule = days.map((day) => ({
        day,
        startTime: programForm.startTime,
        endTime: programForm.endTime,
      }));

      const teacherSubjects = programForm.selectedTeacherIds.map((tid) => ({
        teacherId: tid,
        subject: programForm.teacherSubjects[tid] || programForm.subject,
      }));

      const payload = {
        title: programForm.title.trim(),
        subject: programForm.subject.trim(),
        grade: programForm.grade.trim(),
        description: programForm.description.trim(),
        schedule,
        maxCapacity: Number(programForm.maxCapacity) || 30,
        teacherIds: programForm.selectedTeacherIds,
        enrolledStudentIds: programForm.selectedStudentIds,
        teacherSubjects,
      };

      if (editingProgram) {
        await tuitionAdminService.updateProgram(editingProgram._id || editingProgram.id!, payload);
        showToast('Tuition Program and roster updated successfully.', 'success');
      } else {
        await tuitionAdminService.createProgram(payload);
        showToast('Tuition Program created with multi-teacher roster successfully.', 'success');
      }
      setIsProgramModalOpen(false);
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to save tuition program.', 'error');
    }
  };

  const handleDeleteProgram = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete Tuition Program "${title}"?`)) return;
    try {
      await tuitionAdminService.deleteProgram(id);
      showToast('Tuition Program deleted.', 'success');
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete program.', 'error');
    }
  };

  // Payout handler
  const handleApprovePayout = async (id: string) => {
    try {
      await tuitionAdminService.approvePayout(id, 'Approved by Tuition Admin via Portal');
      showToast('Teacher payout approved.', 'success');
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to approve payout.', 'error');
    }
  };

  // Complaint handlers
  const handleOpenComplaintModal = (comp: AdminComplaintItem) => {
    setSelectedComplaint(comp);
    setUpdatingStatus(comp.status);
    setNewAdminNote('');
  };

  const handleSaveComplaintUpdate = async () => {
    if (!selectedComplaint) return;
    try {
      setIsUpdatingComplaint(true);
      await tuitionAdminService.updateComplaint(selectedComplaint._id, {
        status: updatingStatus,
        adminNote: newAdminNote.trim() || undefined,
      });
      showToast('Grievance ticket updated successfully.', 'success');
      setNewAdminNote('');
      setSelectedComplaint(null);
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to update grievance ticket.', 'error');
    } finally {
      setIsUpdatingComplaint(false);
    }
  };

  // Copy code helper
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    showToast(`Copied ${code} to clipboard!`, 'info');
  };

  // Filtered Teachers
  const filteredTeachers = useMemo(() => {
    return teachers.filter((t) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        (t.name || '').toLowerCase().includes(q) ||
        (t.email || '').toLowerCase().includes(q) ||
        (t.teacherCode || '').toLowerCase().includes(q) ||
        (Array.isArray(t.subjects) && t.subjects.some((s) => s.toLowerCase().includes(q))) ||
        (t.assignedPrograms && t.assignedPrograms.some((p) => p.title.toLowerCase().includes(q) || p.code.toLowerCase().includes(q)));

      const matchesStatus =
        teacherStatusFilter === 'all' ||
        (teacherStatusFilter === 'approved' && t.tuitionApprovalStatus === 'approved') ||
        (teacherStatusFilter === 'pending' && t.tuitionApprovalStatus === 'pending') ||
        (teacherStatusFilter === 'revoked' && (t.tuitionApprovalStatus === 'revoked' || t.tuitionApprovalStatus === 'suspended'));

      const matchesSubject =
        teacherSubjectFilter === 'all' ||
        (Array.isArray(t.subjects) && t.subjects.includes(teacherSubjectFilter));

      const isAssigned = t.assignedPrograms && t.assignedPrograms.length > 0;
      const matchesAssign =
        teacherAssignFilter === 'all' ||
        (teacherAssignFilter === 'assigned' && isAssigned) ||
        (teacherAssignFilter === 'unassigned' && !isAssigned);

      return matchesSearch && matchesStatus && matchesSubject && matchesAssign;
    });
  }, [teachers, search, teacherStatusFilter, teacherSubjectFilter, teacherAssignFilter]);

  // Filtered Students
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        (s.name || '').toLowerCase().includes(q) ||
        (s.email || '').toLowerCase().includes(q) ||
        (s.studentCode || '').toLowerCase().includes(q) ||
        (s.grade || '').toLowerCase().includes(q) ||
        (Array.isArray(s.subjects) && s.subjects.some((sub) => sub.toLowerCase().includes(q))) ||
        (s.enrolledPrograms && s.enrolledPrograms.some((p) => p.title.toLowerCase().includes(q) || p.code.toLowerCase().includes(q)));

      const matchesStatus =
        studentStatusFilter === 'all' ||
        (studentStatusFilter === 'approved' && s.tuitionApprovalStatus === 'approved') ||
        (studentStatusFilter === 'pending' && s.tuitionApprovalStatus === 'pending') ||
        (studentStatusFilter === 'revoked' && (s.tuitionApprovalStatus === 'revoked' || s.tuitionApprovalStatus === 'suspended'));

      const matchesGrade =
        studentGradeFilter === 'all' ||
        s.grade === studentGradeFilter ||
        (s.enrolledPrograms && s.enrolledPrograms.some((p) => p.grade === studentGradeFilter));

      const isEnrolled = s.enrolledPrograms && s.enrolledPrograms.length > 0;
      const matchesEnroll =
        studentEnrollFilter === 'all' ||
        (studentEnrollFilter === 'enrolled' && isEnrolled) ||
        (studentEnrollFilter === 'unassigned' && !isEnrolled);

      return matchesSearch && matchesStatus && matchesGrade && matchesEnroll;
    });
  }, [students, search, studentStatusFilter, studentGradeFilter, studentEnrollFilter]);

  // Filtered Complaints
  const filteredComplaints = useMemo(() => {
    return complaints.filter((c) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        c.ticketCode.toLowerCase().includes(q) ||
        c.subject.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        (!c.isAnonymous && c.reporter?.name.toLowerCase().includes(q)) ||
        (c.programId?.title && c.programId.title.toLowerCase().includes(q));

      const matchesStatus = complaintStatusFilter === 'all' || c.status === complaintStatusFilter;
      const matchesCategory = complaintCategoryFilter === 'all' || c.category === complaintCategoryFilter;
      const matchesReporter =
        complaintReporterFilter === 'all' ||
        (complaintReporterFilter === 'anonymous' && c.isAnonymous) ||
        (complaintReporterFilter === 'identified' && !c.isAnonymous);

      return matchesSearch && matchesStatus && matchesCategory && matchesReporter;
    });
  }, [complaints, search, complaintStatusFilter, complaintCategoryFilter, complaintReporterFilter]);

  const openComplaintsCount = useMemo(() => {
    return complaints.filter((c) => c.status === 'open' || c.status === 'in_review').length;
  }, [complaints]);

  return (
    <div style={{ padding: '24px 32px 60px', maxWidth: 1440, margin: '0 auto', fontFamily: "'Inter', sans-serif" }}>
      {/* Top Banner Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 24,
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {onNavigateDashboard && (
            <button
              type="button"
              onClick={onNavigateDashboard}
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: 10,
                width: 38,
                height: 38,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#64748b',
                cursor: 'pointer',
              }}
              title="Return to Dashboard"
            >
              <i className="fas fa-arrow-left" />
            </button>
          )}

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: 'linear-gradient(135deg, #1e3a8a, #7c3aed)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  fontSize: 16,
                }}
              >
                <i className="fas fa-graduation-cap" />
              </div>
              <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
                EduPye Tuition Operations Hub
              </h1>
            </div>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b' }}>
              Centralized teacher verification, student code issuance, program rosters, grievance tracking &amp; 365-day compliance vault
            </p>
          </div>
        </div>

        {/* Live Status Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            padding: '8px 16px',
            borderRadius: 30,
            fontSize: 12,
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
          }}
        >
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
          <span style={{ fontWeight: 600, color: '#0f172a' }}>Live Platform Sync</span>
          <span style={{ color: '#94a3b8' }}>|</span>
          <span style={{ color: '#64748b' }}>Programs: <strong>{programs.length}</strong></span>
          <span style={{ color: '#94a3b8' }}>|</span>
          <span style={{ color: '#64748b' }}>Complaints: <strong style={{ color: openComplaintsCount > 0 ? '#dc2626' : '#15803d' }}>{openComplaintsCount} Open</strong></span>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: '#ffffff',
          padding: '6px',
          borderRadius: 14,
          border: '1px solid #e2e8f0',
          marginBottom: 20,
          overflowX: 'auto',
        }}
      >
        <button
          type="button"
          onClick={() => { setActiveTab('teachers'); setSearch(''); }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '9px 18px',
            borderRadius: 8,
            border: 'none',
            background: activeTab === 'teachers' ? 'linear-gradient(135deg, #1e3a8a, #7c3aed)' : 'transparent',
            color: activeTab === 'teachers' ? '#ffffff' : '#64748b',
            fontWeight: activeTab === 'teachers' ? 700 : 500,
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          <i className="fas fa-chalkboard-teacher" />
          <span>Teachers &amp; Verifications</span>
          <span
            style={{
              background: activeTab === 'teachers' ? 'rgba(255,255,255,0.25)' : '#f1f5f9',
              color: activeTab === 'teachers' ? '#ffffff' : '#475569',
              padding: '2px 7px',
              borderRadius: 10,
              fontSize: 11,
              fontWeight: 600,
            }}
          >
            {teachers.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => { setActiveTab('students'); setSearch(''); }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '9px 18px',
            borderRadius: 8,
            border: 'none',
            background: activeTab === 'students' ? 'linear-gradient(135deg, #1e3a8a, #7c3aed)' : 'transparent',
            color: activeTab === 'students' ? '#ffffff' : '#64748b',
            fontWeight: activeTab === 'students' ? 700 : 500,
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          <i className="fas fa-user-graduate" />
          <span>Students &amp; Enrollments</span>
          <span
            style={{
              background: activeTab === 'students' ? 'rgba(255,255,255,0.25)' : '#f1f5f9',
              color: activeTab === 'students' ? '#ffffff' : '#475569',
              padding: '2px 7px',
              borderRadius: 10,
              fontSize: 11,
              fontWeight: 600,
            }}
          >
            {students.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => { setActiveTab('programs'); setSearch(''); }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '9px 18px',
            borderRadius: 8,
            border: 'none',
            background: activeTab === 'programs' ? 'linear-gradient(135deg, #1e3a8a, #7c3aed)' : 'transparent',
            color: activeTab === 'programs' ? '#ffffff' : '#64748b',
            fontWeight: activeTab === 'programs' ? 700 : 500,
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          <i className="fas fa-calendar-alt" />
          <span>Tuition Programs &amp; Pairings</span>
          <span
            style={{
              background: activeTab === 'programs' ? 'rgba(255,255,255,0.25)' : '#f1f5f9',
              color: activeTab === 'programs' ? '#ffffff' : '#475569',
              padding: '2px 7px',
              borderRadius: 10,
              fontSize: 11,
              fontWeight: 600,
            }}
          >
            {programs.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => { setActiveTab('complaints'); setSearch(''); }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '9px 18px',
            borderRadius: 8,
            border: 'none',
            background: activeTab === 'complaints' ? 'linear-gradient(135deg, #1e3a8a, #7c3aed)' : 'transparent',
            color: activeTab === 'complaints' ? '#ffffff' : '#64748b',
            fontWeight: activeTab === 'complaints' ? 700 : 500,
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          <i className="fas fa-exclamation-triangle" />
          <span>Complaints &amp; Grievances</span>
          {openComplaintsCount > 0 && (
            <span
              style={{
                background: '#ef4444',
                color: '#ffffff',
                padding: '2px 7px',
                borderRadius: 10,
                fontSize: 11,
                fontWeight: 700,
              }}
            >
              {openComplaintsCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => { setActiveTab('payouts-compliance'); setSearch(''); }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '9px 18px',
            borderRadius: 8,
            border: 'none',
            background: activeTab === 'payouts-compliance' ? 'linear-gradient(135deg, #1e3a8a, #7c3aed)' : 'transparent',
            color: activeTab === 'payouts-compliance' ? '#ffffff' : '#64748b',
            fontWeight: activeTab === 'payouts-compliance' ? 700 : 500,
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          <i className="fas fa-shield-alt" />
          <span>Payouts &amp; 1-Year Compliance Vault</span>
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '60px 0', textAlign: 'center' }}>
          <Loader label="Synchronizing EduPye tuition operations..." />
        </div>
      ) : (
        <>
          {/* TAB 1: TEACHER VERIFICATIONS & CODES */}
          {activeTab === 'teachers' && (
            <div style={{ background: '#ffffff', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
              {/* Filter and Search Bar */}
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                  <div style={{ position: 'relative', width: 320 }}>
                    <Input
                      type="text"
                      placeholder="Search teachers by name, email, code, subject..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      style={{ paddingLeft: 34, width: '100%', fontSize: 13 }}
                    />
                    <i className="fas fa-search" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  </div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>
                    Showing <strong>{filteredTeachers.length}</strong> of {teachers.length} registered teachers
                  </div>
                </div>

                {/* Status & Categorization Filter Pills */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                  {/* Status Pills */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#f8fafc', padding: 4, borderRadius: 8, border: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', padding: '0 6px', textTransform: 'uppercase' }}>Status:</span>
                    {(['all', 'pending', 'approved', 'revoked'] as const).map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setTeacherStatusFilter(st)}
                        style={{
                          padding: '4px 10px',
                          borderRadius: 6,
                          border: 'none',
                          fontSize: 11,
                          fontWeight: teacherStatusFilter === st ? 700 : 500,
                          background: teacherStatusFilter === st ? '#1e293b' : 'transparent',
                          color: teacherStatusFilter === st ? '#ffffff' : '#64748b',
                          cursor: 'pointer',
                        }}
                      >
                        {st.charAt(0).toUpperCase() + st.slice(1)}
                      </button>
                    ))}
                  </div>

                  {/* Subject Filter */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Subject:</span>
                    <select
                      value={teacherSubjectFilter}
                      onChange={(e) => setTeacherSubjectFilter(e.target.value)}
                      style={{
                        padding: '5px 10px',
                        borderRadius: 8,
                        border: '1px solid #cbd5e1',
                        fontSize: 12,
                        background: '#ffffff',
                        color: '#334155',
                      }}
                    >
                      <option value="all">All Subjects</option>
                      {teacherSubjects.map((sub) => (
                        <option key={sub} value={sub}>{sub}</option>
                      ))}
                    </select>
                  </div>

                  {/* Program Assignment Filter */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Assignment:</span>
                    <select
                      value={teacherAssignFilter}
                      onChange={(e) => setTeacherAssignFilter(e.target.value as any)}
                      style={{
                        padding: '5px 10px',
                        borderRadius: 8,
                        border: '1px solid #cbd5e1',
                        fontSize: 12,
                        background: '#ffffff',
                        color: '#334155',
                      }}
                    >
                      <option value="all">All</option>
                      <option value="assigned">Assigned to Program</option>
                      <option value="unassigned">Unassigned (0 Programs)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', textAlign: 'left' }}>
                      <th style={{ padding: '12px 16px', fontWeight: 600 }}>Teacher Name</th>
                      <th style={{ padding: '12px 16px', fontWeight: 600 }}>Subjects &amp; Grades</th>
                      <th style={{ padding: '12px 16px', fontWeight: 600 }}>Permanent Code</th>
                      <th style={{ padding: '12px 16px', fontWeight: 600 }}>Assigned Programs</th>
                      <th style={{ padding: '12px 16px', fontWeight: 600 }}>Tuition Status</th>
                      <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTeachers.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ padding: '32px 16px', textAlign: 'center', color: '#64748b' }}>
                          No teachers found matching criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredTeachers.map((t) => {
                        const isRevoked = t.tuitionApprovalStatus === 'revoked' || t.tuitionApprovalStatus === 'suspended';
                        const isApproved = t.tuitionApprovalStatus === 'approved';
                        const isPending = !isRevoked && !isApproved;

                        return (
                          <tr key={t.id} style={{ borderBottom: '1px solid #f1f5f9', background: isRevoked ? '#fff1f2' : 'transparent' }}>
                            <td style={{ padding: '12px 16px' }}>
                              <div style={{ fontWeight: 600, color: '#0f172a' }}>{t.name}</div>
                              <div style={{ fontSize: 12, color: '#64748b' }}>{t.email}</div>
                              {t.phone ? (
                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 4 }}>
                                  <span style={{ fontSize: 11, color: '#0369a1', background: '#e0f2fe', padding: '1px 6px', borderRadius: 4, fontWeight: 600 }}>
                                    <i className="fas fa-phone-alt" style={{ marginRight: 3, fontSize: 10 }} />
                                    {t.phone}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleCopyCode(t.phone!)}
                                    title="Copy Phone Number"
                                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#0284c7', fontSize: 11 }}
                                  >
                                    <i className="fas fa-copy" />
                                  </button>
                                </div>
                              ) : null}
                              {t.tier && (
                                <div>
                                  <span style={{ fontSize: 10, textTransform: 'uppercase', background: '#f1f5f9', color: '#475569', padding: '1px 6px', borderRadius: 4, fontWeight: 700, marginTop: 3, display: 'inline-block' }}>
                                    {t.tier} Tier
                                  </span>
                                </div>
                              )}
                            </td>
                            <td style={{ padding: '12px 16px' }}>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                                  {Array.isArray(t.subjects) && t.subjects.length > 0 ? (
                                    t.subjects.map((sub, i) => (
                                      <span key={i} style={{ background: '#eff6ff', color: '#1e40af', padding: '2px 7px', borderRadius: 6, fontSize: 11, fontWeight: 600 }}>
                                        {sub}
                                      </span>
                                    ))
                                  ) : (
                                    <span style={{ color: '#94a3b8', fontSize: 12 }}>General</span>
                                  )}
                                </div>
                                {t.grades && t.grades.length > 0 && (
                                  <div style={{ fontSize: 11, color: '#64748b' }}>
                                    Grades: {t.grades.join(', ')}
                                  </div>
                                )}
                                {t.qualifications && t.qualifications.length > 0 && (
                                  <div style={{ fontSize: 11, color: '#475569', fontWeight: 600 }}>
                                    <i className="fas fa-graduation-cap" style={{ marginRight: 4, color: '#7c3aed' }} />
                                    {t.qualifications.join(', ')}
                                  </div>
                                )}
                                {t.demoLink && (
                                  <div style={{ fontSize: 11 }}>
                                    <a href={t.demoLink} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', textDecoration: 'underline' }}>
                                      <i className="fas fa-video" style={{ marginRight: 3 }} /> View Demo Class
                                    </a>
                                  </div>
                                )}
                              </div>
                            </td>
                            <td style={{ padding: '12px 16px' }}>
                              {t.teacherCode ? (
                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                  <span
                                    style={{
                                      background: '#fef3c7',
                                      color: '#b45309',
                                      border: '1px solid #fde68a',
                                      padding: '4px 10px',
                                      borderRadius: 6,
                                      fontFamily: 'monospace',
                                      fontWeight: 700,
                                      fontSize: 12,
                                    }}
                                  >
                                    {t.teacherCode}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleCopyCode(t.teacherCode!)}
                                    title="Copy Code"
                                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b', fontSize: 12 }}
                                  >
                                    <i className="fas fa-copy" />
                                  </button>
                                </div>
                              ) : (
                                <span style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: 12 }}>Unissued</span>
                              )}
                            </td>
                            <td style={{ padding: '12px 16px' }}>
                              {t.assignedPrograms && t.assignedPrograms.length > 0 ? (
                                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                  {t.assignedPrograms.map((p) => (
                                    <span
                                      key={p.id}
                                      style={{
                                        background: '#f0fdf4',
                                        color: '#15803d',
                                        border: '1px solid #bbf7d0',
                                        padding: '2px 8px',
                                        borderRadius: 6,
                                        fontSize: 11,
                                        fontWeight: 600,
                                      }}
                                    >
                                      {p.title} ({p.code})
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <span style={{ color: '#94a3b8', fontSize: 12 }}>None</span>
                              )}
                            </td>
                            <td style={{ padding: '12px 16px' }}>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                <span
                                  style={{
                                    padding: '3px 8px',
                                    borderRadius: 12,
                                    fontSize: 11,
                                    fontWeight: 700,
                                    background: isRevoked ? '#fee2e2' : (isApproved ? '#dcfce7' : '#fef3c7'),
                                    color: isRevoked ? '#dc2626' : (isApproved ? '#15803d' : '#b45309'),
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 4,
                                    width: 'fit-content',
                                  }}
                                >
                                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: isRevoked ? '#dc2626' : (isApproved ? '#15803d' : '#b45309') }} />
                                  {isRevoked ? 'REVOKED' : (isApproved ? 'APPROVED' : 'PENDING')}
                                </span>
                                {t.interviewStatus && (
                                  <span
                                    style={{
                                      padding: '2px 7px',
                                      borderRadius: 8,
                                      fontSize: 10,
                                      fontWeight: 600,
                                      background: t.interviewStatus === 'approved' ? '#f0fdf4' : t.interviewStatus === 'interview_scheduled' ? '#e0e7ff' : t.interviewStatus === 'rejected' ? '#fef2f2' : '#fffbeb',
                                      color: t.interviewStatus === 'approved' ? '#166534' : t.interviewStatus === 'interview_scheduled' ? '#3730a3' : t.interviewStatus === 'rejected' ? '#991b1b' : '#92400e',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: 4,
                                      width: 'fit-content',
                                    }}
                                  >
                                    <i className={t.interviewStatus === 'interview_scheduled' ? 'fas fa-calendar-alt' : t.interviewStatus === 'approved' ? 'fas fa-check-circle' : 'fas fa-clock'} />
                                    {t.interviewStatus === 'interview_scheduled'
                                      ? `Interview: ${t.interviewDate ? new Date(t.interviewDate).toLocaleDateString() : 'Scheduled'}`
                                      : t.interviewStatus === 'pending_interview'
                                      ? 'Pending Interview'
                                      : t.interviewStatus.toUpperCase()}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                                {isPending && (
                                  <>
                                    <Button
                                      variant="outline"
                                      style={{ padding: '5px 9px', fontSize: 12, borderColor: '#6366f1', color: '#4f46e5' }}
                                      onClick={() => handleOpenInterviewModal(t)}
                                      title="Schedule Interview"
                                    >
                                      <i className="fas fa-calendar-check" style={{ marginRight: 4 }} /> Schedule Interview
                                    </Button>
                                    <Button
                                      variant="primary"
                                      style={{ padding: '5px 9px', fontSize: 12 }}
                                      onClick={() => handleAcceptTeacher(t.id, t.name)}
                                      title="Accept & Issue Code"
                                    >
                                      <i className="fas fa-check" style={{ marginRight: 4 }} /> Accept &amp; Issue Code
                                    </Button>
                                    <Button
                                      variant="outline"
                                      style={{ padding: '5px 9px', fontSize: 12, borderColor: '#fca5a5', color: '#dc2626' }}
                                      onClick={() => handleRejectTeacher(t.id, t.name)}
                                      title="Reject Application"
                                    >
                                      <i className="fas fa-times" style={{ marginRight: 4 }} /> Reject
                                    </Button>
                                  </>
                                )}

                                {isApproved && (
                                  <Button
                                    variant="outline"
                                    style={{ padding: '5px 10px', fontSize: 12, color: '#dc2626', borderColor: '#fca5a5' }}
                                    onClick={() => handleRevokeUser(t.id, t.name, 'Teacher')}
                                  >
                                    <i className="fas fa-ban" style={{ marginRight: 4 }} /> Revoke Access
                                  </Button>
                                )}

                                {isRevoked && (
                                  <Button
                                    variant="primary"
                                    style={{ padding: '5px 10px', fontSize: 12, background: '#10b981', borderColor: '#10b981' }}
                                    onClick={() => handleRestoreUser(t.id, t.name)}
                                  >
                                    <i className="fas fa-undo" style={{ marginRight: 4 }} /> Restore Access
                                  </Button>
                                )}

                                <button
                                  type="button"
                                  onClick={() => handleDeleteUser(t.id, t.name, 'Teacher')}
                                  style={{
                                    background: '#fef2f2',
                                    border: '1px solid #fee2e2',
                                    borderRadius: 6,
                                    color: '#dc2626',
                                    padding: '5px 8px',
                                    cursor: 'pointer',
                                    fontSize: 12,
                                  }}
                                  title="Delete Account"
                                >
                                  <i className="fas fa-trash-alt" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: STUDENT REQUESTS & CODES */}
          {activeTab === 'students' && (
            <div style={{ background: '#ffffff', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
              {/* Filter and Search Bar */}
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                  <div style={{ position: 'relative', width: 320 }}>
                    <Input
                      type="text"
                      placeholder="Search students by name, email, code, grade, program..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      style={{ paddingLeft: 34, width: '100%', fontSize: 13 }}
                    />
                    <i className="fas fa-search" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  </div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>
                    Showing <strong>{filteredStudents.length}</strong> of {students.length} enrolled students
                  </div>
                </div>

                {/* Status & Categorization Filter Pills */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                  {/* Status Pills */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#f8fafc', padding: 4, borderRadius: 8, border: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', padding: '0 6px', textTransform: 'uppercase' }}>Status:</span>
                    {(['all', 'pending', 'approved', 'revoked'] as const).map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setStudentStatusFilter(st)}
                        style={{
                          padding: '4px 10px',
                          borderRadius: 6,
                          border: 'none',
                          fontSize: 11,
                          fontWeight: studentStatusFilter === st ? 700 : 500,
                          background: studentStatusFilter === st ? '#1e293b' : 'transparent',
                          color: studentStatusFilter === st ? '#ffffff' : '#64748b',
                          cursor: 'pointer',
                        }}
                      >
                        {st.charAt(0).toUpperCase() + st.slice(1)}
                      </button>
                    ))}
                  </div>

                  {/* Grade Filter */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Grade/Class:</span>
                    <select
                      value={studentGradeFilter}
                      onChange={(e) => setStudentGradeFilter(e.target.value)}
                      style={{
                        padding: '5px 10px',
                        borderRadius: 8,
                        border: '1px solid #cbd5e1',
                        fontSize: 12,
                        background: '#ffffff',
                        color: '#334155',
                      }}
                    >
                      <option value="all">All Grades</option>
                      {studentGrades.map((g) => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>

                  {/* Enrollment Filter */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Enrollment:</span>
                    <select
                      value={studentEnrollFilter}
                      onChange={(e) => setStudentEnrollFilter(e.target.value as any)}
                      style={{
                        padding: '5px 10px',
                        borderRadius: 8,
                        border: '1px solid #cbd5e1',
                        fontSize: 12,
                        background: '#ffffff',
                        color: '#334155',
                      }}
                    >
                      <option value="all">All</option>
                      <option value="enrolled">Enrolled in Program</option>
                      <option value="unassigned">Unassigned (0 Programs)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', textAlign: 'left' }}>
                      <th style={{ padding: '12px 16px', fontWeight: 600 }}>Student Name</th>
                      <th style={{ padding: '12px 16px', fontWeight: 600 }}>Permanent Code</th>
                      <th style={{ padding: '12px 16px', fontWeight: 600 }}>Grade &amp; Subjects</th>
                      <th style={{ padding: '12px 16px', fontWeight: 600 }}>Enrolled Programs</th>
                      <th style={{ padding: '12px 16px', fontWeight: 600 }}>Status</th>
                      <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ padding: '32px 16px', textAlign: 'center', color: '#64748b' }}>
                          No students found matching criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredStudents.map((s) => {
                        const isRevoked = s.tuitionApprovalStatus === 'revoked' || s.tuitionApprovalStatus === 'suspended';
                        const isApproved = s.tuitionApprovalStatus === 'approved';
                        const isPending = !isRevoked && !isApproved;

                        return (
                          <tr key={s.id} style={{ borderBottom: '1px solid #f1f5f9', background: isRevoked ? '#fff1f2' : 'transparent' }}>
                            <td style={{ padding: '12px 16px' }}>
                              <div style={{ fontWeight: 600, color: '#0f172a' }}>{s.name}</div>
                              <div style={{ fontSize: 12, color: '#64748b' }}>{s.email}</div>
                            </td>
                            <td style={{ padding: '12px 16px' }}>
                              {s.studentCode ? (
                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                  <span
                                    style={{
                                      background: '#fef3c7',
                                      color: '#b45309',
                                      border: '1px solid #fde68a',
                                      padding: '4px 10px',
                                      borderRadius: 6,
                                      fontFamily: 'monospace',
                                      fontWeight: 700,
                                      fontSize: 12,
                                    }}
                                  >
                                    {s.studentCode}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleCopyCode(s.studentCode!)}
                                    title="Copy Code"
                                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b', fontSize: 12 }}
                                  >
                                    <i className="fas fa-copy" />
                                  </button>
                                </div>
                              ) : (
                                <span style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: 12 }}>Unissued</span>
                              )}
                            </td>
                            <td style={{ padding: '12px 16px' }}>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                <span style={{ fontWeight: 600, color: '#334155', fontSize: 12 }}>{s.grade || 'Class 12'}</span>
                                {Array.isArray(s.subjects) && s.subjects.length > 0 && (
                                  <span style={{ fontSize: 11, color: '#64748b' }}>
                                    {s.subjects.join(', ')}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td style={{ padding: '12px 16px' }}>
                              {s.enrolledPrograms && s.enrolledPrograms.length > 0 ? (
                                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                  {s.enrolledPrograms.map((p) => (
                                    <span
                                      key={p.id}
                                      style={{
                                        background: '#eff6ff',
                                        color: '#1d4ed8',
                                        padding: '2px 8px',
                                        borderRadius: 6,
                                        fontSize: 11,
                                        fontWeight: 600,
                                      }}
                                    >
                                      {p.title} ({p.code})
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <span style={{ color: '#94a3b8', fontSize: 12 }}>None assigned</span>
                              )}
                            </td>
                            <td style={{ padding: '12px 16px' }}>
                              <span
                                style={{
                                  padding: '4px 10px',
                                  borderRadius: 12,
                                  fontSize: 11,
                                  fontWeight: 700,
                                  background: isRevoked ? '#fee2e2' : (isApproved ? '#dcfce7' : '#fef3c7'),
                                  color: isRevoked ? '#dc2626' : (isApproved ? '#15803d' : '#b45309'),
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 4,
                                }}
                              >
                                <span style={{ width: 6, height: 6, borderRadius: '50%', background: isRevoked ? '#dc2626' : (isApproved ? '#15803d' : '#b45309') }} />
                                {isRevoked ? 'REVOKED' : (isApproved ? 'APPROVED' : 'PENDING')}
                              </span>
                            </td>
                            <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                <Button
                                  variant={isApproved ? 'outline' : 'primary'}
                                  style={{ padding: '5px 10px', fontSize: 12 }}
                                  onClick={() => {
                                    setAssigningStudent(s);
                                    setSelectedProgramId(programs[0]?._id || '');
                                  }}
                                >
                                  <i className="fas fa-link" style={{ marginRight: 4 }} />
                                  {isApproved ? 'Assign Program' : 'Approve & Assign'}
                                </Button>

                                {isApproved && (
                                  <Button
                                    variant="outline"
                                    style={{ padding: '5px 10px', fontSize: 12, color: '#dc2626', borderColor: '#fca5a5' }}
                                    onClick={() => handleRevokeUser(s.id, s.name, 'Student')}
                                  >
                                    <i className="fas fa-ban" style={{ marginRight: 4 }} /> Revoke
                                  </Button>
                                )}

                                {isRevoked && (
                                  <Button
                                    variant="primary"
                                    style={{ padding: '5px 10px', fontSize: 12, background: '#10b981', borderColor: '#10b981' }}
                                    onClick={() => handleRestoreUser(s.id, s.name)}
                                  >
                                    <i className="fas fa-undo" style={{ marginRight: 4 }} /> Restore
                                  </Button>
                                )}

                                <button
                                  type="button"
                                  onClick={() => handleDeleteUser(s.id, s.name, 'Student')}
                                  style={{
                                    background: '#fef2f2',
                                    border: '1px solid #fee2e2',
                                    borderRadius: 6,
                                    color: '#dc2626',
                                    padding: '5px 8px',
                                    cursor: 'pointer',
                                    fontSize: 12,
                                  }}
                                  title="Delete Account"
                                >
                                  <i className="fas fa-trash-alt" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: TUITION PROGRAMS & PAIRING */}
          {activeTab === 'programs' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0f172a' }}>Active Tuition Programs</h3>
                  <p style={{ margin: '2px 0 0', fontSize: 12, color: '#64748b' }}>Configure multi-student programs, schedules, and paired educators</p>
                </div>
                <Button variant="primary" onClick={handleOpenCreateProgram}>
                  <i className="fas fa-plus" style={{ marginRight: 6 }} /> Create Tuition Program
                </Button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
                {programs.map((prog) => (
                  <div
                    key={prog._id}
                    style={{
                      background: '#ffffff',
                      borderRadius: 14,
                      border: '1px solid #e2e8f0',
                      padding: 20,
                      boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                        <span
                          style={{
                            background: '#eff6ff',
                            color: '#1d4ed8',
                            border: '1px solid #bfdbfe',
                            padding: '3px 8px',
                            borderRadius: 6,
                            fontFamily: 'monospace',
                            fontSize: 11,
                            fontWeight: 700,
                          }}
                        >
                          {prog.code}
                        </span>
                        <span
                          style={{
                            padding: '2px 8px',
                            borderRadius: 10,
                            fontSize: 11,
                            fontWeight: 700,
                            background: prog.status === 'active' ? '#dcfce7' : '#f1f5f9',
                            color: prog.status === 'active' ? '#15803d' : '#64748b',
                          }}
                        >
                          {prog.status.toUpperCase()}
                        </span>
                      </div>

                      <h4 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 700, color: '#0f172a' }}>
                        {prog.title}
                      </h4>
                      <p style={{ margin: '0 0 12px', fontSize: 12, color: '#64748b' }}>
                        {prog.subject} · {prog.grade || 'All Grades'}
                      </p>

                      {/* Schedule details */}
                      <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: 8, marginBottom: 12 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: 4 }}>
                          Recurring Schedule:
                        </div>
                        {prog.schedule && prog.schedule.length > 0 ? (
                          prog.schedule.map((s, idx) => (
                            <div key={idx} style={{ fontSize: 12, color: '#334155', display: 'flex', justifyContent: 'space-between' }}>
                              <span>{s.day}</span>
                              <span style={{ fontWeight: 600 }}>{s.startTime} - {s.endTime}</span>
                            </div>
                          ))
                        ) : (
                          <div style={{ fontSize: 12, color: '#94a3b8' }}>Schedule not configured</div>
                        )}
                      </div>

                      {/* Paired Teachers */}
                      <div style={{ marginBottom: 12 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: 4 }}>
                          Assigned Teachers ({prog.teacherIds?.length || 0}):
                        </div>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          {prog.teacherIds && prog.teacherIds.length > 0 ? (
                            prog.teacherIds.map((t: any, idx: number) => {
                              const tId = typeof t === 'object' ? t._id : t;
                              const tSubject = prog.teacherSubjects?.find((ts: any) => String(ts.teacherId?._id || ts.teacherId) === String(tId))?.subject || t.assignedSubject || t.subject;
                              return (
                                <span
                                  key={idx}
                                  style={{
                                    background: '#fef3c7',
                                    color: '#b45309',
                                    padding: '3px 8px',
                                    borderRadius: 6,
                                    fontSize: 11,
                                    fontWeight: 600,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 5,
                                    border: '1px solid #fde68a'
                                  }}
                                >
                                  <span>{t.name || t.displayName || 'Teacher'} {t.teacherCode ? `(${t.teacherCode})` : ''}</span>
                                  {tSubject && (
                                    <span style={{ background: '#d97706', color: '#fff', padding: '1px 5px', borderRadius: 4, fontSize: 9, fontWeight: 700 }}>
                                      {tSubject}
                                    </span>
                                  )}
                                </span>
                              );
                            })
                          ) : (
                            <span style={{ fontSize: 12, color: '#dc2626' }}>No teacher assigned</span>
                          )}
                        </div>
                      </div>

                      {/* Enrolled Students */}
                      <div style={{ marginBottom: 12 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: 4 }}>
                          Enrolled Students ({prog.enrolledStudentIds?.length || 0} / {prog.maxCapacity || 30}):
                        </div>
                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                          {prog.enrolledStudentIds && prog.enrolledStudentIds.length > 0 ? (
                            prog.enrolledStudentIds.slice(0, 5).map((s: any, idx: number) => (
                              <span
                                key={idx}
                                style={{
                                  background: '#eff6ff',
                                  color: '#1d4ed8',
                                  padding: '2px 6px',
                                  borderRadius: 4,
                                  fontSize: 10,
                                  fontWeight: 600,
                                }}
                              >
                                {s.name || 'Student'}
                              </span>
                            ))
                          ) : (
                            <span style={{ fontSize: 12, color: '#94a3b8' }}>0 students enrolled</span>
                          )}
                          {prog.enrolledStudentIds && prog.enrolledStudentIds.length > 5 && (
                            <span style={{ fontSize: 10, color: '#64748b', padding: '2px 4px' }}>
                              +{prog.enrolledStudentIds.length - 5} more
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 14, paddingTop: 12, borderTop: '1px solid #f1f5f9' }}>
                      <Button
                        variant="outline"
                        style={{ padding: '5px 10px', fontSize: 12 }}
                        onClick={() => handleOpenEditProgram(prog)}
                        title="Edit program details, subjects, faculty and roster"
                      >
                        <i className="fas fa-users-cog" style={{ marginRight: 4 }} /> Manage Roster & Edit
                      </Button>
                      <Button
                        variant="outline"
                        style={{ padding: '5px 10px', fontSize: 12, color: '#dc2626', borderColor: '#fca5a5' }}
                        onClick={() => handleDeleteProgram(prog._id, prog.title)}
                      >
                        <i className="fas fa-trash-alt" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: COMPLAINTS & GRIEVANCE TICKETS (MODULE 33 - NEW) */}
          {activeTab === 'complaints' && (
            <div style={{ background: '#ffffff', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
              {/* Header and Filters */}
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                  <div style={{ position: 'relative', width: 340 }}>
                    <Input
                      type="text"
                      placeholder="Search ticket code, reporter, subject, program..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      style={{ paddingLeft: 34, width: '100%', fontSize: 13 }}
                    />
                    <i className="fas fa-search" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  </div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>
                    Showing <strong>{filteredComplaints.length}</strong> of {complaints.length} grievance tickets
                  </div>
                </div>

                {/* Filter Pills */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                  {/* Status Filter */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#f8fafc', padding: 4, borderRadius: 8, border: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', padding: '0 6px', textTransform: 'uppercase' }}>Status:</span>
                    {(['all', 'open', 'in_review', 'resolved', 'closed'] as const).map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setComplaintStatusFilter(st)}
                        style={{
                          padding: '4px 10px',
                          borderRadius: 6,
                          border: 'none',
                          fontSize: 11,
                          fontWeight: complaintStatusFilter === st ? 700 : 500,
                          background: complaintStatusFilter === st ? '#1e293b' : 'transparent',
                          color: complaintStatusFilter === st ? '#ffffff' : '#64748b',
                          cursor: 'pointer',
                        }}
                      >
                        {st === 'in_review' ? 'In Review' : st.charAt(0).toUpperCase() + st.slice(1)}
                      </button>
                    ))}
                  </div>

                  {/* Category Filter */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Category:</span>
                    <select
                      value={complaintCategoryFilter}
                      onChange={(e) => setComplaintCategoryFilter(e.target.value)}
                      style={{
                        padding: '5px 10px',
                        borderRadius: 8,
                        border: '1px solid #cbd5e1',
                        fontSize: 12,
                        background: '#ffffff',
                        color: '#334155',
                      }}
                    >
                      <option value="all">All Categories</option>
                      <option value="Academic / Class">Academic / Class</option>
                      <option value="Conduct / Behavior">Conduct / Behavior</option>
                      <option value="Technical / SmartBoard">Technical / SmartBoard</option>
                      <option value="Schedule / Billing">Schedule / Billing</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  {/* Reporter Filter */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Reporter:</span>
                    <select
                      value={complaintReporterFilter}
                      onChange={(e) => setComplaintReporterFilter(e.target.value as any)}
                      style={{
                        padding: '5px 10px',
                        borderRadius: 8,
                        border: '1px solid #cbd5e1',
                        fontSize: 12,
                        background: '#ffffff',
                        color: '#334155',
                      }}
                    >
                      <option value="all">All Reporters</option>
                      <option value="anonymous">🕵️ Anonymous Only</option>
                      <option value="identified">👤 Identified Profile Only</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Table / List */}
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', textAlign: 'left' }}>
                      <th style={{ padding: '12px 16px', fontWeight: 600 }}>Ticket Code</th>
                      <th style={{ padding: '12px 16px', fontWeight: 600 }}>Reporter</th>
                      <th style={{ padding: '12px 16px', fontWeight: 600 }}>Category &amp; Program</th>
                      <th style={{ padding: '12px 16px', fontWeight: 600 }}>Subject &amp; Description</th>
                      <th style={{ padding: '12px 16px', fontWeight: 600 }}>Status</th>
                      <th style={{ padding: '12px 16px', fontWeight: 600 }}>Admin Notes</th>
                      <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredComplaints.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ padding: '36px 16px', textAlign: 'center', color: '#64748b' }}>
                          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>No complaints or grievance tickets found.</div>
                          <div style={{ fontSize: 12 }}>Tickets filed anonymously or with user profile will appear here.</div>
                        </td>
                      </tr>
                    ) : (
                      filteredComplaints.map((c) => {
                        const statusColors: Record<string, { bg: string; text: string }> = {
                          open: { bg: '#fee2e2', text: '#dc2626' },
                          in_review: { bg: '#fef3c7', text: '#b45309' },
                          resolved: { bg: '#dcfce7', text: '#15803d' },
                          closed: { bg: '#f1f5f9', text: '#64748b' },
                        };
                        const sc = statusColors[c.status] || { bg: '#f1f5f9', text: '#64748b' };

                        return (
                          <tr key={c._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '12px 16px' }}>
                              <span
                                style={{
                                  background: '#eff6ff',
                                  color: '#1d4ed8',
                                  border: '1px solid #bfdbfe',
                                  padding: '3px 8px',
                                  borderRadius: 6,
                                  fontFamily: 'monospace',
                                  fontSize: 12,
                                  fontWeight: 700,
                                }}
                              >
                                {c.ticketCode}
                              </span>
                              <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>
                                {new Date(c.createdAt).toLocaleDateString()}
                              </div>
                            </td>

                            <td style={{ padding: '12px 16px' }}>
                              {c.isAnonymous ? (
                                <span
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 6,
                                    background: '#f3e8ff',
                                    color: '#6b21a8',
                                    border: '1px solid #e9d5ff',
                                    padding: '3px 8px',
                                    borderRadius: 6,
                                    fontSize: 11,
                                    fontWeight: 700,
                                  }}
                                >
                                  <i className="fas fa-user-secret" /> Anonymous ({c.reporterRole})
                                </span>
                              ) : (
                                <div>
                                  <div style={{ fontWeight: 600, color: '#0f172a' }}>{c.reporter?.name || 'User'}</div>
                                  <div style={{ fontSize: 11, color: '#64748b' }}>
                                    {c.reporter?.email} · {c.reporter?.code}
                                  </div>
                                </div>
                              )}
                            </td>

                            <td style={{ padding: '12px 16px' }}>
                              <span
                                style={{
                                  background: '#f8fafc',
                                  color: '#334155',
                                  border: '1px solid #e2e8f0',
                                  padding: '2px 8px',
                                  borderRadius: 6,
                                  fontSize: 11,
                                  fontWeight: 600,
                                }}
                              >
                                {c.category}
                              </span>
                              {c.programId && (
                                <div style={{ fontSize: 11, color: '#1d4ed8', marginTop: 4, fontWeight: 500 }}>
                                  Program: {c.programId.title} ({c.programId.code})
                                </div>
                              )}
                            </td>

                            <td style={{ padding: '12px 16px', maxWidth: 300 }}>
                              <div style={{ fontWeight: 600, color: '#0f172a', marginBottom: 2 }}>{c.subject}</div>
                              <div style={{ fontSize: 12, color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {c.description}
                              </div>
                            </td>

                            <td style={{ padding: '12px 16px' }}>
                              <span
                                style={{
                                  padding: '4px 10px',
                                  borderRadius: 12,
                                  fontSize: 11,
                                  fontWeight: 700,
                                  background: sc.bg,
                                  color: sc.text,
                                  textTransform: 'uppercase',
                                }}
                              >
                                {c.status === 'in_review' ? 'In Review' : c.status}
                              </span>
                            </td>

                            <td style={{ padding: '12px 16px' }}>
                              {c.adminProgressNotes && c.adminProgressNotes.length > 0 ? (
                                <span style={{ fontSize: 12, color: '#2563eb', fontWeight: 600 }}>
                                  <i className="fas fa-comment-dots" style={{ marginRight: 4 }} />
                                  {c.adminProgressNotes.length} Note{c.adminProgressNotes.length > 1 ? 's' : ''}
                                </span>
                              ) : (
                                <span style={{ fontSize: 12, color: '#94a3b8', fontStyle: 'italic' }}>No notes yet</span>
                              )}
                            </td>

                            <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                              <Button
                                variant="primary"
                                style={{ padding: '5px 12px', fontSize: 12 }}
                                onClick={() => handleOpenComplaintModal(c)}
                              >
                                Review &amp; Update
                              </Button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: PAYOUTS & 1-YEAR COMPLIANCE VAULT */}
          {activeTab === 'payouts-compliance' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {/* Payouts Section */}
              <div style={{ background: '#ffffff', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0f172a' }}>Teacher Payouts &amp; Approvals</h3>
                    <p style={{ margin: '2px 0 0', fontSize: 12, color: '#64748b' }}>Review pending teacher compensations and disburse funds</p>
                  </div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>
                    Total Records: <strong>{payouts.length}</strong>
                  </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', textAlign: 'left' }}>
                        <th style={{ padding: '12px 16px', fontWeight: 600 }}>Teacher</th>
                        <th style={{ padding: '12px 16px', fontWeight: 600 }}>Period / Hours</th>
                        <th style={{ padding: '12px 16px', fontWeight: 600 }}>Amount</th>
                        <th style={{ padding: '12px 16px', fontWeight: 600 }}>Status</th>
                        <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'right' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payouts.length === 0 ? (
                        <tr>
                          <td colSpan={5} style={{ padding: '32px 16px', textAlign: 'center', color: '#64748b' }}>
                            No pending teacher payouts.
                          </td>
                        </tr>
                      ) : (
                        payouts.map((pay) => (
                          <tr key={pay._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '12px 16px', fontWeight: 600, color: '#0f172a' }}>
                              {pay.teacherName || pay.teacherId?.name || 'Educator'}
                            </td>
                            <td style={{ padding: '12px 16px', color: '#64748b' }}>
                              {pay.period || 'Current Billing Cycle'} ({pay.totalHours || 0} hrs)
                            </td>
                            <td style={{ padding: '12px 16px', fontWeight: 700, color: '#0f172a' }}>
                              {pay.currency} {pay.amount.toLocaleString()}
                            </td>
                            <td style={{ padding: '12px 16px' }}>
                              <span
                                style={{
                                  padding: '3px 8px',
                                  borderRadius: 10,
                                  fontSize: 11,
                                  fontWeight: 700,
                                  background: pay.status === 'approved' ? '#dcfce7' : (pay.status === 'disbursed' ? '#eff6ff' : '#fef3c7'),
                                  color: pay.status === 'approved' ? '#15803d' : (pay.status === 'disbursed' ? '#1d4ed8' : '#b45309'),
                                }}
                              >
                                {pay.status.toUpperCase()}
                              </span>
                            </td>
                            <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                              {pay.status === 'pending' ? (
                                <Button
                                  variant="primary"
                                  style={{ padding: '5px 12px', fontSize: 12 }}
                                  onClick={() => handleApprovePayout(pay._id)}
                                >
                                  Approve Payout
                                </Button>
                              ) : (
                                <span style={{ fontSize: 12, color: '#64748b' }}>Completed</span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Compliance Vault: 365-Day Recording & Chat Archive */}
              <div style={{ background: '#ffffff', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0f172a' }}>
                      <i className="fas fa-archive" style={{ color: '#7c3aed', marginRight: 8 }} />
                      365-Day Compliance Vault (Recordings &amp; Chat Audit)
                    </h3>
                    <p style={{ margin: '2px 0 0', fontSize: 12, color: '#64748b' }}>
                      Permanent regulatory retention archive for all live sessions and study group interactions
                    </p>
                  </div>
                </div>

                <div style={{ padding: 20 }}>
                  <div style={{ marginBottom: 16 }}>
                    <h4 style={{ margin: '0 0 10px', fontSize: 14, fontWeight: 700, color: '#334155' }}>
                      Recent Live Class Recordings ({recordings.length})
                    </h4>
                    {recordings.length === 0 ? (
                      <div style={{ padding: 20, textAlign: 'center', background: '#f8fafc', borderRadius: 8, color: '#64748b', fontSize: 13 }}>
                        No session recordings archived yet. Recordings will automatically stream here post-session.
                      </div>
                    ) : (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
                        {recordings.map((rec, i) => (
                          <div key={rec._id || rec.id || i} style={{ border: '1px solid #e2e8f0', borderRadius: 10, padding: 14, background: '#fafafa' }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: '#0f172a' }}>
                              Program: {rec.programCode || 'PRG-DEMO'}
                            </div>
                            <div style={{ fontSize: 11, color: '#64748b', margin: '4px 0 8px' }}>
                              Duration: {Math.round((rec.durationSeconds || 0) / 60)} mins · {new Date(rec.createdAt || '').toLocaleDateString()}
                            </div>
                            {rec.recordingUrl ? (
                              <a
                                href={rec.recordingUrl}
                                target="_blank"
                                rel="noreferrer"
                                style={{ fontSize: 12, color: '#2563eb', textDecoration: 'none', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}
                              >
                                <i className="fas fa-play" /> Replay Session Recording
                              </a>
                            ) : (
                              <span style={{ fontSize: 11, color: '#94a3b8' }}>Processing Stream...</span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <h4 style={{ margin: '0 0 10px', fontSize: 14, fontWeight: 700, color: '#334155' }}>
                      Combined Study Chat Audit Trail ({chatAudit.length})
                    </h4>
                    {chatAudit.length === 0 ? (
                      <div style={{ padding: 20, textAlign: 'center', background: '#f8fafc', borderRadius: 8, color: '#64748b', fontSize: 13 }}>
                        No chat logs archived yet.
                      </div>
                    ) : (
                      <div style={{ maxHeight: 220, overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: 8 }}>
                        {chatAudit.map((msg) => (
                          <div key={msg.id} style={{ padding: '8px 12px', borderBottom: '1px solid #f1f5f9', fontSize: 12, display: 'flex', justifyContent: 'space-between' }}>
                            <div>
                              <strong style={{ color: msg.senderRole === 'teacher' ? '#7c3aed' : '#2563eb' }}>
                                {msg.senderName} ({msg.senderRole}):
                              </strong>{' '}
                              <span style={{ color: '#334155' }}>{msg.content}</span>
                            </div>
                            <span style={{ fontSize: 10, color: '#94a3b8' }}>
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* COMPLAINT REVIEW & RESOLUTION MODAL */}
      {selectedComplaint && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: 20,
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: 16,
              width: '100%',
              maxWidth: 620,
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)',
              overflow: 'hidden',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0f172a' }}>
                  Grievance Ticket: {selectedComplaint.ticketCode}
                </h3>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                  Category: <strong>{selectedComplaint.category}</strong> · Filed: {new Date(selectedComplaint.createdAt).toLocaleString()}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedComplaint(null)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 16, color: '#64748b' }}
              >
                <i className="fas fa-times" />
              </button>
            </div>

            <div style={{ padding: 20, overflowY: 'auto', flex: 1 }}>
              {/* Reporter Box */}
              <div style={{ background: '#f8fafc', padding: 12, borderRadius: 10, marginBottom: 16, border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 4 }}>
                  Reporter Identity:
                </div>
                {selectedComplaint.isAnonymous ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#6b21a8', fontWeight: 600, fontSize: 13 }}>
                    <i className="fas fa-user-secret" style={{ fontSize: 16 }} />
                    <span>Submitted Anonymously by a {selectedComplaint.reporterRole.toUpperCase()}</span>
                    <span style={{ fontSize: 11, background: '#f3e8ff', padding: '1px 6px', borderRadius: 4 }}>Masked</span>
                  </div>
                ) : (
                  <div style={{ fontSize: 13, color: '#0f172a' }}>
                    <strong>{selectedComplaint.reporter?.name}</strong> ({selectedComplaint.reporter?.role}) · {selectedComplaint.reporter?.email}
                    {selectedComplaint.reporter?.code && <span style={{ marginLeft: 6, fontFamily: 'monospace', color: '#b45309' }}>[{selectedComplaint.reporter.code}]</span>}
                  </div>
                )}
                {selectedComplaint.programId && (
                  <div style={{ fontSize: 12, color: '#1d4ed8', marginTop: 6 }}>
                    Related Program: <strong>{selectedComplaint.programId.title}</strong> ({selectedComplaint.programId.code})
                  </div>
                )}
              </div>

              {/* Subject & Description */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 4 }}>Subject:</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', marginBottom: 10 }}>{selectedComplaint.subject}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 4 }}>Description:</div>
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: 12, borderRadius: 8, fontSize: 13, color: '#334155', whiteSpace: 'pre-wrap' }}>
                  {selectedComplaint.description}
                </div>
              </div>

              {/* Progress Timeline / Admin Notes */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 8 }}>
                  Progress Timeline &amp; Notes ({selectedComplaint.adminProgressNotes?.length || 0}):
                </div>
                {selectedComplaint.adminProgressNotes && selectedComplaint.adminProgressNotes.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 160, overflowY: 'auto' }}>
                    {selectedComplaint.adminProgressNotes.map((note, idx) => (
                      <div key={idx} style={{ background: '#f8fafc', padding: '8px 12px', borderRadius: 8, borderLeft: '3px solid #3b82f6' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#64748b', marginBottom: 2 }}>
                          <span style={{ fontWeight: 600 }}>{note.updatedBy || 'EduPye Admin'}</span>
                          <span>{new Date(note.updatedAt).toLocaleString()}</span>
                        </div>
                        <div style={{ fontSize: 12, color: '#1e293b' }}>{note.message}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ fontSize: 12, color: '#94a3b8', fontStyle: 'italic' }}>
                    No progress updates posted yet.
                  </div>
                )}
              </div>

              {/* Update Form */}
              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 16 }}>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                    Update Ticket Status:
                  </label>
                  <select
                    value={updatingStatus}
                    onChange={(e) => setUpdatingStatus(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: 8,
                      border: '1px solid #cbd5e1',
                      fontSize: 13,
                      background: '#ffffff',
                    }}
                  >
                    <option value="open">Open (Investigating)</option>
                    <option value="in_review">In Review (Action in Progress)</option>
                    <option value="resolved">Resolved (Issue Addressed)</option>
                    <option value="closed">Closed (Archived)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                    Append Admin Progress Note (Visible to Reporter):
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Enter resolution notes, investigator findings, or next steps..."
                    value={newAdminNote}
                    onChange={(e) => setNewAdminNote(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: 8,
                      border: '1px solid #cbd5e1',
                      fontSize: 13,
                      fontFamily: 'inherit',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>
            </div>

            <div style={{ padding: '16px 20px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <Button type="button" variant="outline" onClick={() => setSelectedComplaint(null)}>
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={handleSaveComplaintUpdate}
                disabled={isUpdatingComplaint}
              >
                {isUpdatingComplaint ? 'Saving...' : 'Save & Update Ticket'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT PROGRAM MODAL */}
      {isProgramModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: 20,
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: 16,
              width: '100%',
              maxWidth: 720,
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)',
              overflow: 'hidden',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0f172a' }}>
                {editingProgram ? 'Edit Tuition Program' : 'Create Tuition Program'}
              </h3>
              <button
                type="button"
                onClick={() => setIsProgramModalOpen(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 16, color: '#64748b' }}
              >
                <i className="fas fa-times" />
              </button>
            </div>

            <form onSubmit={handleSaveProgram} style={{ padding: 20, overflowY: 'auto' }}>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#334155', marginBottom: 4 }}>
                  Program Title *
                </label>
                <Input
                  type="text"
                  placeholder="e.g. Class 12 Advanced Physics Cohort A"
                  value={programForm.title}
                  onChange={(e) => setProgramForm({ ...programForm, title: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#334155', marginBottom: 4 }}>
                    Subject *
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g. Physics, Chemistry, Math"
                    value={programForm.subject}
                    onChange={(e) => setProgramForm({ ...programForm, subject: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#334155', marginBottom: 4 }}>
                    Grade / Target
                  </label>
                  <Input
                    type="text"
                    placeholder="Class 12 / JEE / NEET"
                    value={programForm.grade}
                    onChange={(e) => setProgramForm({ ...programForm, grade: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#334155', marginBottom: 4 }}>
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Brief curriculum description..."
                  value={programForm.description}
                  onChange={(e) => setProgramForm({ ...programForm, description: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 8,
                    border: '1px solid #cbd5e1',
                    fontSize: 13,
                    fontFamily: 'inherit',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#334155', marginBottom: 4 }}>
                  Recurring Schedule Days (Comma-separated)
                </label>
                <Input
                  type="text"
                  placeholder="Monday, Wednesday, Friday"
                  value={programForm.scheduleDays}
                  onChange={(e) => setProgramForm({ ...programForm, scheduleDays: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#334155', marginBottom: 4 }}>
                    Start Time
                  </label>
                  <Input
                    type="text"
                    placeholder="17:00"
                    value={programForm.startTime}
                    onChange={(e) => setProgramForm({ ...programForm, startTime: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#334155', marginBottom: 4 }}>
                    End Time
                  </label>
                  <Input
                    type="text"
                    placeholder="18:30"
                    value={programForm.endTime}
                    onChange={(e) => setProgramForm({ ...programForm, endTime: e.target.value })}
                  />
                </div>
              </div>

              {/* MULTI-TEACHER ASSIGNMENT & SUBJECT MAPPING */}
              <div style={{ marginBottom: 16, background: '#f8fafc', padding: 14, borderRadius: 12, border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'between', marginBottom: 8 }}>
                  <label style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>
                    Assigned Faculty / Teachers ({programForm.selectedTeacherIds.length})
                  </label>
                  <span style={{ fontSize: 11, color: '#64748b' }}>
                    Multi-teacher support (e.g. Physics, Chemistry, Maths)
                  </span>
                </div>

                <div style={{ marginBottom: 8 }}>
                  <Input
                    type="text"
                    placeholder="Search verified teachers by name or code..."
                    value={teacherSearchTerm}
                    onChange={(e) => setTeacherSearchTerm(e.target.value)}
                    style={{ fontSize: 12, padding: '6px 10px' }}
                  />
                </div>

                <div style={{ maxHeight: 160, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {teachers
                    .filter((t) => {
                      if (!teacherSearchTerm.trim()) return true;
                      const term = teacherSearchTerm.toLowerCase();
                      return (t.name || '').toLowerCase().includes(term) || (t.teacherCode || '').toLowerCase().includes(term);
                    })
                    .map((t) => {
                      const isSelected = programForm.selectedTeacherIds.includes(t.id);
                      const currentSubject = programForm.teacherSubjects[t.id] || programForm.subject || 'General';
                      return (
                        <div
                          key={t.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '8px 10px',
                            borderRadius: 8,
                            background: isSelected ? '#fef3c7' : '#ffffff',
                            border: isSelected ? '1px solid #f59e0b' : '1px solid #e2e8f0',
                            gap: 10,
                          }}
                        >
                          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', flex: 1, minWidth: 0 }}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                const nextIds = e.target.checked
                                  ? [...programForm.selectedTeacherIds, t.id]
                                  : programForm.selectedTeacherIds.filter((id) => id !== t.id);
                                const nextSubjects = { ...programForm.teacherSubjects };
                                if (e.target.checked && !nextSubjects[t.id]) {
                                  nextSubjects[t.id] = (t.subjects && t.subjects[0]) || programForm.subject || 'Subject';
                                } else if (!e.target.checked) {
                                  delete nextSubjects[t.id];
                                }
                                setProgramForm({
                                  ...programForm,
                                  selectedTeacherIds: nextIds,
                                  teacherSubjects: nextSubjects,
                                });
                              }}
                            />
                            <div style={{ minWidth: 0 }}>
                              <div style={{ fontSize: 12, fontWeight: 700, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {t.name}
                              </div>
                              <div style={{ fontSize: 10, color: '#64748b', display: 'flex', gap: 6 }}>
                                <span>{t.teacherCode || 'Code Pending'}</span>
                                <span>• Active in {t.assignedPrograms?.length || 0} batches</span>
                              </div>
                            </div>
                          </label>

                          {isSelected && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                              <span style={{ fontSize: 10, fontWeight: 600, color: '#b45309' }}>Role/Subject:</span>
                              <input
                                type="text"
                                value={currentSubject}
                                onChange={(e) =>
                                  setProgramForm({
                                    ...programForm,
                                    teacherSubjects: {
                                      ...programForm.teacherSubjects,
                                      [t.id]: e.target.value,
                                    },
                                  })
                                }
                                placeholder="e.g. Physics"
                                style={{
                                  fontSize: 11,
                                  fontWeight: 600,
                                  padding: '3px 8px',
                                  borderRadius: 6,
                                  border: '1px solid #f59e0b',
                                  background: '#ffffff',
                                  width: 110,
                                }}
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* MULTI-STUDENT ROSTER ENROLLMENT */}
              <div style={{ marginBottom: 16, background: '#f8fafc', padding: 14, borderRadius: 12, border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <label style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>
                    Enrolled Students ({programForm.selectedStudentIds.length} / {programForm.maxCapacity || 30})
                  </label>
                  <span style={{ fontSize: 11, color: '#64748b' }}>
                    Students can belong to multiple batches simultaneously
                  </span>
                </div>

                <div style={{ marginBottom: 8 }}>
                  <Input
                    type="text"
                    placeholder="Search approved students by name or STU-code..."
                    value={studentSearchTerm}
                    onChange={(e) => setStudentSearchTerm(e.target.value)}
                    style={{ fontSize: 12, padding: '6px 10px' }}
                  />
                </div>

                <div style={{ maxHeight: 160, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {students
                    .filter((s) => {
                      if (!studentSearchTerm.trim()) return true;
                      const term = studentSearchTerm.toLowerCase();
                      return (s.name || '').toLowerCase().includes(term) || (s.studentCode || '').toLowerCase().includes(term);
                    })
                    .map((s) => {
                      const isSelected = programForm.selectedStudentIds.includes(s.id);
                      return (
                        <label
                          key={s.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '8px 10px',
                            borderRadius: 8,
                            background: isSelected ? '#eff6ff' : '#ffffff',
                            border: isSelected ? '1px solid #3b82f6' : '1px solid #e2e8f0',
                            cursor: 'pointer',
                            gap: 10,
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                const nextIds = e.target.checked
                                  ? [...programForm.selectedStudentIds, s.id]
                                  : programForm.selectedStudentIds.filter((id) => id !== s.id);
                                setProgramForm({
                                  ...programForm,
                                  selectedStudentIds: nextIds,
                                });
                              }}
                            />
                            <div style={{ minWidth: 0 }}>
                              <div style={{ fontSize: 12, fontWeight: 700, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {s.name}
                              </div>
                              <div style={{ fontSize: 10, color: '#64748b' }}>
                                {s.studentCode || 'Code Pending'} • {s.grade || 'Standard'}
                              </div>
                            </div>
                          </div>

                          <span style={{ fontSize: 10, color: '#1d4ed8', background: '#dbeafe', padding: '2px 6px', borderRadius: 4, flexShrink: 0 }}>
                            Active in {s.enrolledPrograms?.length || 0} batches
                          </span>
                        </label>
                      );
                    })}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 20 }}>
                <Button type="button" variant="outline" onClick={() => setIsProgramModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  {editingProgram ? 'Update Program Roster' : 'Create Program with Roster'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ASSIGN STUDENT TO PROGRAM MODAL */}
      {assigningStudent && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: 20,
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: 16,
              width: '100%',
              maxWidth: 460,
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)',
              overflow: 'hidden',
            }}
          >
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0f172a' }}>
                Assign Student to Tuition Program
              </h3>
              <button
                type="button"
                onClick={() => setAssigningStudent(null)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 16, color: '#64748b' }}
              >
                <i className="fas fa-times" />
              </button>
            </div>

            <div style={{ padding: 20 }}>
              <p style={{ margin: '0 0 14px', fontSize: 13, color: '#334155' }}>
                Approve tuition access and enroll <strong>{assigningStudent.name}</strong> into a scheduled Tuition Program:
              </p>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#334155', marginBottom: 4 }}>
                  Select Program
                </label>
                <select
                  value={selectedProgramId}
                  onChange={(e) => setSelectedProgramId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: 8,
                    border: '1px solid #cbd5e1',
                    fontSize: 13,
                    background: '#ffffff',
                  }}
                >
                  <option value="">-- None (Approve Code Only) --</option>
                  {programs.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.title} ({p.code})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <Button type="button" variant="outline" onClick={() => setAssigningStudent(null)}>
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  onClick={() => handleApproveStudent(assigningStudent.id, selectedProgramId || undefined)}
                >
                  Confirm &amp; Issue Code
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SCHEDULE TUTOR INTERVIEW MODAL */}
      {interviewingTeacher && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: 20,
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: 16,
              width: '100%',
              maxWidth: 480,
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)',
              overflow: 'hidden',
            }}
          >
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0f172a' }}>
                Schedule Tutor Interview
              </h3>
              <button
                type="button"
                onClick={() => setInterviewingTeacher(null)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 16, color: '#64748b' }}
              >
                <i className="fas fa-times" />
              </button>
            </div>

            <div style={{ padding: 20 }}>
              <div style={{ marginBottom: 16, padding: '10px 14px', background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                <div style={{ fontWeight: 600, color: '#0f172a', fontSize: 14 }}>{interviewingTeacher.name}</div>
                <div style={{ fontSize: 12, color: '#64748b' }}>{interviewingTeacher.email}</div>
                {interviewingTeacher.phone && (
                  <div style={{ fontSize: 12, color: '#0369a1', marginTop: 2 }}>
                    <i className="fas fa-phone-alt" style={{ marginRight: 4 }} />
                    {interviewingTeacher.phone}
                  </div>
                )}
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#334155', marginBottom: 4 }}>
                  Interview Date &amp; Time
                </label>
                <input
                  type="datetime-local"
                  value={interviewDate}
                  onChange={(e) => setInterviewDate(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 8,
                    border: '1px solid #cbd5e1',
                    fontSize: 13,
                    background: '#ffffff',
                  }}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#334155', marginBottom: 4 }}>
                  Interview Notes / Meeting Link
                </label>
                <textarea
                  rows={3}
                  value={interviewNotes}
                  onChange={(e) => setInterviewNotes(e.target.value)}
                  placeholder="e.g. Google Meet link, candidate background notes, screening rubric..."
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 8,
                    border: '1px solid #cbd5e1',
                    fontSize: 13,
                    background: '#ffffff',
                    resize: 'vertical',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <Button type="button" variant="outline" onClick={() => setInterviewingTeacher(null)}>
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  disabled={isSubmittingInterview}
                  onClick={handleSaveInterview}
                >
                  {isSubmittingInterview ? 'Scheduling...' : 'Save & Set Interview'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EdupyeTuitionAdminPage;