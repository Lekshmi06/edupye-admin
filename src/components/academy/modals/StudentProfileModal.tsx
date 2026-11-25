import React from 'react';
import type { AdminStudentItem } from '../../../services/tuitionAdmin.service';

interface StudentProfileModalProps {
  student: AdminStudentItem | null;
  onClose: () => void;
  onOpenIdCard: (student: AdminStudentItem) => void;
  onOpenAssignBatch: (student: AdminStudentItem) => void;
}

export const StudentProfileModal: React.FC<StudentProfileModalProps> = ({
  student,
  onClose,
  onOpenIdCard,
  onOpenAssignBatch,
}) => {
  if (!student) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 100,
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
          maxWidth: '560px',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          border: '1px solid #E2E8F0',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(135deg, #0F1E36 0%, #1E3A8A 100%)',
            color: '#FFFFFF',
            borderRadius: '15px 15px 0 0',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                backgroundColor: '#3B82F6',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                fontWeight: 800,
                border: '2px solid rgba(255, 255, 255, 0.3)',
              }}
            >
              {student.name[0]?.toUpperCase() || 'S'}
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#FFFFFF' }}>
                {student.name}
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '3px' }}>
                <span
                  style={{
                    fontFamily: 'monospace',
                    fontSize: '11.5px',
                    backgroundColor: 'rgba(255, 255, 255, 0.18)',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                  }}
                >
                  {student.studentCode || 'STU-PENDING'}
                </span>
                <span
                  style={{
                    fontSize: '11px',
                    backgroundColor: student.tuitionApprovalStatus === 'approved' ? '#10B981' : '#F59E0B',
                    color: '#FFFFFF',
                    padding: '2px 8px',
                    borderRadius: '10px',
                    fontWeight: 700,
                  }}
                >
                  {student.tuitionApprovalStatus.toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#94A3B8',
              fontSize: '18px',
              cursor: 'pointer',
              padding: '6px',
            }}
          >
            <i className="fas fa-times" />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Quick Info Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '14px',
              backgroundColor: '#F8FAFC',
              padding: '16px',
              borderRadius: '12px',
              border: '1px solid #E2E8F0',
            }}
          >
            <div>
              <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>CLASS / GRADE</div>
              <div style={{ fontSize: '13.5px', color: '#0F172A', fontWeight: 700, marginTop: '2px' }}>
                {student.grade || 'Class 12'}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>EMAIL ADDRESS</div>
              <div style={{ fontSize: '13px', color: '#0F172A', fontWeight: 600, marginTop: '2px', wordBreak: 'break-all' }}>
                {student.email}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>PARENT / GUARDIAN</div>
              <div style={{ fontSize: '13px', color: '#0F172A', fontWeight: 700, marginTop: '2px' }}>
                {student.parentName || 'Guardian / N/A'}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>CONTACT PHONE</div>
              <div style={{ fontSize: '13px', color: '#0F172A', fontWeight: 600, marginTop: '2px' }}>
                {student.phone || student.parentPhone || 'N/A'}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>GENDER / DOB</div>
              <div style={{ fontSize: '13px', color: '#0F172A', fontWeight: 600, marginTop: '2px' }}>
                {student.gender || 'Not Specified'} {student.dob ? `(${new Date(student.dob).toLocaleDateString()})` : ''}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>ADMISSION DATE</div>
              <div style={{ fontSize: '13px', color: '#0F172A', fontWeight: 600, marginTop: '2px' }}>
                {new Date(student.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* Enrolled Batches / Programs */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
                Enrolled Batches ({student.enrolledPrograms?.length || 0})
              </span>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenAssignBatch(student);
                }}
                style={{
                  fontSize: '11.5px',
                  fontWeight: 600,
                  color: '#2563EB',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                + Manage / Assign Batch
              </button>
            </div>

            {student.enrolledPrograms && student.enrolledPrograms.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {student.enrolledPrograms.map((prog) => (
                  <div
                    key={prog.id}
                    style={{
                      padding: '10px 14px',
                      borderRadius: '8px',
                      backgroundColor: '#EFF6FF',
                      border: '1px solid #BFDBFE',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#1E40AF' }}>
                        {prog.title}
                      </div>
                      <div style={{ fontSize: '11.5px', color: '#3B82F6', marginTop: '1px' }}>
                        {prog.subject} &bull; {prog.grade || 'Standard'}
                      </div>
                    </div>
                    <span
                      style={{
                        fontFamily: 'monospace',
                        fontSize: '11px',
                        fontWeight: 700,
                        backgroundColor: '#DBEAFE',
                        color: '#1E40AF',
                        padding: '3px 8px',
                        borderRadius: '4px',
                      }}
                    >
                      {prog.code}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div
                style={{
                  padding: '16px',
                  textAlign: 'center',
                  backgroundColor: '#F8FAFC',
                  borderRadius: '8px',
                  border: '1px dashed #CBD5E1',
                  color: '#64748B',
                  fontSize: '12.5px',
                }}
              >
                No active tuition batches assigned yet.
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid #E2E8F0',
            backgroundColor: '#F8FAFC',
            borderRadius: '0 0 15px 15px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenIdCard(student);
            }}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: '1px solid #CBD5E1',
              backgroundColor: '#FFFFFF',
              color: '#0F172A',
              fontSize: '12.5px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <i className="fas fa-id-card" style={{ color: '#2563EB' }} /> View Tuition ID Card
          </button>

          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '8px 18px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#0F1E36',
              color: '#FFFFFF',
              fontSize: '12.5px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
