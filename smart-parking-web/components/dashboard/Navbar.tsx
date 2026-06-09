'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { LayoutGrid, Car, CalendarClock, User, ShieldCheck, LogOut } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { logout } from '@/services/api';
import { clsx } from 'clsx';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, setCurrentUser } = useApp();

  const navLinks = [
    { href: '/dashboard', label: 'Map', icon: LayoutGrid },
    { href: '/dashboard/vehicles', label: 'My Vehicles', icon: Car },
    { href: '/dashboard/bookings', label: 'Bookings', icon: CalendarClock },
    { href: '/dashboard/profile', label: 'Profile', icon: User },
  ];

  const handleLogout = async () => {
    await logout();
    setCurrentUser(null);
    router.push('/');
  };

  return (
    <header className="glass sticky top-0 z-50 border-b border-white/[0.06]">
      <div className="max-w-[1920px] mx-auto px-6 lg:px-10">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-3">
            <span className="font-bold text-white tracking-widest uppercase">Metro Park</span>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-1">
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={clsx(
                      'flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all',
                      isActive ? 'bg-white/[0.08] text-white' : 'text-slate-400 hover:text-white'
                    )}
                  >
                    <Icon size={16} />
                    {link.label}
                  </Link>
                );
              })}
            </div>

            {/* Tombol Back to Admin */}
            {currentUser?.role === 'admin' && (
              <Link
                href="/admin"
                className="flex items-center gap-2 px-4 py-2 ml-2 rounded-lg text-amber-400 hover:bg-amber-400/10 transition-colors border border-amber-400/20"
              >
                <ShieldCheck size={16} />
                <span className="text-xs font-bold uppercase hidden md:block">Back to Admin</span>
              </Link>
            )}

            {/* Tombol Logout */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 ml-2 rounded-lg text-red-400 hover:bg-red-400/10 transition-colors border border-red-400/20"
            >
              <LogOut size={16} />
              <span className="text-xs font-bold uppercase hidden md:block">Logout</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}