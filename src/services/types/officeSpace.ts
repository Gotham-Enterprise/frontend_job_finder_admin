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
  NEW = "NEW",
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
  description: string | null;
  slug: string | null;
  propertyType: string;
  status: string;
  address: string;
  address2: string | null;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  latitude: number | null;
  longitude: number | null;
  squareFootage: number;
  rentPrice: number;
  monthlyRent: number;
  rentCurrency: string;
  rentType: string;
  leaseTermMin: number | null;
  leaseTermMax: number | null;
  availableFrom: string | null;
  isFurnished: boolean;
  numExamRooms: number | null;
  numOffices: number | null;
  numRestrooms: number | null;
  numParkingSpots: number | null;
  hasReception: boolean;
  hasWaitingRoom: boolean;
  hasKitchen: boolean;
  hasStorage: boolean;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  contactUrl: string | null;
  floorPlanUrl: string | null;
  virtualTourUrl: string | null;
  isPublished: boolean;
  isFeatured: boolean;
  viewsCount: number;
  inquiriesCount: number;
  photos: OfficeSpacePhoto[] | null;
  amenities: string[] | null;
  landlord: { id: string; businessName: string | null; avatarUrl: string | null } | null;
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
  inactiveListings: number;
  totalInquiries: number;
  newInquiries: number;
  totalLandlords: number;
  totalRevenue: number;
  byPropertyType: Array<{ propertyType: string; _count: number }>;
  topCities: Array<{ city: string; _count: number }>;
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
