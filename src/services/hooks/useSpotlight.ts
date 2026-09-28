import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { spotlightApi } from "../api/spotlight";
import { errorUtils } from "../utils/errorUtils";
import {
  CampaignReviewPayload,
  ListFilters,
  PlacementInput,
  ReportFilters,
  ReviewPayload,
} from "../types/spotlight";

export const spotlightQueryKeys = {
  all: ["spotlight"] as const,
  reviewQueue: () => [...spotlightQueryKeys.all, "reviewQueue"] as const,
  advertisers: () => [...spotlightQueryKeys.all, "advertisers"] as const,
  advertiserList: (filters: ListFilters) => [...spotlightQueryKeys.advertisers(), "list", filters] as const,
  advertiser: (id: string) => [...spotlightQueryKeys.advertisers(), "detail", id] as const,
  campaigns: () => [...spotlightQueryKeys.all, "campaigns"] as const,
  campaignList: (filters: ListFilters & { advertiserId?: string }) =>
    [...spotlightQueryKeys.campaigns(), "list", filters] as const,
  campaign: (id: string) => [...spotlightQueryKeys.campaigns(), "detail", id] as const,
  placements: () => [...spotlightQueryKeys.all, "placements"] as const,
  report: (filters: ReportFilters) => [...spotlightQueryKeys.all, "report", filters] as const,
};

// Review data changes whenever anyone acts on it, so keep it fresh.
const staleTime = 1000 * 30;
const retry = (failureCount: number, error: Error) => {
  if (errorUtils.isAuthError(error) || errorUtils.isNotFoundError(error)) return false;
  return failureCount < 3;
};

export const useSpotlightReviewQueue = () =>
  useQuery({
    retry,
    staleTime,
    queryKey: spotlightQueryKeys.reviewQueue(),
    queryFn: () => spotlightApi.getReviewQueue(),
  });

export const useSpotlightAdvertisers = (filters: ListFilters) =>
  useQuery({
    retry,
    staleTime,
    queryKey: spotlightQueryKeys.advertiserList(filters),
    queryFn: () => spotlightApi.getAdvertisers(filters),
  });

export const useSpotlightAdvertiser = (id: string) =>
  useQuery({
    retry,
    // Document links are signed for 1 hour; refetching keeps them valid while the page is open.
    staleTime,
    queryKey: spotlightQueryKeys.advertiser(id),
    queryFn: () => spotlightApi.getAdvertiser(id),
  });

export const useSpotlightCampaigns = (filters: ListFilters & { advertiserId?: string }) =>
  useQuery({
    retry,
    staleTime,
    queryKey: spotlightQueryKeys.campaignList(filters),
    queryFn: () => spotlightApi.getCampaigns(filters),
  });

export const useSpotlightCampaign = (id: string) =>
  useQuery({
    retry,
    staleTime,
    queryKey: spotlightQueryKeys.campaign(id),
    queryFn: () => spotlightApi.getCampaign(id),
  });

export const useSpotlightPlacements = () =>
  useQuery({
    retry,
    staleTime,
    queryKey: spotlightQueryKeys.placements(),
    queryFn: () => spotlightApi.getPlacements(),
  });

export const useSpotlightReport = (filters: ReportFilters) =>
  useQuery({
    retry,
    staleTime,
    queryKey: spotlightQueryKeys.report(filters),
    queryFn: () => spotlightApi.getReport(filters),
  });

/** Any review/status action can change the queue, lists and details, so refresh them all. */
const useInvalidateSpotlight = () => {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: spotlightQueryKeys.all });
};

export const useReviewAdvertiser = () => {
  const invalidate = useInvalidateSpotlight();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ReviewPayload }) => spotlightApi.reviewAdvertiser(id, payload),
    onSuccess: invalidate,
  });
};

export const useSuspendAdvertiser = () => {
  const invalidate = useInvalidateSpotlight();
  return useMutation({
    mutationFn: ({ id, note }: { id: string; note: string }) => spotlightApi.suspendAdvertiser(id, note),
    onSuccess: invalidate,
  });
};

export const useReinstateAdvertiser = () => {
  const invalidate = useInvalidateSpotlight();
  return useMutation({
    mutationFn: (id: string) => spotlightApi.reinstateAdvertiser(id),
    onSuccess: invalidate,
  });
};

export const useSetActivePeriod = () => {
  const invalidate = useInvalidateSpotlight();
  return useMutation({
    mutationFn: ({ id, activeFrom, activeUntil }: { id: string; activeFrom: string | null; activeUntil: string | null }) =>
      spotlightApi.setActivePeriod(id, { activeFrom, activeUntil }),
    onSuccess: invalidate,
  });
};

export const useReviewCampaign = () => {
  const invalidate = useInvalidateSpotlight();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CampaignReviewPayload }) =>
      spotlightApi.reviewCampaign(id, payload),
    onSuccess: invalidate,
  });
};

export const useSetCampaignPaused = () => {
  const invalidate = useInvalidateSpotlight();
  return useMutation({
    mutationFn: ({ id, paused }: { id: string; paused: boolean }) =>
      paused ? spotlightApi.pauseCampaign(id) : spotlightApi.resumeCampaign(id),
    onSuccess: invalidate,
  });
};

export const useReviewCreative = () => {
  const invalidate = useInvalidateSpotlight();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ReviewPayload }) => spotlightApi.reviewCreative(id, payload),
    onSuccess: invalidate,
  });
};

export const useSavePlacement = () => {
  const invalidate = useInvalidateSpotlight();
  return useMutation({
    mutationFn: ({ id, input }: { id?: string; input: PlacementInput }) =>
      id ? spotlightApi.updatePlacement(id, input) : spotlightApi.createPlacement(input),
    onSuccess: invalidate,
  });
};
