import { apiGet, apiPost } from './apiUtils';
import {
  CreateLegalDocumentVersionPayload,
  LegalDocumentListFilters,
  LegalDocumentListResponse,
  LegalDocumentType,
  LegalDocumentVersionResponse,
} from '../types/legalDocuments';

const getBasePath = (type: LegalDocumentType) =>
  `/api/admin/legal-documents/${type}/versions`;

export const legalDocumentsApi = {
  async listVersions(
    type: LegalDocumentType,
    filters: LegalDocumentListFilters = {},
  ): Promise<LegalDocumentListResponse> {
    const queryParams = new URLSearchParams();

    if (filters.page) queryParams.append('page', filters.page.toString());
    if (filters.limit) queryParams.append('limit', filters.limit.toString());
    if (filters.sortOrder) queryParams.append('sortOrder', filters.sortOrder);

    const query = queryParams.toString();
    const endpoint = query ? `${getBasePath(type)}?${query}` : getBasePath(type);

    return apiGet<LegalDocumentListResponse>(endpoint);
  },

  async getLatestVersion(type: LegalDocumentType): Promise<LegalDocumentVersionResponse> {
    return apiGet<LegalDocumentVersionResponse>(`${getBasePath(type)}/latest`);
  },

  async getVersionById(
    type: LegalDocumentType,
    id: number,
  ): Promise<LegalDocumentVersionResponse> {
    return apiGet<LegalDocumentVersionResponse>(`${getBasePath(type)}/${id}`);
  },

  async createVersion(
    type: LegalDocumentType,
    payload: CreateLegalDocumentVersionPayload,
  ): Promise<LegalDocumentVersionResponse> {
    return apiPost<LegalDocumentVersionResponse>(getBasePath(type), payload);
  },
};
