export type DocumentVerificationKind = "walletCredential" | "education";
export type DocumentVerificationStatus = "pending" | "verified" | "rejected";

export interface DocumentVerification {
  kind: DocumentVerificationKind;
  id: string;
  category: string;
  documentName: string;
  fileName: string | null;
  verificationStatus: DocumentVerificationStatus;
  verificationReviewedAt: string | null;
  verificationRejectionReason: string | null;
  createdAt: string;
  candidate: {
    id: string;
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      fullName: string;
    } | null;
  } | null;
}

export interface DocumentVerifications {
  success: boolean;
  data: DocumentVerification[];
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

export interface DocumentVerificationFilters {
  search?: string;
  limit: number;
  page: number;
  status?: string;
}

export interface DocumentVerificationDetailResponse {
  success: boolean;
  data: {
    kind: DocumentVerificationKind;
    id: string;
    category: string;
    documentName: string;
    fileName: string | null;
    documentUrl: string | null;
    verificationStatus: DocumentVerificationStatus;
    verificationReviewedAt: string | null;
    verificationRejectionReason: string | null;
    createdAt: string;
    candidate: {
      id: string;
      name: string;
      email: string;
    };
  };
}

export interface DocumentVerificationStatusUpdate {
  kind: DocumentVerificationKind;
  id: string;
  status: "verified" | "rejected";
  rejectionReason?: string;
}

export interface DocumentVerificationStatusUpdateResponse {
  success: boolean;
  kind: DocumentVerificationKind;
  id: string;
  verificationStatus: DocumentVerificationStatus;
}

export interface DocumentVerificationBatchUpdate {
  items: { kind: DocumentVerificationKind; id: string }[];
  status: "verified" | "rejected";
  rejectionReason?: string;
}

export interface DocumentVerificationBatchUpdateResponse {
  success: boolean;
  count: number;
  results: ({ kind: DocumentVerificationKind; id: string; verificationStatus: DocumentVerificationStatus } | {
    kind: DocumentVerificationKind;
    id: string;
    error: string;
  })[];
}

export interface UseDocumentVerificationLogic {
  data: DocumentVerification[];
  isLoading: boolean;
  totalCount: number;
  tableColumns: { key: string; label: string; className?: string }[];
  metaData: DocumentVerifications["metaData"];
  filters: DocumentVerificationFilters;
  itemsPerPageOptions: { value: string; label: string }[];
  checked: boolean;
  checkedItems: { kind: DocumentVerificationKind; id: string }[];
  isPending: boolean;
  isSaving: boolean;
  showModal: boolean;
  modalData: {
    title: string;
    subtitle: string;
    subtitle2: string;
  } | null;
  onFilterChange: (key: string, value: string | number) => void;
  onChangeChecked: (checked: boolean) => void;
  onChangeCheckedItem: (kind: DocumentVerificationKind, id: string) => void;
  onBatchUpdate: (status: "verified" | "rejected", rejectionReason?: string) => void;
  onToggleModal: () => void;
  onViewDetails: (kind: DocumentVerificationKind, id: string) => void;
}

export interface UseDocumentVerificationDetailLogic {
  document: DocumentVerificationDetailResponse["data"];
  isLoading: boolean;
  isPendingStatus: boolean;
  isStatusUpdated: boolean;
  displayReview: boolean;
  onToggleReview: () => void;
  onUpdateStatus: (status: "verified" | "rejected", rejectionReason?: string) => void;
}
