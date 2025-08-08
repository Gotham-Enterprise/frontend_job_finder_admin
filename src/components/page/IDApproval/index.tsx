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
    onFilterChange,
    setSelected
  } = useIdApprovalLogic();

  return (
    <div className={`rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] ${className}`}>
      <IdApprovalHeader
        totalCount={totalCount}
        isLoading={isLoading}
        onFilterChange={onFilterChange}
      />
      <IdApprovalTable data={data} isLoading={isLoading} tableColumns={tableColumns} setSelected={setSelected} />
      <IdApprovalTablePagination
        data={data}
        isLoading={isLoading}
        metaData={metaData}
        filters={filters}
        itemsPerPageOptions={itemsPerPageOptions}
        onFilterChange={onFilterChange}
      />
      <IdApprovalDetail selected={selected} setSelected={setSelected} />
    </div>
  )
}

export default IDApproval