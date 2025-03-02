'use client';

import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import I18nextBrowserLanguageDetector from 'i18next-browser-languagedetector';
import { getOptions } from './settings';

// Import translations
import enCommon from './locales/en/common.json';
import enTaxCalculator from './locales/en/taxCalculator.json';
import enAiAssistant from './locales/en/aiAssistant.json';
import enDocuments from './locales/en/documents.json';
import enUpdates from './locales/en/updates.json';
import enDonate from './locales/en/donate.json';

import hiCommon from './locales/hi/common.json';
import hiTaxCalculator from './locales/hi/taxCalculator.json';
import hiAiAssistant from './locales/hi/aiAssistant.json';
import hiDocuments from './locales/hi/documents.json';
import hiUpdates from './locales/hi/updates.json';
import hiDonate from './locales/hi/donate.json';

// Initialize i18next for client-side
i18next
  .use(initReactI18next)
  .use(I18nextBrowserLanguageDetector)
  .init({
    ...getOptions(),
    resources: {
      en: {
        common: enCommon,
        taxCalculator: enTaxCalculator,
        aiAssistant: enAiAssistant,
        documents: enDocuments,
        updates: enUpdates,
        donate: enDonate,
      },
      hi: {
        common: hiCommon,
        taxCalculator: hiTaxCalculator,
        aiAssistant: hiAiAssistant,
        documents: hiDocuments,
        updates: hiUpdates,
        donate: hiDonate,
      },
    },
    detection: {
      order: ['path', 'htmlTag', 'cookie', 'navigator'],
    },
  });

export default i18next;
