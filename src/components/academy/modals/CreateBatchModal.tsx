import React, { useState } from 'react';
import type { AdminTeacherItem } from '../../../services/tuitionAdmin.service';
import { tuitionAdminService } from '../../../services/tuitionAdmin.service';
import { useToast } from '../../../hooks/useToast';

interface CreateBatchModalProps {
  teachers: AdminTeacherItem[];
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateBatchModal: React.FC<CreateBatchModalProps> = ({
  teachers,
  onClose,
  onSuccess,
}) => {
  const { showToast } = useToast();
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('Physics');
  const [grade, setGrade] = useState('Class 12');
  const [description, setDescription] = useState('');
  const [days, setDays] = useState('Monday, Wednesday, Friday');
  const [startTime, setStartTime] = useState('17:00');
  const [endTime, setEndTime] = useState('18:30');
  const [maxCapacity, setMaxCapacity] = useState<number>(30);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>(teachers[0]?.id || '');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast('Please enter a batch title.', 'warning');
      return;
    }

    try {
      setSubmitting(true);
      const scheduleDaysArray = days.split(',').map((d) => d.trim()).filter(Boolean);
      const scheduleSlots = scheduleDaysArray.map((day) => ({
        day,
        startTime,
        endTime,
      }));

      await tuitionAdminService.createProgram({
        title: title.trim(),
        subject,
        grade,
        description: description.trim(),
        schedule: scheduleSlots,
        maxCapacity,
        teacherIds: selectedTeacherId ? [selectedTeacherId] : [],
        teacherSubjects: selectedTeacherId ? [{ teacherId: selectedTeacherId, subject }] : [],
        enrolledStudentIds: [],
        status: 'active',
      });

      showToast(`Batch "${title}" created and mapped successfully!`, 'success');
      onSuccess();
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Failed to create batch', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
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
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '540px',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '24px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          border: '1px solid #E2E8F0',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0F172A' }}>
              Create New Batch / Map Subject
            </h3>
            <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748B' }}>
              Configure a tuition batch, schedule timetable, and assign certified faculty.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#94A3B8', fontSize: '16px', cursor: 'pointer' }}
          >
            <i className="fas fa-times" />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
              Batch / Program Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Class 12 Advanced Physics & Calculus"
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
                Primary Subject *
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
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
                <option value="Physics">Physics</option>
                <option value="Chemistry">Chemistry</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Biology">Biology</option>
                <option value="English Literature">English Literature</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Accountancy">Accountancy</option>
                <option value="Economics">Economics</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                Class / Grade *
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
                <option value="Class 9">Class 9</option>
                <option value="Class 10">Class 10</option>
                <option value="Class 11">Class 11</option>
                <option value="Class 12">Class 12</option>
                <option value="Repeater / Dropper">Repeater / Dropper</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
              Assign Primary Teacher
            </label>
            <select
              value={selectedTeacherId}
              onChange={(e) => setSelectedTeacherId(e.target.value)}
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
              <option value="">-- No Teacher Assigned Yet --</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.teacherCode || 'TCH-PENDING'}) &bull; {Array.isArray(t.subjects) ? t.subjects.join(', ') : 'All Subjects'}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
              Weekly Timetable Days
            </label>
            <input
              type="text"
              placeholder="e.g. Monday, Wednesday, Friday"
              value={days}
              onChange={(e) => setDays(e.target.value)}
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                Start Time
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  fontSize: '13px',
                  outline: 'none',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                End Time
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  fontSize: '13px',
                  outline: 'none',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                Max Capacity
              </label>
              <input
                type="number"
                min={5}
                max={100}
                value={maxCapacity}
                onChange={(e) => setMaxCapacity(Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: '8px 10px',
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
              Description / Learning Syllabus
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Comprehensive syllabus coverage with weekly MCQ practice and board paper discussion."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                fontSize: '13px',
                outline: 'none',
                resize: 'none',
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
            <button
              type="button"
              onClick={onClose}
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
                cursor: submitting ? 'not-allowed' : 'pointer',
                opacity: submitting ? 0.7 : 1,
              }}
            >
              {submitting ? 'Creating Batch...' : 'Create Batch'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
