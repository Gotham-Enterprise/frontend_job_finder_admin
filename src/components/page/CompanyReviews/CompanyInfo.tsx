import { renderStarRating } from "@/services/utils/starUtils";
import { formatDate } from "@/services/utils/dateUtils";

interface CompanyField {
  label: string;
  value: string | number;
  colorClass: string;
  extraClass?: string;
  isStatus?: boolean;
}

interface CompanyInfoProps {
  companyData: any;
}

const getCompanyFields = (companyData: any): CompanyField[][] => {
  return [
    [
      { 
        label: "Email", 
        value: companyData.email, 
        colorClass: "text-blue-600 dark:text-blue-400" 
      },
      { 
        label: "Phone", 
        value: companyData.phoneNumber, 
        colorClass: "text-gray-900 dark:text-white" 
      },
      { 
        label: "Location", 
        value: `${companyData.state}, ${companyData.country}`, 
        colorClass: "text-gray-900 dark:text-white" 
      },
      { 
        label: "Address", 
        value: companyData.address, 
        colorClass: "text-gray-900 dark:text-white",
        extraClass: "text-right"
      }
    ],
    [
      { 
        label: "Employees", 
        value: companyData.employeeCount, 
        colorClass: "text-sm font-semibold text-gray-900 dark:text-white" 
      },
      { 
        label: "Job Posts", 
        value: companyData.jobPostCount, 
        colorClass: "text-sm font-semibold text-gray-900 dark:text-white" 
      },
      { 
        label: "Total Applicants", 
        value: companyData.totalApplicants, 
        colorClass: "text-sm font-semibold text-gray-900 dark:text-white" 
      },
      { 
        label: "Status", 
        value: companyData.status, 
        colorClass: "",
        isStatus: true
      }
    ]
  ];
};

export default function CompanyInfo({ companyData }: CompanyInfoProps) {
  const companyFields = getCompanyFields(companyData);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
      <div className="flex items-center mb-6">        <div className="w-16 h-16 bg-gradient-to-br bg-primary rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg">
          {companyData.companyName.split(' ').map((n: string) => n.charAt(0)).join('').substring(0, 2)}
        </div>
        <div className="ml-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {companyData.companyName}
          </h1>
          <div className="flex items-center mt-2">
            <div className="flex items-center">
              {renderStarRating(parseFloat(companyData.averageRating))}
            </div>
            <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
              {companyData.averageRating} / 5.0
            </span>            <span className="ml-2 text-sm text-gray-500 dark:text-gray-500">
              ({companyData.companyReviews?.length || 0} reviews)
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {companyFields.map((columnFields, columnIndex) => (
          <div key={columnIndex} className="space-y-4">
            {columnFields.map((field, fieldIndex) => (
              <div key={fieldIndex} className="flex justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  {field.label}
                </span>
                {field.isStatus ? (
                  <span className={`text-sm font-semibold px-2 py-1 rounded-full ${
                    companyData.status === 'active' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                      : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                  }`}>
                    {field.value}
                  </span>
                ) : (
                  <span className={`text-sm font-semibold ${field.colorClass} ${field.extraClass || ''}`}>
                    {field.value}
                  </span>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Registration date</div>
            <div className="text-sm font-semibold text-gray-900 dark:text-white">
              {formatDate(companyData.dateJoined)}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Last Activity</div>
            <div className="text-sm font-semibold text-gray-900 dark:text-white">
              {formatDate(companyData.lastActivity)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
