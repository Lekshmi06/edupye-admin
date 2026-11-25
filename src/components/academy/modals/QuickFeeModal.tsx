import React, { useState } from 'react';
import {
  tuitionAdminService,
  type AdminStudentItem,
} from '../../../services/tuitionAdmin.service';
import { useToast } from '../../../hooks/useToast';

interface QuickFeeModalProps {
  students: AdminStudentItem[];
  initialStudent?: AdminStudentItem | null;
  initialAmount?: number;
  onClose: () => void;
  onSuccess: () => void;
}

export const QuickFeeModal: React.FC<QuickFeeModalProps> = ({
  students,
  initialStudent,
  initialAmount,
  onClose,
  onSuccess,
}) => {
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<AdminStudentItem | null>(
    initialStudent || students[0] || null
  );
  const [amount, setAmount] = useState<string>(
    initialAmount ? String(initialAmount) : '2500'
  );
  const [feeType, setFeeType] = useState('Monthly Tuition');
  const [paymentMode, setPaymentMode] = useState('UPI');
  const [receiptNumber, setReceiptNumber] = useState('');
  const [isSuccessReceipt, setIsSuccessReceipt] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.studentCode && s.studentCode.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleCollect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) {
      showToast('Please select a student.', 'warning');
      return;
    }

    try {
      setSubmitting(true);
      const parsedAmount = Number(amount);
      const res = await tuitionAdminService.collectFeePayment({
        studentId: selectedStudent.id,
        studentCode: selectedStudent.studentCode || `STU-${selectedStudent.id.slice(-6).toUpperCase()}`,
        studentName: selectedStudent.name,
        programId: selectedStudent.enrolledPrograms?.[0]?.id,
        monthOrTerm: feeType,
        amountDue: parsedAmount,
        amountPaid: parsedAmount,
        paymentMode: (paymentMode === 'UPI / QR Pay' ? 'UPI' : paymentMode) as any,
        session: '2026-27',
      });

      setReceiptNumber(res.payment.receiptNo);
      setIsSuccessReceipt(true);
      showToast(`Fee receipt ${res.payment.receiptNo} recorded for ${selectedStudent.name}.`, 'success');
      onSuccess();
    } catch (err: any) {
      showToast(err.message || 'Failed to record fee payment', 'error');
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
          maxWidth: '500px',
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: '#EFF6FF',
                color: '#2563EB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
              }}
            >
              <i className="fas fa-bolt" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#0F172A' }}>
                Quick Fee Collect
              </h3>
              <p style={{ margin: '1px 0 0', fontSize: '12px', color: '#64748B' }}>
                Instant fee receipt generation & payment recording.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#94A3B8', fontSize: '16px', cursor: 'pointer' }}
          >
            <i className="fas fa-times" />
          </button>
        </div>

        {isSuccessReceipt && selectedStudent ? (
          /* Receipt Card */
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              backgroundColor: '#F8FAFC',
              borderRadius: '12px',
              padding: '20px',
              border: '1px solid #E2E8F0',
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '50%',
                  backgroundColor: '#D1FAE5',
                  color: '#059669',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  margin: '0 auto 8px',
                }}
              >
                <i className="fas fa-check" />
              </div>
              <h4 style={{ margin: '0 0 2px', fontSize: '16px', fontWeight: 800, color: '#065F46' }}>
                Fee Received Successfully
              </h4>
              <p style={{ margin: 0, fontSize: '12px', color: '#64748B' }}>
                Receipt No: <strong style={{ color: '#0F1E36', fontFamily: 'monospace' }}>{receiptNumber}</strong>
              </p>
            </div>

            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '8px',
                padding: '14px',
                border: '1px solid #CBD5E1',
                fontSize: '12.5px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>Student Name:</span>
                <span style={{ fontWeight: 700, color: '#0F172A' }}>{selectedStudent.name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>Student Code:</span>
                <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{selectedStudent.studentCode || 'N/A'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>Fee Type:</span>
                <span style={{ fontWeight: 600 }}>{feeType}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>Payment Mode:</span>
                <span style={{ fontWeight: 600 }}>{paymentMode}</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  paddingTop: '8px',
                  borderTop: '1px solid #E2E8F0',
                  fontSize: '14px',
                  fontWeight: 800,
                  color: '#0F1E36',
                }}
              >
                <span>Amount Paid:</span>
                <span style={{ color: '#10B981' }}>₹{Number(amount).toLocaleString()}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={() => window.print()}
                style={{
                  flex: 1,
                  padding: '9px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: '#2563EB',
                  color: '#FFFFFF',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <i className="fas fa-print" /> Print Receipt
              </button>
              <button
                type="button"
                onClick={() => {
                  onClose();
                }}
                style={{
                  padding: '9px 18px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  backgroundColor: '#FFFFFF',
                  color: '#334155',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* Collection Form */
          <form onSubmit={handleCollect} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Search / Select Student */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                Search Student (Name or STU-Code)
              </label>
              <input
                type="text"
                placeholder="Type name or STU-..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  fontSize: '13px',
                  outline: 'none',
                  marginBottom: '6px',
                }}
              />
              <select
                value={selectedStudent?.id || ''}
                onChange={(e) => {
                  const s = students.find((st) => st.id === e.target.value);
                  setSelectedStudent(s || null);
                }}
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
                {filteredStudents.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.studentCode || 'No Code'}) &bull; {s.grade || 'Class 12'}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Fee Head / Type
                </label>
                <select
                  value={feeType}
                  onChange={(e) => setFeeType(e.target.value)}
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
                  <option value="Monthly Tuition">Monthly Tuition</option>
                  <option value="Per-Session 1-on-1 Pack">Per-Session 1-on-1 Pack</option>
                  <option value="Term Fee">Term Fee</option>
                  <option value="Admission / Registration">Admission / Registration</option>
                  <option value="Exam & Material Fee">Exam & Material Fee</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Amount to Collect (₹) *
                </label>
                <input
                  type="number"
                  required
                  min={100}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '13px',
                    outline: 'none',
                    fontWeight: 700,
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                Payment Mode
              </label>
              <select
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value)}
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
                <option value="UPI">UPI / QR Pay</option>
                <option value="Cash">Cash</option>
                <option value="Bank Transfer">Bank Transfer / NEFT</option>
                <option value="Card">Debit / Credit Card</option>
              </select>
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
                  backgroundColor: '#10B981',
                  color: '#FFFFFF',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {submitting ? 'Recording...' : `Collect ₹${Number(amount).toLocaleString()}`}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
