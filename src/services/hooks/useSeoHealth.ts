import { useQuery } from "@tanstack/react-query";
import { seoHealthAPI } from "../api/seoHealthAPI";

export function useSeoHealth() {
  return useQuery({
    queryKey: ["seoHealth"],
    queryFn: () => seoHealthAPI.getHealth(),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
}

export function useSchemaQuality() {
  return useQuery({
    queryKey: ["seoSchemaQuality"],
    queryFn: () => seoHealthAPI.getSchemaQuality(),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
}
