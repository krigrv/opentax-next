'use client';

import { useState, useEffect } from 'react';
import { FiHeart, FiX } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';

const DonationNotificationBar = () => {
  const { t } = useTranslation('common');
  const [isVisible, setIsVisible] = useState(true);
  const [isInitialRender, setIsInitialRender] = useState(true);

  useEffect(() => {
    // Check if notification was previously dismissed
    const isDismissed = localStorage.getItem('donationBarDismissed');
    if (isDismissed) {
      setIsVisible(false);
    }
    setIsInitialRender(false);
  }, []);

  const dismissNotification = () => {
    setIsVisible(false);
    // Remember the dismissal for 7 days
    localStorage.setItem('donationBarDismissed', 'true');
    setTimeout(() => {
      localStorage.removeItem('donationBarDismissed');
    }, 7 * 24 * 60 * 60 * 1000); // 7 days
  };

  // Don't render anything during SSR to avoid hydration mismatch
  if (isInitialRender) {
    return null;
  }

  if (!isVisible) {
    return null;
  }

  return (
    <div className="sticky top-0 z-50 w-full bg-primary-600 text-white px-4 py-2 text-center">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex-1"></div>
        <div className="flex items-center justify-center">
          <FiHeart className="mr-2 text-red-300" />
          <span>
            {t('donationBar.message')}{' '}
            <Link 
              href="/donate" 
              className="font-medium underline hover:text-white transition-colors"
            >
              {t('donationBar.action')}
            </Link>
          </span>
        </div>
        <div className="flex-1 flex justify-end">
          <button
            onClick={dismissNotification}
            className="text-white hover:text-gray-200 focus:outline-none"
            aria-label={t('donationBar.dismiss')}
          >
            <FiX />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DonationNotificationBar;
