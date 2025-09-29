import { NextRequest, NextResponse } from 'next/server';

// Define the interface for the expected user data structure
interface UserPermission {
  id: string;
  roleId: number;
  permissionId: string;
  add: boolean;
  view: boolean;
  edit: boolean;
  delete: boolean;
  permission: {
    id: string;
    name: string;
    description: string;
  };
}

interface AdminRoleAccess {
  id: number;
  roleName: string;
  rolePermissions: UserPermission[];
}

interface UserData {
  id: string;
  email: string;
  name: string;
  adminRoleAccess: AdminRoleAccess;
}

// Mock data for development - replace with actual database/API calls
const mockUserData: UserData = {
  id: '1',
  email: 'admin@example.com',
  name: 'Admin User',
  adminRoleAccess: {
    id: 1,
    roleName: 'Super Admin',
    rolePermissions: [
      {
        id: '1',
        roleId: 1,
        permissionId: 'tickets',
        add: true,
        view: true,
        edit: true,
        delete: true,
        permission: {
          id: 'tickets',
          name: 'Tickets Management',
          description: 'Manage support tickets',
        },
      },
      {
        id: '2',
        roleId: 1,
        permissionId: 'job-seekers',
        add: true,
        view: true,
        edit: true,
        delete: true,
        permission: {
          id: 'job-seekers',
          name: 'Job Seekers Management',
          description: 'Manage job seekers',
        },
      },
      {
        id: '3',
        roleId: 1,
        permissionId: 'employers',
        add: true,
        view: true,
        edit: true,
        delete: true,
        permission: {
          id: 'employers',
          name: 'Employers Management',
          description: 'Manage employers',
        },
      },
      {
        id: '4',
        roleId: 1,
        permissionId: 'jobs',
        add: true,
        view: true,
        edit: true,
        delete: true,
        permission: {
          id: 'jobs',
          name: 'Jobs Management',
          description: 'Manage job postings',
        },
      },
      {
        id: '5',
        roleId: 1,
        permissionId: 'applications',
        add: true,
        view: true,
        edit: true,
        delete: true,
        permission: {
          id: 'applications',
          name: 'Applications Management',
          description: 'Manage job applications',
        },
      },
      {
        id: '6',
        roleId: 1,
        permissionId: 'coupons',
        add: true,
        view: true,
        edit: true,
        delete: true,
        permission: {
          id: 'coupons',
          name: 'Coupons Management',
          description: 'Manage discount coupons',
        },
      },
      {
        id: '7',
        roleId: 1,
        permissionId: 'blog',
        add: true,
        view: true,
        edit: true,
        delete: true,
        permission: {
          id: 'blog',
          name: 'Blog Management',
          description: 'Manage blog posts',
        },
      },
      {
        id: '8',
        roleId: 1,
        permissionId: 'careers',
        add: true,
        view: true,
        edit: true,
        delete: true,
        permission: {
          id: 'careers',
          name: 'Careers Management',
          description: 'Manage career listings',
        },
      },
    ],
  },
};

// Helper function to validate authentication token
function validateAuthToken(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '') || request.cookies.get('authToken')?.value;
  
  // For development, accept any token or no token
  // In production, implement proper JWT validation
  return true; // Always return true for now
}

export async function GET(request: NextRequest) {
  try {
    // Validate authentication
    if (!validateAuthToken(request)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Unauthorized',
          data: null,
        },
        { status: 401 }
      );
    }

    // In a real application, you would:
    // 1. Get user ID from the authenticated token
    // 2. Fetch user data from database
    // 3. Join with roles and permissions tables
    // 4. Return the structured data
    
    // For now, return mock data
    return NextResponse.json(
      {
        success: true,
        message: 'User data retrieved successfully',
        data: mockUserData,
      },
      { 
        status: 200,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      }
    );

  } catch (error) {
    console.error('Error in /api/auth/me:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
        data: null,
      },
      { status: 500 }
    );
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
