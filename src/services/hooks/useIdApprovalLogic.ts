import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { showToast } from "@/services/utils/toast";
import { useUnlockRequestContext } from "@/context/UnlockRequestContext";

import { IdApproval, IdApprovalFilters, IdApprovalStatusUpdate, UseIdApprovalLogic } from "../types/idApproval";
import { useGetIdApprovals, useIdApprovalUpdateStatus, useIdApprovalBatchUpdateStatus } from "./useIdApproval";

export const useIdApprovalLogic = (): UseIdApprovalLogic => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refetch: refetchUnlockCount } = useUnlockRequestContext();

  const getInitialFilters = (): IdApprovalFilters => {
    const search = searchParams.get("search") || "";
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const status = searchParams.get("status") || sessionStorage.getItem("id-approval-status-filter") || "pending";

    return { search, limit, page, status };
  };

  const initialFilters = getInitialFilters();

  /** states */
  const [filters, setFilters] = useState<IdApprovalFilters>(initialFilters);
  const [selected, setSelected] = useState<IdApproval | null>(null);
  const [checked, setChecked] = useState<boolean>(false);
  const [checkedItems, setCheckedItems] = useState<IdApproval["id"][]>([]);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [modalData, setModalData] = useState<UseIdApprovalLogic["modalData"]>(null);

  /** queries/mutations */
  const { data: idApprovals, isFetching: isLoading, refetch } = useGetIdApprovals(filters);
  const { mutate: batchUpdate, isPending: isSaving } = useIdApprovalBatchUpdateStatus();

  const totalCount = idApprovals?.metaData.totalCount || 0;
  const metaData = idApprovals?.metaData || {
    page: 1,
    limit: 50,
    totalPages: 1,
    totalCount: 0,
    currentPageTotalItems: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  };
  const { mutate, isPending: isUpdating } = useIdApprovalUpdateStatus();

  /** memos */
  const tableColumns = useMemo(
    () => [
      { key: "name", label: "Name" },
      { key: "email", label: "Email" },
      { key: "accountStatus", label: "Account Status" },
      { key: "status", label: "ID Status" },
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
  const data = useMemo(() => idApprovals?.data || [], [idApprovals]);
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
      router.replace(`/admin/unlock-requests${nextUrl}`, { scroll: false });

      refetch();
    }
  }, [filters, router, refetch]);
  useEffect(() => {
    const isAllChecked = data.every((item) => checkedItems.includes(item.id));

    setChecked(isAllChecked);
  }, [checkedItems, data]);

  /** callbacks */
  const onFilterChange = useCallback((key: string, value: string | number) => {
    setFilters((prev) => ({ ...prev, [key]: value }));

    if (key === "status") {
      sessionStorage.setItem("id-approval-status-filter", value.toString());
    }
  }, []);
  const onUpdateStatus = useCallback(
    (id: IdApprovalStatusUpdate["id"], status: IdApprovalStatusUpdate["status"]) => {
      mutate(
        { id, status },
        {
          onSuccess: (data) => {
            setSelected(null);
            refetch();
            refetchUnlockCount(); // Refetch unlock request count

            const title = status === "approved" ? "Unlock Request Approved" : "Unlock Request Declined";

            showToast.success(title, data.message);
          },
        }
      );
    },
    [mutate, refetch, refetchUnlockCount, setSelected]
  );
  const onChangeChecked = useCallback(
    (checked: boolean) => {
      setChecked(checked);

      if (checked) {
        setCheckedItems(data.map((item) => item.id));
      } else {
        setCheckedItems([]);
      }
    },
    [data]
  );
  const onChangeCheckedItem = useCallback(
    (id: IdApproval["id"]) => {
      if (checkedItems.includes(id)) {
        setCheckedItems((prev) => prev.filter((item) => item !== id));
      } else {
        setCheckedItems((prev) => [...prev, id]);
      }
    },
    [checkedItems]
  );
  const onBatchUpdate = useCallback(
    (status: IdApproval["status"]) => {
      console.log("status", status);
      if (checkedItems.length) {
        batchUpdate(
          { ids: checkedItems, status },
          {
            onSuccess: (data) => {
              refetch();
              refetchUnlockCount(); // Refetch unlock request count
              setCheckedItems([]);
              setChecked(false);
              setModalData({
                title: data.message,
                subtitle: `You have successfully ${status} ${data.count} Accounts.`,
                subtitle2:
                  status === "approved"
                    ? " A confirmation email has been sent to each accounts with further instructions."
                    : "",
              });
              setShowModal(true);
            },
          }
        );
      }
    },
    [checkedItems, batchUpdate, refetch, refetchUnlockCount]
  );
  const onToggleModal = useCallback(() => {
    setShowModal((prev) => !prev);
  }, []);
  const onViewDetails = useCallback(
    (id: IdApproval["id"]) => {
      router.push(`/admin/unlock-requests/details/${id}`);
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
    selected,
    isUpdating,
    checked,
    checkedItems,
    isPending,
    isSaving,
    showModal,
    modalData,
    onFilterChange,
    setSelected,
    onUpdateStatus,
    onChangeChecked,
    onChangeCheckedItem,
    onBatchUpdate,
    onToggleModal,
    onViewDetails,
  };
};
