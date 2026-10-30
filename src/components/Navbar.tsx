'use client';

import React, { useState } from 'react';
import { Search, Plus, QrCode, Shield, RefreshCw, LogOut, User, Menu, Bell, AlertTriangle, X, ArrowRight } from 'lucide-react';
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
  const { userSession, logout, permissions, lowStockReels } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);

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
        {/* Low Stock In-App Notification Bell */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowNotifications((prev) => !prev)}
            title="Low Stock Notifications (≤ 20%)"
            className={`relative p-1.5 sm:p-2 rounded-xl bg-white border transition-all cursor-pointer shadow-xs ${
              lowStockReels.length > 0
                ? 'border-amber-400 text-amber-700 bg-amber-50/50 hover:bg-amber-100/50'
                : 'border-slate-200 text-slate-600 hover:text-amber-700 hover:border-amber-400'
            }`}
          >
            <Bell className="w-4 h-4" />
            {lowStockReels.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-rose-600 text-[9px] font-mono font-bold text-white shadow-xs animate-pulse">
                {lowStockReels.length}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {showNotifications && (
            <div className="fixed inset-x-2 top-18 sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 w-auto sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-amber-100 text-amber-800">
                    <AlertTriangle className="w-4 h-4 text-amber-700" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold font-heading text-slate-900 uppercase tracking-tight">
                      Low Stock Alerts (≤ 20%)
                    </h3>
                    <p className="text-[10px] text-slate-500 font-medium">
                      In-App Notifications • Factory Raw Material
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200">
                    {lowStockReels.length} Alert{lowStockReels.length === 1 ? '' : 's'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowNotifications(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 p-1">
                {lowStockReels.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-500 space-y-1.5">
                    <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                      ✓
                    </div>
                    <p className="font-semibold text-slate-700">All Paper Rolls Well-Stocked</p>
                    <p className="text-[11px] text-slate-400">
                      No reels currently have 20% or less balance weight.
                    </p>
                  </div>
                ) : (
                  lowStockReels.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 hover:bg-slate-50 rounded-xl transition-colors space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-xs text-amber-700">
                              #{item.reelNo}
                            </span>
                            <span className="text-[11px] font-bold text-slate-900 font-heading">
                              {item.millName}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500">
                            {item.sizeDesc} • {item.gsm} GSM
                          </p>
                        </div>
                        <span className="px-1.5 py-0.5 rounded-md text-[10px] font-mono font-black bg-rose-50 text-rose-700 border border-rose-200 shrink-0">
                          {item.balancePercentage}% Bal
                        </span>
                      </div>

                      {/* Mini visual balance progress bar */}
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-rose-500 rounded-full"
                          style={{ width: `${Math.min(100, Math.max(5, item.balancePercentage))}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[11px] pt-1">
                        <span className="text-slate-600 font-mono text-[10px]">
                          Bal: <strong className="text-rose-600">{item.balanceWeight} KG</strong> / {item.weight} KG
                        </span>
                        <Link
                          href="/consumption"
                          onClick={() => setShowNotifications(false)}
                          className="text-[10px] font-bold text-amber-700 hover:text-amber-800 flex items-center gap-0.5"
                        >
                          <span>Issue / Use</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-2.5 bg-slate-50 border-t border-slate-200 text-center">
                <Link
                  href="/register"
                  onClick={() => setShowNotifications(false)}
                  className="text-xs font-bold text-slate-700 hover:text-amber-700 font-heading"
                >
                  View All Rolls in Stock Register →
                </Link>
              </div>
            </div>
          )}
        </div>

        {onRefresh && (
          <button
            onClick={onRefresh}
            title="Refresh Data"
            className="p-1.5 sm:p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-amber-700 hover:border-amber-500/50 shadow-xs transition-colors cursor-pointer"
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
          <button
            type="button"
            onClick={logout}
            title="Sign Out / Switch Role"
            className="p-1.5 sm:p-2 rounded-xl bg-white hover:bg-rose-50 hover:border-rose-300 text-slate-500 hover:text-rose-600 border border-slate-200 shadow-xs transition-colors shrink-0 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
