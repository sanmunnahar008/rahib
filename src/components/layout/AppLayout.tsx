import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { AppSidebar } from './AppSidebar';
import { ThemeSwitcher } from './ThemeSwitcher';
import { useAuth } from '../../context/AuthContext';
import { Toaster, toast } from 'sonner';
import { resetLocalDB } from '../../lib/supabase';
import {
  Menu,
  LogOut,
  User,
  ShieldCheck,
  RotateCcw,
  Bell,
  ChevronDown
} from 'lucide-react';

export const AppLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const { profile, role, logout } = useAuth();
  const navigate = useNavigate();

  const isAdmin = role === 'admin';

  const handleLogout = () => {
    logout();
    toast.success('সফলভাবে লগআউট সম্পন্ন হয়েছে');
    navigate('/auth');
  };

  const handleResetData = () => {
    if (window.confirm('আপনি কি নিশ্চিত যে সমস্ত ডেটা রিসেট করতে চান? এটি পুনরায় ফিরিয়ে আনা সম্ভব নয়।')) {
      resetLocalDB();
      toast.success('সমস্ত ডেটা রিসেট করা হয়েছে');
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <Toaster position="top-right" richColors closeButton />

      {/* Sidebar */}
      <AppSidebar
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          collapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        {/* Sticky Header */}
        <header className="sticky top-0 z-30 h-16 bg-card/90 backdrop-blur-md border-b border-border px-4 sm:px-6 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label="মোবাইল সাইডবার টগল করুন"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:block">
              <h2 className="text-sm font-semibold text-foreground">
                PH VISION LTD — কোম্পানি ম্যানেজমেন্ট সিস্টেম
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Admin Reset Button */}
            {isAdmin && (
              <button
                onClick={handleResetData}
                className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-destructive-light text-destructive hover:bg-destructive/10 transition-colors"
                title="ডেমো ডেটা রিসেট করুন"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                ডেটা রিসেট
              </button>
            )}

            {/* Quick Alerts Bell */}
            <button
              onClick={() => navigate('/alerts')}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors relative"
              aria-label="জরুরি অ্যালার্ট দেখুন"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-destructive animate-pulse" />
            </button>

            {/* Theme Selector */}
            <ThemeSwitcher />

            {/* User Profile Bar & Dropdown */}
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-muted transition-colors border border-transparent hover:border-border"
              >
                <div className="w-8 h-8 rounded-full bg-primary-light text-primary flex items-center justify-center font-bold text-sm border border-primary/20">
                  {profile?.full_name ? profile.full_name.charAt(0) : 'U'}
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-bold text-foreground leading-tight">
                    {profile?.full_name || 'ব্যবহারকারী'}
                  </span>
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <ShieldCheck className="w-2.5 h-2.5 text-primary" />
                    {role === 'admin' ? 'অ্যাডমিন' : role === 'officer' ? 'অফিসার' : 'অনুমোদন পেন্ডিং'}
                  </span>
                </div>
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </button>

              {/* User Dropdown Menu */}
              {userDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 rounded-xl bg-card border border-border shadow-lg py-1.5 z-50 divide-y divide-border"
                  onClick={() => setUserDropdownOpen(false)}
                >
                  <div className="px-4 py-2.5">
                    <p className="text-xs font-bold text-foreground">{profile?.full_name}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{profile?.email}</p>
                    <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-primary-light text-primary">
                      ভূমিকা: {role === 'admin' ? 'অ্যাডমিন' : role === 'officer' ? 'অফিসার' : 'পেন্ডিং'}
                    </div>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-xs font-semibold text-destructive hover:bg-destructive-light transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      লগআউট করুন
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content View */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
