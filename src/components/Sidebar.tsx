'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/authContext';
import { 
  LayoutDashboard, 
  Users, 
  CalendarDays, 
  FileText, 
  CreditCard, 
  Smartphone, 
  MapPin,
  Sparkles,
  PhoneCall,
  Building2
} from 'lucide-react';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = true, onClose }) => {
  const pathname = usePathname();
  const { role } = useAuth();

  const navItems = [
    {
      label: 'Executive Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      roles: ['admin', 'dispatcher'],
    },
    {
      label: 'Clients & Properties (CRM)',
      href: '/dashboard/clients',
      icon: Users,
      roles: ['admin', 'dispatcher'],
      badge: 'Core',
    },
    {
      label: 'Dispatch Calendar',
      href: '/dashboard/schedule',
      icon: CalendarDays,
      roles: ['admin', 'dispatcher'],
    },
    {
      label: 'Estimates & Quotes',
      href: '/dashboard/estimates',
      icon: FileText,
      roles: ['admin', 'dispatcher'],
    },
    {
      label: 'Invoices & Stripe Pay',
      href: '/dashboard/invoices',
      icon: CreditCard,
      roles: ['admin', 'dispatcher'],
    },
    {
      label: 'Landlord & Investor Portal',
      href: '/dashboard/investor',
      icon: Building2,
      roles: ['admin', 'dispatcher', 'client'],
      badge: 'Portal',
    },
    {
      label: 'Field Technician Portal',
      href: '/dashboard/technician',
      icon: Smartphone,
      roles: ['admin', 'dispatcher', 'technician'],
      highlight: true,
    },
  ];

  return (
    <>
      {/*  */}
      <div 
        className={`fixed inset-0 bg-black/80 z-30 md:hidden transition-opacity ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/*  */}
      <aside 
        className={`fixed md:sticky top-18 left-0 z-30 w-64 bg-[#111111] border-r border-[#222222] h-[calc(100vh-4.5rem)] flex flex-col justify-between transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 space-y-6 overflow-y-auto">
          {/*  */}
          <div className="bg-[#181818] border border-[#2a2a2a] rounded-xl p-3.5 text-xs">
            <div className="flex items-center justify-between text-[#b8b0a5] font-semibold mb-1">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3 h-3 text-[#FF8A00]" /> Rome Dispatch
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </div>
            <div className="font-bold text-[#fdfbf7] text-sm font-heading">Nailed It Operations</div>
            <div className="text-[11px] text-[#c5a059] mt-0.5 font-medium">
              Role: <span className="capitalize">{role || 'Admin'}</span>
            </div>
          </div>

          {/*  */}
          <nav className="space-y-1">
            <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-[#78716c] mb-2">
              Management Modules
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition ${
                    isActive
                      ? 'bg-[#c5a059] text-black shadow-md font-bold'
                      : item.highlight
                      ? 'text-[#FF8A00] hover:bg-[#1a1a1a] hover:text-[#ff9d2e]'
                      : 'text-[#b8b0a5] hover:bg-[#181818] hover:text-[#fdfbf7]'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[9px] bg-[#222222] text-[#c5a059] px-2 py-0.5 rounded-full border border-[#c5a059]/30 font-bold uppercase">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/*  */}
        <div className="p-4 border-t border-[#222222] bg-[#0c0c0c] text-xs">
          <div className="flex items-center justify-between text-[#78716c]">
            <div>
              <div className="font-bold text-[#fdfbf7]">Rome, GA Hub</div>
              <div className="text-[10px] text-[#b8b0a5]">Floyd County Service</div>
            </div>
            <div className="w-6 h-6 rounded bg-[#c5a059]/15 text-[#c5a059] flex items-center justify-center font-bold text-xs">
              🔨
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
