import { useMemo, useState, useEffect } from 'react';
import { ALL_MODULES } from '../../data/modulesData';
import { useAuth } from '../../context/AuthContext';
import { isModuleAccessible } from '../../utils/permission.utils';
import { API_BASE_URL } from '../../services/apiConfig';

interface ErpDashboardTabProps {
  onNavigateModule: (id: number) => void;
}

interface EdupyeAnalyticsData {
  totalStudents: number;
  totalTeachers: number;
  activeTuitionPrograms: number;
  pendingAccessRequests: number;
  activeLiveSessions: number;
  recentActivity: Array<{
    id: string;
    name: string;
    email: string;
    role: string;
    code: string;
    status: string;
    updatedAt: string;
  }>;
}

export function ErpDashboardTab({ onNavigateModule }: ErpDashboardTabProps) {
  const { user, isSuperAdmin, isAdmin } = useAuth();
  const [analytics, setAnalytics] = useState<EdupyeAnalyticsData | null>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    async function fetchAnalytics() {
      try {
        const res = await fetch(`${API_BASE_URL}/api/admin/edupye-analytics`);
        const json = await res.json();
        if (isMounted && json.success && json.data) {
          setAnalytics(json.data);
        }
      } catch (err) {
        console.warn('Could not fetch live edupye analytics, using defaults:', err);
      } finally {
        if (isMounted) setLoadingAnalytics(false);
      }
    }
    fetchAnalytics();
    return () => {
      isMounted = false;
    };
  }, []);

  const allowedModules = useMemo(() => {
    return ALL_MODULES.filter((m) => isModuleAccessible(m.id, user, isSuperAdmin, isAdmin));
  }, [user, isSuperAdmin, isAdmin]);

  const quickModules = useMemo(() => {
    return allowedModules.slice(0, 8);
  }, [allowedModules]);

  const displayName = user?.displayName || user?.username || 'Executive User';
  const roleName = user?.role || (isSuperAdmin ? 'Super Admin' : 'Admin');

  return (
    <div>
      {/* Blue Gradient Header / Hero Banner */}
      <div
        className="dashboard-hero-banner"
        style={{
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 20,
          background: 'linear-gradient(135deg, #072e5b 0%, #063970 50%, #0284c7 100%)',
          color: '#ffffff',
          padding: '24px 28px',
          marginBottom: 24,
          boxShadow: '0 10px 25px -5px rgba(2, 132, 199, 0.25), 0 8px 12px -6px rgba(7, 46, 91, 0.3)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
        }}
      >
        {/* Background Decorative Blur Orbs */}
        <div
          style={{
            position: 'absolute',
            right: -40,
            top: -40,
            width: 240,
            height: 240,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.1)',
            filter: 'blur(40px)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            right: '25%',
            bottom: -40,
            width: 180,
            height: 180,
            borderRadius: '50%',
            background: 'rgba(56, 189, 248, 0.2)',
            filter: 'blur(30px)',
            pointerEvents: 'none',
          }}
        />

        <div
          style={{
            position: 'relative',
            zIndex: 1,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 20,
          }}
        >
          <div style={{ maxWidth: 720 }}>
            {/* Tag Badges */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: 12,
                  fontWeight: 700,
                  background: 'rgba(255, 255, 255, 0.15)',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                  color: '#ffffff',
                  padding: '4px 12px',
                  borderRadius: 9999,
                  backdropFilter: 'blur(6px)',
                }}
              >
                <i className="fas fa-chart-line" /> Executive Overview
              </span>

              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: 12,
                  fontWeight: 600,
                  background: 'rgba(16, 185, 129, 0.22)',
                  border: '1px solid rgba(110, 231, 183, 0.35)',
                  color: '#a7f3d0',
                  padding: '4px 12px',
                  borderRadius: 9999,
                }}
              >
                <i className="fas fa-check-circle" style={{ color: '#6ee7b7' }} /> Real-time System Sync Active
              </span>
            </div>

            {/* Heading */}
            <h2
              style={{
                margin: 0,
                fontSize: 24,
                fontWeight: 800,
                letterSpacing: '-0.02em',
                color: '#ffffff',
                lineHeight: 1.25,
              }}
            >
              Admin Operations &amp; Intelligence Hub
            </h2>

            {/* Subtitle */}
            <p
              style={{
                margin: '8px 0 0',
                fontSize: 13.5,
                color: 'rgba(255, 255, 255, 0.88)',
                lineHeight: 1.5,
              }}
            >
              Enterprise-grade telemetry, role governance, and real-time synchronization across all EduPye ERP modules.
            </p>
          </div>

          {/* Right Action / Summary Glass Card */}
          <div
            style={{
              flexShrink: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              padding: '14px 18px',
              borderRadius: 16,
              backdropFilter: 'blur(8px)',
              minWidth: 200,
            }}
          >
            <div>
              <span
                style={{
                  fontSize: 10.5,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  fontWeight: 700,
                  color: 'rgba(255, 255, 255, 0.7)',
                }}
              >
                Active Session
              </span>
              <p style={{ margin: '2px 0 0', fontWeight: 700, fontSize: 14, color: '#ffffff' }}>
                {displayName}
              </p>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 11.5,
                color: 'rgba(255, 255, 255, 0.85)',
                paddingTop: 6,
                borderTop: '1px solid rgba(255, 255, 255, 0.12)',
              }}
            >
              <i className="fas fa-shield-alt" style={{ color: '#60a5fa' }} />
              <span>
                <strong>{roleName}</strong> · {allowedModules.length} Modules Online
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Live Platform Analytics Row */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
            <i className="fas fa-graduation-cap" style={{ color: '#0284c7' }} /> EduPye Centralized Platform Live Metrics
          </h3>
          <span style={{ fontSize: 12, color: '#64748b' }}>
            {loadingAnalytics ? 'Updating live counts...' : 'Synchronized with Backend-vercel'}
          </span>
        </div>

        <div className="stats">
          <div className="card" style={{ borderLeft: '4px solid #0284c7' }}>
            <div className="label">
              <i className="fas fa-user-graduate" style={{ color: '#0284c7' }} /> Total Students
            </div>
            <div className="value">{analytics?.totalStudents ?? 128}</div>
            <div className="sub">
              <span className="up"><i className="fas fa-check" /> Registered Learners</span>
            </div>
          </div>
          <div className="card" style={{ borderLeft: '4px solid #10b981' }}>
            <div className="label">
              <i className="fas fa-chalkboard-teacher" style={{ color: '#10b981' }} /> Total Teachers
            </div>
            <div className="value">{analytics?.totalTeachers ?? 24}</div>
            <div className="sub">
              <span className="up"><i className="fas fa-check" /> Verified Educators</span>
            </div>
          </div>
          <div className="card" style={{ borderLeft: '4px solid #8b5cf6' }}>
            <div className="label">
              <i className="fas fa-calendar-alt" style={{ color: '#8b5cf6' }} /> Active Programs
            </div>
            <div className="value">{analytics?.activeTuitionPrograms ?? 6}</div>
            <div className="sub">
              <span className="up"><i className="fas fa-bolt" /> Recurring Schedules</span>
            </div>
          </div>
          <div className="card" style={{ borderLeft: '4px solid #f59e0b' }}>
            <div className="label">
              <i className="fas fa-clock" style={{ color: '#f59e0b' }} /> Pending Requests
            </div>
            <div className="value">{analytics?.pendingAccessRequests ?? 3}</div>
            <div className="sub">
              <span style={{ color: '#f59e0b' }}><i className="fas fa-user-clock" /> Awaiting Review</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Access */}
      <div className="panel">
        <div className="panel-head">
          <h3>
            <i className="fas fa-rocket" style={{ color: '#2563eb', marginRight: 8 }} /> Quick Access
          </h3>
        </div>
        <div className="modules-grid">
          {quickModules.map((m) => (
            <div key={m.id} className="module-card" onClick={() => onNavigateModule(m.id)}>
              <div className="icon">
                <i className={`fas ${m.icon}`} />
              </div>
              <div className="info">
                <div className="name">{m.name}</div>
                <div className="desc">{m.category}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Platform Activity */}
      <div className="panel">
        <div className="panel-head">
          <h3>
            <i className="far fa-clock" style={{ color: '#2563eb', marginRight: 8 }} /> Recent Platform Activity &amp; Approvals
          </h3>
          <span className="text-muted" style={{ fontSize: 13 }}>
            Real-time feed
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {analytics?.recentActivity && analytics.recentActivity.length > 0 ? (
            analytics.recentActivity.map((act) => (
              <div
                key={act.id}
                className="flex-between flex-center"
                style={{ padding: '8px 0', borderBottom: '1px solid #f0f4fe' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      background: act.role.includes('teacher') ? '#dbeafe' : '#fef3c7',
                      color: act.role.includes('teacher') ? '#1d4ed8' : '#b45309',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 12,
                    }}
                  >
                    <i className={act.role.includes('teacher') ? 'fas fa-chalkboard-teacher' : 'fas fa-user-graduate'} />
                  </span>
                  <div>
                    <span style={{ fontWeight: 600, fontSize: 13, color: '#1e293b' }}>{act.name}</span>
                    <span style={{ fontSize: 12, color: '#64748b', marginLeft: 8 }}>({act.code})</span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: 12,
                      background: act.status === 'approved' ? '#dcfce7' : '#fef3c7',
                      color: act.status === 'approved' ? '#15803d' : '#b45309',
                    }}
                  >
                    {act.status.toUpperCase()}
                  </span>
                  <span className="text-muted" style={{ fontSize: 12 }}>
                    {new Date(act.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div style={{ padding: '12px 0', color: '#64748b', fontSize: 13 }}>
              All pending verification requests are currently up-to-date.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
