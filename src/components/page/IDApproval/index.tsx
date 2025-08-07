"use client"

import { useIdApprovalLogic } from "@/services/hooks/useIdApprovalLogic"

import { IdApprovalHeader, IdApprovalTable } from "./components";

interface Props {
  className?: string
}

const IDApproval: React.FC<Props> = ({ className }) => {
  const { data, isLoading, totalCount, tableColumns } = useIdApprovalLogic();

  return (
    <div className={`rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] ${className}`}>
      <IdApprovalHeader totalCount={totalCount} isLoading={isLoading} />
      <IdApprovalTable data={data} isLoading={isLoading} tableColumns={tableColumns} />
    </div>
  )
}

export default IDApproval