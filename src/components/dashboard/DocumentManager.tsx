'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  FiUpload, 
  FiFile, 
  FiFileText, 
  FiFilePlus, 
  FiTrash2, 
  FiDownload, 
  FiEye, 
  FiSearch,
  FiGrid,
  FiList,
  FiFilter
} from 'react-icons/fi';

// Types
interface Document {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadDate: Date;
  category: 'income' | 'investment' | 'property' | 'other';
}

const DocumentManager = () => {
  const { t } = useTranslation('documentManager');
  
  // State
  const [documents, setDocuments] = useState<Document[]>(getMockDocuments());
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  
  // Filter documents based on search query and category
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });
  
  // Handle file upload
  const handleFileUpload = (files: FileList | null) => {
    if (!files) return;
    
    // In a real app, this would upload the files to a server
    // For demo purposes, we'll just add them to our local state
    const newDocuments: Document[] = [];
    
    Array.from(files).forEach(file => {
      const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
      const fileType = getFileType(fileExtension);
      
      newDocuments.push({
        id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: file.name,
        type: fileType,
        size: formatFileSize(file.size),
        uploadDate: new Date(),
        category: 'other'
      });
    });
    
    setDocuments([...newDocuments, ...documents]);
  };
  
  // Handle drag events
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileUpload(e.dataTransfer.files);
  };
  
  // Handle document selection
  const toggleDocumentSelection = (id: string) => {
    setSelectedDocuments(prev => 
      prev.includes(id) 
        ? prev.filter(docId => docId !== id) 
        : [...prev, id]
    );
  };
  
  // Handle document deletion
  const deleteSelectedDocuments = () => {
    setDocuments(documents.filter(doc => !selectedDocuments.includes(doc.id)));
    setSelectedDocuments([]);
  };
  
  // Helper functions
  const getFileType = (extension: string) => {
    const imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'bmp'];
    const pdfType = ['pdf'];
    const docTypes = ['doc', 'docx', 'txt', 'rtf'];
    const spreadsheetTypes = ['xls', 'xlsx', 'csv'];
    
    if (imageTypes.includes(extension)) return 'image';
    if (pdfType.includes(extension)) return 'pdf';
    if (docTypes.includes(extension)) return 'document';
    if (spreadsheetTypes.includes(extension)) return 'spreadsheet';
    return 'other';
  };
  
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <FiFileText className="text-red-500" />;
      case 'document':
        return <FiFileText className="text-blue-500" />;
      case 'spreadsheet':
        return <FiFileText className="text-green-500" />;
      case 'image':
        return <FiFile className="text-purple-500" />;
      default:
        return <FiFile className="text-gray-500" />;
    }
  };
  
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Mock data
  function getMockDocuments(): Document[] {
    return [
      {
        id: 'doc-1',
        name: 'Form16_FY2023-24.pdf',
        type: 'pdf',
        size: '1.2 MB',
        uploadDate: new Date('2023-05-15'),
        category: 'income'
      },
      {
        id: 'doc-2',
        name: 'Investment_Proof_LIC.pdf',
        type: 'pdf',
        size: '856 KB',
        uploadDate: new Date('2023-04-10'),
        category: 'investment'
      },
      {
        id: 'doc-3',
        name: 'HRA_Receipts.pdf',
        type: 'pdf',
        size: '1.5 MB',
        uploadDate: new Date('2023-03-22'),
        category: 'property'
      },
      {
        id: 'doc-4',
        name: 'Medical_Bills.pdf',
        type: 'pdf',
        size: '2.3 MB',
        uploadDate: new Date('2023-02-18'),
        category: 'other'
      },
      {
        id: 'doc-5',
        name: 'PPF_Statement.pdf',
        type: 'pdf',
        size: '645 KB',
        uploadDate: new Date('2023-01-05'),
        category: 'investment'
      }
    ];
  }

  return (
    <div className="bg-white rounded-lg">
      {/* Header */}
      <div className="p-4 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="text-xl font-semibold">{t('title')}</h2>
        
        <div className="flex space-x-2">
          <button
            onClick={() => document.getElementById('fileInput')?.click()}
            className="btn-primary flex items-center"
          >
            <FiUpload className="mr-1" />
            {t('uploadButton')}
          </button>
          <input
            id="fileInput"
            type="file"
            multiple
            className="hidden"
            onChange={(e) => handleFileUpload(e.target.files)}
          />
          
          <button
            onClick={deleteSelectedDocuments}
            disabled={selectedDocuments.length === 0}
            className={`btn-outline flex items-center ${
              selectedDocuments.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <FiTrash2 className="mr-1" />
            {t('deleteButton')}
          </button>
        </div>
      </div>
      
      {/* Search and Filters */}
      <div className="p-4 border-b">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="form-input pl-10 w-full"
            />
          </div>
          
          <div className="flex space-x-2">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiFilter className="text-gray-400" />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="form-input pl-10"
              >
                <option value="all">{t('categories.all')}</option>
                <option value="income">{t('categories.income')}</option>
                <option value="investment">{t('categories.investment')}</option>
                <option value="property">{t('categories.property')}</option>
                <option value="other">{t('categories.other')}</option>
              </select>
            </div>
            
            <div className="flex border rounded-md">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-gray-100' : ''}`}
                aria-label={t('viewModes.grid')}
              >
                <FiGrid />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-gray-100' : ''}`}
                aria-label={t('viewModes.list')}
              >
                <FiList />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Drop Zone */}
      <div
        className={`p-8 border-2 border-dashed rounded-lg m-4 text-center transition-colors ${
          isDragging ? 'border-primary-500 bg-primary-50' : 'border-gray-300'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <FiFilePlus className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 text-sm text-gray-600">
          {isDragging ? t('dropHere') : t('dragAndDrop')}
        </p>
        <p className="text-xs text-gray-500 mt-1">{t('supportedFormats')}</p>
      </div>
      
      {/* Document List */}
      {filteredDocuments.length === 0 ? (
        <div className="p-8 text-center">
          <p className="text-gray-500">{t('noDocuments')}</p>
        </div>
      ) : (
        <div className={`p-4 ${viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-2'}`}>
          {filteredDocuments.map(doc => (
            <div
              key={doc.id}
              className={`border rounded-lg overflow-hidden ${
                selectedDocuments.includes(doc.id) ? 'border-primary-500 bg-primary-50' : ''
              } ${viewMode === 'list' ? 'flex items-center p-3' : ''}`}
            >
              <div
                className={`${viewMode === 'grid' ? 'p-4' : 'flex items-center flex-1'}`}
                onClick={() => toggleDocumentSelection(doc.id)}
              >
                <div className={`${viewMode === 'grid' ? 'flex items-center mb-2' : 'flex items-center'}`}>
                  <div className="h-10 w-10 flex items-center justify-center bg-gray-100 rounded mr-3">
                    {getFileIcon(doc.type)}
                  </div>
                  
                  <div className={`${viewMode === 'list' ? 'flex-1 flex items-center' : ''}`}>
                    <div className={`${viewMode === 'list' ? 'flex-1' : ''}`}>
                      <h3 className="font-medium text-gray-900 truncate" title={doc.name}>
                        {doc.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {doc.size} • {formatDate(doc.uploadDate)}
                      </p>
                    </div>
                    
                    {viewMode === 'list' && (
                      <div className="flex items-center space-x-2 ml-4">
                        <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                          {t(`categories.${doc.category}`)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                {viewMode === 'grid' && (
                  <div className="mt-2">
                    <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                      {t(`categories.${doc.category}`)}
                    </span>
                  </div>
                )}
              </div>
              
              <div className={`${viewMode === 'grid' ? 'border-t p-2 bg-gray-50 flex justify-end space-x-1' : 'flex space-x-1'}`}>
                <button
                  className="p-1 text-gray-500 hover:text-gray-700 rounded"
                  title={t('actions.view')}
                >
                  <FiEye size={16} />
                </button>
                <button
                  className="p-1 text-gray-500 hover:text-gray-700 rounded"
                  title={t('actions.download')}
                >
                  <FiDownload size={16} />
                </button>
                <button
                  className="p-1 text-gray-500 hover:text-red-500 rounded"
                  title={t('actions.delete')}
                  onClick={() => {
                    setDocuments(documents.filter(d => d.id !== doc.id));
                    setSelectedDocuments(selectedDocuments.filter(id => id !== doc.id));
                  }}
                >
                  <FiTrash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DocumentManager;
