// ─── Enums ───────────────────────────────────────────────────────────────────

export enum ListingStatus {
  DRAFT = "DRAFT",
  ACTIVE = "ACTIVE",
  PENDING_REVIEW = "PENDING_REVIEW",
  INACTIVE = "INACTIVE",
  ARCHIVED = "ARCHIVED",
  RENTED = "RENTED",
}

export enum PropertyType {
  OFFICE = "OFFICE",
  COWORKING = "COWORKING",
  RETAIL = "RETAIL",
  WAREHOUSE = "WAREHOUSE",
  INDUSTRIAL = "INDUSTRIAL",
  MEDICAL = "MEDICAL",
  FLEX = "FLEX",
}

export enum InquiryType {
  GENERAL = "GENERAL",
  TOUR_REQUEST = "TOUR_REQUEST",
  APPLICATION = "APPLICATION",
  QUESTION = "QUESTION",
}

export enum InquiryStatus {
  PENDING = "PENDING",
  CONTACTED = "CONTACTED",
  TOUR_SCHEDULED = "TOUR_SCHEDULED",
  APPLICATION_RECEIVED = "APPLICATION_RECEIVED",
  CLOSED = "CLOSED",
}

// ─── Core Types ──────────────────────────────────────────────────────────────

export interface OfficeSpacePhoto {
  id: string;
  listingId: string;
  url: string;
  caption: string | null;
  sortOrder: number;
  isPrimary: boolean;
  createdAt: string;
}

export interface OfficeSpaceListing {
  id: string;
  landlordId: string;
  title: string;
  description: string;
  propertyType: PropertyType;
  status: ListingStatus;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  latitude: number;
  longitude: number;
  squareFootage: number | null;
  pricePerSqFt: number | null;
  monthlyRent: number | null;
  leaseTermMonths: number | null;
  yearBuilt: number | null;
  floorsAvailable: number | null;
  parkingSpaces: number | null;
  isFurnished: boolean;
  hasAC: boolean;
  hasHighSpeedInternet: boolean;
  hasConferenceRooms: boolean;
  hasKitchen: boolean;
  hasRestrooms: boolean;
  hasElevator: boolean;
  hasSecuritySystem: boolean;
  isWheelchairAccessible: boolean;
  allowsPets: boolean;
  utilitiesIncluded: boolean;
  availableFrom: string | null;
  photos: OfficeSpacePhoto[] | null;
  features: string[] | null;
  createdAt: string;
  updatedAt: string;
}

export interface ListingInquiry {
  id: string;
  listingId: string;
  senderId: string | null;
  senderName: string;
  senderEmail: string;
  senderPhone: string | null;
  inquiryType: InquiryType;
  status: InquiryStatus;
  message: string;
  response: string | null;
  respondedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// ─── Admin Types ─────────────────────────────────────────────────────────────

export interface OfficeSpaceAdminFilters {
  page?: number;
  limit?: number;
  status?: ListingStatus;
  search?: string;
  sortBy?: string;
  sort?: "asc" | "desc";
}

export interface OfficeSpaceAdminStats {
  totalListings: number;
  activeListings: number;
  pendingReview: number;
  totalInquiries: number;
  totalLandlords: number;
  totalRevenue: number;
}

// ─── API Response Types ──────────────────────────────────────────────────────

export interface OfficeSpaceAdminListingsResponse {
  success: boolean;
  data: OfficeSpaceListing[];
  metaData: {
    page: number;
    limit: number;
    totalPages: number;
    totalCount: number;
    currentPageTotalItems: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  message?: string;
}

export interface OfficeSpaceAdminDetailResponse {
  success: boolean;
  data: OfficeSpaceListing;
  message?: string;
}

export interface OfficeSpaceAdminStatsResponse {
  success: boolean;
  data: OfficeSpaceAdminStats;
  message?: string;
}

export interface OfficeSpaceAdminInquiriesResponse {
  success: boolean;
  data: ListingInquiry[];
  metaData: {
    page: number;
    limit: number;
    totalPages: number;
    totalCount: number;
    currentPageTotalItems: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  message?: string;
}

export interface OfficeSpaceAdminStatusResponse {
  success: boolean;
  data: OfficeSpaceListing;
  message?: string;
}

// ─── Component Props Types ───────────────────────────────────────────────────

export interface OfficeSpaceAdminProps {
  className?: string;
}

export interface OfficeSpaceAdminHeaderProps {
  totalCount: number;
  isLoading: boolean;
  searchInput: string;
  setSearchInput: (v: string) => void;
  isFilterOpen: boolean;
  setIsFilterOpen: (v: boolean) => void;
  onRefetch: () => void;
  clearAllFilters: () => void;
  hasActiveFilters: boolean;
  filterDropdownContent: React.ReactNode;
}

export interface OfficeSpaceAdminFiltersProps {
  filters: OfficeSpaceAdminFilters;
  onFilterChange: (key: keyof OfficeSpaceAdminFilters, value: any) => void;
  onClearIndividualFilter: (key: keyof OfficeSpaceAdminFilters) => void;
  statusOptions: Array<{ value: string; label: string }>;
  hasActiveFilters: boolean;
}

export interface OfficeSpaceAdminTableProps {
  data: OfficeSpaceAdminListingsResponse | undefined;
  isLoading: boolean;
  tableColumns: Array<{ key: string; label: string; className?: string }>;
  getStatusBadge: (status: ListingStatus) => { variant: string; label: string };
  onViewDetails: (id: string) => void;
  onStatusChange: (id: string, status: ListingStatus) => void;
}

export interface OfficeSpaceAdminTablePaginationProps {
  data: OfficeSpaceAdminListingsResponse | undefined;
  filters: OfficeSpaceAdminFilters;
  onPageChange: (page: number) => void;
  itemsPerPageOptions: Array<{ value: string; label: string }>;
  onFilterChange: (key: keyof OfficeSpaceAdminFilters, value: any) => void;
}
