export interface ReviewSupervisor {
  id: string;
  fullName: string | null;
  email: string;
  profilePhotoUrl: string | null;
}

export interface ReviewSupervisee {
  id: string;
  fullName: string | null;
  email: string;
  profilePhotoUrl: string | null;
  city: string | null;
  state: string | null;
  occupation: { id: number; name: string } | null;
}

export interface ReviewHire {
  id: string;
  status: string;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
}

export interface SupervisionReview {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  updatedAt: string;
  supervisorId: string;
  superviseeId: string;
  hireId: string | null;
  supervisor: ReviewSupervisor;
  supervisee: ReviewSupervisee;
  hire: ReviewHire | null;
}

export interface SupervisionReviewFilters {
  page?: number;
  limit?: number;
  keyword?: string;
  supervisorId?: string;
  superviseeId?: string;
  minRating?: number;
  maxRating?: number;
}

export interface SupervisionReviewsMetaData {
  page: number;
  limit: number;
  totalPages: number;
  totalCount: number;
  currentPageTotalItems: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface SupervisionReviewsResponse {
  success: boolean;
  data: SupervisionReview[];
  metaData: SupervisionReviewsMetaData;
  message?: string;
}

export interface SupervisionReviewDetailResponse {
  success: boolean;
  data: SupervisionReview;
  message?: string;
}

export interface SupervisionReviewDeleteResponse {
  success: boolean;
  message: string;
}
