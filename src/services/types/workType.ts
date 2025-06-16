export interface WorkType {
  id: number;
  name: string;
}

export interface WorkTypeListResponse {
  success: boolean;
  data: WorkType[];
}
