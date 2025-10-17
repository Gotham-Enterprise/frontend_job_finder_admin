import { useQuery } from "@tanstack/react-query";
import { fetchLicenses, fetchLicenseIssuingStates } from "@/services/api/licenses";

export const useLicenses = (q: string = "", page: number = 1, limit: number = 100) => {
  return useQuery({
    queryKey: ["licenses", q, page, limit],
    queryFn: () => fetchLicenses({ q, page, limit }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: true,
  });
};

export const useLicenseIssuingStates = () => {
  return useQuery({
    queryKey: ["licenseIssuingStates"],
    queryFn: fetchLicenseIssuingStates,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
};
