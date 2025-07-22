export interface SubCategory {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryWithSubCategories {
  id: string;
  name: string;
  description: string;
  subCategories: SubCategory[];
  createdAt: string;
  updatedAt: string;
}

export interface SubCategoryOption {
  value: string;
  label: string;
  isSelected?: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  metaData?: {
    page: number;
    limit: number;
    totalPages: number;
    totalCount: number;
    currentPageTotalItems: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface CategoryFormData {
  name: string;
  description: string;
  subCategories: Array<{ name: string; id?: string }>;
}

export interface SubCategoryDropdownItem {
  id: string;
  name: string;
  isNew?: boolean;
}
