'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { UserRole } from '@/lib/types';
import { UserSession, RolePermissions, ROLE_PERMISSIONS } from '@/lib/auth';
import { ShieldAlert, ArrowLeft, Lock, AlertTriangle, X, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export interface LowStockReelItem {
  id: string;
  reelNo: string;
  millName: string;
  sizeDesc: string;
  gsm: number;
  bf?: number | null;
  weight: number;
  usedWeight: number;
  balanceWeight: number;
  balancePercentage: number;
  status: string;
  isLowStock: boolean;
}

export interface InAppNotification {
  id: string;
  type: 'LOW_STOCK' | 'SUCCESS' | 'WARNING';
  title: string;
  message: string;
  reelNo?: string;
  balancePercentage?: number;
  balanceWeight?: number;
  timestamp: string;
}

interface AppContextType {
  userSession: UserSession | null;
  setUserSession: (user: UserSession | null) => void;
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  permissions: RolePermissions;
  globalSearch: string;
  setGlobalSearch: (q: string) => void;
  refreshKey: number;
  triggerRefresh: () => void;
  activeCount: number;
  setActiveCount: (count: number) => void;
  logout: () => Promise<void>;
  lowStockReels: LowStockReelItem[];
  activeToast: InAppNotification | null;
  throwNotification: (notification: {
    title: string;
    message: string;
    reelNo?: string;
    balancePercentage?: number;
    balanceWeight?: number;
    type?: 'LOW_STOCK' | 'SUCCESS' | 'WARNING';
  }) => void;
  dismissToast: () => void;
}

const defaultPermissions = ROLE_PERMISSIONS.ADMIN;

const AppContext = createContext<AppContextType>({
  userSession: null,
  setUserSession: () => {},
  currentRole: 'ADMIN',
  setCurrentRole: () => {},
  permissions: defaultPermissions,
  globalSearch: '',
  setGlobalSearch: () => {},
  refreshKey: 0,
  triggerRefresh: () => {},
  activeCount: 0,
  setActiveCount: () => {},
  logout: async () => {},
  lowStockReels: [],
  activeToast: null,
  throwNotification: () => {},
  dismissToast: () => {},
});

export const useApp = () => useContext(AppContext);

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const [userSession, setUserSession] = useState<UserSession | null>({
    id: 'admin-default',
    username: 'admin',
    fullName: 'Sivakumar (Factory Admin)',
    role: 'ADMIN',
  });
  const [currentRole, setCurrentRole] = useState<UserRole>('ADMIN');
  const [dynamicPermissions, setDynamicPermissions] = useState<Record<string, RolePermissions>>({});
  const [globalSearch, setGlobalSearch] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeCount, setActiveCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [lowStockReels, setLowStockReels] = useState<LowStockReelItem[]>([]);
  const [activeToast, setActiveToast] = useState<InAppNotification | null>(null);

  // Close mobile drawer on route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const fetchLowStockAlerts = async () => {
    try {
      const res = await fetch('/api/alerts/low-stock', { cache: 'no-store' });
      const data = await res.json();
      if (data.success && Array.isArray(data.lowStockReels)) {
        setLowStockReels(data.lowStockReels);
      }
    } catch (e) {
      console.error('Failed to load low stock alerts:', e);
    }
  };

  useEffect(() => {
    fetchLowStockAlerts();
  }, [refreshKey]);

  const throwNotification = (notif: {
    title: string;
    message: string;
    reelNo?: string;
    balancePercentage?: number;
    balanceWeight?: number;
    type?: 'LOW_STOCK' | 'SUCCESS' | 'WARNING';
  }) => {
    const item: InAppNotification = {
      id: Date.now().toString(),
      type: notif.type || 'LOW_STOCK',
      title: notif.title,
      message: notif.message,
      reelNo: notif.reelNo,
      balancePercentage: notif.balancePercentage,
      balanceWeight: notif.balanceWeight,
      timestamp: new Date().toLocaleTimeString(),
    };
    setActiveToast(item);
    fetchLowStockAlerts();
  };

  const dismissToast = () => {
    setActiveToast(null);
  };

  // Auto-dismiss toast after 8 seconds
  useEffect(() => {
    if (!activeToast) return;
    const timer = setTimeout(() => {
      setActiveToast(null);
    }, 8000);
    return () => clearTimeout(timer);
  }, [activeToast]);

  // Sync role and load dynamic permissions from PostgreSQL
  const syncPermissions = async () => {
    try {
      const meRes = await fetch('/api/auth/me', { cache: 'no-store' });
      const meData = await meRes.json();
      if (meData.success && meData.user) {
        setUserSession(meData.user);
        setCurrentRole(meData.user.role as UserRole);
        if (meData.permissions) {
          setDynamicPermissions((prev) => ({
            ...prev,
            [meData.user.role]: meData.permissions,
          }));
        }
      }

      // Also pre-fetch all roles permissions from DB
      const rolesRes = await fetch('/api/admin/roles', { cache: 'no-store' });
      const rolesData = await rolesRes.json();
      if (rolesData.success && rolesData.roles) {
        const map: Record<string, RolePermissions> = {};
        rolesData.roles.forEach((r: any) => {
          map[r.name] = {
            canViewDashboard: r.canViewDashboard,
            canViewRegister: r.canViewRegister,
            canInwardReels: r.canInwardReels,
            canIssueReels: r.canIssueReels,
            canViewSheets: r.canViewSheets,
            canPrintLabels: r.canPrintLabels,
            canViewPrices: r.canViewPrices,
            canViewReports: r.canViewReports,
            canManageSettings: r.canManageSettings,
            canDeleteReels: r.canDeleteReels,
            canAccessAdmin: r.canAccessAdmin,
            roleBadgeText: r.displayName,
            roleDescription: r.description || '',
          };
        });
        setDynamicPermissions((prev) => ({ ...prev, ...map }));
      }
    } catch (e) {
      console.error('Failed to load session/roles:', e);
    }
  };

  useEffect(() => {
    syncPermissions();
  }, [refreshKey]);

  const handleRoleChange = (newRole: UserRole) => {
    setCurrentRole(newRole);
    if (userSession) {
      setUserSession({ ...userSession, role: newRole });
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      console.error('Logout error:', e);
    }
    setUserSession(null);
    router.push('/login');
  };

  const triggerRefresh = () => {
    setRefreshKey((k) => k + 1);
  };

  const permissions =
    dynamicPermissions[currentRole] ||
    ROLE_PERMISSIONS[currentRole] ||
    ROLE_PERMISSIONS.ADMIN;

  // If on Login page, render directly
  if (pathname === '/login') {
    return (
      <AppContext.Provider
        value={{
          userSession,
          setUserSession,
          currentRole,
          setCurrentRole: handleRoleChange,
          permissions,
          globalSearch,
          setGlobalSearch,
          refreshKey,
          triggerRefresh,
          activeCount,
          setActiveCount,
          logout,
          lowStockReels,
          activeToast,
          throwNotification,
          dismissToast,
        }}
      >
        {children}
      </AppContext.Provider>
    );
  }

  // Page-level Permission Gate Check
  let accessDeniedMessage: string | null = null;
  if (pathname === '/admin' && !permissions.canAccessAdmin && currentRole !== 'ADMIN') {
    accessDeniedMessage = `The role '${currentRole}' is strictly restricted from accessing the Admin Module. Only factory administrators can create roles or modify permissions.`;
  } else if (pathname === '/inward' && !permissions.canInwardReels) {
    accessDeniedMessage = `The role '${currentRole}' does not have permission to inward new reels. Only Admin and Storekeeper can receive paper rolls from mills.`;
  } else if (pathname === '/reports' && !permissions.canViewReports) {
    accessDeniedMessage = `The role '${currentRole}' does not have permission to view closing stock valuations and financial statements. Only Admin and Accountant have financial reporting clearance.`;
  }

  return (
    <AppContext.Provider
      value={{
        userSession,
        setUserSession,
        currentRole,
        setCurrentRole: handleRoleChange,
        permissions,
        globalSearch,
        setGlobalSearch,
        refreshKey,
        triggerRefresh,
        activeCount,
        setActiveCount,
        logout,
        lowStockReels,
        activeToast,
        throwNotification,
        dismissToast,
      }}
    >
      {/* Floating In-App Live Notification Toast */}
      {activeToast && (
        <div className="fixed top-4 right-4 z-50 max-w-sm sm:max-w-md w-full bg-white border-2 border-amber-500 rounded-2xl shadow-2xl p-4 animate-in slide-in-from-top-4 fade-in duration-300 pointer-events-auto">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-amber-100 text-amber-700 shrink-0 animate-pulse">
              <AlertTriangle className="w-5 h-5 text-amber-700" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h4 className="font-heading font-black text-xs sm:text-sm text-slate-900 uppercase tracking-tight flex items-center gap-1.5">
                  <span>{activeToast.title}</span>
                  {activeToast.balancePercentage !== undefined && (
                    <span className="px-1.5 py-0.5 rounded-md bg-rose-100 text-rose-700 text-[10px] font-mono font-bold">
                      {activeToast.balancePercentage}% Bal
                    </span>
                  )}
                </h4>
                <button
                  type="button"
                  onClick={dismissToast}
                  className="text-slate-400 hover:text-slate-700 p-1 rounded-lg transition-colors cursor-pointer"
                  title="Dismiss notification"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-slate-700 font-medium mt-1 leading-relaxed">
                {activeToast.message}
              </p>
              {activeToast.reelNo && (
                <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-500">
                    Reel #{activeToast.reelNo} • {activeToast.timestamp}
                  </span>
                  <Link
                    href="/consumption"
                    onClick={dismissToast}
                    className="text-[11px] font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1 font-heading"
                  >
                    <span>View In Consumption</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex min-h-screen bg-slate-50 text-slate-800">
        <Sidebar
          currentRole={currentRole}
          onRoleChange={handleRoleChange}
          activeCount={activeCount}
          isOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
        />
        <div className="flex-1 flex flex-col min-w-0">
          <Navbar
            currentRole={currentRole}
            onRefresh={triggerRefresh}
            onSearch={setGlobalSearch}
            onToggleMobileMenu={() => setMobileMenuOpen((prev) => !prev)}
          />
          <main className="flex-1 p-3 sm:p-5 md:p-6 overflow-y-auto">
            {accessDeniedMessage ? (
              <div className="max-w-2xl mx-auto mt-6 sm:mt-12 bg-white border border-rose-300 rounded-3xl p-6 sm:p-8 text-center shadow-lg space-y-4 theme-card">
                <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
                  <Lock className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-heading font-bold text-slate-900 tracking-tight">
                  Access Restricted for Role: {currentRole}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed max-w-lg mx-auto">
                  {accessDeniedMessage}
                </p>
                <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Link
                    href="/"
                    className="w-full sm:w-auto btn-theme-secondary flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-heading font-bold text-slate-700"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Dashboard</span>
                  </Link>
                  <Link
                    href="/login"
                    className="w-full sm:w-auto btn-theme-primary px-5 py-2.5 rounded-xl text-white text-xs font-heading font-bold shadow-md shadow-amber-500/20 text-center"
                  >
                    Switch Account / Role
                  </Link>
                </div>
              </div>
            ) : (
              children
            )}
          </main>
        </div>
      </div>
    </AppContext.Provider>
  );
}
