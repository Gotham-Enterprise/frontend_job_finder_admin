"use client";
import React, { useState, useEffect, useMemo, useTransition, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from '../../ui/table';
import Button from '../../ui/button/Button';
import Input from '../../ui/input/Input';
import Select from '../../form/Select';
import Pagination from '../../tables/Pagination';
import TableHeading from '../../tables/tableHeader';
import { BoltIcon, FunnelIcon, EyeIcon, PlusIcon } from '@/icons';
import TicketDrawer from './TicketDrawer';
import { SearchIcon } from '../../ui/icons';
import ErrorState from '../../common/ErrorState';
import TicketCommentsDrawer from './TicketCommentsDrawer';


interface Ticket {
  id: string;
  ticketNo: string;
  customerName: string;
  contactNumber: string;
  email: string;
  ticketType: string;
  priority: 'highest' | 'high' | 'medium' | 'low' | 'lowest';
  createdDate: string;
  lastUpdated: string;
  assignedTo: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  accountNumber?: string;  timezone: string;
  description: string;
  reporter?: string;
  labels?: string[];
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


const mockTickets: Ticket[] = [  {
    id: '1',
    ticketNo: 'TK-2024-001',
    customerName: 'John Doe',
    contactNumber: '+1-555-0123',    
    email: 'john.doe@email.com',
    ticketType: 'Technical Support',
    priority: 'highest',
    createdDate: '2024-06-01T09:30:00Z',
    lastUpdated: '2024-06-02T14:20:00Z',
    assignedTo: 'Sarah Wilson',
    status: 'in-progress',
    accountNumber: 'ACC-123456',
    timezone: 'EST',
    description: 'Unable to login to account after password reset',
    reporter: 'John Doe',
    labels: ['login-issue', 'urgent']
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
    description: 'Incorrect charges on monthly bill',
    reporter: 'Jane Smith',
    labels: ['billing', 'refund']
  },
  {
    id: '3',
    ticketNo: 'TK-2024-003',
    customerName: 'Robert Brown',
    contactNumber: '+1-555-0125',    email: 'robert.brown@email.com',
    ticketType: 'General Inquiry',
    priority: 'lowest',
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
  },
  {
    id: '6',
    ticketNo: 'TK-2024-006',
    customerName: 'Alex Chen',
    contactNumber: '+1-555-0128',
    email: 'alex.chen@email.com',
    ticketType: 'Technical Support',
    priority: 'lowest',
    createdDate: '2024-06-03T10:30:00Z',
    lastUpdated: '2024-06-03T11:00:00Z',
    assignedTo: 'Amanda Rodriguez',
    status: 'open',
    accountNumber: 'ACC-567890',
    timezone: 'EST',
    description: 'Minor UI text formatting issue'
  }
];

const mockComments = {
  '1': [
    {
      id: 'c1',
      author: 'Francheska Rivano',
      content: 'Boss @Marvin Jay Lagang - dashboard development is done. I don\'t have the permission to assign to myself and move the status. Thank u',
      timestamp: '2024-05-28T13:57:00Z'
    },
    {
      id: 'c2',
      author: 'Marvin Jay Lagang',
      content: 'I reassigned it back to you. will review this. Thank you!',
      timestamp: '2024-05-28T21:03:00Z'
    }
  ],
  '2': [
    {
      id: 'c3',
      author: 'Mike Johnson',
      content: 'I\'ve reviewed the billing issue and it appears to be a system error. Processing refund now.',
      timestamp: '2024-06-01T17:30:00Z'
    }
  ]
};

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
  const filterRef = useRef<HTMLDivElement>(null);
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
  const [isPending, startTransition] = useTransition();  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
    // Comments drawer state
  const [isCommentsDrawerOpen, setIsCommentsDrawerOpen] = useState(false);
  const [isCommentsDrawerVisible, setIsCommentsDrawerVisible] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [ticketComments, setTicketComments] = useState<Record<string, Array<{
    id: string;
    author: string;
    content: string;
    timestamp: string;
  }>>>(mockComments);


  const [newTicket, setNewTicket] = useState({
    customerName: '',
    contactNumber: '',
    email: '',
    priority: 'medium' as 'highest' | 'high' | 'medium' | 'low' | 'lowest',
    ticketType: '',
    accountNumber: '',
    assignedTo: '',
    timezone: 'EST',    
    description: ''  }); 
    
    const tableColumns = useMemo(() => [
    { key: 'key', label: 'Key', className: 'w-32' },
    { key: 'summary', label: 'Summary', className: 'min-w-80' },
    { key: 'status', label: 'Status', className: 'w-28' },
    { key: 'comments', label: 'Comments', className: 'w-24' },
    { key: 'assignee', label: 'Assignee', className: 'w-32' },
    { key: 'created', label: 'Created', className: 'w-32' },
    { key: 'updated', label: 'Updated', className: 'w-32' },
    { key: 'priority', label: 'Priority', className: 'w-28' },
    { key: 'actions', label: '', className: 'w-12' },
  ], []);


  const priorityOptions = useMemo(() => [
    { value: '', label: 'All Priorities' },
    { value: 'highest', label: 'Highest' },
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' },
    { value: 'lowest', label: 'Lowest' },
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
    { value: 'highest', label: 'Highest' },
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' },
    { value: 'lowest', label: 'Lowest' },
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


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    };

    if (isFilterOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isFilterOpen]);

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
  }, []);  const getPriorityVariant = useMemo(() => (priority: string): 'light' | 'solid' => {
    switch (priority) {
      case 'highest': return 'solid';
      case 'high': return 'solid';
      case 'medium': return 'solid';
      case 'low': return 'light';
      case 'lowest': return 'light';
      default: return 'light';
    }
  }, []);  const getPriorityColor = useMemo(() => (priority: string): 'primary' | 'success' | 'error' | 'warning' | 'info' | 'light' | 'dark' => {
    switch (priority) {
      case 'highest': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'primary';
      case 'low': return 'success';
      case 'lowest': return 'light';
      default: return 'light';
    }
  }, []);

  const getPriorityBgColor = useMemo(() => (priority: string): string => {
    switch (priority) {
      case 'highest': return 'bg-red-100';
      case 'high': return 'bg-orange-100';
      case 'medium': return 'bg-yellow-100';
      case 'low': return 'bg-green-100';
      case 'lowest': return 'bg-gray-100';
      default: return 'bg-gray-100';
    }
  }, []);

  const getPriorityTextColor = useMemo(() => (priority: string): string => {
    switch (priority) {
      case 'highest': return 'text-red-700';
      case 'high': return 'text-orange-700';
      case 'medium': return 'text-yellow-700';
      case 'low': return 'text-green-700';
      case 'lowest': return 'text-gray-700';
      default: return 'text-gray-700';
    }
  }, []);const getStatusVariant = useMemo(() => (status: string): 'light' | 'solid' => {
    return 'solid';
  }, []);const getStatusColor = useMemo(() => (status: string): 'primary' | 'success' | 'error' | 'warning' | 'info' | 'light' | 'dark' => {
    switch (status) {
      case 'resolved':
      case 'closed': return 'success';
      default: return 'primary';
    }
  }, []);



  const getUserAvatar = (name: string) => {
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500', 
      'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'
    ];
    const colorIndex = name.length % colors.length;
    return { initials, color: colors[colorIndex] };
  };


  const getTicketTypeIcon = (type: string) => {
    switch (type) {
      case 'Technical Support':
        return '🛠️';
      case 'Billing':
        return '💰';
      case 'General Inquiry':
        return '❓';
      case 'Account Management':
        return '👤';
      default:
        return '📋';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
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


  const openTicketDrawer = () => {
    setIsAddModalOpen(true);
    setTimeout(() => setIsDrawerVisible(true), 10);
  };

  const closeTicketDrawer = () => {
    setIsDrawerVisible(false);
    setTimeout(() => {
      setIsAddModalOpen(false);
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
    }, 300);
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
    };    setTickets(prev => [ticket, ...prev]);
    closeTicketDrawer();
  };

  const viewTicket = (ticketId: string) => {
    router.push(`/admin/tickets/details/${ticketId}`);
  };

  // Comments drawer handlers
  const openCommentsDrawer = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setIsCommentsDrawerOpen(true);
    setTimeout(() => setIsCommentsDrawerVisible(true), 10);
  };

  const closeCommentsDrawer = () => {
    setIsCommentsDrawerVisible(false);
    setTimeout(() => {
      setIsCommentsDrawerOpen(false);
      setSelectedTicket(null);
    }, 300);
  };

  const handleStatusChange = (ticketId: string, newStatus: string) => {
    setTickets(prev => prev.map(ticket => 
      ticket.id === ticketId 
        ? { ...ticket, status: newStatus as Ticket['status'], lastUpdated: new Date().toISOString() }
        : ticket
    ));
  };

  const handleAssigneeChange = (ticketId: string, newAssignee: string) => {
    setTickets(prev => prev.map(ticket => 
      ticket.id === ticketId 
        ? { ...ticket, assignedTo: newAssignee, lastUpdated: new Date().toISOString() }
        : ticket
    ));
  };

  const handlePriorityChange = (ticketId: string, newPriority: string) => {
    setTickets(prev => prev.map(ticket => 
      ticket.id === ticketId 
        ? { ...ticket, priority: newPriority as Ticket['priority'], lastUpdated: new Date().toISOString() }
        : ticket
    ));
  };

  const handleAddComment = (ticketId: string, comment: string) => {
    const newComment = {
      id: Date.now().toString(),
      author: 'Current User', // This should come from user context
      content: comment,
      timestamp: new Date().toISOString()
    };
    
    setTicketComments(prev => ({
      ...prev,
      [ticketId]: [...(prev[ticketId] || []), newComment]
    }));

    // Update ticket's last updated time
    setTickets(prev => prev.map(ticket => 
      ticket.id === ticketId 
        ? { ...ticket, lastUpdated: new Date().toISOString() }
        : ticket
    ));
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
  }  return (
    <div className={`bg-white dark:bg-gray-900 ${className}`}>
   
     
      <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <div className="px-6 py-4">         
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                List
              </h1>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Search Bar */}
              <div className="relative w-64">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <SearchIcon className="h-4 w-4 text-gray-400" />
                </div>
                <Input
                  type="text"
                  placeholder="Search list"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              {/* User Avatars */}
              <div className="flex items-center -space-x-2">
                {mockAgents.slice(0, 4).map((agent, index) => {
                  const avatar = getUserAvatar(agent);
                  return (
                    <div
                      key={agent}
                      className={`w-8 h-8 rounded-full ${avatar.color} flex items-center justify-center text-white text-sm font-medium border-2 border-white dark:border-gray-900 cursor-pointer hover:z-10 transition-transform hover:scale-110`}
                      title={agent}
                    >
                      {avatar.initials}
                    </div>
                  );
                })}
                <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-gray-600 dark:text-gray-300 text-sm font-medium border-2 border-white dark:border-gray-900 cursor-pointer">
                  +{Math.max(0, mockAgents.length - 4)}
                </div>
              </div>
            </div>
             
            <div className="flex items-center gap-2 relative" ref={filterRef}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
               
              >
                <svg width="18" height="18" viewBox="0 0 24 24" role="presentation">
                  <path fill="currentcolor" fillRule="evenodd" d="M7 13h10l1-2H6zM3.99 6c-.55 0-.79.41-.55.9L4 8h16l.55-1.1c.25-.5.01-.9-.54-.9zm6.79 11.56a.87.87 0 0 0 .73.44h.99c.28 0 .61-.2.73-.44L14 16h-4z"></path>
                </svg>
                Filter
              </Button>             
               <Button
                variant="default"
                size="sm"
                className="whitespace-nowrap flex items-center gap-2"
                onClick={openTicketDrawer}
              
              >
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add new
              </Button>
              
              {/* Filters Dropdown Panel */}
              {isFilterOpen && (
                <div className="absolute top-full right-0 mt-2 z-50 w-80 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
                  <div className="p-4">
                    <div className="mb-4">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">FILTERS</h3>
                        {/* Quick Filter Options */}
                      <div className="space-y-3 mb-4">
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="assigned-to-me" className="rounded border-gray-300" />
                          <label htmlFor="assigned-to-me" className="text-sm text-gray-700 dark:text-gray-300">Assigned to me</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="due-this-week" className="rounded border-gray-300" />
                          <label htmlFor="due-this-week" className="text-sm text-gray-700 dark:text-gray-300">Due this week</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="done-work-items" className="rounded border-gray-300" />
                          <label htmlFor="done-work-items" className="text-sm text-gray-700 dark:text-gray-300">Done work items</label>
                        </div>
                      </div>

                      <hr className="border-gray-200 dark:border-gray-700 my-4" />

                      {/* Date Range */}
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Date range</h4>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-sm text-gray-500 dark:text-gray-400">Start date</label>
                            <Input
                              type="date"
                              className="w-full text-sm"
                              defaultValue="1993-02-18"
                            />
                          </div>
                          <div>
                            <label className="text-sm text-gray-500 dark:text-gray-400">Due date</label>
                            <Input
                              type="date"
                              className="w-full text-sm"
                              defaultValue="1993-02-18"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Assignee */}
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Assignee</h4>
                        <div className="flex flex-wrap gap-1">
                          {mockAgents.slice(0, 8).map((agent, index) => {
                            const avatar = getUserAvatar(agent);
                            return (
                              <div
                                key={agent}
                                className={`w-6 h-6 rounded-full ${avatar.color} flex items-center justify-center text-white text-sm font-medium cursor-pointer hover:scale-110 transition-transform`}
                                title={agent}
                              >
                                {avatar.initials}
                              </div>
                            );
                          })}
                          <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-400 text-sm cursor-pointer">
                            ⋯
                          </div>
                        </div>
                      </div>                      {/* Status */}
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</h4>
                        <div className="flex flex-wrap gap-2">
                          {statusOptions.slice(1).map((status) => (
                            <label
                              key={status.value}
                              className="flex items-center cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                className="sr-only"
                                checked={filters.status === status.value}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    filterChange('status', status.value);
                                  } else {
                                    filterChange('status', '');
                                  }
                                }}
                              />                              <div
                                className={`px-2 rounded-[2px] text-xs font-medium border transition-colors ${
                                  filters.status === status.value
                                    ? (status.value === 'resolved' || status.value === 'closed'
                                      ? 'bg-[#dcfff1] text-[#216e4e] border-[#dcfff1]'
                                      : 'bg-[#e9f2ff] text-[#0055cc] border-[#e9f2ff]')
                                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:bg-gray-700'
                                }`}
                              >
                                {status.label}
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Priority */}
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Priority</h4>
                        <div className="flex flex-wrap gap-2">
                          {priorityOptions.slice(1).map((priority) => (
                            <label
                              key={priority.value}
                              className="flex items-center cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                className="sr-only"
                                checked={filters.priority === priority.value}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    filterChange('priority', priority.value);
                                  } else {
                                    filterChange('priority', '');
                                  }
                                }}
                              />                              <div
                                className={`px-2 py-1 rounded-[2px] text-xs font-medium border transition-colors ${
                                  filters.priority === priority.value
                                    ? priority.value === 'highest'
                                      ? 'bg-red-100 text-red-700 border-red-200'
                                      : priority.value === 'high'
                                      ? 'bg-orange-100 text-orange-700 border-orange-200'
                                      : priority.value === 'medium'
                                      ? 'bg-yellow-100 text-yellow-700 border-yellow-200'
                                      : priority.value === 'low'
                                      ? 'bg-green-100 text-green-700 border-green-200'
                                      : 'bg-gray-100 text-gray-700 border-gray-200'
                                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:bg-gray-700'
                                }`}
                              >
                                {priority.label}
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Created */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Created</h4>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-sm text-gray-500 dark:text-gray-400">From</label>
                            <Input
                              type="date"
                              className="w-full text-sm"
                            />
                          </div>
                          <div>
                            <label className="text-sm text-gray-500 dark:text-gray-400">To</label>
                            <Select
                              options={[
                                { value: '', label: 'Select date' },
                                { value: 'today', label: 'Today' },
                                { value: 'yesterday', label: 'Yesterday' },
                                { value: 'this-week', label: 'This week' }
                              ]}
                              defaultValue=""
                              onChange={(value) => {
                             
                                console.log('Date filter changed:', value);
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>        
          </div>
      </div>    
      <div className="overflow-x-auto bg-white dark:bg-gray-900">
        <Table>
          <TableHeading columns={tableColumns} />
          <TableBody>{isLoading ? (
              <TableRow>
                <TableCell className="text-center py-8 px-6" colSpan={9}>
                  <div className="flex items-center justify-center gap-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
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
              paginatedTickets.map((ticket) => {
                const assigneeAvatar = getUserAvatar(ticket.assignedTo);                return (<TableRow 
                    key={ticket.id} 
                    className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer"
                  ><TableCell className="py-3 px-4 whitespace-nowrap">
                      <button 
                        className="text-sm font-medium hover:underline focus:outline-none"
                        style={{ color: '#44546f' }}
                        onClick={() => viewTicket(ticket.id)}
                      >
                        {ticket.ticketNo}
                      </button>
                    </TableCell><TableCell className="py-3 px-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium truncate max-w-md" style={{ color: '#44546f' }}>
                          {ticket.description}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Customer: {ticket.customerName}
                        </span>
                      </div>
                    </TableCell><TableCell className="py-3 px-4">
                      <span 
                        className={`inline-flex items-center px-2 rounded-[4px] text-xs whitespace-nowrap font-medium ${
                          ticket.status === 'resolved' || ticket.status === 'closed'
                            ? 'bg-[#dcfff1] text-[#216e4e]'
                            : 'bg-[#e9f2ff] text-[#0055cc]'
                        }`}
                      >
                        {ticket.status.replace('-', ' ').toUpperCase()}
                      </span>
                    </TableCell><TableCell className="py-3 px-4 text-center">
                      <button 
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 flex items-center space-x-1" 
                        onClick={() => openCommentsDrawer(ticket)}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.955 8.955 0 01-2.697-.413l-3.206 1.068a.75.75 0 01-.954-.954l1.068-3.206A8.955 8.955 0 014 12a8 8 0 1116 0z" />
                        </svg>
                        <span className="text-sm">
                          {ticketComments[ticket.id]?.length > 0 
                            ? `${ticketComments[ticket.id].length} comment${ticketComments[ticket.id].length > 1 ? 's' : ''}`
                            : 'Add comment'
                          }
                        </span>
                      </button>
                    </TableCell><TableCell className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <div
                          className={`w-6 h-6 min-w-[24px] min-h-[24px] rounded-full ${assigneeAvatar.color} flex items-center justify-center text-white text-sm font-medium flex-shrink-0`}
                          title={ticket.assignedTo}
                        >
                          {assigneeAvatar.initials}
                        </div>
                        <span className="text-sm truncate" style={{ color: '#44546f' }}>
                          {ticket.assignedTo}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-3 px-4">
                      <span className="text-sm" style={{ color: '#44546f' }}>
                        {formatDate(ticket.createdDate)}
                      </span>
                    </TableCell>
                    <TableCell className="py-3 px-4">
                      <span className="text-sm" style={{ color: '#44546f' }}>
                        {formatDate(ticket.lastUpdated)}
                      </span>
                    </TableCell><TableCell className="py-3 px-4">
                      <span 
                        className={`inline-flex items-center px-2 py-1 rounded-[2px] text-sm font-medium ${
                          getPriorityBgColor(ticket.priority)
                        } ${getPriorityTextColor(ticket.priority)}`}
                      >
                        {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                      </span>
                    </TableCell><TableCell className="py-3 px-4">
                      <button 
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        onClick={(e) => {
                          e.stopPropagation();
                        
                        }}
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                        </svg>
                      </button>
                    </TableCell>
                  </TableRow>);
              })
            )}</TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
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
      )}      {/* Add Ticket Drawer */}
      <TicketDrawer
        isOpen={isAddModalOpen}
        isVisible={isDrawerVisible}
        ticketForm={newTicket}
        ticketNumber={generateTicketNumber()}
        onClose={closeTicketDrawer}
        onSave={handleAddTicket}
        onUpdateForm={(updates) => setNewTicket(prev => ({ ...prev, ...updates }))}
        priorityOptions={newTicketPriorityOptions}
        typeOptions={newTicketTypeOptions}
        assigneeOptions={newTicketAssignedToOptions}
        timezoneOptions={timezoneOptions}
      />

      {/* Comments Drawer */}
      <TicketCommentsDrawer
        isOpen={isCommentsDrawerOpen}
        isVisible={isCommentsDrawerVisible}
        ticket={selectedTicket}
        onClose={closeCommentsDrawer}
        onStatusChange={handleStatusChange}
        onAssigneeChange={handleAssigneeChange}
        onPriorityChange={handlePriorityChange}
        onAddComment={handleAddComment}
        statusOptions={statusOptions}
        priorityOptions={priorityOptions.slice(1)} // Remove "All Priorities" option
        assigneeOptions={assignedToOptions.slice(1)} // Remove "All Agents" option
        comments={selectedTicket ? (ticketComments[selectedTicket.id] || []) : []}
      />
    </div>
  );
};

export default Tickets;