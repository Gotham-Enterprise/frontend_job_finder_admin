// Simple test to check permission transformation
const rolePermissions = [
  {
    "id": "cmfd7f19p00195huev5p6zzln",
    "roleId": 3,
    "permissionId": "cmfd7cjl80002jrcszzt5jfh6",
    "add": true,
    "view": true,
    "edit": true,
    "delete": false,
    "name": "Jobs",
    "description": "Create, edit, and delete job listings"
  }
];

// Test the permission key transformation
rolePermissions.forEach((rolePermission) => {
  const permissionName = rolePermission.name;
  if (permissionName) {
    const permissionKey = permissionName.toLowerCase().replace(/\s+/g, '');
    console.log(`Permission "${permissionName}" -> Key: "${permissionKey}"`);
    console.log('Permissions:', {
      add: rolePermission.add,
      view: rolePermission.view,
      edit: rolePermission.edit,
      delete: rolePermission.delete,
    });
  }
});

// Test access check
const permissionsMap = {};
rolePermissions.forEach((rolePermission) => {
  const permissionName = rolePermission.name;
  if (permissionName) {
    const permissionKey = permissionName.toLowerCase().replace(/\s+/g, '');
    permissionsMap[permissionKey] = {
      add: rolePermission.add,
      view: rolePermission.view,
      edit: rolePermission.edit,
      delete: rolePermission.delete,
    };
  }
});

console.log('\nFinal permissions map:', permissionsMap);

// Test hasPermission function
const hasPermission = (module, action) => {
  const permission = permissionsMap[module];
  if (!permission) return false;
  return permission[action];
};

console.log('\nPermission checks:');
console.log('jobs.view:', hasPermission('jobs', 'view'));
console.log('jobs.add:', hasPermission('jobs', 'add'));
console.log('jobs.edit:', hasPermission('jobs', 'edit'));
console.log('jobs.delete:', hasPermission('jobs', 'delete'));