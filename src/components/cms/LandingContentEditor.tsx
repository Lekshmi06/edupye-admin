import React, { useState, useEffect } from 'react';
import { 
  type LandingPageContentData, 
  type FeatureItem, 
  type HowItWorksStep, 
  type FaqItem,
  DEFAULT_LANDING_CONTENT 
} from '../../types/landingCms';
import { cmsService } from '../../services/cms.service';
import { useToast } from '../../hooks/useToast';
import { Button } from '../common/Button';
import { ToggleSwitch } from '../common/ToggleSwitch';
import { Modal } from '../common/Modal';
import { Loader } from '../common/Loader';

const AVAILABLE_ICONS = [
  { id: 'Brain', label: 'Brain (AI & Cognition)', iconClass: 'fa-brain' },
  { id: 'Tv', label: 'Screen / TV (SmartBoard)', iconClass: 'fa-desktop' },
  { id: 'ShoppingBag', label: 'Shopping Bag (Marketplace)', iconClass: 'fa-shopping-bag' },
  { id: 'GraduationCap', label: 'Graduation Cap (Tuition)', iconClass: 'fa-graduation-cap' },
  { id: 'Building2', label: 'Building (Campus ERP)', iconClass: 'fa-building' },
  { id: 'ShieldCheck', label: 'Shield Check (Compliance)', iconClass: 'fa-shield-alt' },
  { id: 'Sparkles', label: 'Sparkles (Innovation)', iconClass: 'fa-magic' },
  { id: 'Layers', label: 'Layers (Curriculum)', iconClass: 'fa-layer-group' },
  { id: 'Video', label: 'Video (Classroom Stream)', iconClass: 'fa-video' },
  { id: 'BookOpen', label: 'Book Open (Syllabus/Docs)', iconClass: 'fa-book-open' },
];

export const LandingContentEditor: React.FC = () => {
  const { showToast } = useToast();
  const [content, setContent] = useState<LandingPageContentData>(DEFAULT_LANDING_CONTENT);
  const [loading, setLoading] = useState(true);
  const [fetchWarning, setFetchWarning] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [activeTab, setActiveTab] = useState<'announcement' | 'hero' | 'features' | 'howItWorks' | 'faqs' | 'footer'>('hero');
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewViewport, setPreviewViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  useEffect(() => {
    fetchContent();
  }, []);

  async function fetchContent() {
    setLoading(true);
    setFetchWarning(null);
    try {
      const data = await cmsService.getLandingContent();
      if (data && (data.hero || data.features)) {
        setContent(data);
      } else {
        setContent(DEFAULT_LANDING_CONTENT);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Could not reach backend API';
      setFetchWarning(msg);
      showToast('Could not reach backend API; loaded baseline EduPye defaults.', 'info');
      setContent((prev) => prev || DEFAULT_LANDING_CONTENT);
    } finally {
      setLoading(false);
    }
  }

  async function handlePublish() {
    if (!content) return;
    setSaving(true);
    try {
      const updated = await cmsService.saveLandingContent(content);
      setContent(updated);
      showToast('🎉 Landing page updated and published live! Changes are visible immediately on the public site.', 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Save failed';
      showToast(msg, 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleReset() {
    if (!window.confirm('Reset all landing page sections back to initial EduPye baseline defaults? Any unsaved edits will be lost.')) {
      return;
    }
    setResetting(true);
    try {
      const resetData = await cmsService.resetLandingContent();
      setContent(resetData);
      showToast('Baseline EduPye landing page defaults restored successfully.', 'info');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Reset failed';
      showToast(msg, 'error');
    } finally {
      setResetting(false);
    }
  }

  // Feature manipulation helpers
  function addFeature() {
    if (!content) return;
    const newId = `feat-${Date.now()}`;
    const newFeature: FeatureItem = {
      id: newId,
      title: 'New Platform Feature',
      description: 'Enter a concise description of this educational feature or tool capability.',
      icon: 'Sparkles',
    };
    setContent({
      ...content,
      features: [...content.features, newFeature],
    });
  }

  function removeFeature(index: number) {
    if (!content) return;
    const updated = [...content.features];
    updated.splice(index, 1);
    setContent({ ...content, features: updated });
  }

  function moveFeature(index: number, direction: 'up' | 'down') {
    if (!content) return;
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= content.features.length) return;
    const updated = [...content.features];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    setContent({ ...content, features: updated });
  }

  // How It Works manipulation helpers
  function addStep() {
    if (!content) return;
    const newStepNumber = content.howItWorks.length + 1;
    const newStep: HowItWorksStep = {
      stepNumber: newStepNumber,
      title: 'New Lifecycle Phase',
      description: 'Describe what occurs in this step of the EduPye learning or teaching cycle.',
    };
    setContent({
      ...content,
      howItWorks: [...content.howItWorks, newStep],
    });
  }

  function removeStep(index: number) {
    if (!content) return;
    const updated = [...content.howItWorks];
    updated.splice(index, 1);
    // Re-index steps
    const reindexed = updated.map((step, idx) => ({ ...step, stepNumber: idx + 1 }));
    setContent({ ...content, howItWorks: reindexed });
  }

  function moveStep(index: number, direction: 'up' | 'down') {
    if (!content) return;
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= content.howItWorks.length) return;
    const updated = [...content.howItWorks];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    const reindexed = updated.map((step, idx) => ({ ...step, stepNumber: idx + 1 }));
    setContent({ ...content, howItWorks: reindexed });
  }

  // FAQ manipulation helpers
  function addFaq() {
    if (!content) return;
    const newId = `faq-${Date.now()}`;
    const newFaq: FaqItem = {
      id: newId,
      question: 'Frequently Asked Question Title?',
      answer: 'Provide a clear, helpful answer that answers this question for prospective students or campus administrators.',
    };
    setContent({
      ...content,
      faqs: [...content.faqs, newFaq],
    });
  }

  function removeFaq(index: number) {
    if (!content) return;
    const updated = [...content.faqs];
    updated.splice(index, 1);
    setContent({ ...content, faqs: updated });
  }

  function moveFaq(index: number, direction: 'up' | 'down') {
    if (!content) return;
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= content.faqs.length) return;
    const updated = [...content.faqs];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    setContent({ ...content, faqs: updated });
  }

  if (loading) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center' }}>
        <Loader label="Connecting to EduPye Landing Page CMS & MongoDB..." />
      </div>
    );
  }

  const TABS: { id: typeof activeTab; label: string; icon: string; count?: number }[] = [
    { id: 'announcement', label: 'Announcement Bar', icon: 'fa-bullhorn' },
    { id: 'hero', label: 'Hero Headline & CTAs', icon: 'fa-star' },
    { id: 'features', label: 'Core Features', icon: 'fa-cubes', count: content.features.length },
    { id: 'howItWorks', label: 'How It Works', icon: 'fa-project-diagram', count: content.howItWorks.length },
    { id: 'faqs', label: 'FAQs Accordion', icon: 'fa-question-circle', count: content.faqs.length },
    { id: 'footer', label: 'Contact & Footer', icon: 'fa-phone-alt' },
  ];

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', paddingBottom: 60 }}>
      {/* Studio Banner Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
          marginBottom: 24,
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0369a1 100%)',
          color: '#fff',
          borderRadius: 16,
          padding: '24px 28px',
          boxShadow: '0 10px 25px rgba(2, 132, 199, 0.15)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: 'rgba(255, 255, 255, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 18,
              }}
            >
              <i className="fas fa-layer-group" />
            </div>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>
              Landing Page & Content Studio
            </h1>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                padding: '3px 10px',
                borderRadius: 20,
                background: '#10b981',
                color: '#fff',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
              }}
            >
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff' }} />
              Live Connected
            </span>
          </div>
          <p style={{ margin: 0, fontSize: 13, color: '#bae6fd', maxWidth: 640 }}>
            Visually manage headlines, announcement banners, key features, step-by-step guides, FAQs, and contact info rendered in real time on the public EduPye landing page.
          </p>
          {content.updatedAt && (
            <p style={{ margin: '6px 0 0', fontSize: 11, color: '#94a3b8' }}>
              Last saved: {new Date(content.updatedAt).toLocaleString()} {content.updatedBy ? `by ${content.updatedBy}` : ''}
            </p>
          )}
        </div>

        {/* Global Studio Action Buttons */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <Button
            type="button"
            variant="secondary"
            onClick={handleReset}
            disabled={resetting || saving}
            style={{
              fontSize: 13,
              fontWeight: 600,
              background: 'rgba(255, 255, 255, 0.1)',
              borderColor: 'rgba(255, 255, 255, 0.2)',
              color: '#fff',
            }}
          >
            {resetting ? (
              <>
                <i className="fas fa-spinner fa-spin" style={{ marginRight: 6 }} /> Resetting...
              </>
            ) : (
              <>
                <i className="fas fa-undo" style={{ marginRight: 6 }} /> Reset Defaults
              </>
            )}
          </Button>

          <Button
            type="button"
            variant="secondary"
            onClick={() => setShowPreviewModal(true)}
            style={{
              fontSize: 13,
              fontWeight: 600,
              background: '#0284c7',
              borderColor: '#0369a1',
              color: '#fff',
            }}
          >
            <i className="fas fa-eye" style={{ marginRight: 6 }} /> Live Preview
          </Button>

          <Button
            type="button"
            variant="primary"
            onClick={handlePublish}
            disabled={saving}
            style={{
              fontSize: 13,
              fontWeight: 700,
              padding: '10px 20px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              borderColor: '#059669',
              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)',
            }}
          >
            {saving ? (
              <>
                <i className="fas fa-spinner fa-spin" style={{ marginRight: 8 }} /> Publishing to Live Site...
              </>
            ) : (
              <>
                <i className="fas fa-cloud-upload-alt" style={{ marginRight: 8 }} /> Publish to Live Site
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Offline / Backend Fallback Warning Banner */}
      {fetchWarning && (
        <div
          style={{
            background: '#fffbeb',
            border: '1px solid #fde68a',
            color: '#92400e',
            borderRadius: 12,
            padding: '12px 18px',
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
            boxShadow: '0 2px 6px rgba(245, 158, 11, 0.08)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}>
            <span style={{ fontSize: 16 }}>⚠️</span>
            <div>
              <strong>Live backend sync notice:</strong> {fetchWarning}. Displaying baseline EduPye sections.
              You can still edit sections and preview locally; click <em>Retry Connection</em> or <em>Publish to Live Site</em> when connected.
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Button
              type="button"
              variant="secondary"
              onClick={fetchContent}
              style={{ fontSize: 12, padding: '5px 12px', background: '#fff', borderColor: '#fcd34d', color: '#92400e' }}
            >
              <i className="fas fa-sync-alt" style={{ marginRight: 5 }} /> Retry Connection
            </Button>
            <button
              type="button"
              onClick={() => setFetchWarning(null)}
              style={{ background: 'none', border: 'none', color: '#92400e', fontSize: 16, cursor: 'pointer', padding: '0 6px' }}
              title="Dismiss warning"
            >
              &times;
            </button>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          marginBottom: 20,
          overflowX: 'auto',
          paddingBottom: 4,
          borderBottom: '2px solid #e2e8f0',
        }}
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 18px',
                fontSize: 13,
                fontWeight: isActive ? 700 : 500,
                color: isActive ? '#0284c7' : '#64748b',
                background: isActive ? '#f0f9ff' : 'transparent',
                border: 'none',
                borderBottom: isActive ? '3px solid #0284c7' : '3px solid transparent',
                borderRadius: '8px 8px 0 0',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap',
              }}
            >
              <i className={`fas ${tab.icon}`} />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  style={{
                    fontSize: 11,
                    padding: '2px 7px',
                    borderRadius: 12,
                    background: isActive ? '#0284c7' : '#e2e8f0',
                    color: isActive ? '#fff' : '#64748b',
                    fontWeight: 700,
                  }}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: Announcement Bar */}
      {activeTab === 'announcement' && (
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', padding: 28, boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 4px', color: '#0f172a' }}>Top Announcement Banner</h2>
              <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>Displays an alert bar at the very top of the public landing page.</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: content.announcementBanner.enabled ? '#059669' : '#94a3b8' }}>
                {content.announcementBanner.enabled ? 'Enabled (Active)' : 'Disabled (Hidden)'}
              </span>
              <ToggleSwitch
                active={content.announcementBanner.enabled}
                onToggle={() =>
                  setContent({
                    ...content,
                    announcementBanner: {
                      ...content.announcementBanner,
                      enabled: !content.announcementBanner.enabled,
                    },
                  })
                }
                label="Toggle Announcement Bar"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#334155' }}>
                Banner Announcement Text <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                value={content.announcementBanner.text}
                onChange={(e) =>
                  setContent({
                    ...content,
                    announcementBanner: { ...content.announcementBanner, text: e.target.value },
                  })
                }
                placeholder="e.g. 2026 Academic Term Tuition Mode is now active with SmartBoard live classes."
                style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14 }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#334155' }}>
                  Button / Link Label (Optional)
                </label>
                <input
                  type="text"
                  value={content.announcementBanner.linkText || ''}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      announcementBanner: { ...content.announcementBanner, linkText: e.target.value },
                    })
                  }
                  placeholder="e.g. Explore Tuition Mode"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#334155' }}>
                  Target Link URL / Route (Optional)
                </label>
                <input
                  type="text"
                  value={content.announcementBanner.linkUrl || ''}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      announcementBanner: { ...content.announcementBanner, linkUrl: e.target.value },
                    })
                  }
                  placeholder="e.g. /tuition-mode"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14 }}
                />
              </div>
            </div>

            {/* Live Banner Preview Box */}
            <div style={{ marginTop: 12, padding: 14, borderRadius: 8, background: '#f8fafc', border: '1px dashed #cbd5e1' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 8 }}>
                Live In-Editor Preview:
              </div>
              {content.announcementBanner.enabled ? (
                <div style={{ background: 'linear-gradient(90deg, #1d4ed8, #4338ca, #1e40af)', color: '#fff', padding: '8px 16px', borderRadius: 6, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <span style={{ background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 700 }}>Announcement</span>
                  <span>{content.announcementBanner.text}</span>
                  {content.announcementBanner.linkUrl && (
                    <span style={{ textDecoration: 'underline', fontWeight: 600, color: '#a5f3fc', marginLeft: 4 }}>
                      {content.announcementBanner.linkText || 'Learn More'} &rarr;
                    </span>
                  )}
                </div>
              ) : (
                <div style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: 13 }}>Banner is currently disabled.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Hero Section */}
      {activeTab === 'hero' && (
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', padding: 28, boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
          <div style={{ marginBottom: 20 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 4px', color: '#0f172a' }}>Hero Headline & Call-to-Actions</h2>
            <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>This is the first section visitors see when loading EduPye.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 18 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#334155' }}>
                Pill Badge Tag (Eyebrow text above headline)
              </label>
              <input
                type="text"
                value={content.hero.badgeText}
                onChange={(e) => setContent({ ...content, hero: { ...content.hero, badgeText: e.target.value } })}
                placeholder="e.g. Intelligent Unified LMS & Campus Platform"
                style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14 }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#334155' }}>
                Main Headline Title <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                value={content.hero.title}
                onChange={(e) => setContent({ ...content, hero: { ...content.hero, title: e.target.value } })}
                placeholder="e.g. One platform. Every learning journey."
                style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14, fontWeight: 600 }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#334155' }}>
                Subheading / Value Proposition Text <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <textarea
                rows={3}
                value={content.hero.subtitle}
                onChange={(e) => setContent({ ...content, hero: { ...content.hero, subtitle: e.target.value } })}
                placeholder="Describe EduPye's unified ecosystem..."
                style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14, resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div style={{ background: '#f8fafc', padding: 16, borderRadius: 8, border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#0369a1', marginBottom: 10 }}>Primary Action Button</div>
                <div style={{ marginBottom: 10 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4, color: '#475569' }}>Button Label</label>
                  <input
                    type="text"
                    value={content.hero.primaryCtaText}
                    onChange={(e) => setContent({ ...content, hero: { ...content.hero, primaryCtaText: e.target.value } })}
                    placeholder="Get Started Free"
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13 }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4, color: '#475569' }}>Target Route / URL</label>
                  <input
                    type="text"
                    value={content.hero.primaryCtaLink}
                    onChange={(e) => setContent({ ...content, hero: { ...content.hero, primaryCtaLink: e.target.value } })}
                    placeholder="/signup"
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13 }}
                  />
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: 16, borderRadius: 8, border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#475569', marginBottom: 10 }}>Secondary Action Button</div>
                <div style={{ marginBottom: 10 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4, color: '#475569' }}>Button Label</label>
                  <input
                    type="text"
                    value={content.hero.secondaryCtaText}
                    onChange={(e) => setContent({ ...content, hero: { ...content.hero, secondaryCtaText: e.target.value } })}
                    placeholder="Sign In to Portal"
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13 }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4, color: '#475569' }}>Target Route / URL</label>
                  <input
                    type="text"
                    value={content.hero.secondaryCtaLink}
                    onChange={(e) => setContent({ ...content, hero: { ...content.hero, secondaryCtaLink: e.target.value } })}
                    placeholder="/login"
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13 }}
                  />
                </div>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#334155' }}>
                Hero Image / Graphic URL (Optional)
              </label>
              <input
                type="text"
                value={content.hero.heroImageUrl || ''}
                onChange={(e) => setContent({ ...content, hero: { ...content.hero, heroImageUrl: e.target.value } })}
                placeholder="https://... or empty for standard gradient illumination"
                style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14 }}
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Features */}
      {activeTab === 'features' && (
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', padding: 28, boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 4px', color: '#0f172a' }}>Platform Features ({content.features.length})</h2>
              <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>Add, reorder, or edit the high-impact feature cards showcased on the landing page.</p>
            </div>
            <Button type="button" variant="primary" onClick={addFeature} style={{ fontSize: 13, fontWeight: 600 }}>
              <i className="fas fa-plus" style={{ marginRight: 6 }} /> Add Feature Card
            </Button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
            {content.features.map((feature, idx) => (
              <div
                key={feature.id || idx}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: 10,
                  padding: 18,
                  position: 'relative',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 26, height: 26, borderRadius: '50%', background: '#0284c7', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>
                      {idx + 1}
                    </span>
                    <strong style={{ fontSize: 14, color: '#1e293b' }}>{feature.title || 'Untitled Feature'}</strong>
                  </div>

                  {/* Reorder and Delete Controls */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => moveFeature(idx, 'up')}
                      title="Move Up"
                      style={{ padding: '4px 8px', borderRadius: 4, border: '1px solid #cbd5e1', background: '#fff', cursor: idx === 0 ? 'not-allowed' : 'pointer', opacity: idx === 0 ? 0.4 : 1 }}
                    >
                      <i className="fas fa-arrow-up" style={{ fontSize: 11 }} />
                    </button>
                    <button
                      type="button"
                      disabled={idx === content.features.length - 1}
                      onClick={() => moveFeature(idx, 'down')}
                      title="Move Down"
                      style={{ padding: '4px 8px', borderRadius: 4, border: '1px solid #cbd5e1', background: '#fff', cursor: idx === content.features.length - 1 ? 'not-allowed' : 'pointer', opacity: idx === content.features.length - 1 ? 0.4 : 1 }}
                    >
                      <i className="fas fa-arrow-down" style={{ fontSize: 11 }} />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeFeature(idx)}
                      title="Delete Feature"
                      style={{ padding: '4px 8px', borderRadius: 4, border: '1px solid #fee2e2', background: '#fff', color: '#dc2626', cursor: 'pointer' }}
                    >
                      <i className="fas fa-trash-alt" style={{ fontSize: 11 }} />
                    </button>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 14, marginBottom: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4, color: '#475569' }}>Feature Title</label>
                    <input
                      type="text"
                      value={feature.title}
                      onChange={(e) => {
                        const updated = [...content.features];
                        updated[idx].title = e.target.value;
                        setContent({ ...content, features: updated });
                      }}
                      placeholder="e.g. AI-Powered Learning Companion"
                      style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13 }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4, color: '#475569' }}>Card Icon</label>
                    <select
                      value={feature.icon}
                      onChange={(e) => {
                        const updated = [...content.features];
                        updated[idx].icon = e.target.value;
                        setContent({ ...content, features: updated });
                      }}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13, background: '#fff' }}
                    >
                      {AVAILABLE_ICONS.map((opt) => (
                        <option key={opt.id} value={opt.id}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4, color: '#475569' }}>Feature Description</label>
                  <textarea
                    rows={2}
                    value={feature.description}
                    onChange={(e) => {
                      const updated = [...content.features];
                      updated[idx].description = e.target.value;
                      setContent({ ...content, features: updated });
                    }}
                    placeholder="Clear description of this feature..."
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13, resize: 'vertical' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: How It Works */}
      {activeTab === 'howItWorks' && (
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', padding: 28, boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 4px', color: '#0f172a' }}>How It Works Steps ({content.howItWorks.length})</h2>
              <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>Guides visitors through each stakeholder persona (Learners, Educators, Campuses).</p>
            </div>
            <Button type="button" variant="primary" onClick={addStep} style={{ fontSize: 13, fontWeight: 600 }}>
              <i className="fas fa-plus" style={{ marginRight: 6 }} /> Add Step
            </Button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
            {content.howItWorks.map((step, idx) => (
              <div
                key={idx}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: 10,
                  padding: 18,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 28, height: 28, borderRadius: '50%', background: '#6366f1', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800 }}>
                      0{step.stepNumber}
                    </span>
                    <strong style={{ fontSize: 14, color: '#1e293b' }}>{step.title || `Step ${step.stepNumber}`}</strong>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => moveStep(idx, 'up')}
                      title="Move Up"
                      style={{ padding: '4px 8px', borderRadius: 4, border: '1px solid #cbd5e1', background: '#fff', cursor: idx === 0 ? 'not-allowed' : 'pointer', opacity: idx === 0 ? 0.4 : 1 }}
                    >
                      <i className="fas fa-arrow-up" style={{ fontSize: 11 }} />
                    </button>
                    <button
                      type="button"
                      disabled={idx === content.howItWorks.length - 1}
                      onClick={() => moveStep(idx, 'down')}
                      title="Move Down"
                      style={{ padding: '4px 8px', borderRadius: 4, border: '1px solid #cbd5e1', background: '#fff', cursor: idx === content.howItWorks.length - 1 ? 'not-allowed' : 'pointer', opacity: idx === content.howItWorks.length - 1 ? 0.4 : 1 }}
                    >
                      <i className="fas fa-arrow-down" style={{ fontSize: 11 }} />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeStep(idx)}
                      title="Delete Step"
                      style={{ padding: '4px 8px', borderRadius: 4, border: '1px solid #fee2e2', background: '#fff', color: '#dc2626', cursor: 'pointer' }}
                    >
                      <i className="fas fa-trash-alt" style={{ fontSize: 11 }} />
                    </button>
                  </div>
                </div>

                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4, color: '#475569' }}>Step Title</label>
                  <input
                    type="text"
                    value={step.title}
                    onChange={(e) => {
                      const updated = [...content.howItWorks];
                      updated[idx].title = e.target.value;
                      setContent({ ...content, howItWorks: updated });
                    }}
                    placeholder="e.g. Individuals Learn"
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13 }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4, color: '#475569' }}>Step Description</label>
                  <textarea
                    rows={2}
                    value={step.description}
                    onChange={(e) => {
                      const updated = [...content.howItWorks];
                      updated[idx].description = e.target.value;
                      setContent({ ...content, howItWorks: updated });
                    }}
                    placeholder="Describe this step in the learning or governance workflow..."
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13, resize: 'vertical' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: FAQs */}
      {activeTab === 'faqs' && (
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', padding: 28, boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 4px', color: '#0f172a' }}>Frequently Asked Questions ({content.faqs.length})</h2>
              <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>Self-service answers to common questions about Tuition Mode, AI companions, and campus ERP.</p>
            </div>
            <Button type="button" variant="primary" onClick={addFaq} style={{ fontSize: 13, fontWeight: 600 }}>
              <i className="fas fa-plus" style={{ marginRight: 6 }} /> Add Question
            </Button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
            {content.faqs.map((faq, idx) => (
              <div
                key={faq.id || idx}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: 10,
                  padding: 18,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 24, height: 24, borderRadius: '50%', background: '#059669', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>
                      Q{idx + 1}
                    </span>
                    <strong style={{ fontSize: 14, color: '#1e293b' }}>{faq.question || 'Untitled Question'}</strong>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => moveFaq(idx, 'up')}
                      title="Move Up"
                      style={{ padding: '4px 8px', borderRadius: 4, border: '1px solid #cbd5e1', background: '#fff', cursor: idx === 0 ? 'not-allowed' : 'pointer', opacity: idx === 0 ? 0.4 : 1 }}
                    >
                      <i className="fas fa-arrow-up" style={{ fontSize: 11 }} />
                    </button>
                    <button
                      type="button"
                      disabled={idx === content.faqs.length - 1}
                      onClick={() => moveFaq(idx, 'down')}
                      title="Move Down"
                      style={{ padding: '4px 8px', borderRadius: 4, border: '1px solid #cbd5e1', background: '#fff', cursor: idx === content.faqs.length - 1 ? 'not-allowed' : 'pointer', opacity: idx === content.faqs.length - 1 ? 0.4 : 1 }}
                    >
                      <i className="fas fa-arrow-down" style={{ fontSize: 11 }} />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeFaq(idx)}
                      title="Delete Question"
                      style={{ padding: '4px 8px', borderRadius: 4, border: '1px solid #fee2e2', background: '#fff', color: '#dc2626', cursor: 'pointer' }}
                    >
                      <i className="fas fa-trash-alt" style={{ fontSize: 11 }} />
                    </button>
                  </div>
                </div>

                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4, color: '#475569' }}>Question Text</label>
                  <input
                    type="text"
                    value={faq.question}
                    onChange={(e) => {
                      const updated = [...content.faqs];
                      updated[idx].question = e.target.value;
                      setContent({ ...content, faqs: updated });
                    }}
                    placeholder="e.g. What is EduPye Tuition Mode?"
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13, fontWeight: 600 }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4, color: '#475569' }}>Answer</label>
                  <textarea
                    rows={3}
                    value={faq.answer}
                    onChange={(e) => {
                      const updated = [...content.faqs];
                      updated[idx].answer = e.target.value;
                      setContent({ ...content, faqs: updated });
                    }}
                    placeholder="Clear answer explaining platform policies or features..."
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13, resize: 'vertical' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: Footer & Contact */}
      {activeTab === 'footer' && (
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', padding: 28, boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
          <div style={{ marginBottom: 20 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 4px', color: '#0f172a' }}>Public Footer & Contact Information</h2>
            <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>Configures the brand description, institutional contact lines, and statutory copyright notice.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 18 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#334155' }}>
                Brand Tagline & Mission Subtext
              </label>
              <textarea
                rows={3}
                value={content.footerContact.tagline}
                onChange={(e) =>
                  setContent({
                    ...content,
                    footerContact: { ...content.footerContact, tagline: e.target.value },
                  })
                }
                placeholder="EduPye is the unified LMS platform providing adaptive AI study companions..."
                style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14 }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#334155' }}>
                  Support Email Address
                </label>
                <input
                  type="email"
                  value={content.footerContact.supportEmail}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      footerContact: { ...content.footerContact, supportEmail: e.target.value },
                    })
                  }
                  placeholder="support@edupye.com"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#334155' }}>
                  Support / Institutional Phone
                </label>
                <input
                  type="text"
                  value={content.footerContact.supportPhone}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      footerContact: { ...content.footerContact, supportPhone: e.target.value },
                    })
                  }
                  placeholder="+1 (800) 555-0199"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14 }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#334155' }}>
                  Campus Headquarters Address
                </label>
                <input
                  type="text"
                  value={content.footerContact.address}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      footerContact: { ...content.footerContact, address: e.target.value },
                    })
                  }
                  placeholder="Global Innovation Hub, Technology Campus"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#334155' }}>
                  Copyright Notice
                </label>
                <input
                  type="text"
                  value={content.footerContact.copyrightText}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      footerContact: { ...content.footerContact, copyrightText: e.target.value },
                    })
                  }
                  placeholder="© 2026 EduPye Global Inc. All rights reserved."
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14 }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Visual Live Preview Modal */}
      {showPreviewModal && (
        <Modal
          isOpen={showPreviewModal}
          onClose={() => setShowPreviewModal(false)}
          size="full"
          title={
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>Live Landing Page Preview</span>
                <span style={{ background: '#fef3c7', color: '#92400e', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 12 }}>
                  Unsaved Draft Preview
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginRight: 24 }}>
                <button
                  type="button"
                  onClick={() => setPreviewViewport('desktop')}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 6,
                    border: '1px solid #cbd5e1',
                    background: previewViewport === 'desktop' ? '#0284c7' : '#fff',
                    color: previewViewport === 'desktop' ? '#fff' : '#64748b',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  <i className="fas fa-desktop" style={{ marginRight: 4 }} /> Desktop
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewViewport('tablet')}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 6,
                    border: '1px solid #cbd5e1',
                    background: previewViewport === 'tablet' ? '#0284c7' : '#fff',
                    color: previewViewport === 'tablet' ? '#fff' : '#64748b',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  <i className="fas fa-tablet-alt" style={{ marginRight: 4 }} /> Tablet
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewViewport('mobile')}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 6,
                    border: '1px solid #cbd5e1',
                    background: previewViewport === 'mobile' ? '#0284c7' : '#fff',
                    color: previewViewport === 'mobile' ? '#fff' : '#64748b',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  <i className="fas fa-mobile-alt" style={{ marginRight: 4 }} /> Mobile
                </button>
              </div>
            </div>
          }
          footer={
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <span style={{ fontSize: 12, color: '#64748b' }}>
                Preview accurately simulates public styling and typography.
              </span>
              <div style={{ display: 'flex', gap: 10 }}>
                <Button variant="secondary" onClick={() => setShowPreviewModal(false)}>
                  Close Preview
                </Button>
                <Button
                  variant="primary"
                  onClick={async () => {
                    await handlePublish();
                    setShowPreviewModal(false);
                  }}
                  disabled={saving}
                >
                  {saving ? 'Publishing...' : 'Publish to Live Site Now'}
                </Button>
              </div>
            </div>
          }
        >
          <div
            style={{
              background: '#020617',
              color: '#f8fafc',
              fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
              borderRadius: 12,
              overflow: 'hidden',
              margin: '0 auto',
              maxWidth: previewViewport === 'desktop' ? '100%' : previewViewport === 'tablet' ? '768px' : '420px',
              border: previewViewport !== 'desktop' ? '8px solid #334155' : 'none',
              boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
              maxHeight: '75vh',
              overflowY: 'auto',
            }}
          >
            {/* Top Announcement Bar */}
            {content.announcementBanner.enabled && (
              <div
                style={{
                  background: 'linear-gradient(90deg, #1d4ed8, #4338ca, #1e40af)',
                  color: '#fff',
                  padding: '8px 16px',
                  fontSize: 12,
                  textAlign: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                <span style={{ background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: 12, fontSize: 10, fontWeight: 700 }}>
                  Announcement
                </span>
                <span>{content.announcementBanner.text}</span>
                {content.announcementBanner.linkUrl && (
                  <span style={{ textDecoration: 'underline', fontWeight: 600, color: '#a5f3fc' }}>
                    {content.announcementBanner.linkText || 'Learn More'} &rarr;
                  </span>
                )}
              </div>
            )}

            {/* Mock Landing Header Nav */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid #1e293b' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 18, fontWeight: 900, background: 'linear-gradient(90deg, #38bdf8, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  EduPye
                </span>
                <span style={{ fontSize: 10, background: '#1e293b', color: '#94a3b8', padding: '2px 6px', borderRadius: 4 }}>
                  v2.0
                </span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="button" style={{ background: 'transparent', border: '1px solid #334155', color: '#cbd5e1', padding: '6px 12px', borderRadius: 6, fontSize: 12 }}>
                  Sign In
                </button>
                <button type="button" style={{ background: '#2563eb', border: 'none', color: '#fff', padding: '6px 14px', borderRadius: 6, fontSize: 12, fontWeight: 600 }}>
                  Get Started
                </button>
              </div>
            </div>

            {/* Hero Section */}
            <div style={{ padding: '48px 24px 36px', textAlign: 'center', background: 'radial-gradient(ellipse at top, #1e293b 0%, #020617 70%)' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(30, 41, 59, 0.8)', border: '1px solid rgba(59, 130, 246, 0.3)', padding: '4px 14px', borderRadius: 20, fontSize: 12, color: '#38bdf8', marginBottom: 20 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#38bdf8' }} />
                <span>{content.hero.badgeText}</span>
              </div>
              <h1 style={{ fontSize: previewViewport === 'mobile' ? 26 : 42, fontWeight: 900, lineHeight: 1.15, margin: '0 0 16px', letterSpacing: '-0.02em', color: '#fff' }}>
                {content.hero.title}
              </h1>
              <p style={{ fontSize: 14, color: '#94a3b8', maxWidth: 640, margin: '0 auto 24px', lineHeight: 1.6 }}>
                {content.hero.subtitle}
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
                <button type="button" style={{ background: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)', color: '#fff', padding: '10px 22px', borderRadius: 8, fontWeight: 700, fontSize: 13, border: 'none', boxShadow: '0 4px 12px rgba(37,99,235,0.4)' }}>
                  {content.hero.primaryCtaText} &rarr;
                </button>
                <button type="button" style={{ background: '#0f172a', border: '1px solid #334155', color: '#cbd5e1', padding: '10px 20px', borderRadius: 8, fontWeight: 600, fontSize: 13 }}>
                  {content.hero.secondaryCtaText}
                </button>
              </div>
            </div>

            {/* Features Section */}
            <div style={{ padding: '36px 24px', background: '#090d16', borderTop: '1px solid #1e293b' }}>
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Platform Capabilities
                </span>
                <h2 style={{ fontSize: 22, fontWeight: 800, margin: '4px 0', color: '#fff' }}>Unified Learning Architecture</h2>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: previewViewport === 'mobile' ? '1fr' : 'repeat(2, 1fr)', gap: 14 }}>
                {content.features.map((feat, i) => (
                  <div key={i} style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 10, padding: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                      <span style={{ width: 32, height: 32, borderRadius: 8, background: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8', fontSize: 14 }}>
                        <i className={`fas ${AVAILABLE_ICONS.find((o) => o.id === feat.icon)?.iconClass || 'fa-star'}`} />
                      </span>
                      <strong style={{ fontSize: 14, color: '#f8fafc' }}>{feat.title}</strong>
                    </div>
                    <p style={{ margin: 0, fontSize: 12, color: '#94a3b8', lineHeight: 1.5 }}>{feat.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* How It Works Section */}
            <div style={{ padding: '36px 24px', background: '#020617', borderTop: '1px solid #1e293b' }}>
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#818cf8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Step-by-Step Ecosystem
                </span>
                <h2 style={{ fontSize: 22, fontWeight: 800, margin: '4px 0', color: '#fff' }}>How EduPye Connects Everyone</h2>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: previewViewport === 'mobile' ? '1fr' : `repeat(${Math.min(content.howItWorks.length, 3)}, 1fr)`, gap: 14 }}>
                {content.howItWorks.map((step, i) => (
                  <div key={i} style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 10, padding: 16 }}>
                    <div style={{ display: 'inline-block', width: 28, height: 28, borderRadius: '50%', background: '#4f46e5', color: '#fff', textAlign: 'center', lineHeight: '28px', fontSize: 12, fontWeight: 800, marginBottom: 10 }}>
                      0{step.stepNumber}
                    </div>
                    <h3 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 6px', color: '#f8fafc' }}>{step.title}</h3>
                    <p style={{ margin: 0, fontSize: 12, color: '#94a3b8', lineHeight: 1.5 }}>{step.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* FAQs Section */}
            <div style={{ padding: '36px 24px', background: '#090d16', borderTop: '1px solid #1e293b' }}>
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Self-Service Answers
                </span>
                <h2 style={{ fontSize: 22, fontWeight: 800, margin: '4px 0', color: '#fff' }}>Frequently Asked Questions</h2>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 10, maxWidth: 680, margin: '0 auto' }}>
                {content.faqs.map((faq, i) => (
                  <div key={i} style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8, padding: 14 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#f8fafc', marginBottom: 6 }}>
                      {faq.question}
                    </div>
                    <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.5 }}>
                      {faq.answer}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer Section */}
            <div style={{ padding: '28px 24px', background: '#020617', borderTop: '1px solid #1e293b', fontSize: 11, color: '#64748b' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#fff', marginBottom: 4 }}>EduPye</div>
                  <p style={{ margin: 0, maxWidth: 360, color: '#94a3b8', lineHeight: 1.5 }}>{content.footerContact.tagline}</p>
                </div>
                <div>
                  <div style={{ color: '#cbd5e1', fontWeight: 600, marginBottom: 4 }}>Contact Support</div>
                  <div>Email: {content.footerContact.supportEmail}</div>
                  <div>Phone: {content.footerContact.supportPhone}</div>
                  <div>HQ: {content.footerContact.address}</div>
                </div>
              </div>
              <div style={{ textAlign: 'center', borderTop: '1px solid #1e293b', paddingTop: 14 }}>
                {content.footerContact.copyrightText}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
