export interface Occupation {
  id: number;
  name: string;
}

export interface OccupationListResponse {
  success: boolean;
  data: Occupation[];
}
