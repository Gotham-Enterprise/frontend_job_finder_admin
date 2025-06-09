import { useAutoLogout } from '@/context/AutoLogoutContext';

export const useInactivityReset = () => {
  const { resetInactivityTimer } = useAutoLogout();
  
  return {
    resetTimer: resetInactivityTimer,
  };
};
