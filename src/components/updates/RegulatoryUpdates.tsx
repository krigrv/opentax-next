'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  FiBell, FiCalendar, FiExternalLink, FiBookmark, 
  FiFilter, FiSearch, FiChevronDown, FiChevronUp 
} from 'react-icons/fi';
import { useUserPreferences } from '@/contexts/UserPreferencesContext';

interface Update {
  id: string;
  title: string;
  description: string;
  date: Date;
  source: string;
  sourceUrl: string;
  category: 'tax' | 'compliance' | 'deadline' | 'policy' | 'court';
  isBookmarked: boolean;
  isRead: boolean;
}

const RegulatoryUpdates = () => {
  const { t } = useTranslation('common');
  const { preferences } = useUserPreferences();
  const [updates, setUpdates] = useState<Update[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedUpdates, setExpandedUpdates] = useState<string[]>([]);
  const [bookmarkedOnly, setBookmarkedOnly] = useState(false);
  const [unreadOnly, setUnreadOnly] = useState(false);

  // Load mock updates (in a real app, this would come from an API)
  useEffect(() => {
    // Try to load from localStorage first
    try {
      const savedUpdates = localStorage.getItem('opentax-regulatory-updates');
      if (savedUpdates) {
        const parsedUpdates = JSON.parse(savedUpdates);
        // Convert string dates back to Date objects
        const formattedUpdates = parsedUpdates.map((update: any) => ({
          ...update,
          date: new Date(update.date),
        }));
        setUpdates(formattedUpdates);
        return;
      }
    } catch (error) {
      console.error('Failed to load updates from localStorage:', error);
    }

    // If nothing in localStorage, load mock data
    const mockUpdates: Update[] = [
      {
        id: '1',
        title: t('update_title_1'),
        description: t('update_description_1'),
        date: new Date(2025, 1, 15),
        source: 'Income Tax Department',
        sourceUrl: 'https://incometaxindia.gov.in',
        category: 'tax',
        isBookmarked: false,
        isRead: false,
      },
      {
        id: '2',
        title: t('update_title_2'),
        description: t('update_description_2'),
        date: new Date(2025, 1, 10),
        source: 'Ministry of Finance',
        sourceUrl: 'https://finmin.nic.in',
        category: 'policy',
        isBookmarked: false,
        isRead: false,
      },
      {
        id: '3',
        title: t('update_title_3'),
        description: t('update_description_3'),
        date: new Date(2025, 1, 5),
        source: 'CBDT',
        sourceUrl: 'https://incometaxindia.gov.in',
        category: 'deadline',
        isBookmarked: false,
        isRead: false,
      },
      {
        id: '4',
        title: t('update_title_4'),
        description: t('update_description_4'),
        date: new Date(2025, 0, 28),
        source: 'Supreme Court of India',
        sourceUrl: 'https://main.sci.gov.in',
        category: 'court',
        isBookmarked: false,
        isRead: false,
      },
      {
        id: '5',
        title: t('update_title_5'),
        description: t('update_description_5'),
        date: new Date(2025, 0, 20),
        source: 'GST Council',
        sourceUrl: 'https://gstcouncil.gov.in',
        category: 'compliance',
        isBookmarked: false,
        isRead: false,
      },
    ];
    
    setUpdates(mockUpdates);
  }, [t]);

  // Save updates to local storage when they change
  useEffect(() => {
    if (updates.length > 0) {
      try {
        localStorage.setItem('opentax-regulatory-updates', JSON.stringify(updates));
      } catch (error) {
        console.error('Failed to save updates to localStorage:', error);
      }
    }
  }, [updates]);

  // Filter updates based on search, category, bookmarked, and unread
  const filteredUpdates = updates.filter((update) => {
    const matchesSearch = 
      update.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      update.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || update.category === selectedCategory;
    const matchesBookmarked = !bookmarkedOnly || update.isBookmarked;
    const matchesUnread = !unreadOnly || !update.isRead;
    return matchesSearch && matchesCategory && matchesBookmarked && matchesUnread;
  });

  // Sort updates by date (newest first)
  const sortedUpdates = [...filteredUpdates].sort((a, b) => b.date.getTime() - a.date.getTime());

  // Category options
  const categories = [
    { value: 'tax', label: t('category_tax'), color: 'bg-blue-100 text-blue-800' },
    { value: 'compliance', label: t('category_compliance'), color: 'bg-green-100 text-green-800' },
    { value: 'deadline', label: t('category_deadline'), color: 'bg-red-100 text-red-800' },
    { value: 'policy', label: t('category_policy'), color: 'bg-purple-100 text-purple-800' },
    { value: 'court', label: t('category_court'), color: 'bg-orange-100 text-orange-800' },
  ];

  // Toggle expanded state of an update
  const toggleExpanded = (id: string) => {
    setExpandedUpdates((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
    
    // Mark as read when expanded
    if (!expandedUpdates.includes(id)) {
      setUpdates((prev) =>
        prev.map((update) =>
          update.id === id ? { ...update, isRead: true } : update
        )
      );
    }
  };

  // Toggle bookmarked state
  const toggleBookmarked = (id: string) => {
    setUpdates((prev) =>
      prev.map((update) =>
        update.id === id ? { ...update, isBookmarked: !update.isBookmarked } : update
      )
    );
  };

  // Format date
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString(preferences.language === 'hi' ? 'hi-IN' : 'en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Get category badge
  const getCategoryBadge = (category: Update['category']) => {
    const categoryInfo = categories.find((c) => c.value === category);
    return (
      <span className={`text-xs px-2 py-1 rounded-full ${categoryInfo?.color}`}>
        {categoryInfo?.label}
      </span>
    );
  };

  return (
    <div className="bg-white shadow rounded-lg">
      {/* Header */}
      <div className="px-6 py-4 border-b flex justify-between items-center">
        <div className="flex items-center">
          <FiBell className="h-6 w-6 text-indigo-600 mr-2" />
          <h2 className="text-xl font-semibold text-gray-800">{t('regulatory_updates')}</h2>
        </div>
        <div className="text-sm text-gray-500">
          {t('last_updated')}: {formatDate(new Date())}
        </div>
      </div>

      {/* Filters */}
      <div className="px-6 py-3 border-b flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('search_updates')}
            className="pl-10 w-full border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div className="flex items-center space-x-2">
          <FiFilter className="text-gray-400" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="all">{t('all_categories')}</option>
            {categories.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={bookmarkedOnly}
              onChange={() => setBookmarkedOnly(!bookmarkedOnly)}
              className="rounded text-indigo-600 focus:ring-indigo-500"
            />
            <span>{t('bookmarked_only')}</span>
          </label>
          <label className="flex items-center space-x-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={unreadOnly}
              onChange={() => setUnreadOnly(!unreadOnly)}
              className="rounded text-indigo-600 focus:ring-indigo-500"
            />
            <span>{t('unread_only')}</span>
          </label>
        </div>
      </div>

      {/* Updates List */}
      <div className="divide-y">
        {sortedUpdates.length > 0 ? (
          sortedUpdates.map((update) => (
            <div
              key={update.id}
              className={`p-4 transition-colors ${
                !update.isRead ? 'bg-indigo-50' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-1">
                    <FiCalendar className="h-4 w-4 text-gray-400 mr-1" />
                    <span className="text-sm text-gray-500 mr-2">
                      {formatDate(update.date)}
                    </span>
                    {getCategoryBadge(update.category)}
                  </div>
                  <h3
                    className={`font-medium text-lg mb-1 ${
                      !update.isRead ? 'text-indigo-700' : 'text-gray-800'
                    }`}
                  >
                    {update.title}
                  </h3>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => toggleBookmarked(update.id)}
                    className={`p-1.5 rounded-full ${
                      update.isBookmarked
                        ? 'text-yellow-500 hover:text-yellow-600'
                        : 'text-gray-400 hover:text-gray-600'
                    }`}
                    aria-label={update.isBookmarked ? t('remove_bookmark') : t('bookmark')}
                    title={update.isBookmarked ? t('remove_bookmark') : t('bookmark')}
                  >
                    <FiBookmark
                      className="h-5 w-5"
                      fill={update.isBookmarked ? 'currentColor' : 'none'}
                    />
                  </button>
                  <button
                    onClick={() => toggleExpanded(update.id)}
                    className="p-1.5 rounded-full text-gray-400 hover:text-gray-600"
                    aria-label={expandedUpdates.includes(update.id) ? t('collapse') : t('expand')}
                    title={expandedUpdates.includes(update.id) ? t('collapse') : t('expand')}
                  >
                    {expandedUpdates.includes(update.id) ? (
                      <FiChevronUp className="h-5 w-5" />
                    ) : (
                      <FiChevronDown className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {expandedUpdates.includes(update.id) && (
                <div className="mt-2">
                  <p className="text-gray-700 mb-3">{update.description}</p>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">
                      {t('source')}: {update.source}
                    </span>
                    <a
                      href={update.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-800 flex items-center"
                    >
                      {t('view_source')}
                      <FiExternalLink className="ml-1 h-4 w-4" />
                    </a>
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            {searchTerm || selectedCategory !== 'all' || bookmarkedOnly || unreadOnly
              ? t('no_matching_updates')
              : t('no_updates')}
          </div>
        )}
      </div>

      {/* Load More Button (would be connected to pagination in a real app) */}
      {sortedUpdates.length > 0 && (
        <div className="px-6 py-4 border-t border-[hsl(var(--border))]">
          <button className="w-full py-2 text-indigo-600 hover:text-indigo-800 text-sm font-medium">
            {t('load_more_updates')}
          </button>
        </div>
      )}
    </div>
  );
};

export default RegulatoryUpdates;
