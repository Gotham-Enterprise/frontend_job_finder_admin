export interface ApplicantDetails {
  id: string;
  candidateId: string;
  name: string;
  email: string;
  phoneNumber: string;
  country: string;
  zipCode: string;
  city: string;
  state: string;
  address: string;
  status: string;
  stateLicenses: string;
  dateJoined: string;
  jobTitle: string;
  companyName: string;
  dateApplied: string;
  introductionVideoUrl: string;
  introductionFilename: string;
  introductionObjectKey: string;
  coverLetterUrl: string;
  coverLetterFilename: string;
  coverLetterObjectKey: string;
  resume: {
    id: string;
    filename: string;
    fileUrl: string;
    fileObjectKey: string;
  };
  employerQuestion: EmployerQuestion[];
}

export interface EmployerQuestion {
  question: string;
  answers?: string[];
  answer?: string | object; 
}

export interface ApplicantDetailsResponse {
  success: boolean;
  data: ApplicantDetails;
  message?: string;
}
