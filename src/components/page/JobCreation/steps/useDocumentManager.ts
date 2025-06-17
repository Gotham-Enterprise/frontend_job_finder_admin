import { useState, useCallback } from 'react';
import { JobCreationDocument } from '../../../../services/types/jobCreationSteps';
import { DocumentFormData } from './DocumentDrawer';

export const useDocumentManager = (initialDocuments: JobCreationDocument[] = []) => {
  const [documents, setDocuments] = useState<JobCreationDocument[]>(initialDocuments);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [editingDocument, setEditingDocument] = useState<JobCreationDocument | null>(null);
  
  const [documentForm, setDocumentForm] = useState<DocumentFormData>({
    documentName: '',
    documentType: 'PDF',
    documentDescription: ''
  });

  const openDocumentEditor = useCallback((document?: JobCreationDocument) => {
    if (document) {
      setEditingDocument(document);
      setDocumentForm({
        documentName: document.documentName,
        documentType: document.documentType,
        documentDescription: document.documentDescription
      });
    } else {
      setEditingDocument(null);
      setDocumentForm({
        documentName: '',
        documentType: 'PDF',
        documentDescription: ''
      });
    }
    
    setIsDrawerOpen(true);
    setTimeout(() => setIsDrawerVisible(true), 10);
  }, []);

  const closeDocumentEditor = useCallback(() => {
    setIsDrawerVisible(false);
    setTimeout(() => {
      setIsDrawerOpen(false);
      setEditingDocument(null);
      setDocumentForm({
        documentName: '',
        documentType: 'PDF',
        documentDescription: ''
      });
    }, 300);
  }, []);

  const saveDocument = useCallback(() => {
    if (!documentForm.documentName.trim() || !documentForm.documentDescription.trim()) {
      return documents;
    }

    const newDocument: JobCreationDocument = {
      id: editingDocument?.id || `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      documentName: documentForm.documentName.trim(),
      documentType: documentForm.documentType,
      documentDescription: documentForm.documentDescription.trim()
    };

    let updatedDocuments: JobCreationDocument[];
    
    if (editingDocument) {
      updatedDocuments = documents.map(doc => 
        doc.id === editingDocument.id ? newDocument : doc
      );
    } else {
      updatedDocuments = [...documents, newDocument];
    }

    setDocuments(updatedDocuments);
    closeDocumentEditor();
    return updatedDocuments;
  }, [documentForm, editingDocument, documents, closeDocumentEditor]);

  const deleteDocument = useCallback((documentId: string) => {
    const updatedDocuments = documents.filter(doc => doc.id !== documentId);
    setDocuments(updatedDocuments);
    return updatedDocuments;
  }, [documents]);

  const updateDocumentForm = useCallback((updates: Partial<DocumentFormData>) => {
    setDocumentForm(prev => ({ ...prev, ...updates }));
  }, []);

  return {
    documents,
    isDrawerOpen,
    isDrawerVisible,
    editingDocument,
    documentForm,
    openDocumentEditor,
    closeDocumentEditor,
    saveDocument,
    deleteDocument,
    updateDocumentForm
  };
};
