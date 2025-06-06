  "use client";

import { useCompanyReviews } from "@/services/hooks/useEmployers";
import { CompanyReview } from "@/services/types/employer";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";
import ErrorState from "@/components/common/ErrorState";
import BackButton from "@/components/ui/BackButton";
import { renderStarRating } from "@/services/utils/starUtils";

interface CompanyReviewsProps {
  id: string;
}

export default function CompanyReviews({ id }: CompanyReviewsProps) {
  const { data, isLoading, error } = useCompanyReviews(id);

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return <ErrorState message="Failed to load company reviews" />;
  }

  if (!data?.success || !data?.data) {
    return <ErrorState message="No company reviews found" />;
  }
  const companyData = data.data;

  return (
    <div className="p-6 space-y-6">
      <div className="px-4 pt-4 pb-2">
        <BackButton className="mb-6" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Side - Company Information */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
            <div className="flex items-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg">
                {companyData.companyName.split(' ').map(n => n.charAt(0)).join('').substring(0, 2)}
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
                  </span>
                  <span className="ml-2 text-sm text-gray-500 dark:text-gray-500">
                    ({companyData.companyReviews.length} reviews)
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="flex justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Email</span>
                  <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">{companyData.email}</span>
                </div>
                <div className="flex justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Phone</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">{companyData.phoneNumber}</span>
                </div>
                <div className="flex justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Location</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">{companyData.state}, {companyData.country}</span>
                </div>
                <div className="flex justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Address</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white text-right">{companyData.address}</span>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Employees</span>
                  <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">{companyData.employeeCount}</span>
                </div>
                <div className="flex justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Job Posts</span>
                  <span className="text-sm font-semibold text-green-600 dark:text-green-400">{companyData.jobPostCount}</span>
                </div>
                <div className="flex justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Applicants</span>
                  <span className="text-sm font-semibold text-orange-600 dark:text-orange-400">{companyData.totalApplicants}</span>
                </div>
                <div className="flex justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Status</span>
                  <span className={`text-sm font-semibold px-2 py-1 rounded-full ${
                    companyData.status === 'active' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                      : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                  }`}>
                    {companyData.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Date Joined</div>
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">
                    {new Date(companyData.dateJoined).toLocaleDateString()}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Last Activity</div>
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">
                    {new Date(companyData.lastActivity).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Company Reviews ({companyData.companyReviews.length})
              </h2>
              <div className="flex items-center">
                <div className="flex items-center">
                  {renderStarRating(parseFloat(companyData.averageRating))}
                </div>
                <span className="ml-2 text-lg font-bold text-gray-900 dark:text-white">
                  {companyData.averageRating}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              {companyData.companyReviews.length > 0 ? (
                companyData.companyReviews.map((review: CompanyReview) => (
                  <div key={review.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                          {review.name.split(' ').map(n => n.charAt(0)).join('').substring(0, 2)}
                        </div>
                        <div className="ml-3">
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            {review.name}
                          </h4>
                          <div className="flex items-center">
                            {renderStarRating(review.rating)}
                            <span className="ml-1 text-sm text-gray-600 dark:text-gray-400">
                              {review.rating}/5
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                      {review.review}
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10m0 0V6a2 2 0 00-2-2H9a2 2 0 00-2 2v2m0 0v8a2 2 0 002 2h6a2 2 0 002-2V8M9 12h6" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Reviews Yet</h3>
                  <p className="text-gray-600 dark:text-gray-400">This company hasn't received any reviews yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}