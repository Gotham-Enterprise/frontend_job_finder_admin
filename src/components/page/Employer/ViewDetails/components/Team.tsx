"use client";

import { TeamMember } from "@/services/types/team";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/button/Button";
import NotFoundState from "@/components/common/NotFoundState";
import Pagination from "@/components/tables/Pagination";
import Select from "@/components/form/Select";
import { LocationIcon, EyeIcon } from "@/components/ui/icons";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table";
import TableHeading from "@/components/tables/tableHeader";

interface TeamProps {
    teamMembers?: TeamMember[];
    formatDate: (date: string | undefined) => string;
}

export default function Team({ teamMembers = [], formatDate }: TeamProps) {
    const router = useRouter();
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(8);
    
    // Ensure teamMembers is always an array
    const safeTeamMembers = Array.isArray(teamMembers) ? teamMembers : [];
    
    const totalPages = Math.ceil(safeTeamMembers.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentMembers = safeTeamMembers.slice(startIndex, endIndex);

    const initPageChange = (page: number) => {
        setCurrentPage(page);
    };

    const updateItemsPerPage = (newItemsPerPage: number) => {
        setItemsPerPage(newItemsPerPage);
        setCurrentPage(1);
    };

    const itemsPerPageOptions = [
        { value: '5', label: '5 per page' },
        { value: '8', label: '8 per page' },
        { value: '10', label: '10 per page' },
        { value: '20', label: '20 per page' },
        { value: '50', label: '50 per page' },
    ];

    const tableColumns = useMemo(() => [
        { key: 'name', label: 'Name' },
        { key: 'email', label: 'Email' },
        { key: 'role', label: 'Role' },
        { key: 'location', label: 'Location' },
        { key: 'joined', label: 'Joined' },
        { key: 'status', label: 'Status' },
        { key: 'actions', label: '', className: 'text-right' },
    ], []);

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
            case 'inactive':
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
        }
    };

    return (
        <>            
            {safeTeamMembers && safeTeamMembers.length > 0 ? (
                <>                    
                    <div className="overflow-x-auto">
                        <Table className="border-collapse">
                            <TableHeading columns={tableColumns} />
                            <TableBody>
                                {currentMembers.map((member) => (
                                    <TableRow key={member.userId || member.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                        <TableCell className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                {member.avatarUrl || member.profilePicture ? (
                                                    <img 
                                                        src={member.avatarUrl || member.profilePicture} 
                                                        alt={member.name || `${member.firstName} ${member.lastName}`}
                                                        className="w-8 h-8 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-8 h-8 bg-brand-100 dark:bg-brand-900/20 rounded-full flex items-center justify-center">
                                                        <span className="text-sm font-medium text-brand-600 dark:text-brand-400">
                                                            {member.firstName.charAt(0)}{member.lastName.charAt(0)}
                                                        </span>
                                                    </div>
                                                )}
                                                <div>
                                                    <span className="font-semibold text-sm text-gray-900 dark:text-white">
                                                        {member.name || `${member.firstName} ${member.lastName}`}
                                                    </span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-4 px-6">
                                            <span className="text-sm text-gray-900 dark:text-white">{member.email}</span>
                                        </TableCell>
                                        <TableCell className="py-4 px-6">
                                            <span className="text-sm text-gray-900 dark:text-white">{member.companyRole}</span>
                                        </TableCell>
                                        <TableCell className="py-4 px-6">
                                            <div className="flex items-center gap-2">
                                                <LocationIcon className="w-4 h-4 text-gray-400" />
                                                <span className="text-sm text-gray-900 dark:text-white">
                                                    {member.city && member.state 
                                                        ? `${member.city}, ${member.state}` 
                                                        : member.state || member.city || 'N/A'
                                                    }
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-4 px-6">
                                            <span className="text-sm text-gray-900 dark:text-white">
                                                {member.dateJoined ? formatDate(member.dateJoined) : 'N/A'}
                                            </span>
                                        </TableCell>
                                        <TableCell className="py-4 px-6">
                                            <span className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full ${getStatusVariant(member.status)}`}>
                                                {member.status}
                                            </span>
                                        </TableCell>
                                        <TableCell className="py-4 px-6 text-right">
                                            <Button
                                                onClick={() => router.push(`/admin/team/details/${member.userId || member.id}`)}
                                                variant="ghost"
                                                size="sm"
                                                className="text-brand-400"
                                                startIcon={<EyeIcon className="w-4 h-4" />}
                                            >
                                                View
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    {safeTeamMembers.length > 0 && (
                        <div className="flex items-center justify-between mt-6 p-6 pt-6">
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                Showing {startIndex + 1} to {Math.min(endIndex, safeTeamMembers.length)} of {safeTeamMembers.length} items
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">Items per page:</span>
                                    <Select
                                        value={itemsPerPage.toString()}
                                        onChange={(value: string) => updateItemsPerPage(Number(value))}
                                        options={itemsPerPageOptions}
                                        className="w-auto min-w-[120px]"
                                    />
                                </div>
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={initPageChange}
                                />
                            </div>
                        </div>
                    )}
                </>
            ) : (
                <NotFoundState 
                    title="No team members found"
                    message="This employer hasn't added any team members yet"
                />
            )}
        </>
    );
}
