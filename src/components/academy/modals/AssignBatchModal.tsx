import React, { useState } from 'react';
import type { AdminStudentItem, AdminTuitionProgram } from '../../../services/tuitionAdmin.service';
import { tuitionAdminService } from '../../../services/tuitionAdmin.service';
import { useToast } from '../../../hooks/useToast';

interface AssignBatchModalProps {
  student: AdminStudentItem | null;
  programs: AdminTuitionProgram[];
  onClose: () => void;
  onSuccess: () => void;
}

export const AssignBatchModal: React.FC<AssignBatchModalProps> = ({
  student,
  programs,
  onClose,
  onSuccess,
}) => {
  const { showToast } = useToast();
  const [selectedProgramId, setSelectedProgramId] = useState<string>(programs[0]?._id || '');
  const [submitting, setSubmitting] = useState(false);

  if (!student) return null;

  const handleAssign = async () => {
    if (!selectedProgramId) {
      showToast('Please select a batch to assign.', 'warning');
      return;
    }
    try {
      setSubmitting(true);
      await tuitionAdminService.enrollStudents(selectedProgramId, [student.id]);
      showToast(`Assigned ${student.name} to batch successfully.`, 'success');
      onSuccess();
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Failed to assign student to batch', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = async (programId: string) => {
    try {
      setSubmitting(true);
      await tuitionAdminService.removeStudentFromProgram(programId, student.id);
      showToast(`Removed student from batch.`, 'success');
      onSuccess();
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Failed to remove student from batch', 'error');
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
        zIndex: 105,
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
          maxWidth: '500px',
          padding: '24px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          gap: '18px',
          border: '1px solid #E2E8F0',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#0F172A' }}>
              Assign Batch / Class
            </h3>
            <p style={{ margin: '3px 0 0', fontSize: '12.5px', color: '#64748B' }}>
              Student: <strong style={{ color: '#0F1E36' }}>{student.name}</strong> ({student.studentCode || 'N/A'})
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

        {/* Current Enrolled Batches */}
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
            Current Enrolled Batches
          </label>
          {student.enrolledPrograms && student.enrolledPrograms.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {student.enrolledPrograms.map((p) => (
                <div
                  key={p.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    backgroundColor: '#F1F5F9',
                    fontSize: '12.5px',
                  }}
                >
                  <div>
                    <span style={{ fontWeight: 700, color: '#0F172A' }}>{p.title}</span>
                    <span style={{ color: '#64748B', marginLeft: '6px' }}>({p.code})</span>
                  </div>
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => handleRemove(p.id)}
                    style={{
                      fontSize: '11px',
                      color: '#EF4444',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontWeight: 600,
                    }}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: '12px', color: '#94A3B8', fontStyle: 'italic' }}>
              Student is not currently enrolled in any batch.
            </div>
          )}
        </div>

        {/* Add to Batch */}
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
            Select Batch to Enroll
          </label>
          <select
            value={selectedProgramId}
            onChange={(e) => setSelectedProgramId(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: '8px',
              border: '1px solid #CBD5E1',
              fontSize: '13px',
              outline: 'none',
              backgroundColor: '#FFFFFF',
            }}
          >
            {programs.map((prog) => (
              <option key={prog._id} value={prog._id}>
                {prog.title} ({prog.code}) &bull; {prog.subject} &bull; {prog.grade || 'General'}
              </option>
            ))}
          </select>
        </div>

        {/* Action Buttons */}
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
            type="button"
            disabled={submitting || !selectedProgramId}
            onClick={handleAssign}
            style={{
              padding: '8px 18px',
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
            {submitting ? 'Assigning...' : 'Assign to Batch'}
          </button>
        </div>
      </div>
    </div>
  );
};
