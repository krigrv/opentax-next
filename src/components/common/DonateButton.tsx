'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FiHeart } from 'react-icons/fi';
import DonateModal from './DonateModal';

const DonateButton = () => {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <>
      <button
        onClick={openModal}
        className="btn-primary flex items-center"
        aria-label={t('common:donate')}
      >
        <FiHeart className="mr-2" />
        {t('common:donate')}
      </button>

      {isModalOpen && <DonateModal onClose={closeModal} />}
    </>
  );
};

export default DonateButton;
