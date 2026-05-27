'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutGrid, Map, BookOpen, Wallet, ShieldCheck,
  Activity, LogOut, Settings, Cpu
} from 'lucide-react';
import { clsx } from 'clsx';

const adminLinks = [
  { href: '/admin', label: 'Control Center', icon: LayoutGrid },
  { href: '/admin/map', label: 'Live Map', icon: Map },
  { href: '/admin/reservations', label: 'Reservations', icon: BookOpen },
  { href: '/admin/users', label: 'Users', icon: ShieldCheck },
  { href: '/admin/analytics', label: 'Analytics', icon: Activity },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 shrink-0 glass border-r border-white/[0.06] flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00f0ff] to-[#0891b2] flex items-center justify-center">
            <Cpu size={15} className="text-[#0a0e17]" />
          </div>
          <div>
            <p className="text-xs font-bold tracking-widest uppercase text-white">Metro Park</p>
            <p className="text-[10px] text-slate-600 tracking-widest">v1.0 · ADMIN</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
        {adminLinks.map((link) => {
          const isActive =
            link.href === '/admin'
              ? pathname === '/admin'
              : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={clsx(
                'sidebar-link flex items-center gap-3 py-2.5 px-3 rounded-lg text-sm transition-colors',
                isActive ? 'active' : 'text-slate-400'
              )}
            >
              <link.icon size={16} />
              {link.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="border-t border-white/[0.06] p-4 space-y-1">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-white/[0.04] transition-colors"
        >
          <Map size={16} />
          User View
        </Link>
        <button
          onClick={() => (window.location.href = '/')}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-colors"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </aside>
  );
}
