"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { officeSpaceAdminApi } from "../api/officeSpaceAdmin";
import { OfficeSpaceOptionPayload } from "../types/officeSpace";
import { showToast } from "../utils/toast";

export const officeSpaceOptionsQueryKeys = {
  specialties: ["officeSpaceSpecialties"] as const,
  propertyTypes: ["officeSpacePropertyTypes"] as const,
};

// ─── Specialties Hooks ────────────────────────────────────────────────────────

export const useOfficeSpaceSpecialties = () => {
  return useQuery({
    queryKey: officeSpaceOptionsQueryKeys.specialties,
    queryFn: async () => {
      const res = await officeSpaceAdminApi.getSpecialties();
      return res.data || [];
    },
  });
};

export const useCreateOfficeSpaceSpecialty = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: OfficeSpaceOptionPayload) =>
      officeSpaceAdminApi.createSpecialty(payload),
    onSuccess: (res) => {
      queryClient.invalidateQueries({
        queryKey: officeSpaceOptionsQueryKeys.specialties,
      });
      showToast.success("Specialty Added!", `"${res.data.name}" has been added.`);
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || error.message || "Failed to create specialty";
      showToast.error("Creation Failed", msg);
    },
  });
};

export const useUpdateOfficeSpaceSpecialty = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<OfficeSpaceOptionPayload> }) =>
      officeSpaceAdminApi.updateSpecialty(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: officeSpaceOptionsQueryKeys.specialties,
      });
      showToast.success("Specialty Updated!", "Changes have been saved.");
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || error.message || "Failed to update specialty";
      showToast.error("Update Failed", msg);
    },
  });
};

export const useDeleteOfficeSpaceSpecialty = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => officeSpaceAdminApi.deleteSpecialty(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: officeSpaceOptionsQueryKeys.specialties,
      });
      showToast.success("Specialty Deleted!", "The specialty has been deleted.");
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || error.message || "Failed to delete specialty";
      showToast.error("Deletion Failed", msg);
    },
  });
};

export const useReorderOfficeSpaceSpecialties = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => officeSpaceAdminApi.reorderSpecialties(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: officeSpaceOptionsQueryKeys.specialties,
      });
      showToast.success("Order Saved!", "Specialties reordered.");
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || error.message || "Failed to reorder specialties";
      showToast.error("Reorder Failed", msg);
    },
  });
};

// ─── Property Types Hooks ─────────────────────────────────────────────────────

export const useOfficeSpacePropertyTypes = () => {
  return useQuery({
    queryKey: officeSpaceOptionsQueryKeys.propertyTypes,
    queryFn: async () => {
      const res = await officeSpaceAdminApi.getPropertyTypes();
      return res.data || [];
    },
  });
};

export const useCreateOfficeSpacePropertyType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: OfficeSpaceOptionPayload) =>
      officeSpaceAdminApi.createPropertyType(payload),
    onSuccess: (res) => {
      queryClient.invalidateQueries({
        queryKey: officeSpaceOptionsQueryKeys.propertyTypes,
      });
      showToast.success("Property Type Added!", `"${res.data.name}" has been added.`);
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || error.message || "Failed to create property type";
      showToast.error("Creation Failed", msg);
    },
  });
};

export const useUpdateOfficeSpacePropertyType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<OfficeSpaceOptionPayload> }) =>
      officeSpaceAdminApi.updatePropertyType(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: officeSpaceOptionsQueryKeys.propertyTypes,
      });
      showToast.success("Property Type Updated!", "Changes have been saved.");
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || error.message || "Failed to update property type";
      showToast.error("Update Failed", msg);
    },
  });
};

export const useDeleteOfficeSpacePropertyType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => officeSpaceAdminApi.deletePropertyType(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: officeSpaceOptionsQueryKeys.propertyTypes,
      });
      showToast.success("Property Type Deleted!", "The property type has been deleted.");
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || error.message || "Failed to delete property type";
      showToast.error("Deletion Failed", msg);
    },
  });
};

export const useReorderOfficeSpacePropertyTypes = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => officeSpaceAdminApi.reorderPropertyTypes(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: officeSpaceOptionsQueryKeys.propertyTypes,
      });
      showToast.success("Order Saved!", "Property types reordered.");
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || error.message || "Failed to reorder property types";
      showToast.error("Reorder Failed", msg);
    },
  });
};
