import { apiGet, apiPost, apiPut, apiPatch, apiDelete } from './apiUtils';

// Career interfaces based on backend structure
export interface Career {
  id: string;
  jobTitle: string;
  department: string;
  location: string;
  address?: string;
  city: string;
  state: string;
  zipCode?: string;
  country?: string;
  departmentId?: string;
  unitId?: string;
  timezone?: string;
  jobType: string;
  workPlaceType: string;
  salaryRange?: string;
  salaryRangeStart?: number;
  salaryRangeEnd?: number;
  jobDescription?: string; // preferred
  description?: string; // legacy
  requirements?: string[];
  benefits?: string[];
  status: 'active' | 'closed' | 'draft';
  postedDate: string;
  applicantCount: number;
  createdAt: string;
  updatedAt: string;
  applicants?: {
    items: Array<{
      id: string;
      name: string;
      email: string;
      phone?: string;
      appliedDate: string;
      status: string;
      resumeUrl?: string;
    }>;
    totalCount: number;
  };
}

export interface CareerFilters {
  page?: number;
  limit?: number;
  keywords?: string;
  department?: string;
  status?: 'active' | 'closed' | 'draft';
}

export interface CareerResponse {
  success: boolean;
  data: Career[];
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

export interface CareerDetailsResponse {
  success: boolean;
  data: Career;
  message?: string;
}

export interface CreateCareerPayload {
  jobTitle: string;
  jobType: string;
  address?: string;
  city: string;
  state: string;
  zipCode?: string;
  country?: string;
  departmentId?: string;
  unitId?: string;
  timezone: string;
  salaryRangeStart?: number;
  salaryRangeEnd: number;
  jobDescription: string;
}

export interface UpdateCareerPayload extends Partial<CreateCareerPayload> {}

export interface CareerApplicantResponse {
  success: boolean;
  data: {
    id: string;
    applicants: Array<{
      id: string;
      name: string;
      email: string;
      phone?: string;
      appliedDate: string;
      status: string;
      resumeUrl?: string;
    }>;
  };
  message?: string;
}

export const careersApi = {
  // GET /api/admin/careers - Get all careers with filtering
  async getCareers(filters: CareerFilters = {}): Promise<CareerResponse> {
    const queryParams = new URLSearchParams();
    
    if (filters.page) queryParams.append('page', filters.page.toString());
    if (filters.limit) queryParams.append('limit', filters.limit.toString());
    if (filters.keywords) queryParams.append('keywords', filters.keywords);
    if (filters.department) queryParams.append('department', filters.department);
    if (filters.status) queryParams.append('status', filters.status);

    const endpoint = `/api/admin/careers?${queryParams.toString()}`;
    
    return apiGet<CareerResponse>(endpoint);
  },

  // GET /api/admin/careers/:id - Get career by ID (includes applicants)
  async getCareerById(id: string, page: number = 1, limit: number = 10, keywords: string = ''): Promise<CareerDetailsResponse> {
    const params = new URLSearchParams();
    if (page > 1) params.append('page', page.toString());
    if (limit !== 10) params.append('limit', limit.toString());
    if (keywords) params.append('keywords', keywords);
    
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiGet<CareerDetailsResponse>(`/api/admin/careers/${id}${query}`);
  },

  // POST /api/admin/careers - Create new career
  async createCareer(payload: CreateCareerPayload): Promise<{ success: boolean; data: Career; message?: string }> {
    return apiPost<{ success: boolean; data: Career; message?: string }>('/api/admin/careers', payload);
  },

  // PUT /api/admin/careers/:id - Update career
  async updateCareer(id: string, payload: UpdateCareerPayload): Promise<{ success: boolean; data: Career; message?: string }> {
    return apiPut<{ success: boolean; data: Career; message?: string }>(`/api/admin/careers/${id}`, payload);
  },

  // DELETE /api/admin/careers/:id - Delete career (commented out in backend)
  async deleteCareer(id: string): Promise<{ success: boolean; message?: string }> {
    return apiDelete<{ success: boolean; message?: string }>(`/api/admin/careers/${id}`);
  },

  // PATCH /api/admin/careers/:id/toggle - Toggle career status
  async toggleCareer(id: string): Promise<{ success: boolean; data: Career; message?: string }> {
    return apiPatch<{ success: boolean; data: Career; message?: string }>(`/api/admin/careers/${id}/toggle`);
  },

  // PUT /api/admin/careers/:id/duplicate - Duplicate career
  async duplicateCareer(id: string): Promise<{ success: boolean; data: Career; message?: string }> {
    return apiPut<{ success: boolean; data: Career; message?: string }>(`/api/admin/careers/${id}/duplicate`);
  },

  // GET /api/admin/careers/:id/applicant - Get career applicants
  async getCareerApplicants(id: string): Promise<CareerApplicantResponse> {
    return apiGet<CareerApplicantResponse>(`/api/admin/careers/${id}/applicant`);
  },

  // PATCH /api/admin/careers/:id/status - Update career status
  async updateCareerStatus(id: string, status: 'active' | 'closed' | 'draft'): Promise<{ success: boolean; data: Career; message?: string }> {
    return apiPatch<{ success: boolean; data: Career; message?: string }>(`/api/admin/careers/${id}/status`, { status });
  },

  // Get dropdown options (if needed)
  async getDepartments(): Promise<{ success: boolean; data: Array<{ id: string; name: string; units?: Array<{ id: string; name: string }> }> }> {
    return apiGet<{ success: boolean; data: Array<{ id: string; name: string; units?: Array<{ id: string; name: string }> }> }>('/api/careers/department');
  },

  async getLocations(): Promise<{ success: boolean; data: Array<{ id: string; name: string }> }> {
    return apiGet<{ success: boolean; data: Array<{ id: string; name: string }> }>('/api/careers/location');
  },

  async getJobTypes(): Promise<{ success: boolean; data: Array<{ id: string; name: string }> }> {
    return apiGet<{ success: boolean; data: Array<{ id: string; name: string }> }>('/api/careers/jobType');
  },

  async getWorkPlaceTypes(): Promise<{ success: boolean; data: Array<{ id: string; name: string }> }> {
    return apiGet<{ success: boolean; data: Array<{ id: string; name: string }> }>('/api/careers/workPlaceType');
  },
};
