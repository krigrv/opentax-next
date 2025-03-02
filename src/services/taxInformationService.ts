/**
 * Tax Information Service
 * 
 * This service provides utilities to fetch and parse tax-related information
 * from official sources like the Income Tax Department of India.
 * 
 * It includes methods to:
 * 1. Fetch latest tax updates
 * 2. Get current tax slabs and rates
 * 3. Calculate taxes based on official formulas
 * 4. Get information about deductions and exemptions
 */

import axios from 'axios';
import * as cheerio from 'cheerio';

// Add type declaration for cheerio
declare module 'cheerio' {
  interface Element {
    type: string;
    name: string;
    attribs: Record<string, string>;
    children: Element[];
    parent: Element | null;
    prev: Element | null;
    next: Element | null;
  }
}

// Types
export interface TaxUpdate {
  id: string;
  date: Date;
  title: string;
  description: string;
  link?: string;
  category: 'news' | 'circular' | 'notification' | 'press-release' | 'other';
}

export interface TaxSlab {
  regime: 'old' | 'new';
  financialYear: string;
  slabs: {
    min: number;
    max: number | null;
    rate: number;
    surcharge?: {
      threshold: number;
      rate: number;
    }[];
  }[];
}

export interface DeductionInfo {
  section: string;
  title: string;
  description: string;
  maxAmount: number | null;
  applicableRegimes: ('old' | 'new')[];
  conditions?: string[];
}

// Constants
const INCOME_TAX_PORTAL_URL = 'https://www.incometax.gov.in/iec/foportal/';

// Current tax slabs (FY 2024-25)
// These would ideally be fetched from an API, but we'll hardcode them for now
// and update them when official changes are announced
const TAX_SLABS_2024_25: TaxSlab[] = [
  {
    regime: 'new',
    financialYear: '2024-25',
    slabs: [
      { min: 0, max: 300000, rate: 0 },
      { min: 300000, max: 600000, rate: 5 },
      { min: 600000, max: 900000, rate: 10 },
      { min: 900000, max: 1200000, rate: 15 },
      { min: 1200000, max: 1500000, rate: 20 },
      { min: 1500000, max: null, rate: 30 },
    ],
  },
  {
    regime: 'old',
    financialYear: '2024-25',
    slabs: [
      { min: 0, max: 250000, rate: 0 },
      { min: 250000, max: 500000, rate: 5 },
      { min: 500000, max: 1000000, rate: 20 },
      { min: 1000000, max: null, rate: 30 },
    ],
  },
];

// Common deductions
const COMMON_DEDUCTIONS: DeductionInfo[] = [
  {
    section: '80C',
    title: 'Investments and Expenses',
    description: 'Deduction for investments in PPF, ELSS, life insurance premiums, EPF, NSC, tax-saving FDs (5-year lock-in), and expenses like tuition fees for children, principal repayment of home loan, and stamp duty/registration charges for house property.',
    maxAmount: 150000,
    applicableRegimes: ['old'],
  },
  {
    section: '80D',
    title: 'Health Insurance Premium',
    description: 'Deduction for health insurance premiums paid for self, family, and parents. Additional deduction for senior citizens.',
    maxAmount: 100000, // Maximum possible (25k self+family + 50k parents if senior citizens + 25k preventive health checkup)
    applicableRegimes: ['old'],
    conditions: [
      'Up to ₹25,000 for self and family',
      'Additional ₹25,000 for parents',
      'If parents are senior citizens, limit increases to ₹50,000',
      'If self/spouse is a senior citizen, limit increases to ₹50,000',
    ],
  },
  {
    section: '80TTA',
    title: 'Interest on Savings Account',
    description: 'Deduction for interest earned on savings accounts with banks, post offices, and co-operative societies.',
    maxAmount: 10000,
    applicableRegimes: ['old'],
  },
  {
    section: '80TTB',
    title: 'Interest Income for Senior Citizens',
    description: 'Deduction for interest income from deposits (including fixed deposits and recurring deposits) for senior citizens.',
    maxAmount: 50000,
    applicableRegimes: ['old'],
    conditions: ['Only applicable for senior citizens (60 years and above)'],
  },
  {
    section: '24(b)',
    title: 'Interest on Home Loan',
    description: 'Deduction for interest paid on home loan for self-occupied property.',
    maxAmount: 200000,
    applicableRegimes: ['old'],
    conditions: ['For self-occupied property'],
  },
  {
    section: '80EEA',
    title: 'Interest on Home Loan for Affordable Housing',
    description: 'Additional deduction for interest on home loan for affordable housing (stamp duty value up to ₹45 lakhs).',
    maxAmount: 150000,
    applicableRegimes: ['old'],
    conditions: [
      'Loan sanctioned between April 1, 2019 and March 31, 2022',
      'Stamp duty value of house ≤ ₹45 lakhs',
      'Individual does not own any other house on the date of loan sanction',
    ],
  },
  {
    section: '80E',
    title: 'Interest on Education Loan',
    description: 'Deduction for interest paid on loan taken for higher education of self, spouse, or children.',
    maxAmount: null, // No upper limit
    applicableRegimes: ['old'],
  },
  {
    section: '80G',
    title: 'Donations',
    description: 'Deduction for donations to specified funds and charitable institutions.',
    maxAmount: null, // Varies based on the donation
    applicableRegimes: ['old'],
    conditions: ['Deduction percentage varies from 50% to 100% depending on the institution'],
  },
];

/**
 * Fetches the latest tax updates from the Income Tax Department website
 */
export const fetchLatestTaxUpdates = async (): Promise<TaxUpdate[]> => {
  try {
    // In a real implementation, this would scrape the Income Tax Department website
    // For now, we'll return mock data based on the latest updates
    const response = await axios.get(INCOME_TAX_PORTAL_URL);
    const html = response.data;
    const $ = cheerio.load(html);
    
    const updates: TaxUpdate[] = [];
    
    // This is a simplified example - in a real implementation,
    // we would need to properly parse the HTML structure
    $('.latest-updates').each((index: number, element) => {
      const date = $(element).find('.date').text();
      const title = $(element).find('.title').text();
      const description = $(element).find('.description').text();
      const link = $(element).find('a').attr('href');
      
      updates.push({
        id: `update-${index}`,
        date: new Date(date),
        title,
        description,
        link,
        category: 'news',
      });
    });
    
    return updates;
  } catch (error) {
    console.error('Failed to fetch latest tax updates:', error);
    
    // Return mock data if the fetch fails
    return [
      {
        id: 'update-1',
        date: new Date('2025-02-19'),
        title: 'Due date of filing of report of the accountant in Form 56F extended',
        description: 'The due date for filing of report of the accountant in Form 56F for AY 2024-25 has been extended from February 15, 2025 to March 15, 2025.',
        link: 'https://www.incometax.gov.in/iec/foportal/sites/default/files/2025-02/circular-no-2-2025%20%281%29.pdf',
        category: 'circular',
      },
      {
        id: 'update-2',
        date: new Date('2025-01-22'),
        title: 'Direct Tax Vivad se Vishwas Scheme, 2024',
        description: 'The Direct Tax Vivad se Vishwas Scheme, 2024 has been introduced to provide a mechanism for resolution of pending tax disputes.',
        link: 'https://www.incometax.gov.in/iec/foportal/sites/default/files/2025-01/DTVSV-Scheme-2024.pdf',
        category: 'notification',
      },
    ];
  }
};

/**
 * Gets the current tax slabs for the specified financial year
 */
export const getTaxSlabs = (_financialYear: string = '2024-25'): TaxSlab[] => {
  // In a real implementation, this would fetch the latest tax slabs from an API
  // For now, we'll return hardcoded values
  return TAX_SLABS_2024_25;
};

/**
 * Gets information about common deductions
 */
export const getDeductions = (): DeductionInfo[] => {
  return COMMON_DEDUCTIONS;
};

/**
 * Calculates income tax based on the provided income, deductions, and regime
 */
export const calculateTax = (
  income: number,
  deductions: number = 0,
  regime: 'old' | 'new' = 'new',
): {
  taxableIncome: number;
  incomeTax: number;
  surcharge: number;
  cess: number;
  totalTax: number;
  effectiveTaxRate: number;
} => {
  // Get the appropriate tax slabs
  const taxSlabs = getTaxSlabs('2024-25').find(slab => slab.regime === regime);
  
  if (!taxSlabs) {
    throw new Error(`Tax slabs not found for regime ${regime} and financial year 2024-25`);
  }
  
  // Calculate taxable income
  const taxableIncome = regime === 'old' ? Math.max(0, income - deductions) : income;
  
  // Calculate income tax
  let incomeTax = 0;
  let remainingIncome = taxableIncome;
  
  for (const slab of taxSlabs.slabs) {
    if (remainingIncome <= 0) break;
    
    const slabAmount = slab.max === null
      ? remainingIncome
      : Math.min(remainingIncome, slab.max - slab.min);
    
    incomeTax += slabAmount * (slab.rate / 100);
    remainingIncome -= slabAmount;
  }
  
  // Calculate surcharge (simplified)
  let surcharge = 0;
  if (taxableIncome > 5000000 && taxableIncome <= 10000000) {
    surcharge = incomeTax * 0.1; // 10% surcharge
  } else if (taxableIncome > 10000000 && taxableIncome <= 20000000) {
    surcharge = incomeTax * 0.15; // 15% surcharge
  } else if (taxableIncome > 20000000 && taxableIncome <= 50000000) {
    surcharge = incomeTax * 0.25; // 25% surcharge
  } else if (taxableIncome > 50000000) {
    surcharge = incomeTax * 0.37; // 37% surcharge
  }
  
  // Calculate cess (4% health and education cess)
  const cess = (incomeTax + surcharge) * 0.04;
  
  // Calculate total tax
  const totalTax = incomeTax + surcharge + cess;
  
  // Calculate effective tax rate
  const effectiveTaxRate = (totalTax / income) * 100;
  
  return {
    taxableIncome,
    incomeTax,
    surcharge,
    cess,
    totalTax,
    effectiveTaxRate,
  };
};

const taxInformationService = {
  fetchLatestTaxUpdates,
  getTaxSlabs,
  getDeductions,
  calculateTax,
};

export default taxInformationService;
