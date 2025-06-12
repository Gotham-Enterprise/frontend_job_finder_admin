export interface Company {
  id: number;
  name: string;
  logo?: string;
  industry: string;
  location: string;
  employeeCount: string;
  description: string;
}

export interface CompanySearchProps {
  onCompanySelect: (company: Company) => void;
}