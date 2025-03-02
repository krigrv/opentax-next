'use client';

import { useTranslation } from 'react-i18next';
import { FiInfo, FiUsers, FiTarget, FiHeart } from 'react-icons/fi';

export default function AboutPage() {
  const { t } = useTranslation('common');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <FiInfo className="text-indigo-600" />
            {t('about')} OpenTax
          </h1>
          <p className="text-gray-600 mt-2">
            {t('about_description')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <FiTarget className="text-indigo-600 text-xl" />
              <h2 className="text-xl font-semibold text-gray-800">{t('our_mission')}</h2>
            </div>
            <p className="text-gray-600">
              {t('mission_description')}
            </p>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <FiUsers className="text-indigo-600 text-xl" />
              <h2 className="text-xl font-semibold text-gray-800">{t('our_team')}</h2>
            </div>
            <p className="text-gray-600">
              {t('team_description')}
            </p>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <FiHeart className="text-indigo-600 text-xl" />
            <h2 className="text-xl font-semibold text-gray-800">{t('our_values')}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-800 mb-2">{t('value_transparency')}</h3>
              <p className="text-gray-600 text-sm">{t('value_transparency_description')}</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-800 mb-2">{t('value_accessibility')}</h3>
              <p className="text-gray-600 text-sm">{t('value_accessibility_description')}</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-800 mb-2">{t('value_innovation')}</h3>
              <p className="text-gray-600 text-sm">{t('value_innovation_description')}</p>
            </div>
          </div>
        </div>

        <div className="bg-indigo-50 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-indigo-800 mb-4">{t('open_source')}</h2>
          <p className="text-indigo-700 mb-4">
            {t('open_source_description')}
          </p>
          <div className="flex gap-4">
            <a 
              href="https://github.com/yourusername/opentax-next" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
            >
              {t('view_on_github')}
            </a>
            <a 
              href="#contribute" 
              className="bg-white text-indigo-600 border border-indigo-600 px-4 py-2 rounded-md hover:bg-indigo-50 transition-colors"
            >
              {t('how_to_contribute')}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
