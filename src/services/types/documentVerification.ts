export type DocumentVerificationKind = "walletCredential" | "education" | "ceuDocument";
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

// The AI/candidate-entered field values for this record — shape varies by kind
// (see backend document_verification_service.js#getDocumentVerification), so this
// stays a loose record rather than a discriminated union; consumers look up only
// the keys they know how to label/format.
export type DocumentVerificationFields = Record<string, string | null | undefined>;

export interface DocumentVerificationHistoryChange {
  field: string;
  from: string | null;
  to: string | null;
}

export interface DocumentVerificationHistoryEntry {
  id: string;
  action: string;
  details: {
    documentName?: string;
    category?: string;
    status?: string;
    rejectionReason?: string | null;
    reQueuedForReview?: boolean;
    changes?: DocumentVerificationHistoryChange[];
    fields?: DocumentVerificationFields;
  } | null;
  timestamp: string;
  actor: {
    role: string;
    name: string;
    email?: string;
  };
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
    fields: DocumentVerificationFields;
    verificationStatus: DocumentVerificationStatus;
    verificationReviewedAt: string | null;
    verificationRejectionReason: string | null;
    createdAt: string;
    updatedAt: string;
    candidate: {
      id: string;
      name: string;
      email: string;
    };
    history: DocumentVerificationHistoryEntry[];
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
