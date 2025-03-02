'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface UserPreferences {
  language: string;
  theme: 'light' | 'dark' | 'system';
  taxYear: string;
  lastCalculation?: any;
  savedData?: any;
}

const defaultPreferences: UserPreferences = {
  language: 'en',
  theme: 'system',
  taxYear: new Date().getFullYear().toString(),
};

interface UserPreferencesContextType {
  preferences: UserPreferences;
  setLanguage: (language: string) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setTaxYear: (year: string) => void;
  saveCalculation: (calculationData: any) => void;
  saveUserData: (data: any) => void;
  clearSavedData: () => void;
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
          setPreferences(JSON.parse(savedPreferences));
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

  const saveCalculation = (calculationData: any) => {
    setPreferences((prev) => ({ ...prev, lastCalculation: calculationData }));
  };

  const saveUserData = (data: any) => {
    setPreferences((prev) => ({ ...prev, savedData: data }));
  };

  const clearSavedData = () => {
    setPreferences((prev) => {
      const { lastCalculation, savedData, ...rest } = prev;
      return rest;
    });
  };

  const value = {
    preferences,
    setLanguage,
    setTheme,
    setTaxYear,
    saveCalculation,
    saveUserData,
    clearSavedData,
  };

  return (
    <UserPreferencesContext.Provider value={value}>
      {children}
    </UserPreferencesContext.Provider>
  );
}
