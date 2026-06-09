'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { useApp } from '@/context/AppContext';
import { getCurrentUser } from '@/services/api';
import { Bell, Wifi } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { currentUser, setCurrentUser } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (!currentUser) {
      getCurrentUser().then((user) => {
        if (user) {
          setCurrentUser({ ...user, role: 'admin' });
        } else {
          router.push('/');
        }
      });
    }
  }, [currentUser, setCurrentUser, router]);

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Admin Top Header */}
        <header className="glass border-b border-white/[0.06] px-8 py-3.5 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">
              System Online · Latency 12ms
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-white/[0.06] transition-colors relative">
              <Bell size={18} />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500" />
            </button>
            {currentUser && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg glass border border-white/[0.08]">
                <div className="w-6 h-6 rounded-full bg-dark-600 flex items-center justify-center text-xs font-bold text-slate-300">
                  {currentUser.name[0]}
                </div>
                <div>
                  <p className="text-xs font-semibold text-white">{currentUser.name}</p>
                  <p className="text-[10px] text-slate-600">ID: #{currentUser.userID}</p>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-8 max-w-[1600px]">{children}</main>
      </div>
    </div>
  );
}
