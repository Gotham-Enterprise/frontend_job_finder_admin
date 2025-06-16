export interface LocationValidationField {
  value: string;
  isValid: boolean;
}

export interface LocationValidationData {
  address: LocationValidationField;
  city: LocationValidationField;
  state: LocationValidationField;
  zipCode: LocationValidationField;
}

export interface LocationValidationResponse {
  success: boolean;
  data: LocationValidationData;
}

export interface LocationValidationRequest {
  address: string;
  city: string;
  state: string;
  zipCode: string;
}
