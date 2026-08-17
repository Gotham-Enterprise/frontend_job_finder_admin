import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { showToast } from "@/services/utils/toast";

import {
  DocumentVerificationFilters,
  DocumentVerificationKind,
  UseDocumentVerificationLogic,
} from "../types/documentVerification";
import { useGetDocumentVerifications, useDocumentVerificationBatchUpdateStatus } from "./useDocumentVerification";

export const useDocumentVerificationLogic = (): UseDocumentVerificationLogic => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const getInitialFilters = (): DocumentVerificationFilters => {
    const search = searchParams.get("search") || "";
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const status =
      searchParams.get("status") || sessionStorage.getItem("document-verification-status-filter") || "pending";

    return { search, limit, page, status };
  };

  const initialFilters = getInitialFilters();

  /** states */
  const [filters, setFilters] = useState<DocumentVerificationFilters>(initialFilters);
  const [checked, setChecked] = useState<boolean>(false);
  const [checkedItems, setCheckedItems] = useState<{ kind: DocumentVerificationKind; id: string }[]>([]);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [modalData, setModalData] = useState<UseDocumentVerificationLogic["modalData"]>(null);

  /** queries/mutations */
  const { data: documentVerifications, isFetching: isLoading, refetch } = useGetDocumentVerifications(filters);
  const { mutate: batchUpdate, isPending: isSaving } = useDocumentVerificationBatchUpdateStatus();

  const totalCount = documentVerifications?.metaData.totalCount || 0;
  const metaData = documentVerifications?.metaData || {
    page: 1,
    limit: 50,
    totalPages: 1,
    totalCount: 0,
    currentPageTotalItems: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  };

  /** memos */
  const tableColumns = useMemo(
    () => [
      { key: "candidate", label: "Candidate" },
      { key: "email", label: "Email" },
      { key: "category", label: "Category" },
      { key: "document", label: "Document" },
      { key: "status", label: "Status" },
      { key: "actions", label: "Action", className: "text-right" },
    ],
    []
  );
  const itemsPerPageOptions = useMemo(
    () => [
      { value: "10", label: "10 per page" },
      { value: "20", label: "20 per page" },
      { value: "50", label: "50 per page" },
      { value: "100", label: "100 per page" },
    ],
    []
  );
  const data = useMemo(() => documentVerifications?.data || [], [documentVerifications]);
  const isPending = useMemo(() => filters.status === "pending", [filters.status]);

  /** useEffects */
  useEffect(() => {
    const params = new URLSearchParams();

    if (filters.page) params.set("page", filters.page.toString());
    if (filters.limit) params.set("limit", filters.limit.toString());
    if (filters.search) params.set("search", encodeURIComponent(filters.search));
    if (filters.status) params.set("status", filters.status);

    const nextUrl = params.toString() ? `?${params.toString()}` : "";
    const url = window.location.search;

    if (nextUrl !== url) {
      router.replace(`/admin/document-verifications${nextUrl}`, { scroll: false });

      refetch();
    }
  }, [filters, router, refetch]);
  useEffect(() => {
    const isAllChecked =
      data.length > 0 && data.every((item) => checkedItems.some((c) => c.kind === item.kind && c.id === item.id));

    setChecked(isAllChecked);
  }, [checkedItems, data]);

  /** callbacks */
  const onFilterChange = useCallback((key: string, value: string | number) => {
    setFilters((prev) => ({ ...prev, [key]: value }));

    if (key === "status") {
      sessionStorage.setItem("document-verification-status-filter", value.toString());
    }
  }, []);
  const onChangeChecked = useCallback(
    (checked: boolean) => {
      setChecked(checked);

      if (checked) {
        setCheckedItems(data.map((item) => ({ kind: item.kind, id: item.id })));
      } else {
        setCheckedItems([]);
      }
    },
    [data]
  );
  const onChangeCheckedItem = useCallback((kind: DocumentVerificationKind, id: string) => {
    setCheckedItems((prev) => {
      const exists = prev.some((item) => item.kind === kind && item.id === id);
      if (exists) {
        return prev.filter((item) => !(item.kind === kind && item.id === id));
      }
      return [...prev, { kind, id }];
    });
  }, []);
  const onBatchUpdate = useCallback(
    (status: "verified" | "rejected", rejectionReason?: string) => {
      if (checkedItems.length) {
        batchUpdate(
          { items: checkedItems, status, rejectionReason },
          {
            onSuccess: (data) => {
              refetch();
              setCheckedItems([]);
              setChecked(false);
              setModalData({
                title: status === "verified" ? "Documents Approved" : "Documents Rejected",
                subtitle: `You have successfully ${status === "verified" ? "approved" : "rejected"} ${data.count} document(s).`,
                subtitle2:
                  status === "verified"
                    ? "A confirmation email has been sent for each document with further instructions."
                    : "",
              });
              setShowModal(true);
            },
            onError: (error) => {
              showToast.error("Unable to update documents", error.message);
            },
          }
        );
      }
    },
    [checkedItems, batchUpdate, refetch]
  );
  const onToggleModal = useCallback(() => {
    setShowModal((prev) => !prev);
  }, []);
  const onViewDetails = useCallback(
    (kind: DocumentVerificationKind, id: string) => {
      router.push(`/admin/document-verifications/details/${kind}/${id}`);
    },
    [router]
  );

  return {
    data,
    isLoading,
    totalCount,
    metaData,
    tableColumns,
    filters,
    itemsPerPageOptions,
    checked,
    checkedItems,
    isPending,
    isSaving,
    showModal,
    modalData,
    onFilterChange,
    onChangeChecked,
    onChangeCheckedItem,
    onBatchUpdate,
    onToggleModal,
    onViewDetails,
  };
};
