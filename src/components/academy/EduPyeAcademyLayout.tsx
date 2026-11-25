import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { EduPyeAcademySidebar } from './EduPyeAcademySidebar';
import type { AcademyViewId } from './types';
import { ACADEMY_NAV_CATEGORIES } from './types';
import {
  tuitionAdminService,
  type AdminStudentItem,
  type AdminTuitionProgram,
  type AdminTeacherItem,
} from '../../services/tuitionAdmin.service';
import { useToast } from '../../hooks/useToast';
import { Loader } from '../common/Loader';

// Views
import { DashboardView } from './views/DashboardView';
import { AllStudentsView } from './views/AllStudentsView';
import { NewAdmissionView } from './views/NewAdmissionView';
import { ClassSubjectMapView } from './views/ClassSubjectMapView';
import { StaffManagementView } from './views/StaffManagementView';
import { AttendanceView } from './views/AttendanceView';
import { AttendanceReportView } from './views/AttendanceReportView';
import { FeeStructureView } from './views/FeeStructureView';
import { FeeCollectionView } from './views/FeeCollectionView';
import { FeeDefaulterView } from './views/FeeDefaulterView';
import { ExamsView } from './views/ExamsView';
import { MarksEntryView } from './views/MarksEntryView';
import { ClassResultView } from './views/ClassResultView';
import { SalaryManagementView } from './views/SalaryManagementView';
import { ExpensesFinanceView } from './views/ExpensesFinanceView';
import { NoticesView } from './views/NoticesView';
import { EnquiryManagerView } from './views/EnquiryManagerView';
import { ArchivePromotionView } from './views/ArchivePromotionView';
import { AcademySettingsView } from './views/AcademySettingsView';
import { AcademyStarterView } from './views/AcademyStarterView';

// Modals
import { StudentProfileModal } from './modals/StudentProfileModal';
import { StudentIdCardModal } from './modals/StudentIdCardModal';
import { AssignBatchModal } from './modals/AssignBatchModal';
import { CreateBatchModal } from './modals/CreateBatchModal';
import { QuickFeeModal } from './modals/QuickFeeModal';

interface EduPyeAcademyLayoutProps {
  onNavigateDashboard?: () => void;
}

export const EduPyeAcademyLayout: React.FC<EduPyeAcademyLayoutProps> = ({
  onNavigateDashboard,
}) => {
  const { showToast } = useToast();

  // Helper to determine initial view from URL path
  const getInitialView = (): AcademyViewId => {
    if (typeof window !== 'undefined') {
      const p = window.location.pathname;
      if (p.includes('/students/new')) return 'students-new';
      if (p.includes('/students/enquiry')) return 'students-enquiry';
      if (p.includes('/students/archive')) return 'students-archive';
      if (p.includes('/students/promotion')) return 'students-promotion';
      if (p.includes('/students/session-report')) return 'students-session-report';
      if (p === '/academy/students' || p.startsWith('/academy/students/')) return 'students-all';
      if (p.includes('/fees/structure')) return 'fees-structure';
      if (p.includes('/fees/collection')) return 'fees-collection';
      if (p.includes('/fees/quick-collect')) return 'fees-quick-collect';
      if (p.includes('/fees/defaulters')) return 'fees-defaulters';
      if (p.includes('/academics/attendance-report')) return 'academics-attendance-report';
      if (p.includes('/academics/attendance')) return 'academics-attendance';
      if (p.includes('/academics/class-subject-map')) return 'academics-class-subject-map';
      if (p.includes('/academics/subjects')) return 'academics-subjects';
      if (p.includes('/academics/exams')) return 'academics-exams';
      if (p.includes('/academics/marks-entry')) return 'academics-marks-entry';
      if (p.includes('/academics/class-result')) return 'academics-class-result';
      if (p.includes('/academics/exam-schedule')) return 'academics-exam-schedule';
      if (p.includes('/finance/expenses')) return 'finance-expenses';
      if (p.includes('/finance/reports')) return 'finance-reports';
      if (p.includes('/finance/income-expense')) return 'finance-income-expense';
      if (p.includes('/staff')) return 'staff-management';
      if (p.includes('/payroll/salary')) return 'payroll-salary';
      if (p.includes('/payroll/report')) return 'payroll-report';
      if (p.includes('/communication/notices')) return 'communication-notices';
      if (p.includes('/admin/settings')) return 'admin-settings';
    }
    return 'dashboard';
  };

  const [activeView, setActiveView] = useState<AcademyViewId>(getInitialView);
  const [academicSession, setAcademicSession] = useState<string>('2026-27');
  const [loading, setLoading] = useState<boolean>(true);

  // Live Data States
  const [students, setStudents] = useState<AdminStudentItem[]>([]);
  const [programs, setPrograms] = useState<AdminTuitionProgram[]>([]);
  const [teachers, setTeachers] = useState<AdminTeacherItem[]>([]);

  // Modals States
  const [selectedStudentForProfile, setSelectedStudentForProfile] = useState<AdminStudentItem | null>(null);
  const [selectedStudentForIdCard, setSelectedStudentForIdCard] = useState<AdminStudentItem | null>(null);
  const [selectedStudentForAssignBatch, setSelectedStudentForAssignBatch] = useState<AdminStudentItem | null>(null);
  const [isCreateBatchModalOpen, setIsCreateBatchModalOpen] = useState(false);
  const [isQuickFeeModalOpen, setIsQuickFeeModalOpen] = useState(false);
  const [quickFeePreloadStudent, setQuickFeePreloadStudent] = useState<AdminStudentItem | null>(null);
  const [quickFeePreloadAmount, setQuickFeePreloadAmount] = useState<number | undefined>(undefined);
  const [targetExamIdForMarksEntry, setTargetExamIdForMarksEntry] = useState<string | undefined>(undefined);

  // Fetch real data
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [sList, pList, tList] = await Promise.all([
        tuitionAdminService.getStudents().catch(() => []),
        tuitionAdminService.getPrograms().catch(() => []),
        tuitionAdminService.getTeachers().catch(() => []),
      ]);
      setStudents(sList);
      setPrograms(pList);
      setTeachers(tList);
    } catch (err: any) {
      showToast(err.message || 'Failed to fetch EduPye Academy records', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Sync active view with browser URL
  const handleSelectView = (view: AcademyViewId) => {
    setActiveView(view);
    // Find path from navigation config
    let targetPath = '/academy/dashboard';
    for (const cat of ACADEMY_NAV_CATEGORIES) {
      const match = cat.items.find((i) => i.id === view);
      if (match) {
        targetPath = match.path;
        break;
      }
    }
    if (typeof window !== 'undefined' && window.location.pathname !== targetPath) {
      window.history.pushState({}, '', targetPath);
    }
  };

  // Find active label for breadcrumb
  const currentViewMeta = useMemo(() => {
    for (const cat of ACADEMY_NAV_CATEGORIES) {
      const match = cat.items.find((i) => i.id === activeView);
      if (match) {
        return { category: cat.category, label: match.label, icon: match.icon };
      }
    }
    return { category: 'MAIN', label: 'Dashboard', icon: 'fa-th-large' };
  }, [activeView]);

  const handleReturnToMainAdmin = () => {
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', '/');
    }
    if (onNavigateDashboard) {
      onNavigateDashboard();
    }
  };

  const renderActiveViewContent = () => {
    switch (activeView) {
      case 'dashboard':
        return (
          <DashboardView
            students={students}
            programs={programs}
            teachers={teachers}
            academicSession={academicSession}
            onNavigateView={handleSelectView}
            onOpenQuickFee={() => {
              setQuickFeePreloadStudent(null);
              setQuickFeePreloadAmount(undefined);
              setIsQuickFeeModalOpen(true);
            }}
            onOpenCreateBatch={() => setIsCreateBatchModalOpen(true)}
          />
        );
      case 'students-all':
        return (
          <AllStudentsView
            students={students}
            programs={programs}
            onRefresh={loadData}
            onNavigateNewAdmission={() => handleSelectView('students-new')}
            onOpenProfile={(s) => setSelectedStudentForProfile(s)}
            onOpenIdCard={(s) => setSelectedStudentForIdCard(s)}
            onOpenAssignBatch={(s) => setSelectedStudentForAssignBatch(s)}
          />
        );
      case 'students-new':
        return (
          <NewAdmissionView
            programs={programs}
            academicSession={academicSession}
            onSuccess={loadData}
            onNavigateAllStudents={() => handleSelectView('students-all')}
            onOpenIdCard={(s) => setSelectedStudentForIdCard(s)}
          />
        );
      case 'students-enquiry':
        return (
          <EnquiryManagerView
            academicSession={academicSession}
            onNavigateNewAdmission={() => handleSelectView('students-new')}
          />
        );
      case 'students-archive':
      case 'students-promotion':
      case 'students-session-report':
        return (
          <ArchivePromotionView
            students={students}
            programs={programs}
            academicSession={academicSession}
            viewId={activeView}
          />
        );
      case 'academics-attendance':
        return (
          <AttendanceView
            programs={programs}
            teachers={teachers}
            academicSession={academicSession}
          />
        );
      case 'academics-attendance-report':
        return (
          <AttendanceReportView
            programs={programs}
            teachers={teachers}
            academicSession={academicSession}
          />
        );
      case 'academics-exams':
      case 'academics-exam-schedule':
        return (
          <ExamsView
            programs={programs}
            academicSession={academicSession}
            onNavigateMarksEntry={(examId) => {
              setTargetExamIdForMarksEntry(examId);
              handleSelectView('academics-marks-entry');
            }}
          />
        );
      case 'academics-marks-entry':
        return (
          <MarksEntryView
            programs={programs}
            academicSession={academicSession}
            initialExamId={targetExamIdForMarksEntry}
          />
        );
      case 'academics-class-result':
        return (
          <ClassResultView
            programs={programs}
            academicSession={academicSession}
          />
        );
      case 'payroll-salary':
      case 'payroll-report':
        return (
          <SalaryManagementView
            teachers={teachers}
            academicSession={academicSession}
          />
        );
      case 'finance-expenses':
      case 'finance-reports':
      case 'finance-income-expense':
        return (
          <ExpensesFinanceView
            academicSession={academicSession}
          />
        );
      case 'communication-notices':
        return (
          <NoticesView
            programs={programs}
          />
        );
      case 'admin-settings':
        return (
          <AcademySettingsView
            academicSession={academicSession}
            onSessionChange={setAcademicSession}
          />
        );
      case 'fees-structure':
        return (
          <FeeStructureView
            programs={programs}
            academicSession={academicSession}
          />
        );
      case 'fees-collection':
      case 'fees-quick-collect':
        return (
          <FeeCollectionView
            students={students}
            programs={programs}
            academicSession={academicSession}
            onOpenQuickFee={() => {
              setQuickFeePreloadStudent(null);
              setQuickFeePreloadAmount(undefined);
              setIsQuickFeeModalOpen(true);
            }}
          />
        );
      case 'fees-defaulters':
        return (
          <FeeDefaulterView
            students={students}
            academicSession={academicSession}
            onCollectDefaulter={(stu, due) => {
              setQuickFeePreloadStudent(stu);
              setQuickFeePreloadAmount(due);
              setIsQuickFeeModalOpen(true);
            }}
          />
        );
      case 'academics-class-subject-map':
      case 'academics-subjects':
        return (
          <ClassSubjectMapView
            programs={programs}
            teachers={teachers}
            onRefresh={loadData}
            onOpenCreateBatch={() => setIsCreateBatchModalOpen(true)}
          />
        );
      case 'staff-management':
        return (
          <StaffManagementView
            teachers={teachers}
            onRefresh={loadData}
          />
        );
      default:
        return (
          <AcademyStarterView
            viewId={activeView}
            academicSession={academicSession}
            onOpenQuickFee={() => setIsQuickFeeModalOpen(true)}
            onNavigateView={handleSelectView}
          />
        );
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        width: '100%',
        backgroundColor: '#F8FAFC',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      {/* 1. Dedicated Deep Navy Sidebar */}
      <EduPyeAcademySidebar
        activeView={activeView}
        onSelectView={handleSelectView}
        onReturnToMainAdmin={handleReturnToMainAdmin}
        academicSession={academicSession}
        onSessionChange={setAcademicSession}
      />

      {/* 2. Main Workspace Canvas */}
      <main
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          backgroundColor: '#F8FAFC',
          minHeight: '100vh',
        }}
      >
        {/* Top Navbar */}
        <header
          style={{
            height: '64px',
            backgroundColor: '#FFFFFF',
            borderBottom: '1px solid #E2E8F0',
            padding: '0 28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            zIndex: 30,
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)',
          }}
        >
          {/* Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
            <span style={{ color: '#64748B', fontWeight: 500 }}>EduPye Academy</span>
            <span style={{ color: '#CBD5E1' }}>/</span>
            <span style={{ color: '#64748B', fontWeight: 600 }}>{currentViewMeta.category}</span>
            <span style={{ color: '#CBD5E1' }}>/</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0F1E36', fontWeight: 800 }}>
              <i className={`fas ${currentViewMeta.icon}`} style={{ color: '#2563EB', fontSize: '12px' }} />
              <span>{currentViewMeta.label}</span>
            </div>
          </div>

          {/* Right Header Badges & Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Session Pill */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: '#EFF6FF',
                border: '1px solid #BFDBFE',
                borderRadius: '8px',
                padding: '5px 10px',
                fontSize: '11.5px',
                fontWeight: 700,
                color: '#1E40AF',
              }}
            >
              <i className="fas fa-check-circle" style={{ color: '#10B981', fontSize: '11px' }} />
              <span>Session: {academicSession}</span>
            </div>

            {/* Quick Fee Collect Button */}
            <button
              type="button"
              onClick={() => setIsQuickFeeModalOpen(true)}
              style={{
                padding: '6px 12px',
                borderRadius: '7px',
                border: '1px solid #BFDBFE',
                backgroundColor: '#EFF6FF',
                color: '#1D4ED8',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <i className="fas fa-bolt" /> Quick Fee
            </button>

            {/* + New Admission Button */}
            <button
              type="button"
              onClick={() => handleSelectView('students-new')}
              style={{
                padding: '6px 14px',
                borderRadius: '7px',
                border: 'none',
                backgroundColor: '#10B981',
                color: '#FFFFFF',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 6px rgba(16, 185, 129, 0.2)',
              }}
            >
              <i className="fas fa-user-plus" /> + New Admission
            </button>
          </div>
        </header>

        {/* Workspace Body Content */}
        <div style={{ flex: 1, padding: '24px 28px', maxWidth: '1440px', width: '100%', margin: '0 auto' }}>
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
              <Loader label="Synchronizing EduPye Academy Records..." />
            </div>
          ) : (
            renderActiveViewContent()
          )}
        </div>
      </main>

      {/* Modals */}
      {selectedStudentForProfile && (
        <StudentProfileModal
          student={selectedStudentForProfile}
          onClose={() => setSelectedStudentForProfile(null)}
          onOpenIdCard={(s) => setSelectedStudentForIdCard(s)}
          onOpenAssignBatch={(s) => setSelectedStudentForAssignBatch(s)}
        />
      )}

      {selectedStudentForIdCard && (
        <StudentIdCardModal
          student={selectedStudentForIdCard}
          academicSession={academicSession}
          onClose={() => setSelectedStudentForIdCard(null)}
        />
      )}

      {selectedStudentForAssignBatch && (
        <AssignBatchModal
          student={selectedStudentForAssignBatch}
          programs={programs}
          onClose={() => setSelectedStudentForAssignBatch(null)}
          onSuccess={loadData}
        />
      )}

      {isCreateBatchModalOpen && (
        <CreateBatchModal
          teachers={teachers}
          onClose={() => setIsCreateBatchModalOpen(false)}
          onSuccess={loadData}
        />
      )}

      {isQuickFeeModalOpen && (
        <QuickFeeModal
          students={students}
          initialStudent={quickFeePreloadStudent}
          initialAmount={quickFeePreloadAmount}
          onClose={() => {
            setIsQuickFeeModalOpen(false);
            setQuickFeePreloadStudent(null);
            setQuickFeePreloadAmount(undefined);
          }}
          onSuccess={loadData}
        />
      )}
    </div>
  );
};

export default EduPyeAcademyLayout;
