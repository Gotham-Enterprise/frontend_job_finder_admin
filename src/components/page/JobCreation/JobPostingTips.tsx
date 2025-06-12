import React from 'react';

const JobPostingTips: React.FC = () => {
  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800 p-6">
      <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4">
        💡 Tips for Better Job Posts
      </h3>
      <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
        <li>• Use clear, descriptive job titles</li>
        <li>• Include specific requirements and qualifications</li>
        <li>• Mention company benefits and culture</li>
        <li>• Be transparent about salary ranges</li>
        <li>• Use formatting to make descriptions scannable</li>
      </ul>
    </div>
  );
};

export default JobPostingTips;
