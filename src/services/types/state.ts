export interface State {
  id: number;
  name: string;
  abbreviation: string;
}

export interface StateListResponse {
  success: boolean;
  data: {
    states: State[];
  };
}
