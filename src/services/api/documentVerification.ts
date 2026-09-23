import {
  DocumentVerification,
  DocumentVerificationBatchUpdate,
  DocumentVerificationBatchUpdateResponse,
  DocumentVerificationDetailResponse,
  DocumentVerificationFilters,
  DocumentVerifications,
  DocumentVerificationStatusUpdate,
  DocumentVerificationStatusUpdateResponse,
} from "../types/documentVerification";
import { apiGet, apiPatch } from "./apiUtils";

export const documentVerificationApi = {
  async getDocumentVerifications(filters: DocumentVerificationFilters): Promise<DocumentVerifications> {
    const queryParams = new URLSearchParams();

    if (filters.page) queryParams.append("page", filters.page.toString());
    if (filters.limit) queryParams.append("limit", filters.limit.toString());
    if (filters.search) queryParams.append("search", filters.search);
    if (filters.status) queryParams.append("status", filters.status);

    const endpoint = `/api/admin/document-verifications?${queryParams.toString()}`;

    return apiGet<DocumentVerifications>(endpoint);
  },
  async getDocumentVerificationDetails(
    kind: DocumentVerification["kind"],
    id: DocumentVerification["id"]
  ): Promise<DocumentVerificationDetailResponse> {
    const endpoint = `/api/admin/document-verifications/${kind}/${id}`;

    return apiGet<DocumentVerificationDetailResponse>(endpoint);
  },
  async updateDocumentVerificationStatus(
    data: DocumentVerificationStatusUpdate
  ): Promise<DocumentVerificationStatusUpdateResponse> {
    const endpoint = `/api/admin/document-verifications/${data.kind}/${data.id}/status`;

    return apiPatch<DocumentVerificationStatusUpdateResponse>(endpoint, {
      status: data.status,
      rejectionReason: data.rejectionReason,
    });
  },
  async batchUpdateDocumentVerificationStatus(
    data: DocumentVerificationBatchUpdate
  ): Promise<DocumentVerificationBatchUpdateResponse> {
    const endpoint = `/api/admin/document-verifications/batch-status`;

    return apiPatch<DocumentVerificationBatchUpdateResponse>(endpoint, data);
  },
};
