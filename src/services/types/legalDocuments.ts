export type LegalDocumentType = 'privacy-policy' | 'terms-of-use';

export interface LegalDocumentVersion {
  id: number;
  content: string;
  contentPreview?: string;
  createdAt: string;
  updatedAt: string;
  isLatest: boolean;
  agreementCount?: number;
}

export interface LegalDocumentListFilters {
  page?: number;
  limit?: number;
  sortOrder?: 'asc' | 'desc';
}

export interface LegalDocumentListResponse {
  success: boolean;
  data: LegalDocumentVersion[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
  };
  latestVersionId: number | null;
}

export interface LegalDocumentVersionResponse {
  success: boolean;
  data: LegalDocumentVersion;
  message?: string;
}

export interface CreateLegalDocumentVersionPayload {
  content: string;
}

export const LEGAL_DOCUMENT_LABELS: Record<LegalDocumentType, { title: string; singular: string }> = {
  'privacy-policy': {
    title: 'Privacy Policy',
    singular: 'privacy policy',
  },
  'terms-of-use': {
    title: 'Terms of Use',
    singular: 'terms of use',
  },
};
