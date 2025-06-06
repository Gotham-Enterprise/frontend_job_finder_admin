import { Toast } from '../../context/ToastContext';


let globalAddToast: ((toast: Omit<Toast, 'id'>) => void) | null = null;

export const setGlobalToastFunction = (addToast: (toast: Omit<Toast, 'id'>) => void) => {
  globalAddToast = addToast;
};

export const showToast = {
  success: (title: string, message: string, duration?: number) => {
    if (globalAddToast) {
      globalAddToast({ variant: 'success', title, message, duration });
    } else if (typeof window !== 'undefined') {
      alert(`${title}: ${message}`);
    }
  },
  
  error: (title: string, message: string, duration?: number) => {
    if (globalAddToast) {
      globalAddToast({ variant: 'error', title, message, duration });
    } else if (typeof window !== 'undefined') {
      alert(`Error - ${title}: ${message}`);
    }
  },
  
  warning: (title: string, message: string, duration?: number) => {
    if (globalAddToast) {
      globalAddToast({ variant: 'warning', title, message, duration });
    } else if (typeof window !== 'undefined') {
      alert(`Warning - ${title}: ${message}`);
    }
  },
  
  info: (title: string, message: string, duration?: number) => {
    if (globalAddToast) {
      globalAddToast({ variant: 'info', title, message, duration });
    } else if (typeof window !== 'undefined') {
      alert(`Info - ${title}: ${message}`);
    }
  },
};
