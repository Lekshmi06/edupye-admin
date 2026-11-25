import React, { useState } from 'react';
import type { AcademyViewId } from '../types';
import { useToast } from '../../../hooks/useToast';

interface AcademyStarterViewProps {
  viewId: AcademyViewId;
  academicSession: string;
  onOpenQuickFee?: () => void;
  onNavigateView?: (view: AcademyViewId) => void;
}

interface StarterConfig {
  title: string;
  category: string;
  icon: string;
  subtitle: string;
  kpiCards: Array<{ label: string; value: string; color: string; icon: string }>;
  columns: string[];
  sampleRows: Array<Record<string, string>>;
  primaryActionLabel: string;
}

const STARTER_CONFIGS: Partial<Record<AcademyViewId, StarterConfig>> = {
  'students-enquiry': {
    title: 'Admission Enquiries',
    category: 'STUDENTS',
    icon: 'fa-user-clock',
    subtitle: 'Prospective student walk-ins, phone enquiries, and lead conversion pipeline.',
    kpiCards: [
      { label: 'Total Enquiries', value: '48', color: '#2563EB', icon: 'fa-user-friends' },
      { label: 'Follow-ups Due Today', value: '7', color: '#F59E0B', icon: 'fa-phone-volume' },
      { label: 'Conversion Rate', value: '62.5%', color: '#10B981', icon: 'fa-chart-line' },
    ],
    columns: ['ENQUIRY NO', 'CANDIDATE NAME', 'GRADE APPLIED', 'PARENT CONTACT', 'ENQUIRY DATE', 'STATUS'],
    sampleRows: [
      { 'ENQUIRY NO': 'ENQ-2026-081', 'CANDIDATE NAME': 'Aarav Patel', 'GRADE APPLIED': 'Class 12 (PCM)', 'PARENT CONTACT': 'Kiran Patel (+91 9820011223)', 'ENQUIRY DATE': '2026-11-20', STATUS: 'Follow-up Scheduled' },
      { 'ENQUIRY NO': 'ENQ-2026-082', 'CANDIDATE NAME': 'Sneha Rao', 'GRADE APPLIED': 'Class 11 (PCB)', 'PARENT CONTACT': 'Venkatesh Rao (+91 9840033445)', 'ENQUIRY DATE': '2026-11-22', STATUS: 'Trial Class Attended' },
      { 'ENQUIRY NO': 'ENQ-2026-083', 'CANDIDATE NAME': 'Ishaan Verma', 'GRADE APPLIED': 'Class 10 (Foundations)', 'PARENT CONTACT': 'Deepak Verma (+91 9811122334)', 'ENQUIRY DATE': '2026-11-23', STATUS: 'Ready for Admission' },
    ],
    primaryActionLabel: '+ Log New Enquiry',
  },
  'students-archive': {
    title: 'Passed Out Archive',
    category: 'STUDENTS',
    icon: 'fa-user-graduate',
    subtitle: 'Historical alumni database, graduation records, and completion certificates.',
    kpiCards: [
      { label: 'Total Alumni', value: '342', color: '#4338CA', icon: 'fa-graduation-cap' },
      { label: 'Top Tier Selections', value: '89', color: '#10B981', icon: 'fa-award' },
      { label: 'Average Score', value: '94.2%', color: '#2563EB', icon: 'fa-percent' },
    ],
    columns: ['ID NUMBER', 'STUDENT NAME', 'SESSION COMPLETED', 'PERCENTILE / RANK', 'DESTINATION UNIVERSITY', 'CERTIFICATE'],
    sampleRows: [
      { 'ID NUMBER': 'STU-2025-012', 'STUDENT NAME': 'Ananya Sengupta', 'SESSION COMPLETED': '2025-26', 'PERCENTILE / RANK': '99.2% (JEE Adv 412)', 'DESTINATION UNIVERSITY': 'IIT Bombay (CSE)', CERTIFICATE: 'Issued (PDF)' },
      { 'ID NUMBER': 'STU-2025-045', 'STUDENT NAME': 'Rohan Nair', 'SESSION COMPLETED': '2025-26', 'PERCENTILE / RANK': '98.8% (NEET 685)', 'DESTINATION UNIVERSITY': 'AIIMS New Delhi', CERTIFICATE: 'Issued (PDF)' },
    ],
    primaryActionLabel: 'Export Alumni Register',
  },
  'students-promotion': {
    title: 'Batch Promotion Manager',
    category: 'STUDENTS',
    icon: 'fa-level-up-alt',
    subtitle: 'Advance active cohorts to subsequent academic classes for Session 2026-27.',
    kpiCards: [
      { label: 'Eligible for Promotion', value: '124', color: '#10B981', icon: 'fa-user-check' },
      { label: 'Under Review', value: '6', color: '#F59E0B', icon: 'fa-hourglass-half' },
      { label: 'Promoted Batches', value: '4 / 6', color: '#2563EB', icon: 'fa-layer-group' },
    ],
    columns: ['CURRENT CLASS', 'TOTAL STUDENTS', 'TARGET PROMOTION CLASS', 'STATUS', 'ACTION'],
    sampleRows: [
      { 'CURRENT CLASS': 'Class 11 Science (Batch A)', 'TOTAL STUDENTS': '32', 'TARGET PROMOTION CLASS': 'Class 12 Science (Batch A)', STATUS: 'Ready for Roll-over', ACTION: 'Execute Batch Roll-over' },
      { 'CURRENT CLASS': 'Class 11 Science (Batch B)', 'TOTAL STUDENTS': '28', 'TARGET PROMOTION CLASS': 'Class 12 Science (Batch B)', STATUS: 'Ready for Roll-over', ACTION: 'Execute Batch Roll-over' },
      { 'CURRENT CLASS': 'Class 10 Foundations', 'TOTAL STUDENTS': '35', 'TARGET PROMOTION CLASS': 'Class 11 Science Stream', STATUS: 'Stream Counseling Required', ACTION: 'Review Counseling' },
    ],
    primaryActionLabel: 'Execute Cohort Promotion',
  },
  'students-session-report': {
    title: 'Session Reports',
    category: 'STUDENTS',
    icon: 'fa-file-alt',
    subtitle: 'Academic session analytics, gender ratio, enrollment velocity, and attrition logs.',
    kpiCards: [
      { label: 'Annual Enrollments', value: '184', color: '#2563EB', icon: 'fa-id-card' },
      { label: 'Retention Rate', value: '98.1%', color: '#10B981', icon: 'fa-shield-alt' },
      { label: 'Avg Batch Size', value: '26', color: '#6366F1', icon: 'fa-users' },
    ],
    columns: ['BATCH / STREAM', 'OPENING ENROLLMENT', 'NEW ADMISSIONS', 'ATTRITION', 'CLOSING ROSTER', 'RETENTION'],
    sampleRows: [
      { 'BATCH / STREAM': 'Class 12 Advanced Physics', 'OPENING ENROLLMENT': '28', 'NEW ADMISSIONS': '+6', ATTRITION: '0', 'CLOSING ROSTER': '34', RETENTION: '100%' },
      { 'BATCH / STREAM': 'Class 12 Mathematics Mastery', 'OPENING ENROLLMENT': '25', 'NEW ADMISSIONS': '+5', ATTRITION: '-1', 'CLOSING ROSTER': '29', RETENTION: '96.2%' },
    ],
    primaryActionLabel: 'Download Full Session PDF',
  },
  'fees-structure': {
    title: 'Fee Structure & Tiers',
    category: 'FEES',
    icon: 'fa-file-invoice-dollar',
    subtitle: 'Tuition fees schedule, installment rules, laboratory charges, and discounts.',
    kpiCards: [
      { label: 'Active Fee Plans', value: '4 Plans', color: '#2563EB', icon: 'fa-tags' },
      { label: 'Standard Monthly', value: '₹2,500', color: '#10B981', icon: 'fa-calendar-alt' },
      { label: 'Annual Package', value: '₹24,000', color: '#6366F1', icon: 'fa-money-bill-wave' },
    ],
    columns: ['PLAN NAME', 'APPLICABLE CLASSES', 'FREQUENCY', 'TUITION FEE', 'MATERIAL FEE', 'STATUS'],
    sampleRows: [
      { 'PLAN NAME': 'Monthly Standard Plan', 'APPLICABLE CLASSES': 'Class 9 – Class 12', FREQUENCY: 'Monthly', 'TUITION FEE': '₹2,500 / month', 'MATERIAL FEE': '₹500 / yr', STATUS: 'Active' },
      { 'PLAN NAME': 'Quarterly Package', 'APPLICABLE CLASSES': 'Class 11 & Class 12', FREQUENCY: 'Every 3 Months', 'TUITION FEE': '₹7,000 / quarter', 'MATERIAL FEE': 'Included', STATUS: 'Active' },
      { 'PLAN NAME': 'Annual Comprehensive', 'APPLICABLE CLASSES': 'All Batches', FREQUENCY: 'Annual One-time', 'TUITION FEE': '₹24,000 / year', 'MATERIAL FEE': 'Included + Free Kits', STATUS: 'Active (Recommended)' },
    ],
    primaryActionLabel: '+ Add Fee Tier',
  },
  'fees-collection': {
    title: 'Fee Collection Register',
    category: 'FEES',
    icon: 'fa-receipt',
    subtitle: 'Real-time tuition fee invoices, payment receipts, and collection audit trails.',
    kpiCards: [
      { label: 'Collected This Month', value: '₹3,45,000', color: '#10B981', icon: 'fa-check-circle' },
      { label: 'Pending Dues', value: '₹1,42,500', color: '#E11D48', icon: 'fa-clock' },
      { label: 'Digital Collection Rate', value: '94%', color: '#2563EB', icon: 'fa-qrcode' },
    ],
    columns: ['RECEIPT NO', 'STUDENT NAME', 'CLASS / BATCH', 'HEAD', 'AMOUNT', 'MODE', 'DATE'],
    sampleRows: [
      { 'RECEIPT NO': 'RCP-981240', 'STUDENT NAME': 'Aditi Sundaram', 'CLASS / BATCH': 'Class 12 - Physics', HEAD: 'Monthly Tuition', AMOUNT: '₹2,500', MODE: 'UPI (PhonePe)', DATE: '2026-11-23' },
      { 'RECEIPT NO': 'RCP-981241', 'STUDENT NAME': 'Manish Kulkarni', 'CLASS / BATCH': 'Class 12 - Math', HEAD: 'Quarterly Package', AMOUNT: '₹7,000', MODE: 'Netbanking', DATE: '2026-11-22' },
      { 'RECEIPT NO': 'RCP-981242', 'STUDENT NAME': 'Zoya Khan', 'CLASS / BATCH': 'Class 11 - Chem', HEAD: 'Monthly Tuition', AMOUNT: '₹2,500', MODE: 'Cash Deposit', DATE: '2026-11-21' },
    ],
    primaryActionLabel: 'Collect Fee',
  },
  'fees-quick-collect': {
    title: 'Quick Fee Collect',
    category: 'FEES',
    icon: 'fa-bolt',
    subtitle: 'Counter fast collection: Search student ID, enter amount, and generate instant invoice slip.',
    kpiCards: [
      { label: 'Counter Collections', value: '24 Today', color: '#2563EB', icon: 'fa-cash-register' },
      { label: 'Average Transaction', value: '₹2,500', color: '#10B981', icon: 'fa-receipt' },
      { label: 'Receipts Issued', value: '184', color: '#6366F1', icon: 'fa-file-invoice' },
    ],
    columns: ['TRANSACTION ID', 'STUDENT', 'AMOUNT', 'PAYMENT MODE', 'COLLECTED BY', 'TIMESTAMP'],
    sampleRows: [
      { 'TRANSACTION ID': 'TXN-QC-001', STUDENT: 'Tanya Mehra (STU-T1A2)', AMOUNT: '₹2,500', 'PAYMENT MODE': 'UPI QR', 'COLLECTED BY': 'Accounts Desk', TIMESTAMP: 'Today 10:45 AM' },
      { 'TRANSACTION ID': 'TXN-QC-002', STUDENT: 'Kunal Joshi (STU-K3B4)', AMOUNT: '₹5,000', 'PAYMENT MODE': 'Debit Card', 'COLLECTED BY': 'Accounts Desk', TIMESTAMP: 'Today 11:20 AM' },
    ],
    primaryActionLabel: 'Open Quick Collect Dialog',
  },
  'fees-defaulters': {
    title: 'Fee Defaulter Log',
    category: 'FEES',
    icon: 'fa-exclamation-triangle',
    subtitle: 'Overdue accounts tracker, payment delay reminders, and parent SMS alerts.',
    kpiCards: [
      { label: 'Total Defaulters', value: '18 Students', color: '#E11D48', icon: 'fa-user-times' },
      { label: 'Total Overdue', value: '₹1,42,500', color: '#E11D48', icon: 'fa-money-bill' },
      { label: 'Average Days Due', value: '14 Days', color: '#F59E0B', icon: 'fa-hourglass-end' },
    ],
    columns: ['STUDENT ID', 'STUDENT NAME', 'CLASS', 'PARENT CONTACT', 'OVERDUE AMOUNT', 'DAYS OVERDUE', 'ACTION'],
    sampleRows: [
      { 'STUDENT ID': 'STU-9182', 'STUDENT NAME': 'Siddharth Rao', CLASS: 'Class 12', 'PARENT CONTACT': 'Venkat Rao (+91 9840011223)', 'OVERDUE AMOUNT': '₹5,000', 'DAYS OVERDUE': '18 Days', ACTION: 'Send WhatsApp Reminder' },
      { 'STUDENT ID': 'STU-7421', 'STUDENT NAME': 'Priya Das', CLASS: 'Class 11', 'PARENT CONTACT': 'Mihir Das (+91 9831122334)', 'OVERDUE AMOUNT': '₹2,500', 'DAYS OVERDUE': '12 Days', ACTION: 'Send WhatsApp Reminder' },
    ],
    primaryActionLabel: 'Broadcast Due Reminders',
  },
  'academics-attendance': {
    title: 'Class Attendance Register',
    category: 'ACADEMICS',
    icon: 'fa-calendar-check',
    subtitle: 'Batch-wise daily attendance marking, QR/PiP sync, and absence SMS triggers.',
    kpiCards: [
      { label: "Today's Present Rate", value: '96.4%', color: '#10B981', icon: 'fa-user-check' },
      { label: 'Absent Today', value: '5 Students', color: '#E11D48', icon: 'fa-user-times' },
      { label: 'Batches Marked', value: '8 / 8 Batches', color: '#2563EB', icon: 'fa-check-double' },
    ],
    columns: ['BATCH / CLASS', 'SUBJECT', 'TEACHER', 'TOTAL STUDENTS', 'PRESENT', 'ABSENT', 'STATUS'],
    sampleRows: [
      { 'BATCH / CLASS': 'Class 12 Advanced Batch', SUBJECT: 'Physics', TEACHER: 'Dr. Vikram Seth', 'TOTAL STUDENTS': '32', PRESENT: '31', ABSENT: '1', STATUS: 'Submitted' },
      { 'BATCH / CLASS': 'Class 12 Calculus & Vectors', SUBJECT: 'Mathematics', TEACHER: 'Prof. Alok Ray', 'TOTAL STUDENTS': '28', PRESENT: '27', ABSENT: '1', STATUS: 'Submitted' },
      { 'BATCH / CLASS': 'Class 11 Organic Mastery', SUBJECT: 'Chemistry', TEACHER: 'Ms. Neha Kapoor', 'TOTAL STUDENTS': '26', PRESENT: '25', ABSENT: '1', STATUS: 'Submitted' },
    ],
    primaryActionLabel: 'Mark Attendance Now',
  },
  'academics-attendance-report': {
    title: 'Attendance Reports & Heatmap',
    category: 'ACADEMICS',
    icon: 'fa-clipboard-list',
    subtitle: 'Monthly attendance breakdown, student consistency records, and threshold alarms.',
    kpiCards: [
      { label: 'Monthly Average', value: '95.8%', color: '#10B981', icon: 'fa-chart-area' },
      { label: '100% Attendance Club', value: '42 Students', color: '#2563EB', icon: 'fa-medal' },
      { label: 'Below 75% Warning', value: '2 Students', color: '#E11D48', icon: 'fa-exclamation-circle' },
    ],
    columns: ['STUDENT ID', 'STUDENT NAME', 'CLASS', 'TOTAL CLASSES', 'ATTENDED', 'PERCENTAGE', 'RISK TIER'],
    sampleRows: [
      { 'STUDENT ID': 'STU-1029', 'STUDENT NAME': 'Ananya Sengupta', CLASS: 'Class 12', 'TOTAL CLASSES': '48', ATTENDED: '48', PERCENTAGE: '100%', 'RISK TIER': 'Excellent' },
      { 'STUDENT ID': 'STU-1030', 'STUDENT NAME': 'Rohan Nair', CLASS: 'Class 12', 'TOTAL CLASSES': '48', ATTENDED: '47', PERCENTAGE: '97.9%', 'RISK TIER': 'Excellent' },
      { 'STUDENT ID': 'STU-1088', 'STUDENT NAME': 'Sameer Khan', CLASS: 'Class 11', 'TOTAL CLASSES': '48', ATTENDED: '34', PERCENTAGE: '70.8%', 'RISK TIER': 'Warning (Below 75%)' },
    ],
    primaryActionLabel: 'Export Attendance Sheet',
  },
  'academics-exams': {
    title: 'Exams & Mock Tests',
    category: 'ACADEMICS',
    icon: 'fa-pen-fancy',
    subtitle: 'Weekly MCQ practice tests, term examinations, and centralized answer sheets.',
    kpiCards: [
      { label: 'Exams Scheduled', value: '6 Tests', color: '#2563EB', icon: 'fa-clock' },
      { label: 'Completed Tests', value: '28', color: '#10B981', icon: 'fa-check' },
      { label: 'Question Bank', value: '1,450 Qs', color: '#6366F1', icon: 'fa-database' },
    ],
    columns: ['EXAM CODE', 'EXAM TITLE', 'SUBJECT', 'CLASS', 'DATE & TIME', 'MAX MARKS', 'STATUS'],
    sampleRows: [
      { 'EXAM CODE': 'EXM-PHY-04', 'EXAM TITLE': 'Electromagnetism Board Mock', SUBJECT: 'Physics', CLASS: 'Class 12', 'DATE & TIME': '2026-11-28 10:00 AM', 'MAX MARKS': '70', STATUS: 'Scheduled' },
      { 'EXAM CODE': 'EXM-MTH-05', 'EXAM TITLE': 'Calculus & Integration Blitz', SUBJECT: 'Mathematics', CLASS: 'Class 12', 'DATE & TIME': '2026-12-02 02:00 PM', 'MAX MARKS': '80', STATUS: 'Scheduled' },
    ],
    primaryActionLabel: '+ Schedule New Exam',
  },
  'academics-marks-entry': {
    title: 'Marks Entry Studio',
    category: 'ACADEMICS',
    icon: 'fa-edit',
    subtitle: 'Score input portal, auto-grading calculations, and report card generation.',
    kpiCards: [
      { label: 'Awaiting Marks Entry', value: '1 Exam', color: '#F59E0B', icon: 'fa-edit' },
      { label: 'Scored This Term', value: '124 Papers', color: '#10B981', icon: 'fa-file-signature' },
      { label: 'Batch Average', value: '84.6%', color: '#2563EB', icon: 'fa-chart-pie' },
    ],
    columns: ['EXAM CODE', 'TITLE', 'BATCH', 'TEACHER IN-CHARGE', 'PAPERS EVALUATED', 'STATUS'],
    sampleRows: [
      { 'EXAM CODE': 'EXM-CHM-03', TITLE: 'Thermodynamics Mid-Term', BATCH: 'Class 12 Chemistry', 'TEACHER IN-CHARGE': 'Ms. Neha Kapoor', 'PAPERS EVALUATED': '32 / 32 (100%)', STATUS: 'Published' },
      { 'EXAM CODE': 'EXM-PHY-03', TITLE: 'Optics & Wave Motion Test', BATCH: 'Class 12 Physics', 'TEACHER IN-CHARGE': 'Dr. Vikram Seth', 'PAPERS EVALUATED': '31 / 32 (96%)', STATUS: 'In Progress' },
    ],
    primaryActionLabel: 'Open Marks Entry Sheet',
  },
  'academics-class-result': {
    title: 'Class Results & Performance Analytics',
    category: 'ACADEMICS',
    icon: 'fa-award',
    subtitle: 'Rank lists, percentile distributions, top scorers, and progress cards.',
    kpiCards: [
      { label: 'Top Rank Score', value: '98.5%', color: '#10B981', icon: 'fa-trophy' },
      { label: 'Pass Percentage', value: '100%', color: '#2563EB', icon: 'fa-star' },
      { label: 'Distinction Rate', value: '78.2%', color: '#6366F1', icon: 'fa-medal' },
    ],
    columns: ['RANK', 'STUDENT NAME', 'CLASS / BATCH', 'TOTAL MARKS', 'PERCENTAGE', 'GRADE', 'PROGRESSION'],
    sampleRows: [
      { RANK: '#1', 'STUDENT NAME': 'Ananya Sengupta', 'CLASS / BATCH': 'Class 12 Science', 'TOTAL MARKS': '295 / 300', PERCENTAGE: '98.3%', GRADE: 'A+ (Distinction)', PROGRESSION: '+1.5% ↑' },
      { RANK: '#2', 'STUDENT NAME': 'Rohan Nair', 'CLASS / BATCH': 'Class 12 Science', 'TOTAL MARKS': '291 / 300', PERCENTAGE: '97.0%', GRADE: 'A+ (Distinction)', PROGRESSION: '+2.0% ↑' },
      { RANK: '#3', 'STUDENT NAME': 'Sneha Rao', 'CLASS / BATCH': 'Class 12 Science', 'TOTAL MARKS': '287 / 300', PERCENTAGE: '95.6%', GRADE: 'A+ (Distinction)', PROGRESSION: '+0.8% ↑' },
    ],
    primaryActionLabel: 'Generate Report Cards',
  },
  'academics-subjects': {
    title: 'Subjects & Curriculum',
    category: 'ACADEMICS',
    icon: 'fa-book-open',
    subtitle: 'Configured course subjects, syllabus outlines, and textbook alignments.',
    kpiCards: [
      { label: 'Active Subjects', value: '8 Subjects', color: '#2563EB', icon: 'fa-book' },
      { label: 'Total Chapters', value: '96 Chapters', color: '#10B981', icon: 'fa-bookmark' },
      { label: 'Live Faculty Mappings', value: '14 Mappings', color: '#6366F1', icon: 'fa-chalkboard-teacher' },
    ],
    columns: ['SUBJECT CODE', 'SUBJECT NAME', 'STREAMS', 'TOTAL CHAPTERS', 'FACULTY LEAD', 'STATUS'],
    sampleRows: [
      { 'SUBJECT CODE': 'SUB-PHY', 'SUBJECT NAME': 'Physics (Advanced & Board)', STREAMS: 'Science (PCM / PCB)', 'TOTAL CHAPTERS': '14 Chapters', 'FACULTY LEAD': 'Dr. Vikram Seth', STATUS: 'Active' },
      { 'SUBJECT CODE': 'SUB-CHM', 'SUBJECT NAME': 'Chemistry (Organic & Physical)', STREAMS: 'Science (PCM / PCB)', 'TOTAL CHAPTERS': '16 Chapters', 'FACULTY LEAD': 'Ms. Neha Kapoor', STATUS: 'Active' },
      { 'SUBJECT CODE': 'SUB-MTH', 'SUBJECT NAME': 'Mathematics (Calculus & Algebra)', STREAMS: 'Science (PCM)', 'TOTAL CHAPTERS': '13 Chapters', 'FACULTY LEAD': 'Prof. Alok Ray', STATUS: 'Active' },
      { 'SUBJECT CODE': 'SUB-BIO', 'SUBJECT NAME': 'Biology (Botany & Zoology)', STREAMS: 'Science (PCB)', 'TOTAL CHAPTERS': '16 Chapters', 'FACULTY LEAD': 'Dr. Shweta Joshi', STATUS: 'Active' },
    ],
    primaryActionLabel: '+ Add Subject',
  },
  'academics-exam-schedule': {
    title: 'Exam Schedule & Timetable',
    category: 'ACADEMICS',
    icon: 'fa-clock',
    subtitle: 'Semester assessment dates, hall ticket generators, and room invigilation rosters.',
    kpiCards: [
      { label: 'Upcoming Exam Days', value: '5 Days', color: '#2563EB', icon: 'fa-calendar-day' },
      { label: 'Students Writing', value: '94 Students', color: '#10B981', icon: 'fa-user-edit' },
      { label: 'Invigilation Shifts', value: '12 Shifts', color: '#6366F1', icon: 'fa-clipboard-check' },
    ],
    columns: ['DATE', 'TIMING', 'EXAM NAME', 'SUBJECT', 'CLASS', 'INVIGILATOR'],
    sampleRows: [
      { DATE: '2026-11-28', TIMING: '10:00 AM – 01:00 PM', 'EXAM NAME': 'Board Preparation Mock 1', SUBJECT: 'Physics', CLASS: 'Class 12', INVIGILATOR: 'Dr. Vikram Seth' },
      { DATE: '2026-11-30', TIMING: '10:00 AM – 01:00 PM', 'EXAM NAME': 'Board Preparation Mock 1', SUBJECT: 'Chemistry', CLASS: 'Class 12', INVIGILATOR: 'Ms. Neha Kapoor' },
    ],
    primaryActionLabel: 'Publish Timetable',
  },
  'finance-expenses': {
    title: 'Academy Expenses Log',
    category: 'FINANCE',
    icon: 'fa-wallet',
    subtitle: 'Operating overheads, facility rent, lab apparatus, software tools, and utilities.',
    kpiCards: [
      { label: 'Monthly Expenses', value: '₹84,200', color: '#E11D48', icon: 'fa-file-invoice-dollar' },
      { label: 'Faculty Honorarium', value: '₹1,20,000', color: '#2563EB', icon: 'fa-user-tie' },
      { label: 'Net Surplus Margin', value: '+42.5%', color: '#10B981', icon: 'fa-chart-line' },
    ],
    columns: ['EXPENSE ID', 'CATEGORY', 'DESCRIPTION', 'AMOUNT', 'PAYMENT MODE', 'DATE', 'RECEIPT'],
    sampleRows: [
      { 'EXPENSE ID': 'EXP-2026-104', CATEGORY: 'Teaching Material', DESCRIPTION: 'Physics Lab Apparatus & Optics Kits', AMOUNT: '₹18,500', 'PAYMENT MODE': 'Corporate Card', DATE: '2026-11-18', RECEIPT: 'Attached' },
      { 'EXPENSE ID': 'EXP-2026-105', CATEGORY: 'Software License', DESCRIPTION: 'Live Streaming & Zoom Enterprise', AMOUNT: '₹12,400', 'PAYMENT MODE': 'Direct Debit', DATE: '2026-11-15', RECEIPT: 'Attached' },
    ],
    primaryActionLabel: '+ Record Expense',
  },
  'finance-reports': {
    title: 'Financial Audit & Reports',
    category: 'FINANCE',
    icon: 'fa-chart-pie',
    subtitle: 'General balance sheets, fee recovery ratios, batch profitability, and tax logs.',
    kpiCards: [
      { label: 'Gross Revenue', value: '₹4,87,500', color: '#10B981', icon: 'fa-rupee-sign' },
      { label: 'Operational Cost', value: '₹2,04,200', color: '#E11D48', icon: 'fa-receipt' },
      { label: 'Net Profit', value: '₹2,83,300', color: '#2563EB', icon: 'fa-wallet' },
    ],
    columns: ['REPORT NAME', 'PERIOD COVERED', 'GENERATED ON', 'TOTAL VALUATION', 'FORMAT', 'DOWNLOAD'],
    sampleRows: [
      { 'REPORT NAME': 'Monthly Academy Revenue Statement', 'PERIOD COVERED': 'November 2026', 'GENERATED ON': '2026-11-23', 'TOTAL VALUATION': '₹4,87,500', FORMAT: 'PDF / Excel', DOWNLOAD: 'Download' },
      { 'REPORT NAME': 'Faculty Payout & Honorarium Audit', 'PERIOD COVERED': 'October 2026', 'GENERATED ON': '2026-11-01', 'TOTAL VALUATION': '₹1,20,000', FORMAT: 'PDF', DOWNLOAD: 'Download' },
    ],
    primaryActionLabel: 'Generate Custom Audit Report',
  },
  'finance-income-expense': {
    title: 'Income vs Expense Analytics',
    category: 'FINANCE',
    icon: 'fa-balance-scale',
    subtitle: 'Month-over-month cash flow comparison and institutional financial health metrics.',
    kpiCards: [
      { label: 'Total Inflow (YTD)', value: '₹28,50,000', color: '#10B981', icon: 'fa-arrow-down' },
      { label: 'Total Outflow (YTD)', value: '₹14,20,000', color: '#E11D48', icon: 'fa-arrow-up' },
      { label: 'Operating Reserve', value: '₹14,30,000', color: '#2563EB', icon: 'fa-vault' },
    ],
    columns: ['MONTH', 'INCOME (COLLECTIONS)', 'EXPENSES (OVERHEADS)', 'FACULTY PAYOUTS', 'NET SURPLUS', 'MARGIN %'],
    sampleRows: [
      { MONTH: 'November 2026 (MTD)', 'INCOME (COLLECTIONS)': '₹4,87,500', 'EXPENSES (OVERHEADS)': '₹84,200', 'FACULTY PAYOUTS': '₹1,20,000', 'NET SURPLUS': '₹2,83,300', 'MARGIN %': '58.1%' },
      { MONTH: 'October 2026', 'INCOME (COLLECTIONS)': '₹4,60,000', 'EXPENSES (OVERHEADS)': '₹78,000', 'FACULTY PAYOUTS': '₹1,20,000', 'NET SURPLUS': '₹2,62,000', 'MARGIN %': '56.9%' },
    ],
    primaryActionLabel: 'Export Reconciliation Sheet',
  },
  'payroll-salary': {
    title: 'Faculty Salary Management',
    category: 'STAFF / PAYROLL',
    icon: 'fa-money-check-alt',
    subtitle: 'Honorarium calculation per class hour, incentive allowances, and payslip generation.',
    kpiCards: [
      { label: 'Monthly Payroll', value: '₹1,20,000', color: '#2563EB', icon: 'fa-coins' },
      { label: 'Disbursed', value: '₹1,20,000', color: '#10B981', icon: 'fa-check' },
      { label: 'Total Teaching Hours', value: '184 Hours', color: '#6366F1', icon: 'fa-clock' },
    ],
    columns: ['TCH CODE', 'FACULTY NAME', 'SUBJECT', 'TEACHING HOURS', 'HOURLY RATE', 'NET PAYABLE', 'STATUS'],
    sampleRows: [
      { 'TCH CODE': 'TCH-9812', 'FACULTY NAME': 'Dr. Vikram Seth', SUBJECT: 'Physics', 'TEACHING HOURS': '48 hrs', 'HOURLY RATE': '₹1,000 / hr', 'NET PAYABLE': '₹48,000', STATUS: 'Disbursed' },
      { 'TCH CODE': 'TCH-9815', 'FACULTY NAME': 'Prof. Alok Ray', SUBJECT: 'Mathematics', 'TEACHING HOURS': '40 hrs', 'HOURLY RATE': '₹1,000 / hr', 'NET PAYABLE': '₹40,000', STATUS: 'Disbursed' },
      { 'TCH CODE': 'TCH-9820', 'FACULTY NAME': 'Ms. Neha Kapoor', SUBJECT: 'Chemistry', 'TEACHING HOURS': '32 hrs', 'HOURLY RATE': '₹1,000 / hr', 'NET PAYABLE': '₹32,000', STATUS: 'Disbursed' },
    ],
    primaryActionLabel: 'Process Payroll Batch',
  },
  'payroll-report': {
    title: 'Salary & Payout Reports',
    category: 'STAFF / PAYROLL',
    icon: 'fa-file-invoice',
    subtitle: 'Annual salary summaries, TDS deductions, bank transfer vouchers, and payslip archives.',
    kpiCards: [
      { label: 'Total Salaries Paid', value: '₹14,40,000', color: '#2563EB', icon: 'fa-money-bill' },
      { label: 'TDS Deducted', value: '₹1,44,000', color: '#F59E0B', icon: 'fa-percentage' },
      { label: 'Active Faculty', value: '8 Teachers', color: '#10B981', icon: 'fa-user-check' },
    ],
    columns: ['PERIOD', 'TOTAL FACULTY', 'GROSS PAYOUT', 'TDS / DEDUCTION', 'NET DISBURSED', 'BANK ADVICE'],
    sampleRows: [
      { PERIOD: 'October 2026', 'TOTAL FACULTY': '8 Teachers', 'GROSS PAYOUT': '₹1,33,300', 'TDS / DEDUCTION': '₹13,300', 'NET DISBURSED': '₹1,20,000', 'BANK ADVICE': 'Generated (HDFC)' },
      { PERIOD: 'September 2026', 'TOTAL FACULTY': '8 Teachers', 'GROSS PAYOUT': '₹1,33,300', 'TDS / DEDUCTION': '₹13,300', 'NET DISBURSED': '₹1,20,000', 'BANK ADVICE': 'Generated (HDFC)' },
    ],
    primaryActionLabel: 'Download Bank NEFT Advice',
  },
  'communication-notices': {
    title: 'Academy Noticeboard',
    category: 'COMMUNICATION & ADMIN',
    icon: 'fa-bullhorn',
    subtitle: 'Broadcast institutional notices, class cancellations, holiday updates, and exam circulars.',
    kpiCards: [
      { label: 'Active Circulars', value: '6 Live', color: '#2563EB', icon: 'fa-bullhorn' },
      { label: 'Delivered (WhatsApp/SMS)', value: '184 Recipients', color: '#10B981', icon: 'fa-paper-plane' },
      { label: 'Read Ratio', value: '98.5%', color: '#6366F1', icon: 'fa-envelope-open-text' },
    ],
    columns: ['CIRCULAR NO', 'TITLE', 'TARGET AUDIENCE', 'PUBLISHED DATE', 'VALID UNTIL', 'PRIORITY'],
    sampleRows: [
      { 'CIRCULAR NO': 'CIR-2026-18', TITLE: 'Winter Break Timetable Revision', 'TARGET AUDIENCE': 'All Students & Teachers', 'PUBLISHED DATE': '2026-11-20', 'VALID UNTIL': '2026-12-15', PRIORITY: 'Important' },
      { 'CIRCULAR NO': 'CIR-2026-19', TITLE: 'Mock Exam 1 Answer Key Distribution', 'TARGET AUDIENCE': 'Class 12 Batches', 'PUBLISHED DATE': '2026-11-23', 'VALID UNTIL': '2026-11-30', PRIORITY: 'Normal' },
    ],
    primaryActionLabel: '+ Post New Notice',
  },
  'admin-settings': {
    title: 'Academy Settings & Affiliations',
    category: 'COMMUNICATION & ADMIN',
    icon: 'fa-cog',
    subtitle: 'Institutional identity, branding, logo, working hours, and academic calendar dates.',
    kpiCards: [
      { label: 'Academy Code', value: 'EDP-ACAD-01', color: '#2563EB', icon: 'fa-university' },
      { label: 'Affiliated Boards', value: 'CBSE & ICSE', color: '#10B981', icon: 'fa-certificate' },
      { label: 'System Mode', value: 'Tuition Hub', color: '#6366F1', icon: 'fa-laptop' },
    ],
    columns: ['SETTING PARAMETER', 'CURRENT CONFIGURATION', 'DEFAULT VALUE', 'LAST MODIFIED BY', 'STATUS'],
    sampleRows: [
      { 'SETTING PARAMETER': 'Institution Name', 'CURRENT CONFIGURATION': 'EduPye Academy — Tuition Center', 'DEFAULT VALUE': 'EduPye Academy', 'LAST MODIFIED BY': 'Super Admin', STATUS: 'Verified' },
      { 'SETTING PARAMETER': 'Academic Year Range', 'CURRENT CONFIGURATION': 'April 2026 – March 2027', 'DEFAULT VALUE': '2026-27', 'LAST MODIFIED BY': 'Super Admin', STATUS: 'Active' },
      { 'SETTING PARAMETER': 'Primary Grading Scale', 'CURRENT CONFIGURATION': 'Percentage & CBSE Letter Grades (A1 to E)', 'DEFAULT VALUE': 'CBSE 10-point', 'LAST MODIFIED BY': 'Academic Director', STATUS: 'Active' },
    ],
    primaryActionLabel: 'Save Academy Configuration',
  },
};

export const AcademyStarterView: React.FC<AcademyStarterViewProps> = ({
  viewId,
  academicSession,
  onOpenQuickFee,
  onNavigateView,
}) => {
  const { showToast } = useToast();
  const config = STARTER_CONFIGS[viewId] || {
    title: 'EduPye Academy Module',
    category: 'ACADEMY',
    icon: 'fa-graduation-cap',
    subtitle: 'Modular Tuition Management System module for academic session.',
    kpiCards: [
      { label: 'Status', value: 'Ready', color: '#2563EB', icon: 'fa-check' },
      { label: 'Session', value: academicSession, color: '#10B981', icon: 'fa-calendar-alt' },
    ],
    columns: ['ID', 'RECORD', 'DATE', 'STATUS'],
    sampleRows: [],
    primaryActionLabel: 'Configure Module',
  };

  const [searchTerm, setSearchTerm] = useState('');

  const handleAction = () => {
    if (viewId === 'fees-quick-collect' && onOpenQuickFee) {
      onOpenQuickFee();
      return;
    }
    showToast(`${config.title} configuration saved. (Phase 2 feature scaffolded and ready).`, 'info');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 1. Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: '#2563EB',
                backgroundColor: '#EFF6FF',
                padding: '2px 8px',
                borderRadius: '4px',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}
            >
              {config.category}
            </span>
            <span style={{ fontSize: '11px', color: '#64748B' }}>&bull; Session {academicSession}</span>
          </div>

          <h2 style={{ margin: '4px 0 0', fontSize: '20px', fontWeight: 800, color: '#0F1E36', letterSpacing: '-0.02em' }}>
            {config.title}
          </h2>
          <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#64748B' }}>
            {config.subtitle}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Phase 2 Pill */}
          <span
            style={{
              fontSize: '11px',
              fontWeight: 700,
              backgroundColor: '#EFF6FF',
              color: '#1D4ED8',
              border: '1px solid #BFDBFE',
              padding: '6px 12px',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <i className="fas fa-layer-group" /> Phase 2 — Ready for configuration
          </span>

          <button
            type="button"
            onClick={handleAction}
            style={{
              padding: '9px 18px',
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
            {config.primaryActionLabel}
          </button>
        </div>
      </div>

      {/* 2. KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(auto-fit, minmax(210px, 1fr))`,
          gap: '14px',
        }}
      >
        {config.kpiCards.map((kpi, idx) => (
          <div
            key={idx}
            style={{
              backgroundColor: '#FFFFFF',
              padding: '18px 20px',
              borderRadius: '12px',
              border: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
                {kpi.label}
              </div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: '#0F1E36', marginTop: '4px' }}>
                {kpi.value}
              </div>
            </div>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                backgroundColor: `${kpi.color}15`,
                color: kpi.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
              }}
            >
              <i className={`fas ${kpi.icon}`} />
            </div>
          </div>
        ))}
      </div>

      {/* 3. Search & Filter Bar */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '14px',
          border: '1px solid #E2E8F0',
          padding: '14px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
        }}
      >
        <div style={{ position: 'relative', width: '320px', maxWidth: '100%' }}>
          <i
            className="fas fa-search"
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#94A3B8',
              fontSize: '12.5px',
            }}
          />
          <input
            type="text"
            placeholder={`Filter ${config.title}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px 8px 34px',
              borderRadius: '8px',
              border: '1px solid #CBD5E1',
              fontSize: '12.5px',
              outline: 'none',
            }}
          />
        </div>

        <div style={{ fontSize: '12px', color: '#64748B' }}>
          Showing <strong>{config.sampleRows.length}</strong> configured records
        </div>
      </div>

      {/* 4. Structured Data Table */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '14px',
          border: '1px solid #E2E8F0',
          overflow: 'hidden',
          boxShadow: '0 1px 4px rgba(0, 0, 0, 0.02)',
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
            <thead>
              <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#475569', textAlign: 'left' }}>
                {config.columns.map((col, idx) => (
                  <th key={idx} style={{ padding: '12px 14px', fontWeight: 700 }}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {config.sampleRows.length > 0 ? (
                config.sampleRows.map((row, rIdx) => (
                  <tr
                    key={rIdx}
                    style={{ borderBottom: '1px solid #F1F5F9', transition: 'background-color 0.1s' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#F8FAFC';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    {config.columns.map((col, cIdx) => {
                      const val = row[col] || '—';
                      const isCode = col.includes('ID') || col.includes('NO') || col.includes('CODE');
                      const isStatus = col.includes('STATUS');

                      return (
                        <td key={cIdx} style={{ padding: '12px 14px' }}>
                          {isCode ? (
                            <span
                              style={{
                                fontFamily: 'monospace',
                                fontWeight: 700,
                                fontSize: '11.5px',
                                backgroundColor: '#F1F5F9',
                                color: '#0F1E36',
                                padding: '2px 6px',
                                borderRadius: '4px',
                              }}
                            >
                              {val}
                            </span>
                          ) : isStatus ? (
                            <span
                              style={{
                                fontSize: '10.5px',
                                fontWeight: 700,
                                backgroundColor: val.toLowerCase().includes('active') || val.toLowerCase().includes('issued') || val.toLowerCase().includes('submitted') || val.toLowerCase().includes('disbursed') ? '#D1FAE5' : '#FEF3C7',
                                color: val.toLowerCase().includes('active') || val.toLowerCase().includes('issued') || val.toLowerCase().includes('submitted') || val.toLowerCase().includes('disbursed') ? '#065F46' : '#92400E',
                                padding: '2px 8px',
                                borderRadius: '10px',
                              }}
                            >
                              {val}
                            </span>
                          ) : (
                            <span style={{ color: '#334155', fontWeight: cIdx === 1 ? 600 : 400 }}>
                              {val}
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={config.columns.length} style={{ padding: '40px', textAlign: 'center', color: '#94A3B8' }}>
                    No records found for this section.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
