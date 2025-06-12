import React from 'react';
import Input from '@/components/form/input/InputField';
import Select from '@/components/form/Select';
import Label from '@/components/form/Label';
import Radio from '@/components/form/input/Radio';

interface FormData {
  currency: string;
  salaryFrom: number;
  salaryTo: number;
  salaryType: string;
}

interface CompensationStepProps {
  formData: FormData;
  onUpdateField: (field: keyof FormData, value: any) => void;
}

const CompensationStep: React.FC<CompensationStepProps> = ({
  formData,
  onUpdateField
}) => {
  const currencyOptions = [
    { value: 'USD', label: 'USD ($)' },
    { value: 'CAD', label: 'CAD (C$)' },
    { value: 'EUR', label: 'EUR (€)' },
  ];

  const salaryTypeOptions = [
    { value: 'hourly', label: 'Hourly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly', label: 'Yearly' },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
        Compensation
      </h2>
      
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>Currency *</Label>
            <Select
              options={currencyOptions}
              onChange={(value: string) => onUpdateField('currency', value)}
              defaultValue={formData.currency}
            />
          </div>
          <div>
            <Label>Salary From *</Label>
            <Input
              type="number"
              placeholder="50000"
              min="0"
              defaultValue={formData.salaryFrom.toString()}
              onChange={(e) => onUpdateField('salaryFrom', parseInt(e.target.value) || 0)}
            />
          </div>
          <div>
            <Label>Salary To *</Label>
            <Input
              type="number"
              placeholder="80000"
              min="0"
              defaultValue={formData.salaryTo.toString()}
              onChange={(e) => onUpdateField('salaryTo', parseInt(e.target.value) || 0)}
            />
          </div>
        </div>

        <div>
          <Label>Salary Type *</Label>
          <div className="flex gap-4 mt-3">
            {salaryTypeOptions.map((option) => (
              <Radio
                key={option.value}
                id={`salaryType-${option.value}`}
                name="salaryType"
                value={option.value}
                label={option.label}
                checked={formData.salaryType === option.value}
                onChange={(value) => onUpdateField('salaryType', value)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompensationStep;
