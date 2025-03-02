'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FiDollarSign, FiMessageSquare, FiFolder, FiBell } from 'react-icons/fi';
import TaxCalculator from '@/components/calculator/TaxCalculator';
import TaxAssistant from '@/components/assistant/TaxAssistant';
import DocumentManager from '@/components/documents/DocumentManager';
import RegulatoryUpdates from '@/components/updates/RegulatoryUpdates';

const Dashboard = () => {
  const { t } = useTranslation('common');
  const [activeTab, setActiveTab] = useState<'calculator' | 'assistant' | 'documents' | 'updates'>('calculator');

  const tabs = [
    {
      id: 'calculator',
      label: t('dashboard.tabs.taxCalculator'),
      icon: <FiDollarSign className="h-5 w-5" />,
      component: <TaxCalculator />,
    },
    {
      id: 'assistant',
      label: t('dashboard.tabs.aiAssistant'),
      icon: <FiMessageSquare className="h-5 w-5" />,
      component: <TaxAssistant />,
    },
    {
      id: 'documents',
      label: t('dashboard.tabs.documentManager'),
      icon: <FiFolder className="h-5 w-5" />,
      component: <DocumentManager />,
    },
    {
      id: 'updates',
      label: t('dashboard.tabs.updatesPanel'),
      icon: <FiBell className="h-5 w-5" />,
      component: <RegulatoryUpdates />,
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">{t('dashboard.title')}</h1>

      {/* Tabs */}
      <div className="flex flex-wrap border-b border-gray-200 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
              activeTab === tab.id
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Active Tab Content */}
      <div className="bg-white rounded-lg shadow">
        {tabs.find((tab) => tab.id === activeTab)?.component}
      </div>

      {/* External Resources */}
      <div className="mt-8 bg-indigo-50 p-4 rounded-lg">
        <h2 className="text-lg font-medium text-indigo-800 mb-2">
          Official Resources
        </h2>
        <p className="text-indigo-700 mb-3">
          For the most up-to-date and official tax information, please refer to these official Income Tax Department resources:
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <a
            href="https://www.incometax.gov.in/iec/foportal/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-white p-3 rounded border border-indigo-200 hover:border-indigo-400 transition-colors"
          >
            <h3 className="font-medium text-indigo-600 mb-1">Income Tax Portal</h3>
            <p className="text-sm text-gray-600">
              Official portal for all tax-related information, updates, and services.
            </p>
          </a>
          <a
            href="https://eportal.incometax.gov.in/iec/foservices/#/TaxCalc/calculator"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-white p-3 rounded border border-indigo-200 hover:border-indigo-400 transition-colors"
          >
            <h3 className="font-medium text-indigo-600 mb-1">Official Tax Calculator</h3>
            <p className="text-sm text-gray-600">
              Use the Income Tax Department's official calculator for precise tax calculations.
            </p>
          </a>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-6 text-sm text-gray-500">
        <p>{t('tax_disclaimer')}</p>
      </div>
    </div>
  );
};

export default Dashboard;
