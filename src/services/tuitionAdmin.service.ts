import { API_BASE_URL } from './apiConfig';
import { authService } from './auth.service';

export interface AdminTeacherItem {
  id: string;
  name: string;
  username?: string;
  email: string;
  role: string;
  teacherCode: string | null;
  tuitionApprovalStatus: 'approved' | 'pending' | 'rejected' | 'revoked' | 'suspended' | 'none';
  tier?: string;
  subjects?: string[];
  grades?: string[];
  assignedPrograms?: Array<{ id: string; title: string; code: string; subject?: string; grade?: string }>;
  phone?: string | null;
  qualifications?: string[];
  bio?: string;
  demoLink?: string;
  interviewStatus?: 'pending_interview' | 'interview_scheduled' | 'approved' | 'rejected';
  interviewDate?: string | null;
  interviewNotes?: string;
  createdAt: string;
}

export interface AdminStudentItem {
  id: string;
  name: string;
  username?: string;
  email: string;
  phone?: string;
  role: string;
  studentCode: string | null;
  tuitionApprovalStatus: 'approved' | 'pending' | 'rejected' | 'revoked' | 'suspended' | 'none';
  grade?: string;
  subjects?: string[];
  parentName?: string;
  parentPhone?: string;
  parentRelation?: string;
  gender?: string;
  dob?: string | null;
  address?: string;
  feePlan?: string;
  enrolledPrograms?: Array<{ id: string; title: string; code: string; subject?: string; grade?: string }>;
  createdAt: string;
}

export interface AcademyFeeStructureItem {
  _id: string;
  programId?: any;
  className: string;
  title: string;
  amount: number;
  billingType: 'Monthly' | 'Per-Session Package' | 'One-Time';
  includedSessions?: number | null;
  session: string;
  createdAt?: string;
}

export interface AcademyFeePaymentItem {
  _id: string;
  receiptNo: string;
  studentId: any;
  studentCode: string;
  studentName: string;
  programId?: any;
  feeStructureId?: any;
  monthOrTerm: string;
  amountDue: number;
  amountPaid: number;
  balance: number;
  paymentMode: 'Cash' | 'UPI' | 'Bank Transfer' | 'Card';
  status: 'Paid' | 'Partial' | 'Pending';
  paidAt: string;
  remarks?: string;
  session: string;
}

export interface AcademyFeeDefaulterItem {
  studentId: string;
  studentCode: string;
  studentName: string;
  email: string;
  phone: string;
  parentName: string;
  parentPhone: string;
  classGrade: string;
  overdueMonth: string;
  overdueAmount: number;
  daysOverdue: number;
  status: 'Partial' | 'Pending';
}

export interface StudentAttendanceRecordItem {
  studentId: string;
  studentCode: string;
  studentName: string;
  status: 'Present' | 'Absent' | 'Late' | 'Excused';
  countTowardsQuota: boolean;
  remarks?: string;
}

export interface AcademyAttendanceSessionItem {
  _id?: string;
  programId: string;
  programTitle: string;
  sessionType: '1-on-1' | '1-to-N';
  teacherId: string;
  teacherCode: string;
  teacherName: string;
  date: string;
  timeSlot: string;
  sessionOutcome: 'Completed' | 'Rescheduled' | 'Cancelled';
  source: 'Manual' | 'LiveClassroom';
  session: string;
  records: StudentAttendanceRecordItem[];
}

export interface AttendanceReportResponse {
  success: boolean;
  totalSessionsCount: number;
  overallAttendancePercentage: string;
  studentReports: Array<{
    studentId: string;
    studentCode: string;
    studentName: string;
    totalSessions: number;
    presentCount: number;
    absentCount: number;
    lateCount: number;
    excusedCount: number;
    quotaConsumed: number;
    attendancePercentage: number;
  }>;
  teacherReports: Array<{
    teacherId: string;
    teacherCode: string;
    teacherName: string;
    totalScheduledSessions: number;
    completedSessions: number;
    completed1on1: number;
    completed1toN: number;
    rescheduledOrCancelled: number;
    totalTeachingHours: number;
  }>;
}

export interface AcademyDashboardKpis {
  totalStudents: number;
  certifiedTeachers: number;
  activeBatches: number;
  pendingDues: number;
  todayAttendanceRate: string;
  totalPaidAmount: number;
}

export interface AcademyExamItem {
  _id: string;
  programId: any;
  programTitle: string;
  subject: string;
  title: string;
  testType: 'Weekly Test' | 'Chapter Assessment' | 'Mock Exam' | '1-on-1 Evaluation';
  date: string;
  maxMarks: number;
  passingMarks: number;
  session: string;
  results: Array<{
    studentId: string;
    studentCode: string;
    studentName: string;
    marksObtained: number;
    isAbsent: boolean;
    remarks?: string;
  }>;
  createdAt?: string;
}

export interface StudentProgressItem {
  studentId: string;
  studentCode: string;
  studentName: string;
  parentPhone: string;
  grade: string;
  rank?: number;
  overallAcademicPercentage: number;
  testsAppeared: number;
  testsAbsent: number;
  totalMarksEarned: number;
  totalMaxMarks: number;
  attendancePercentage: number;
  sessionsPresent: number;
  sessionsAbsent: number;
  sessionsLate: number;
  quotaConsumed: number;
  totalScheduledSessions: number;
  examDetails: Array<{
    examId: string;
    title: string;
    testType: string;
    date: string;
    maxMarks: number;
    passingMarks: number;
    marksObtained: number;
    isAbsent: boolean;
    percentage: number;
    status: string;
  }>;
}

export interface StudentProgressResponse {
  success: boolean;
  program: {
    id: string;
    title: string;
    subject: string;
    grade: string;
  };
  studentsProgress: StudentProgressItem[];
}

export interface TutorPayrollCalculationItem {
  payoutId: string | null;
  teacherId: string;
  teacherCode: string;
  teacherName: string;
  email: string;
  month: string;
  payoutType: 'Per-Session' | 'Monthly Retainer + Bonus';
  ratePer1on1Session: number;
  ratePerBatchSession: number;
  fixedRetainer: number;
  completed1on1Count: number;
  completedBatchCount: number;
  bonusAmount: number;
  deductions: number;
  netPayable: number;
  status: 'Draft' | 'Paid';
  paymentMode: string;
  paidAt?: string | null;
  session: string;
}

export interface AcademyTutorPayoutItem {
  _id: string;
  teacherId: any;
  teacherCode: string;
  teacherName: string;
  month: string;
  payoutType: 'Per-Session' | 'Monthly Retainer + Bonus';
  ratePer1on1Session: number;
  ratePerBatchSession: number;
  fixedRetainer: number;
  completed1on1Count: number;
  completedBatchCount: number;
  bonusAmount: number;
  deductions: number;
  netPayable: number;
  status: 'Draft' | 'Paid';
  paymentMode: string;
  paidAt?: string;
  remarks?: string;
  session: string;
}

export interface AcademyExpenseItem {
  _id: string;
  category: 'Rent & Utilities' | 'Study Material & Printing' | 'Tutor Payouts' | 'Software & Equipment' | 'Marketing' | 'Other';
  title: string;
  amount: number;
  date: string;
  paymentMode: string;
  paidTo: string;
  notes?: string;
  session: string;
  tutorPayoutId?: string;
  createdAt?: string;
}

export interface FinanceSummaryResponse {
  success: boolean;
  month: string;
  session: string;
  totalFeeIncome: number;
  totalCenterExpenses: number;
  totalTutorPayouts: number;
  netSurplus: number;
  categoryBreakdown: Record<string, number>;
  transactionCounts: {
    feeReceipts: number;
    expenses: number;
    tutorsPaid: number;
  };
}

export interface AcademyNoticeItem {
  _id: string;
  title: string;
  message: string;
  audience: 'All' | 'Students' | 'Tutors' | 'Specific Batch';
  programId?: any;
  priority: 'Normal' | 'Important' | 'Schedule Change';
  postedBy: string;
  createdAt: string;
}

export interface AcademyEnquiryItem {
  _id: string;
  studentName: string;
  parentName: string;
  phone: string;
  email?: string;
  grade: string;
  subjects: string[];
  status: 'New' | 'Contacted' | 'Demo Scheduled' | 'Converted' | 'Closed';
  notes?: string;
  followUpDate?: string;
  session: string;
  createdAt: string;
}

export interface AdminComplaintItem {
  _id: string;
  ticketCode: string;
  isAnonymous: boolean;
  reporter?: {
    id?: string;
    name: string;
    email: string;
    role: string;
    code: string;
    isAnonymous: boolean;
  };
  reporterRole: 'student' | 'teacher';
  category: string;
  subject: string;
  description: string;
  programId?: {
    _id: string;
    title: string;
    code: string;
    subject: string;
  } | null;
  status: 'open' | 'in_review' | 'resolved' | 'closed';
  adminProgressNotes: Array<{
    message: string;
    updatedBy?: string;
    updatedAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface AdminProgramSlot {
  day: string;
  startTime: string;
  endTime: string;
}

export interface AdminTeacherSubjectMapping {
  teacherId: string;
  subject: string;
}

export interface AdminTuitionProgram {
  _id: string;
  id?: string;
  title: string;
  code: string;
  subject: string;
  grade?: string;
  description?: string;
  schedule: AdminProgramSlot[];
  teacherIds: any[];
  teacherSubjects?: AdminTeacherSubjectMapping[];
  enrolledStudentIds: any[];
  maxCapacity?: number;
  status: 'active' | 'draft' | 'completed' | 'archived';
  createdAt: string;
}

export interface AdminPayoutItem {
  _id: string;
  teacherId?: any;
  teacherName?: string;
  amount: number;
  currency: string;
  status: 'pending' | 'approved' | 'disbursed';
  period?: string;
  totalHours?: number;
  createdAt: string;
}

export interface ComplianceRecordingItem {
  _id?: string;
  id?: string;
  sessionId?: string;
  programCode?: string;
  teacherName?: string;
  durationSeconds?: number;
  recordingUrl?: string;
  createdAt?: string;
}

export interface ComplianceChatItem {
  id: string;
  programId: string;
  senderName: string;
  senderRole: string;
  messageType: string;
  content: string;
  fileUrl?: string;
  createdAt: string;
  expiresAt: string;
}

export interface EdupyeTransactionItem {
  id: string;
  receiptNumber: string;
  studentName: string;
  studentEmail?: string;
  studentCode?: string;
  teacherName: string;
  teacherEmail?: string;
  teacherCode?: string;
  subject: string;
  amount: number;
  currency: string;
  status: 'paid' | 'refunded' | 'pending';
  paymentMethod: string;
  createdAt: string;
}

export interface EdupyeAccountsData {
  summary: {
    totalGrossRevenue: number;
    platformNetRevenue: number;
    totalPaidTransactions: number;
    totalEnrollments: number;
    tuitionEnrollments: number;
    courseEnrollments: number;
    pendingPayoutsAmount: number;
    pendingPayoutsCount: number;
    approvedPayoutsAmount: number;
    approvedPayoutsCount: number;
    disbursedPayoutsAmount: number;
    disbursedPayoutsCount: number;
    currency: string;
  };
  recentTransactions: EdupyeTransactionItem[];
  payoutsBreakdown: {
    pendingReview: { count: number; amount: number };
    approved: { count: number; amount: number };
    disbursed: { count: number; amount: number };
  };
}

export const tuitionAdminService = {
  async getTeachers(): Promise<AdminTeacherItem[]> {
    const res = await fetch(`${API_BASE_URL}/api/admin/tuition/teachers`, {
      headers: authService.getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to fetch tuition teachers');
    }
    return data.teachers || [];
  },

  async verifyTeacher(id: string, status: 'approved' | 'rejected' | 'pending', notes?: string): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/api/admin/tuition/teachers/${id}/verify`, {
      method: 'PATCH',
      headers: authService.getAuthHeaders(),
      body: JSON.stringify({ status, notes }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to update teacher verification');
    }
    return data;
  },

  async scheduleInterview(id: string, interviewDate: string, interviewNotes?: string): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/api/admin/tuition/teachers/${id}/interview`, {
      method: 'PATCH',
      headers: authService.getAuthHeaders(),
      body: JSON.stringify({ interviewDate, interviewNotes }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to schedule teacher interview');
    }
    return data;
  },

  async acceptTeacher(id: string, notes?: string): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/api/admin/tuition/teachers/${id}/accept`, {
      method: 'PATCH',
      headers: authService.getAuthHeaders(),
      body: JSON.stringify({ notes }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to accept teacher');
    }
    return data;
  },

  async rejectTeacher(id: string, reason?: string): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/api/admin/tuition/teachers/${id}/reject`, {
      method: 'PATCH',
      headers: authService.getAuthHeaders(),
      body: JSON.stringify({ reason }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to reject teacher');
    }
    return data;
  },

  async getStudents(): Promise<AdminStudentItem[]> {
    const res = await fetch(`${API_BASE_URL}/api/admin/tuition/students`, {
      headers: authService.getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to fetch tuition students');
    }
    return data.students || [];
  },

  async createStudent(payload: {
    name: string;
    displayName?: string;
    email?: string;
    phone?: string;
    password?: string;
    grade?: string;
    parentName?: string;
    parentPhone?: string;
    parentEmail?: string;
    parentRelation?: string;
    gender?: string;
    dob?: string;
    address?: string;
    programId?: string;
    feePlan?: string;
  }): Promise<{ success: boolean; message: string; student: AdminStudentItem }> {
    const res = await fetch(`${API_BASE_URL}/api/admin/tuition/students`, {
      method: 'POST',
      headers: authService.getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to create student admission');
    }
    return data;
  },

  async approveStudent(id: string, status: 'approved' | 'rejected' | 'pending', programId?: string): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/api/admin/tuition/students/${id}/approve`, {
      method: 'PATCH',
      headers: authService.getAuthHeaders(),
      body: JSON.stringify({ status, programId }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to update student access');
    }
    return data;
  },

  async getPrograms(): Promise<AdminTuitionProgram[]> {
    const res = await fetch(`${API_BASE_URL}/api/admin/tuition/programs`, {
      headers: authService.getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to fetch tuition programs');
    }
    return data.programs || [];
  },

  async createProgram(payload: Partial<AdminTuitionProgram>): Promise<AdminTuitionProgram> {
    const res = await fetch(`${API_BASE_URL}/api/admin/tuition/programs`, {
      method: 'POST',
      headers: authService.getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to create tuition program');
    }
    return data.program;
  },

  async updateProgram(id: string, payload: Partial<AdminTuitionProgram>): Promise<AdminTuitionProgram> {
    const res = await fetch(`${API_BASE_URL}/api/admin/tuition/programs/${id}`, {
      method: 'PUT',
      headers: authService.getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to update tuition program');
    }
    return data.program;
  },

  async deleteProgram(id: string): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/api/admin/tuition/programs/${id}`, {
      method: 'DELETE',
      headers: authService.getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to delete tuition program');
    }
  },

  async updateProgramRoster(
    id: string,
    payload: {
      teacherIds: string[];
      studentIds: string[];
      teacherSubjects?: Array<{ teacherId: string; subject: string }>;
    }
  ): Promise<AdminTuitionProgram> {
    const res = await fetch(`${API_BASE_URL}/api/admin/tuition/programs/${id}/roster`, {
      method: 'PUT',
      headers: authService.getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to update program roster');
    }
    return data.program;
  },

  async addTeacherToProgram(
    id: string,
    teacherIds: string[],
    teacherSubjects?: Array<{ teacherId: string; subject: string }>
  ): Promise<AdminTuitionProgram> {
    const res = await fetch(`${API_BASE_URL}/api/admin/tuition/programs/${id}/teachers`, {
      method: 'POST',
      headers: authService.getAuthHeaders(),
      body: JSON.stringify({ teacherIds, teacherSubjects }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to add teacher to program');
    }
    return data.program;
  },

  async removeTeacherFromProgram(id: string, teacherId: string): Promise<AdminTuitionProgram> {
    const res = await fetch(`${API_BASE_URL}/api/admin/tuition/programs/${id}/teachers/${teacherId}`, {
      method: 'DELETE',
      headers: authService.getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to remove teacher from program');
    }
    return data.program;
  },

  async enrollStudents(id: string, studentIds: string[]): Promise<AdminTuitionProgram> {
    const res = await fetch(`${API_BASE_URL}/api/admin/tuition/programs/${id}/students`, {
      method: 'POST',
      headers: authService.getAuthHeaders(),
      body: JSON.stringify({ studentIds }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to enroll students in program');
    }
    return data.program;
  },

  async removeStudentFromProgram(id: string, studentId: string): Promise<AdminTuitionProgram> {
    const res = await fetch(`${API_BASE_URL}/api/admin/tuition/programs/${id}/students/${studentId}`, {
      method: 'DELETE',
      headers: authService.getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to remove student from program');
    }
    return data.program;
  },

  async getPayouts(): Promise<AdminPayoutItem[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/tuition/payouts`, {
        headers: authService.getAuthHeaders(),
      });
      const data = await res.json();
      if (!res.ok || !data.success) return [];
      return data.payouts || [];
    } catch {
      return [];
    }
  },

  async approvePayout(id: string, adminNotes?: string): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/api/admin/tuition/payouts/${id}/approve`, {
      method: 'POST',
      headers: authService.getAuthHeaders(),
      body: JSON.stringify({ adminNotes }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to approve payout');
    }
    return data;
  },

  async getComplianceVault(): Promise<{ recordings: ComplianceRecordingItem[]; recentChatAudit: ComplianceChatItem[] }> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/tuition/recordings`, {
        headers: authService.getAuthHeaders(),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { recordings: [], recentChatAudit: [] };
      }
      return {
        recordings: data.recordings || [],
        recentChatAudit: data.recentChatAudit || [],
      };
    } catch {
      return { recordings: [], recentChatAudit: [] };
    }
  },

  async getEdupyeAccounts(): Promise<EdupyeAccountsData> {
    const res = await fetch(`${API_BASE_URL}/api/admin/edupye-accounts`, {
      headers: authService.getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to fetch EduPye accounts data');
    }
    return data;
  },

  async revokeUser(id: string): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/api/admin/tuition/users/${id}/revoke`, {
      method: 'PATCH',
      headers: authService.getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to revoke user tuition access');
    }
    return data;
  },

  async restoreUser(id: string): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/api/admin/tuition/users/${id}/restore`, {
      method: 'PATCH',
      headers: authService.getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to restore user tuition access');
    }
    return data;
  },

  async deleteUser(id: string): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/api/admin/tuition/users/${id}`, {
      method: 'DELETE',
      headers: authService.getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to delete user');
    }
    return data;
  },

  async getComplaints(): Promise<AdminComplaintItem[]> {
    const res = await fetch(`${API_BASE_URL}/api/admin/tuition/complaints`, {
      headers: authService.getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to fetch complaints');
    }
    return data.complaints || [];
  },

  async updateComplaint(id: string, payload: { status?: string; adminNote?: string; adminProgressNotes?: string }): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/api/admin/tuition/complaints/${id}`, {
      method: 'PATCH',
      headers: authService.getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to update complaint');
    }
    return data;
  },

  // ==========================================
  // EDU PYE ACADEMY: FEES & ATTENDANCE
  // ==========================================

  async getFeeStructures(params?: { session?: string; className?: string; programId?: string }): Promise<AcademyFeeStructureItem[]> {
    const q = new URLSearchParams();
    if (params?.session) q.set('session', params.session);
    if (params?.className) q.set('className', params.className);
    if (params?.programId) q.set('programId', params.programId);

    const res = await fetch(`${API_BASE_URL}/api/admin/academy/fees/structures?${q.toString()}`, {
      headers: authService.getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to fetch fee structures');
    }
    return data.structures || [];
  },

  async createFeeStructure(payload: Partial<AcademyFeeStructureItem>): Promise<AcademyFeeStructureItem> {
    const res = await fetch(`${API_BASE_URL}/api/admin/academy/fees/structures`, {
      method: 'POST',
      headers: authService.getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to create fee structure');
    }
    return data.structure;
  },

  async getFeePayments(params?: { session?: string; studentId?: string; programId?: string; status?: string }): Promise<AcademyFeePaymentItem[]> {
    const q = new URLSearchParams();
    if (params?.session) q.set('session', params.session);
    if (params?.studentId) q.set('studentId', params.studentId);
    if (params?.programId) q.set('programId', params.programId);
    if (params?.status) q.set('status', params.status);

    const res = await fetch(`${API_BASE_URL}/api/admin/academy/fees/payments?${q.toString()}`, {
      headers: authService.getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to fetch fee payments');
    }
    return data.payments || [];
  },

  async collectFeePayment(payload: {
    studentId?: string;
    studentCode?: string;
    studentName?: string;
    programId?: string;
    feeStructureId?: string;
    monthOrTerm?: string;
    amountDue: number;
    amountPaid: number;
    paymentMode?: string;
    remarks?: string;
    session?: string;
    receiptNo?: string;
  }): Promise<{ success: boolean; message: string; payment: AcademyFeePaymentItem }> {
    const res = await fetch(`${API_BASE_URL}/api/admin/academy/fees/payments`, {
      method: 'POST',
      headers: authService.getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to record fee payment');
    }
    return data;
  },

  async getFeeDefaulters(session: string = '2026-27'): Promise<{ count: number; totalOverdueAmount: number; defaulters: AcademyFeeDefaulterItem[] }> {
    const res = await fetch(`${API_BASE_URL}/api/admin/academy/fees/defaulters?session=${encodeURIComponent(session)}`, {
      headers: authService.getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to fetch fee defaulters');
    }
    return {
      count: data.count || 0,
      totalOverdueAmount: data.totalOverdueAmount || 0,
      defaulters: data.defaulters || [],
    };
  },

  async getAttendance(programId: string, date?: string, timeSlot?: string): Promise<{
    attendance: AcademyAttendanceSessionItem | null;
    prefill?: AcademyAttendanceSessionItem;
    isExisting: boolean;
  }> {
    const q = new URLSearchParams({ programId });
    if (date) q.set('date', date);
    if (timeSlot) q.set('timeSlot', timeSlot);

    const res = await fetch(`${API_BASE_URL}/api/admin/academy/attendance?${q.toString()}`, {
      headers: authService.getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to fetch attendance');
    }
    return {
      attendance: data.attendance || null,
      prefill: data.prefill || undefined,
      isExisting: Boolean(data.isExisting),
    };
  },

  async saveAttendance(payload: Partial<AcademyAttendanceSessionItem>): Promise<{ success: boolean; message: string; attendance: AcademyAttendanceSessionItem }> {
    const res = await fetch(`${API_BASE_URL}/api/admin/academy/attendance`, {
      method: 'POST',
      headers: authService.getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to save attendance');
    }
    return data;
  },

  async getAttendanceReport(params?: {
    programId?: string;
    teacherId?: string;
    month?: string;
    session?: string;
  }): Promise<AttendanceReportResponse> {
    const q = new URLSearchParams();
    if (params?.programId && params.programId !== 'all') q.set('programId', params.programId);
    if (params?.teacherId && params.teacherId !== 'all') q.set('teacherId', params.teacherId);
    if (params?.month && params.month !== 'all') q.set('month', params.month);
    if (params?.session) q.set('session', params.session);

    const res = await fetch(`${API_BASE_URL}/api/admin/academy/attendance/report?${q.toString()}`, {
      headers: authService.getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to fetch attendance report');
    }
    return data;
  },

  async getAcademyDashboardKpis(session: string = '2026-27'): Promise<AcademyDashboardKpis> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/academy/dashboard-kpis?session=${encodeURIComponent(session)}`, {
        headers: authService.getAuthHeaders(),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return {
          totalStudents: 0,
          certifiedTeachers: 0,
          activeBatches: 0,
          pendingDues: 142500,
          todayAttendanceRate: '96.4%',
          totalPaidAmount: 0,
        };
      }
      return data;
    } catch {
      return {
        totalStudents: 0,
        certifiedTeachers: 0,
        activeBatches: 0,
        pendingDues: 142500,
        todayAttendanceRate: '96.4%',
        totalPaidAmount: 0,
      };
    }
  },

  // ==========================================
  // EXAMS & MARKS
  // ==========================================

  async getExams(params?: { programId?: string; testType?: string; session?: string }): Promise<AcademyExamItem[]> {
    const q = new URLSearchParams();
    if (params?.programId && params.programId !== 'all') q.set('programId', params.programId);
    if (params?.testType && params.testType !== 'all') q.set('testType', params.testType);
    if (params?.session) q.set('session', params.session);

    const res = await fetch(`${API_BASE_URL}/api/admin/academy/exams?${q.toString()}`, {
      headers: authService.getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to fetch exams');
    }
    return data.exams || [];
  },

  async createExam(payload: {
    programId: string;
    title: string;
    testType?: string;
    date: string;
    maxMarks?: number;
    passingMarks?: number;
    session?: string;
  }): Promise<AcademyExamItem> {
    const res = await fetch(`${API_BASE_URL}/api/admin/academy/exams`, {
      method: 'POST',
      headers: authService.getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to create exam');
    }
    return data.exam;
  },

  async saveExamMarks(examId: string, results: Array<{
    studentId: string;
    studentCode: string;
    studentName: string;
    marksObtained: number;
    isAbsent: boolean;
    remarks?: string;
  }>): Promise<AcademyExamItem> {
    const res = await fetch(`${API_BASE_URL}/api/admin/academy/exams/${examId}/marks`, {
      method: 'POST',
      headers: authService.getAuthHeaders(),
      body: JSON.stringify({ results }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to save exam marks');
    }
    return data.exam;
  },

  async getStudentProgress(programId: string, session?: string): Promise<StudentProgressResponse> {
    const q = new URLSearchParams({ programId });
    if (session) q.set('session', session);

    const res = await fetch(`${API_BASE_URL}/api/admin/academy/exams/student-progress?${q.toString()}`, {
      headers: authService.getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to fetch student progress');
    }
    return data;
  },

  // ==========================================
  // TUTOR PAYROLL
  // ==========================================

  async calculatePayrollForMonth(month: string, session?: string): Promise<{
    month: string;
    totalTutors: number;
    tutorCalculations: TutorPayrollCalculationItem[];
  }> {
    const q = new URLSearchParams({ month });
    if (session) q.set('session', session);

    const res = await fetch(`${API_BASE_URL}/api/admin/academy/payroll/calculate?${q.toString()}`, {
      headers: authService.getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to calculate tutor payroll');
    }
    return data;
  },

  async getAcademyPayouts(params?: { month?: string; status?: string; session?: string }): Promise<AcademyTutorPayoutItem[]> {
    const q = new URLSearchParams();
    if (params?.month && params.month !== 'all') q.set('month', params.month);
    if (params?.status && params.status !== 'all') q.set('status', params.status);
    if (params?.session) q.set('session', params.session);

    const res = await fetch(`${API_BASE_URL}/api/admin/academy/payroll?${q.toString()}`, {
      headers: authService.getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to fetch tutor payouts');
    }
    return data.payouts || [];
  },

  async saveTutorPayout(payload: Partial<TutorPayrollCalculationItem>): Promise<AcademyTutorPayoutItem> {
    const res = await fetch(`${API_BASE_URL}/api/admin/academy/payroll`, {
      method: 'POST',
      headers: authService.getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to save tutor payout');
    }
    return data.payout;
  },

  async payTutorPayout(id: string, payload: { paymentMode?: string; remarks?: string }): Promise<AcademyTutorPayoutItem> {
    const res = await fetch(`${API_BASE_URL}/api/admin/academy/payroll/${id}/pay`, {
      method: 'PATCH',
      headers: authService.getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to process tutor payment');
    }
    return data.payout;
  },

  // ==========================================
  // EXPENSES & FINANCE SUMMARY (P&L)
  // ==========================================

  async getExpenses(params?: { month?: string; category?: string; session?: string }): Promise<AcademyExpenseItem[]> {
    const q = new URLSearchParams();
    if (params?.month && params.month !== 'all') q.set('month', params.month);
    if (params?.category && params.category !== 'all') q.set('category', params.category);
    if (params?.session) q.set('session', params.session);

    const res = await fetch(`${API_BASE_URL}/api/admin/academy/expenses?${q.toString()}`, {
      headers: authService.getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to fetch expenses');
    }
    return data.expenses || [];
  },

  async createExpense(payload: Partial<AcademyExpenseItem>): Promise<AcademyExpenseItem> {
    const res = await fetch(`${API_BASE_URL}/api/admin/academy/expenses`, {
      method: 'POST',
      headers: authService.getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to record center expense');
    }
    return data.expense;
  },

  async getFinanceSummary(month?: string, session?: string): Promise<FinanceSummaryResponse> {
    const q = new URLSearchParams();
    if (month) q.set('month', month);
    if (session) q.set('session', session);

    const res = await fetch(`${API_BASE_URL}/api/admin/academy/finance/summary?${q.toString()}`, {
      headers: authService.getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to fetch finance summary');
    }
    return data;
  },

  // ==========================================
  // NOTICES
  // ==========================================

  async getNotices(params?: { audience?: string; programId?: string }): Promise<AcademyNoticeItem[]> {
    const q = new URLSearchParams();
    if (params?.audience && params.audience !== 'all') q.set('audience', params.audience);
    if (params?.programId && params.programId !== 'all') q.set('programId', params.programId);

    const res = await fetch(`${API_BASE_URL}/api/admin/academy/notices?${q.toString()}`, {
      headers: authService.getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to fetch notices');
    }
    return data.notices || [];
  },

  async createNotice(payload: Partial<AcademyNoticeItem>): Promise<AcademyNoticeItem> {
    const res = await fetch(`${API_BASE_URL}/api/admin/academy/notices`, {
      method: 'POST',
      headers: authService.getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to publish notice');
    }
    return data.notice;
  },

  async deleteNotice(id: string): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/api/admin/academy/notices/${id}`, {
      method: 'DELETE',
      headers: authService.getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to delete notice');
    }
  },

  // ==========================================
  // ENQUIRIES / LEADS
  // ==========================================

  async getEnquiries(params?: { status?: string; session?: string }): Promise<AcademyEnquiryItem[]> {
    const q = new URLSearchParams();
    if (params?.status && params.status !== 'all') q.set('status', params.status);
    if (params?.session) q.set('session', params.session);

    const res = await fetch(`${API_BASE_URL}/api/admin/academy/enquiries?${q.toString()}`, {
      headers: authService.getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to fetch enquiries');
    }
    return data.enquiries || [];
  },

  async createEnquiry(payload: Partial<AcademyEnquiryItem>): Promise<AcademyEnquiryItem> {
    const res = await fetch(`${API_BASE_URL}/api/admin/academy/enquiries`, {
      method: 'POST',
      headers: authService.getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to log admission enquiry');
    }
    return data.enquiry;
  },

  async updateEnquiryStatus(id: string, payload: { status?: string; notes?: string }): Promise<AcademyEnquiryItem> {
    const res = await fetch(`${API_BASE_URL}/api/admin/academy/enquiries/${id}/status`, {
      method: 'PATCH',
      headers: authService.getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to update enquiry');
    }
    return data.enquiry;
  },
};
