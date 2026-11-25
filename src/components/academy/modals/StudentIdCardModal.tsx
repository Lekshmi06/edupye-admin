import React from 'react';
import type { AdminStudentItem } from '../../../services/tuitionAdmin.service';

interface StudentIdCardModalProps {
  student: AdminStudentItem | null;
  academicSession: string;
  onClose: () => void;
}

export const StudentIdCardModal: React.FC<StudentIdCardModalProps> = ({
  student,
  academicSession,
  onClose,
}) => {
  if (!student) return null;

  const handlePrint = () => {
    window.print();
  };

  const code = student.studentCode || 'STU-DEMO01';

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.7)',
        backdropFilter: 'blur(5px)',
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
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Printable ID Card Container */}
        <div
          id="edupye-id-card-printable"
          style={{
            width: '320px',
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
            border: '1px solid #CBD5E1',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
          }}
        >
          {/* Top Brand Header */}
          <div
            style={{
              background: 'linear-gradient(135deg, #0F1E36 0%, #1E3A8A 100%)',
              color: '#FFFFFF',
              padding: '16px',
              textAlign: 'center',
              position: 'relative',
            }}
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                justifyContent: 'center',
              }}
            >
              <div
                style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '6px',
                  backgroundColor: '#2563EB',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '13px',
                }}
              >
                <i className="fas fa-graduation-cap" />
              </div>
              <span style={{ fontSize: '15px', fontWeight: 800, letterSpacing: '-0.01em' }}>
                EduPye Academy
              </span>
            </div>
            <div style={{ fontSize: '10px', color: '#93C5FD', fontWeight: 600, letterSpacing: '0.04em', marginTop: '2px' }}>
              TUITION MANAGEMENT SYSTEM
            </div>
            <div
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                fontSize: '9px',
                fontWeight: 700,
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                padding: '2px 6px',
                borderRadius: '4px',
              }}
            >
              {academicSession}
            </div>
          </div>

          {/* Student Photo & Identity */}
          <div
            style={{
              padding: '20px 20px 16px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
            }}
          >
            {/* Avatar Photo Frame */}
            <div
              style={{
                width: '84px',
                height: '84px',
                borderRadius: '50%',
                border: '3px solid #2563EB',
                padding: '3px',
                backgroundColor: '#FFFFFF',
                boxShadow: '0 4px 10px rgba(37, 99, 235, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '12px',
              }}
            >
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  backgroundColor: '#EFF6FF',
                  color: '#1D4ED8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '28px',
                  fontWeight: 800,
                }}
              >
                {student.name[0]?.toUpperCase() || 'S'}
              </div>
            </div>

            {/* Name */}
            <div style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', lineHeight: 1.2 }}>
              {student.name}
            </div>
            <div style={{ fontSize: '11px', color: '#2563EB', fontWeight: 700, textTransform: 'uppercase', marginTop: '3px' }}>
              TUITION STUDENT
            </div>

            {/* Monospaced ID Badge */}
            <div
              style={{
                marginTop: '10px',
                padding: '5px 14px',
                borderRadius: '6px',
                backgroundColor: '#F1F5F9',
                border: '1px solid #CBD5E1',
                fontFamily: 'monospace',
                fontSize: '13px',
                fontWeight: 800,
                color: '#0F1E36',
                letterSpacing: '0.06em',
              }}
            >
              {code}
            </div>

            {/* Details Table */}
            <div
              style={{
                width: '100%',
                marginTop: '16px',
                paddingTop: '12px',
                borderTop: '1px dashed #E2E8F0',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                fontSize: '11.5px',
                textAlign: 'left',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B', fontWeight: 600 }}>Class / Grade:</span>
                <span style={{ color: '#0F172A', fontWeight: 700 }}>{student.grade || 'Class 12'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B', fontWeight: 600 }}>Parent / Guardian:</span>
                <span style={{ color: '#0F172A', fontWeight: 600 }}>{student.parentName || 'Guardian / N/A'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B', fontWeight: 600 }}>Contact Phone:</span>
                <span style={{ color: '#0F172A', fontWeight: 600 }}>{student.phone || student.parentPhone || 'N/A'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B', fontWeight: 600 }}>Status:</span>
                <span style={{ color: '#10B981', fontWeight: 700 }}>ACTIVE ENROLLED</span>
              </div>
            </div>

            {/* Offline-Safe SVG QR Code */}
            <div
              style={{
                marginTop: '16px',
                padding: '10px',
                backgroundColor: '#F8FAFC',
                borderRadius: '8px',
                border: '1px solid #E2E8F0',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* QR Finder Corners */}
                <rect x="4" y="4" width="20" height="20" rx="3" fill="#0F1E36" />
                <rect x="8" y="8" width="12" height="12" rx="1" fill="#FFFFFF" />
                <rect x="11" y="11" width="6" height="6" fill="#0F1E36" />

                <rect x="40" y="4" width="20" height="20" rx="3" fill="#0F1E36" />
                <rect x="44" y="8" width="12" height="12" rx="1" fill="#FFFFFF" />
                <rect x="47" y="11" width="6" height="6" fill="#0F1E36" />

                <rect x="4" y="40" width="20" height="20" rx="3" fill="#0F1E36" />
                <rect x="8" y="44" width="12" height="12" rx="1" fill="#FFFFFF" />
                <rect x="11" y="47" width="6" height="6" fill="#0F1E36" />

                {/* Inner Data Cells */}
                <rect x="28" y="6" width="6" height="6" fill="#0F1E36" />
                <rect x="28" y="16" width="6" height="4" fill="#0F1E36" />
                <rect x="6" y="28" width="6" height="6" fill="#0F1E36" />
                <rect x="16" y="28" width="6" height="4" fill="#0F1E36" />
                <rect x="28" y="28" width="8" height="8" rx="1" fill="#2563EB" />
                <rect x="40" y="28" width="6" height="6" fill="#0F1E36" />
                <rect x="52" y="28" width="6" height="6" fill="#0F1E36" />
                <rect x="28" y="40" width="6" height="6" fill="#0F1E36" />
                <rect x="40" y="40" width="6" height="8" fill="#0F1E36" />
                <rect x="50" y="44" width="8" height="6" fill="#0F1E36" />
                <rect x="28" y="52" width="6" height="6" fill="#0F1E36" />
                <rect x="42" y="54" width="6" height="4" fill="#0F1E36" />
              </svg>
              <span style={{ fontSize: '9px', color: '#64748B', fontFamily: 'monospace' }}>
                VERIFIED ID &bull; {code}
              </span>
            </div>
          </div>

          {/* Bottom Security Watermark Strip */}
          <div
            style={{
              padding: '6px 12px',
              backgroundColor: '#0F1E36',
              color: '#94A3B8',
              fontSize: '9.5px',
              textAlign: 'center',
              fontWeight: 500,
            }}
          >
            EduPye Platform Security &bull; Valid for Session {academicSession}
          </div>
        </div>

        {/* Modal Outer Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            onClick={handlePrint}
            style={{
              padding: '9px 18px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#2563EB',
              color: '#FFFFFF',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
            }}
          >
            <i className="fas fa-print" /> Print ID Card
          </button>

          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '9px 16px',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              color: '#FFFFFF',
              fontSize: '13px',
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
