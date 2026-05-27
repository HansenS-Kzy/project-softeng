'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/dashboard/Navbar';
import { useApp } from '@/context/AppContext';
import { getCurrentUser } from '@/services/api';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { currentUser, setCurrentUser } = useApp();
  const router = useRouter();

  useEffect(() => {
    // Auto-login with mock user for demo if not authenticated
    if (!currentUser) {
      getCurrentUser().then((user) => {
        if (user) {
          setCurrentUser(user);
        } else {
          router.push('/');
        }
      });
    }
  }, [currentUser, setCurrentUser, router]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-[1920px] mx-auto w-full px-6 lg:px-10 py-8">
        {children}
      </main>
    </div>
  );
}
