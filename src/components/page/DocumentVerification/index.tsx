"use client";

import { useDocumentVerificationLogic } from "@/services/hooks/useDocumentVerificationLogic";

import {
  DocumentVerificationHeader,
  DocumentVerificationModal,
  DocumentVerificationTable,
  DocumentVerificationTablePagination,
} from "./components";

interface Props {
  className?: string;
}

const DocumentVerification: React.FC<Props> = ({ className }) => {
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
  } = useDocumentVerificationLogic();

  return (
    <div
      className={`rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] ${className}`}
    >
      <DocumentVerificationHeader
        filters={filters}
        checkedItems={checkedItems}
        isSaving={isSaving}
        onFilterChange={onFilterChange}
        onBatchUpdate={onBatchUpdate}
      />
      <DocumentVerificationTable
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
      <DocumentVerificationTablePagination
        data={data}
        isLoading={isLoading}
        metaData={metaData}
        filters={filters}
        itemsPerPageOptions={itemsPerPageOptions}
        onFilterChange={onFilterChange}
      />
      <DocumentVerificationModal showModal={showModal} modalData={modalData} onToggleModal={onToggleModal} />
    </div>
  );
};

export default DocumentVerification;
