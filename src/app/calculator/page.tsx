'use client';

import { FiDollarSign, FiInfo } from 'react-icons/fi';
import TaxCalculator from '@/components/calculator/TaxCalculator';

export default function CalculatorPage() {
  const { t } = useTranslation('common');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <FiDollarSign className="text-indigo-600" />
            {t('tax_calculator')}
          </h1>
          <p className="text-gray-600 mt-2">
            {t('tax_calculator_description')}
          </p>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-md p-4 flex items-start gap-3">
          <FiInfo className="text-amber-500 mt-1 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-amber-800">{t('disclaimer_title')}</h3>
            <p className="text-amber-700 text-sm mt-1">{t('tax_disclaimer')}</p>
          </div>
        </div>

        <TaxCalculator />

        <div className="mt-8 bg-gray-50 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">{t('tax_tips')}</h2>
          <ul className="space-y-3">
            <li className="flex items-start gap-2">
              <span className="bg-indigo-100 text-indigo-800 p-1 rounded-full flex-shrink-0">1</span>
              <span>{t('tax_tip_1')}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="bg-indigo-100 text-indigo-800 p-1 rounded-full flex-shrink-0">2</span>
              <span>{t('tax_tip_2')}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="bg-indigo-100 text-indigo-800 p-1 rounded-full flex-shrink-0">3</span>
              <span>{t('tax_tip_3')}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
