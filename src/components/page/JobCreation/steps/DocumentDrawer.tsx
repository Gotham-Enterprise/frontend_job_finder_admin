import React from 'react';
import Label from '@/components/form/Label';
import { JobCreationDocument } from '../../../../services/types/jobCreationSteps';

export interface DocumentFormData {
  documentName: string;
  documentType: 'PDF' | 'DOC' | 'JPEG' | 'PNG';
  documentDescription: string;
}

interface DocumentDrawerProps {
  isOpen: boolean;
  isVisible: boolean;
  editingDocument: JobCreationDocument | null;
  documentForm: DocumentFormData;
  onClose: () => void;
  onSave: () => void;
  onUpdateForm: (updates: Partial<DocumentFormData>) => void;
}

const DocumentDrawer: React.FC<DocumentDrawerProps> = ({
  isOpen,
  isVisible,
  editingDocument,
  documentForm,
  onClose,
  onSave,
  onUpdateForm
}) => {
  if (!isOpen) return null;

  const documentTypes = [
    { value: 'PDF' as const, label: 'PDF', description: 'Portable Document Format' },
    { value: 'DOC' as const, label: 'DOC', description: 'Microsoft Word Document' },
    { value: 'JPEG' as const, label: 'JPEG', description: 'JPEG Image' },
    { value: 'PNG' as const, label: 'PNG', description: 'PNG Image' }
  ];

  const getDocumentIcon = (type: string) => {
    switch (type.toUpperCase()) {
      case 'PDF':
        return (
          <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
          </svg>
        );
      case 'DOC':
        return (
          <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
          </svg>
        );
      case 'JPEG':
      case 'PNG':
        return (
          <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
   
      <div 
        className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ease-out ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      ></div>
      
      <div className={`absolute right-0 top-0 h-full w-full max-w-lg bg-white dark:bg-gray-900 shadow-2xl transform transition-all duration-300 ease-out ${
        isVisible 
          ? 'translate-x-0 opacity-100 scale-100' 
          : 'translate-x-full opacity-0 scale-95'
      }`}>
        <div className="flex flex-col h-full shadow-[-20px_0_25px_-5px_rgba(0,0,0,0.1)] dark:shadow-[-20px_0_25px_-5px_rgba(0,0,0,0.3)]">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900/50 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {editingDocument ? 'Edit Document' : 'Add New Document'}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {editingDocument ? 'Modify existing document requirements' : 'Create a new document requirement for candidates'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="flex-1 mt-5 px-6 py-6 overflow-y-auto bg-gray-50/50 dark:bg-gray-900/50">
            <div className="space-y-8">
            
              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Document Name</Label>
                <input
                  type="text"
                  value={documentForm.documentName}
                  onChange={(e) => onUpdateForm({ documentName: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 shadow-sm"
                  placeholder="e.g., Certificate of Employment, Resume, Portfolio"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Enter a clear, descriptive name for the document candidates need to upload.
                </p>
              </div>

           
              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Document Type</Label>
                <div className="grid grid-cols-2 gap-3">
                  {documentTypes.map((type) => (
                    <div 
                      key={type.value}
                      className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                        documentForm.documentType === type.value
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                          : 'border-gray-300 dark:border-gray-600 hover:border-green-300 hover:bg-green-50/50 dark:hover:bg-green-900/10'
                      }`}
                      onClick={() => onUpdateForm({ documentType: type.value })}
                    >
                      <div className="flex items-center space-x-3">
                        {getDocumentIcon(type.value)}
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{type.label}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{type.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
            
              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</Label>
                <textarea
                  value={documentForm.documentDescription}
                  onChange={(e) => onUpdateForm({ documentDescription: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 resize-none shadow-sm"
                  placeholder="Provide details about this document requirement. Include any specific formatting requirements, file size limits, or additional instructions for candidates."
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  This description will help candidates understand what document they need to upload and any specific requirements.
                </p>
              </div>
            </div>
          </div>
          
   
          <div className="flex items-center justify-end px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-6 py-2.5 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={onSave}
                disabled={!documentForm.documentName.trim() || !documentForm.documentDescription.trim()}
                className="px-6 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-all duration-200 font-medium shadow-sm hover:shadow-md disabled:shadow-none flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {editingDocument ? 'Update Document' : 'Save Document'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentDrawer;
