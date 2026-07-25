import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { GlossyIcon } from '../3d/GlossyIcon';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface AppSidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}) => {
  const { role } = useAuth();
  const isAdmin = role === 'admin';

  interface MenuItem {
    title: string;
    path: string;
    icon: string;
    adminOnly?: boolean;
    badge?: string;
  }

  interface MenuGroup {
    label: string;
    items: MenuItem[];
  }

  const menuGroups: MenuGroup[] = [
    {
      label: 'প্রধান নির্দেশক',
      items: [
        { title: 'ড্যাশবোর্ড', path: '/', icon: 'dashboard' },
        { title: 'জরুরি অ্যালার্ট', path: '/alerts', icon: 'alerts', badge: 'নতুন' },
      ],
    },
    {
      label: 'পার্টি ও মাঠ পর্যায়',
      items: [
        { title: 'এলাকা (Areas)', path: '/areas', icon: 'areas', adminOnly: true },
        { title: 'টেরিটরি (Territories)', path: '/territories', icon: 'territories', adminOnly: true },
        { title: 'ফিল্ড অফিসার', path: '/officers', icon: 'officers', adminOnly: true },
        { title: 'ডিলারবৃন্দ (Dealers)', path: '/dealers', icon: 'dealers' },
        { title: 'কর্মচারী রেকর্ড', path: '/employees', icon: 'employees', adminOnly: true },
      ],
    },
    {
      label: 'ইনভেন্টরি ও কারখানা',
      items: [
        { title: 'পণ্যের ক্যাটাগরি', path: '/categories', icon: 'categories', adminOnly: true },
        { title: 'পণ্য তালিকা', path: '/products', icon: 'products' },
        { title: 'গুদাম ও ডিপো', path: '/godowns', icon: 'godowns' },
        { title: 'স্টক ও গতিবিধি', path: '/stock', icon: 'stock', adminOnly: true },
        { title: 'কাঁচামাল ইনভেন্টরি', path: '/raw-materials', icon: 'rawMaterials', adminOnly: true },
        { title: 'উৎপাদন এন্ট্রি', path: '/production', icon: 'production', adminOnly: true },
      ],
    },
    {
      label: 'ক্রয় ও বিক্রয়',
      items: [
        { title: 'সরবরাহকারী', path: '/suppliers', icon: 'suppliers', adminOnly: true },
        { title: 'ক্রয় চালান', path: '/purchases', icon: 'purchases', adminOnly: true },
        { title: 'বিক্রয় ও ইনভয়েস', path: '/sales', icon: 'sales' },
      ],
    },
    {
      label: 'হিসাব ও ব্যয়',
      items: [
        { title: 'জমা/পেমেন্ট ও লেজার', path: '/accounts', icon: 'accounts' },
        { title: 'কোম্পানি খরচ', path: '/expenses', icon: 'expenses', adminOnly: true },
      ],
    },
    {
      label: 'রিপোর্ট ও অ্যাডমিন',
      items: [
        { title: 'আদায় রিপোর্ট', path: '/area-reports', icon: 'areaReports', adminOnly: true },
        { title: 'সার্বিক রিপোর্ট', path: '/reports', icon: 'reports', adminOnly: true },
        { title: 'ইউজার ও রোল', path: '/users', icon: 'users', adminOnly: true },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-card border-r border-border transition-all duration-300 shadow-sm ${
          collapsed ? 'w-20' : 'w-64'
        } ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-border bg-gradient-to-r from-primary-light/50 to-transparent">
          <div className="flex items-center gap-3 overflow-hidden">
            <GlossyIcon name="logo" size="md" />
            {!collapsed && (
              <div className="flex flex-col truncate">
                <span className="font-bold text-sm text-foreground tracking-tight leading-tight">
                  PH VISION LTD
                </span>
                <span className="text-[11px] font-medium text-primary tracking-wide">
                  কোম্পানি ম্যানেজমেন্ট
                </span>
              </div>
            )}
          </div>
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex items-center justify-center w-7 h-7 rounded-md border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label={collapsed ? 'সাইডবার প্রসারিত করুন' : 'সাইডবার সংকুচিত করুন'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 custom-scrollbar">
          {menuGroups.map((group, groupIdx) => {
            const filteredItems = group.items.filter((item) => !item.adminOnly || isAdmin);
            if (filteredItems.length === 0) return null;

            return (
              <div key={groupIdx} className="space-y-1">
                {!collapsed && (
                  <h3 className="px-3 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase mb-2">
                    {group.label}
                  </h3>
                )}
                {filteredItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={onCloseMobile}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group relative ${
                        isActive
                          ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                          : 'text-foreground/80 hover:bg-muted hover:text-foreground'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <GlossyIcon
                          name={item.icon}
                          size="sm"
                          className={isActive ? 'ring-2 ring-white/50' : ''}
                        />
                        {!collapsed && (
                          <span className="truncate flex-1">{item.title}</span>
                        )}
                        {!collapsed && item.badge && (
                          <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full font-bold bg-amber-500 text-white shadow-2xs">
                            {item.badge}
                          </span>
                        )}
                        {collapsed && (
                          <div className="absolute left-full ml-2 px-2 py-1 bg-foreground text-background text-xs font-semibold rounded shadow-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-50 transition-opacity">
                            {item.title}
                          </div>
                        )}
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            );
          })}
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-border bg-muted/30">
          {!collapsed ? (
            <div className="text-[11px] text-center text-muted-foreground font-medium">
              PH VISION LTD v2.5
              <div className="text-[10px] text-muted-foreground/70 mt-0.5">
                কৃতিত্ব: রেদওয়ান করিম রাহিব
              </div>
            </div>
          ) : (
            <div className="flex justify-center text-xs text-primary font-bold">PHV</div>
          )}
        </div>
      </aside>
    </>
  );
};
