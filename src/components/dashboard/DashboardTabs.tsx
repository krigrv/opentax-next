'use client';

import { useTranslation } from 'react-i18next';
import { FiMessageSquare, FiCalculator, FiFileText, FiRefreshCw } from 'react-icons/fi';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

const DashboardTabs = () => {
  const { t } = useTranslation('common');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // Get the active tab from URL query parameter or default to 'calculator'
  const activeTab = searchParams.get('tab') || 'calculator';

  // Tab configuration
  const tabs = [
    { id: 'calculator', label: t('dashboard.tabs.taxCalculator'), icon: <FiCalculator /> },
    { id: 'assistant', label: t('dashboard.tabs.aiAssistant'), icon: <FiMessageSquare /> },
    { id: 'documents', label: t('dashboard.tabs.documentManager'), icon: <FiFileText /> },
    { id: 'updates', label: t('dashboard.tabs.updatesPanel'), icon: <FiRefreshCw /> },
  ];

  const setActiveTab = (tabId: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('tab', tabId);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="border-b border-gray-200">
      <nav className="flex -mb-px overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              py-4 px-6 text-center border-b-2 font-medium text-sm flex items-center whitespace-nowrap
              ${activeTab === tab.id
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
            `}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default DashboardTabs;
