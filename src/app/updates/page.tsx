'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FiBell, FiInfo } from 'react-icons/fi';
import RegulatoryUpdates from '@/components/updates/RegulatoryUpdates';
import { useUserPreferences } from '@/contexts/UserPreferencesContext';

export default function UpdatesPage() {
  const { t } = useTranslation('common');
  const { preferences } = useUserPreferences();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <FiBell className="text-indigo-600" />
            {t('regulatory_updates')}
          </h1>
          <p className="text-gray-600 mt-2">
            {t('regulatory_updates_description')}
          </p>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-md p-4 flex items-start gap-3">
          <FiInfo className="text-amber-500 mt-1 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-amber-800">{t('updates_disclaimer_title')}</h3>
            <p className="text-amber-700 text-sm mt-1">{t('updates_disclaimer')}</p>
          </div>
        </div>

        <div className="min-h-[600px]">
          <RegulatoryUpdates />
        </div>
      </div>
    </div>
  );
}
