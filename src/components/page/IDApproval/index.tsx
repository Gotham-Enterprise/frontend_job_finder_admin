import { SearchIcon } from "@/components/ui/icons"
import Input from "@/components/ui/input/Input"

interface Props {
  className?: string
}

const IDApproval: React.FC<Props> = ({ className }) => {
  const isPending = true;
  const totalCount = 0;
  

  return (
    <div className={`rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] ${className}`}>
      <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-800">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
              Unlock Request
            </h3>
            <p className="text-sm text-gray-500 mt-1 dark:text-gray-400">
              {totalCount || 0} total unlock requests
              {isPending && (
                <span className="ml-2 text-xs text-primary">
                  Updating...
                </span>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default IDApproval