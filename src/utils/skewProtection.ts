/**
 * Skew Protection Utility
 * 
 * This utility provides functions to detect and correct calculation skew
 * that might occur due to floating point errors, rounding issues, or
 * inconsistencies in tax calculations across different environments.
 */

interface SkewDetectionResult {
  hasSkew: boolean;
  skewAmount: number;
  correctedValue: number;
}

/**
 * Detects calculation skew by comparing the expected sum with the actual sum
 * @param parts Array of component values that should add up to the expected total
 * @param expectedTotal The expected sum of all parts
 * @param tolerance The acceptable difference between expected and actual sum
 * @returns Object containing skew detection results
 */
export function detectSkew(
  parts: number[],
  expectedTotal: number,
  tolerance: number = 0.01
): SkewDetectionResult {
  const actualTotal = parts.reduce((sum, value) => sum + value, 0);
  const difference = Math.abs(expectedTotal - actualTotal);
  
  return {
    hasSkew: difference > tolerance,
    skewAmount: expectedTotal - actualTotal,
    correctedValue: actualTotal + (expectedTotal - actualTotal)
  };
}

/**
 * Corrects calculation skew by distributing the difference across components
 * @param parts Array of component values to be corrected
 * @param expectedTotal The expected sum of all parts
 * @returns Corrected array of values that sum to the expected total
 */
export function correctSkew(parts: number[], expectedTotal: number): number[] {
  const actualTotal = parts.reduce((sum, value) => sum + value, 0);
  const difference = expectedTotal - actualTotal;
  
  // If no significant difference, return original parts
  if (Math.abs(difference) < 0.01) {
    return parts;
  }
  
  // Distribute the difference proportionally
  const correctedParts = parts.map((value, index) => {
    // Add more to the largest component to minimize visible changes
    if (index === parts.indexOf(Math.max(...parts))) {
      return value + difference;
    }
    return value;
  });
  
  return correctedParts;
}

/**
 * Ensures tax calculations are consistent across different environments
 * @param taxableIncome The taxable income amount
 * @param calculatedTax The calculated tax amount
 * @param referenceRates Reference tax rates for validation
 * @returns Validated and corrected tax amount
 */
export function validateTaxCalculation(
  taxableIncome: number,
  calculatedTax: number,
  referenceRates: {threshold: number; rate: number}[]
): number {
  // Calculate expected tax using reference rates
  let expectedTax = 0;
  let remainingIncome = taxableIncome;
  
  for (let i = 0; i < referenceRates.length; i++) {
    const { threshold, rate } = referenceRates[i];
    const nextThreshold = i < referenceRates.length - 1 
      ? referenceRates[i + 1].threshold 
      : Infinity;
    
    const taxableInThisBracket = Math.min(
      remainingIncome,
      nextThreshold - threshold
    );
    
    if (taxableInThisBracket > 0) {
      expectedTax += taxableInThisBracket * rate;
      remainingIncome -= taxableInThisBracket;
    }
    
    if (remainingIncome <= 0) break;
  }
  
  // Compare with calculated tax and correct if needed
  const difference = Math.abs(expectedTax - calculatedTax);
  const tolerance = Math.max(expectedTax * 0.005, 1); // 0.5% or Rs. 1, whichever is greater
  
  if (difference > tolerance) {
    return expectedTax;
  }
  
  return calculatedTax;
}

/**
 * Normalizes tax components to ensure they add up exactly to the total
 * @param components Object containing tax components
 * @param total The expected total
 * @returns Normalized components that sum exactly to the total
 */
export function normalizeTaxComponents<T extends Record<string, number>>(
  components: T,
  total: number
): T {
  const keys = Object.keys(components);
  const values = Object.values(components);
  const sum = values.reduce((acc, val) => acc + val, 0);
  
  if (Math.abs(sum - total) < 0.01) {
    return components;
  }
  
  const correctedValues = correctSkew(values, total);
  
  const result = { ...components };
  keys.forEach((key, index) => {
    result[key] = correctedValues[index];
  });
  
  return result as T;
}
