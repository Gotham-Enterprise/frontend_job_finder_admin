import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { contactsApi, ContactFilters } from "@/services/api/contacts";
import { showToast } from "@/services/utils/toast";

export const useContacts = (page = 1, limit = 20, search?: string, filters?: ContactFilters) => {
  return useQuery({
    queryKey: ["contacts", page, limit, search, filters],
    queryFn: () => contactsApi.getContacts(page, limit, search, filters),
    staleTime: 2 * 60 * 1000,
  });
};

export const useContactLists = (page = 1, limit = 10, search?: string) => {
  return useQuery({
    queryKey: ["contact-lists", page, limit, search],
    queryFn: () => contactsApi.getLists(page, limit, search),
    staleTime: 2 * 60 * 1000,
  });
};

export const useInfiniteContactLists = (search?: string) => {
  return useInfiniteQuery({
    queryKey: ["contact-lists-infinite", search],
    queryFn: ({ pageParam }) => contactsApi.getLists(pageParam as number, 10, search),
    initialPageParam: 1,
    getNextPageParam: (lastPage, _allPages, lastPageParam) =>
      lastPage.metaData.hasNextPage ? (lastPageParam as number) + 1 : undefined,
    staleTime: 2 * 60 * 1000,
  });
};

export const useListMembers = (listId: string | null, page = 1, limit = 20, search?: string) => {
  return useQuery({
    queryKey: ["list-members", listId, page, limit, search],
    queryFn: () => contactsApi.getListMembers(listId!, page, limit, search),
    enabled: !!listId,
    staleTime: 2 * 60 * 1000,
  });
};

export const useCreateContactList = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => contactsApi.createList(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contact-lists"] });
      showToast.success("Created", "List created successfully");
    },
    onError: (error: any) => {
      showToast.error("Error", error?.message || "Failed to create list");
    },
  });
};

export const useRenameContactList = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => contactsApi.renameList(id, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contact-lists"] });
      showToast.success("Renamed", "List renamed successfully");
    },
    onError: (error: any) => {
      showToast.error("Error", error?.message || "Failed to rename list");
    },
  });
};

export const useDeleteContactList = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => contactsApi.deleteList(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contact-lists"] });
      showToast.success("Deleted", "List deleted successfully");
    },
    onError: (error: any) => {
      showToast.error("Error", error?.message || "Failed to delete list");
    },
  });
};

export const useAddMembersToList = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ listId, userIds }: { listId: string; userIds: string[] }) => contactsApi.addMembers(listId, userIds),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      queryClient.invalidateQueries({ queryKey: ["contact-lists"] });
      queryClient.invalidateQueries({ queryKey: ["list-members", variables.listId] });
      showToast.success("Added", "Contacts added to list");
    },
    onError: (error: any) => {
      showToast.error("Error", error?.message || "Failed to add contacts to list");
    },
  });
};

export const useRemoveMembersFromList = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ listId, userIds }: { listId: string; userIds: string[] }) =>
      contactsApi.removeMembers(listId, userIds),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      queryClient.invalidateQueries({ queryKey: ["contact-lists"] });
      queryClient.invalidateQueries({ queryKey: ["list-members", variables.listId] });
      showToast.success("Removed", "Contacts removed from list");
    },
    onError: (error: any) => {
      showToast.error("Error", error?.message || "Failed to remove contacts from list");
    },
  });
};
