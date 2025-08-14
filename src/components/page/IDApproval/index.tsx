"use client"

import { useIdApprovalLogic } from "@/services/hooks/useIdApprovalLogic"

import { IdApprovalHeader, IdApprovalTable, IdApprovalTablePagination, IdApprovalDetail } from "./components";

interface Props {
  className?: string
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
    onFilterChange,
    setSelected,
    onUpdateStatus,
    onChangeChecked,
    onChangeCheckedItem,
  } = useIdApprovalLogic();

  return (
    <div className={`rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] ${className}`}>
      <IdApprovalHeader
        totalCount={totalCount}
        isLoading={isLoading}
        filters={filters}
        onFilterChange={onFilterChange}
      />
      <IdApprovalTable
        filters={filters}
        data={data}
        isLoading={isLoading}
        tableColumns={tableColumns}
        checked={checked}
        checkedItems={checkedItems}
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
      <IdApprovalDetail selected={selected} setSelected={setSelected} isUpdating={isUpdating} onUpdateStatus={onUpdateStatus} />
    </div>
  )
}

export default IDApproval