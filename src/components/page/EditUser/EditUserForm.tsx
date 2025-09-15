'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { CreateUserFormData, ROLE_OPTIONS, DEFAULT_PERMISSIONS, FlexiblePermissions } from '@/types/permissions';
import { getPermissionsForRole } from '@/config/permissions';
import { useCreateRole } from '@/services/hooks/useAdminUsers';
import { AdminUser } from '@/services/api/adminUsers';
import { transformApiUserToFormData } from '@/services/utils/userUtils';
import Input from '@/components/ui/input/Input';
import Label from '@/components/form/Label';
import Select from '@/components/form/Select';
import CompactSwitch from '@/components/ui/switch/CompactSwitch';
import { Modal } from '@/components/ui/modal';
import Button from '@/components/ui/button/Button';
import FullScreenSpinner from '@/components/ui/FullScreenSpinner';

interface EditUserFormProps {
  onSubmit: (userData: CreateUserFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
  userData: AdminUser;
  apiRoles: any[];
}

const EditUserForm: React.FC<EditUserFormProps> = ({
  onSubmit,
  onCancel,
  isLoading = false,
  userData,
  apiRoles,
}) => {
  const createRoleMutation = useCreateRole();
  
  const [formData, setFormData] = useState<CreateUserFormData>({
    firstName: '',
    lastName: '',
    email: '',
    role: '',
    permissions: DEFAULT_PERMISSIONS,
  });

  const [errors, setErrors] = useState<Partial<CreateUserFormData>>({});
  const [availableRoles, setAvailableRoles] = useState(ROLE_OPTIONS);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [newRoleData, setNewRoleData] = useState({
    value: '',
    label: ''
  });

  useEffect(() => {
    if (apiRoles.length > 0) {
      const mappedRoles = apiRoles
        .filter(role => {
          // Filter out Super Admin roles
          const roleName = role.roleName.toLowerCase();
          return !roleName.includes('super admin') && 
                 !roleName.includes('superadmin') && 
                 roleName !== 'admin';
        })
        .map(role => ({
          value: role.roleName.toLowerCase().replace(/\s+/g, '-'),
          label: role.roleName
        }));
      
      const uniqueRoles = mappedRoles.filter((role, index, self) => 
        index === self.findIndex(r => r.value === role.value)
      );
      
      setAvailableRoles(uniqueRoles);
    }
  }, [apiRoles]);

  useEffect(() => {
    if (userData && apiRoles.length > 0) {
      const transformedData = transformApiUserToFormData(userData, apiRoles);
      
      const standardModules = ['jobSeekers', 'employers', 'jobs', 'applications', 'careers', 'tickets', 'coupons', 'blog'];
      const enhancedPermissions = { ...transformedData.permissions };
      
      standardModules.forEach(module => {
        if (!enhancedPermissions[module]) {
          enhancedPermissions[module] = {
            view: false,
            add: false,
            edit: false,
            delete: false,
          };
        }
      });
      
      setFormData({
        ...transformedData,
        permissions: enhancedPermissions,
      });
    }
  }, [userData, apiRoles]);

  const isAdminRole = useCallback((role: string) => {
    const roleLabel = availableRoles.find(r => r.value === role)?.label;
    const isAdmin = role === 'admin' || 
           role === 'super-admin' || 
           roleLabel?.toLowerCase().includes('admin') || 
           roleLabel?.toLowerCase() === 'super admin';
    
    console.log('Checking admin role in EditUserForm:', { role, roleLabel, isAdmin });
    return isAdmin;
  }, [availableRoles]);

  const updateRolePermissions = useCallback((role: string) => {
    if (role) {
      // Check if role is admin or super admin - give full permissions
      if (isAdminRole(role)) {
        // Give full permissions to all modules for admin roles
        const adminPermissions: FlexiblePermissions = {};
        const standardModules = ['jobSeekers', 'employers', 'jobs', 'applications', 'careers', 'tickets', 'coupons', 'blog'];
        
        standardModules.forEach(module => {
          adminPermissions[module] = {
            view: true,
            add: true,
            edit: true,
            delete: true,
          };
        });
        
        console.log('Setting admin permissions in EditUserForm:', adminPermissions);
        
        setFormData(prev => ({
          ...prev,
          permissions: adminPermissions,
        }));
      } else {
        // Apply role-based permissions for non-admin roles
        const rolePermissions = getPermissionsForRole(role);
        const flexiblePermissions: FlexiblePermissions = {};
        Object.entries(rolePermissions).forEach(([key, perm]) => {
          flexiblePermissions[key] = {
            view: perm.view,
            add: perm.create,
            edit: perm.update,
            delete: perm.delete,
          };
        });
        setFormData(prev => ({
          ...prev,
          permissions: flexiblePermissions,
        }));
      }
    }
  }, [isAdminRole]);

  const updateFormField = useCallback(<K extends keyof CreateUserFormData>(
    field: K,
    value: CreateUserFormData[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (field === 'role' && typeof value === 'string') {
      updateRolePermissions(value);
    }
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [errors, updateRolePermissions]);

  const updatePermission = useCallback((
    module: string,
    permissionType: 'add' | 'edit' | 'view' | 'delete',
    value: boolean
  ) => {
    setFormData(prev => {
      const currentPermissions = prev.permissions[module] || {
        add: false,
        edit: false,
        view: false,
        delete: false,
      };

      // If turning off view permission, also turn off all other permissions
      if (permissionType === 'view' && !value) {
        return {
          ...prev,
          permissions: {
            ...prev.permissions,
            [module]: {
              view: false,
              add: false,
              edit: false,
              delete: false,
            },
          },
        };
      }

      // Normal update for other cases
      return {
        ...prev,
        permissions: {
          ...prev.permissions,
          [module]: {
            ...currentPermissions,
            [permissionType]: value,
          },
        },
      };
    });
  }, []);

  const validateForm = useCallback((): boolean => {
    const newErrors: Partial<CreateUserFormData> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.role) {
      newErrors.role = 'Role is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const submitForm = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  }, [formData, validateForm, onSubmit]);

  const createRole = useCallback(async () => {
    if (!newRoleData.label.trim()) {
      return;
    }

    try {
      const response = await createRoleMutation.mutateAsync({
        roleName: newRoleData.label.trim()
      });

      if (response.success) {
        const newRole = {
          value: response.data.roleName.toLowerCase().replace(/\s+/g, '-'),
          label: response.data.roleName
        };

        setAvailableRoles(prev => {
          const exists = prev.some(role => role.value === newRole.value);
          if (exists) {
            return prev;
          }
          return [...prev, newRole];
        });
        
        updateFormField('role', newRole.value);
        
        setIsRoleModalOpen(false);
        setNewRoleData({ value: '', label: '' });
      }
    } catch (error) {
      console.error('Role creation error:', error);
    }
  }, [newRoleData, createRoleMutation, updateFormField]);

  const closeRoleModal = useCallback(() => {
    setIsRoleModalOpen(false);
    setNewRoleData({ value: '', label: '' });
  }, []);

  const getDynamicModules = useCallback(() => {
    // Define the order to match the sidebar
    const standardModules = ['jobSeekers', 'employers', 'jobs', 'applications', 'careers', 'tickets', 'coupons', 'blog'];
    
    // Get all available modules from various sources
    const allAvailableModules = new Set<string>();
    
    // Add standard modules
    standardModules.forEach(module => allAvailableModules.add(module));
    
    // Add modules from form permissions
    Object.keys(formData.permissions).forEach(key => {
      allAvailableModules.add(key);
    });
    
    // Add modules from user data
    if (userData?.access) {
      Object.keys(userData.access).forEach(moduleKey => {
        const keyMap: { [key: string]: string } = {
          'Job Seekers': 'jobSeekers',
          'Tickets': 'tickets',
          'Employers': 'employers',
          'Applications': 'applications',
          'Coupons': 'coupons',
          'Blog': 'blog',
          'Careers': 'careers',
          'Jobs': 'jobs',
        };
        
        const mappedKey = keyMap[moduleKey] || moduleKey.toLowerCase().replace(/\s+/g, '');
        allAvailableModules.add(mappedKey);
      });
    }
    
    // Create ordered array with standard modules first, then any additional ones
    const orderedModules: string[] = [];
    
    // Add standard modules in the defined order
    standardModules.forEach(module => {
      if (allAvailableModules.has(module)) {
        orderedModules.push(module);
      }
    });
    
    // Add any additional modules not in the standard list
    allAvailableModules.forEach(module => {
      if (!standardModules.includes(module)) {
        orderedModules.push(module);
      }
    });
    
    return orderedModules.map(key => ({
      key,
      name: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1').trim(),
      description: `Manage ${key.toLowerCase().replace(/([A-Z])/g, ' $1').trim()} access and operations`,
    }));
  }, [formData.permissions, userData]);

  const dynamicModules = getDynamicModules();

  return (
    <>
      <FullScreenSpinner 
        isVisible={isLoading || createRoleMutation.isPending}
        message={createRoleMutation.isPending ? "Creating role..." : "Updating user..."}
      />
      
      <style>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
      
      <form onSubmit={submitForm} className="flex h-full flex-col">
        <div className="flex-1 flex overflow-hidden">
          <div className="w-80 px-6 py-6 space-y-6 overflow-y-auto">
            <div className="grid grid-cols-1 gap-4">
              <div className="transform transition-all duration-200 hover:scale-[1.02]">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="Enter first name"
                  value={formData.firstName}
                  onChange={(e) => updateFormField('firstName', e.target.value)}
                  error={!!errors.firstName}
                  hint={errors.firstName}
                  disabled={isLoading || createRoleMutation.isPending}
                />
              </div>

              <div className="transform transition-all duration-200 hover:scale-[1.02]">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Enter last name"
                  value={formData.lastName}
                  onChange={(e) => updateFormField('lastName', e.target.value)}
                  error={!!errors.lastName}
                  hint={errors.lastName}
                  disabled={isLoading || createRoleMutation.isPending}
                />
              </div>
            </div>

            <div className="transform transition-all duration-200 hover:scale-[1.02]">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter email address"
                value={formData.email}
                onChange={(e) => updateFormField('email', e.target.value)}
                error={!!errors.email}
                hint={errors.email}
                disabled={isLoading || createRoleMutation.isPending}
              />
            </div>

            <div className="transform transition-all duration-200 hover:scale-[1.02]">
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="role">Role</Label>
                <button
                  type="button"
                  onClick={() => setIsRoleModalOpen(true)}
                  disabled={isLoading || createRoleMutation.isPending}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-primary bg-primary/10 border border-primary/20 rounded-md hover:bg-primary/20 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  New Role
                </button>
              </div>
              <Select
                options={availableRoles}
                placeholder="Select role"
                value={formData.role}
                onChange={(value) => updateFormField('role', value)}
                disabled={isLoading || createRoleMutation.isPending}
              />
              {errors.role && (
                <p className="mt-1.5 text-xs text-error-500 animate-pulse">{errors.role}</p>
              )}
            </div>
          </div>

          <div className="flex-1 border-l border-gray-200 dark:border-gray-700" style={{ backgroundColor: '#f5f8fa' }}>
            <div className="px-6 py-6 space-y-4 overflow-y-auto h-full">
              <div className="py-2" style={{ backgroundColor: '#f5f8fa' }}>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Access Permissions
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Configure what this user can access and modify
                </p>
                {formData.role && (
                  <div className="flex items-center gap-2 mt-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      Role: <span className="font-medium text-blue-600">{formData.role}</span> permissions applied
                      {isAdminRole(formData.role) && (
                        <span className="ml-2 px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs rounded-full">
                          Admin Access - Full Permissions
                        </span>
                      )}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="space-y-3">
                {dynamicModules.map((module, index) => (
                  <div 
                    key={module.key} 
                    className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-all duration-200"
                    style={{ 
                      animationDelay: `${index * 50}ms`,
                      animation: 'slideInUp 0.6s ease-out forwards'
                    }}
                  >
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"></div>
                        {module.name}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {module.description}
                      </p>
                    </div>
                    
                    <div className="p-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex items-center justify-between p-4 rounded-lg border border-gray-100 dark:border-gray-700 hover:bg-green-50 dark:hover:bg-green-900/10 transition-colors duration-200 min-w-0">
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-200 flex-shrink-0 ${
                              formData.permissions[module.key]?.view 
                                ? 'bg-green-100 dark:bg-green-900/30' 
                                : 'bg-gray-100 dark:bg-gray-700'
                            }`}>
                              <svg className={`w-4 h-4 transition-colors duration-200 ${
                                formData.permissions[module.key]?.view 
                                  ? 'text-green-600 dark:text-green-400' 
                                  : 'text-gray-600 dark:text-gray-400'
                              }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">View</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">Read access</p>
                            </div>
                          </div>
                          <div className="flex-shrink-0 ml-3">
                            <CompactSwitch
                              label="View"
                              checked={formData.permissions[module.key]?.view || false}
                              onChange={(checked) => updatePermission(module.key, 'view', checked)}
                              disabled={isLoading || createRoleMutation.isPending}
                              size="sm"
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-4 rounded-lg border border-gray-100 dark:border-gray-700 hover:bg-green-50 dark:hover:bg-green-900/10 transition-colors duration-200 min-w-0">
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-200 flex-shrink-0 ${
                              formData.permissions[module.key]?.add 
                                ? 'bg-green-100 dark:bg-green-900/30' 
                                : 'bg-gray-100 dark:bg-gray-700'
                            }`}>
                              <svg className={`w-4 h-4 transition-colors duration-200 ${
                                formData.permissions[module.key]?.add 
                                  ? 'text-green-600 dark:text-green-400' 
                                  : 'text-gray-600 dark:text-gray-400'
                              }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                              </svg>
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">Create</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">Add new items</p>
                            </div>
                          </div>
                          <div className="flex-shrink-0 ml-3">
                            <CompactSwitch
                              label="Create"
                              checked={formData.permissions[module.key]?.add || false}
                              onChange={(checked) => updatePermission(module.key, 'add', checked)}
                              disabled={isLoading || createRoleMutation.isPending || !formData.permissions[module.key]?.view}
                              size="sm"
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-4 rounded-lg border border-gray-100 dark:border-gray-700 hover:bg-yellow-50 dark:hover:bg-yellow-900/10 transition-colors duration-200 min-w-0">
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-200 flex-shrink-0 ${
                              formData.permissions[module.key]?.edit 
                                ? 'bg-green-100 dark:bg-green-900/30' 
                                : 'bg-gray-100 dark:bg-gray-700'
                            }`}>
                              <svg className={`w-4 h-4 transition-colors duration-200 ${
                                formData.permissions[module.key]?.edit 
                                  ? 'text-green-600 dark:text-green-400' 
                                  : 'text-gray-600 dark:text-gray-400'
                              }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">Update</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">Modify existing</p>
                            </div>
                          </div>
                          <div className="flex-shrink-0 ml-3">
                            <CompactSwitch
                              label="Update"
                              checked={formData.permissions[module.key]?.edit || false}
                              onChange={(checked) => updatePermission(module.key, 'edit', checked)}
                              disabled={isLoading || createRoleMutation.isPending || !formData.permissions[module.key]?.view}
                              size="sm"
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-4 rounded-lg border border-gray-100 dark:border-gray-700 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors duration-200 min-w-0">
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-200 flex-shrink-0 ${
                              formData.permissions[module.key]?.delete 
                                ? 'bg-green-100 dark:bg-green-900/30' 
                                : 'bg-gray-100 dark:bg-gray-700'
                            }`}>
                              <svg className={`w-4 h-4 transition-colors duration-200 ${
                                formData.permissions[module.key]?.delete 
                                  ? 'text-green-600 dark:text-green-400' 
                                  : 'text-gray-600 dark:text-gray-400'
                              }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">Delete</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">Remove items</p>
                            </div>
                          </div>
                          <div className="flex-shrink-0 ml-3">
                            <CompactSwitch
                              label="Delete"
                              checked={formData.permissions[module.key]?.delete || false}
                              onChange={(checked) => updatePermission(module.key, 'delete', checked)}
                              disabled={isLoading || createRoleMutation.isPending || !formData.permissions[module.key]?.view}
                              size="sm"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                        <div className="flex items-center justify-between text-xs">
                          <button
                            type="button"
                            onClick={() => {
                              setFormData(prev => ({
                                ...prev,
                                permissions: {
                                  ...prev.permissions,
                                  [module.key]: { view: true, add: true, edit: true, delete: true }
                                }
                              }));
                            }}
                            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors duration-200"
                          >
                            Grant All
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setFormData(prev => ({
                                ...prev,
                                permissions: {
                                  ...prev.permissions,
                                  [module.key]: { view: false, add: false, edit: false, delete: false }
                                }
                              }));
                            }}
                            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 font-medium transition-colors duration-200"
                          >
                            Revoke All
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="mt-6 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Quick Actions</h4>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const allPermissions = { view: true, add: true, edit: true, delete: true };
                        const globalPermissions = dynamicModules.reduce((acc, module) => {
                          acc[module.key] = allPermissions;
                          return acc;
                        }, {} as FlexiblePermissions);
                        setFormData(prev => ({ ...prev, permissions: globalPermissions }));
                      }}
                      className="flex-1 px-3 py-2 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800 dark:hover:bg-blue-900/30 transition-colors duration-200"
                    >
                      Grant All Permissions
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const noPermissions = { view: false, add: false, edit: false, delete: false };
                        const globalPermissions = dynamicModules.reduce((acc, module) => {
                          acc[module.key] = noPermissions;
                          return acc;
                        }, {} as FlexiblePermissions);
                        setFormData(prev => ({ ...prev, permissions: globalPermissions }));
                      }}
                      className="flex-1 px-3 py-2 text-xs font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600 transition-colors duration-200"
                    >
                      Revoke All
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4 bg-gray-50 dark:bg-gray-900/50">
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading || createRoleMutation.isPending}
              className="inline-flex items-center justify-center font-medium gap-2 transition-all duration-200 h-[45px] rounded-lg px-7 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 hover:shadow-md text-gray-700 dark:text-gray-300 transform hover:scale-105 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || createRoleMutation.isPending}
              className="inline-flex items-center justify-center font-medium gap-2 transition-all duration-200 h-[45px] rounded-lg px-7 bg-primary hover:bg-primary/90 text-white shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 focus:ring-2 focus:ring-primary/50 focus:ring-offset-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              {isLoading ? 'Updating User...' : 'Update User'}
            </button>
          </div>
        </div>
      </form>

      <Modal
        isOpen={isRoleModalOpen}
        onClose={closeRoleModal}
        isFullscreen={false}
        className="max-w-lg mx-auto mt-20 rounded-lg"
      >
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Create New Role</h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="roleLabel">Role Name *</Label>
              <Input
                id="roleLabel"
                type="text"
                placeholder="e.g., Content Editor"
                value={newRoleData.label}
                onChange={(e) => setNewRoleData(prev => ({ 
                  ...prev, 
                  label: e.target.value,
                  value: e.target.value.toLowerCase().replace(/\s+/g, '-')
                }))}
                className="mt-1"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                variant="ghost"
                onClick={closeRoleModal}
                disabled={createRoleMutation.isPending}
                className="dark:text-white"
              >
                Cancel
              </Button>
              <Button 
                onClick={createRole}
                disabled={!newRoleData.label.trim() || createRoleMutation.isPending}
                className="bg-primary hover:bg-primary/90"
              >
                {createRoleMutation.isPending ? 'Creating...' : 'Create Role'}
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default EditUserForm;
