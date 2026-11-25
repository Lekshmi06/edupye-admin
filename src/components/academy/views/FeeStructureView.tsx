import React, { useState, useEffect, useCallback } from 'react';
import {
  tuitionAdminService,
  type AcademyFeeStructureItem,
  type AdminTuitionProgram,
} from '../../../services/tuitionAdmin.service';
import { useToast } from '../../../hooks/useToast';
import { Loader } from '../../common/Loader';

interface FeeStructureViewProps {
  programs: AdminTuitionProgram[];
  academicSession: string;
}

export const FeeStructureView: React.FC<FeeStructureViewProps> = ({
  programs,
  academicSession,
}) => {
  const { showToast } = useToast();
  const [structures, setStructures] = useState<AcademyFeeStructureItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [className, setClassName] = useState('Class 12');
  const [billingType, setBillingType] = useState<'Monthly' | 'Per-Session Package' | 'One-Time'>('Monthly');
  const [amount, setAmount] = useState('3500');
  const [includedSessions, setIncludedSessions] = useState<number | undefined>(8);
  const [programId, setProgramId] = useState('');

  const loadStructures = useCallback(async () => {
    try {
      setLoading(true);
      const data = await tuitionAdminService.getFeeStructures({ session: academicSession });
      setStructures(data);
    } catch (err: any) {
      showToast(err.message || 'Failed to load fee structures', 'error');
    } finally {
      setLoading(false);
    }
  }, [academicSession, showToast]);

  useEffect(() => {
    loadStructures();
  }, [loadStructures]);

  const handleCreateStructure = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !amount) {
      showToast('Please provide a title and fee amount.', 'warning');
      return;
    }

    try {
      setSubmitting(true);
      await tuitionAdminService.createFeeStructure({
        title: title.trim(),
        className,
        billingType,
        amount: Number(amount),
        includedSessions: billingType === 'Per-Session Package' ? Number(includedSessions) : undefined,
        programId: programId || undefined,
        session: academicSession,
      });

      showToast(`Fee structure "${title}" created successfully!`, 'success');
      setShowAddModal(false);
      setTitle('');
      setAmount('3500');
      setProgramId('');
      loadStructures();
    } catch (err: any) {
      showToast(err.message || 'Failed to create fee tier', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const totalTiers = structures.length;
  const perSessionPacks = structures.filter((s) => s.billingType === 'Per-Session Package').length;
  const monthlyTiers = structures.filter((s) => s.billingType === 'Monthly').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 1. Header & Summary Bar */}
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
              FINANCE & BILLING
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
            Fee Structure & Pricing Tiers
          </h2>
          <p style={{ margin: 0, fontSize: '13px', color: '#64748B' }}>
            Configure recurring monthly tuition rates, 1-on-1 per-session packages, and admission fees.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          style={{
            padding: '10px 18px',
            backgroundColor: '#2563EB',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)',
          }}
        >
          <i className="fas fa-plus" /> + Add Fee Tier
        </button>
      </div>

      {/* 2. Metric Pills */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
        <div
          style={{
            backgroundColor: '#FFFFFF',
            padding: '16px 20px',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
              Configured Tiers
            </div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#0F1E36', marginTop: '2px' }}>
              {totalTiers} Active
            </div>
          </div>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              backgroundColor: '#EFF6FF',
              color: '#2563EB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
            }}
          >
            <i className="fas fa-layer-group" />
          </div>
        </div>

        <div
          style={{
            backgroundColor: '#FFFFFF',
            padding: '16px 20px',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
              Monthly Tuition Plans
            </div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#059669', marginTop: '2px' }}>
              {monthlyTiers} Plans
            </div>
          </div>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              backgroundColor: '#ECFDF5',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
            }}
          >
            <i className="fas fa-calendar-alt" />
          </div>
        </div>

        <div
          style={{
            backgroundColor: '#FFFFFF',
            padding: '16px 20px',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
              1-on-1 Session Packs
            </div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#7C3AED', marginTop: '2px' }}>
              {perSessionPacks} Packages
            </div>
          </div>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              backgroundColor: '#F5F3FF',
              color: '#7C3AED',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
            }}
          >
            <i className="fas fa-user-friends" />
          </div>
        </div>
      </div>

      {/* 3. Tier Cards Overview */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
          <Loader />
        </div>
      ) : (
        <>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
              gap: '16px',
            }}
          >
            {structures.map((tier) => {
              const isPack = tier.billingType === 'Per-Session Package';
              const isMonthly = tier.billingType === 'Monthly';
              return (
                <div
                  key={tier._id || tier.title}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '14px',
                    border: '1px solid #E2E8F0',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '16px',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: '6px',
                          backgroundColor: isPack ? '#F5F3FF' : isMonthly ? '#EFF6FF' : '#FEF3C7',
                          color: isPack ? '#7C3AED' : isMonthly ? '#2563EB' : '#D97706',
                        }}
                      >
                        {tier.billingType}
                      </span>
                      <span style={{ fontSize: '11.5px', color: '#64748B', fontWeight: 600 }}>
                        {tier.className}
                      </span>
                    </div>

                    <h3 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: 800, color: '#0F1E36' }}>
                      {tier.title}
                    </h3>

                    {isPack && tier.includedSessions && (
                      <div
                        style={{
                          fontSize: '12px',
                          color: '#4B5563',
                          backgroundColor: '#F8FAFC',
                          padding: '6px 10px',
                          borderRadius: '6px',
                          marginTop: '6px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <i className="fas fa-check-circle" style={{ color: '#10B981' }} />
                        Includes <strong>{tier.includedSessions} Sessions</strong> quota
                      </div>
                    )}
                  </div>

                  <div
                    style={{
                      borderTop: '1px solid #F1F5F9',
                      paddingTop: '14px',
                      display: 'flex',
                      alignItems: 'baseline',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <span style={{ fontSize: '24px', fontWeight: 800, color: '#0F1E36' }}>
                        ₹{tier.amount.toLocaleString()}
                      </span>
                      <span style={{ fontSize: '12px', color: '#64748B', marginLeft: '4px' }}>
                        {isMonthly ? '/month' : isPack ? '/pack' : 'one-time'}
                      </span>
                    </div>

                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        color: '#059669',
                        backgroundColor: '#ECFDF5',
                        padding: '3px 8px',
                        borderRadius: '6px',
                      }}
                    >
                      Active
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 4. Complete Table View */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '14px',
              border: '1px solid #E2E8F0',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                padding: '16px 20px',
                borderBottom: '1px solid #E2E8F0',
                backgroundColor: '#F8FAFC',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#0F1E36' }}>
                All Fee Heads ({structures.length})
              </h3>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                    <th style={{ padding: '12px 20px', fontWeight: 700, color: '#475569' }}>FEE HEAD TITLE</th>
                    <th style={{ padding: '12px 20px', fontWeight: 700, color: '#475569' }}>CLASS / LEVEL</th>
                    <th style={{ padding: '12px 20px', fontWeight: 700, color: '#475569' }}>BILLING MODEL</th>
                    <th style={{ padding: '12px 20px', fontWeight: 700, color: '#475569' }}>SESSIONS INCLUDED</th>
                    <th style={{ padding: '12px 20px', fontWeight: 700, color: '#475569' }}>BASE AMOUNT</th>
                    <th style={{ padding: '12px 20px', fontWeight: 700, color: '#475569' }}>SESSION</th>
                  </tr>
                </thead>
                <tbody>
                  {structures.map((item, idx) => (
                    <tr
                      key={item._id || item.title}
                      style={{
                        borderBottom: idx === structures.length - 1 ? 'none' : '1px solid #F1F5F9',
                        backgroundColor: idx % 2 === 0 ? '#FFFFFF' : '#FAFAFA',
                      }}
                    >
                      <td style={{ padding: '14px 20px', fontWeight: 700, color: '#0F1E36' }}>
                        {item.title}
                      </td>
                      <td style={{ padding: '14px 20px', color: '#475569' }}>{item.className}</td>
                      <td style={{ padding: '14px 20px' }}>
                        <span
                          style={{
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: 700,
                            backgroundColor:
                              item.billingType === 'Per-Session Package'
                                ? '#F5F3FF'
                                : item.billingType === 'Monthly'
                                ? '#EFF6FF'
                                : '#FEF3C7',
                            color:
                              item.billingType === 'Per-Session Package'
                                ? '#7C3AED'
                                : item.billingType === 'Monthly'
                                ? '#2563EB'
                                : '#D97706',
                          }}
                        >
                          {item.billingType}
                        </span>
                      </td>
                      <td style={{ padding: '14px 20px', color: '#475569' }}>
                        {item.includedSessions ? `${item.includedSessions} Sessions` : 'Unlimited / Monthly'}
                      </td>
                      <td style={{ padding: '14px 20px', fontWeight: 800, color: '#0F1E36' }}>
                        ₹{item.amount.toLocaleString()}
                      </td>
                      <td style={{ padding: '14px 20px', color: '#64748B', fontFamily: 'monospace' }}>
                        {item.session}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* 5. Add Fee Tier Modal */}
      {showAddModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            zIndex: 120,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => setShowAddModal(false)}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '520px',
              padding: '24px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
                  <i className="fas fa-tags" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#0F1E36' }}>
                    Create Fee Structure Tier
                  </h3>
                  <p style={{ margin: 0, fontSize: '12px', color: '#64748B' }}>
                    Session {academicSession} pricing configuration
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                style={{ background: 'none', border: 'none', color: '#94A3B8', fontSize: '16px', cursor: 'pointer' }}
              >
                <i className="fas fa-times" />
              </button>
            </div>

            <form onSubmit={handleCreateStructure} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Fee Head Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Class 12 Science PCM Monthly, or 1-on-1 Physics 10-Pack"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Target Class / Level
                  </label>
                  <select
                    value={className}
                    onChange={(e) => setClassName(e.target.value)}
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
                    <option value="Class 12">Class 12</option>
                    <option value="Class 11">Class 11</option>
                    <option value="Class 10">Class 10</option>
                    <option value="Class 9">Class 9</option>
                    <option value="All Classes">All Classes</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Billing Model
                  </label>
                  <select
                    value={billingType}
                    onChange={(e) => setBillingType(e.target.value as any)}
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
                    <option value="Monthly">Monthly Recurring</option>
                    <option value="Per-Session Package">Per-Session Package (1-on-1)</option>
                    <option value="One-Time">One-Time / Term</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Fee Amount (₹) *
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

                {billingType === 'Per-Session Package' ? (
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                      Included Sessions Quota *
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      max={100}
                      value={includedSessions || 8}
                      onChange={(e) => setIncludedSessions(Number(e.target.value))}
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
                ) : (
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                      Link Specific Batch (Optional)
                    </label>
                    <select
                      value={programId}
                      onChange={(e) => setProgramId(e.target.value)}
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
                      <option value="">-- Apply to all batches --</option>
                      {programs.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.title} ({p.subject})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
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
                    backgroundColor: '#2563EB',
                    color: '#FFFFFF',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {submitting ? 'Saving...' : 'Save Fee Tier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
