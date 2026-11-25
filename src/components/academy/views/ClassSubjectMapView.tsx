import React, { useState } from 'react';
import type { AdminTuitionProgram, AdminTeacherItem } from '../../../services/tuitionAdmin.service';
import { tuitionAdminService } from '../../../services/tuitionAdmin.service';
import { useToast } from '../../../hooks/useToast';

interface ClassSubjectMapViewProps {
  programs: AdminTuitionProgram[];
  teachers: AdminTeacherItem[];
  onRefresh: () => void;
  onOpenCreateBatch: () => void;
}

export const ClassSubjectMapView: React.FC<ClassSubjectMapViewProps> = ({
  programs,
  teachers,
  onRefresh,
  onOpenCreateBatch,
}) => {
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const teacherMap = new Map<string, AdminTeacherItem>();
  teachers.forEach((t) => {
    teacherMap.set(t.id, t);
  });

  const uniqueSubjects = Array.from(new Set(programs.map((p) => p.subject).filter(Boolean)));

  const filteredPrograms = programs.filter((p) => {
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchTitle = p.title.toLowerCase().includes(q);
      const matchCode = p.code.toLowerCase().includes(q);
      const matchSub = p.subject.toLowerCase().includes(q);
      if (!matchTitle && !matchCode && !matchSub) return false;
    }
    if (subjectFilter !== 'all' && p.subject !== subjectFilter) {
      return false;
    }
    return true;
  });

  const handleDeleteProgram = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to remove batch "${title}"?`)) return;
    try {
      setDeletingId(id);
      await tuitionAdminService.deleteProgram(id);
      showToast(`Batch "${title}" removed successfully.`, 'info');
      onRefresh();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete batch', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      {/* 1. View Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#0F1E36', letterSpacing: '-0.02em' }}>
            Class-Subject Map & Batches
          </h2>
          <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#64748B' }}>
            TuitionProgram batches, subject mappings, faculty assignments, and timetable schedules.
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
            onClick={onOpenCreateBatch}
            style={{
              padding: '8px 18px',
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
              boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)',
            }}
          >
            <i className="fas fa-plus-circle" /> Create New Batch
          </button>
        </div>
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
            placeholder="Search Batch Title, Code, or Subject..."
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

        <div style={{ flex: '0 1 200px' }}>
          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
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
            <option value="all">All Subjects ({uniqueSubjects.length})</option>
            {uniqueSubjects.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 3. Program Batches Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '16px',
        }}
      >
        {filteredPrograms.length > 0 ? (
          filteredPrograms.map((prog) => {
            const enrolledCount = prog.enrolledStudentIds?.length || 0;
            const cap = prog.maxCapacity || 30;
            const pct = Math.min(100, Math.round((enrolledCount / cap) * 100));

            return (
              <div
                key={prog._id}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '14px',
                  border: '1px solid #E2E8F0',
                  padding: '18px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  boxShadow: '0 1px 4px rgba(0, 0, 0, 0.03)',
                  transition: 'box-shadow 0.15s ease',
                }}
              >
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                  <div>
                    <span
                      style={{
                        fontFamily: 'monospace',
                        fontSize: '11px',
                        fontWeight: 800,
                        backgroundColor: '#EEF2FF',
                        color: '#4338CA',
                        padding: '2px 6px',
                        borderRadius: '4px',
                      }}
                    >
                      {prog.code}
                    </span>
                    <h3 style={{ margin: '6px 0 0', fontSize: '15px', fontWeight: 800, color: '#0F172A', lineHeight: 1.25 }}>
                      {prog.title}
                    </h3>
                  </div>

                  <span
                    style={{
                      fontSize: '10.5px',
                      fontWeight: 700,
                      backgroundColor: prog.status === 'active' ? '#D1FAE5' : '#F1F5F9',
                      color: prog.status === 'active' ? '#065F46' : '#64748B',
                      padding: '2px 8px',
                      borderRadius: '10px',
                      textTransform: 'uppercase',
                    }}
                  >
                    {prog.status}
                  </span>
                </div>

                {/* Subject & Grade Pill */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                  <span style={{ fontWeight: 700, color: '#2563EB', backgroundColor: '#EFF6FF', padding: '2px 8px', borderRadius: '4px' }}>
                    {prog.subject}
                  </span>
                  <span style={{ fontWeight: 600, color: '#64748B' }}>
                    &bull; {prog.grade || 'General'}
                  </span>
                </div>

                {/* Assigned Teachers */}
                <div>
                  <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600, marginBottom: '6px' }}>
                    ASSIGNED FACULTY
                  </div>
                  {prog.teacherIds && prog.teacherIds.length > 0 ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {prog.teacherIds.map((tId: any) => {
                        const idStr = typeof tId === 'object' ? tId._id || tId.id : tId;
                        const tObj = typeof tId === 'object' && tId.name ? tId : teacherMap.get(idStr);
                        const tName = tObj?.name || 'Assigned Instructor';
                        const tCode = tObj?.teacherCode || 'TCH';

                        return (
                          <div
                            key={idStr}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              backgroundColor: '#F8FAFC',
                              padding: '4px 8px',
                              borderRadius: '6px',
                              border: '1px solid #E2E8F0',
                              fontSize: '11.5px',
                            }}
                          >
                            <i className="fas fa-user-tie" style={{ color: '#2563EB', fontSize: '11px' }} />
                            <span style={{ fontWeight: 600, color: '#0F172A' }}>{tName}</span>
                            <span style={{ fontFamily: 'monospace', fontSize: '10px', color: '#64748B' }}>({tCode})</span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div style={{ fontSize: '11.5px', color: '#94A3B8', fontStyle: 'italic' }}>
                      No teacher assigned yet.
                    </div>
                  )}
                </div>

                {/* Timetable Schedule */}
                <div>
                  <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600, marginBottom: '4px' }}>
                    TIMETABLE SCHEDULE
                  </div>
                  {prog.schedule && prog.schedule.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '11.5px', color: '#334155' }}>
                      {prog.schedule.map((slot, sIdx) => (
                        <div key={sIdx} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <i className="fas fa-clock" style={{ fontSize: '10px', color: '#38BDF8' }} />
                          <strong style={{ color: '#0F172A' }}>{slot.day}:</strong>
                          <span>{slot.startTime} – {slot.endTime}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ fontSize: '11.5px', color: '#94A3B8' }}>Flexible / Scheduled on Demand</div>
                  )}
                </div>

                {/* Capacity Progress Bar */}
                <div style={{ marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid #F1F5F9' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', marginBottom: '4px' }}>
                    <span style={{ color: '#64748B' }}>Enrollment Capacity</span>
                    <span style={{ fontWeight: 700, color: '#0F172A' }}>
                      {enrolledCount} / {cap} students ({pct}%)
                    </span>
                  </div>
                  <div style={{ width: '100%', height: '6px', borderRadius: '4px', backgroundColor: '#E2E8F0', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${pct}%`,
                        height: '100%',
                        backgroundColor: pct >= 90 ? '#EF4444' : pct >= 70 ? '#F59E0B' : '#10B981',
                        borderRadius: '4px',
                      }}
                    />
                  </div>
                </div>

                {/* Card Actions */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px', paddingTop: '4px' }}>
                  <button
                    type="button"
                    disabled={deletingId === prog._id}
                    onClick={() => handleDeleteProgram(prog._id, prog.title)}
                    style={{
                      padding: '5px 10px',
                      borderRadius: '6px',
                      border: '1px solid #FCA5A5',
                      backgroundColor: '#FEF2F2',
                      color: '#DC2626',
                      fontSize: '11px',
                      fontWeight: 600,
                      cursor: deletingId === prog._id ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {deletingId === prog._id ? 'Removing...' : 'Delete'}
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div
            style={{
              gridColumn: '1 / -1',
              backgroundColor: '#FFFFFF',
              borderRadius: '14px',
              padding: '40px',
              textAlign: 'center',
              border: '1px solid #E2E8F0',
            }}
          >
            <i className="fas fa-sitemap" style={{ fontSize: '32px', color: '#CBD5E1', marginBottom: '8px' }} />
            <h4 style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: 800, color: '#334155' }}>
              No batches found.
            </h4>
            <p style={{ margin: 0, fontSize: '12.5px', color: '#94A3B8' }}>
              Click &quot;Create New Batch&quot; above to map subjects and schedule classes.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
