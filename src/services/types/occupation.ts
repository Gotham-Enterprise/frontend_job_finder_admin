export interface SpecialtyItem {
  id: number;
  name: string;
  ordering?: number;
}

export interface Occupation {
  id: number;
  name: string;
  keyword?: string | null;
  iconUrl?: string | null;
  isDropdown?: boolean;
  publishedJobCount?: number;
  specialty?: SpecialtyItem[];
}

export type OccupationItem = Occupation;

export interface OccupationPaginationMeta {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  currentPageTotalItems: number;
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
}

export interface OccupationQueryParams {
  page?: number;
  limit?: number | 'all';
  search?: string;
  sortBy?: string;
  hasJob?: boolean;
  includeAll?: boolean;
  isDropdown?: boolean | string;
}

export interface OccupationResponse {
  success: boolean;
  data: OccupationItem[];
  metaData?: OccupationPaginationMeta;
}

export interface OccupationListResponse {
  success: boolean;
  data: Occupation[];
  metaData?: OccupationPaginationMeta;
}

export interface SingleOccupationResponse {
  success: boolean;
  data: OccupationItem;
  message?: string;
}

export interface CreateOccupationPayload {
  name: string;
}

export interface UpdateOccupationPayload {
  name?: string;
  isDropdown?: boolean;
}
