import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { officeSpaceAdminApi } from "../api/officeSpaceAdmin";
import {
  OfficeSpaceAdminFilters,
  OfficeSpaceAdminListingsResponse,
  OfficeSpaceAdminDetailResponse,
  OfficeSpaceAdminStatsResponse,
  OfficeSpaceAdminInquiriesResponse,
} from "../types/officeSpace";

export const officeSpaceQueryKeys = {
  all: ["officeSpaceAdmin"] as const,
  lists: () => [...officeSpaceQueryKeys.all, "list"] as const,
  list: (filters: OfficeSpaceAdminFilters) =>
    [...officeSpaceQueryKeys.lists(), filters] as const,
  details: () => [...officeSpaceQueryKeys.all, "detail"] as const,
  detail: (id: string) => [...officeSpaceQueryKeys.details(), id] as const,
  stats: () => [...officeSpaceQueryKeys.all, "stats"] as const,
  inquiries: () => [...officeSpaceQueryKeys.all, "inquiries"] as const,
  inquiriesList: (page: number, limit: number) =>
    [...officeSpaceQueryKeys.inquiries(), { page, limit }] as const,
};

export const useOfficeSpaceListings = (filters: OfficeSpaceAdminFilters) => {
  return useQuery<OfficeSpaceAdminListingsResponse>({
    queryKey: officeSpaceQueryKeys.list(filters),
    queryFn: () => officeSpaceAdminApi.getListings(filters),
    staleTime: 0,
  });
};

export const useOfficeSpaceDetail = (id: string) => {
  return useQuery<OfficeSpaceAdminDetailResponse>({
    queryKey: officeSpaceQueryKeys.detail(id),
    queryFn: () => officeSpaceAdminApi.getListingById(id),
    enabled: !!id,
    staleTime: 0,
  });
};

export const useOfficeSpaceStats = () => {
  return useQuery<OfficeSpaceAdminStatsResponse>({
    queryKey: officeSpaceQueryKeys.stats(),
    queryFn: () => officeSpaceAdminApi.getStats(),
    staleTime: 30_000,
  });
};

export const useOfficeSpaceInquiries = (page: number = 1, limit: number = 10) => {
  return useQuery<OfficeSpaceAdminInquiriesResponse>({
    queryKey: officeSpaceQueryKeys.inquiriesList(page, limit),
    queryFn: () => officeSpaceAdminApi.getInquiries(page, limit),
    staleTime: 0,
  });
};

export const useUpdateListingStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      officeSpaceAdminApi.updateListingStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: officeSpaceQueryKeys.all,
      });
    },
  });
};
