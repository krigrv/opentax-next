'use client';

import { useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Dynamically import tab components for better performance
const TaxCalculator = dynamic(() => import('./TaxCalculator'), {
  loading: () => <div className="p-6 text-center">Loading Tax Calculator...</div>,
});

const AIAssistant = dynamic(() => import('./AIAssistant'), {
  loading: () => <div className="p-6 text-center">Loading AI Assistant...</div>,
});

const DocumentManager = dynamic(() => import('./DocumentManager'), {
  loading: () => <div className="p-6 text-center">Loading Document Manager...</div>,
});

const UpdatesPanel = dynamic(() => import('./UpdatesPanel'), {
  loading: () => <div className="p-6 text-center">Loading Updates Panel...</div>,
});

const DashboardContent = () => {
  const { t } = useTranslation('common');
  const searchParams = useSearchParams();
  
  // Get the active tab from URL query parameter or default to 'calculator'
  const activeTab = searchParams.get('tab') || 'calculator';

  return (
    <div className="p-6">
      <Suspense fallback={<div className="p-6 text-center">{t('loading')}</div>}>
        {activeTab === 'calculator' && <TaxCalculator />}
        {activeTab === 'assistant' && <AIAssistant />}
        {activeTab === 'documents' && <DocumentManager />}
        {activeTab === 'updates' && <UpdatesPanel />}
      </Suspense>
    </div>
  );
};

export default DashboardContent;
