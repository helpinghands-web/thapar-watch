'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/app/stores/authStore';

export default function ProtectedRoute({ children, adminOnly = false }: { children: React.ReactNode; adminOnly?: boolean }) {
  const router = useRouter();
  const { user, token } = useAuthStore();

  useEffect(() => {
    if (!token) {
      router.push('/login');
    } else if (adminOnly && user?.role !== 'admin') {
      router.push('/');
    }
  }, [token, user, adminOnly, router]);

  if (!token) return <div>Loading...</div>;
  if (adminOnly && user?.role !== 'admin') return <div>Access Denied</div>;

  return <>{children}</>;
}
