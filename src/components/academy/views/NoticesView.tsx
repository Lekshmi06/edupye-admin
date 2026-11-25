import React, { useState, useEffect, useCallback } from 'react';
import {
  tuitionAdminService,
  type AcademyNoticeItem,
  type AdminTuitionProgram,
} from '../../../services/tuitionAdmin.service';
import { useToast } from '../../../hooks/useToast';
import { Loader } from '../../common/Loader';

interface NoticesViewProps {
  programs: AdminTuitionProgram[];
}

export const NoticesView: React.FC<NoticesViewProps> = ({ programs }) => {
  const { showToast } = useToast();
  const [notices, setNotices] = useState<AcademyNoticeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAudience, setSelectedAudience] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [audience, setAudience] = useState<AcademyNoticeItem['audience']>('All');
  const [programId, setProgramId] = useState('');
  const [priority, setPriority] = useState<AcademyNoticeItem['priority']>('Normal');
  const [postedBy, setPostedBy] = useState('Academy Director');

  const loadNotices = useCallback(async () => {
    try {
      setLoading(true);
      const data = await tuitionAdminService.getNotices({
        audience: selectedAudience !== 'all' ? selectedAudience : undefined,
      });
      setNotices(data);
    } catch (err: any) {
      showToast(err.message || 'Failed to load notices', 'error');
    } finally {
      setLoading(false);
    }
  }, [selectedAudience, showToast]);

  useEffect(() => {
    loadNotices();
  }, [loadNotices]);

  const handleCreateNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      showToast('Please provide a title and message.', 'warning');
      return;
    }

    try {
      setSubmitting(true);
      await tuitionAdminService.createNotice({
        title: title.trim(),
        message: message.trim(),
        audience,
        programId: audience === 'Specific Batch' && programId ? programId : undefined,
        priority,
        postedBy: postedBy.trim() || 'Academy Director',
      });

      showToast('Notice published successfully!', 'success');
      setShowCreateModal(false);
      setTitle('');
      setMessage('');
      loadNotices();
    } catch (err: any) {
      showToast(err.message || 'Failed to publish notice', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteNotice = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this notice?')) return;
    try {
      await tuitionAdminService.deleteNotice(id);
      showToast('Notice deleted', 'info');
      loadNotices();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete notice', 'error');
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
              COMMUNICATION HUB
            </span>
            <span style={{ fontSize: '12.5px', color: '#64748B', fontWeight: 600 }}>
              Center & Batch Circulars
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
            Tuition Bulletins & Batch Announcements
          </h2>
          <p style={{ margin: 0, fontSize: '13px', color: '#64748B' }}>
            Broadcast timetable schedule changes, test syllabus circulars, and holiday notifications to tutors and students.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
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
          <i className="fas fa-bullhorn" /> + Post Announcement
        </button>
      </div>

      {/* 2. Filter Bar */}
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
        <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#475569' }}>Target Audience:</span>
        {(['all', 'All', 'Students', 'Tutors', 'Specific Batch'] as const).map((aud) => (
          <button
            key={aud}
            type="button"
            onClick={() => setSelectedAudience(aud)}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              border: selectedAudience === aud ? 'none' : '1px solid #E2E8F0',
              backgroundColor: selectedAudience === aud ? '#0F1E36' : '#FFFFFF',
              color: selectedAudience === aud ? '#FFFFFF' : '#475569',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {aud === 'all' ? 'All Bulletins' : aud}
          </button>
        ))}
      </div>

      {/* 3. Notices Grid */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
          <Loader />
        </div>
      ) : notices.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '50px 20px', backgroundColor: '#FFFFFF', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
          <i className="fas fa-bullhorn" style={{ fontSize: '32px', color: '#94A3B8', marginBottom: '10px' }} />
          <h4 style={{ margin: '0 0 4px', fontSize: '15px', color: '#0F1E36' }}>No active circulars found</h4>
          <p style={{ margin: 0, fontSize: '13px', color: '#64748B' }}>
            Click "+ Post Announcement" to publish center-wide or batch-specific notices.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
          {notices.map((n) => {
            const isImportant = n.priority === 'Important';
            const isSchedule = n.priority === 'Schedule Change';

            return (
              <div
                key={n._id}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '14px',
                  border: isImportant ? '1.5px solid #FCD34D' : isSchedule ? '1.5px solid #FECDD3' : '1px solid #E2E8F0',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '14px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: '6px',
                        backgroundColor: isImportant ? '#FEF3C7' : isSchedule ? '#FFF1F2' : '#EFF6FF',
                        color: isImportant ? '#D97706' : isSchedule ? '#E11D48' : '#2563EB',
                      }}
                    >
                      {n.priority}
                    </span>

                    <span
                      style={{
                        fontSize: '11.5px',
                        fontWeight: 600,
                        backgroundColor: '#F1F5F9',
                        color: '#475569',
                        padding: '3px 8px',
                        borderRadius: '6px',
                      }}
                    >
                      {n.audience}
                    </span>
                  </div>

                  <h3 style={{ margin: '0 0 6px', fontSize: '16px', fontWeight: 800, color: '#0F1E36' }}>
                    {n.title}
                  </h3>

                  <p style={{ margin: 0, fontSize: '13px', color: '#475569', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                    {n.message}
                  </p>
                </div>

                <div
                  style={{
                    borderTop: '1px solid #F1F5F9',
                    paddingTop: '12px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '11.5px',
                    color: '#64748B',
                  }}
                >
                  <div>
                    <span>Posted by: <strong>{n.postedBy}</strong></span>
                    <span style={{ marginLeft: '8px' }}>&bull; {new Date(n.createdAt).toLocaleDateString()}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteNotice(n._id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#E11D48',
                      cursor: 'pointer',
                      fontSize: '13px',
                      padding: '4px',
                    }}
                    title="Delete Notice"
                  >
                    <i className="fas fa-trash-alt" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. Post Notice Modal */}
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
                  <i className="fas fa-bullhorn" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#0F1E36' }}>
                    Publish Tuition Circular
                  </h3>
                  <p style={{ margin: 0, fontSize: '12px', color: '#64748B' }}>
                    Broadcast announcement to students and tutors
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

            <form onSubmit={handleCreateNotice} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Notice Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Schedule Change: Sunday Doubt Clearing Session"
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
                    Target Audience *
                  </label>
                  <select
                    value={audience}
                    onChange={(e) => setAudience(e.target.value as any)}
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
                    <option value="All">All Students & Tutors</option>
                    <option value="Students">All Students Only</option>
                    <option value="Tutors">All Faculty / Tutors</option>
                    <option value="Specific Batch">Specific Tuition Batch</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Priority Level
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
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
                    <option value="Normal">Normal</option>
                    <option value="Important">Important Alert</option>
                    <option value="Schedule Change">Schedule Change</option>
                  </select>
                </div>
              </div>

              {audience === 'Specific Batch' && (
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Select Target Batch *
                  </label>
                  <select
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
                    <option value="">-- Choose Batch --</option>
                    {programs.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title} &bull; {p.subject} ({p.grade})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Notice Content / Instructions *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Type announcement details, timing updates, syllabus notes..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
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

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Posted By (Authority)
                </label>
                <input
                  type="text"
                  value={postedBy}
                  onChange={(e) => setPostedBy(e.target.value)}
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

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
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
                  {submitting ? 'Publishing...' : 'Publish Announcement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
