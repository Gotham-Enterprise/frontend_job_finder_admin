import {
  JobSeekerFilters,
  JobSeekersResponse,
  JobSeekerDetailsResponse,
  JobSeekerUpdateData,
  ShareResumeRequest,
  ShareResumeResponse,
} from "../types/jobSeeker";
import { apiGet, apiPut, apiPost } from "./apiUtils";

export const jobSeekerApi = {
  async getJobSeekers(filters: JobSeekerFilters = {}): Promise<JobSeekersResponse> {
    const queryParams = new URLSearchParams();

    if (filters.page) queryParams.append("page", filters.page.toString());
    if (filters.limit) queryParams.append("limit", filters.limit.toString());
    if (filters.search) queryParams.append("name", filters.search);
    if (filters.city) queryParams.append("city", filters.city);
    if (filters.radius) queryParams.append("radius", filters.radius.toString());
    if (filters.location) queryParams.append("location", filters.location);
    if (filters.specialty) queryParams.append("specialty", filters.specialty);
    if (filters.occupationId) queryParams.append("occupationId", filters.occupationId.toString());
    if (filters.status) queryParams.append("status", filters.status);
    if (filters.licenseName) queryParams.append("licenseName", filters.licenseName);
    if (filters.licenseIssuingState) queryParams.append("licenseIssuingState", filters.licenseIssuingState);
    if (filters.registrationStartDate) queryParams.append("registrationStartDate", filters.registrationStartDate);
    if (filters.registrationEndDate) queryParams.append("registrationEndDate", filters.registrationEndDate);

    const endpoint = `/api/admin/jobseekers?${queryParams.toString()}`;

    return apiGet<JobSeekersResponse>(endpoint);
  },

  async viewResume(resumeId: string): Promise<any> {
    return apiGet<any>(`/api/resumes/${resumeId}/view`);
  },

  async getJobSeekerById(id: string): Promise<JobSeekerDetailsResponse> {
    return apiGet<JobSeekerDetailsResponse>(`/api/admin/jobseekers/${id}`);
  },

  async updateJobSeeker(id: string, data: JobSeekerUpdateData): Promise<any> {
    // Create FormData if file is present
    if (data.uploadProfilePicture) {
      const formData = new FormData();

      // Append all form fields
      formData.append("firstName", data.firstName);
      formData.append("lastName", data.lastName);
      formData.append("address", data.address);
      formData.append("city", data.city);
      formData.append("state", data.state);
      formData.append("country", data.country);
      formData.append("zipCode", data.zipCode);
      formData.append("phoneNumber", data.phoneNumber);
      formData.append("occupationId", data.occupationId.toString());
      if (data.specialtyId) {
        formData.append("specialtyId", data.specialtyId.toString());
      }

      // Append the file
      formData.append("uploadProfilePicture", data.uploadProfilePicture);

      return apiPut<any>(`/api/admin/jobseekers/${id}`, formData);
    }

    // Use regular JSON if no file
    return apiPut<any>(`/api/admin/jobseekers/${id}`, data);
  },

  async shareResume(resumeId: string, request: ShareResumeRequest): Promise<ShareResumeResponse> {
    const endpoint = `/api/admin/jobseekers/share/${resumeId}/send-email`;
    console.log("Share Resume API Call:", { endpoint, resumeId, request });
    return apiPost<ShareResumeResponse>(endpoint, request);
  },

  async resetPassword(email: string): Promise<any> {
    return apiPost<any>("/api/auth/forgot-password", { email });
  },

  async exportJobSeekers(filters: JobSeekerFilters = {}): Promise<void> {
    const queryParams = new URLSearchParams();

    if (filters.search) queryParams.append("name", filters.search);
    if (filters.city) queryParams.append("city", filters.city);
    if (filters.radius) queryParams.append("radius", filters.radius.toString());
    if (filters.location) queryParams.append("location", filters.location);
    if (filters.specialty) queryParams.append("specialty", filters.specialty);
    if (filters.occupationId) queryParams.append("occupationId", filters.occupationId.toString());
    if (filters.status) queryParams.append("status", filters.status);
    if (filters.licenseName) queryParams.append("licenseName", filters.licenseName);
    if (filters.licenseIssuingState) queryParams.append("licenseIssuingState", filters.licenseIssuingState);
    if (filters.registrationStartDate) queryParams.append("registrationStartDate", filters.registrationStartDate);
    if (filters.registrationEndDate) queryParams.append("registrationEndDate", filters.registrationEndDate);

    const endpoint = `/api/admin/jobseekers/export?${queryParams.toString()}`;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    const fullUrl = `${baseUrl}${endpoint}`;

    // Get auth token from localStorage
    const token = localStorage.getItem("token");

    // Fetch the CSV file
    const response = await fetch(fullUrl, {
      method: "GET",
      credentials: "include",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to export: ${response.statusText}`);
    }

    // Get the blob from response
    const blob = await response.blob();

    // Extract filename from Content-Disposition header or use default
    const contentDisposition = response.headers.get("Content-Disposition");
    let filename = "job-seekers-export.csv";
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
      if (filenameMatch && filenameMatch[1]) {
        filename = filenameMatch[1];
      }
    }

    // Create a download link and trigger download
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
};
