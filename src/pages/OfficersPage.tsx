import React, { useState, useEffect } from 'react';
import { usePageMeta } from '../hooks/usePageMeta';
import { PageHeader } from '../components/PageHeader';
import { Officer, Territory, Profile } from '../types/database';
import { getLocalDB, saveLocalDB } from '../lib/supabase';
import { toast } from 'sonner';
import { UserCheck, Plus, Edit2, Trash2, Phone, MapPin, X } from 'lucide-react';

export const OfficersPage: React.FC = () => {
  usePageMeta({
    title: 'সেলস অফিসারবৃন্দ',
    description: 'মাঠ পর্যায়ের কর্মকর্তা এবং ফিল্ড টেরিটরি এসাইনমেন্ট'
  });

  const [officers, setOfficers] = useState<Officer[]>([]);
  const [territories, setTerritories] = useState<Territory[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOfficer, setEditingOfficer] = useState<Officer | null>(null);

  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [designation, setDesignation] = useState('ফিল্ড সেলস অফিসার (FSO)');
  const [userId, setUserId] = useState('');
  const [selectedTerritoryIds, setSelectedTerritoryIds] = useState<string[]>([]);

  const loadData = () => {
    const db = getLocalDB();
    setOfficers(db.officers || []);
    setTerritories(db.territories || []);
    setProfiles(db.profiles || []);
  };

  useEffect(() => {
    loadData();
    window.addEventListener('ph_vision_db_updated', loadData);
    return () => window.removeEventListener('ph_vision_db_updated', loadData);
  }, []);

  const openAddModal = () => {
    setEditingOfficer(null);
    setName('');
    setMobile('');
    setDesignation('ফিল্ড সেলস অফিসার (FSO)');
    setUserId('');
    setSelectedTerritoryIds([]);
    setIsModalOpen(true);
  };

  const openEditModal = (o: Officer) => {
    setEditingOfficer(o);
    setName(o.name);
    setMobile(o.mobile);
    setDesignation(o.designation);
    setUserId(o.user_id || '');
    setSelectedTerritoryIds(o.territory_ids || []);
    setIsModalOpen(true);
  };

  const toggleTerritory = (tId: string) => {
    if (selectedTerritoryIds.includes(tId)) {
      setSelectedTerritoryIds(selectedTerritoryIds.filter((id) => id !== tId));
    } else {
      setSelectedTerritoryIds([...selectedTerritoryIds, tId]);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('অফিসারের নাম দিন');
      return;
    }

    const db = getLocalDB();
    if (editingOfficer) {
      db.officers = db.officers.map((o: Officer) =>
        o.id === editingOfficer.id
          ? {
              ...o,
              name,
              mobile,
              designation,
              user_id: userId || undefined,
              territory_ids: selectedTerritoryIds
            }
          : o
      );
      toast.success('অফিসারের তথ্য আপডেট করা হয়েছে');
    } else {
      const newOfficer: Officer = {
        id: `off-${Date.now()}`,
        name,
        mobile,
        designation,
        user_id: userId || undefined,
        territory_ids: selectedTerritoryIds,
        created_at: new Date().toISOString()
      };
      db.officers.push(newOfficer);
      toast.success('নতুন কর্মকর্তা যুক্ত করা হয়েছে');
    }

    saveLocalDB(db);
    setIsModalOpen(false);
  };

  const handleDelete = (id: string, offName: string) => {
    if (window.confirm(`আপনি কি নিশ্চিত যে "${offName}" কে মুছে ফেলতে চান?`)) {
      const db = getLocalDB();
      db.officers = db.officers.filter((o: Officer) => o.id !== id);
      saveLocalDB(db);
      toast.success('অফিসার তালিকা থেকে মুছে ফেলা হয়েছে');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="সেলস অফিসার ও প্রতিনিধি তালিকা"
        subtitle="ফিল্ড সেলস অফিসারবৃন্দ ও তাদের আওতাধীন টেরিটরি নির্ধারণ"
        action={
          <button
            onClick={openAddModal}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-lg text-xs shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            নতুন সেলস অফিসার যোগ
          </button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {officers.map((o) => {
          const assignedTerrs = territories.filter((t) => o.territory_ids?.includes(t.id));
          return (
            <div
              key={o.id}
              className="bg-card p-5 rounded-xl border border-border shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="p-2.5 bg-blue-100 text-blue-800 rounded-lg">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-sm">{o.name}</h3>
                    <span className="text-xs font-medium text-muted-foreground">{o.designation}</span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-muted-foreground mt-3">
                  <p className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span>{o.mobile || 'N/A'}</span>
                  </p>
                  <div className="flex items-start gap-2 pt-1">
                    <MapPin className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <span className="block text-[11px] font-semibold text-foreground">এসাইনকৃত টেরিটরি:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {assignedTerrs.length === 0 ? (
                          <span className="text-[11px] text-muted-foreground">কোনো টেরিটরি নেই</span>
                        ) : (
                          assignedTerrs.map((t) => (
                            <span
                              key={t.id}
                              className="px-2 py-0.5 rounded bg-primary-light text-primary font-bold text-[10px]"
                            >
                              {t.name}
                            </span>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <button
                  onClick={() => openEditModal(o)}
                  className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                  aria-label="সম্পাদনা করুন"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(o.id, o.name)}
                  className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                  aria-label="মুছে ফেলুন"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card w-full max-w-md rounded-2xl border border-border shadow-xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-bold text-foreground text-sm">
                {editingOfficer ? 'কর্মকর্তা তথ্য সম্পাদনা' : 'নতুন সেলস অফিসার যোগ'}
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
                <label className="block text-xs font-semibold text-foreground mb-1">অফিসারের নাম *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="যেমন: হাসান মাহমুদ"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">মোবাইল নম্বর</label>
                <input
                  type="text"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="01700000000"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">পদবী</label>
                <input
                  type="text"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  placeholder="ফিল্ড সেলস অফিসার (FSO)"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">লিঙ্ককৃত ইউজার অ্যাকাউন্ট</label>
                <select
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:outline-hidden"
                >
                  <option value="">কোনো অ্যাকাউন্ট সিলেক্ট করা নেই</option>
                  {profiles.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.full_name} ({p.mobile || p.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">এসাইনকৃত টেরিটরি নির্বাচন করুন</label>
                <div className="max-h-32 overflow-y-auto border border-input rounded-lg p-2 space-y-1 bg-background">
                  {territories.map((t) => (
                    <label key={t.id} className="flex items-center gap-2 text-xs cursor-pointer hover:bg-muted p-1 rounded">
                      <input
                        type="checkbox"
                        checked={selectedTerritoryIds.includes(t.id)}
                        onChange={() => toggleTerritory(t.id)}
                        className="rounded border-input text-primary focus:ring-primary"
                      />
                      <span>{t.name}</span>
                    </label>
                  ))}
                </div>
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
                  সংরক্ষণ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
