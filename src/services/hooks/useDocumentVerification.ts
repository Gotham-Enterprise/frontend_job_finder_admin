import { useMutation, useQuery } from "@tanstack/react-query";
import { documentVerificationApi } from "../api/documentVerification";
import {
  DocumentVerification,
  DocumentVerificationBatchUpdate,
  DocumentVerificationFilters,
  DocumentVerificationStatusUpdate,
} from "../types/documentVerification";

export const documentVerificationQueryKeys = {
  all: ["documentVerifications"] as const,
  lists: () => [...documentVerificationQueryKeys.all, "list"] as const,
  list: (filters: DocumentVerificationFilters) => [...documentVerificationQueryKeys.lists(), filters] as const,
  details: () => [...documentVerificationQueryKeys.all, "details"] as const,
  detail: (kind: string, id: string) => [...documentVerificationQueryKeys.details(), kind, id] as const,
};

const staleTime = 1000 * 60 * 5; // 5 minutes
const retry = (failureCount: number, error: Error) => {
  if (error.message.includes("HTTP 401")) {
    return false;
  }
  return failureCount < 3;
};
const retryDelay = (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000);

export const useGetDocumentVerifications = (filters: DocumentVerificationFilters) => {
  return useQuery({
    retry,
    retryDelay,
    staleTime,
    queryKey: documentVerificationQueryKeys.list(filters),
    queryFn: () => {
      return documentVerificationApi.getDocumentVerifications(filters);
    },
  });
};

export const useGetDocumentVerificationDetails = (kind: DocumentVerification["kind"], id: DocumentVerification["id"]) => {
  return useQuery({
    retry,
    retryDelay,
    staleTime,
    queryKey: documentVerificationQueryKeys.detail(kind, id),
    queryFn: () => {
      return documentVerificationApi.getDocumentVerificationDetails(kind, id);
    },
  });
};

export const useDocumentVerificationUpdateStatus = () => {
  return useMutation({
    mutationFn: (data: DocumentVerificationStatusUpdate) => documentVerificationApi.updateDocumentVerificationStatus(data),
  });
};

export const useDocumentVerificationBatchUpdateStatus = () => {
  return useMutation({
    mutationFn: (data: DocumentVerificationBatchUpdate) =>
      documentVerificationApi.batchUpdateDocumentVerificationStatus(data),
  });
};
