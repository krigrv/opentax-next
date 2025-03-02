'use client';

import { useTranslation } from 'react-i18next';
import { FiDownload, FiPieChart } from 'react-icons/fi';
import { useState } from 'react';

interface TaxBreakdownProps {
  result: {
    totalIncome: number;
    taxableIncome: number;
    taxBreakdown: Array<{
      slabStart: number;
      slabEnd: number;
      rate: number;
      taxableAmount: number;
      tax: number;
    }>;
    basicTax: number;
    cess: number;
    totalTax: number;
    effectiveRate: number;
  };
}

const TaxBreakdown = ({ result }: TaxBreakdownProps) => {
  const { t } = useTranslation('taxCalculator');
  const [showDetails, setShowDetails] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatRate = (rate: number) => {
    return `${rate.toFixed(1)}%`;
  };

  const downloadPDF = () => {
    // In a real application, this would generate a PDF with the tax breakdown
    alert(t('breakdown.pdfNotImplemented'));
  };

  return (
    <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-gray-800">
          {t('breakdown.title')}
        </h3>
        <button
          onClick={downloadPDF}
          className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <FiDownload className="mr-1" />
          {t('breakdown.download')}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Summary Card */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h4 className="text-lg font-medium mb-3 text-gray-700">
            {t('breakdown.summary')}
          </h4>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">{t('breakdown.totalIncome')}</span>
              <span className="font-medium">{formatCurrency(result.totalIncome)}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">{t('breakdown.taxableIncome')}</span>
              <span className="font-medium">{formatCurrency(result.taxableIncome)}</span>
            </div>
            
            <div className="border-t border-gray-200 my-2 pt-2">
              <div className="flex justify-between">
                <span className="text-gray-600">{t('breakdown.basicTax')}</span>
                <span className="font-medium">{formatCurrency(result.basicTax)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">{t('breakdown.cess')}</span>
                <span className="font-medium">{formatCurrency(result.cess)}</span>
              </div>
            </div>
            
            <div className="border-t border-gray-200 my-2 pt-2">
              <div className="flex justify-between text-lg">
                <span className="font-semibold text-gray-800">{t('breakdown.totalTax')}</span>
                <span className="font-bold text-primary-700">{formatCurrency(result.totalTax)}</span>
              </div>
              
              <div className="flex justify-between text-sm mt-1">
                <span className="text-gray-600">{t('breakdown.effectiveRate')}</span>
                <span className="font-medium">{formatRate(result.effectiveRate)}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Visualization Card */}
        <div className="bg-white p-4 rounded-lg shadow-sm flex flex-col">
          <h4 className="text-lg font-medium mb-3 text-gray-700">
            {t('breakdown.visualization')}
          </h4>
          
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <FiPieChart className="mx-auto h-24 w-24 text-gray-300" />
              <p className="text-gray-500 mt-2">
                {t('breakdown.visualizationComingSoon')}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Detailed Breakdown */}
      <div className="mt-6">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-primary-600 hover:text-primary-800 font-medium flex items-center"
        >
          {showDetails ? t('breakdown.hideDetails') : t('breakdown.showDetails')}
        </button>
        
        {showDetails && (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('breakdown.table.slabRange')}
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('breakdown.table.rate')}
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('breakdown.table.taxableAmount')}
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('breakdown.table.tax')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {result.taxBreakdown.map((slab, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600">
                      {slab.slabEnd === Infinity 
                        ? `${formatCurrency(slab.slabStart)} +` 
                        : `${formatCurrency(slab.slabStart)} - ${formatCurrency(slab.slabEnd)}`}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600">
                      {formatRate(slab.rate)}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600">
                      {formatCurrency(slab.taxableAmount)}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-700">
                      {formatCurrency(slab.tax)}
                    </td>
                  </tr>
                ))}
                <tr className="bg-gray-50">
                  <td colSpan={3} className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-700 text-right">
                    {t('breakdown.table.basicTax')}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-700">
                    {formatCurrency(result.basicTax)}
                  </td>
                </tr>
                <tr className="bg-gray-50">
                  <td colSpan={3} className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-700 text-right">
                    {t('breakdown.table.cess')} (4%)
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-700">
                    {formatCurrency(result.cess)}
                  </td>
                </tr>
                <tr className="bg-primary-50">
                  <td colSpan={3} className="px-4 py-2 whitespace-nowrap text-sm font-bold text-gray-800 text-right">
                    {t('breakdown.table.totalTax')}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm font-bold text-primary-700">
                    {formatCurrency(result.totalTax)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaxBreakdown;
