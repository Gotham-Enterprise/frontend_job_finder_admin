import React from 'react';
import Input from '@/components/form/input/InputField';
import Select from '@/components/form/Select';
import Label from '@/components/form/Label';
import {FormData, CompensationStepProps} from '@/services/types/compensation';


const CompensationStep: React.FC<CompensationStepProps> = ({
  formData,
  onUpdateField
}) => {
  const salaryTypeOptions = [
    { value: 'hourly', label: 'Hourly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly', label: 'Yearly' },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
      Salary Range
      </h2>
      <p className="mb-4">Provide a salary range for candidates. If the pay is a fixed amount, enter the same figure in both fields.</p>
        <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>From *</Label>
            <Input
              type="number"
              placeholder="50000"
              min="0"
              defaultValue={formData.salaryFrom.toString()}
              onChange={(e) => onUpdateField('salaryFrom', parseInt(e.target.value) || 0)}
            />
          </div>
          <div>
            <Label>To *</Label>
            <Input
              type="number"
              placeholder="80000"
              min="0"
              defaultValue={formData.salaryTo.toString()}
              onChange={(e) => onUpdateField('salaryTo', parseInt(e.target.value) || 0)}
            />
          </div>
          <div>
            <Label>Salary Type *</Label>
            <Select
              options={salaryTypeOptions}
              onChange={(value: string) => onUpdateField('salaryType', value)}
              defaultValue={formData.salaryType}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompensationStep;
