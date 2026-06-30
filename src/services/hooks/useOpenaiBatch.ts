import { useQuery } from "@tanstack/react-query";
import {
  getOpenAiBatches,
  getOpenAiBatchDetail,
} from "../api/openaiBatch";

export const openaiBatchQueryKeys = {
  all: ["openai-batches"] as const,
  list: (params?: any) => [...openaiBatchQueryKeys.all, "list", params || {}] as const,
  detail: (id: string) => [...openaiBatchQueryKeys.all, "detail", id] as const,
};

export const useOpenaiBatches = (
  params?: {
    page?: number;
    limit?: number;
    status?: string;
  },
  options?: { refetchInterval?: number | false }
) => {
  return useQuery({
    queryKey: openaiBatchQueryKeys.list(params),
    queryFn: () => getOpenAiBatches(params),
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 5,
    refetchInterval: options?.refetchInterval,
  });
};

export const useOpenaiBatchDetail = (id: string) => {
  return useQuery({
    queryKey: openaiBatchQueryKeys.detail(id),
    queryFn: () => getOpenAiBatchDetail(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 2,
  });
};
