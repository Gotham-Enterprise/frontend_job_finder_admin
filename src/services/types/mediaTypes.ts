export interface MediaItem {
  id: string;
  url: string;
  fileName: string;
  objectKey: string;
  createdAt: string;
  updatedAt: string;
}

export interface MediaResponse {
  success: boolean;
  data: MediaItem[];
  metaData: {
    page: number;
    limit: number;
    totalPages: number;
    totalCount: number;
    currentPageTotalItems: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface MediaUploadResponse {
  success: boolean;
  data: MediaItem;
}

export interface MediaFilters {
  page?: number;
  limit?: number;
  type?: 'IMAGE' | 'VIDEO';
}

export interface MediaUploadData {
  mediaUpload: File;
  type: 'IMAGE' | 'VIDEO';
}

export interface MediaDeleteData {
  mediaIds: string[];
}

export type MediaType = 'IMAGE' | 'VIDEO';
