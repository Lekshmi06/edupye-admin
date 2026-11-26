import React, { useState, useEffect, useCallback } from 'react';
import {
  tuitionAdminService,
  type AcademyEnquiryItem,
  type AdminTeacherItem,
} from '../../../services/tuitionAdmin.service';
import { useToast } from '../../../hooks/useToast';
import { Loader } from '../../common/Loader';

interface EnquiryManagerViewProps {
  academicSession: string;
  onNavigateNewAdmission: () => void;
}

export const EnquiryManagerView: React.FC<EnquiryManagerViewProps> = ({
  academicSession,
  onNavigateNewAdmission,
}) => {
  const { showToast } = useToast();
  const [enquiries, setEnquiries] = useState<AcademyEnquiryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Available Tutors
  const [tutors, setTutors] = useState<AdminTeacherItem[]>([]);
  const [loadingTutors, setLoadingTutors] = useState(false);

  // Demo Class Modal States
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [activeDemoEnquiry, setActiveDemoEnquiry] = useState<AcademyEnquiryItem | null>(null);
  const [demoTutorId, setDemoTutorId] = useState('');
  const [demoSubject, setDemoSubject] = useState('');
  const [demoDate, setDemoDate] = useState('');
  const [demoTime, setDemoTime] = useState('17:00');
  const [demoNotes, setDemoNotes] = useState('');
  const [demoSchedulingLoading, setDemoSchedulingLoading] = useState(false);
  const [demoSuccessDetails, setDemoSuccessDetails] = useState<any | null>(null);
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [copiedStudentLink, setCopiedStudentLink] = useState(false);
  const [copiedTeacherLink, setCopiedTeacherLink] = useState(false);

  // Form states
  const [studentName, setStudentName] = useState('');
  const [parentName, setParentName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [grade, setGrade] = useState('Class 12');
  const [subjectsStr, setSubjectsStr] = useState('Physics, Mathematics');
  const [notes, setNotes] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');

  const loadTutors = useCallback(async () => {
    try {
      setLoadingTutors(true);
      const list = await tuitionAdminService.getTeachers();
      const approvedTutors = list.filter(
        (t) => t.tuitionApprovalStatus === 'approved' || Boolean(t.teacherCode)
      );
      setTutors(approvedTutors);
    } catch (err) {
      console.warn('Could not load tutors for demo scheduling:', err);
    } finally {
      setLoadingTutors(false);
    }
  }, []);

  const loadEnquiries = useCallback(async () => {
    try {
      setLoading(true);
      const data = await tuitionAdminService.getEnquiries({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        session: academicSession,
      });
      setEnquiries(data);
    } catch (err: any) {
      showToast(err.message || 'Failed to load enquiries', 'error');
    } finally {
      setLoading(false);
    }
  }, [academicSession, statusFilter, showToast]);

  useEffect(() => {
    loadEnquiries();
    loadTutors();
  }, [loadEnquiries, loadTutors]);

  const handleCreateEnquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim() || !parentName.trim() || !phone.trim()) {
      showToast('Please fill all required fields.', 'warning');
      return;
    }

    try {
      setSubmitting(true);
      const subjects = subjectsStr
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      await tuitionAdminService.createEnquiry({
        studentName: studentName.trim(),
        parentName: parentName.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        grade,
        subjects,
        notes: notes.trim(),
        followUpDate: followUpDate || undefined,
        session: academicSession,
      });

      showToast(`Enquiry for ${studentName} logged successfully!`, 'success');
      setShowAddModal(false);
      setStudentName('');
      setParentName('');
      setPhone('');
      setEmail('');
      setNotes('');
      loadEnquiries();
    } catch (err: any) {
      showToast(err.message || 'Failed to log enquiry', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await tuitionAdminService.updateEnquiryStatus(id, { status: newStatus });
      showToast('Enquiry status updated', 'info');
      loadEnquiries();
    } catch (err: any) {
      showToast(err.message || 'Failed to update status', 'error');
    }
  };

  const getFrontendClientBaseUrl = () => {
    if (typeof window !== 'undefined') {
      const { protocol, hostname, port } = window.location;
      if (port === '5174') {
        return `${protocol}//${hostname}:5173`;
      }
      return `${protocol}//${hostname}${port ? ':' + port : ''}`;
    }
    return 'http://localhost:5173';
  };

  const handleOpenScheduleDemoModal = (enq: AcademyEnquiryItem) => {
    setActiveDemoEnquiry(enq);
    setDemoSubject(enq.demoSubject || enq.subjects?.[0] || 'General');

    if (enq.assignedTutorId) {
      setDemoTutorId(enq.assignedTutorId);
    } else if (tutors.length > 0) {
      setDemoTutorId(tutors[0].id);
    } else {
      setDemoTutorId('');
    }

    if (enq.demoScheduledAt) {
      const d = new Date(enq.demoScheduledAt);
      setDemoDate(d.toISOString().split('T')[0]);
      const hours = String(d.getHours()).padStart(2, '0');
      const mins = String(d.getMinutes()).padStart(2, '0');
      setDemoTime(`${hours}:${mins}`);
    } else {
      const tomorrow = new Date(Date.now() + 86400000);
      setDemoDate(tomorrow.toISOString().split('T')[0]);
      setDemoTime('17:00');
    }

    setDemoNotes('');
    setCopiedStudentLink(false);
    setCopiedTeacherLink(false);

    if (enq.demoRoomId && enq.studentToken && enq.teacherToken) {
      const base = getFrontendClientBaseUrl();
      setDemoSuccessDetails({
        demoRoomId: enq.demoRoomId,
        studentToken: enq.studentToken,
        teacherToken: enq.teacherToken,
        studentLink: `${base}/demo-room/${enq.studentToken}`,
        teacherLink: `${base}/demo-room/${enq.teacherToken}`,
        subject: enq.demoSubject || enq.subjects?.[0] || 'General',
        scheduledAt: enq.demoScheduledAt,
        assignedTutor: {
          id: enq.assignedTutorId,
          code: enq.assignedTutorCode,
          name: enq.assignedTutorName,
        },
      });
      setIsRescheduling(false);
    } else {
      setDemoSuccessDetails(null);
      setIsRescheduling(true);
    }

    setShowDemoModal(true);
  };

  const handleStatusSelect = (enq: AcademyEnquiryItem, newStatus: string) => {
    if (newStatus === 'Demo Scheduled') {
      handleOpenScheduleDemoModal(enq);
    } else {
      handleStatusChange(enq._id, newStatus);
    }
  };

  const handleSubmitScheduleDemo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDemoEnquiry) return;
    if (!demoDate || !demoTime) {
      showToast('Please select demo date and time', 'warning');
      return;
    }

    const scheduledAt = `${demoDate}T${demoTime}:00`;
    const selectedTutor = tutors.find((t) => t.id === demoTutorId);

    try {
      setDemoSchedulingLoading(true);
      const res = await tuitionAdminService.scheduleDemo(activeDemoEnquiry._id, {
        tutorId: selectedTutor?.id,
        tutorCode: selectedTutor?.teacherCode || undefined,
        tutorName: selectedTutor?.name || undefined,
        subject: demoSubject || activeDemoEnquiry.subjects?.[0] || 'General',
        scheduledAt,
        notes: demoNotes.trim() || undefined,
      });

      showToast(`Trial Demo scheduled with ${selectedTutor?.name || 'Tutor'}!`, 'success');
      setDemoSuccessDetails(res.demoDetails);
      setIsRescheduling(false);
      loadEnquiries();
    } catch (err: any) {
      showToast(err.message || 'Failed to schedule demo class', 'error');
    } finally {
      setDemoSchedulingLoading(false);
    }
  };

  const formatCleanPhone = (phoneStr: string) => {
    const digits = (phoneStr || '').replace(/[^0-9]/g, '');
    if (digits.length === 10) return `91${digits}`;
    return digits;
  };

  const copyToClipboard = (text: string, type: 'student' | 'teacher') => {
    navigator.clipboard.writeText(text);
    if (type === 'student') {
      setCopiedStudentLink(true);
      setTimeout(() => setCopiedStudentLink(false), 3000);
    } else {
      setCopiedTeacherLink(true);
      setTimeout(() => setCopiedTeacherLink(false), 3000);
    }
    showToast('Meeting link copied to clipboard!', 'info');
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
              ADMISSION PIPELINE
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
            Tuition Admission Enquiries & Lead Tracker
          </h2>
          <p style={{ margin: 0, fontSize: '13px', color: '#64748B' }}>
            Capture parent inquiries, trial class requests, follow-ups, and convert leads into registered students.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          style={{
            padding: '10px 18px',
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
          <i className="fas fa-user-plus" /> + Log New Enquiry
        </button>
      </div>

      {/* 2. Filter Tabs */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '14px',
          padding: '16px 20px',
          border: '1px solid #E2E8F0',
          display: 'flex',
          gap: '10px',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#475569' }}>Stage:</span>
        {(['all', 'New', 'Contacted', 'Demo Scheduled', 'Converted', 'Closed'] as const).map((st) => (
          <button
            key={st}
            type="button"
            onClick={() => setStatusFilter(st)}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              border: statusFilter === st ? 'none' : '1px solid #E2E8F0',
              backgroundColor: statusFilter === st ? '#0F1E36' : '#FFFFFF',
              color: statusFilter === st ? '#FFFFFF' : '#475569',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {st === 'all' ? 'All Leads' : st}
          </button>
        ))}
      </div>

      {/* 3. Table */}
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
            Enquiries List ({enquiries.length})
          </span>
          <button
            type="button"
            onClick={loadEnquiries}
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
        ) : enquiries.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px 20px' }}>
            <i className="fas fa-user-clock" style={{ fontSize: '32px', color: '#94A3B8', marginBottom: '10px' }} />
            <h4 style={{ margin: '0 0 4px', fontSize: '15px', color: '#0F1E36' }}>No admission enquiries found</h4>
            <p style={{ margin: 0, fontSize: '13px', color: '#64748B' }}>
              Click "+ Log New Enquiry" to add prospective student leads.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                  <th style={{ padding: '12px 18px', fontWeight: 700, color: '#475569' }}>PROSPECTIVE STUDENT</th>
                  <th style={{ padding: '12px 18px', fontWeight: 700, color: '#475569' }}>PARENT & PHONE</th>
                  <th style={{ padding: '12px 18px', fontWeight: 700, color: '#475569' }}>GRADE & SUBJECTS</th>
                  <th style={{ padding: '12px 18px', fontWeight: 700, color: '#475569' }}>FOLLOW-UP</th>
                  <th style={{ padding: '12px 18px', fontWeight: 700, color: '#475569' }}>STAGE STATUS</th>
                  <th style={{ padding: '12px 18px', fontWeight: 700, color: '#475569' }}>NOTES</th>
                  <th style={{ padding: '12px 18px', fontWeight: 700, color: '#475569' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {enquiries.map((enq, idx) => (
                  <tr
                    key={enq._id}
                    style={{
                      borderBottom: idx === enquiries.length - 1 ? 'none' : '1px solid #F1F5F9',
                      backgroundColor: idx % 2 === 0 ? '#FFFFFF' : '#FAFAFA',
                    }}
                  >
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ fontWeight: 700, color: '#0F1E36' }}>{enq.studentName}</div>
                      {enq.email && <div style={{ fontSize: '11px', color: '#64748B' }}>{enq.email}</div>}
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ fontWeight: 600, color: '#334155' }}>{enq.parentName}</div>
                      <div style={{ fontSize: '11.5px', color: '#2563EB', fontWeight: 600 }}>{enq.phone}</div>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <span style={{ fontWeight: 700, color: '#0F1E36' }}>{enq.grade}</span>
                      <div style={{ fontSize: '11px', color: '#64748B' }}>{enq.subjects?.join(', ') || 'General'}</div>
                    </td>
                    <td style={{ padding: '14px 18px', color: '#64748B' }}>
                      {enq.followUpDate || 'No date set'}
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <select
                        value={enq.status}
                        onChange={(e) => handleStatusSelect(enq, e.target.value)}
                        style={{
                          padding: '5px 8px',
                          borderRadius: '6px',
                          border: '1px solid #CBD5E1',
                          fontSize: '11.5px',
                          fontWeight: 700,
                          outline: 'none',
                          backgroundColor:
                            enq.status === 'Converted'
                              ? '#ECFDF5'
                              : enq.status === 'Demo Scheduled'
                              ? '#EFF6FF'
                              : '#FFFBEB',
                          color:
                            enq.status === 'Converted'
                              ? '#059669'
                              : enq.status === 'Demo Scheduled'
                              ? '#2563EB'
                              : '#D97706',
                        }}
                      >
                        <option value="New">New</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Demo Scheduled">Demo Scheduled</option>
                        <option value="Converted">Converted</option>
                        <option value="Closed">Closed</option>
                      </select>

                      {enq.status === 'Demo Scheduled' && (
                        <div
                          style={{
                            marginTop: '6px',
                            padding: '6px 8px',
                            borderRadius: '6px',
                            backgroundColor: '#EFF6FF',
                            border: '1px solid #BFDBFE',
                            fontSize: '11px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '3px',
                          }}
                        >
                          <div style={{ fontWeight: 700, color: '#1E40AF', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <i className="fas fa-video" style={{ fontSize: '10px' }} />
                            <span>{enq.demoSubject || 'Demo Class'}</span>
                          </div>
                          <div style={{ color: '#3B82F6', fontWeight: 600 }}>
                            {enq.assignedTutorName ? `Tutor: ${enq.assignedTutorName}` : 'Tutor Assigned'}
                          </div>
                          {enq.demoScheduledAt && (
                            <div style={{ color: '#64748B', fontSize: '10px' }}>
                              {new Date(enq.demoScheduledAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={() => handleOpenScheduleDemoModal(enq)}
                            style={{
                              marginTop: '2px',
                              background: 'none',
                              border: 'none',
                              padding: 0,
                              color: '#2563EB',
                              fontSize: '10.5px',
                              fontWeight: 700,
                              textDecoration: 'underline',
                              cursor: 'pointer',
                              textAlign: 'left',
                            }}
                          >
                            View Links / Reschedule
                          </button>
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '14px 18px', color: '#475569', fontSize: '12px', maxWidth: '240px' }}>
                      {enq.notes || '--'}
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <button
                          type="button"
                          onClick={() => handleOpenScheduleDemoModal(enq)}
                          style={{
                            padding: '6px 10px',
                            backgroundColor: enq.demoRoomId ? '#F0FDF4' : '#EFF6FF',
                            color: enq.demoRoomId ? '#166534' : '#1D4ED8',
                            border: enq.demoRoomId ? '1px solid #BBF7D0' : '1px solid #BFDBFE',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                            whiteSpace: 'nowrap',
                          }}
                          title={enq.demoRoomId ? 'View shareable demo meeting links' : 'Schedule a live demo trial class'}
                        >
                          <i className={enq.demoRoomId ? 'fas fa-link' : 'fas fa-video'} />
                          <span>{enq.demoRoomId ? 'Room Links' : 'Schedule Demo'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={onNavigateNewAdmission}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#2563EB',
                            color: '#FFFFFF',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '11.5px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          <i className="fas fa-user-check" /> Convert
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 4. Log Enquiry Modal */}
      {showAddModal && (
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
          onClick={() => setShowAddModal(false)}
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
                  <i className="fas fa-user-plus" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#0F1E36' }}>
                    Record Admission Enquiry
                  </h3>
                  <p style={{ margin: 0, fontSize: '12px', color: '#64748B' }}>
                    Capture prospective student inquiry & follow-up
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                style={{ background: 'none', border: 'none', color: '#94A3B8', fontSize: '16px', cursor: 'pointer' }}
              >
                <i className="fas fa-times" />
              </button>
            </div>

            <form onSubmit={handleCreateEnquiry} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Student Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
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
                    Parent / Guardian Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Amit Sharma"
                    value={parentName}
                    onChange={(e) => setParentName(e.target.value)}
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
                    Contact Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
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
                    Email (Optional)
                  </label>
                  <input
                    type="email"
                    placeholder="parent@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                    Target Class / Grade
                  </label>
                  <select
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
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
                    <option value="Class 12">Class 12</option>
                    <option value="Class 11">Class 11</option>
                    <option value="Class 10">Class 10</option>
                    <option value="Class 9">Class 9</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Next Follow-up Date
                  </label>
                  <input
                    type="date"
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
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

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Target Subjects (Comma Separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Physics, Chemistry, Mathematics"
                  value={subjectsStr}
                  onChange={(e) => setSubjectsStr(e.target.value)}
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
                  Parent Notes / Tuition Requirements
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Prefers evening batch, preparing for JEE Main, requires demo class on Saturday"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '13px',
                    outline: 'none',
                    resize: 'vertical',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
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
                    backgroundColor: '#10B981',
                    color: '#FFFFFF',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {submitting ? 'Logging...' : 'Save Enquiry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Schedule Demo Trial Class Modal */}
      {showDemoModal && activeDemoEnquiry && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(5px)',
            zIndex: 130,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '680px',
              maxHeight: '92vh',
              overflowY: 'auto',
              border: '1px solid #E2E8F0',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              padding: '26px',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                borderBottom: '1px solid #E2E8F0',
                paddingBottom: '16px',
                marginBottom: '20px',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    style={{
                      backgroundColor: '#EFF6FF',
                      color: '#2563EB',
                      padding: '3px 8px',
                      borderRadius: '5px',
                      fontSize: '11px',
                      fontWeight: 800,
                      letterSpacing: '0.04em',
                    }}
                  >
                    TRIAL CLASS WORKFLOW
                  </span>
                  {activeDemoEnquiry.demoRoomId && (
                    <span
                      style={{
                        backgroundColor: '#ECFDF5',
                        color: '#059669',
                        padding: '3px 8px',
                        borderRadius: '5px',
                        fontSize: '11px',
                        fontWeight: 700,
                        fontFamily: 'monospace',
                      }}
                    >
                      {activeDemoEnquiry.demoRoomId}
                    </span>
                  )}
                </div>
                <h3
                  style={{
                    margin: '6px 0 2px',
                    fontSize: '19px',
                    fontWeight: 800,
                    color: '#0F1E36',
                  }}
                >
                  {demoSuccessDetails && !isRescheduling
                    ? 'Demo Meeting Room Links & Share'
                    : 'Schedule Trial Demo Class'}
                </h3>
                <p style={{ margin: 0, fontSize: '12.5px', color: '#64748B' }}>
                  Student: <strong>{activeDemoEnquiry.studentName}</strong> ({activeDemoEnquiry.grade}) &bull; Parent:{' '}
                  <strong>{activeDemoEnquiry.parentName}</strong> ({activeDemoEnquiry.phone})
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowDemoModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94A3B8',
                  fontSize: '18px',
                  cursor: 'pointer',
                  padding: '4px',
                }}
              >
                <i className="fas fa-times" />
              </button>
            </div>

            {/* View Mode: Shareable Links Display */}
            {demoSuccessDetails && !isRescheduling ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                {/* Demo Summary Card */}
                <div
                  style={{
                    backgroundColor: '#F8FAFC',
                    borderRadius: '12px',
                    border: '1px solid #E2E8F0',
                    padding: '14px 18px',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: '12px',
                    fontSize: '12.5px',
                  }}
                >
                  <div>
                    <span style={{ color: '#64748B', display: 'block', fontSize: '11px', fontWeight: 600 }}>
                      DEMO SUBJECT
                    </span>
                    <strong style={{ color: '#0F1E36' }}>
                      {demoSuccessDetails.subject || activeDemoEnquiry.demoSubject || 'General Tuition'}
                    </strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748B', display: 'block', fontSize: '11px', fontWeight: 600 }}>
                      ASSIGNED TUTOR
                    </span>
                    <strong style={{ color: '#0F1E36' }}>
                      {demoSuccessDetails.assignedTutor?.name || activeDemoEnquiry.assignedTutorName || 'Tutor'}{' '}
                      <span style={{ color: '#2563EB', fontSize: '11px' }}>
                        ({demoSuccessDetails.assignedTutor?.code || activeDemoEnquiry.assignedTutorCode || 'TCH'})
                      </span>
                    </strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748B', display: 'block', fontSize: '11px', fontWeight: 600 }}>
                      SCHEDULED DATE &amp; TIME
                    </span>
                    <strong style={{ color: '#0F1E36' }}>
                      {demoSuccessDetails.scheduledAt
                        ? new Date(demoSuccessDetails.scheduledAt).toLocaleString([], {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })
                        : 'Scheduled'}
                    </strong>
                  </div>
                </div>

                {/* 1. Student Access Box */}
                <div
                  style={{
                    backgroundColor: '#F0FDF4',
                    border: '1px solid #BBF7D0',
                    borderRadius: '12px',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span
                        style={{
                          backgroundColor: '#22C55E',
                          color: '#FFFFFF',
                          borderRadius: '50%',
                          width: '18px',
                          height: '18px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '10px',
                          fontWeight: 800,
                        }}
                      >
                        1
                      </span>
                      <strong style={{ fontSize: '13px', color: '#166534' }}>
                        Student / Parent Join Link (No Registration Required)
                      </strong>
                    </div>
                    <span
                      style={{
                        backgroundColor: '#DCFCE7',
                        color: '#15803D',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '10.5px',
                        fontFamily: 'monospace',
                        fontWeight: 700,
                      }}
                    >
                      Token: {demoSuccessDetails.studentToken}
                    </span>
                  </div>

                  <p style={{ margin: 0, fontSize: '12px', color: '#15803D' }}>
                    Send this link to the student/parent. They can join the live SmartBoard room directly without creating an account.
                  </p>

                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input
                      type="text"
                      readOnly
                      value={demoSuccessDetails.studentLink || `${getFrontendClientBaseUrl()}/demo-room/${demoSuccessDetails.studentToken}`}
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: '1px solid #86EFAC',
                        backgroundColor: '#FFFFFF',
                        fontSize: '12px',
                        color: '#166534',
                        fontFamily: 'monospace',
                      }}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        copyToClipboard(
                          demoSuccessDetails.studentLink || `${getFrontendClientBaseUrl()}/demo-room/${demoSuccessDetails.studentToken}`,
                          'student'
                        )
                      }
                      style={{
                        padding: '8px 14px',
                        backgroundColor: '#166534',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      <i className={copiedStudentLink ? 'fas fa-check' : 'fas fa-copy'} />
                      <span>{copiedStudentLink ? 'Copied!' : 'Copy Link'}</span>
                    </button>

                    <a
                      href={`https://wa.me/${formatCleanPhone(activeDemoEnquiry.phone)}?text=${encodeURIComponent(
                        `Hello ${activeDemoEnquiry.parentName}, EduPye Academy has scheduled a live 1-on-1 Demo Trial Class for ${activeDemoEnquiry.studentName} with Tutor ${demoSuccessDetails.assignedTutor?.name || activeDemoEnquiry.assignedTutorName} (${demoSuccessDetails.subject || activeDemoEnquiry.demoSubject}).\n\nDate & Time: ${
                          demoSuccessDetails.scheduledAt
                            ? new Date(demoSuccessDetails.scheduledAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })
                            : 'As agreed'
                        }\nClassroom Link (No login required):\n${demoSuccessDetails.studentLink || `${getFrontendClientBaseUrl()}/demo-room/${demoSuccessDetails.studentToken}`}\n\nWe look forward to seeing you in class!`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        padding: '8px 14px',
                        backgroundColor: '#25D366',
                        color: '#FFFFFF',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: 700,
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      <i className="fab fa-whatsapp" />
                      <span>Share on WhatsApp</span>
                    </a>
                  </div>
                </div>

                {/* 2. Teacher Access Box */}
                <div
                  style={{
                    backgroundColor: '#EFF6FF',
                    border: '1px solid #BFDBFE',
                    borderRadius: '12px',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span
                        style={{
                          backgroundColor: '#3B82F6',
                          color: '#FFFFFF',
                          borderRadius: '50%',
                          width: '18px',
                          height: '18px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '10px',
                          fontWeight: 800,
                        }}
                      >
                        2
                      </span>
                      <strong style={{ fontSize: '13px', color: '#1E40AF' }}>
                        Assigned Tutor Room Link ({demoSuccessDetails.assignedTutor?.name || activeDemoEnquiry.assignedTutorName})
                      </strong>
                    </div>
                    <span
                      style={{
                        backgroundColor: '#DBEAFE',
                        color: '#1D4ED8',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '10.5px',
                        fontFamily: 'monospace',
                        fontWeight: 700,
                      }}
                    >
                      Token: {demoSuccessDetails.teacherToken}
                    </span>
                  </div>

                  <p style={{ margin: 0, fontSize: '12px', color: '#1D4ED8' }}>
                    Send this host link to the tutor. They can enter as instructor with full SmartBoard drawing controls.
                  </p>

                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input
                      type="text"
                      readOnly
                      value={demoSuccessDetails.teacherLink || `${getFrontendClientBaseUrl()}/demo-room/${demoSuccessDetails.teacherToken}`}
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: '1px solid #93C5FD',
                        backgroundColor: '#FFFFFF',
                        fontSize: '12px',
                        color: '#1E40AF',
                        fontFamily: 'monospace',
                      }}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        copyToClipboard(
                          demoSuccessDetails.teacherLink || `${getFrontendClientBaseUrl()}/demo-room/${demoSuccessDetails.teacherToken}`,
                          'teacher'
                        )
                      }
                      style={{
                        padding: '8px 14px',
                        backgroundColor: '#1E40AF',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      <i className={copiedTeacherLink ? 'fas fa-check' : 'fas fa-copy'} />
                      <span>{copiedTeacherLink ? 'Copied!' : 'Copy Link'}</span>
                    </button>

                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(
                        `Hello Tutor ${demoSuccessDetails.assignedTutor?.name || activeDemoEnquiry.assignedTutorName}, EduPye Academy Demo Class has been scheduled for student ${activeDemoEnquiry.studentName} (${activeDemoEnquiry.grade} - ${demoSuccessDetails.subject || activeDemoEnquiry.demoSubject}).\n\nDate & Time: ${
                          demoSuccessDetails.scheduledAt
                            ? new Date(demoSuccessDetails.scheduledAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })
                            : 'Scheduled'
                        }\nYour Host Link:\n${demoSuccessDetails.teacherLink || `${getFrontendClientBaseUrl()}/demo-room/${demoSuccessDetails.teacherToken}`}`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        padding: '8px 14px',
                        backgroundColor: '#25D366',
                        color: '#FFFFFF',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: 700,
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      <i className="fab fa-whatsapp" />
                      <span>WhatsApp Tutor</span>
                    </a>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setIsRescheduling(true)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      backgroundColor: '#FFFFFF',
                      color: '#0F1E36',
                      fontSize: '12.5px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <i className="fas fa-redo-alt" /> Re-Schedule with Another Tutor
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowDemoModal(false)}
                    style={{
                      padding: '8px 22px',
                      borderRadius: '8px',
                      border: 'none',
                      backgroundColor: '#0F1E36',
                      color: '#FFFFFF',
                      fontSize: '12.5px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              /* Schedule / Reschedule Form */
              <form onSubmit={handleSubmitScheduleDemo} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {isRescheduling && demoSuccessDetails && (
                  <div
                    style={{
                      backgroundColor: '#FEF3C7',
                      color: '#92400E',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: 600,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span>Re-scheduling will assign a new tutor and generate fresh room tokens.</span>
                    <button
                      type="button"
                      onClick={() => setIsRescheduling(false)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#B45309',
                        fontWeight: 700,
                        textDecoration: 'underline',
                        cursor: 'pointer',
                      }}
                    >
                      Back to Links
                    </button>
                  </div>
                )}

                {/* Select Tutor */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Assign EduPye Academy Tutor (TCH-XXXXXX) *
                  </label>
                  {loadingTutors ? (
                    <div style={{ fontSize: '12px', color: '#64748B' }}>Loading approved tutors...</div>
                  ) : tutors.length === 0 ? (
                    <div style={{ fontSize: '12px', color: '#DC2626' }}>
                      No active tutors found. Please approve a tutor in Tutor Management first.
                    </div>
                  ) : (
                    <select
                      value={demoTutorId}
                      onChange={(e) => setDemoTutorId(e.target.value)}
                      required
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid #CBD5E1',
                        fontSize: '13px',
                        outline: 'none',
                        backgroundColor: '#FFFFFF',
                        fontWeight: 600,
                      }}
                    >
                      {tutors.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name} &bull; {t.teacherCode || 'Tutor'} ({t.subjects?.join(', ') || 'All Subjects'})
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Subject & Grade */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                      Demo Subject *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Physics, Chemistry, Math"
                      value={demoSubject}
                      onChange={(e) => setDemoSubject(e.target.value)}
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
                      Student Grade
                    </label>
                    <input
                      type="text"
                      disabled
                      value={activeDemoEnquiry.grade}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: '8px',
                        border: '1px solid #E2E8F0',
                        backgroundColor: '#F8FAFC',
                        fontSize: '13px',
                        color: '#64748B',
                      }}
                    />
                  </div>
                </div>

                {/* Date & Time */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                      Demo Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={demoDate}
                      onChange={(e) => setDemoDate(e.target.value)}
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
                      Demo Time *
                    </label>
                    <input
                      type="time"
                      required
                      value={demoTime}
                      onChange={(e) => setDemoTime(e.target.value)}
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

                {/* Notes */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Internal Instructions / Tutor Brief
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Focus on Mechanics and basic problem-solving. Student is preparing for JEE."
                    value={demoNotes}
                    onChange={(e) => setDemoNotes(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '13px',
                      outline: 'none',
                      resize: 'vertical',
                    }}
                  />
                </div>

                {/* Submit Actions */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      if (demoSuccessDetails) {
                        setIsRescheduling(false);
                      } else {
                        setShowDemoModal(false);
                      }
                    }}
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
                    disabled={demoSchedulingLoading}
                    style={{
                      padding: '8px 22px',
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
                    <i className="fas fa-video" />
                    <span>
                      {demoSchedulingLoading
                        ? 'Scheduling & Generating Tokens...'
                        : 'Schedule Demo & Generate Share Links'}
                    </span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
