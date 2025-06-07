'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';

export default function FactoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, initialized, initialize } = useAuthStore();

  useEffect(() => {
    if (!initialized) {
      initialize();
    }
  }, [initialized, initialize]);

  useEffect(() => {
    if (initialized && !isAuthenticated) {
      router.push('/login');
    }
  }, [initialized, isAuthenticated, router]);

  if (!initialized || !isAuthenticated) {
    return null;
  }

  return <>{children}</>;
} 