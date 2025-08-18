import { Dispatch, SetStateAction } from "react";

export interface UseIdApprovalLogic {
  data: IdApproval[];
  isLoading: boolean;
  totalCount: number;
  selected: IdApproval | null;
  tableColumns: { key: string; label: string; className?: string }[];
  metaData: IdApprovals["metaData"];
  filters: IdApprovalFilters;
  itemsPerPageOptions: { value: string; label: string }[];
  isUpdating: boolean;
  checked: boolean;
  checkedItems: IdApproval["id"][];
  isPending: boolean;
  isSaving: boolean;
  showModal: boolean;
  modalData: {
    title: string;
    subtitle: string;
    subtitle2: string;
  } | null;
  setSelected: Dispatch<SetStateAction<IdApproval | null>>;
  onFilterChange: (key: string, value: string | number) => void;
  onUpdateStatus: (id: IdApprovalStatusUpdate["id"], status: IdApprovalStatusUpdate["status"]) => void;
  onChangeChecked: (checked: boolean) => void;
  onChangeCheckedItem: (id: IdApproval["id"]) => void;
  onBatchUpdate: (status: IdApproval["status"]) => void;
  onToggleModal: () => void;
  onViewDetails: (id: IdApproval["id"]) => void;
}

export interface IdApproval {
  id: string;
  userId: string;
  status: "pending" | "approved" | "declined";
  front: string;
  back: string;
  isLocked: boolean;
  fullName: string;
  email: string;
  profilePicture: string | null;
}

export interface IdApprovals {
  success: boolean;
  data: IdApproval[];
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

export interface IdApprovalFilters {
  search?: string;
  limit: number;
  page: number;
  status?: string;
}

export interface IdApprovalStatusUpdate {
  id: string;
  status: IdApproval["status"];
}

export interface IdApprovalStatusUpdateResponse {
  success: boolean;
  data: IdApproval;
  message: string;
}

export interface IdApprovalBatchUpdate {
  ids: IdApproval["id"][];
  status: IdApproval["status"];
}

export interface IdApprovalBatchUpdateResponse {
  success: boolean;
  count: number;
  message: string;
}

export interface IdApprovalDetailResponse {
  success: boolean;
  data: {
    id: IdApproval["id"];
    status: IdApproval["status"];
    profile: {
      isLocked: IdApproval["isLocked"];
      name: string;
      email: string;
      degree: string;
      picture: string;
      specialty: string;
      address: string;
      licenses: string;
      phoneNumber: string;
    };
    securityQuestions: {
      question: string;
      answer: string;
    }[];
    activityLogs: any[];
  };
}

export interface UseIdApprovalDetailLogic {
  id: IdApprovalDetailResponse["data"]["id"];
  isLocked: IdApprovalDetailResponse["data"]["profile"]["isLocked"];
  status: IdApprovalDetailResponse["data"]["status"];
  profile: IdApprovalDetailResponse["data"]["profile"];
  securityQuestions: IdApprovalDetailResponse["data"]["securityQuestions"];
  activityLogs: IdApprovalDetailResponse["data"]["activityLogs"];
}
