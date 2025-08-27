export interface TeamMember {
  id?: string;
  userId?: string;
  firstName: string;
  lastName: string;
  name?: string;
  email: string;
  companyRole: string;
  accessRole?: string;
  accessRoleId: number;
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  avatarUrl?: string;
  profilePicture?: string;
  dateJoined?: string;
  lastActivity?: string;
  status: 'active' | 'inactive' | 'pending';
}

export interface TeamMembersResponse {
  success: boolean;
  data: {
    items: TeamMember[];
    totalCount: number;
    currentPage: number;
    totalPages: number;
    pagination: {
      currentPage: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
  };
  message?: string;
}
