'use client';

import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiCreditCard, FiSmartphone, FiGift } from 'react-icons/fi';

interface DonateModalProps {
  onClose: () => void;
}

const DonateModal = ({ onClose }: DonateModalProps) => {
  const { t } = useTranslation('donate');
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.addEventListener('mousedown', handleClickOutside);

    // Prevent scrolling of the body when modal is open
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'auto';
    };
  }, [onClose]);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          ref={modalRef}
          className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden"
        >
          {/* Header */}
          <div className="bg-primary-600 px-6 py-4 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-white">{t('title')}</h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 focus:outline-none"
              aria-label={t('close')}
            >
              <FiX size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-4">
            <p className="text-lg font-medium mb-2">{t('subtitle')}</p>
            <p className="text-gray-600 mb-6">{t('description')}</p>

            {/* Donation Options */}
            <div className="space-y-4">
              <div className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors">
                <div className="flex items-center">
                  <div className="bg-primary-100 p-3 rounded-full">
                    <FiCreditCard className="text-primary-600" size={24} />
                  </div>
                  <div className="ml-4">
                    <h3 className="font-medium">{t('options.card.title')}</h3>
                    <p className="text-sm text-gray-500">{t('options.card.description')}</p>
                  </div>
                </div>
              </div>

              <div className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors">
                <div className="flex items-center">
                  <div className="bg-primary-100 p-3 rounded-full">
                    <FiSmartphone className="text-primary-600" size={24} />
                  </div>
                  <div className="ml-4">
                    <h3 className="font-medium">{t('options.upi.title')}</h3>
                    <p className="text-sm text-gray-500">{t('options.upi.description')}</p>
                  </div>
                </div>
              </div>

              <div className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors">
                <div className="flex items-center">
                  <div className="bg-primary-100 p-3 rounded-full">
                    <FiGift className="text-primary-600" size={24} />
                  </div>
                  <div className="ml-4">
                    <h3 className="font-medium">{t('options.other.title')}</h3>
                    <p className="text-sm text-gray-500">{t('options.other.description')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 flex justify-end">
            <button
              onClick={onClose}
              className="btn-secondary mr-2"
            >
              {t('close')}
            </button>
            <button className="btn-primary">
              {t('proceed')}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default DonateModal;
