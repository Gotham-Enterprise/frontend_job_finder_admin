import { apiGet, apiPost, apiPut, apiDelete } from "./apiUtils";
import { PaginationMeta } from "./newsletter";

export interface Contact {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "job-seeker" | "employer";
  customLists: { id: string; name: string }[];
}

export interface ContactList {
  id: string;
  name: string;
  slug: string | null;
  isSystem: boolean;
  contactCount: number;
}

export interface ContactsResponse {
  success: boolean;
  data: Contact[];
  metaData: PaginationMeta;
}

export interface ContactListsResponse {
  success: boolean;
  data: ContactList[];
}

export interface ContactListResponse {
  success: boolean;
  data: ContactList;
}

const BASE = "/api/admin/contacts";

export const contactsApi = {
  getContacts: (page = 1, limit = 20, search?: string) => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (search) params.set("search", search);
    return apiGet<ContactsResponse>(`${BASE}?${params.toString()}`);
  },

  getLists: () => apiGet<ContactListsResponse>(`${BASE}/lists`),

  createList: (name: string) => apiPost<ContactListResponse>(`${BASE}/lists`, { name }),

  renameList: (id: string, name: string) => apiPut<ContactListResponse>(`${BASE}/lists/${id}`, { name }),

  deleteList: (id: string) => apiDelete<{ success: boolean; message: string }>(`${BASE}/lists/${id}`),

  addMembers: (listId: string, userIds: string[]) =>
    apiPost<{ success: boolean; message: string }>(`${BASE}/lists/${listId}/members`, { userIds }),

  removeMembers: (listId: string, userIds: string[]) =>
    apiDelete<{ success: boolean; message: string }>(`${BASE}/lists/${listId}/members`, { body: { userIds } }),
};
