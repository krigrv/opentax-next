/**
 * Tax Optimizer Utility
 * 
 * This utility provides functions for analyzing tax calculations and generating
 * optimization suggestions to help users minimize their tax liability.
 */

interface TaxResult {
  taxableIncome: number;
  incomeTax: number;
  cess: number;
  surcharge: number;
  totalTax: number;
  effectiveRate: number;
}

interface TaxInput {
  income: number;
  deductions: number;
  regime: 'old' | 'new';
  isSalaried: boolean;
}

interface OptimizationSuggestion {
  id: string;
  title: string;
  description: string;
  potentialSaving: number;
  applicability: number; // 0-100 score
  complexity: number; // 0-100 score
}

/**
 * Analyzes tax calculation results and generates optimization suggestions
 * @param taxInput Original tax input parameters
 * @param taxResult Calculated tax result
 * @returns Array of optimization suggestions
 */
export async function generateOptimizationSuggestions(
  taxInput: TaxInput,
  taxResult: any
): Promise<OptimizationSuggestion[]> {
  const suggestions: OptimizationSuggestion[] = [];
  const { income, deductions, regime, isSalaried } = taxInput;
  
  // Calculate tax under both regimes for comparison
  const oldRegimeTax = await calculateTaxForRegime({ ...taxInput, regime: 'old' });
  const newRegimeTax = await calculateTaxForRegime({ ...taxInput, regime: 'new' });
  
  // Suggest regime switch if beneficial
  if (regime === 'old' && newRegimeTax < oldRegimeTax) {
    suggestions.push({
      id: 'switch-to-new',
      title: 'Switch to New Tax Regime',
      description: `Based on your income and deductions, you could save ₹${formatCurrency(oldRegimeTax - newRegimeTax)} by switching to the new tax regime.`,
      potentialSaving: oldRegimeTax - newRegimeTax,
      applicability: 100,
      complexity: 20,
    });
  } else if (regime === 'new' && oldRegimeTax < newRegimeTax) {
    suggestions.push({
      id: 'switch-to-old',
      title: 'Switch to Old Tax Regime',
      description: `Based on your income and deductions, you could save ₹${formatCurrency(newRegimeTax - oldRegimeTax)} by switching to the old tax regime and utilizing deductions.`,
      potentialSaving: newRegimeTax - oldRegimeTax,
      applicability: 100,
      complexity: 40,
    });
  }
  
  // For salaried employees, highlight standard deduction benefit
  if (isSalaried) {
    const standardDeductionOld = 50000;
    const standardDeductionNew = 75000;
    const standardDeductionDiff = standardDeductionNew - standardDeductionOld;
    
    if (regime === 'old') {
      const potentialSaving = calculateMarginalTaxBenefit(income, standardDeductionDiff, 'new');
      suggestions.push({
        id: 'standard-deduction-benefit',
        title: 'Higher Standard Deduction in New Regime',
        description: `The new tax regime offers a higher standard deduction of ₹75,000 compared to ₹50,000 in the old regime. This could save you approximately ₹${formatCurrency(potentialSaving)}.`,
        potentialSaving,
        applicability: 90,
        complexity: 10,
      });
    }
  }
  
  // For old regime, suggest maximizing deductions if not already at limit
  if (regime === 'old') {
    const maxDeduction = 150000; // Section 80C limit
    
    if (deductions < maxDeduction) {
      const additionalDeduction = maxDeduction - deductions;
      const potentialSaving = calculateMarginalTaxBenefit(income, additionalDeduction, 'old');
      
      suggestions.push({
        id: 'maximize-80c',
        title: 'Maximize Section 80C Deductions',
        description: `You can invest up to ₹${formatCurrency(additionalDeduction)} more in tax-saving instruments under Section 80C to save approximately ₹${formatCurrency(potentialSaving)} in taxes.`,
        potentialSaving,
        applicability: 85,
        complexity: 50,
      });
    }
    
    // Suggest health insurance premium deduction (Section 80D)
    suggestions.push({
      id: 'health-insurance',
      title: 'Health Insurance Premium Deduction',
      description: 'You can claim deduction for health insurance premiums paid for yourself and family members under Section 80D up to ₹25,000 (₹50,000 for senior citizens).',
      potentialSaving: calculateMarginalTaxBenefit(income, 25000, 'old'),
      applicability: 75,
      complexity: 30,
    });
    
    // Suggest home loan interest deduction (Section 24)
    suggestions.push({
      id: 'home-loan-interest',
      title: 'Home Loan Interest Deduction',
      description: 'If you have a home loan, you can claim deduction for interest paid up to ₹2,00,000 under Section 24.',
      potentialSaving: calculateMarginalTaxBenefit(income, 200000, 'old'),
      applicability: 60,
      complexity: 40,
    });
  }
  
  // For new regime, highlight simplified compliance
  if (regime === 'old' && deductions < 50000) {
    suggestions.push({
      id: 'simplified-compliance',
      title: 'Simplified Tax Compliance',
      description: 'The new tax regime offers simplified compliance without the need to maintain investment proofs and documentation for various deductions.',
      potentialSaving: 0, // Non-monetary benefit
      applicability: 70,
      complexity: 10,
    });
  }
  
  // Sort suggestions by potential saving (descending)
  return suggestions.sort((a, b) => b.potentialSaving - a.potentialSaving);
}

/**
 * Calculates tax for a given regime
 * @param input Tax input with specified regime
 * @returns Calculated tax amount
 */
async function calculateTaxForRegime(input: TaxInput): Promise<number> {
  const { income, deductions, regime, isSalaried } = input;
  
  // Apply standard deduction for salaried employees
  const standardDeduction = isSalaried ? (regime === 'new' ? 75000 : 50000) : 0;
  
  // Calculate taxable income
  const taxableIncome = Math.max(0, income - standardDeduction - (regime === 'old' ? deductions : 0));
  
  // Calculate tax based on regime
  let tax = 0;
  
  if (regime === 'new') {
    // New regime tax slabs FY 2024-25
    if (taxableIncome <= 300000) {
      tax = 0;
    } else if (taxableIncome <= 700000) {
      tax = (taxableIncome - 300000) * 0.05;
    } else if (taxableIncome <= 1000000) {
      tax = 20000 + (taxableIncome - 700000) * 0.1;
    } else if (taxableIncome <= 1200000) {
      tax = 50000 + (taxableIncome - 1000000) * 0.15;
    } else if (taxableIncome <= 1500000) {
      tax = 80000 + (taxableIncome - 1200000) * 0.2;
    } else {
      tax = 140000 + (taxableIncome - 1500000) * 0.3;
    }
    
    // Apply rebate under section 87A (up to ₹25,000 for income up to ₹7,00,000)
    if (taxableIncome <= 700000) {
      tax = Math.max(0, tax - 25000);
    }
  } else {
    // Old regime tax slabs FY 2024-25
    if (taxableIncome <= 250000) {
      tax = 0;
    } else if (taxableIncome <= 500000) {
      tax = (taxableIncome - 250000) * 0.05;
    } else if (taxableIncome <= 1000000) {
      tax = 12500 + (taxableIncome - 500000) * 0.2;
    } else {
      tax = 112500 + (taxableIncome - 1000000) * 0.3;
    }
    
    // Apply rebate under section 87A (up to ₹12,500 for income up to ₹5,00,000)
    if (taxableIncome <= 500000) {
      tax = Math.max(0, tax - 12500);
    }
  }
  
  // Add 4% health and education cess
  tax = tax * 1.04;
  
  return tax;
}

/**
 * Calculates the tax benefit for a marginal deduction amount
 * @param income Gross income
 * @param deductionAmount Additional deduction amount
 * @param regime Tax regime ('old' or 'new')
 * @returns Potential tax saving
 */
function calculateMarginalTaxBenefit(
  income: number,
  deductionAmount: number,
  regime: 'old' | 'new'
): number {
  // Calculate marginal tax rate based on income and regime
  let marginalRate = 0;
  
  if (regime === 'new') {
    if (income > 1500000) marginalRate = 0.3;
    else if (income > 1200000) marginalRate = 0.2;
    else if (income > 1000000) marginalRate = 0.15;
    else if (income > 700000) marginalRate = 0.1;
    else if (income > 300000) marginalRate = 0.05;
  } else {
    if (income > 1000000) marginalRate = 0.3;
    else if (income > 500000) marginalRate = 0.2;
    else if (income > 250000) marginalRate = 0.05;
  }
  
  // Include cess in the calculation
  return deductionAmount * marginalRate * 1.04;
}

/**
 * Formats a currency value for display
 * @param value The value to format
 * @returns Formatted currency string
 */
function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0
  }).format(Math.round(value));
}
