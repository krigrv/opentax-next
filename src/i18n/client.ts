'use client';

import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import I18nextBrowserLanguageDetector from 'i18next-browser-languagedetector';
import { getOptions } from './settings';

// Import translations
import enCommon from './locales/en/common.json';
import enTaxCalculator from './locales/en/taxCalculator.json';
import enAiAssistant from './locales/en/aiAssistant.json';
import enDocumentManager from './locales/en/documentManager.json';
import enUpdatesPanel from './locales/en/updatesPanel.json';
import enDonate from './locales/en/donate.json';
import enAuth from './locales/en/auth.json';

import hiCommon from './locales/hi/common.json';
import hiTaxCalculator from './locales/hi/taxCalculator.json';
import hiAiAssistant from './locales/hi/aiAssistant.json';
import hiDocumentManager from './locales/hi/documentManager.json';
import hiUpdatesPanel from './locales/hi/updatesPanel.json';
import hiDonate from './locales/hi/donate.json';
import hiAuth from './locales/hi/auth.json';

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
        documentManager: enDocumentManager,
        updatesPanel: enUpdatesPanel,
        donate: enDonate,
        auth: enAuth
      },
      hi: {
        common: hiCommon,
        taxCalculator: hiTaxCalculator,
        aiAssistant: hiAiAssistant,
        documentManager: hiDocumentManager,
        updatesPanel: hiUpdatesPanel,
        donate: hiDonate,
        auth: hiAuth
      },
    },
    detection: {
      order: ['path', 'htmlTag', 'cookie', 'navigator'],
    },
  });

export default i18next;
