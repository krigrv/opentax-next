'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useUserPreferences } from '@/contexts/UserPreferencesContext';
import { detectSkew, normalizeTaxComponents, validateTaxCalculation } from '@/utils/skewProtection';
import { fluidCalculate, formatWithAdaptivePrecision } from '@/utils/fluidCompute';
import { generateOptimizationSuggestions } from '@/utils/taxOptimizer';
import { FiInfo, FiChevronDown, FiChevronUp } from 'react-icons/fi';

interface TaxInput {
  income: number;
  deductions: number;
  regime: 'old' | 'new';
  isSalaried: boolean;
}

interface TaxResult {
  taxableIncome: number;
  incomeTax: number;
  cess: number;
  surcharge: number;
  totalTax: number;
  effectiveRate: number;
  standardDeduction?: number;
}

interface OptimizationSuggestion {
  id: string;
  title: string;
  description: string;
  potentialSaving: number;
  applicability: number;
  complexity: number;
}

const TaxCalculator = () => {
  const { t } = useTranslation('common');
  const { preferences, saveCalculation } = useUserPreferences();
  
  const [taxInput, setTaxInput] = useState<TaxInput>({
    income: 0,
    deductions: 0,
    regime: 'new',
    isSalaried: true,
  });
  
  const [result, setResult] = useState<TaxResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [calculationProgress, setCalculationProgress] = useState(0);
  const [optimizationSuggestions, setOptimizationSuggestions] = useState<OptimizationSuggestion[]>([]);
  const [showOptimizations, setShowOptimizations] = useState(false);

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

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setTaxInput((prev) => ({ ...prev, [name]: checked }));
  };

  const calculateTax = async () => {
    setIsCalculating(true);
    setCalculationProgress(10);
    
    try {
      // Use fluid compute for adaptive calculations
      const taxResult = await fluidCalculate(
        async (input: TaxInput) => {
          setCalculationProgress(30);
          const { income, deductions, regime, isSalaried } = input;
          
          // Apply standard deduction for salaried employees
          const standardDeduction = isSalaried ? (regime === 'new' ? 75000 : 50000) : 0;
          
          const taxableIncome = Math.max(0, income - standardDeduction - (regime === 'old' ? deductions : 0));
          
          setCalculationProgress(50);
          
          // Reference tax rates for validation - UPDATED FOR FY 2024-25
          const oldRegimeRates = [
            { threshold: 0, rate: 0 },
            { threshold: 250000, rate: 0.05 },
            { threshold: 500000, rate: 0.2 },
            { threshold: 1000000, rate: 0.3 }
          ];
          
          const newRegimeRates = [
            { threshold: 0, rate: 0 },
            { threshold: 300000, rate: 0.05 },
            { threshold: 700000, rate: 0.1 },
            { threshold: 1000000, rate: 0.15 },
            { threshold: 1200000, rate: 0.2 },
            { threshold: 1500000, rate: 0.3 }
          ];
          
          // Calculate income tax based on regime
          let incomeTax = 0;
          
          if (regime === 'old') {
            // Old regime calculation (FY 2024-25)
            if (taxableIncome <= 250000) {
              incomeTax = 0;
            } else if (taxableIncome <= 500000) {
              incomeTax = (taxableIncome - 250000) * 0.05;
            } else if (taxableIncome <= 1000000) {
              incomeTax = 12500 + (taxableIncome - 500000) * 0.2;
            } else {
              incomeTax = 112500 + (taxableIncome - 1000000) * 0.3;
            }
            
            // Apply rebate under section 87A for income up to 5 lakh
            if (taxableIncome <= 500000) {
              incomeTax = Math.max(0, incomeTax - 12500);
            }
            
            // Validate calculation with reference rates
            incomeTax = validateTaxCalculation(taxableIncome, incomeTax, oldRegimeRates);
          } else {
            // New regime calculation (FY 2024-25)
            if (taxableIncome <= 300000) {
              incomeTax = 0;
            } else if (taxableIncome <= 700000) {
              incomeTax = (taxableIncome - 300000) * 0.05;
            } else if (taxableIncome <= 1000000) {
              incomeTax = 20000 + (taxableIncome - 700000) * 0.1;
            } else if (taxableIncome <= 1200000) {
              incomeTax = 50000 + (taxableIncome - 1000000) * 0.15;
            } else if (taxableIncome <= 1500000) {
              incomeTax = 80000 + (taxableIncome - 1200000) * 0.2;
            } else {
              incomeTax = 140000 + (taxableIncome - 1500000) * 0.3;
            }
            
            // Apply rebate under section 87A for income up to 7 lakh
            if (taxableIncome <= 700000) {
              incomeTax = Math.max(0, incomeTax - 25000);
            }
            
            // Validate calculation with reference rates
            incomeTax = validateTaxCalculation(taxableIncome, incomeTax, newRegimeRates);
          }
          
          setCalculationProgress(70);
          
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
          
          setCalculationProgress(90);
          
          // Apply skew protection to ensure components add up correctly
          const taxComponents = { incomeTax, cess, surcharge };
          const normalizedComponents = normalizeTaxComponents(taxComponents, totalTax);
          
          // Check for calculation skew
          const skewResult = detectSkew(
            [normalizedComponents.incomeTax, normalizedComponents.cess, normalizedComponents.surcharge],
            totalTax
          );
          
          setCalculationProgress(100);
          
          return {
            taxableIncome,
            incomeTax: normalizedComponents.incomeTax,
            cess: normalizedComponents.cess,
            surcharge: normalizedComponents.surcharge,
            totalTax: skewResult.hasSkew ? skewResult.correctedValue : totalTax,
            effectiveRate,
            standardDeduction
          };
        },
        taxInput,
        { precision: 2, cacheResults: true }
      );
      
      setResult(taxResult);
      
      // Generate optimization suggestions
      const suggestions = generateOptimizationSuggestions(taxInput, taxResult);
      setOptimizationSuggestions(suggestions);
      
      saveCalculation(taxResult); // Save to local storage via UserPreferencesContext
    } catch (error) {
      console.error('Error calculating tax:', error);
      // Handle calculation error
    } finally {
      setIsCalculating(false);
      setCalculationProgress(0);
    }
  };

  const formatCurrency = (amount: number) => {
    return formatWithAdaptivePrecision(amount, { 
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    });
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        {t('tax_calculator')} ({preferences.taxYear}-{parseInt(preferences.taxYear) + 1})
      </h2>
      
      <div className="space-y-6">
        <div>
          <label htmlFor="income" className="block text-sm font-medium text-gray-700">
            {t('income')}
          </label>
          <div className="mt-1">
            <input
              type="number"
              name="income"
              id="income"
              value={taxInput.income}
              onChange={handleInputChange}
              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
              placeholder="0"
            />
          </div>
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            name="isSalaried"
            id="isSalaried"
            checked={taxInput.isSalaried}
            onChange={handleCheckboxChange}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <label htmlFor="isSalaried" className="ml-2 block text-sm text-gray-700">
            {t('is_salaried_employee')}
            {taxInput.isSalaried && (
              <span className="text-xs text-green-600 ml-2">
                ({t('standard_deduction')}: ₹{taxInput.regime === 'new' ? '75,000' : '50,000'})
              </span>
            )}
          </label>
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
            onClick={calculateTax}
            disabled={isCalculating}
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed"
          >
            {isCalculating ? (
              <div className="flex items-center justify-center">
                <span>{t('calculating')}</span>
                <div className="ml-3 h-2 w-24 bg-indigo-300 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-white transition-all duration-300 ease-in-out" 
                    style={{ width: `${calculationProgress}%` }}
                  ></div>
                </div>
              </div>
            ) : (
              t('calculate_tax')
            )}
          </button>
        </div>
      </div>
      
      {result && (
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">{t('tax_calculation_results')}</h3>
          
          <div className="bg-gray-50 p-4 rounded-md">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('gross_income')}:</span>
                  <span className="font-medium">{formatCurrency(taxInput.income)}</span>
                </div>
                {result.standardDeduction > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t('standard_deduction')}:</span>
                    <span className="font-medium">- {formatCurrency(result.standardDeduction)}</span>
                  </div>
                )}
                {taxInput.regime === 'old' && taxInput.deductions > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t('other_deductions')}:</span>
                    <span className="font-medium">- {formatCurrency(taxInput.deductions)}</span>
                  </div>
                )}
                <div className="flex justify-between font-medium">
                  <span className="text-gray-600">{t('taxable_income')}:</span>
                  <span>{formatCurrency(result.taxableIncome)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('income_tax')}:</span>
                  <span className="font-medium">{formatCurrency(result.incomeTax)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('cess')}:</span>
                  <span className="font-medium">{formatCurrency(result.cess)}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('surcharge')}:</span>
                  <span className="font-medium">{formatCurrency(result.surcharge)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('effective_tax_rate')}:</span>
                  <span className="font-medium">{result.effectiveRate.toFixed(2)}%</span>
                </div>
                <div className="flex justify-between font-bold text-lg">
                  <span className="text-gray-800">{t('total_tax')}:</span>
                  <span className="text-indigo-700">{formatCurrency(result.totalTax)}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Tax Optimization Suggestions */}
          {optimizationSuggestions.length > 0 && (
            <div className="mt-6">
              <button
                onClick={() => setShowOptimizations(!showOptimizations)}
                className="flex items-center justify-between w-full px-4 py-3 bg-indigo-50 text-indigo-700 rounded-md hover:bg-indigo-100 transition-colors"
              >
                <div className="flex items-center">
                  <FiInfo className="mr-2" />
                  <span className="font-medium">
                    {t('tax_optimization_suggestions')} ({optimizationSuggestions.length})
                  </span>
                </div>
                {showOptimizations ? <FiChevronUp /> : <FiChevronDown />}
              </button>
              
              {showOptimizations && (
                <div className="mt-4 space-y-4">
                  {optimizationSuggestions.map((suggestion) => (
                    <div key={suggestion.id} className="border border-gray-200 rounded-md overflow-hidden">
                      <div className="flex justify-between items-center p-4 bg-gray-50">
                        <h4 className="font-medium text-gray-800">{suggestion.title}</h4>
                        <div className="flex items-center">
                          <span className="text-green-600 font-medium mr-2">
                            {formatCurrency(suggestion.potentialSaving)} {t('potential_saving')}
                          </span>
                          <div className="flex items-center ml-2">
                            <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-green-500"
                                style={{ width: `${suggestion.applicability}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-gray-500 ml-1">{suggestion.applicability}%</span>
                          </div>
                        </div>
                      </div>
                      <div className="p-4">
                        <p className="text-gray-600">{suggestion.description}</p>
                        <div className="mt-2 flex items-center">
                          <span className="text-xs text-gray-500 mr-2">
                            {t('complexity')}: {Array(suggestion.complexity).fill('●').join('')}
                            {Array(5 - suggestion.complexity).fill('○').join('')}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TaxCalculator;
