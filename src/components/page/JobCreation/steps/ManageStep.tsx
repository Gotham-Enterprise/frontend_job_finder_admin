import React from 'react';
import Label from '@/components/form/Label';
import Radio from '@/components/form/input/Radio';
import Checkbox from '@/components/form/input/Checkbox';

interface FormData {
  postingDate: string;
  autoRenew: boolean;
}

interface ManageStepProps {
  formData: FormData;
  onUpdateField: (field: keyof FormData, value: any) => void;
}

const ManageStep: React.FC<ManageStepProps> = ({
  formData,
  onUpdateField
}) => {
  const postingDateOptions = [
    { value: 'today', label: 'Post Immediately' },
    { value: 'this-week', label: 'Post This Week' },
    { value: 'this-month', label: 'Post This Month' }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
        Manage Job Posting
      </h2>
      
      <div className="space-y-6">
        <div>
          <Label>When would you like to post this job? *</Label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
            {postingDateOptions.map((option) => (
              <Radio
                key={option.value}
                id={`postingDate-${option.value}`}
                name="postingDate"
                value={option.value}
                label={option.label}
                checked={formData.postingDate === option.value}
                onChange={(value) => onUpdateField('postingDate', value)}
              />
            ))}
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Choose when you want this job posting to go live
          </p>
        </div>

        {/* Auto Renewal */}
        <div>
          <Label>Auto-Renewal Settings</Label>
          <div className="mt-3">
            <Checkbox
              id="autoRenew"
              label="Automatically renew this job posting"
              checked={formData.autoRenew}
              onChange={(checked) => onUpdateField('autoRenew', checked)}
            />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            When enabled, this job posting will automatically renew every 30 days to maintain visibility
          </p>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
            📋 Posting Management
          </h3>
          <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
            <li>• You can edit or pause this posting at any time after it goes live</li>
            <li>• Job postings remain active for 30 days by default</li>
            <li>• Auto-renewal helps maintain consistent visibility for hard-to-fill positions</li>
            <li>• You'll receive notifications about posting performance and renewals</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ManageStep;
