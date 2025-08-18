"use client";

import { useIdApprovalLogic } from "@/services/hooks/useIdApprovalLogic";

import { IdApprovalHeader, IdApprovalModal, IdApprovalTable, IdApprovalTablePagination } from "./components";

interface Props {
  className?: string;
}

const IDApproval: React.FC<Props> = ({ className }) => {
  const {
    data,
    isLoading,
    tableColumns,
    metaData,
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
        onChangeChecked={onChangeChecked}
        onChangeCheckedItem={onChangeCheckedItem}
        onViewDetails={onViewDetails}
      />
      <IdApprovalTablePagination
        data={data}
        isLoading={isLoading}
        metaData={metaData}
        filters={filters}
        itemsPerPageOptions={itemsPerPageOptions}
        onFilterChange={onFilterChange}
      />
      <IdApprovalModal showModal={showModal} modalData={modalData} onToggleModal={onToggleModal} />
    </div>
  );
};

export default IDApproval;
