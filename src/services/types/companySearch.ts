export interface Company {
  id: string;
  companyName: string;
  state: string;
  sizeOfCompany: number;
}

export interface CompanySearchResponse {
  success: boolean;
  data: Company[];
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

export interface CompanySearchFilters {
  page?: number;
  limit?: number;
  search?: string;
}

export interface CompanySearchProps {
  onCompanySelect: (company: Company) => void;
}