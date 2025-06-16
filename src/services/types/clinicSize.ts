export interface ClinicSize {
  id: number;
  name: string;
}

export interface ClinicSizeListResponse {
  success: boolean;
  data: ClinicSize[];
}
