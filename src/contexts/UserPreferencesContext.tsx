'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface UserPreferences {
  language: string;
  theme: 'light' | 'dark' | 'system';
  taxYear: string;
  lastCalculation?: TaxResultType;
  savedData?: Record<string, unknown>;
  notifications: boolean;
  taxRegime: 'old' | 'new';
  currency: string;
  dateFormat: string;
  savedCalculations: Record<string, unknown>[];
  recentSearches: string[];
  favoriteTools: string[];
  customSettings: Record<string, unknown>;
}

const defaultPreferences: UserPreferences = {
  language: 'en',
  theme: 'system',
  taxYear: new Date().getFullYear().toString(),
  notifications: true,
  taxRegime: 'old',
  currency: 'USD',
  dateFormat: 'MM/DD/YYYY',
  savedCalculations: [],
  recentSearches: [],
  favoriteTools: [],
  customSettings: {},
};

interface UserPreferencesContextType extends UserPreferences {
  setLanguage: (language: string) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setTaxYear: (year: string) => void;
  saveCalculation: (calculation: Record<string, unknown>) => void;
  saveUserData: (data: Record<string, unknown>) => void;
  clearSavedData: () => void;
  updatePreferences: (newPreferences: Partial<UserPreferences>) => void;
  resetPreferences: () => void;
  clearSavedCalculations: () => void;
  addRecentSearch: (search: string) => void;
  clearRecentSearches: () => void;
  toggleFavoriteTool: (toolId: string) => void;
  updateCustomSetting: (key: string, value: unknown) => void;
}

// Define TaxResultType interface (assuming it's defined elsewhere or define it here)
interface TaxResultType {
  taxableIncome: number;
  incomeTax: number;
  surcharge: number;
  cess: number;
  totalTax: number;
  effectiveTaxRate: number;
  // ... other properties of TaxResult if any
}

const UserPreferencesContext = createContext<UserPreferencesContextType | undefined>(undefined);

export function useUserPreferences() {
  const context = useContext(UserPreferencesContext);
  if (context === undefined) {
    throw new Error('useUserPreferences must be used within a UserPreferencesProvider');
  }
  return context;
}

interface UserPreferencesProviderProps {
  children: ReactNode;
}

export function UserPreferencesProvider({ children }: UserPreferencesProviderProps) {
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load preferences from localStorage on initial render
  useEffect(() => {
    const loadPreferences = () => {
      try {
        const savedPreferences = localStorage.getItem('opentax-preferences');
        if (savedPreferences) {
          setPreferences(JSON.parse(savedPreferences) as UserPreferences);
        }
      } catch (error) {
        console.error('Failed to load preferences from localStorage:', error);
      } finally {
        setIsInitialized(true);
      }
    };

    loadPreferences();
  }, []);

  // Save preferences to localStorage whenever they change
  useEffect(() => {
    if (isInitialized) {
      try {
        localStorage.setItem('opentax-preferences', JSON.stringify(preferences));
      } catch (error) {
        console.error('Failed to save preferences to localStorage:', error);
      }
    }
  }, [preferences, isInitialized]);

  const setLanguage = (language: string) => {
    setPreferences((prev) => ({ ...prev, language }));
  };

  const setTheme = (theme: 'light' | 'dark' | 'system') => {
    setPreferences((prev) => ({ ...prev, theme }));
  };

  const setTaxYear = (taxYear: string) => {
    setPreferences((prev) => ({ ...prev, taxYear }));
  };

  const saveCalculation = (calculation: Record<string, unknown>) => {
    setPreferences(prev => ({
      ...prev,
      savedCalculations: [...prev.savedCalculations, calculation]
    }));
  };

  const saveUserData = (data: Record<string, unknown>) => {
    setPreferences((prev) => ({ ...prev, savedData: data }));
  };

  const clearSavedData = () => {
    setPreferences((prev) => {
      const { ...rest } = prev;
      return rest;
    });
  };

  const updatePreferences = (newPreferences: Partial<UserPreferences>) => {
    setPreferences(prev => ({ ...prev, ...newPreferences }));
  };

  const resetPreferences = () => {
    setPreferences(defaultPreferences);
  };

  const clearSavedCalculations = () => {
    setPreferences(prev => ({ ...prev, savedCalculations: [] }));
  };

  const addRecentSearch = (search: string) => {
    setPreferences(prev => ({
      ...prev,
      recentSearches: [...prev.recentSearches, search]
    }));
  };

  const clearRecentSearches = () => {
    setPreferences(prev => ({ ...prev, recentSearches: [] }));
  };

  const toggleFavoriteTool = (toolId: string) => {
    setPreferences(prev => ({
      ...prev,
      favoriteTools: prev.favoriteTools.includes(toolId)
        ? prev.favoriteTools.filter((id) => id !== toolId)
        : [...prev.favoriteTools, toolId]
    }));
  };

  const updateCustomSetting = (key: string, value: unknown) => {
    setPreferences(prev => ({
      ...prev,
      customSettings: { ...prev.customSettings, [key]: value }
    }));
  };

  const value: UserPreferencesContextType = {
    ...preferences,
    setLanguage,
    setTheme,
    setTaxYear,
    saveCalculation,
    saveUserData,
    clearSavedData,
    updatePreferences,
    resetPreferences,
    clearSavedCalculations,
    addRecentSearch,
    clearRecentSearches,
    toggleFavoriteTool,
    updateCustomSetting,
  };

  return (
    <UserPreferencesContext.Provider value={value}>
      {children}
    </UserPreferencesContext.Provider>
  );
}
