export interface WorkSetting {
  id: number;
  name: string;
}

export interface WorkSettingsListResponse {
  success: boolean;
  data: WorkSetting[];
}
