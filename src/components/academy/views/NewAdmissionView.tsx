import React, { useState } from 'react';
import type { AdminTuitionProgram, AdminStudentItem } from '../../../services/tuitionAdmin.service';
import { tuitionAdminService } from '../../../services/tuitionAdmin.service';
import { useToast } from '../../../hooks/useToast';

interface NewAdmissionViewProps {
  programs: AdminTuitionProgram[];
  academicSession: string;
  onSuccess: () => void;
  onNavigateAllStudents: () => void;
  onOpenIdCard: (student: AdminStudentItem) => void;
}

export const NewAdmissionView: React.FC<NewAdmissionViewProps> = ({
  programs,
  academicSession,
  onSuccess,
  onNavigateAllStudents,
  onOpenIdCard,
}) => {
  const { showToast } = useToast();

  // Form States
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('Male');
  const [dob, setDob] = useState('2009-06-15');
  const [grade, setGrade] = useState('Class 12');
  const [address, setAddress] = useState('');

  // Parent / Guardian Details
  const [parentName, setParentName] = useState('');
  const [parentRelation, setParentRelation] = useState('Father');
  const [parentPhone, setParentPhone] = useState('');
  const [parentEmail, setParentEmail] = useState('');

  // Academic Enrollment & Fees
  const [selectedProgramId, setSelectedProgramId] = useState<string>(programs[0]?._id || '');
  const [feePlan, setFeePlan] = useState('Monthly Standard (₹2,500/mo)');
  const [advancePaid, setAdvancePaid] = useState('2500');

  // Submission & Success
  const [submitting, setSubmitting] = useState(false);
  const [admittedStudent, setAdmittedStudent] = useState<AdminStudentItem | null>(null);

  // Generate pseudo-code for instant visual preview
  const previewCode = 'STU-' + (name ? name.slice(0, 2).toUpperCase() : 'ED') + Math.floor(1000 + Math.random() * 9000);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Please enter student full name.', 'warning');
      return;
    }
    if (!email.trim() && !phone.trim()) {
      showToast('Please provide an email or phone number for the student.', 'warning');
      return;
    }

    try {
      setSubmitting(true);
      const res = await tuitionAdminService.createStudent({
        name: name.trim(),
        displayName: name.trim(),
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        grade,
        parentName: parentName.trim(),
        parentPhone: parentPhone.trim(),
        parentEmail: parentEmail.trim(),
        parentRelation,
        gender,
        dob,
        address: address.trim(),
        programId: selectedProgramId || undefined,
        feePlan,
      });

      showToast(`Student admitted successfully with ID ${res.student?.studentCode || 'STU-XXXXXX'}!`, 'success');
      setAdmittedStudent(res.student);
      onSuccess();
    } catch (err: any) {
      showToast(err.message || 'Failed to complete admission', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setName('');
    setEmail('');
    setPhone('');
    setParentName('');
    setParentPhone('');
    setAddress('');
    setAdmittedStudent(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '960px', margin: '0 auto', width: '100%' }}>
      {/* 1. Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#0F1E36', letterSpacing: '-0.02em' }}>
            New Student Admission
          </h2>
          <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#64748B' }}>
            Enroll a tuition student, auto-generate permanent monospaced STU-ID, and map batches.
          </p>
        </div>

        <button
          type="button"
          onClick={onNavigateAllStudents}
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
          &larr; Back to All Students
        </button>
      </div>

      {/* 2. Success Admission Slip / Receipt Card */}
      {admittedStudent ? (
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: '2px solid #10B981',
            padding: '28px',
            boxShadow: '0 10px 25px rgba(16, 185, 129, 0.1)',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: '#D1FAE5',
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                flexShrink: 0,
              }}
            >
              <i className="fas fa-check" />
            </div>
            <div>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  backgroundColor: '#D1FAE5',
                  color: '#065F46',
                  padding: '2px 8px',
                  borderRadius: '10px',
                  textTransform: 'uppercase',
                }}
              >
                Admission Confirmed &bull; Academic Session {academicSession}
              </span>
              <h3 style={{ margin: '4px 0 0', fontSize: '20px', fontWeight: 800, color: '#0F1E36' }}>
                {admittedStudent.name} is successfully enrolled!
              </h3>
            </div>
          </div>

          {/* Credentials Summary Box */}
          <div
            style={{
              backgroundColor: '#F8FAFC',
              borderRadius: '12px',
              border: '1px solid #E2E8F0',
              padding: '20px',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '14px',
            }}
          >
            <div>
              <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>PERMANENT STUDENT CODE</div>
              <div
                style={{
                  fontFamily: 'monospace',
                  fontSize: '18px',
                  fontWeight: 800,
                  color: '#0F1E36',
                  backgroundColor: '#EFF6FF',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  border: '1px solid #BFDBFE',
                  display: 'inline-block',
                  marginTop: '4px',
                }}
              >
                {admittedStudent.studentCode}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>CLASS / GRADE</div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', marginTop: '4px' }}>
                {admittedStudent.grade || grade}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>PARENT / GUARDIAN</div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', marginTop: '4px' }}>
                {admittedStudent.parentName || parentName} ({admittedStudent.parentPhone || parentPhone || 'N/A'})
              </div>
            </div>

            <div>
              <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>ASSIGNED BATCH</div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#2563EB', marginTop: '4px' }}>
                {admittedStudent.enrolledPrograms?.[0]?.title || 'Enrolled in Primary Program'}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => onOpenIdCard(admittedStudent)}
              style={{
                padding: '10px 18px',
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
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
              }}
            >
              <i className="fas fa-id-card" /> View / Print Tuition ID Card
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              style={{
                padding: '10px 18px',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                backgroundColor: '#FFFFFF',
                color: '#0F172A',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <i className="fas fa-print" /> Print Admission Slip
            </button>

            <button
              type="button"
              onClick={handleResetForm}
              style={{
                padding: '10px 18px',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                backgroundColor: '#F8FAFC',
                color: '#334155',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              + Admit Another Student
            </button>

            <button
              type="button"
              onClick={onNavigateAllStudents}
              style={{
                padding: '10px 18px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#0F1E36',
                color: '#FFFFFF',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                marginLeft: 'auto',
              }}
            >
              Go to All Students &rarr;
            </button>
          </div>
        </div>
      ) : (
        /* Admission Form */
        <form
          onSubmit={handleSubmit}
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '14px',
            border: '1px solid #E2E8F0',
            padding: '24px 28px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
          }}
        >
          {/* Section 1: Student Information */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', borderBottom: '1px solid #F1F5F9', paddingBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800 }}>
                  1
                </div>
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#0F172A' }}>
                  Student Personal Profile
                </h3>
              </div>

              {/* Dynamic Auto-ID preview */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
                <span style={{ color: '#64748B' }}>Allocated ID:</span>
                <span style={{ fontFamily: 'monospace', fontWeight: 800, backgroundColor: '#F1F5F9', color: '#0F1E36', padding: '2px 8px', borderRadius: '4px', border: '1px solid #E2E8F0' }}>
                  {previewCode}
                </span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Student Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. rahul@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Student Mobile / WhatsApp
                </label>
                <input
                  type="tel"
                  placeholder="e.g. +91 9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Class / Grade *
                </label>
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', outline: 'none', backgroundColor: '#FFFFFF' }}
                >
                  <option value="Class 9">Class 9</option>
                  <option value="Class 10">Class 10</option>
                  <option value="Class 11">Class 11</option>
                  <option value="Class 12">Class 12</option>
                  <option value="Repeater / Dropper">Repeater / Dropper</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Gender
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', outline: 'none', backgroundColor: '#FFFFFF' }}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', outline: 'none' }}
                />
              </div>
            </div>

            <div style={{ marginTop: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                Residential Address
              </label>
              <input
                type="text"
                placeholder="House / Street, Area, City & PIN"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', outline: 'none' }}
              />
            </div>
          </div>

          {/* Section 2: Parent / Guardian Details */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', borderBottom: '1px solid #F1F5F9', paddingBottom: '8px' }}>
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800 }}>
                2
              </div>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#0F172A' }}>
                Parent / Guardian Information
              </h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Parent / Guardian Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Sharma"
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Relationship
                </label>
                <select
                  value={parentRelation}
                  onChange={(e) => setParentRelation(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', outline: 'none', backgroundColor: '#FFFFFF' }}
                >
                  <option value="Father">Father</option>
                  <option value="Mother">Mother</option>
                  <option value="Guardian">Guardian</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Parent Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. +91 9823456789"
                  value={parentPhone}
                  onChange={(e) => setParentPhone(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Parent Email Address
                </label>
                <input
                  type="email"
                  placeholder="e.g. ramesh.sharma@example.com"
                  value={parentEmail}
                  onChange={(e) => setParentEmail(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', outline: 'none' }}
                />
              </div>
            </div>
          </div>

          {/* Section 3: Batch Enrollment & Fee Plan */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', borderBottom: '1px solid #F1F5F9', paddingBottom: '8px' }}>
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800 }}>
                3
              </div>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#0F172A' }}>
                Batch Mapping & Fee Plan
              </h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Assign Primary Batch / Class
                </label>
                <select
                  value={selectedProgramId}
                  onChange={(e) => setSelectedProgramId(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', outline: 'none', backgroundColor: '#FFFFFF' }}
                >
                  <option value="">-- Assign Later --</option>
                  {programs.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.title} ({p.code}) &bull; {p.subject} &bull; {p.grade || 'General'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Tuition Fee Plan
                </label>
                <select
                  value={feePlan}
                  onChange={(e) => setFeePlan(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', outline: 'none', backgroundColor: '#FFFFFF' }}
                >
                  <option value="Monthly Standard (₹2,500/mo)">Monthly Standard (₹2,500/mo)</option>
                  <option value="Quarterly Package (₹7,000/qtr)">Quarterly Package (₹7,000/qtr)</option>
                  <option value="Annual Comprehensive (₹24,000/yr)">Annual Comprehensive (₹24,000/yr)</option>
                  <option value="Custom Fee Agreement">Custom Fee Agreement</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Advance / Admission Fee Paid (₹)
                </label>
                <input
                  type="number"
                  value={advancePaid}
                  onChange={(e) => setAdvancePaid(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', outline: 'none', fontWeight: 700 }}
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid #F1F5F9', paddingTop: '16px' }}>
            <button
              type="button"
              onClick={handleResetForm}
              style={{
                padding: '10px 18px',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                backgroundColor: '#FFFFFF',
                color: '#475569',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Reset Form
            </button>

            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: '10px 24px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#10B981',
                color: '#FFFFFF',
                fontSize: '13px',
                fontWeight: 700,
                cursor: submitting ? 'not-allowed' : 'pointer',
                opacity: submitting ? 0.7 : 1,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)',
              }}
            >
              {submitting ? (
                <>
                  <i className="fas fa-spinner fa-spin" /> Admitting Student...
                </>
              ) : (
                <>
                  <i className="fas fa-check-circle" /> Complete Student Admission
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
