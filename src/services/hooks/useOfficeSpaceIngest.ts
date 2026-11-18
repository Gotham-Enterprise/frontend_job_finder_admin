import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { officeSpaceIngestApi } from "../api/officeSpaceIngest";
import { showToast } from "../utils/toast";
import {
  IngestEditableFields,
  IngestImportResult,
  IngestInputRow,
  IngestRecordFilters,
  IngestSource,
} from "../types/officeSpaceIngest";

export const officeSpaceIngestQueryKeys = {
  all: ["officeSpaceIngest"] as const,
  records: () => [...officeSpaceIngestQueryKeys.all, "records"] as const,
  recordList: (filters: IngestRecordFilters) =>
    [...officeSpaceIngestQueryKeys.records(), filters] as const,
  recordDetails: () => [...officeSpaceIngestQueryKeys.all, "record"] as const,
  record: (id: string) => [...officeSpaceIngestQueryKeys.recordDetails(), id] as const,
  landlords: () => [...officeSpaceIngestQueryKeys.all, "landlords"] as const,
  batches: () => [...officeSpaceIngestQueryKeys.all, "batches"] as const,
  batchList: (page: number, limit: number) =>
    [...officeSpaceIngestQueryKeys.batches(), { page, limit }] as const,
  batch: (id: string) => [...officeSpaceIngestQueryKeys.batches(), id] as const,
};

export const useIngestRecords = (filters: IngestRecordFilters) => {
  return useQuery({
    queryKey: officeSpaceIngestQueryKeys.recordList(filters),
    queryFn: () => officeSpaceIngestApi.getRecords(filters),
    staleTime: 0,
  });
};

export const useIngestRecord = (id: string) => {
  return useQuery({
    queryKey: officeSpaceIngestQueryKeys.record(id),
    queryFn: () => officeSpaceIngestApi.getRecordById(id),
    enabled: !!id,
    staleTime: 0,
  });
};

export const useIngestLandlords = () => {
  return useQuery({
    queryKey: officeSpaceIngestQueryKeys.landlords(),
    queryFn: () => officeSpaceIngestApi.getLandlords(),
    // Landlord records change rarely; no need to refetch on every mount.
    staleTime: 5 * 60_000,
  });
};

export const useIngestBatches = (page: number = 1, limit: number = 20) => {
  return useQuery({
    queryKey: officeSpaceIngestQueryKeys.batchList(page, limit),
    queryFn: () => officeSpaceIngestApi.getBatches(page, limit),
    staleTime: 0,
  });
};

interface ImportVariables {
  rows: IngestInputRow[];
  source: IngestSource;
  fileName?: string;
  dryRun?: boolean;
}

interface ImportCsvVariables {
  csv: string;
  source: IngestSource;
  fileName?: string;
  dryRun?: boolean;
}

const reportImportResult = (result: IngestImportResult, isDryRun: boolean) => {
  if (isDryRun) return;

  if (result.failed > 0) {
    showToast.warning(
      "Import Completed with Errors",
      `${result.created} created, ${result.updated} updated, ${result.failed} rejected.`
    );
  } else {
    showToast.success(
      "Import Complete",
      `${result.created} created, ${result.updated} updated.`
    );
  }
};

const afterImport = (
  queryClient: ReturnType<typeof useQueryClient>,
  result: IngestImportResult,
  isDryRun: boolean
) => {
  // A dry run writes nothing, so there is nothing to refresh.
  if (isDryRun) return;

  queryClient.invalidateQueries({
    queryKey: officeSpaceIngestQueryKeys.all,
  });
  reportImportResult(result, isDryRun);
};

export const useImportIngestRows = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ rows, source, fileName, dryRun }: ImportVariables) =>
      officeSpaceIngestApi.importRows({ rows, source, fileName, dryRun }),
    onSuccess: (result, variables) =>
      afterImport(queryClient, result, !!variables.dryRun),
    onError: (error: Error) => {
      showToast.error("Import Failed", error.message || "Could not import rows.");
    },
  });
};

export const useImportIngestCsv = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ csv, source, fileName, dryRun }: ImportCsvVariables) =>
      officeSpaceIngestApi.importCsvText({ csv, source, fileName, dryRun }),
    onSuccess: (result, variables) =>
      afterImport(queryClient, result, !!variables.dryRun),
    onError: (error: Error) => {
      showToast.error("Import Failed", error.message || "Could not import the file.");
    },
  });
};

export const useUpdateIngestRecord = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: IngestEditableFields }) =>
      officeSpaceIngestApi.updateRecord(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: officeSpaceIngestQueryKeys.all,
      });
      showToast.success("Record Updated", "The ingest record has been updated.");
    },
    onError: (error: Error) => {
      showToast.error(
        "Update Failed",
        error.message || "Could not update the record."
      );
    },
  });
};

export const useDeleteIngestRecord = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => officeSpaceIngestApi.deleteRecord(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: officeSpaceIngestQueryKeys.all,
      });
      showToast.success("Record Deleted", "The ingest record has been deleted.");
    },
    onError: (error: Error) => {
      showToast.error(
        "Delete Failed",
        error.message || "Could not delete the record."
      );
    },
  });
};

export const useClearIngestRecords = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => officeSpaceIngestApi.clearAll(),
    onSuccess: (result) => {
      queryClient.invalidateQueries({
        queryKey: officeSpaceIngestQueryKeys.all,
      });
      showToast.success(
        "Ingest Data Cleared",
        `${result.data.deletedRecords} records and ${result.data.deletedListings} listings removed.`
      );
    },
    onError: (error: Error) => {
      showToast.error(
        "Clear Failed",
        error.message || "Could not clear ingest data."
      );
    },
  });
};

export const useAssignIngestLandlord = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      ids,
      landlordId,
    }: {
      ids: string[];
      landlordId: string | null;
    }) => officeSpaceIngestApi.assignLandlord(ids, landlordId),
    onSuccess: (result) => {
      queryClient.invalidateQueries({
        queryKey: officeSpaceIngestQueryKeys.all,
      });
      showToast.success(
        landlordIdLabel(result.data.updated),
        "Landlord assignment updated."
      );
    },
    onError: (error: Error) => {
      showToast.error(
        "Assignment Failed",
        error.message || "Could not update the landlord assignment."
      );
    },
  });
};

function landlordIdLabel(count: number) {
  return count === 1 ? "Record Updated" : `${count} Records Updated`;
}