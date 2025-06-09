"use client";
import React, { useState, useEffect, useMemo, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from '../../ui/table';
import Badge from '../../ui/badge/Badge';
import Button from '../../ui/button/Button';
import Input from '../../ui/input/Input';
import Select from '../../form/Select';
import Label from '../../form/Label';
import Pagination from '../../tables/Pagination';
import TableHeading from '../../tables/tableHeader';
import { Modal } from '../../ui/modal';
import { BoltIcon, FunnelIcon, EyeIcon, PlusIcon } from '@/icons';
import { SearchIcon } from '../../ui/icons';
import ErrorState from '../../common/ErrorState';

// Mock data types
interface Ticket {
  id: string;
  ticketNo: string;
  customerName: string;
  contactNumber: string;
  email: string;
  ticketType: string;
  priority: 'high' | 'medium' | 'low';
  createdDate: string;
  lastUpdated: string;
  assignedTo: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  accountNumber?: string;
  timezone: string;
  description: string;
}

interface TicketFilters {
  page: number;
  limit: number;
  search: string;
  ticketType: string;
  priority?: string;
  status?: string;
  assignedTo: string;
}

interface TicketsProps {
  className?: string;
}

// Mock data
const mockTickets: Ticket[] = [
  {
    id: '1',
    ticketNo: 'TK-2024-001',
    customerName: 'John Doe',
    contactNumber: '+1-555-0123',
    email: 'john.doe@email.com',
    ticketType: 'Technical Support',
    priority: 'high',
    createdDate: '2024-06-01T09:30:00Z',
    lastUpdated: '2024-06-02T14:20:00Z',
    assignedTo: 'Sarah Wilson',
    status: 'in-progress',
    accountNumber: 'ACC-123456',
    timezone: 'EST',
    description: 'Unable to login to account after password reset'
  },
  {
    id: '2',
    ticketNo: 'TK-2024-002',
    customerName: 'Jane Smith',
    contactNumber: '+1-555-0124',
    email: 'jane.smith@email.com',
    ticketType: 'Billing',
    priority: 'medium',
    createdDate: '2024-06-01T11:15:00Z',
    lastUpdated: '2024-06-01T16:45:00Z',
    assignedTo: 'Mike Johnson',
    status: 'open',
    accountNumber: 'ACC-789012',
    timezone: 'PST',
    description: 'Incorrect charges on monthly bill'
  },
  {
    id: '3',
    ticketNo: 'TK-2024-003',
    customerName: 'Robert Brown',
    contactNumber: '+1-555-0125',
    email: 'robert.brown@email.com',
    ticketType: 'General Inquiry',
    priority: 'low',
    createdDate: '2024-05-30T08:20:00Z',
    lastUpdated: '2024-06-01T10:30:00Z',
    assignedTo: 'Lisa Davis',
    status: 'resolved',
    timezone: 'CST',
    description: 'Questions about service features'
  },
  {
    id: '4',
    ticketNo: 'TK-2024-004',
    customerName: 'Emily Wilson',
    contactNumber: '+1-555-0126',
    email: 'emily.wilson@email.com',
    ticketType: 'Technical Support',
    priority: 'high',
    createdDate: '2024-06-02T13:45:00Z',
    lastUpdated: '2024-06-02T15:30:00Z',
    assignedTo: 'David Miller',
    status: 'open',
    accountNumber: 'ACC-345678',
    timezone: 'EST',
    description: 'Application crashes when uploading files'
  },
  {
    id: '5',
    ticketNo: 'TK-2024-005',
    customerName: 'Michael Davis',
    contactNumber: '+1-555-0127',
    email: 'michael.davis@email.com',
    ticketType: 'Account Management',
    priority: 'medium',
    createdDate: '2024-05-29T16:00:00Z',
    lastUpdated: '2024-05-30T09:15:00Z',
    assignedTo: 'Sarah Wilson',
    status: 'closed',
    accountNumber: 'ACC-901234',
    timezone: 'MST',
    description: 'Request to update account information'
  }
];

const mockAgents = [
  'Sarah Wilson',
  'Mike Johnson',
  'Lisa Davis',
  'David Miller',
  'Amanda Rodriguez',
  'James Taylor'
];

const Tickets: React.FC<TicketsProps> = ({ className = "" }) => {
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>(mockTickets);
  const [filters, setFilters] = useState<TicketFilters>({
    page: 1,
    limit: 10,
    search: '',
    ticketType: '',
    priority: undefined,
    status: undefined,
    assignedTo: ''
  });
  const [searchInput, setSearchInput] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // New ticket form state
  const [newTicket, setNewTicket] = useState({
    customerName: '',
    contactNumber: '',
    email: '',
    priority: 'medium' as 'high' | 'medium' | 'low',
    ticketType: '',
    accountNumber: '',
    assignedTo: '',
    timezone: 'EST',
    description: ''
  });

  const tableColumns = useMemo(() => [
    { key: 'ticketNo', label: 'Ticket No' },
    { key: 'customerName', label: 'Customer Name' },
    { key: 'contactNumber', label: 'Contact Number' },
    { key: 'ticketType', label: 'Ticket Type' },
    { key: 'createdDate', label: 'Created Date' },
    { key: 'lastUpdated', label: 'Last Updated' },
    { key: 'assignedTo', label: 'Assigned To' },
    { key: 'status', label: 'Status' },
    { key: 'actions', label: '', className: 'text-right' },
  ], []);

  const priorityOptions = useMemo(() => [
    { value: '', label: 'All Priorities' },
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' },
  ], []);

  const statusOptions = useMemo(() => [
    { value: '', label: 'All Statuses' },
    { value: 'open', label: 'Open' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'resolved', label: 'Resolved' },
    { value: 'closed', label: 'Closed' },
  ], []);

  const ticketTypeOptions = useMemo(() => [
    { value: '', label: 'All Types' },
    { value: 'Technical Support', label: 'Technical Support' },
    { value: 'Billing', label: 'Billing' },
    { value: 'General Inquiry', label: 'General Inquiry' },
    { value: 'Account Management', label: 'Account Management' },
  ], []);

  const assignedToOptions = useMemo(() => [
    { value: '', label: 'All Agents' },
    ...mockAgents.map(agent => ({ value: agent, label: agent }))
  ], []);

  const itemsPerPageOptions = useMemo(() => [
    { value: '5', label: '5 per page' },
    { value: '10', label: '10 per page' },
    { value: '20', label: '20 per page' },
    { value: '50', label: '50 per page' },
  ], []);

  const timezoneOptions = useMemo(() => [
    { value: 'EST', label: 'Eastern Time (EST)' },
    { value: 'PST', label: 'Pacific Time (PST)' },
    { value: 'CST', label: 'Central Time (CST)' },
    { value: 'MST', label: 'Mountain Time (MST)' },
  ], []);

  const newTicketPriorityOptions = useMemo(() => [
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' },
  ], []);

  const newTicketTypeOptions = useMemo(() => [
    { value: 'Technical Support', label: 'Technical Support' },
    { value: 'Billing', label: 'Billing' },
    { value: 'General Inquiry', label: 'General Inquiry' },
    { value: 'Account Management', label: 'Account Management' },
  ], []);

  const newTicketAssignedToOptions = useMemo(() => [
    { value: '', label: 'Unassigned' },
    ...mockAgents.map(agent => ({ value: agent, label: agent }))
  ], []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      startTransition(() => {
        setFilters(prev => ({ ...prev, search: searchInput, page: 1 }));
      });
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchInput]);

  const filterChange = useMemo(() => (key: keyof TicketFilters, value: any) => {
    startTransition(() => {
      setFilters(prev => ({
        ...prev,
        [key]: value === '' ? undefined : value,
        page: 1
      }));
    });
  }, []);

  const initPageChange = useMemo(() => (newPage: number) => {
    startTransition(() => {
      setFilters(prev => ({ ...prev, page: newPage }));
    });
  }, []);

  const getPriorityVariant = useMemo(() => (priority: string): 'light' | 'solid' => {
    switch (priority) {
      case 'high': return 'solid';
      case 'medium': return 'light';
      case 'low': return 'light';
      default: return 'light';
    }
  }, []);
  const getPriorityColor = useMemo(() => (priority: string): 'primary' | 'success' | 'error' | 'warning' | 'info' | 'light' | 'dark' => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'light';
    }
  }, []);

  const getStatusVariant = useMemo(() => (status: string): 'light' | 'solid' => {
    switch (status) {
      case 'open': return 'solid';
      case 'in-progress': return 'solid';
      case 'resolved': return 'light';
      case 'closed': return 'light';
      default: return 'light';
    }
  }, []);
  const getStatusColor = useMemo(() => (status: string): 'primary' | 'success' | 'error' | 'warning' | 'info' | 'light' | 'dark' => {
    switch (status) {
      case 'open': return 'error';
      case 'in-progress': return 'warning';
      case 'resolved': return 'success';
      case 'closed': return 'light';
      default: return 'light';
    }
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredTickets = useMemo(() => {
    let filtered = tickets;

    if (filters.search) {
      filtered = filtered.filter(ticket =>
        ticket.customerName.toLowerCase().includes(filters.search.toLowerCase()) ||
        ticket.ticketNo.toLowerCase().includes(filters.search.toLowerCase()) ||
        ticket.email.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    if (filters.ticketType) {
      filtered = filtered.filter(ticket => ticket.ticketType === filters.ticketType);
    }

    if (filters.priority) {
      filtered = filtered.filter(ticket => ticket.priority === filters.priority);
    }

    if (filters.status) {
      filtered = filtered.filter(ticket => ticket.status === filters.status);
    }

    if (filters.assignedTo) {
      filtered = filtered.filter(ticket => ticket.assignedTo === filters.assignedTo);
    }

    return filtered;
  }, [tickets, filters]);

  const paginatedTickets = useMemo(() => {
    const startIndex = (filters.page - 1) * filters.limit;
    const endIndex = startIndex + filters.limit;
    return filteredTickets.slice(startIndex, endIndex);
  }, [filteredTickets, filters.page, filters.limit]);

  const totalPages = Math.ceil(filteredTickets.length / filters.limit);

  const generateTicketNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const nextNumber = tickets.length + 1;
    return `TK-${year}-${nextNumber.toString().padStart(3, '0')}`;
  };

  const handleAddTicket = () => {
    if (!newTicket.customerName || !newTicket.contactNumber || !newTicket.email || !newTicket.ticketType || !newTicket.description) {
      alert('Please fill in all required fields');
      return;
    }

    const ticket: Ticket = {
      id: Date.now().toString(),
      ticketNo: generateTicketNumber(),
      customerName: newTicket.customerName,
      contactNumber: newTicket.contactNumber,
      email: newTicket.email,
      ticketType: newTicket.ticketType,
      priority: newTicket.priority,
      createdDate: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      assignedTo: newTicket.assignedTo || 'Unassigned',
      status: 'open',
      accountNumber: newTicket.accountNumber,
      timezone: newTicket.timezone,
      description: newTicket.description
    };

    setTickets(prev => [ticket, ...prev]);
    setIsAddModalOpen(false);
    
    // Reset form
    setNewTicket({
      customerName: '',
      contactNumber: '',
      email: '',
      priority: 'medium',
      ticketType: '',
      accountNumber: '',
      assignedTo: '',
      timezone: 'EST',
      description: ''
    });
  };

  const viewTicket = (ticketId: string) => {
    // Navigate to ticket details page
    router.push(`/admin/tickets/details/${ticketId}`);
  };

  if (error && !isPending) {
    return (
      <ErrorState
        className={className}
        message={`Error loading tickets: ${error.message}`}
        onRetry={() => setError(null)}
        retryIcon={<BoltIcon />}
      />
    );
  }

  return (
    <div className={`rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] ${className}`}>
      <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-800">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
              Support Tickets
            </h3>
            <p className="text-sm text-gray-500 mt-1 dark:text-gray-400">
              {filteredTickets.length} total tickets
              {isPending && (
                <span className="ml-2 text-xs text-blue-500 dark:text-blue-400">
                  Updating...
                </span>
              )}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="dark:text-white"
              size="sm"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              startIcon={<FunnelIcon className="dark:text-white" />}
            >
              Filters
            </Button>            <Button
              variant="default"
              size="sm"
              className="whitespace-nowrap"
              onClick={() => setIsAddModalOpen(true)}
              startIcon={<PlusIcon />}
            >
              Add Ticket
            </Button>
          </div>
        </div>

        {/* Search input */}
        <div className="mt-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon className="h-4 w-4" />
            </div>
            <Input
              type="text"
              placeholder="Search tickets by customer name, ticket number, or email..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className={`w-full pl-10 ${searchInput ? 'pr-10' : ''}`}
            />
            {searchInput && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <button
                  type="button"
                  onClick={() => setSearchInput('')}
                  className="text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-white transition-colors"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Filters */}
        {isFilterOpen && (
          <div className="p-4 bg-gray-50 dark:bg-gray-800/50">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Ticket Type
                </Label>
                <Select
                  defaultValue={filters.ticketType || ''}
                  onChange={(value: string) => filterChange('ticketType', value)}
                  options={ticketTypeOptions}
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Priority
                </Label>
                <Select
                  defaultValue={filters.priority || ''}
                  onChange={(value: string) => filterChange('priority', value)}
                  options={priorityOptions}
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </Label>
                <Select
                  defaultValue={filters.status || ''}
                  onChange={(value: string) => filterChange('status', value)}
                  options={statusOptions}
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Assigned To
                </Label>
                <Select
                  defaultValue={filters.assignedTo || ''}
                  onChange={(value: string) => filterChange('assignedTo', value)}
                  options={assignedToOptions}
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Items per page
                </Label>
                <Select
                  defaultValue={filters.limit?.toString() || '10'}
                  onChange={(value: string) => filterChange('limit', parseInt(value))}
                  options={itemsPerPageOptions}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Table section */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeading columns={tableColumns} />
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell className="text-center py-8 px-6" colSpan={9}>
                  <div className="flex items-center justify-center gap-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-brand-500"></div>
                    <p className="text-gray-500 dark:text-gray-400">Loading...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : !paginatedTickets.length ? (
              <TableRow>
                <TableCell className="text-center py-8 px-6" colSpan={9}>
                  <p className="text-gray-500 dark:text-gray-400">No tickets found</p>
                </TableCell>
              </TableRow>
            ) : (
              paginatedTickets.map((ticket) => (
                <TableRow key={ticket.id} className="border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <TableCell className="py-4 px-6">
                    <div className="flex flex-col">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {ticket.ticketNo}
                      </p>                      <Badge 
                        variant={getPriorityVariant(ticket.priority)} 
                        color={getPriorityColor(ticket.priority)}
                      >
                        {ticket.priority.toUpperCase()}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="py-4 px-6">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {ticket.customerName}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {ticket.email}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="py-4 px-6">
                    <p className="text-sm text-gray-900 dark:text-white">
                      {ticket.contactNumber}
                    </p>
                  </TableCell>
                  <TableCell className="py-4 px-6">
                    <p className="text-sm text-gray-900 dark:text-white">
                      {ticket.ticketType}
                    </p>
                  </TableCell>
                  <TableCell className="py-4 px-6">
                    <p className="text-sm text-gray-900 dark:text-white">
                      {formatDate(ticket.createdDate)}
                    </p>
                  </TableCell>
                  <TableCell className="py-4 px-6">
                    <p className="text-sm text-gray-900 dark:text-white">
                      {formatDate(ticket.lastUpdated)}
                    </p>
                  </TableCell>
                  <TableCell className="py-4 px-6">
                    <p className="text-sm text-gray-900 dark:text-white">
                      {ticket.assignedTo}
                    </p>
                  </TableCell>                  
                  <TableCell className="py-4 px-6">
                    <Badge 
                      variant={getStatusVariant(ticket.status)} 
                      color={getStatusColor(ticket.status)}
                    >
                      {ticket.status.replace('-', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-4 px-6 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-brand-400"
                      onClick={() => viewTicket(ticket.id)}
                      startIcon={<EyeIcon />}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Showing {((filters.page - 1) * filters.limit) + 1} to {Math.min(filters.page * filters.limit, filteredTickets.length)} of {filteredTickets.length} tickets
            </p>
            <Pagination
              currentPage={filters.page}
              totalPages={totalPages}
              onPageChange={initPageChange}
            />
          </div>
        </div>
      )}

      {/* Add Ticket Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)}>
        <div className="bg-white dark:bg-gray-900 rounded-lg max-w-2xl mx-auto m-4">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Create New Ticket
            </h3>
          </div>
          
          <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Ticket Number *
                  </Label>
                  <Input
                    type="text"
                    value={generateTicketNumber()}
                    disabled
                    className="bg-gray-100 dark:bg-gray-800"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Priority *
                  </Label>                  <Select
                    defaultValue={newTicket.priority}
                    onChange={(value: string) => setNewTicket(prev => ({ ...prev, priority: value as 'high' | 'medium' | 'low' }))}
                    options={newTicketPriorityOptions}
                  />
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Customer Name *
                </Label>
                <Input
                  type="text"
                  placeholder="Enter customer name"
                  value={newTicket.customerName}
                  onChange={(e) => setNewTicket(prev => ({ ...prev, customerName: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Contact Number *
                  </Label>
                  <Input
                    type="tel"
                    placeholder="+1-555-0123"
                    value={newTicket.contactNumber}
                    onChange={(e) => setNewTicket(prev => ({ ...prev, contactNumber: e.target.value }))}
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Address *
                  </Label>
                  <Input
                    type="email"
                    placeholder="customer@email.com"
                    value={newTicket.email}
                    onChange={(e) => setNewTicket(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Ticket Type *
                  </Label>                  <Select
                    defaultValue={newTicket.ticketType}
                    onChange={(value: string) => setNewTicket(prev => ({ ...prev, ticketType: value }))}
                    options={[{ value: '', label: 'Select ticket type' }, ...newTicketTypeOptions]}
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Account Number / Customer ID
                  </Label>
                  <Input
                    type="text"
                    placeholder="ACC-123456"
                    value={newTicket.accountNumber}
                    onChange={(e) => setNewTicket(prev => ({ ...prev, accountNumber: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Assign To
                  </Label>                  <Select
                    defaultValue={newTicket.assignedTo}
                    onChange={(value: string) => setNewTicket(prev => ({ ...prev, assignedTo: value }))}
                    options={newTicketAssignedToOptions}
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Timezone
                  </Label>                  <Select
                    defaultValue={newTicket.timezone}
                    onChange={(value: string) => setNewTicket(prev => ({ ...prev, timezone: value }))}
                    options={timezoneOptions}
                  />
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description *
                </Label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-gray-800 dark:text-white resize-none"
                  rows={4}
                  placeholder="Describe the issue or request..."
                  value={newTicket.description}
                  onChange={(e) => setNewTicket(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
            </div>
          </div>

          <div className="px-6 py-4 flex justify-end gap-3">
            <Button
              variant="outline"
              className="dark:text-white"
              onClick={() => setIsAddModalOpen(false)}
            >
              Cancel
            </Button>            <Button
              variant="default"
              onClick={handleAddTicket}
            >
              Create Ticket
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Tickets;