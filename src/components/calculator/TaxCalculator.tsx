'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useUserPreferences } from '@/contexts/UserPreferencesContext';

interface TaxInput {
  income: number;
  deductions: number;
  regime: 'old' | 'new';
}

interface TaxResult {
  taxableIncome: number;
  incomeTax: number;
  cess: number;
  surcharge: number;
  totalTax: number;
  effectiveRate: number;
}

const TaxCalculator = () => {
  const { t } = useTranslation('common');
  const { preferences, saveCalculation } = useUserPreferences();
  
  const [taxInput, setTaxInput] = useState<TaxInput>({
    income: 0,
    deductions: 0,
    regime: 'new',
  });
  
  const [result, setResult] = useState<TaxResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTaxInput((prev) => ({
      ...prev,
      [name]: name === 'regime' ? value : parseFloat(value) || 0,
    }));
  };

  const handleRegimeChange = (regime: 'old' | 'new') => {
    setTaxInput((prev) => ({ ...prev, regime }));
  };

  const calculateTax = () => {
    setIsCalculating(true);
    
    // Simple tax calculation for demonstration
    // In a real app, this would be more complex and accurate
    setTimeout(() => {
      const { income, deductions, regime } = taxInput;
      const taxableIncome = Math.max(0, income - (regime === 'old' ? deductions : 0));
      
      let incomeTax = 0;
      
      if (regime === 'old') {
        // Old regime calculation (simplified)
        if (taxableIncome <= 250000) {
          incomeTax = 0;
        } else if (taxableIncome <= 500000) {
          incomeTax = (taxableIncome - 250000) * 0.05;
        } else if (taxableIncome <= 1000000) {
          incomeTax = 12500 + (taxableIncome - 500000) * 0.2;
        } else {
          incomeTax = 112500 + (taxableIncome - 1000000) * 0.3;
        }
      } else {
        // New regime calculation (simplified)
        if (taxableIncome <= 300000) {
          incomeTax = 0;
        } else if (taxableIncome <= 600000) {
          incomeTax = (taxableIncome - 300000) * 0.05;
        } else if (taxableIncome <= 900000) {
          incomeTax = 15000 + (taxableIncome - 600000) * 0.1;
        } else if (taxableIncome <= 1200000) {
          incomeTax = 45000 + (taxableIncome - 900000) * 0.15;
        } else if (taxableIncome <= 1500000) {
          incomeTax = 90000 + (taxableIncome - 1200000) * 0.2;
        } else {
          incomeTax = 150000 + (taxableIncome - 1500000) * 0.3;
        }
      }
      
      // Calculate cess and surcharge
      const cess = incomeTax * 0.04;
      
      let surcharge = 0;
      if (taxableIncome > 5000000 && taxableIncome <= 10000000) {
        surcharge = incomeTax * 0.1;
      } else if (taxableIncome > 10000000 && taxableIncome <= 20000000) {
        surcharge = incomeTax * 0.15;
      } else if (taxableIncome > 20000000 && taxableIncome <= 50000000) {
        surcharge = incomeTax * 0.25;
      } else if (taxableIncome > 50000000) {
        surcharge = incomeTax * 0.37;
      }
      
      const totalTax = incomeTax + cess + surcharge;
      const effectiveRate = taxableIncome > 0 ? (totalTax / taxableIncome) * 100 : 0;
      
      const taxResult = {
        taxableIncome,
        incomeTax,
        cess,
        surcharge,
        totalTax,
        effectiveRate,
      };
      
      setResult(taxResult);
      saveCalculation(taxResult); // Save to local storage via UserPreferencesContext
      setIsCalculating(false);
    }, 500); // Simulate calculation time
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        {t('tax_calculator')} ({preferences.taxYear}-{parseInt(preferences.taxYear) + 1})
      </h2>
      
      <div className="space-y-6">
        <div>
          <label htmlFor="income" className="block text-sm font-medium text-gray-700 mb-1">
            {t('total_income')}
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">₹</span>
            </div>
            <input
              type="number"
              name="income"
              id="income"
              value={taxInput.income || ''}
              onChange={handleInputChange}
              className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
              placeholder="0"
            />
          </div>
        </div>
        
        <div>
          <label htmlFor="deductions" className="block text-sm font-medium text-gray-700 mb-1">
            {t('total_deductions')} {taxInput.regime === 'new' && <span className="text-gray-400">({t('not_applicable_in_new_regime')})</span>}
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">₹</span>
            </div>
            <input
              type="number"
              name="deductions"
              id="deductions"
              value={taxInput.deductions || ''}
              onChange={handleInputChange}
              className={`focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md ${
                taxInput.regime === 'new' ? 'bg-gray-100' : ''
              }`}
              placeholder="0"
              disabled={taxInput.regime === 'new'}
            />
          </div>
          {taxInput.regime === 'old' && (
            <p className="mt-1 text-xs text-gray-500">
              {t('includes_80c_80d_hra')}
            </p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('tax_regime')}
          </label>
          <div className="flex space-x-4">
            <div 
              onClick={() => handleRegimeChange('old')}
              className={`flex-1 p-4 border rounded-md cursor-pointer ${
                taxInput.regime === 'old' 
                  ? 'border-indigo-500 bg-indigo-50' 
                  : 'border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="font-medium">{t('old_regime')}</div>
              <div className="text-sm text-gray-500 mt-1">{t('with_deductions')}</div>
            </div>
            <div 
              onClick={() => handleRegimeChange('new')}
              className={`flex-1 p-4 border rounded-md cursor-pointer ${
                taxInput.regime === 'new' 
                  ? 'border-indigo-500 bg-indigo-50' 
                  : 'border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="font-medium">{t('new_regime')}</div>
              <div className="text-sm text-gray-500 mt-1">{t('lower_tax_rates')}</div>
            </div>
          </div>
        </div>
        
        <div>
          <button
            type="button"
            onClick={calculateTax}
            disabled={isCalculating || taxInput.income <= 0}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isCalculating ? t('calculating') : t('calculate_tax')}
          </button>
        </div>
      </div>
      
      {result && (
        <div className="mt-8 border-t pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">{t('tax_calculation_results')}</h3>
          
          <div className="bg-gray-50 p-4 rounded-md">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-500">{t('taxable_income')}</div>
                <div className="text-lg font-medium">{formatCurrency(result.taxableIncome)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">{t('income_tax')}</div>
                <div className="text-lg font-medium">{formatCurrency(result.incomeTax)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">{t('cess')}</div>
                <div className="text-lg font-medium">{formatCurrency(result.cess)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">{t('surcharge')}</div>
                <div className="text-lg font-medium">{formatCurrency(result.surcharge)}</div>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <div className="text-base font-medium text-gray-900">{t('total_tax_liability')}</div>
                <div className="text-xl font-bold text-indigo-600">{formatCurrency(result.totalTax)}</div>
              </div>
              <div className="flex justify-between items-center mt-1">
                <div className="text-sm text-gray-500">{t('effective_tax_rate')}</div>
                <div className="text-sm font-medium">{result.effectiveRate.toFixed(2)}%</div>
              </div>
            </div>
          </div>
          
          <div className="mt-4 text-sm text-gray-500">
            <p>{t('tax_disclaimer')}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaxCalculator;
