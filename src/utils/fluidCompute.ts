/**
 * Fluid Compute Utility
 * 
 * This utility provides functions for adaptive calculations that adjust based on
 * device capabilities, network conditions, and user interaction patterns.
 * It enables progressive enhancement of calculation complexity and accuracy.
 */

interface ComputeCapabilities {
  tier: 'low' | 'medium' | 'high';
  supportsWorkers: boolean;
  supportsBigInt: boolean;
  networkQuality: 'poor' | 'adequate' | 'good';
  memoryConstraints: boolean;
}

interface ComputeOptions {
  precision: number;
  useWorker: boolean;
  chunkSize: number;
  useProgressiveCalculation: boolean;
  cacheResults: boolean;
  timeout: number; // in milliseconds
}

interface FluidComputeOptions {
  precision: number;
  useCache: boolean;
  progressiveComputation: boolean;
  useWebWorker: boolean;
}

type DeviceTier = 'low' | 'medium' | 'high';

/**
 * Detects device capabilities to determine optimal computation strategy
 * @returns Object containing device capability assessment
 */
export function detectCapabilities(): ComputeCapabilities {
  // Check if running in browser environment
  const isBrowser = typeof window !== 'undefined';
  
  if (!isBrowser) {
    // Server-side rendering, assume high capabilities
    return {
      tier: 'high',
      supportsWorkers: true,
      supportsBigInt: true,
      networkQuality: 'good',
      memoryConstraints: false
    };
  }
  
  // Check for Web Worker support
  const supportsWorkers = typeof Worker !== 'undefined';
  
  // Check for BigInt support
  const supportsBigInt = typeof BigInt !== 'undefined';
  
  // Estimate device tier based on available memory and cores
  let tier: 'low' | 'medium' | 'high' = 'medium';
  
  // Use navigator.hardwareConcurrency as a proxy for device capability
  if (navigator.hardwareConcurrency) {
    if (navigator.hardwareConcurrency <= 2) {
      tier = 'low';
    } else if (navigator.hardwareConcurrency >= 6) {
      tier = 'high';
    }
  }
  
  // Check for memory constraints
  // This is an imperfect heuristic but can help identify low-end devices
  const memoryConstraints = navigator.deviceMemory 
    ? navigator.deviceMemory < 4 
    : false;
  
  // Estimate network quality
  // This is a simple heuristic based on connection type
  let networkQuality: 'poor' | 'adequate' | 'good' = 'adequate';
  
  if (navigator.connection) {
    const connection = navigator.connection as any;
    if (connection.effectiveType === '4g' || connection.downlink > 5) {
      networkQuality = 'good';
    } else if (connection.effectiveType === '2g' || connection.downlink < 1) {
      networkQuality = 'poor';
    }
  }
  
  return {
    tier,
    supportsWorkers,
    supportsBigInt,
    networkQuality,
    memoryConstraints
  };
}

/**
 * Determines optimal computation options based on device capabilities
 * @param capabilities The device capability assessment
 * @param complexity The complexity of the calculation (1-10)
 * @returns Optimized computation options
 */
export function getComputeOptions(
  capabilities: ComputeCapabilities,
  complexity: number = 5
): ComputeOptions {
  const { tier, supportsWorkers, memoryConstraints, networkQuality } = capabilities;
  
  // Base options
  const options: ComputeOptions = {
    precision: 2,
    useWorker: false,
    chunkSize: 1000,
    useProgressiveCalculation: false,
    cacheResults: true,
    timeout: 10000
  };
  
  // Adjust based on device tier
  if (tier === 'high') {
    options.precision = 4;
    options.chunkSize = 5000;
    options.timeout = 30000;
  } else if (tier === 'low') {
    options.precision = 2;
    options.chunkSize = 500;
    options.timeout = 5000;
    options.useProgressiveCalculation = true;
  }
  
  // Adjust for complexity
  if (complexity > 7) {
    options.useWorker = supportsWorkers;
    options.useProgressiveCalculation = true;
  }
  
  // Adjust for memory constraints
  if (memoryConstraints) {
    options.chunkSize = Math.min(options.chunkSize, 200);
    options.cacheResults = false;
  }
  
  // Adjust for network quality
  if (networkQuality === 'poor') {
    options.cacheResults = true;
    options.timeout = Math.max(options.timeout, 15000);
  }
  
  return options;
}

/**
 * Detects device capabilities and determines device tier
 * @returns Device tier ('low', 'medium', or 'high')
 */
async function detectDeviceTier(): Promise<DeviceTier> {
  // CPU cores
  const cpuCores = navigator.hardwareConcurrency || 2;
  
  // Memory (if available via performance API)
  let memoryScore = 1;
  if (
    // @ts-expect-error - jsMemoryEstimate may not be available in all browsers
    performance && performance.memory && performance.memory.jsHeapSizeLimit
  ) {
    // @ts-expect-error - accessing non-standard browser API
    const memoryMB = performance.memory.jsHeapSizeLimit / (1024 * 1024);
    if (memoryMB > 2048) memoryScore = 3;
    else if (memoryMB > 1024) memoryScore = 2;
  }
  
  // Network speed (rough estimate)
  let networkScore = 2;
  if (navigator.connection) {
    // @ts-expect-error - connection API may not be available in all browsers
    const connection = navigator.connection;
    if (connection.effectiveType === '4g') networkScore = 3;
    else if (connection.effectiveType === '3g') networkScore = 2;
    else networkScore = 1;
  }
  
  // Calculate overall score
  const overallScore = (cpuCores / 2) * 0.5 + memoryScore * 0.3 + networkScore * 0.2;
  
  if (overallScore >= 2.5) return 'high';
  if (overallScore >= 1.5) return 'medium';
  return 'low';
}

/**
 * Determines precision level based on device tier
 * @param deviceTier Device capability tier
 * @returns Precision level for calculations
 */
function getPrecisionForDeviceTier(deviceTier: DeviceTier): number {
  switch (deviceTier) {
    case 'high': return 2;
    case 'medium': return 1;
    case 'low': return 0;
    default: return 1;
  }
}

/**
 * Performs a tax calculation with adaptive computation based on device capabilities
 * @param calculationFn The calculation function to execute
 * @param input The input data for the calculation
 * @param options Optional configuration for the calculation
 * @returns The calculation result
 */
export async function fluidCalculate<T, R>(
  calculationFn: (input: T, options: FluidComputeOptions) => Promise<R>,
  input: T,
  options: Partial<FluidComputeOptions> = {}
): Promise<R> {
  // Detect device capabilities
  const deviceTier = await detectDeviceTier();
  
  // Merge default options with provided options
  const mergedOptions: FluidComputeOptions = {
    precision: getPrecisionForDeviceTier(deviceTier),
    useCache: options.useCache ?? true,
    progressiveComputation: options.progressiveComputation ?? (deviceTier === 'low'),
    useWebWorker: options.useWebWorker ?? (deviceTier === 'high'),
    ...options
  };
  
  // Generate cache key if caching is enabled
  const cacheKey = mergedOptions.useCache
    ? generateCacheKey(input, mergedOptions)
    : null;
  
  // Check cache first if enabled
  if (cacheKey && cache.has(cacheKey)) {
    return cache.get(cacheKey) as R;
  }
  
  // Execute calculation based on device capabilities
  let result: R;
  
  if (mergedOptions.useWebWorker && typeof Worker !== 'undefined') {
    // Use Web Worker for heavy calculations on high-tier devices
    result = await executeInWebWorker(calculationFn, input, mergedOptions);
  } else if (mergedOptions.progressiveComputation) {
    // Use progressive computation for low-tier devices
    result = await executeProgressively(calculationFn, input, mergedOptions);
  } else {
    // Standard execution for medium-tier devices
    result = await calculationFn(input, mergedOptions);
  }
  
  // Cache result if caching is enabled
  if (cacheKey) {
    cache.set(cacheKey, result);
  }
  
  return result;
}

/**
 * Executes calculation in a Web Worker for non-blocking performance
 * @param calculationFn The calculation function
 * @param input The input data
 * @param options Computation options
 * @returns Calculation result
 */
async function executeInWebWorker<T, R>(
  calculationFn: (input: T, options: FluidComputeOptions) => Promise<R>,
  input: T,
  options: FluidComputeOptions
): Promise<R> {
  return new Promise((resolve, reject) => {
    try {
      // For simplicity in this implementation, we'll fall back to direct execution
      // In a real implementation, you would create a worker and transfer the calculation
      calculationFn(input, options).then(resolve).catch(reject);
    } catch {
      // Fall back to direct execution if worker fails
      calculationFn(input, options).then(resolve).catch(reject);
    }
  });
}

/**
 * Executes calculation progressively for better responsiveness on low-end devices
 * @param calculationFn The calculation function
 * @param input The input data
 * @param options Computation options
 * @returns Calculation result
 */
async function executeProgressively<T, R>(
  calculationFn: (input: T, options: FluidComputeOptions) => Promise<R>,
  input: T,
  options: FluidComputeOptions
): Promise<R> {
  // Allow UI to update before starting calculation
  await new Promise(resolve => setTimeout(resolve, 0));
  
  // Execute calculation with reduced precision for faster results
  const simplifiedOptions = {
    ...options,
    precision: Math.max(0, options.precision - 1)
  };
  
  return calculationFn(input, simplifiedOptions);
}

/**
 * Generates a cache key for the calculation
 * @param input The input data
 * @param options Computation options
 * @returns Cache key string
 */
function generateCacheKey<T>(input: T, options: FluidComputeOptions): string {
  // Special handling for tax input to include isSalaried status
  if (
    typeof input === 'object' && 
    input !== null && 
    'income' in input && 
    'regime' in input &&
    'isSalaried' in input
  ) {
    // For tax calculations, include key parameters in the cache key
    const { income, deductions, regime, isSalaried } = input as {
      income: number;
      deductions: number;
      regime: string;
      isSalaried: boolean;
    };
    return `tax_${income}_${deductions}_${regime}_${isSalaried}_${options.precision}`;
  }
  
  // Generic cache key generation
  return `${JSON.stringify(input)}_${options.precision}`;
}

/**
 * Formats a number with adaptive precision based on device capabilities
 * @param value The number to format
 * @param options Formatting options
 * @returns Formatted number string
 */
export function formatWithAdaptivePrecision(
  value: number,
  options: {
    style?: 'decimal' | 'currency' | 'percent';
    currency?: string;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
    deviceTier?: DeviceTier;
  } = {}
): string {
  const deviceTier = options.deviceTier || 'medium';
  
  // Adjust precision based on device tier
  let maxFractionDigits = options.maximumFractionDigits;
  if (maxFractionDigits === undefined) {
    maxFractionDigits = deviceTier === 'high' ? 2 : deviceTier === 'medium' ? 1 : 0;
  }
  
  return new Intl.NumberFormat('en-IN', {
    style: options.style || 'decimal',
    currency: options.currency || 'INR',
    minimumFractionDigits: options.minimumFractionDigits || 0,
    maximumFractionDigits: maxFractionDigits
  }).format(value);
}

/**
 * Calculation cache to avoid redundant computations
 */
const cache = new Map<string, unknown>();

/**
 * Clears the calculation cache
 */
export function clearCalculationCache(): void {
  cache.clear();
}
