import React, { useState, useEffect } from 'react';
import { usePageMeta } from '../hooks/usePageMeta';
import { PageHeader } from '../components/PageHeader';
import { Profile, UserRole } from '../types/database';
import { getLocalDB, saveLocalDB } from '../lib/supabase';
import { formatBnDate } from '../lib/format';
import { toast } from 'sonner';
import { ShieldAlert, CheckCircle2, Shield, UserX, Phone, Mail } from 'lucide-react';

export const UsersPage: React.FC = () => {
  usePageMeta({
    title: 'ব্যবহারকারী ও রোল অনুমোদন',
    description: 'সিস্টেম ব্যবহারকারীদের অ্যাকাউন্ট অনুমোদন, রোল পরিবর্তন ও অ্যাক্সেস নিয়ন্ত্রণ'
  });

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);

  const loadData = () => {
    const db = getLocalDB();
    setProfiles(db.profiles || []);
    setUserRoles(db.user_roles || []);
  };

  useEffect(() => {
    loadData();
    window.addEventListener('ph_vision_db_updated', loadData);
    return () => window.removeEventListener('ph_vision_db_updated', loadData);
  }, []);

  const handleSetRole = (userId: string, newRole: 'admin' | 'officer') => {
    const db = getLocalDB();
    const existingRole = (db.user_roles || []).find((r: UserRole) => r.user_id === userId);

    if (existingRole) {
      db.user_roles = db.user_roles.map((r: UserRole) =>
        r.user_id === userId ? { ...r, role: newRole } : r
      );
    } else {
      db.user_roles.push({
        id: `role-${Date.now()}`,
        user_id: userId,
        role: newRole,
        created_at: new Date().toISOString()
      });
    }

    saveLocalDB(db);
    toast.success(`ইউজার রোল সফলভাবে "${newRole === 'admin' ? 'অ্যাডমিন' : 'অফিসার'}" করা হয়েছে`);
  };

  const handleRevokeRole = (userId: string) => {
    if (window.confirm('আপনি কি এই ইউজারের অনুমোদন বাতিল করতে চান?')) {
      const db = getLocalDB();
      db.user_roles = db.user_roles.filter((r: UserRole) => r.user_id !== userId);
      saveLocalDB(db);
      toast.success('ইউজারের রোল বাতিল করা হয়েছে');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="সিস্টেম ইউজার ও অনুমোদন তালিকা"
        subtitle="PH VISION LTD ম্যানেজমেন্ট সিস্টেমে যুক্ত কর্মকর্তা ও অ্যাডমিন রোল ব্যবস্থাপনা"
      />

      <div className="bg-card rounded-xl border border-border shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-muted/50 border-b border-border text-muted-foreground font-bold">
                <th className="py-3 px-4">নাম ও যোগাযোগের তথ্য</th>
                <th className="py-3 px-4">ইমেইল / মোবাইল</th>
                <th className="py-3 px-4">নিবন্ধনের তারিখ</th>
                <th className="py-3 px-4 text-center">বর্তমান রোল</th>
                <th className="py-3 px-4 text-center">রোল অনুমোদন বা পরিবর্তন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {profiles.map((p) => {
                const userRoleObj = userRoles.find((r) => r.user_id === p.id);
                const currentRole = userRoleObj?.role;

                return (
                  <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4 font-bold text-foreground">{p.full_name || 'নাম বিহীন ইউজার'}</td>
                    <td className="py-3 px-4 text-muted-foreground">
                      <div className="space-y-0.5">
                        <p className="flex items-center gap-1.5">
                          <Mail className="w-3 h-3 text-primary" />
                          <span>{p.email || 'N/A'}</span>
                        </p>
                        <p className="flex items-center gap-1.5">
                          <Phone className="w-3 h-3 text-primary" />
                          <span>{p.mobile || 'N/A'}</span>
                        </p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">{formatBnDate(p.created_at)}</td>
                    <td className="py-3 px-4 text-center">
                      {currentRole === 'admin' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-bold text-[11px]">
                          <Shield className="w-3.5 h-3.5" /> অ্যাডমিন
                        </span>
                      )}
                      {currentRole === 'officer' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5" /> অফিসার
                        </span>
                      )}
                      {!currentRole && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[11px]">
                          <ShieldAlert className="w-3.5 h-3.5" /> পেন্ডিং অনুমোদন
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleSetRole(p.id, 'officer')}
                          className={`px-2.5 py-1 rounded text-[11px] font-bold border transition-colors ${
                            currentRole === 'officer'
                              ? 'bg-emerald-600 text-white border-emerald-600'
                              : 'bg-background hover:bg-emerald-50 text-emerald-700 border-emerald-300'
                          }`}
                        >
                          অফিসার বানান
                        </button>
                        <button
                          onClick={() => handleSetRole(p.id, 'admin')}
                          className={`px-2.5 py-1 rounded text-[11px] font-bold border transition-colors ${
                            currentRole === 'admin'
                              ? 'bg-indigo-600 text-white border-indigo-600'
                              : 'bg-background hover:bg-indigo-50 text-indigo-700 border-indigo-300'
                          }`}
                        >
                          অ্যাডমিন বানান
                        </button>
                        {currentRole && (
                          <button
                            onClick={() => handleRevokeRole(p.id)}
                            className="p-1 text-rose-600 hover:bg-rose-50 rounded"
                            title="রোল বাতিল করুন"
                            aria-label="রোল বাতিল করুন"
                          >
                            <UserX className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
