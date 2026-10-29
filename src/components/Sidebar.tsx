'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Layers,
  PackagePlus,
  Scissors,
  QrCode,
  BarChart3,
  Settings,
  ShieldCheck,
  Box,
  Lock,
  LogOut,
} from 'lucide-react';
import { UserRole } from '@/lib/types';
import { useApp } from './AppShell';

interface SidebarProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  activeCount?: number;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ currentRole, activeCount, isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { permissions, logout } = useApp();

  const navItems = [
    {
      name: 'Dashboard',
      href: '/',
      icon: LayoutDashboard,
      allowed: permissions.canViewDashboard,
      badge: null,
    },
    {
      name: 'Stock Register',
      href: '/register',
      icon: Layers,
      allowed: permissions.canViewRegister,
      badge: activeCount !== undefined ? activeCount : null,
    },
    {
      name: 'Reel Inward (Stock In)',
      href: '/inward',
      icon: PackagePlus,
      allowed: permissions.canInwardReels,
      badge: '+Add',
    },
    {
      name: 'Reel Issue / Consume',
      href: '/consumption',
      icon: Scissors,
      allowed: permissions.canIssueReels,
      badge: null,
    },
    {
      name: 'Cut Sheet Stock',
      href: '/sheets',
      icon: Box,
      allowed: permissions.canViewSheets,
      badge: null,
    },
    {
      name: 'Barcode & QR Labels',
      href: '/labels',
      icon: QrCode,
      allowed: permissions.canPrintLabels,
      badge: null,
    },
    {
      name: 'Valuation & Reports',
      href: '/reports',
      icon: BarChart3,
      allowed: permissions.canViewReports,
      badge: null,
    },
    {
      name: 'Admin Portal',
      href: '/admin',
      icon: ShieldCheck,
      allowed: permissions.canAccessAdmin || currentRole === 'ADMIN',
      badge: 'Admin',
    },
  ];

  const renderNavContent = (isMobile: boolean = false) => (
    <>
      <div>
        {/* Brand Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#d97706] flex items-center justify-center shadow-md shadow-amber-500/25 text-white font-extrabold text-xl font-heading shrink-0">
              ON
            </div>
            <div>
              <h1 className="font-heading font-extrabold text-xs tracking-wide text-slate-900 leading-tight uppercase">
                OM NAMASIVAYAM
              </h1>
              <p className="text-[10px] text-amber-600 font-bold tracking-wider uppercase mt-0.5">
                Corrugated Packaging
              </p>
            </div>
          </div>
          {isMobile && onClose && (
            <button
              onClick={onClose}
              className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              aria-label="Close menu"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          )}
        </div>

        {/* Plant Status Tag */}
        <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
          <span className="text-slate-700 flex items-center gap-1.5 text-[11px] font-semibold">
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#d97706' }}></span>
            <span>70–90 T/M Plant</span>
          </span>
          <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full border border-amber-300 font-bold font-mono">
            Puducherry
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-210px)]">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            const isAllowed = item.allowed;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => {
                  if (isMobile && onClose) {
                    onClose();
                  }
                }}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'btn-theme-primary text-white font-bold shadow-md shadow-amber-500/20'
                    : isAllowed
                    ? 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50 opacity-60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : isAllowed ? 'text-amber-600' : 'text-slate-400'}`} />
                  <span className={!isAllowed ? 'line-through text-xs' : ''}>{item.name}</span>
                </div>

                {!isAllowed ? (
                  <span title="Restricted for current role" className="text-slate-400">
                    <Lock className="w-3.5 h-3.5" />
                  </span>
                ) : item.badge !== null ? (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-mono shrink-0 ${
                      isActive
                        ? 'bg-white/25 text-white font-bold'
                        : 'bg-amber-100 text-amber-800 border border-amber-300 font-bold'
                    }`}
                  >
                    {item.badge}
                  </span>
                ) : null}
              </Link>
            );
          })}

          <div className="pt-2 mt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={async () => {
                if (onClose) onClose();
                await logout();
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4 shrink-0 text-rose-600" />
              <span>Sign Out</span>
            </button>
          </div>
        </nav>
      </div>

      {/* Footer Branding */}
      <div className="p-4 border-t border-slate-200 bg-slate-50 text-center">
        <p className="text-[10px] font-bold text-amber-700 tracking-wider uppercase font-heading">
          OM NAMASIVAYAM PACKAGING
        </p>
        <p className="text-[10px] text-slate-500 font-medium mt-0.5">
          Phone: +91 86080 12974
        </p>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar (>= 1024px) */}
      <aside className="hidden lg:flex w-64 bg-white border-r border-slate-200 flex-col justify-between h-screen sticky top-0 no-print select-none z-30 shadow-sm shrink-0">
        {renderNavContent(false)}
      </aside>

      {/* Mobile Drawer Backdrop & Sidebar (< 1024px) */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity duration-300"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Drawer Panel */}
          <div className="fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-white border-r border-slate-200 flex flex-col justify-between h-full shadow-2xl z-10 transition-transform duration-300 ease-in-out">
            {renderNavContent(true)}
          </div>
        </div>
      )}
    </>
  );
}
