'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  FiFile, FiFileText, FiUpload, FiDownload, FiTrash2, 
  FiPlus, FiSearch, FiFilter, FiCalendar, FiFolder
} from 'react-icons/fi';
import { useUserPreferences } from '@/contexts/UserPreferencesContext';

interface Document {
  id: string;
  name: string;
  type: 'form16' | 'panCard' | 'aadhaar' | 'bankStatement' | 'investmentProof' | 'rentReceipt' | 'other';
  size: number;
  uploadDate: Date;
  taxYear: string;
  preview?: string; // Base64 encoded preview
}

const DocumentManager = () => {
  const { t } = useTranslation('common');
  const { preferences, updatePreferences } = useUserPreferences();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>(preferences.taxYear || 'all');
  const [dragActive, setDragActive] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadType, setUploadType] = useState<Document['type']>('other');
  const [uploadYear, setUploadYear] = useState<string>(preferences.taxYear || '2024-25');

  // Load documents from local storage
  useEffect(() => {
    try {
      const savedDocuments = localStorage.getItem('opentax-documents');
      if (savedDocuments) {
        const parsedDocuments = JSON.parse(savedDocuments);
        // Convert string dates back to Date objects
        const formattedDocuments = parsedDocuments.map((doc: any) => ({
          ...doc,
          uploadDate: new Date(doc.uploadDate),
        }));
        setDocuments(formattedDocuments);
      }
    } catch (error) {
      console.error('Failed to load documents from localStorage:', error);
    }
  }, []);

  // Save documents to local storage
  useEffect(() => {
    if (documents.length > 0) {
      try {
        localStorage.setItem('opentax-documents', JSON.stringify(documents));
      } catch (error) {
        console.error('Failed to save documents to localStorage:', error);
      }
    }
  }, [documents]);

  // Filter documents based on search, type, and year
  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || doc.type === selectedType;
    const matchesYear = selectedYear === 'all' || doc.taxYear === selectedYear;
    return matchesSearch && matchesType && matchesYear;
  });

  // Document type options
  const documentTypes = [
    { value: 'form16', label: t('form_16') },
    { value: 'panCard', label: t('pan_card') },
    { value: 'aadhaar', label: t('aadhaar') },
    { value: 'bankStatement', label: t('bank_statement') },
    { value: 'investmentProof', label: t('investment_proof') },
    { value: 'rentReceipt', label: t('rent_receipt') },
    { value: 'other', label: t('other_document') },
  ];

  // Tax year options
  const taxYears = [
    '2024-25',
    '2023-24',
    '2022-23',
    '2021-22',
    '2020-21',
  ];

  // Handle file drop
  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setUploadFile(e.dataTransfer.files[0]);
      setShowUploadModal(true);
    }
  };

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadFile(e.target.files[0]);
      setShowUploadModal(true);
    }
  };

  // Handle document upload
  const handleUpload = async () => {
    if (!uploadFile) return;

    // Create a preview (in a real app, this would be a proper thumbnail)
    const reader = new FileReader();
    reader.onload = (e) => {
      const newDocument: Document = {
        id: Date.now().toString(),
        name: uploadFile.name,
        type: uploadType,
        size: uploadFile.size,
        uploadDate: new Date(),
        taxYear: uploadYear,
        preview: e.target?.result as string,
      };
      
      setDocuments((prev) => [...prev, newDocument]);
      setShowUploadModal(false);
      setUploadFile(null);
      setUploadType('other');
    };
    
    reader.readAsDataURL(uploadFile);
  };

  // Handle document deletion
  const handleDelete = (id: string) => {
    if (confirm(t('confirm_delete_document'))) {
      setDocuments((prev) => prev.filter((doc) => doc.id !== id));
    }
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  // Format date
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString(preferences.language === 'hi' ? 'hi-IN' : 'en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Get document icon based on type
  const getDocumentIcon = (type: Document['type']) => {
    switch (type) {
      case 'form16':
      case 'panCard':
      case 'aadhaar':
        return <FiFileText className="h-5 w-5 text-blue-500" />;
      case 'bankStatement':
        return <FiFileText className="h-5 w-5 text-green-500" />;
      case 'investmentProof':
        return <FiFileText className="h-5 w-5 text-purple-500" />;
      case 'rentReceipt':
        return <FiFileText className="h-5 w-5 text-orange-500" />;
      default:
        return <FiFile className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="bg-white shadow rounded-lg">
      {/* Header */}
      <div className="px-6 py-4 border-b flex justify-between items-center">
        <div className="flex items-center">
          <FiFolder className="h-6 w-6 text-indigo-600 mr-2" />
          <h2 className="text-xl font-semibold text-gray-800">{t('document_manager')}</h2>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center"
        >
          <FiPlus className="h-4 w-4 mr-1" />
          {t('upload_document')}
        </button>
      </div>

      {/* Filters */}
      <div className="px-6 py-3 border-b flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('search_documents')}
            className="pl-10 w-full border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div className="flex items-center space-x-2">
          <FiFilter className="text-gray-400" />
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="all">{t('all_types')}</option>
            {documentTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center space-x-2">
          <FiCalendar className="text-gray-400" />
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="all">{t('all_years')}</option>
            {taxYears.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Document Drop Area */}
      <div
        className={`p-8 border-2 border-dashed rounded-md m-6 flex flex-col items-center justify-center transition-colors ${
          dragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'
        }`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
      >
        <FiUpload className="h-10 w-10 text-gray-400 mb-4" />
        <p className="text-gray-600 mb-2">{t('drag_drop_documents')}</p>
        <p className="text-gray-500 text-sm mb-4">{t('or')}</p>
        <label className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 cursor-pointer">
          {t('browse_files')}
          <input
            type="file"
            className="hidden"
            onChange={handleFileSelect}
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
          />
        </label>
      </div>

      {/* Document List */}
      <div className="px-6 py-4">
        <h3 className="text-lg font-medium text-gray-800 mb-4">
          {filteredDocuments.length > 0
            ? t('your_documents')
            : t('no_documents')}
        </h3>

        {filteredDocuments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDocuments.map((doc) => (
              <div
                key={doc.id}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center">
                    {getDocumentIcon(doc.type)}
                    <div className="ml-2">
                      <h4 className="font-medium text-gray-800 truncate max-w-[180px]">
                        {doc.name}
                      </h4>
                      <p className="text-xs text-gray-500">
                        {documentTypes.find((t) => t.value === doc.type)?.label} • {doc.taxYear}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(doc.id)}
                    className="text-gray-400 hover:text-red-500"
                    aria-label={t('delete')}
                    title={t('delete')}
                  >
                    <FiTrash2 className="h-4 w-4" />
                  </button>
                </div>

                {doc.preview && (
                  <div className="h-32 bg-gray-100 rounded mb-2 flex items-center justify-center overflow-hidden">
                    {doc.preview.startsWith('data:image') ? (
                      <img
                        src={doc.preview}
                        alt={doc.name}
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : (
                      <FiFile className="h-12 w-12 text-gray-400" />
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{formatFileSize(doc.size)}</span>
                  <span>{formatDate(doc.uploadDate)}</span>
                </div>

                <button
                  className="mt-2 w-full flex items-center justify-center text-indigo-600 hover:text-indigo-800 text-sm"
                >
                  <FiDownload className="h-4 w-4 mr-1" />
                  {t('download')}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            {searchTerm || selectedType !== 'all' || selectedYear !== 'all'
              ? t('no_matching_documents')
              : t('upload_first_document')}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-800 mb-4">
              {t('upload_document')}
            </h3>

            {uploadFile && (
              <div className="mb-4 p-3 bg-gray-50 rounded border flex items-center">
                <FiFile className="h-5 w-5 text-gray-400 mr-2" />
                <div className="overflow-hidden">
                  <p className="truncate font-medium">{uploadFile.name}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(uploadFile.size)}</p>
                </div>
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('document_type')}
              </label>
              <select
                value={uploadType}
                onChange={(e) => setUploadType(e.target.value as Document['type'])}
                className="w-full border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              >
                {documentTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('tax_year')}
              </label>
              <select
                value={uploadYear}
                onChange={(e) => setUploadYear(e.target.value)}
                className="w-full border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              >
                {taxYears.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setUploadFile(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                {t('cancel')}
              </button>
              <button
                onClick={handleUpload}
                disabled={!uploadFile}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
              >
                {t('upload')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentManager;
