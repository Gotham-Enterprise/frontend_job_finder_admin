import { apiGet } from "./apiUtils";

export interface SupervisionSelectOption {
  label: string;
  value: string;
}

export interface SupervisorSpecialtyData {
  id: string;
  occupationId: string;
  name: string;
}

export interface SupervisorOccupationData {
  id: string;
  supervisorTypeId: string;
  name: string;
  specialties: SupervisorSpecialtyData[];
}

export interface SupervisorTypeData {
  id: string;
  code: string;
  name: string;
  occupations: SupervisorOccupationData[];
}

/** GET /api/supervision/supervisor-type — hierarchy for supervisee supervision needs. */
export async function fetchSupervisorTypesData(): Promise<SupervisorTypeData[]> {
  const res = await apiGet<{ success?: boolean; data?: SupervisorTypeData[] }>(
    "/api/supervision/supervisor-type",
  );
  return Array.isArray(res?.data) ? res.data : [];
}

/** GET /api/categories/specialties/occupation/:id — profile specialty options. */
export async function fetchSpecialtiesByOccupation(
  occupationId: string,
): Promise<SupervisionSelectOption[]> {
  if (!occupationId) return [];
  const body = await apiGet<{
    success?: boolean;
    data?: { specialty: { id: number; name: string }[] };
  }>(`/api/categories/specialties/occupation/${occupationId}`);
  const list = body?.data?.specialty ?? [];
  return list.map((s) => ({ label: s.name, value: String(s.id) }));
}
