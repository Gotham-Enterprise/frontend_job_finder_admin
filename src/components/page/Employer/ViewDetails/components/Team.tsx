"use client";

import { TeamMember } from "@/services/types/team";
import { useState, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import Button from "@/components/ui/button/Button";
import Badge from "@/components/ui/badge/Badge";
import NotFoundState from "@/components/common/NotFoundState";
import Pagination from "@/components/tables/Pagination";
import Select from "@/components/form/Select";
import ToggleSwitch from "@/components/ui/ToggleSwitch";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import { PencilIcon } from "@/components/ui/icons";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table";
import TableHeading from "@/components/tables/tableHeader";
import { AddTeamMemberModal, EditTeamMemberModal } from "@/components/page/Employer/components";
import { teamQueryKeys, useUpdateTeamMemberStatus } from "@/services/hooks/useTeam";

interface TeamProps {
    teamMembers?: TeamMember[];
    formatDate: (date: string | undefined) => string;
    employerId: string;
}

export default function Team({ teamMembers = [], formatDate, employerId }: TeamProps) {
    const queryClient = useQueryClient();
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(8);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedTeamMember, setSelectedTeamMember] = useState<TeamMember | null>(null);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [memberToToggle, setMemberToToggle] = useState<{ member: TeamMember; newStatus: 'active' | 'inactive' } | null>(null);
    
    const updateStatusMutation = useUpdateTeamMemberStatus();
    
    const { totalPages, startIndex, endIndex, currentMembers } = useMemo(() => {
        const total = Math.ceil(teamMembers.length / itemsPerPage);
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const current = teamMembers.slice(start, end);
        
        return {
            totalPages: total,
            startIndex: start,
            endIndex: end,
            currentMembers: current
        };
    }, [teamMembers, currentPage, itemsPerPage]);

    const changePage = (page: number) => {
        setCurrentPage(page);
    };

    const updateItemsPerPage = (newItemsPerPage: number) => {
        setItemsPerPage(newItemsPerPage);
        setCurrentPage(1);
    };

    const invalidateTeamQueries = () => {
        queryClient.invalidateQueries({ queryKey: teamQueryKeys.list(employerId) });
    };

    const closeAddModal = () => {
        setIsAddModalOpen(false);
        invalidateTeamQueries();
    };

    const closeEditModal = () => {
        setIsEditModalOpen(false);
        setSelectedTeamMember(null);
        invalidateTeamQueries();
    };

    const editTeamMember = (member: TeamMember) => {
        setSelectedTeamMember(member);
        setIsEditModalOpen(true);
    };

    const toggleMemberStatus = (member: TeamMember, newStatus: 'active' | 'inactive') => {
        if (newStatus === 'inactive') {
            setMemberToToggle({ member, newStatus });
            setIsConfirmModalOpen(true);
        } else {
            updateStatusMutation.mutate({
                employerId,
                teamMemberId: member.id || member.userId || '',
                status: newStatus
            });
        }
    };

    const confirmStatusToggle = () => {
        if (memberToToggle) {
            updateStatusMutation.mutate({
                employerId,
                teamMemberId: memberToToggle.member.id || memberToToggle.member.userId || '',
                status: memberToToggle.newStatus
            });
        }
        setIsConfirmModalOpen(false);
        setMemberToToggle(null);
    };

    const cancelStatusToggle = () => {
        setIsConfirmModalOpen(false);
        setMemberToToggle(null);
    };

    const tableColumns = useMemo(() => [
        { key: 'name', label: 'Name' },
        { key: 'email', label: 'Email' },
        { key: 'role', label: 'Role' },
        { key: 'location', label: 'Location' },
        { key: 'joined', label: 'Joined' },
        { key: 'status', label: 'Status' },
        { key: 'actions', label: 'Actions', className: 'text-right' },
    ], []);

    const itemsPerPageOptions = useMemo(() => [
        { value: '5', label: '5 per page' },
        { value: '10', label: '10 per page' },
        { value: '20', label: '20 per page' },
        { value: '50', label: '50 per page' },
        { value: '100', label: '100 per page' },
    ], []);

    const getStatusVariant = useMemo(() => (status: string) => {
        const variants = {
            active: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
            inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
            pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
        };
        return variants[status as keyof typeof variants] || variants.inactive;
    }, []);

    const renderMemberAvatar = (member: TeamMember) => {
        const memberName = member.name || `${member.firstName} ${member.lastName}`;
        const avatarUrl = member.avatarUrl || member.profilePicture;
        
        if (avatarUrl) {
            return (
                <img 
                    src={avatarUrl} 
                    alt={memberName}
                    className="w-8 h-8 rounded-full object-cover"
                />
            );
        }
        
        return (
            <div className="w-8 h-8 bg-brand-100 dark:bg-brand-900/20 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-brand-600 dark:text-brand-400">
                    {member.firstName.charAt(0)}{member.lastName.charAt(0)}
                </span>
            </div>
        );
    };

    const renderMemberLocation = (member: TeamMember) => {
        if (member.city && member.state) {
            return `${member.city}, ${member.state}`;
        }
        return member.state || member.city || 'N/A';
    };

    return (
        <>
            <div className="flex justify-end mb-6 px-6 pt-6">
                <Button
                    onClick={() => setIsAddModalOpen(true)}
                    className="bg-green-600 hover:bg-green-700 text-white"
                >
                    Add Team Member
                </Button>
            </div>

            {teamMembers && teamMembers.length > 0 ? (
                <>                    
                    <div className="overflow-x-auto">
                        <Table className="border-collapse">
                            <TableHeading columns={tableColumns} />
                            <TableBody>
                                {currentMembers.map((member) => (
                                    <TableRow key={member.userId || member.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                        <TableCell className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                {renderMemberAvatar(member)}
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
                                            <span className="text-sm capitalize text-gray-900 dark:text-white">
                                                {renderMemberLocation(member)}
                                            </span>
                                        </TableCell>
                                        <TableCell className="py-4 px-6">
                                            <span className="text-sm text-gray-900 dark:text-white">
                                                {member.dateJoined ? formatDate(member.dateJoined) : 'N/A'}
                                            </span>
                                        </TableCell>
                                        <TableCell className="py-4 px-6">
                                            <Badge className={getStatusVariant(member.status || 'inactive')}>
                                                <span className="capitalize">
                                                    {member.status || 'inactive'}
                                                </span>
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="py-4 px-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <ToggleSwitch
                                                    id={`status-${member.userId || member.id}`}
                                                    checked={member.status === 'active'}
                                                    onChange={(checked) => 
                                                        toggleMemberStatus(member, checked ? 'active' : 'inactive')
                                                    }
                                                    label=""
                                                    disabled={updateStatusMutation.isPending}
                                                    size="sm"
                                                />
                                                <Button
                                                    onClick={() => editTeamMember(member)}
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-brand-400"
                                                    startIcon={<PencilIcon className="w-4 h-4" />}
                                                >
                                                    Edit
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    {teamMembers.length > 0 && (
                        <div className="flex items-center justify-between mt-6 p-6 pt-6">
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                Showing {startIndex + 1} of {Math.min(endIndex, teamMembers.length)} results
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
                                    onPageChange={changePage}
                                />
                            </div>
                        </div>
                    )}
                </>
            ) : (
                <div className="p-6">
                    <NotFoundState 
                        title="No team members found"
                        message="This employer hasn't added any team members yet"
                    />
                </div>
            )}
            <AddTeamMemberModal
                isOpen={isAddModalOpen}
                onClose={closeAddModal}
                employerId={employerId}
            />

            <EditTeamMemberModal
                isOpen={isEditModalOpen}
                onClose={closeEditModal}
                employerId={employerId}
                teamMember={selectedTeamMember}
            />

            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                onClose={cancelStatusToggle}
                onConfirm={confirmStatusToggle}
                title="Deactivate Account"
                message={`Are you sure you want to deactivate ${memberToToggle ? 
                    memberToToggle.member.name || `${memberToToggle.member.firstName} ${memberToToggle.member.lastName}` 
                    : ''
                }?`}
                confirmText="Confirm"
                cancelText="Cancel"
                isLoading={updateStatusMutation.isPending}
            />
        </>
    );
}
