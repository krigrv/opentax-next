'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FiInfo, FiExternalLink, FiChevronRight, FiCalendar, FiBookmark } from 'react-icons/fi';

// Types
interface Update {
  id: string;
  title: string;
  description: string;
  date: Date;
  category: 'tax' | 'legal' | 'deadline' | 'feature';
  link?: string;
  isNew: boolean;
}

const UpdatesPanel = () => {
  const { t } = useTranslation('updatesPanel');
  const [filter, setFilter] = useState<string>('all');
  
  // Mock data
  const updates: Update[] = [
    {
      id: 'update-1',
      title: t('mockData.update1.title'),
      description: t('mockData.update1.description'),
      date: new Date('2025-02-25'),
      category: 'tax',
      link: 'https://incometaxindia.gov.in',
      isNew: true
    },
    {
      id: 'update-2',
      title: t('mockData.update2.title'),
      description: t('mockData.update2.description'),
      date: new Date('2025-02-20'),
      category: 'deadline',
      isNew: true
    },
    {
      id: 'update-3',
      title: t('mockData.update3.title'),
      description: t('mockData.update3.description'),
      date: new Date('2025-02-15'),
      category: 'legal',
      link: 'https://incometaxindia.gov.in/news/circular-5-2025.pdf',
      isNew: false
    },
    {
      id: 'update-4',
      title: t('mockData.update4.title'),
      description: t('mockData.update4.description'),
      date: new Date('2025-02-10'),
      category: 'feature',
      isNew: false
    },
    {
      id: 'update-5',
      title: t('mockData.update5.title'),
      description: t('mockData.update5.description'),
      date: new Date('2025-02-05'),
      category: 'tax',
      link: 'https://incometaxindia.gov.in/tutorials/new-regime-guide.pdf',
      isNew: false
    }
  ];
  
  // Filter updates based on selected category
  const filteredUpdates = filter === 'all' 
    ? updates 
    : updates.filter(update => update.category === filter);
  
  // Format date
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Get category badge
  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'tax':
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
            {t('categories.tax')}
          </span>
        );
      case 'legal':
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
            {t('categories.legal')}
          </span>
        );
      case 'deadline':
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
            {t('categories.deadline')}
          </span>
        );
      case 'feature':
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
            {t('categories.feature')}
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-lg">
      {/* Header */}
      <div className="p-4 border-b">
        <h2 className="text-xl font-semibold">{t('title')}</h2>
        <p className="text-gray-500 text-sm mt-1">{t('description')}</p>
      </div>
      
      {/* Filters */}
      <div className="p-4 border-b">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-full text-sm ${
              filter === 'all'
                ? 'bg-gray-800 text-white'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            {t('filters.all')}
          </button>
          <button
            onClick={() => setFilter('tax')}
            className={`px-3 py-1 rounded-full text-sm ${
              filter === 'tax'
                ? 'bg-blue-600 text-white'
                : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
            }`}
          >
            {t('filters.tax')}
          </button>
          <button
            onClick={() => setFilter('legal')}
            className={`px-3 py-1 rounded-full text-sm ${
              filter === 'legal'
                ? 'bg-purple-600 text-white'
                : 'bg-purple-100 text-purple-800 hover:bg-purple-200'
            }`}
          >
            {t('filters.legal')}
          </button>
          <button
            onClick={() => setFilter('deadline')}
            className={`px-3 py-1 rounded-full text-sm ${
              filter === 'deadline'
                ? 'bg-red-600 text-white'
                : 'bg-red-100 text-red-800 hover:bg-red-200'
            }`}
          >
            {t('filters.deadline')}
          </button>
          <button
            onClick={() => setFilter('feature')}
            className={`px-3 py-1 rounded-full text-sm ${
              filter === 'feature'
                ? 'bg-green-600 text-white'
                : 'bg-green-100 text-green-800 hover:bg-green-200'
            }`}
          >
            {t('filters.feature')}
          </button>
        </div>
      </div>
      
      {/* Updates List */}
      <div className="divide-y">
        {filteredUpdates.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">{t('noUpdates')}</p>
          </div>
        ) : (
          filteredUpdates.map(update => (
            <div key={update.id} className="p-4 hover:bg-gray-50">
              <div className="flex items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {getCategoryBadge(update.category)}
                    {update.isNew && (
                      <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                        {t('new')}
                      </span>
                    )}
                  </div>
                  
                  <h3 className="font-medium text-gray-900">
                    {update.title}
                  </h3>
                  
                  <p className="text-gray-600 mt-1">
                    {update.description}
                  </p>
                  
                  <div className="flex items-center text-sm text-gray-500 mt-2">
                    <FiCalendar className="mr-1" size={14} />
                    {formatDate(update.date)}
                  </div>
                </div>
                
                <div className="ml-4">
                  {update.link ? (
                    <a
                      href={update.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
                    >
                      <FiExternalLink size={16} />
                    </a>
                  ) : (
                    <button className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200">
                      <FiChevronRight size={16} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* Subscription Banner */}
      <div className="p-4 bg-primary-50 rounded-b-lg">
        <div className="flex items-start">
          <div className="mr-3 mt-1">
            <FiInfo className="text-primary-500" size={20} />
          </div>
          <div>
            <h4 className="font-medium text-primary-800">
              {t('subscription.title')}
            </h4>
            <p className="text-sm text-primary-700 mt-1">
              {t('subscription.description')}
            </p>
            <button className="mt-2 inline-flex items-center text-sm font-medium text-primary-700 hover:text-primary-800">
              <FiBookmark className="mr-1" size={14} />
              {t('subscription.button')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdatesPanel;
