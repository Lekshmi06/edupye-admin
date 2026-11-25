export interface FeatureItem {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface HowItWorksStep {
  stepNumber: number;
  title: string;
  description: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface LandingPageContentData {
  announcementBanner: {
    enabled: boolean;
    text: string;
    linkText?: string;
    linkUrl?: string;
  };
  hero: {
    badgeText: string;
    title: string;
    subtitle: string;
    primaryCtaText: string;
    primaryCtaLink: string;
    secondaryCtaText: string;
    secondaryCtaLink: string;
    heroImageUrl?: string;
  };
  features: FeatureItem[];
  howItWorks: HowItWorksStep[];
  faqs: FaqItem[];
  footerContact: {
    tagline: string;
    supportEmail: string;
    supportPhone: string;
    address: string;
    copyrightText: string;
  };
  updatedBy?: string;
  updatedAt?: string;
}

export const DEFAULT_LANDING_CONTENT: LandingPageContentData = {
  announcementBanner: {
    enabled: true,
    text: "2026 Academic Term Tuition Mode is now active with SmartBoard live classes.",
    linkText: "Explore Tuition Mode",
    linkUrl: "/tuition-mode",
  },
  hero: {
    badgeText: "Intelligent Unified LMS & Campus Platform",
    title: "One platform. Every learning journey.",
    subtitle:
      "EduPye brings students, educators, campuses, and corporate training teams into one connected cloud ecosystem. Unifying adaptive AI tutoring, smart teacher studios, verified course marketplace, and campus ERP operations.",
    primaryCtaText: "Get Started Free",
    primaryCtaLink: "/signup",
    secondaryCtaText: "Sign In to Portal",
    secondaryCtaLink: "/login",
    heroImageUrl: "",
  },
  features: [
    {
      id: "ai-learning",
      title: "AI-Powered Learning Companion",
      description: "24/7 academic tutor trained specifically on official syllabi and competitive exam question banks with step-by-step proofs.",
      icon: "Brain",
    },
    {
      id: "smartboard",
      title: "Interactive Live SmartBoard Classroom",
      description: "Phase 4 WebRTC live classroom with split-screen multi-mode docks, real-time stylus annotations, and full-duplex video.",
      icon: "Tv",
    },
    {
      id: "course-marketplace",
      title: "Course Marketplace & Verified Credentials",
      description: "Curated academic masterclasses, competitive prep modules, and verified certification programs from top educators.",
      icon: "ShoppingBag",
    },
    {
      id: "tuition-mode",
      title: "Centralized Tuition Mode Ecosystem",
      description: "Permanent Student (STU-XXXXXX) & Teacher (TCH-XXXXXX) codes for scheduled 1:1 and cohort learning with auto-attendance.",
      icon: "GraduationCap",
    },
    {
      id: "campus-erp",
      title: "Campus & Institutional ERP Hub",
      description: "Multi-branch attendance, dynamic timetable management, automated fee collection, and comprehensive student rosters.",
      icon: "Building2",
    },
    {
      id: "compliance-recordings",
      title: "1-Year Compliance Classroom Archives",
      description: "Automated session recordings with participant attendance rosters preserved for a full 365 days of on-demand replay.",
      icon: "ShieldCheck",
    },
  ],
  howItWorks: [
    {
      stepNumber: 1,
      title: "Individuals Learn",
      description: "Personalized diagnostic baselines, adaptive study drills, 24/7 AI tutor guidance, and competitive exam cracker tools.",
    },
    {
      stepNumber: 2,
      title: "Educators Teach",
      description: "1-Click AI lesson blueprint generation, zero-lag cloud SmartBoard synchronization, and automated multi-format rubric grading.",
    },
    {
      stepNumber: 3,
      title: "Institutions Manage Operations",
      description: "Unified campus governance, faculty workloads, fee reconciliation, branch management, and verifiable credential issuance.",
    },
  ],
  faqs: [
    {
      id: "faq-1",
      question: "What is EduPye Tuition Mode?",
      answer: "EduPye Tuition Mode provides a distraction-free, scheduled virtual tuition classroom with permanent codes (STU-XXXXXX & TCH-XXXXXX), live interactive SmartBoard, and 1-year compliance replays.",
    },
    {
      id: "faq-2",
      question: "How does the AI Learning Companion work?",
      answer: "The AI companion is conditioned strictly on accredited textbooks, official syllabus boundaries, and verified question banks with rigid verification guardrails.",
    },
    {
      id: "faq-3",
      question: "Who can access Campus ERP governance?",
      answer: "Principals, institutional department heads, and verified educators access specialized ERP dashboards for attendance rosters, timetables, and fee collections.",
    },
  ],
  footerContact: {
    tagline: "EduPye is the unified LMS platform providing adaptive AI study companions for learners, smart instructional command for educators, and enterprise-grade ERP governance for institutions.",
    supportEmail: "support@edupye.com",
    supportPhone: "+1 (800) 555-0199",
    address: "Global Innovation Hub, Technology Campus",
    copyrightText: "© 2026 EduPye Global Inc. All rights reserved.",
  },
};

