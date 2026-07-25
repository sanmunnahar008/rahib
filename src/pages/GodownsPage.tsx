import React, { useState, useEffect } from 'react';
import { usePageMeta } from '../hooks/usePageMeta';
import { PageHeader } from '../components/PageHeader';
import { useAuth } from '../context/AuthContext';
import { Godown, Officer } from '../types/database';
import { getLocalDB, saveLocalDB } from '../lib/supabase';
import { toast } from 'sonner';
import { Warehouse, Plus, Edit2, Trash2, MapPin, User, X } from 'lucide-react';

export const GodownsPage: React.FC = () => {
  usePageMeta({
    title: 'গুদাম ও ডিপো',
    description: 'PH VISION LTD-এর কেন্দ্রীয় ও আঞ্চলিক ওয়্যারহাউস বা গোডাউন'
  });

  const { user, role } = useAuth();
  const isAdmin = role === 'admin';

  const [godowns, setGodowns] = useState<Godown[]>([]);
  const [officers, setOfficers] = useState<Officer[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGodown, setEditingGodown] = useState<Godown | null>(null);

  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [officerId, setOfficerId] = useState('');

  const loadData = () => {
    const db = getLocalDB();
    setGodowns(db.godowns || []);
    setOfficers(db.officers || []);
  };

  useEffect(() => {
    loadData();
    window.addEventListener('ph_vision_db_updated', loadData);
    return () => window.removeEventListener('ph_vision_db_updated', loadData);
  }, []);

  const openAddModal = () => {
    setEditingGodown(null);
    setName('');
    setLocation('');
    setOfficerId(officers[0]?.id || '');
    setIsModalOpen(true);
  };

  const openEditModal = (g: Godown) => {
    setEditingGodown(g);
    setName(g.name);
    setLocation(g.location);
    setOfficerId(g.officer_id);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('গুদামের নাম দিন');
      return;
    }
    if (!officerId) {
      toast.error('ইন-চার্জ অফিসার নির্বাচন করুন');
      return;
    }

    const db = getLocalDB();
    const offObj = officers.find((o) => o.id === officerId);

    if (editingGodown) {
      db.godowns = db.godowns.map((g: Godown) =>
        g.id === editingGodown.id
          ? {
              ...g,
              name,
              location,
              officer_id: officerId,
              officer_name: offObj?.name || ''
            }
          : g
      );
      toast.success('গুদামের তথ্য আপডেট করা হয়েছে');
    } else {
      const newGodown: Godown = {
        id: `god-${Date.now()}`,
        name,
        location,
        officer_id: officerId,
        officer_name: offObj?.name || '',
        created_at: new Date().toISOString()
      };
      db.godowns.push(newGodown);
      toast.success('নতুন গুদাম যোগ করা হয়েছে');
    }

    saveLocalDB(db);
    setIsModalOpen(false);
  };

  const handleDelete = (id: string, godName: string) => {
    if (window.confirm(`আপনি কি নিশ্চিত যে "${godName}" গুদামটি মুছে ফেলতে চান?`)) {
      const db = getLocalDB();
      db.godowns = db.godowns.filter((g: Godown) => g.id !== id);
      saveLocalDB(db);
      toast.success('গুদামটি মুছে ফেলা হয়েছে');
    }
  };

  // Officers can SELECT only godowns where they are the assigned officer_id in-charge
  const myOfficerObj = officers.find((o) => o.user_id === user?.id);
  const visibleGodowns = isAdmin
    ? godowns
    : godowns.filter((g) => g.officer_id === myOfficerObj?.id);

  return (
    <div className="space-y-6">
      <PageHeader
        title="গুদাম ও ওয়্যারহাউস তালিকা"
        subtitle="কেন্দ্রীয় ও আঞ্চলিক ডিপো, ইন-চার্জ কর্মকর্তা ও গুদাম অবস্থান"
        action={
          isAdmin ? (
            <button
              onClick={openAddModal}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-lg text-xs shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              নতুন গুদাম যোগ
            </button>
          ) : undefined
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {visibleGodowns.map((g) => {
          const off = officers.find((o) => o.id === g.officer_id);
          return (
            <div
              key={g.id}
              className="bg-card p-5 rounded-xl border border-border shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="p-2.5 bg-cyan-100 text-cyan-800 rounded-lg">
                    <Warehouse className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-sm">{g.name}</h3>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-muted-foreground">
                  <p className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span>অবস্থান: {g.location || 'N/A'}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span>ইন-চার্জ: {off?.name || g.officer_name || '-'}</span>
                  </p>
                </div>
              </div>

              {isAdmin && (
                <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-border">
                  <button
                    onClick={() => openEditModal(g)}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                    aria-label="সম্পাদনা করুন"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(g.id, g.name)}
                    className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                    aria-label="মুছে ফেলুন"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card w-full max-w-md rounded-2xl border border-border shadow-xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-bold text-foreground text-sm">
                {editingGodown ? 'গুদাম সম্পাদনা' : 'নতুন গুদাম যোগ'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-muted-foreground hover:text-foreground"
                aria-label="বন্ধ করুন"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">গুদামের নাম *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="যেমন: শেরপুর রিজিওনাল গোডাউন"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">অবস্থান / ঠিকানা</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="বাজার রোড, শেরপুর"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">ইন-চার্জ কর্মকর্তা *</label>
                <select
                  value={officerId}
                  onChange={(e) => setOfficerId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:outline-hidden"
                >
                  <option value="">কর্মকর্তা নির্বাচন করুন</option>
                  {officers.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.name} ({o.mobile})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-muted text-foreground font-semibold rounded-lg text-xs"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-primary-foreground font-bold rounded-lg text-xs shadow-xs"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
