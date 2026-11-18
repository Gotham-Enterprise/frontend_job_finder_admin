import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  officeSpaceLandlordsApi,
} from "../api/officeSpaceLandlords";
import { OfficeSpaceLandlordFilters } from "../types/officeSpace";
import { showToast } from "../utils/toast";

export const officeSpaceLandlordsQueryKeys = {
  all: ["officeSpaceLandlords"] as const,
  list: (filters: OfficeSpaceLandlordFilters) =>
    [...officeSpaceLandlordsQueryKeys.all, filters] as const,
};

export const useLandlords = (filters: OfficeSpaceLandlordFilters) => {
  return useQuery({
    queryKey: officeSpaceLandlordsQueryKeys.list(filters),
    queryFn: () => officeSpaceLandlordsApi.listLandlords(filters),
    staleTime: 0,
  });
};

export const useToggleLandlordInternal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isInternal }: { id: string; isInternal: boolean }) =>
      officeSpaceLandlordsApi.toggleInternal(id, isInternal),
    onSuccess: (_data, vars) => {
      showToast.success(
        vars.isInternal
          ? "Own listing enabled"
          : "Own listing disabled",
        vars.isInternal
          ? "This landlord's listings now bypass the Stripe property post gateway."
          : "This landlord's listings now require the paid property post credit.",
      );
      queryClient.invalidateQueries({
        queryKey: officeSpaceLandlordsQueryKeys.all,
      });
    },
    onError: (error: any) => {
      showToast.error(
        "Update failed",
        error?.response?.data?.message || "Could not update the landlord."
      );
    },
  });
};