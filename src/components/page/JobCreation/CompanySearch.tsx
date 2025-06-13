import React, { useState } from 'react';
import Input from '@/components/form/input/InputField';
import Button from '@/components/ui/button/Button';
import Label from '@/components/form/Label';
import {Company, CompanySearchProps} from '@/services/types/companySearch';
import { useCompanySearch } from '@/services/hooks/useCompanySearch';


const CompanySearch: React.FC<CompanySearchProps> = ({ onCompanySelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  // Use the API hook for searching companies
  const { data: searchResponse, isLoading: isSearching, error } = useCompanySearch({
    search: searchQuery.trim(),
    page: 1,
    limit: 10,
  });
  const companies = searchResponse?.data || [];

  const handleSearchSubmit = () => {
    // The search is automatically triggered by the useCompanySearch hook
    // when searchQuery changes, so we don't need to do anything here
  };

  const companySelect = (company: Company) => {
    setSelectedCompany(company);
  };

  const initContinue = () => {
    if (selectedCompany) {
      onCompanySelect(selectedCompany);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Search Employer
          </h2>          <p className="text-gray-600 dark:text-gray-400">
            Search for your company to create a job posting.
          </p>
        </div>        
        <div className="mb-8">
          <Label>Company Name</Label>
          <div className="flex gap-4 mt-2">
            <div className="flex-1">              <input
                type="text"
                placeholder="Search for companies (e.g., ABC Group, AutoMotive, Texas)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearchSubmit()}
                className="h-11 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
              />
            </div>
            <Button 
              onClick={handleSearchSubmit}
              disabled={!searchQuery.trim() || isSearching}
              className="px-8"
            >
              {isSearching ? 'Searching...' : 'Search'}
            </Button>
          </div>
        </div>
        {companies.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Search Results ({companies.length} companies found)
            </h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {companies.map((company) => (
                <div
                  key={company.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedCompany?.id === company.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                  onClick={() => companySelect(company)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                          <span className="text-blue-600 dark:text-blue-400 font-semibold text-sm">
                            {company.companyName.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            {company.companyName}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {company.state}
                          </p>
                        </div>
                      </div>
                      <span className="inline-block px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs rounded-full text-gray-600 dark:text-gray-400">
                        Company Size: {company.sizeOfCompany}
                      </span>
                    </div>
                    {selectedCompany?.id === company.id && (
                      <div className="ml-4">
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}        {/* No Results */}
        {companies.length === 0 && searchQuery && !isSearching && !error && (
          <div className="text-center py-8 mb-8">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No companies found
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Try adjusting your search terms or search for a different company.
            </p>
          </div>
        )}

        {/* Error State */}
        {error && searchQuery && (
          <div className="text-center py-8 mb-8">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Search Error
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {error.message || 'An error occurred while searching. Please try again.'}
            </p>
          </div>
        )}        <div className="flex justify-end items-center pt-6 border-t border-gray-200 dark:border-gray-700">
          <Button
            onClick={initContinue}
            disabled={!selectedCompany}
            className={`px-8 ${!selectedCompany ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CompanySearch;
