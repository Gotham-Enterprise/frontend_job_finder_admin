import React from 'react';
import Label from '@/components/form/Label';
import RichTextEditor from '@/components/form/input/RichTextEditor';

interface JobDescriptionStepProps {
  description: string;
  onUpdateDescription: (value: string) => void;
}

const JobDescriptionStep: React.FC<JobDescriptionStepProps> = ({
  description,
  onUpdateDescription
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
        Job Description
      </h2>
      
      <div className="space-y-4">
        <Label>Describe the position, requirements, and benefits</Label>
        <RichTextEditor
          content={description}
          onChange={onUpdateDescription}
          placeholder="Write a compelling job description that attracts the right candidates..."
        />
      </div>
    </div>
  );
};

export default JobDescriptionStep;
