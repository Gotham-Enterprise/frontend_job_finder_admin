export interface Language {
    id: number;
    name: string;
  }
  
  export interface LanguageListResponse {
    success: boolean;
    data: Language[];
  }