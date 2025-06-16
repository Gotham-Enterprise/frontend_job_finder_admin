export interface ShiftType {
  id: number;
  name: string;
}

export interface ShiftTypeListResponse {
  success: boolean;
  data: ShiftType[];
}
