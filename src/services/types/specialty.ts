export interface Specialty {
  id: number;
  name: string;
  ordering?: number;
  occupation?: Array<{ id: number; name: string }>;
  occupationIds?: number[];
  createdAt?: string;
  updatedAt?: string;
}

export interface SpecialtyOccupationData {
  id: number;
  name: string;
  specialty: Specialty[];
}

export interface SpecialtyListResponse {
  success: boolean;
  count?: number;
  data: SpecialtyOccupationData | Specialty[];
}

export interface SpecialtyResponse {
  success: boolean;
  data: Specialty;
  message?: string;
}

export interface CreateSpecialtyPayload {
  name: string;
  occupationIds: number[];
}

export interface UpdateSpecialtyPayload {
  name: string;
  occupationIds: number[];
}

