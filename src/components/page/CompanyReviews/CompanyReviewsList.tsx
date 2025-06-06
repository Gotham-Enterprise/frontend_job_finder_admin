import { CompanyReview } from "@/services/types/employer";
import { renderStarRating } from "@/services/utils/starUtils";
import NotFoundState from "@/components/common/NotFoundState";

interface CompanyReviewsListProps {
  companyData: any;
}

export default function CompanyReviewsList({ companyData }: CompanyReviewsListProps) {
  return (
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
          ))        ) : (
          <NotFoundState 
            title="No Reviews Yet"
            message="This company hasn't received any reviews yet."
            className="py-4"
          />
        )}
      </div>
    </div>
  );
}
