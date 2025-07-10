import { useRouter } from "next/navigation";

interface UseGoBackOptions {
  preserveJobSeekersState?: boolean;
  preserveEmployersState?: boolean;
  preserveApplicationsState?: boolean;
  preserveJobsState?: boolean;
  fallbackPath?: string;
}

const useGoBack = (options: UseGoBackOptions = {}) => {
  const router = useRouter();
  const { preserveJobSeekersState = false, preserveEmployersState = false, preserveApplicationsState = false, preserveJobsState = false, fallbackPath = "/" } = options;

  const goBack = () => {
    if (preserveJobSeekersState && typeof window !== 'undefined') {
      const savedState = localStorage.getItem('jobseeker-search-state');
      if (savedState) {
        try {
          const state = JSON.parse(savedState);
          const params = new URLSearchParams();
          
          if (state.page && state.page > 1) params.set('page', state.page.toString());
          if (state.limit && state.limit !== 50) params.set('limit', state.limit.toString());
          if (state.search) params.set('search', encodeURIComponent(state.search));
          if (state.location) params.set('location', state.location);
          if (state.occupationId) params.set('occupationId', state.occupationId.toString());
          if (state.status) params.set('status', state.status);
          
          const url = params.toString() ? `/admin/job-seekers?${params.toString()}` : '/admin/job-seekers';
          router.push(url);
          return;
        } catch (error) {
          console.error('Error parsing saved state:', error);
        }
      }
   
      router.push('/admin/job-seekers');
      return;
    }

    if (preserveEmployersState && typeof window !== 'undefined') {
      const savedState = localStorage.getItem('employerListState');
      if (savedState) {
        try {
          const state = JSON.parse(savedState);
          const params = new URLSearchParams();
          
          if (state.filters) {
            if (state.filters.page && state.filters.page > 1) params.set('page', state.filters.page.toString());
            if (state.filters.limit && state.filters.limit !== 50) params.set('limit', state.filters.limit.toString());
            if (state.filters.name) params.set('name', encodeURIComponent(state.filters.name));
            if (state.filters.location) params.set('location', state.filters.location);
            if (state.filters.status) params.set('status', state.filters.status);
          }
          
          const url = params.toString() ? `/admin/employers?${params.toString()}` : '/admin/employers';
          router.push(url);
          return;
        } catch (error) {
          console.error('Error parsing saved state:', error);
        }
      }
      router.push('/admin/employers');
      return;
    }

    if (preserveApplicationsState && typeof window !== 'undefined') {
      const savedState = localStorage.getItem('jobApplicationsListState');
      if (savedState) {
        try {
          const state = JSON.parse(savedState);
          const params = new URLSearchParams();
          
          if (state.filters) {
            if (state.filters.page && state.filters.page > 1) params.set('page', state.filters.page.toString());
            if (state.filters.limit && state.filters.limit !== 50) params.set('limit', state.filters.limit.toString());
            if (state.filters.name) params.set('name', encodeURIComponent(state.filters.name));
            if (state.filters.location) params.set('location', state.filters.location);
            if (state.filters.companyName) params.set('companyName', encodeURIComponent(state.filters.companyName));
            if (state.filters.status) params.set('status', state.filters.status);
          }
          
          const url = params.toString() ? `/admin/applications?${params.toString()}` : '/admin/applications';
          router.push(url);
          return;
        } catch (error) {
          console.error('Error parsing saved state:', error);
        }
      }
      router.push('/admin/applications');
      return;
    }

    if (preserveJobsState && typeof window !== 'undefined') {
      const savedState = localStorage.getItem('jobsAdminListState');
      if (savedState) {
        try {
          const state = JSON.parse(savedState);
          const params = new URLSearchParams();
          
          if (state.filters) {
            if (state.filters.page && state.filters.page > 1) params.set('page', state.filters.page.toString());
            if (state.filters.limit && state.filters.limit !== 50) params.set('limit', state.filters.limit.toString());
            if (state.filters.name) params.set('name', encodeURIComponent(state.filters.name));
            if (state.filters.state) params.set('state', state.filters.state);
            if (state.filters.jobStatus) params.set('jobStatus', state.filters.jobStatus);
            if (state.filters.datePosted) params.set('datePosted', state.filters.datePosted);
            if (state.filters.occupationId) params.set('occupationId', state.filters.occupationId.toString());
            if (state.filters.specialtyId) params.set('specialtyId', state.filters.specialtyId.toString());
          }
          
          const url = params.toString() ? `/admin/jobs?${params.toString()}` : '/admin/jobs';
          router.push(url);
          return;
        } catch (error) {
          console.error('Error parsing saved state:', error);
        }
      }
      router.push('/admin/jobs');
      return;
    }
    if (window.history.length > 1) {
      router.back(); 
    } else {
      router.push(fallbackPath); 
    }
  };

  return goBack;
};

export default useGoBack;
