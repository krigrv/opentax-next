'use client';

import { ReactNode, useEffect } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n/client';
import { UserPreferencesProvider } from '@/contexts/UserPreferencesContext';
import { ThemeProvider } from '@/components/theme-provider';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  useEffect(() => {
    // Set document title
    document.title = 'OpenTax - AI-Powered Tax Advisory Platform';
  }, []);

  return (
    <I18nextProvider i18n={i18n}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <UserPreferencesProvider>
          {children}
        </UserPreferencesProvider>
      </ThemeProvider>
    </I18nextProvider>
  );
}
