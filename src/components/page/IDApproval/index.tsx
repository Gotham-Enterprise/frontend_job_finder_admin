"use client";

import { useIdApprovalLogic } from "@/services/hooks/useIdApprovalLogic";

import {
  IdApprovalHeader,
  IdApprovalTable,
  IdApprovalTablePagination,
  IdApprovalDetail,
  IdApprovalModal,
} from "./components";

interface Props {
  className?: string;
}

const IDApproval: React.FC<Props> = ({ className }) => {
  const {
    data,
    isLoading,
    totalCount,
    tableColumns,
    metaData,
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
  } = useIdApprovalLogic();

  return (
    <div
      className={`rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] ${className}`}
    >
      <IdApprovalHeader
        filters={filters}
        checkedItems={checkedItems}
        isSaving={isSaving}
        onFilterChange={onFilterChange}
        onBatchUpdate={onBatchUpdate}
      />
      <IdApprovalTable
        filters={filters}
        data={data}
        isLoading={isLoading}
        tableColumns={tableColumns}
        checked={checked}
        checkedItems={checkedItems}
        isPending={isPending}
        setSelected={setSelected}
        onChangeChecked={onChangeChecked}
        onChangeCheckedItem={onChangeCheckedItem}
      />
      <IdApprovalTablePagination
        data={data}
        isLoading={isLoading}
        metaData={metaData}
        filters={filters}
        itemsPerPageOptions={itemsPerPageOptions}
        onFilterChange={onFilterChange}
      />
      <IdApprovalDetail
        selected={selected}
        setSelected={setSelected}
        isUpdating={isUpdating}
        onUpdateStatus={onUpdateStatus}
      />
      <IdApprovalModal showModal={showModal} modalData={modalData} onToggleModal={onToggleModal} />
    </div>
  );
};

export default IDApproval;
