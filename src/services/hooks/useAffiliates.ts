import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAffiliatePartners,
  getAffiliatePartner,
  createAffiliatePartner,
  updateAffiliatePartner,
  deleteAffiliatePartner,
  uploadAffiliateXML,
  getAffiliateBatches,
  getAffiliateBatchStatus,
  getAffiliateBatchJobs,
  reprocessAffiliateBatch,
  cancelAffiliateBatch,
  getAffiliateAnalytics,
  triggerAffiliateSync,
  getAffiliateSyncStatus,
  rebuildOutboundFeed,
  getPartnerFeedRules,
  createPartnerFeedRule,
  updatePartnerFeedRule,
  deletePartnerFeedRule,
  getCoRegs,
  CreatePartnerData,
  UpdatePartnerData,
  CreateFeedRuleData,
  UpdateFeedRuleData,
  getAffiliateLinks,
  createAffiliateLink,
  updateAffiliateLink,
  deleteAffiliateLink,
  CreateLinkData,
  UpdateLinkData,
} from "../api/affiliates";
import { showToast } from "../utils/toast";

export const affiliateQueryKeys = {
  all: ["affiliates"] as const,
  partners: () => [...affiliateQueryKeys.all, "partners"] as const,
  partner: (id: string) => [...affiliateQueryKeys.partners(), id] as const,
  links: () => [...affiliateQueryKeys.all, "links"] as const,
  batches: () => [...affiliateQueryKeys.all, "batches"] as const,
  batch: (id: string) => [...affiliateQueryKeys.batches(), id] as const,
  batchStatus: (id: string) => [...affiliateQueryKeys.batches(), id, "status"] as const,
  batchJobs: (id: string, page: number) => [...affiliateQueryKeys.batches(), id, "jobs", page] as const,
  analytics: (filters: any) => [...affiliateQueryKeys.all, "analytics", filters] as const,
  feedRules: (partnerId: string) => [...affiliateQueryKeys.all, "feed-rules", partnerId] as const,
  coReg: (partner: string, filters: any) => [...affiliateQueryKeys.all, "coreg", partner, filters] as const,
};

// Partner Management Hooks
export const useAffiliatePartners = (params?: { page?: number; limit?: number; status?: string }) => {
  return useQuery({
    queryKey: [...affiliateQueryKeys.partners(), params || {}],
    queryFn: () => getAffiliatePartners(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
};

export const useAffiliatePartner = (id: string) => {
  return useQuery({
    queryKey: affiliateQueryKeys.partner(id),
    queryFn: () => getAffiliatePartner(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
};

export const useCreateAffiliatePartner = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePartnerData) => createAffiliatePartner(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: affiliateQueryKeys.partners() });
      showToast.success("Partner Created!", `Partner "${data.name}" has been created successfully.`);
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || error.message || "Failed to create partner";
      showToast.error("Creation Failed", errorMessage);
    },
  });
};

export const useUpdateAffiliatePartner = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePartnerData }) => updateAffiliatePartner(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: affiliateQueryKeys.partners() });
      queryClient.invalidateQueries({ queryKey: affiliateQueryKeys.partner(variables.id) });
      showToast.success("Partner Updated!", `Partner "${data.name}" has been updated successfully.`);
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || error.message || "Failed to update partner";
      showToast.error("Update Failed", errorMessage);
    },
  });
};

export const useDeleteAffiliatePartner = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteAffiliatePartner(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: affiliateQueryKeys.partners() });
      showToast.success("Partner Deleted!", "The partner has been deleted successfully.");
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || error.message || "Failed to delete partner";
      showToast.error("Deletion Failed", errorMessage);
    },
  });
};

// Link Management Hooks
export const useAffiliateLinks = (params?: { page?: number; limit?: number; affiliateId?: string }) => {
  return useQuery({
    queryKey: [...affiliateQueryKeys.links(), params || {}],
    queryFn: () => getAffiliateLinks(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10,
  });
};

export const useCreateAffiliateLink = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateLinkData) => createAffiliateLink(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: affiliateQueryKeys.links() });
      showToast.success("Link Created!", "The affiliate link has been created successfully.");
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || error.message || "Failed to create link";
      showToast.error("Creation Failed", errorMessage);
    },
  });
};

export const useUpdateAffiliateLink = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateLinkData }) => updateAffiliateLink(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: affiliateQueryKeys.links() });
      showToast.success("Link Updated!", "The affiliate link has been updated successfully.");
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || error.message || "Failed to update link";
      showToast.error("Update Failed", errorMessage);
    },
  });
};

export const useDeleteAffiliateLink = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteAffiliateLink(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: affiliateQueryKeys.links() });
      showToast.success("Link Deleted!", "The affiliate link has been deleted successfully.");
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || error.message || "Failed to delete link";
      showToast.error("Deletion Failed", errorMessage);
    },
  });
};

// Sync Management Hooks
export const useTriggerAffiliateSync = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (partnerId: string) => triggerAffiliateSync(partnerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: affiliateQueryKeys.partners() });
      queryClient.invalidateQueries({ queryKey: affiliateQueryKeys.batches() });
      showToast.success("Sync Triggered!", "Feed synchronization has been started.");
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || error.message || "Failed to trigger sync";
      showToast.error("Sync Failed", errorMessage);
    },
  });
};

export const useAffiliateSyncStatus = () => {
  return useQuery({
    queryKey: [...affiliateQueryKeys.all, "sync-status"],
    queryFn: getAffiliateSyncStatus,
    refetchInterval: (query) => {
      // Poll every 3 seconds if any sync is running, otherwise every 30 seconds
      const data = query.state.data as any;
      const hasRunningSync = Array.isArray(data) && data.some((partner: any) => partner.isRunning);
      return hasRunningSync ? 3000 : 30000;
    },
  });
};

// Upload & Batch Management Hooks
export const useAffiliateBatches = (
  params?: {
    page?: number;
    limit?: number;
    affiliateId?: string;
    status?: string;
  },
  options?: { refetchInterval?: number | false }
) => {
  return useQuery({
    queryKey: [...affiliateQueryKeys.batches(), params || {}],
    queryFn: () => getAffiliateBatches(params),
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 5,
    refetchInterval: options?.refetchInterval,
  });
};

export const useAffiliateBatchStatus = (
  batchId: string,
  options?: {
    enabled?: boolean;
    refetchInterval?: number;
  }
) => {
  return useQuery({
    queryKey: affiliateQueryKeys.batchStatus(batchId),
    queryFn: () => getAffiliateBatchStatus(batchId),
    enabled: options?.enabled ?? !!batchId,
    refetchInterval: options?.refetchInterval, // For polling
    staleTime: 0, // Always fetch fresh data when polling
  });
};

export const useAffiliateBatchJobs = (
  batchId: string,
  params?: {
    page?: number;
    limit?: number;
  }
) => {
  return useQuery({
    queryKey: affiliateQueryKeys.batchJobs(batchId, params?.page || 1),
    queryFn: () => getAffiliateBatchJobs(batchId, params),
    enabled: !!batchId,
    staleTime: 1000 * 60 * 2,
  });
};

export const useReprocessAffiliateBatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (batchId: string) => reprocessAffiliateBatch(batchId),
    onSuccess: (data, batchId) => {
      queryClient.invalidateQueries({ queryKey: affiliateQueryKeys.batchStatus(batchId) });
      queryClient.invalidateQueries({ queryKey: affiliateQueryKeys.batches() });
      showToast.success("Batch Reprocessing!", "The batch has been queued for reprocessing.");
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || error.message || "Failed to reprocess batch";
      showToast.error("Reprocess Failed", errorMessage);
    },
  });
};

export const useCancelAffiliateBatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (batchId: string) => cancelAffiliateBatch(batchId),
    onSuccess: (_data, batchId) => {
      queryClient.invalidateQueries({ queryKey: affiliateQueryKeys.batchStatus(batchId) });
      queryClient.invalidateQueries({ queryKey: affiliateQueryKeys.batches() });
      showToast.success("Batch Cancelled", "Reprocessing has been stopped for this batch.");
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || error.message || "Failed to cancel batch";
      showToast.error("Cancel Failed", errorMessage);
    },
  });
};

// Analytics Hooks
export const useAffiliateAnalytics = (params?: {
  affiliateId?: string;
  startDate?: string;
  endDate?: string;
  source?: "manual" | "auto-redirect" | "partner-feed";
  partnerType?: "selling" | "buying";
  deduplicate?: boolean;
  requireApplication?: boolean;
}) => {
  return useQuery({
    queryKey: affiliateQueryKeys.analytics(params || {}),
    queryFn: () => getAffiliateAnalytics(params),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });
};

// Outbound Feed Hooks
export const useRebuildOutboundFeed = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (partnerId: string) => rebuildOutboundFeed(partnerId),
    onSuccess: (_data, partnerId) => {
      queryClient.invalidateQueries({ queryKey: affiliateQueryKeys.partners() });
      queryClient.invalidateQueries({ queryKey: affiliateQueryKeys.partner(partnerId) });
      showToast.success("Feed Rebuilt!", "Outbound feed has been rebuilt successfully.");
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || error.message || "Failed to rebuild feed";
      showToast.error("Rebuild Failed", errorMessage);
    },
  });
};

export const usePartnerFeedRules = (partnerId: string) => {
  return useQuery({
    queryKey: affiliateQueryKeys.feedRules(partnerId),
    queryFn: () => getPartnerFeedRules(partnerId),
    enabled: !!partnerId,
    staleTime: 1000 * 60 * 2,
  });
};

export const useCreateFeedRule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ partnerId, data }: { partnerId: string; data: CreateFeedRuleData }) =>
      createPartnerFeedRule(partnerId, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: affiliateQueryKeys.feedRules(variables.partnerId) });
      showToast.success("Rule Created!", "Feed rule has been created successfully.");
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || error.message || "Failed to create feed rule";
      showToast.error("Creation Failed", errorMessage);
    },
  });
};

export const useUpdateFeedRule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      ruleId,
      partnerId,
      data,
    }: {
      ruleId: string;
      partnerId: string;
      data: UpdateFeedRuleData;
    }) => updatePartnerFeedRule(ruleId, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: affiliateQueryKeys.feedRules(variables.partnerId) });
      showToast.success("Rule Updated!", "Feed rule has been updated successfully.");
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || error.message || "Failed to update feed rule";
      showToast.error("Update Failed", errorMessage);
    },
  });
};

export const useDeleteFeedRule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ruleId }: { ruleId: string; partnerId: string }) =>
      deletePartnerFeedRule(ruleId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: affiliateQueryKeys.feedRules(variables.partnerId) });
      showToast.success("Rule Deleted!", "Feed rule has been deleted successfully.");
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || error.message || "Failed to delete feed rule";
      showToast.error("Deletion Failed", errorMessage);
    },
  });
};

// Co-Registration Hooks
export const useCoRegs = (params?: {
  page?: number;
  limit?: number;
  status?: string;
  startDate?: string;
  endDate?: string;
  partner?: string;
}) => {
  const partner = params?.partner || "adzuna";
  return useQuery({
    queryKey: affiliateQueryKeys.coReg(partner, params || {}),
    queryFn: () => getCoRegs(params),
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 5,
  });
};
