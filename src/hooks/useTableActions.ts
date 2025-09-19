import { useAuthPermissions } from './useAuthPermissions';
import { hasPermission } from '../utils/permissionUtils';
import { UserPermissions } from '../services/types/permissions';

interface TableAction {
  key: string;
  label: string;
  icon?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning';
  onClick: (item: any) => void;
  show: boolean;
  disabled?: boolean;
}

interface UseTableActionsProps {
  module: keyof UserPermissions;
  actions?: {
    edit?: {
      label?: string;
      icon?: React.ReactNode;
      onClick: (item: any) => void;
      disabled?: (item: any) => boolean;
    };
    delete?: {
      label?: string;
      icon?: React.ReactNode;
      onClick: (item: any) => void;
      disabled?: (item: any) => boolean;
    };
    view?: {
      label?: string;
      icon?: React.ReactNode;
      onClick: (item: any) => void;
      disabled?: (item: any) => boolean;
    };
    create?: {
      label?: string;
      icon?: React.ReactNode;
      onClick: () => void;
      disabled?: boolean;
    };
    custom?: Array<{
      key: string;
      label: string;
      icon?: React.ReactNode;
      variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning';
      onClick: (item: any) => void;
      show: (item: any) => boolean;
      disabled?: (item: any) => boolean;
      requiredPermission?: keyof UserPermissions[keyof UserPermissions];
    }>;
  };
}

export const useTableActions = ({ 
  module, 
  actions = {} 
}: UseTableActionsProps) => {
  const { permissions, loading, error } = useAuthPermissions();

  const getRowActions = (item: any): TableAction[] => {
    if (!permissions || loading) return [];

    const rowActions: TableAction[] = [];

    // View action
    if (actions.view && hasPermission(permissions, module, 'view')) {
      rowActions.push({
        key: 'view',
        label: actions.view.label || 'View',
        icon: actions.view.icon,
        variant: 'primary',
        onClick: actions.view.onClick,
        show: true,
        disabled: actions.view.disabled?.(item) || false,
      });
    }

    // Edit action
    if (actions.edit && hasPermission(permissions, module, 'update')) {
      rowActions.push({
        key: 'edit',
        label: actions.edit.label || 'Edit',
        icon: actions.edit.icon,
        variant: 'secondary',
        onClick: actions.edit.onClick,
        show: true,
        disabled: actions.edit.disabled?.(item) || false,
      });
    }

    // Delete action
    if (actions.delete && hasPermission(permissions, module, 'delete')) {
      rowActions.push({
        key: 'delete',
        label: actions.delete.label || 'Delete',
        icon: actions.delete.icon,
        variant: 'danger',
        onClick: actions.delete.onClick,
        show: true,
        disabled: actions.delete.disabled?.(item) || false,
      });
    }

    // Custom actions
    if (actions.custom) {
      actions.custom.forEach((customAction) => {
        const requiredPermission = customAction.requiredPermission || 'view';
        
        if (hasPermission(permissions, module, requiredPermission)) {
          rowActions.push({
            key: customAction.key,
            label: customAction.label,
            icon: customAction.icon,
            variant: customAction.variant || 'secondary',
            onClick: customAction.onClick,
            show: customAction.show(item),
            disabled: customAction.disabled?.(item) || false,
          });
        }
      });
    }

    return rowActions.filter(action => action.show);
  };

  const canCreate = () => {
    if (!permissions || loading) return false;
    return hasPermission(permissions, module, 'create');
  };

  const canView = () => {
    if (!permissions || loading) return false;
    return hasPermission(permissions, module, 'view');
  };

  const canEdit = () => {
    if (!permissions || loading) return false;
    return hasPermission(permissions, module, 'update');
  };

  const canDelete = () => {
    if (!permissions || loading) return false;
    return hasPermission(permissions, module, 'delete');
  };

  const hasAnyPermission = () => {
    if (!permissions || loading) return false;
    return canView() || canCreate() || canEdit() || canDelete();
  };

  const getCreateAction = () => {
    if (!actions.create || !canCreate()) return null;
    
    return {
      label: actions.create.label || 'Create',
      icon: actions.create.icon,
      onClick: actions.create.onClick,
      disabled: actions.create.disabled || false,
    };
  };

  return {
    getRowActions,
    canCreate,
    canView,
    canEdit,
    canDelete,
    hasAnyPermission,
    getCreateAction,
    permissions,
    loading,
    error,
  };
};

export default useTableActions;
