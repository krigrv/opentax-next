'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FiPlusCircle, FiMinusCircle } from 'react-icons/fi';
import InfoTooltip from '../common/InfoTooltip';
import TaxBreakdown from './TaxBreakdown';

// Types
interface DeductionItem {
  id: number;
  type: string;
  amount: string;
  description: string;
}

interface FormFields {
  salary: string;
  otherIncome: string;
  age: string;
  regime: string;
}

interface TaxResult {
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
}

const TaxCalculator = () => {
  const { t } = useTranslation('taxCalculator');
  
  const [fields, setFields] = useState<FormFields>({
    salary: '',
    otherIncome: '',
    age: '30',
    regime: 'new',
  });

  const [deductions, setDeductions] = useState<DeductionItem[]>([
    { id: 1, type: '80C', amount: '', description: '' },
  ]);
  
  const [taxResult, setTaxResult] = useState<TaxResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFields(prev => ({ ...prev, [name]: value }));
  };

  const resetFields = () => {
    setFields({
      salary: '',
      otherIncome: '',
      age: '30',
      regime: 'new',
    });
    setDeductions([{ id: 1, type: '80C', amount: '', description: '' }]);
    setTaxResult(null);
  };

  const addDeduction = () => {
    const newId = deductions.length > 0 
      ? Math.max(...deductions.map(d => d.id)) + 1 
      : 1;
      
    setDeductions([...deductions, { 
      id: newId, 
      type: '80C', 
      amount: '', 
      description: '' 
    }]);
  };

  const removeDeduction = (id: number) => {
    setDeductions(deductions.filter(d => d.id !== id));
  };

  const handleDeductionChange = (id: number, field: string, value: string) => {
    setDeductions(deductions.map(d => 
      d.id === id ? { ...d, [field]: value } : d
    ));
  };

  const calculateTotalDeductions = () => {
    return deductions.reduce((total, d) => {
      const amount = parseFloat(d.amount) || 0;
      return total + amount;
    }, 0);
  };

  const calculateTaxDirectly = () => {
    setLoading(true);
    setError(null);

    try {
      const salary = parseFloat(fields.salary) || 0;
      const otherIncome = parseFloat(fields.otherIncome) || 0;
      const totalDeductions = calculateTotalDeductions();
      const age = parseInt(fields.age);
      const regime = fields.regime;

      const totalIncome = salary + otherIncome;
      let taxableIncome = totalIncome;
      
      // Tax slabs for new regime (FY 2023-24)
      const newRegimeSlabs = [
        { limit: 300000, rate: 0 },
        { limit: 600000, rate: 0.05 },
        { limit: 900000, rate: 0.10 },
        { limit: 1200000, rate: 0.15 },
        { limit: 1500000, rate: 0.20 },
        { limit: Infinity, rate: 0.30 }
      ];

      // Tax slabs for old regime (FY 2023-24)
      const oldRegimeSlabs = [
        { limit: 250000, rate: 0 },
        { limit: 500000, rate: 0.05 },
        { limit: 1000000, rate: 0.20 },
        { limit: Infinity, rate: 0.30 }
      ];

      // Senior citizen limits for old regime
      const seniorCitizenLimit = 300000;
      const superSeniorCitizenLimit = 500000;
      
      let slabs = regime === 'new' ? newRegimeSlabs : oldRegimeSlabs;
      
      // Apply deductions for old regime
      if (regime === 'old') {
        taxableIncome = Math.max(0, totalIncome - totalDeductions);
        
        // Adjust exemption limit for senior citizens in old regime
        if (age >= 60 && age < 80) {
          slabs = [
            { limit: seniorCitizenLimit, rate: 0 },
            ...oldRegimeSlabs.slice(1)
          ];
        } else if (age >= 80) {
          slabs = [
            { limit: superSeniorCitizenLimit, rate: 0 },
            ...oldRegimeSlabs.slice(2)
          ];
        }
      }

      // Calculate tax based on slabs
      let tax = 0;
      let remainingIncome = taxableIncome;
      const taxBreakdown = [];

      for (let i = 0; i < slabs.length; i++) {
        const currentSlab = slabs[i];
        const prevLimit = i > 0 ? slabs[i-1].limit : 0;
        const slabWidth = currentSlab.limit - prevLimit;
        
        const taxableInThisSlab = Math.min(remainingIncome, slabWidth);
        const taxForThisSlab = taxableInThisSlab * currentSlab.rate;
        
        if (taxableInThisSlab > 0) {
          taxBreakdown.push({
            slabStart: prevLimit,
            slabEnd: currentSlab.limit,
            rate: currentSlab.rate * 100,
            taxableAmount: taxableInThisSlab,
            tax: taxForThisSlab
          });
        }
        
        tax += taxForThisSlab;
        remainingIncome -= taxableInThisSlab;
        
        if (remainingIncome <= 0) break;
      }

      // Calculate cess (4% on total tax)
      const cess = tax * 0.04;
      
      const result = {
        totalIncome,
        taxableIncome,
        taxBreakdown,
        basicTax: tax,
        cess,
        totalTax: tax + cess,
        effectiveRate: totalIncome > 0 ? ((tax + cess) / totalIncome) * 100 : 0
      };

      setTaxResult(result);
    } catch (_error) { // eslint-disable-line @typescript-eslint/no-unused-vars
      setError(t('errors.calculation'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg">
      <h2 className="text-2xl font-semibold mb-4 flex items-center">
        {t('title')}
        <InfoTooltip content={t('description')} />
      </h2>
      
      <form onSubmit={(e) => { e.preventDefault(); calculateTaxDirectly(); }} className="space-y-6">
        {/* Income Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">
            {t('income.title')}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="form-label">
                {t('income.salary')}
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">₹</span>
                </div>
                <input
                  type="number"
                  name="salary"
                  value={fields.salary}
                  onChange={handleChange}
                  className="form-input pl-7"
                  placeholder="0.00"
                />
              </div>
            </div>
            
            <div>
              <label className="form-label">
                {t('income.otherIncome')}
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">₹</span>
                </div>
                <input
                  type="number"
                  name="otherIncome"
                  value={fields.otherIncome}
                  onChange={handleChange}
                  className="form-input pl-7"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Personal Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">
            {t('personalDetails.title')}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="form-label">
                {t('personalDetails.age')}
              </label>
              <input
                type="number"
                name="age"
                value={fields.age}
                onChange={handleChange}
                min="0"
                max="120"
                className="form-input"
              />
            </div>
            
            <div>
              <label className="form-label">
                {t('personalDetails.regime')}
              </label>
              <select
                name="regime"
                value={fields.regime}
                onChange={handleChange}
                className="form-input"
              >
                <option value="new">{t('personalDetails.regimeNew')}</option>
                <option value="old">{t('personalDetails.regimeOld')}</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Deductions Section (only for old regime) */}
        {fields.regime === 'old' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">
                {t('deductions.title')}
              </h3>
              <button
                type="button"
                onClick={addDeduction}
                className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <FiPlusCircle className="mr-1" />
                {t('deductions.add')}
              </button>
            </div>
            
            <div className="space-y-3">
              {deductions.map((deduction) => (
                <div key={deduction.id} className="flex items-start space-x-2 p-3 border rounded-md bg-gray-50">
                  <div className="flex-1">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="form-label text-xs">
                          {t('deductions.type')}
                        </label>
                        <select
                          value={deduction.type}
                          onChange={(e) => handleDeductionChange(deduction.id, 'type', e.target.value)}
                          className="form-input text-sm"
                        >
                          <option value="80C">{t('deductions.types.80C')}</option>
                          <option value="80D">{t('deductions.types.80D')}</option>
                          <option value="80G">{t('deductions.types.80G')}</option>
                          <option value="HRA">{t('deductions.types.HRA')}</option>
                          <option value="other">{t('deductions.types.other')}</option>
                        </select>
                      </div>
                      <div>
                        <label className="form-label text-xs">
                          {t('deductions.amount')}
                        </label>
                        <div className="relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 sm:text-sm">₹</span>
                          </div>
                          <input
                            type="number"
                            value={deduction.amount}
                            onChange={(e) => handleDeductionChange(deduction.id, 'amount', e.target.value)}
                            className="form-input pl-7 text-sm"
                            placeholder="0.00"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="form-label text-xs">
                          {t('deductions.description')}
                        </label>
                        <input
                          type="text"
                          value={deduction.description}
                          onChange={(e) => handleDeductionChange(deduction.id, 'description', e.target.value)}
                          className="form-input text-sm"
                          placeholder="Optional"
                        />
                      </div>
                    </div>
                  </div>
                  {deductions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeDeduction(deduction.id)}
                      className="mt-6 text-red-600 hover:text-red-800"
                      aria-label={t('deductions.remove')}
                    >
                      <FiMinusCircle size={18} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            
            <div className="text-right text-sm text-gray-500">
              {t('deductions.total')}: ₹{calculateTotalDeductions().toLocaleString('en-IN')}
            </div>
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={resetFields}
            className="btn-secondary"
          >
            {t('reset')}
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
          >
            {loading ? t('loading') : t('calculate')}
          </button>
        </div>
      </form>
      
      {/* Error Message */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      {/* Tax Breakdown */}
      {taxResult && (
        <div className="mt-8">
          <TaxBreakdown result={taxResult} />
        </div>
      )}
    </div>
  );
};

export default TaxCalculator;
