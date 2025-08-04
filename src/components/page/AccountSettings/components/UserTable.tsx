'use client';

import React, { useState, useCallback } from 'react';
import { User } from '@/services/types/auth';
import { CreateUserFormData } from '@/services/types/permissions';
import { Table, TableHeader, TableBody, TableRow, TableCell } from '@/components/ui/table';
import { DotsIcon } from '@/components/ui/icons';
import { Dropdown } from '@/components/ui/dropdown/Dropdown';
import { DropdownItem } from '@/components/ui/dropdown/DropdownItem';
import Avatar from '@/components/ui/avatar/Avatar';
import Button from '@/components/ui/button/Button';
import Drawer from '@/components/ui/drawer/Drawer';
import UserForm from './UserForm';

interface ExtendedUser extends User {
  lastActivity?: string;
}

interface UserTableProps {
  users: ExtendedUser[];
  onUserAction: (userId: string, action: 'manage' | 'remove') => void;
  onCreateUser?: (userData: CreateUserFormData) => void;
  isCreatingUser?: boolean;
}

const UserActionDropdown: React.FC<{
  userId: string;
  onAction: (userId: string, action: 'manage' | 'remove') => void;
}> = ({ userId, onAction }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const closeDropdown = useCallback(() => {
    setIsOpen(false);
  }, []);

  const executeAction = useCallback((action: 'manage' | 'remove') => {
    onAction(userId, action);
    closeDropdown();
  }, [userId, onAction, closeDropdown]);

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
      >
        <DotsIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
      </button>
      <Dropdown 
        isOpen={isOpen} 
        onClose={closeDropdown}
        className="w-32"
      >
        <DropdownItem
          onClick={() => executeAction('manage')}
        >
          Manage
        </DropdownItem>
        <DropdownItem
          onClick={() => executeAction('remove')}
          className="text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
        >
          Remove
        </DropdownItem>
      </Dropdown>
    </div>
  );
};

const UserTable: React.FC<UserTableProps> = ({ 
  users, 
  onUserAction, 
  onCreateUser,
  isCreatingUser = false 
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const openDrawer = useCallback(() => {
    setIsDrawerOpen(true);
  }, []);

  const closeDrawer = useCallback(() => {
    setIsDrawerOpen(false);
  }, []);

  const submitUserCreation = useCallback((userData: CreateUserFormData) => {
    if (onCreateUser) {
      onCreateUser(userData);
      closeDrawer();
    }
  }, [onCreateUser, closeDrawer]);
  const getUserDisplayName = useCallback((user: User): string => {
    return `${user.firstName} ${user.lastName}`.trim();
  }, []);

  const getUserInitials = useCallback((user: User): string => {
    const firstInitial = user.firstName?.charAt(0)?.toUpperCase() || '';
    const lastInitial = user.lastName?.charAt(0)?.toUpperCase() || '';
    return firstInitial + lastInitial;
  }, []);

  const getRoleColor = useCallback((role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      case 'manager':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'user':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  }, []);

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="px-8 py-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-2xl text-gray-900 dark:text-white">
                Users Management
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {users.length} total users
              </p>
            </div>
            <Button
              variant="default"
              onClick={openDrawer}
              startIcon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              }
            >
              Add User
            </Button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-gray-200 dark:border-gray-700">
                <TableCell
                  isHeader
                  className="px-8 text-left text-sm font-semibold text-gray-900 dark:text-white"
                >
                  Name
                </TableCell>
                <TableCell
                  isHeader
                  className="px-8 text-left text-sm font-semibold text-gray-900 dark:text-white"
                >
                  Role
                </TableCell>
                <TableCell
                  isHeader
                  className="px-8 text-left text-sm font-semibold text-gray-900 dark:text-white"
                >
                  Status
                </TableCell>
                <TableCell
                  isHeader
                  className="px-8 py-4 text-right text-sm font-semibold text-gray-900 dark:text-white"
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <TableCell className="py-3 px-8">
                    <div className="flex items-center gap-4">
                      <Avatar
                        name={getUserDisplayName(user)}
                        size="medium"
                        className="flex-shrink-0"
                      />
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {getUserDisplayName(user)}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 px-8">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium capitalize ${getRoleColor(user.role)}`}>
                      {user.role}
                    </span>
                  </TableCell>
                  <TableCell className="py-3 px-8">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      user.status === 'active' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
                    }`}>
                      {user.status}
                    </span>
                  </TableCell>
                  <TableCell className="py-3 px-8 text-right">
                    <UserActionDropdown userId={user.id} onAction={onUserAction} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <Drawer
        isOpen={isDrawerOpen}
        onClose={closeDrawer}
        title="Add New User"
        width="xl"
      >
        <UserForm
          onSubmit={submitUserCreation}
          onCancel={closeDrawer}
          isLoading={isCreatingUser}
        />
      </Drawer>
    </>
  );
};

export default UserTable;
