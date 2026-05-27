'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutGrid, Car, CalendarClock, User, LogOut } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { clsx } from 'clsx';

const navLinks = [
  { href: '/dashboard', label: 'Map', icon: LayoutGrid },
  { href: '/dashboard/vehicles', label: 'My Vehicles', icon: Car },
  { href: '/dashboard/bookings', label: 'Bookings', icon: CalendarClock },
  { href: '/dashboard/profile', label: 'Profile', icon: User },
];

export default function Navbar() {
  const pathname = usePathname();
  const { currentUser, setCurrentUser } = useApp();

  return (
    <header className="glass sticky top-0 z-50 border-b border-white/[0.06]">
      <div className="max-w-[1920px] mx-auto px-6 lg:px-10">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#00f0ff] to-[#0891b2] flex items-center justify-center">
              <LayoutGrid size={18} className="text-dark-950" />
            </div>
            <span className="font-bold text-lg tracking-wider uppercase text-white">
              Metro<span className="text-[#00f0ff]"> Park</span>
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive =
                link.href === '/dashboard'
                  ? pathname === '/dashboard'
                  : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={clsx(
                    'nav-link flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'text-[#00f0ff] bg-[#00f0ff]/[0.08]'
                      : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                  )}
                >
                  <link.icon size={16} />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* User Info */}
          <div className="flex items-center gap-4">
            {currentUser && (
              <div className="hidden lg:flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-semibold text-white">{currentUser.name}</p>
                  <p className="text-xs text-slate-500">ID: #{currentUser.userID}</p>
                </div>
                <div className="w-9 h-9 rounded-full bg-dark-700 border border-white/10 flex items-center justify-center">
                  <User size={16} className="text-slate-400" />
                </div>
              </div>
            )}
            <button
              onClick={() => {
                setCurrentUser(null);
                window.location.href = '/';
              }}
              className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-colors"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <nav className="md:hidden flex items-center gap-1 px-4 pb-3 overflow-x-auto">
        {navLinks.map((link) => {
          const isActive =
            link.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={clsx(
                'flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap',
                isActive
                  ? 'text-[#00f0ff] bg-[#00f0ff]/[0.08]'
                  : 'text-slate-400 hover:text-white'
              )}
            >
              <link.icon size={14} />
              {link.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
