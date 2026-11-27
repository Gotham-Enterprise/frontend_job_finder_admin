import { useEffect, useState } from "react";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  estimateManagedAudience,
  estimateSmsCost,
  getAudienceOccupations,
  getManagedCampaign,
  getManagedCampaigns,
  saveManagedPreparation,
  submitManagedCampaign,
  type ManagedForm,
  type ManagedTab,
} from "../api/campaignManaged";
import { showToast } from "../utils/toast";

const keys = {
  all: ["managed-campaigns"] as const,
  list: (filters: object) => ["managed-campaigns", "list", filters] as const,
  detail: (id: string) => ["managed-campaigns", "detail", id] as const,
  occupations: ["managed-campaigns", "occupations"] as const,
};

export const useManagedCampaigns = (filters: { tab?: ManagedTab; search?: string; page?: number; limit?: number }) =>
  useQuery({ queryKey: keys.list(filters), queryFn: () => getManagedCampaigns(filters), placeholderData: keepPreviousData });

export const useManagedCampaign = (id: string) =>
  useQuery({ queryKey: keys.detail(id), queryFn: () => getManagedCampaign(id), enabled: !!id });

export const useAudienceOccupations = () =>
  useQuery({ queryKey: keys.occupations, queryFn: getAudienceOccupations, staleTime: 5 * 60 * 1000 });

export const useManagedAudienceEstimate = (
  body: { occupationIds: string[]; location?: { latitude: number; longitude: number; radiusMiles: number } },
) =>
  useQuery({
    queryKey: ["managed-campaigns", "estimate", body],
    queryFn: () => estimateManagedAudience(body),
    enabled: body.occupationIds.length > 0,
    placeholderData: keepPreviousData,
  });

// The credits one text uses, worked out by the server with the same rules the real send is charged by.
export const useSmsCost = (smsBody: string, enabled: boolean, extras: { ctaTargetUrl?: string; location?: string; payRate?: string; facilityName?: string; specialtyName?: string; locationText?: string } = {}) => {
  const [settled, setSettled] = useState(smsBody);
  useEffect(() => {
    const timer = setTimeout(() => setSettled(smsBody), 400);
    return () => clearTimeout(timer);
  }, [smsBody]);
  return useQuery({
    queryKey: ["managed-campaigns", "sms-cost", settled, extras.ctaTargetUrl ?? "", extras.location ?? "", extras.payRate ?? "", extras.facilityName ?? "", extras.specialtyName ?? "", extras.locationText ?? ""],
    queryFn: () => estimateSmsCost(settled, extras),
    enabled: enabled && settled.trim().length > 0,
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
  });
};

export const useSaveManagedPreparation = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (form: Partial<ManagedForm>) => saveManagedPreparation(id, form),
    onSuccess: (campaign) => {
      queryClient.setQueryData(keys.detail(id), campaign);
      queryClient.invalidateQueries({ queryKey: keys.all });
    },
    onError: (error: Error) => showToast.error("Could not save", error.message || "Please try again."),
  });
};

export const useSubmitManagedCampaign = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => submitManagedCampaign(id),
    onSuccess: (campaign) => {
      queryClient.setQueryData(keys.detail(id), campaign);
      queryClient.invalidateQueries({ queryKey: keys.all });
      showToast.success("Sent for approval", "The employer can now review and approve this campaign.");
    },
    onError: (error: Error) => showToast.error("Could not submit", error.message || "Please try again."),
  });
};
