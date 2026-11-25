import React from 'react';
import { ACADEMY_NAV_CATEGORIES, type AcademyViewId } from './types';
import { useAuth } from '../../context/AuthContext';

interface EduPyeAcademySidebarProps {
  activeView: AcademyViewId;
  onSelectView: (view: AcademyViewId) => void;
  onReturnToMainAdmin: () => void;
  academicSession: string;
  onSessionChange: (session: string) => void;
}

export const EduPyeAcademySidebar: React.FC<EduPyeAcademySidebarProps> = ({
  activeView,
  onSelectView,
  onReturnToMainAdmin,
  academicSession,
  onSessionChange,
}) => {
  const { user } = useAuth();
  const displayName = user?.displayName || user?.username || 'Academy Director';
  const role = user?.role || 'Tuition Admin';

  return (
    <aside
      style={{
        width: '272px',
        minWidth: '272px',
        height: '100vh',
        position: 'sticky',
        top: 0,
        backgroundColor: '#0F1E36',
        color: '#F8FAFC',
        display: 'flex',
        flexDirection: 'column',
        borderRight: '1px solid rgba(255, 255, 255, 0.08)',
        zIndex: 40,
        boxShadow: '4px 0 24px rgba(0, 0, 0, 0.18)',
        userSelect: 'none',
      }}
    >
      {/* 1. Header Brand & Return Action */}
      <div
        style={{
          padding: '20px 18px 16px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          background: 'linear-gradient(180deg, rgba(30, 58, 138, 0.25) 0%, rgba(15, 30, 54, 0) 100%)',
        }}
      >
        {/* Top return button */}
        <button
          type="button"
          onClick={onReturnToMainAdmin}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '11.5px',
            fontWeight: 600,
            color: '#94A3B8',
            backgroundColor: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            padding: '5px 10px',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            alignSelf: 'flex-start',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.12)';
            e.currentTarget.style.color = '#FFFFFF';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.25)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.06)';
            e.currentTarget.style.color = '#94A3B8';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
          }}
          title="Return to Main ERP Administration Portal"
        >
          <i className="fas fa-arrow-left" style={{ fontSize: '10px' }} />
          <span>Main Admin</span>
        </button>

        {/* Brand identity */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 50%, #4338CA 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)',
              color: '#FFFFFF',
              fontSize: '18px',
              flexShrink: 0,
            }}
          >
            <i className="fas fa-graduation-cap" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span
                style={{
                  fontSize: '16px',
                  fontWeight: 800,
                  color: '#FFFFFF',
                  letterSpacing: '-0.02em',
                  whiteSpace: 'nowrap',
                }}
              >
                EduPye Academy
              </span>
            </div>
            <span
              style={{
                fontSize: '11px',
                color: '#60A5FA',
                fontWeight: 600,
                letterSpacing: '0.02em',
                textTransform: 'uppercase',
              }}
            >
              Tuition Management System
            </span>
          </div>
        </div>

        {/* Academic Session Selector */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '9px',
            padding: '6px 10px',
            fontSize: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94A3B8' }}>
            <i className="fas fa-calendar-alt" style={{ fontSize: '11px', color: '#38BDF8' }} />
            <span style={{ fontSize: '11px', fontWeight: 500 }}>Session:</span>
          </div>
          <select
            value={academicSession}
            onChange={(e) => onSessionChange(e.target.value)}
            style={{
              backgroundColor: 'transparent',
              color: '#F8FAFC',
              border: 'none',
              fontSize: '11.5px',
              fontWeight: 700,
              cursor: 'pointer',
              outline: 'none',
              textAlign: 'right',
            }}
          >
            <option value="2026-27" style={{ backgroundColor: '#0F1E36', color: '#FFF' }}>
              2026-27 (Active)
            </option>
            <option value="2025-26" style={{ backgroundColor: '#0F1E36', color: '#FFF' }}>
              2025-26 (Archive)
            </option>
            <option value="2027-28" style={{ backgroundColor: '#0F1E36', color: '#FFF' }}>
              2027-28 (Upcoming)
            </option>
          </select>
        </div>
      </div>

      {/* 2. Categorized Navigation Menu List */}
      <nav
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: '14px 10px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
        className="academy-sidebar-scroll"
      >
        {ACADEMY_NAV_CATEGORIES.map((cat) => (
          <div key={cat.category} style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            {/* Category Header Label */}
            <div
              style={{
                fontSize: '10px',
                fontWeight: 700,
                color: '#64748B',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                padding: '4px 10px',
              }}
            >
              {cat.category}
            </div>

            {/* Category Nav Items */}
            {cat.items.map((item) => {
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectView(item.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: isActive ? 'rgba(37, 99, 235, 0.22)' : 'transparent',
                    color: isActive ? '#FFFFFF' : '#94A3B8',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s ease',
                    boxShadow: isActive ? 'inset 3px 0 0 #3B82F6' : 'none',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                      e.currentTarget.style.color = '#E2E8F0';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = '#94A3B8';
                    }
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '11px', minWidth: 0 }}>
                    <i
                      className={`fas ${item.icon}`}
                      style={{
                        fontSize: '13px',
                        width: '16px',
                        textAlign: 'center',
                        color: isActive ? '#60A5FA' : '#64748B',
                        flexShrink: 0,
                      }}
                    />
                    <span
                      style={{
                        fontSize: '12.5px',
                        fontWeight: isActive ? 700 : 500,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {item.label}
                    </span>
                  </div>

                  {item.badge && (
                    <span
                      style={{
                        fontSize: '9.5px',
                        fontWeight: 700,
                        padding: '1px 6px',
                        borderRadius: '10px',
                        backgroundColor: item.badgeColor || '#2563EB',
                        color: '#FFFFFF',
                        letterSpacing: '0.02em',
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* 3. Bottom User Profile Footer */}
      <div
        style={{
          padding: '14px 16px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          backgroundColor: 'rgba(10, 20, 36, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              backgroundColor: '#2563EB',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '13px',
              flexShrink: 0,
            }}
          >
            {displayName[0]?.toUpperCase() || 'A'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <span
              style={{
                fontSize: '12.5px',
                fontWeight: 700,
                color: '#F8FAFC',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
              title={displayName}
            >
              {displayName}
            </span>
            <span
              style={{
                fontSize: '11px',
                color: '#94A3B8',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {role}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onReturnToMainAdmin}
          style={{
            background: 'none',
            border: 'none',
            color: '#64748B',
            cursor: 'pointer',
            padding: '6px',
            borderRadius: '6px',
            fontSize: '13px',
            transition: 'all 0.15s ease',
          }}
          title="Exit EduPye Academy & return to ERP"
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#EF4444';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#64748B';
          }}
        >
          <i className="fas fa-sign-out-alt" />
        </button>
      </div>
    </aside>
  );
};
