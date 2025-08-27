export interface TeamMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  companyRole: string;
  accessRoleId: number;
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  profilePicture?: string;
  dateJoined: string;
  lastActivity: string;
  status: 'active' | 'inactive' | 'pending';
}

export interface TeamMembersResponse {
  success: boolean;
  data: TeamMember[];
  metaData: {
    page: number;
    limit: number;
    totalPages: number;
    totalCount: number;
    currentPageTotalItems: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  message?: string;
}
