'use client';

import React, { useState } from 'react';
import { Search, Plus, QrCode, Shield, RefreshCw, LogOut, User, Menu } from 'lucide-react';
import Link from 'next/link';
import { UserRole } from '@/lib/types';
import { useApp } from './AppShell';

interface NavbarProps {
  currentRole: UserRole;
  onRefresh?: () => void;
  onSearch?: (query: string) => void;
  onToggleMobileMenu?: () => void;
}

export default function Navbar({ currentRole, onRefresh, onSearch, onToggleMobileMenu }: NavbarProps) {
  const { userSession, logout, permissions } = useApp();
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    if (onSearch) {
      onSearch(e.target.value);
    }
  };

  const roleColors: Record<UserRole, { badge: string; text: string }> = {
    ADMIN: { badge: 'bg-amber-100 border-amber-300 text-amber-800', text: 'text-amber-800' },
    ACCOUNTANT: { badge: 'bg-emerald-100 border-emerald-300 text-emerald-800', text: 'text-emerald-800' },
    STOREKEEPER: { badge: 'bg-blue-100 border-blue-300 text-blue-800', text: 'text-blue-800' },
    OPERATOR: { badge: 'bg-purple-100 border-purple-300 text-purple-800', text: 'text-purple-800' },
  };

  const activeColor = roleColors[currentRole] || roleColors.ADMIN;

  return (
    <header className="h-16 bg-white/90 backdrop-blur-md border-b border-slate-200 px-3 sm:px-6 flex items-center justify-between sticky top-0 z-20 no-print shadow-xs">
      {/* Left: Mobile Menu Toggle & Search Input */}
      <div className="flex items-center gap-2 sm:gap-4 md:gap-6 min-w-0">
        {onToggleMobileMenu && (
          <button
            type="button"
            onClick={onToggleMobileMenu}
            className="lg:hidden p-2 -ml-1 rounded-xl text-slate-700 hover:text-amber-700 hover:bg-slate-100 transition-colors shrink-0"
            aria-label="Open mobile navigation menu"
          >
            <Menu className="w-5 h-5 text-slate-700" />
          </button>
        )}

        <div className="relative w-36 xs:w-48 sm:w-60 md:w-80 transition-all">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search Reel #, Size, Mill..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-amber-500 rounded-xl pl-9 pr-3 py-1.5 sm:py-2 text-xs text-slate-800 placeholder-slate-400 outline-none transition-all shadow-xs"
          />
        </div>

        {/* onpackaging.in Active Plant Indicator (Tablet & Desktop) */}
        <div className="hidden xl:flex items-center gap-2 text-xs text-slate-600 shrink-0">
          <span className="w-2 h-2 rounded-full animate-pulse bg-amber-500"></span>
          <span className="font-semibold text-slate-800">Plant Active:</span>
          <span className="text-amber-700 font-bold">70–90 Tonnes/Month</span>
        </div>
      </div>

      {/* Action Buttons & Status */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        {onRefresh && (
          <button
            onClick={onRefresh}
            title="Refresh Data"
            className="p-1.5 sm:p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-amber-700 hover:border-amber-500/50 shadow-xs transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        )}

        {permissions.canPrintLabels && (
          <Link
            href="/labels"
            className="hidden md:inline-flex items-center gap-2 px-3 py-2 btn-theme-secondary text-xs font-semibold"
          >
            <QrCode className="w-3.5 h-3.5 text-amber-600" />
            <span>Print Labels</span>
          </Link>
        )}

        {permissions.canInwardReels && (
          <Link
            href="/inward"
            className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 btn-theme-primary text-xs font-bold"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden xs:inline">Inward</span>
            <span className="hidden sm:inline">Reel</span>
          </Link>
        )}

        {/* User Profile & Role Indicator */}
        <div className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-3 border-l border-slate-200">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-800 font-extrabold text-xs uppercase font-heading shrink-0">
              {userSession ? userSession.username.substring(0, 2).toUpperCase() : 'US'}
            </div>
            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold text-slate-900 tracking-wide truncate max-w-[110px] md:max-w-[130px] font-heading">
                {userSession?.fullName || userSession?.username || 'User'}
              </div>
              <div className="flex items-center justify-end gap-1">
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border font-bold ${activeColor.badge}`}>
                  {currentRole}
                </span>
              </div>
            </div>
          </div>

          {/* Logout / Switch Role Button */}
          <Link
            href="/login"
            title="Switch User / Sign Out"
            className="p-1.5 sm:p-2 rounded-xl bg-white hover:bg-rose-50 hover:border-rose-300 text-slate-500 hover:text-rose-600 border border-slate-200 shadow-xs transition-colors shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </header>
  );
}
