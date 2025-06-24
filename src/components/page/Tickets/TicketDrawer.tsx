import React from 'react';
import Label from '@/components/form/Label';
import Input from '@/components/ui/input/Input';
import Select from '@/components/form/Select';
import Button from '@/components/ui/button/Button';

interface TicketFormData {
  customerName: string;
  contactNumber: string;
  email: string;
  priority: 'highest' | 'high' | 'medium' | 'low' | 'lowest';
  ticketType: string;
  accountNumber: string;
  assignedTo: string;
  timezone: string;
  description: string;
}

interface TicketDrawerProps {
  isOpen: boolean;
  isVisible: boolean;
  ticketForm: TicketFormData;
  ticketNumber: string;
  onClose: () => void;
  onSave: () => void;
  onUpdateForm: (updates: Partial<TicketFormData>) => void;
  priorityOptions: Array<{ value: string; label: string }>;
  typeOptions: Array<{ value: string; label: string }>;
  assigneeOptions: Array<{ value: string; label: string }>;
  timezoneOptions: Array<{ value: string; label: string }>;
}

const TicketDrawer: React.FC<TicketDrawerProps> = ({
  isOpen,
  isVisible,
  ticketForm,
  ticketNumber,
  onClose,
  onSave,
  onUpdateForm,
  priorityOptions,
  typeOptions,
  assigneeOptions,
  timezoneOptions
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div 
        className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ease-out ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      ></div>
      
      <div className={`absolute right-0 top-0 h-full w-full max-w-lg bg-white dark:bg-gray-900 shadow-2xl transform transition-all duration-300 ease-out ${
        isVisible 
          ? 'translate-x-0 opacity-100 scale-100' 
          : 'translate-x-full opacity-0 scale-95'
      }`}>
        <div className="flex flex-col h-full shadow-[-20px_0_25px_-5px_rgba(0,0,0,0.1)] dark:shadow-[-20px_0_25px_-5px_rgba(0,0,0,0.3)]">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Create New Ticket
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Add a new support ticket to the system
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-1 mt-5 px-6 py-6 overflow-y-auto bg-gray-50/50 dark:bg-gray-900/50">
            <div className="space-y-6">
              {/* Ticket Number and Priority Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Ticket Number *
                  </Label>
                  <Input
                    type="text"
                    value={ticketNumber}
                    disabled
                    className="bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Auto-generated ticket identifier
                  </p>
                </div>
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Priority *
                  </Label>
                  <Select
                    value={ticketForm.priority}
                    onChange={(value: string) => onUpdateForm({ priority: value as 'highest' | 'high' | 'medium' | 'low' | 'lowest' })}
                    options={priorityOptions}
                  />
                </div>
              </div>

              {/* Customer Information */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Customer Name *
                </Label>
                <Input
                  type="text"
                  placeholder="Enter customer name"
                  value={ticketForm.customerName}
                  onChange={(e) => onUpdateForm({ customerName: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm"
                />
              </div>

              {/* Contact Information Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Contact Number *
                  </Label>
                  <Input
                    type="tel"
                    placeholder="+1-555-0123"
                    value={ticketForm.contactNumber}
                    onChange={(e) => onUpdateForm({ contactNumber: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm"
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email Address *
                  </Label>
                  <Input
                    type="email"
                    placeholder="customer@email.com"
                    value={ticketForm.email}
                    onChange={(e) => onUpdateForm({ email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm"
                  />
                </div>
              </div>

              {/* Type and Account Number Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Ticket Type *
                  </Label>
                  <Select
                    value={ticketForm.ticketType}
                    onChange={(value: string) => onUpdateForm({ ticketType: value })}
                    options={[{ value: '', label: 'Select ticket type' }, ...typeOptions]}
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Account Number / Customer ID
                  </Label>
                  <Input
                    type="text"
                    placeholder="ACC-123456"
                    value={ticketForm.accountNumber}
                    onChange={(e) => onUpdateForm({ accountNumber: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm"
                  />
                </div>
              </div>

              {/* Assignment and Timezone Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Assign To
                  </Label>
                  <Select
                    value={ticketForm.assignedTo}
                    onChange={(value: string) => onUpdateForm({ assignedTo: value })}
                    options={assigneeOptions}
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Timezone
                  </Label>
                  <Select
                    value={ticketForm.timezone}
                    onChange={(value: string) => onUpdateForm({ timezone: value })}
                    options={timezoneOptions}
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Description *
                </Label>
                <textarea
                  value={ticketForm.description}
                  onChange={(e) => onUpdateForm({ description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none shadow-sm"
                  placeholder="Describe the issue or request in detail..."
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Provide a clear description of the ticket request or issue.
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-end px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-6 py-2.5 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={onSave}
                disabled={!ticketForm.customerName.trim() || !ticketForm.contactNumber.trim() || !ticketForm.email.trim() || !ticketForm.description.trim() || !ticketForm.ticketType}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-all duration-200 font-medium shadow-sm hover:shadow-md disabled:shadow-none flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Create Ticket
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketDrawer;
