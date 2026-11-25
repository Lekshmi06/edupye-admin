export type AcademyViewId =
  // Main
  | 'dashboard'
  // Students
  | 'students-enquiry'
  | 'students-new'
  | 'students-all'
  | 'students-archive'
  | 'students-promotion'
  | 'students-session-report'
  // Fees
  | 'fees-structure'
  | 'fees-collection'
  | 'fees-quick-collect'
  | 'fees-defaulters'
  // Academics
  | 'academics-attendance'
  | 'academics-attendance-report'
  | 'academics-exams'
  | 'academics-marks-entry'
  | 'academics-class-result'
  | 'academics-subjects'
  | 'academics-class-subject-map'
  | 'academics-exam-schedule'
  // Finance
  | 'finance-expenses'
  | 'finance-reports'
  | 'finance-income-expense'
  // Staff / Payroll
  | 'staff-management'
  | 'payroll-salary'
  | 'payroll-report'
  // Communication & Admin
  | 'communication-notices'
  | 'admin-settings';

export interface AcademyNavItem {
  id: AcademyViewId;
  label: string;
  icon: string;
  badge?: string | number;
  badgeColor?: string;
  path: string;
}

export interface AcademyNavCategory {
  category: string;
  items: AcademyNavItem[];
}

export const ACADEMY_NAV_CATEGORIES: AcademyNavCategory[] = [
  {
    category: 'MAIN',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: 'fa-th-large', path: '/academy/dashboard' },
    ],
  },
  {
    category: 'STUDENTS',
    items: [
      { id: 'students-enquiry', label: 'Admission Enquiry', icon: 'fa-user-clock', path: '/academy/students/enquiry' },
      { id: 'students-new', label: 'New Admission', icon: 'fa-user-plus', path: '/academy/students/new', badge: 'Hot', badgeColor: '#10b981' },
      { id: 'students-all', label: 'All Students', icon: 'fa-users', path: '/academy/students' },
      { id: 'students-archive', label: 'Passed Out Archive', icon: 'fa-user-graduate', path: '/academy/students/archive' },
      { id: 'students-promotion', label: 'Promotion', icon: 'fa-level-up-alt', path: '/academy/students/promotion' },
      { id: 'students-session-report', label: 'Session Report', icon: 'fa-file-alt', path: '/academy/students/session-report' },
    ],
  },
  {
    category: 'FEES',
    items: [
      { id: 'fees-structure', label: 'Fee Structure', icon: 'fa-file-invoice-dollar', path: '/academy/fees/structure' },
      { id: 'fees-collection', label: 'Fee Collection', icon: 'fa-receipt', path: '/academy/fees/collection' },
      { id: 'fees-quick-collect', label: 'Quick Fee Collect', icon: 'fa-bolt', path: '/academy/fees/quick-collect', badge: 'Quick', badgeColor: '#3b82f6' },
      { id: 'fees-defaulters', label: 'Fee Defaulter Log', icon: 'fa-exclamation-triangle', path: '/academy/fees/defaulters' },
    ],
  },
  {
    category: 'ACADEMICS',
    items: [
      { id: 'academics-attendance', label: 'Attendance', icon: 'fa-calendar-check', path: '/academy/academics/attendance' },
      { id: 'academics-attendance-report', label: 'Attendance Report', icon: 'fa-clipboard-list', path: '/academy/academics/attendance-report' },
      { id: 'academics-exams', label: 'Exams', icon: 'fa-pen-fancy', path: '/academy/academics/exams' },
      { id: 'academics-marks-entry', label: 'Marks Entry', icon: 'fa-edit', path: '/academy/academics/marks-entry' },
      { id: 'academics-class-result', label: 'Class Result', icon: 'fa-award', path: '/academy/academics/class-result' },
      { id: 'academics-subjects', label: 'Subjects', icon: 'fa-book-open', path: '/academy/academics/subjects' },
      { id: 'academics-class-subject-map', label: 'Class-Subject Map', icon: 'fa-sitemap', path: '/academy/academics/class-subject-map' },
      { id: 'academics-exam-schedule', label: 'Exam Schedule', icon: 'fa-clock', path: '/academy/academics/exam-schedule' },
    ],
  },
  {
    category: 'FINANCE',
    items: [
      { id: 'finance-expenses', label: 'Expenses', icon: 'fa-wallet', path: '/academy/finance/expenses' },
      { id: 'finance-reports', label: 'All Reports', icon: 'fa-chart-pie', path: '/academy/finance/reports' },
      { id: 'finance-income-expense', label: 'Income vs Expense', icon: 'fa-balance-scale', path: '/academy/finance/income-expense' },
    ],
  },
  {
    category: 'STAFF / PAYROLL',
    items: [
      { id: 'staff-management', label: 'Staff Management', icon: 'fa-chalkboard-teacher', path: '/academy/staff' },
      { id: 'payroll-salary', label: 'Salary Management', icon: 'fa-money-check-alt', path: '/academy/payroll/salary' },
      { id: 'payroll-report', label: 'Salary Report', icon: 'fa-file-invoice', path: '/academy/payroll/report' },
    ],
  },
  {
    category: 'COMMUNICATION & ADMIN',
    items: [
      { id: 'communication-notices', label: 'Notices', icon: 'fa-bullhorn', path: '/academy/communication/notices' },
      { id: 'admin-settings', label: 'Academy Settings', icon: 'fa-cog', path: '/academy/admin/settings' },
    ],
  },
];
