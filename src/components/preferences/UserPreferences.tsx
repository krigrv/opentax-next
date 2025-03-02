'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Settings } from 'lucide-react';
import { useUserPreferences } from '@/contexts/UserPreferencesContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const UserPreferences = () => {
  const { t, i18n } = useTranslation('common');
  const { preferences, setLanguage, setTheme, setTaxYear } = useUserPreferences();

  const handleLanguageChange = (value: string) => {
    setLanguage(value);
    i18n.changeLanguage(value);
  };

  const handleThemeChange = (value: string) => {
    setTheme(value as 'light' | 'dark' | 'system');
  };

  const handleTaxYearChange = (value: string) => {
    setTaxYear(value);
  };

  // Generate tax year options (current year and 4 previous years)
  const currentYear = new Date().getFullYear();
  const taxYearOptions = Array.from({ length: 5 }, (_, i) => (currentYear - i).toString());

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <Settings className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">{t('preferences')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>{t('preferences')}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <div className="p-2">
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="language" className="text-sm font-medium">
                {t('language')}
              </label>
              <Select
                value={preferences.language}
                onValueChange={handleLanguageChange}
              >
                <SelectTrigger id="language">
                  <SelectValue placeholder={t('select_language')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="hi">हिन्दी (Hindi)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label htmlFor="theme" className="text-sm font-medium">
                {t('theme')}
              </label>
              <Select
                value={preferences.theme}
                onValueChange={handleThemeChange}
              >
                <SelectTrigger id="theme">
                  <SelectValue placeholder={t('select_theme')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">{t('light')}</SelectItem>
                  <SelectItem value="dark">{t('dark')}</SelectItem>
                  <SelectItem value="system">{t('system')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label htmlFor="taxYear" className="text-sm font-medium">
                {t('tax_year')}
              </label>
              <Select
                value={preferences.taxYear}
                onValueChange={handleTaxYearChange}
              >
                <SelectTrigger id="taxYear">
                  <SelectValue placeholder={t('select_tax_year')} />
                </SelectTrigger>
                <SelectContent>
                  {taxYearOptions.map((year) => (
                    <SelectItem key={year} value={year}>
                      {year}-{parseInt(year) + 1}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserPreferences;
