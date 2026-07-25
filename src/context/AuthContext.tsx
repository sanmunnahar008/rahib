import React, { createContext, useContext, useEffect, useState } from 'react';
import { AppRole, Profile } from '../types/database';
import { getLocalDB, saveLocalDB, supabase } from '../lib/supabase';

interface AuthContextType {
  user: { id: string; email: string } | null;
  profile: Profile | null;
  role: AppRole | null;
  loading: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  signup: (fullName: string, mobile: string, email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  hasRole: (checkRole: AppRole) => boolean;
  isPendingApproval: boolean;
  refreshUserData: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const CURRENT_USER_KEY = 'ph_vision_current_user_id';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUserData = (userId: string) => {
    const db = getLocalDB();
    const foundProfile = db.profiles.find((p: Profile) => p.id === userId);
    const foundRoleObj = db.user_roles.find((ur: any) => ur.user_id === userId);

    if (foundProfile) {
      setUser({ id: foundProfile.id, email: foundProfile.email });
      setProfile(foundProfile);
      setRole(foundRoleObj ? foundRoleObj.role : null);
    } else {
      setUser(null);
      setProfile(null);
      setRole(null);
    }
  };

  const refreshUserData = () => {
    const savedUserId = localStorage.getItem(CURRENT_USER_KEY);
    if (savedUserId) {
      loadUserData(savedUserId);
    }
  };

  useEffect(() => {
    // Check initial auth state
    const savedUserId = localStorage.getItem(CURRENT_USER_KEY);
    if (savedUserId) {
      loadUserData(savedUserId);
    } else {
      // Default to admin for seamless first view if not set
      localStorage.setItem(CURRENT_USER_KEY, 'usr-admin-1');
      loadUserData('usr-admin-1');
    }
    setLoading(false);

    const handleDBUpdate = () => {
      const currentId = localStorage.getItem(CURRENT_USER_KEY);
      if (currentId) {
        loadUserData(currentId);
      }
    };

    window.addEventListener('ph_vision_db_updated', handleDBUpdate);
    return () => window.removeEventListener('ph_vision_db_updated', handleDBUpdate);
  }, []);

  const login = async (email: string, _password?: string) => {
    const db = getLocalDB();
    const foundProfile = db.profiles.find((p: Profile) => p.email.toLowerCase() === email.trim().toLowerCase());
    
    if (!foundProfile) {
      return { success: false, error: 'এই ইমেইল দিয়ে কোনো অ্যাকাউন্ট পাওয়া যায়নি' };
    }

    localStorage.setItem(CURRENT_USER_KEY, foundProfile.id);
    loadUserData(foundProfile.id);

    // Try real Supabase auth in background if configured
    try {
      if (import.meta.env.VITE_SUPABASE_URL) {
        await supabase.auth.signInWithPassword({ email, password: _password || 'password' });
      }
    } catch (e) {
      // fallback to mock
    }

    return { success: true };
  };

  const signup = async (fullName: string, mobile: string, email: string, _password?: string) => {
    const db = getLocalDB();
    const existing = db.profiles.find((p: Profile) => p.email.toLowerCase() === email.trim().toLowerCase());
    if (existing) {
      return { success: false, error: 'এই ইমেইলটি ইতিপূর্বে ব্যবহৃত হয়েছে' };
    }

    const newUserId = `usr-${Date.now()}`;
    const newProfile: Profile = {
      id: newUserId,
      full_name: fullName,
      mobile,
      email,
      created_at: new Date().toISOString()
    };

    db.profiles.push(newProfile);
    saveLocalDB(db);

    // Set logged in user - note: NO role assigned yet -> will land on /pending-approval
    localStorage.setItem(CURRENT_USER_KEY, newUserId);
    loadUserData(newUserId);

    return { success: true };
  };

  const logout = () => {
    localStorage.removeItem(CURRENT_USER_KEY);
    setUser(null);
    setProfile(null);
    setRole(null);
    try {
      if (import.meta.env.VITE_SUPABASE_URL) {
        supabase.auth.signOut();
      }
    } catch (e) {}
  };

  const hasRole = (checkRole: AppRole) => {
    return role === checkRole;
  };

  const isPendingApproval = Boolean(user && !role);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        role,
        loading,
        login,
        signup,
        logout,
        hasRole,
        isPendingApproval,
        refreshUserData
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
