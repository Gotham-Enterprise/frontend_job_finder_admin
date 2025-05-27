"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authUtils } from '@/services/utils/authUtils';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (authUtils.isAuthenticated()) {
        router.replace('/admin');
      } else {
        router.replace('/login');
      }
    }
  }, [router]);
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
    </div>
  );
}
