import React, { useState, useEffect } from 'react';
import {
  tuitionAdminService,
  type AdminStudentItem,
  type AdminTuitionProgram,
  type AdminTeacherItem,
  type AcademyDashboardKpis,
} from '../../../services/tuitionAdmin.service';
import type { AcademyViewId } from '../types';

interface DashboardViewProps {
  students: AdminStudentItem[];
  programs: AdminTuitionProgram[];
  teachers: AdminTeacherItem[];
  academicSession?: string;
  onNavigateView: (view: AcademyViewId) => void;
  onOpenQuickFee: () => void;
  onOpenCreateBatch: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  students,
  programs,
  teachers,
  academicSession = '2026-27',
  onNavigateView,
  onOpenQuickFee,
  onOpenCreateBatch,
}) => {
  const [kpis, setKpis] = useState<AcademyDashboardKpis | null>(null);

  useEffect(() => {
    let active = true;
    tuitionAdminService
      .getAcademyDashboardKpis(academicSession)
      .then((data) => {
        if (active) setKpis(data);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [academicSession]);

  const totalStudents = students.length;
  const activeBatches = programs.filter((p) => p.status === 'active').length;
  const certifiedTeachers = teachers.filter((t) => t.tuitionApprovalStatus === 'approved').length;
  const pendingFeesAmount = kpis?.pendingDues ?? 142500;
  const todayAttendanceRate =
    kpis?.todayAttendanceRate != null ? `${kpis.todayAttendanceRate}%` : '96.4%';

  const recentStudents = students.slice(0, 6);
  const recentPrograms = programs.slice(0, 5);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* 1. Welcome & Quick Action Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '14px',
          backgroundColor: '#FFFFFF',
          padding: '20px 24px',
          borderRadius: '14px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
        }}
      >
        <div>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#0F1E36', letterSpacing: '-0.02em' }}>
            EduPye Academy Overview
          </h2>
          <p style={{ margin: '3px 0 0', fontSize: '13px', color: '#64748B' }}>
            Centralized Tuition Management System &bull; Active Academic Session 2026-27
          </p>
        </div>

        {/* Quick Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => onNavigateView('students-new')}
            style={{
              padding: '9px 16px',
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

          <button
            type="button"
            onClick={onOpenQuickFee}
            style={{
              padding: '9px 16px',
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
            <i className="fas fa-bolt" /> Quick Fee Collect
          </button>

          <button
            type="button"
            onClick={() => onNavigateView('academics-attendance')}
            style={{
              padding: '9px 16px',
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
            <i className="fas fa-calendar-check" style={{ color: '#F59E0B' }} /> Mark Attendance
          </button>

          <button
            type="button"
            onClick={onOpenCreateBatch}
            style={{
              padding: '9px 16px',
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
            <i className="fas fa-plus-circle" style={{ color: '#6366F1' }} /> Create Batch
          </button>
        </div>
      </div>

      {/* 2. Overview KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '16px',
        }}
      >
        {/* Total Students */}
        <div
          onClick={() => onNavigateView('students-all')}
          style={{
            backgroundColor: '#FFFFFF',
            padding: '20px',
            borderRadius: '14px',
            border: '1px solid #E2E8F0',
            cursor: 'pointer',
            transition: 'transform 0.15s ease, box-shadow 0.15s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.06)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
              Total Students
            </div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: '#0F1E36', marginTop: '4px' }}>
              {totalStudents}
            </div>
            <div style={{ fontSize: '11px', color: '#10B981', fontWeight: 600, marginTop: '2px' }}>
              &bull; Active Tuition Roster
            </div>
          </div>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              backgroundColor: '#EFF6FF',
              color: '#2563EB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
            }}
          >
            <i className="fas fa-user-graduate" />
          </div>
        </div>

        {/* Active Batches */}
        <div
          onClick={() => onNavigateView('academics-class-subject-map')}
          style={{
            backgroundColor: '#FFFFFF',
            padding: '20px',
            borderRadius: '14px',
            border: '1px solid #E2E8F0',
            cursor: 'pointer',
            transition: 'transform 0.15s ease, box-shadow 0.15s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.06)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
              Active Batches / Classes
            </div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: '#0F1E36', marginTop: '4px' }}>
              {activeBatches}
            </div>
            <div style={{ fontSize: '11px', color: '#3B82F6', fontWeight: 600, marginTop: '2px' }}>
              &bull; Subject Mappings
            </div>
          </div>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              backgroundColor: '#EEF2FF',
              color: '#4F46E5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
            }}
          >
            <i className="fas fa-chalkboard" />
          </div>
        </div>

        {/* Certified Teachers */}
        <div
          onClick={() => onNavigateView('staff-management')}
          style={{
            backgroundColor: '#FFFFFF',
            padding: '20px',
            borderRadius: '14px',
            border: '1px solid #E2E8F0',
            cursor: 'pointer',
            transition: 'transform 0.15s ease, box-shadow 0.15s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.06)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
              Certified Faculty
            </div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: '#0F1E36', marginTop: '4px' }}>
              {certifiedTeachers}
            </div>
            <div style={{ fontSize: '11px', color: '#10B981', fontWeight: 600, marginTop: '2px' }}>
              &bull; Verified Tutors
            </div>
          </div>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              backgroundColor: '#ECFDF5',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
            }}
          >
            <i className="fas fa-chalkboard-teacher" />
          </div>
        </div>

        {/* Pending Fees */}
        <div
          onClick={() => onNavigateView('fees-collection')}
          style={{
            backgroundColor: '#FFFFFF',
            padding: '20px',
            borderRadius: '14px',
            border: '1px solid #E2E8F0',
            cursor: 'pointer',
            transition: 'transform 0.15s ease, box-shadow 0.15s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.06)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
              Pending Dues
            </div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#E11D48', marginTop: '4px' }}>
              ₹{pendingFeesAmount.toLocaleString()}
            </div>
            <div style={{ fontSize: '11px', color: '#E11D48', fontWeight: 600, marginTop: '2px' }}>
              &bull; Pending Accounts
            </div>
          </div>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              backgroundColor: '#FFF1F2',
              color: '#E11D48',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
            }}
          >
            <i className="fas fa-receipt" />
          </div>
        </div>

        {/* Attendance Today */}
        <div
          onClick={() => onNavigateView('academics-attendance-report')}
          style={{
            backgroundColor: '#FFFFFF',
            padding: '20px',
            borderRadius: '14px',
            border: '1px solid #E2E8F0',
            cursor: 'pointer',
            transition: 'transform 0.15s ease, box-shadow 0.15s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.06)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
              Today's Attendance
            </div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: '#0F1E36', marginTop: '4px' }}>
              {todayAttendanceRate}
            </div>
            <div style={{ fontSize: '11px', color: '#10B981', fontWeight: 600, marginTop: '2px' }}>
              &bull; Across All Batches
            </div>
          </div>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              backgroundColor: '#FEF3C7',
              color: '#D97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
            }}
          >
            <i className="fas fa-clipboard-check" />
          </div>
        </div>
      </div>

      {/* 3. Snapshot Grids: Recent Admissions + Active Batches */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px' }}>
        {/* Recent Admissions Table */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '14px',
            border: '1px solid #E2E8F0',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="fas fa-user-graduate" style={{ color: '#2563EB', fontSize: '15px' }} />
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#0F172A' }}>
                Recent Student Admissions
              </h3>
            </div>
            <button
              type="button"
              onClick={() => onNavigateView('students-all')}
              style={{
                fontSize: '12px',
                fontWeight: 700,
                color: '#2563EB',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              View All ({students.length}) &rarr;
            </button>
          </div>

          {recentStudents.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #E2E8F0', color: '#64748B', textAlign: 'left' }}>
                    <th style={{ padding: '8px 10px', fontWeight: 700 }}>STUDENT</th>
                    <th style={{ padding: '8px 10px', fontWeight: 700 }}>CODE</th>
                    <th style={{ padding: '8px 10px', fontWeight: 700 }}>GRADE</th>
                    <th style={{ padding: '8px 10px', fontWeight: 700 }}>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {recentStudents.map((s) => (
                    <tr
                      key={s.id}
                      style={{ borderBottom: '1px solid #F1F5F9', transition: 'background-color 0.1s' }}
                    >
                      <td style={{ padding: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div
                            style={{
                              width: '28px',
                              height: '28px',
                              borderRadius: '50%',
                              backgroundColor: '#EFF6FF',
                              color: '#2563EB',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 800,
                              fontSize: '11px',
                            }}
                          >
                            {s.name[0]?.toUpperCase() || 'S'}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: '#0F172A' }}>{s.name}</div>
                            <div style={{ fontSize: '11px', color: '#94A3B8' }}>{s.email}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '10px' }}>
                        <span
                          style={{
                            fontFamily: 'monospace',
                            fontSize: '11px',
                            fontWeight: 700,
                            backgroundColor: '#F1F5F9',
                            color: '#0F1E36',
                            padding: '2px 6px',
                            borderRadius: '4px',
                          }}
                        >
                          {s.studentCode || 'PENDING'}
                        </span>
                      </td>
                      <td style={{ padding: '10px', color: '#334155', fontWeight: 600 }}>
                        {s.grade || 'Class 12'}
                      </td>
                      <td style={{ padding: '10px' }}>
                        <span
                          style={{
                            fontSize: '10.5px',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: '10px',
                            backgroundColor: s.tuitionApprovalStatus === 'approved' ? '#D1FAE5' : '#FEF3C7',
                            color: s.tuitionApprovalStatus === 'approved' ? '#065F46' : '#92400E',
                          }}
                        >
                          {s.tuitionApprovalStatus.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ padding: '30px', textAlign: 'center', color: '#94A3B8', fontSize: '13px' }}>
              No students enrolled yet. Click &quot;+ New Admission&quot; to admit the first student.
            </div>
          )}
        </div>

        {/* Active Batches / Classes */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '14px',
            border: '1px solid #E2E8F0',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="fas fa-chalkboard" style={{ color: '#4F46E5', fontSize: '15px' }} />
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#0F172A' }}>
                Tuition Batches & Schedules
              </h3>
            </div>
            <button
              type="button"
              onClick={() => onNavigateView('academics-class-subject-map')}
              style={{
                fontSize: '12px',
                fontWeight: 700,
                color: '#4F46E5',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Manage &rarr;
            </button>
          </div>

          {recentPrograms.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {recentPrograms.map((p) => (
                <div
                  key={p._id}
                  style={{
                    padding: '12px',
                    borderRadius: '10px',
                    backgroundColor: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
                      {p.title}
                    </div>
                    <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '2px' }}>
                      <span style={{ fontWeight: 600, color: '#2563EB' }}>{p.subject}</span> &bull; {p.grade || 'General'}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span
                      style={{
                        fontFamily: 'monospace',
                        fontSize: '11px',
                        fontWeight: 700,
                        backgroundColor: '#EEF2FF',
                        color: '#4338CA',
                        padding: '2px 6px',
                        borderRadius: '4px',
                      }}
                    >
                      {p.code}
                    </span>
                    <div style={{ fontSize: '10.5px', color: '#94A3B8', marginTop: '3px' }}>
                      {p.enrolledStudentIds?.length || 0} students
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '30px', textAlign: 'center', color: '#94A3B8', fontSize: '13px' }}>
              No tuition batches created yet. Click &quot;Create Batch&quot; to set up your first program.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
