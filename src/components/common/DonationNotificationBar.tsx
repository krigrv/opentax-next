'use client';

import { useState, useEffect } from 'react';
import { Heart, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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
    <div className="sticky top-0 z-50 w-full bg-primary text-primary-foreground px-4 py-2 text-center">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex-1"></div>
        <div className="flex items-center justify-center">
          <Heart className="mr-2 h-4 w-4 text-red-300" />
          <span>
            {t('donationBar.message')}{' '}
            <Link 
              href="/donate" 
              className="font-medium underline hover:text-primary-foreground/90 transition-colors"
            >
              {t('donationBar.action')}
            </Link>
          </span>
        </div>
        <div className="flex-1 flex justify-end">
          <Button
            onClick={dismissNotification}
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-primary-foreground hover:text-primary-foreground/90 hover:bg-primary/90"
            aria-label={t('donationBar.dismiss')}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DonationNotificationBar;
