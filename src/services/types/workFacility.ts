export interface WorkFacility {
  id: number;
  name: string;
}

export interface WorkFacilityListResponse {
  success: boolean;
  data: WorkFacility[];
}
