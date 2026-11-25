import React, { useState, useEffect, useCallback } from 'react';
import {
  tuitionAdminService,
  type AcademyEnquiryItem,
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

  // Form states
  const [studentName, setStudentName] = useState('');
  const [parentName, setParentName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [grade, setGrade] = useState('Class 12');
  const [subjectsStr, setSubjectsStr] = useState('Physics, Mathematics');
  const [notes, setNotes] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');

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
  }, [loadEnquiries]);

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
                        onChange={(e) => handleStatusChange(enq._id, e.target.value)}
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
                    </td>
                    <td style={{ padding: '14px 18px', color: '#475569', fontSize: '12px', maxWidth: '240px' }}>
                      {enq.notes || '--'}
                    </td>
                    <td style={{ padding: '14px 18px' }}>
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
                        }}
                      >
                        <i className="fas fa-user-check" /> Convert
                      </button>
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
    </div>
  );
};
