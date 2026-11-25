import React, { useState } from 'react';
import { useToast } from '../../../hooks/useToast';

interface AcademySettingsViewProps {
  academicSession: string;
  onSessionChange: (session: string) => void;
}

export const AcademySettingsView: React.FC<AcademySettingsViewProps> = ({
  academicSession,
  onSessionChange,
}) => {
  const { showToast } = useToast();
  const [centerName, setCenterName] = useState('EduPye Academy & Learning Center');
  const [centerCode, setCenterCode] = useState('EDUPYE-TUT-001');
  const [phone, setPhone] = useState('+91 98765 01234');
  const [email, setEmail] = useState('academy@edupye.com');
  const [address, setAddress] = useState('EduPye Tower, 4th Floor, Tech Hub Avenue, Bengaluru');
  const [defaultRate1on1, setDefaultRate1on1] = useState('500');
  const [defaultRateBatch, setDefaultRateBatch] = useState('800');
  const [defaultMonthlyTuition, setDefaultMonthlyTuition] = useState('2500');
  const [operatingHours, setOperatingHours] = useState('08:00 AM - 09:00 PM (Mon - Sun)');
  const [saving, setSaving] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      showToast('Tuition Center Settings saved successfully!', 'success');
    }, 400);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 1. Header Bar */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '14px',
          padding: '20px 24px',
          border: '1px solid #E2E8F0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                backgroundColor: '#EFF6FF',
                color: '#2563EB',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 800,
                letterSpacing: '0.04em',
              }}
            >
              PREFERENCES & RATES
            </span>
            <span style={{ fontSize: '12.5px', color: '#64748B', fontWeight: 600 }}>
              Session {academicSession}
            </span>
          </div>
          <h2
            style={{
              margin: '6px 0 2px',
              fontSize: '22px',
              fontWeight: 800,
              color: '#0F1E36',
              letterSpacing: '-0.02em',
            }}
          >
            Tuition Center Profile & Compensation Configuration
          </h2>
          <p style={{ margin: 0, fontSize: '13px', color: '#64748B' }}>
            Configure default tutor hourly and batch session rates, center metadata, operating hours, and active academic year.
          </p>
        </div>
      </div>

      {/* 2. Configuration Form */}
      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Center Details */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '14px',
            border: '1px solid #E2E8F0',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid #F1F5F9', paddingBottom: '12px' }}>
            <i className="fas fa-school" style={{ color: '#2563EB', fontSize: '18px' }} />
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0F1E36' }}>
              Center Identity & Location
            </h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                Center Official Name
              </label>
              <input
                type="text"
                required
                value={centerName}
                onChange={(e) => setCenterName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  fontSize: '13px',
                  outline: 'none',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                Center Registration Code
              </label>
              <input
                type="text"
                required
                value={centerCode}
                onChange={(e) => setCenterCode(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  fontSize: '13px',
                  outline: 'none',
                  fontFamily: 'monospace',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                Active Academic Session
              </label>
              <select
                value={academicSession}
                onChange={(e) => onSessionChange(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  fontSize: '13px',
                  outline: 'none',
                  backgroundColor: '#FFFFFF',
                  fontWeight: 700,
                  color: '#2563EB',
                }}
              >
                <option value="2026-27">Academic Year 2026-27 (Active)</option>
                <option value="2027-28">Academic Year 2027-28 (Upcoming)</option>
                <option value="2025-26">Academic Year 2025-26 (Archive)</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                Contact Telephone
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  fontSize: '13px',
                  outline: 'none',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                Support Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  fontSize: '13px',
                  outline: 'none',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                Operating Timings
              </label>
              <input
                type="text"
                value={operatingHours}
                onChange={(e) => setOperatingHours(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  fontSize: '13px',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
              Campus Address
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                fontSize: '13px',
                outline: 'none',
              }}
            />
          </div>
        </div>

        {/* Default Rates */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '14px',
            border: '1px solid #E2E8F0',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid #F1F5F9', paddingBottom: '12px' }}>
            <i className="fas fa-coins" style={{ color: '#10B981', fontSize: '18px' }} />
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0F1E36' }}>
              Default Tutor Compensation Rates & Base Fees
            </h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                Default 1-on-1 Tutor Rate (₹ / Session)
              </label>
              <input
                type="number"
                min={100}
                value={defaultRate1on1}
                onChange={(e) => setDefaultRate1on1(e.target.value)}
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

            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                Default Batch Session Rate (₹ / Class)
              </label>
              <input
                type="number"
                min={100}
                value={defaultRateBatch}
                onChange={(e) => setDefaultRateBatch(e.target.value)}
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

            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                Baseline Monthly Batch Tuition (₹)
              </label>
              <input
                type="number"
                min={500}
                value={defaultMonthlyTuition}
                onChange={(e) => setDefaultMonthlyTuition(e.target.value)}
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
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button
            type="submit"
            disabled={saving}
            style={{
              padding: '10px 24px',
              backgroundColor: '#2563EB',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)',
            }}
          >
            <i className="fas fa-save" /> {saving ? 'Saving...' : 'Save Center Configuration'}
          </button>
        </div>
      </form>
    </div>
  );
};
