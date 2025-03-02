'use client';

import { FiFolder, FiInfo } from 'react-icons/fi';
import DocumentManager from '@/components/documents/DocumentManager';

export default function DocumentsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <FiFolder className="text-indigo-600" />
            {t('documents')}
          </h1>
          <p className="text-gray-600 mt-2">
            {t('documents_description')}
          </p>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-md p-4 flex items-start gap-3">
          <FiInfo className="text-amber-500 mt-1 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-amber-800">{t('documents_security_title')}</h3>
            <p className="text-amber-700 text-sm mt-1">{t('documents_security_message')}</p>
          </div>
        </div>

        <div className="min-h-[600px]">
          <DocumentManager />
        </div>
      </div>
    </div>
  );
}
