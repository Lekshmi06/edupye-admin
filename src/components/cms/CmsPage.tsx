import React, { useState } from 'react';
import { LandingContentEditor } from './LandingContentEditor';
import { type CmsTab } from './types';

export interface CmsPageProps {
  initialTab?: CmsTab;
}

export function CmsPage({ initialTab = 'hero' }: CmsPageProps = {}) {
  // Primary view is the modern No-Code Landing Page Content Studio
  return <LandingContentEditor />;
}

export default CmsPage;
