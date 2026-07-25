import React, { useState, useEffect } from 'react';
import { usePageMeta } from '../hooks/usePageMeta';
import { PageHeader } from '../components/PageHeader';
import { Area, Territory } from '../types/database';
import { getLocalDB, saveLocalDB } from '../lib/supabase';
import { toast } from 'sonner';
import { Map, Plus, Edit2, Trash2, X } from 'lucide-react';

export const AreasPage: React.FC = () => {
  usePageMeta({
    title: 'এরিয়া বা বিভাগ জোন',
    description: 'কোম্পানির প্রধান সেলস এরিয়া বা এরিয়া জোন পরিচালনা'
  });

  const [areas, setAreas] = useState<Area[]>([]);
  const [territories, setTerritories] = useState<Territory[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArea, setEditingArea] = useState<Area | null>(null);

  const [name, setName] = useState('');

  const loadData = () => {
    const db = getLocalDB();
    setAreas(db.areas || []);
    setTerritories(db.territories || []);
  };

  useEffect(() => {
    loadData();
    window.addEventListener('ph_vision_db_updated', loadData);
    return () => window.removeEventListener('ph_vision_db_updated', loadData);
  }, []);

  const openAddModal = () => {
    setEditingArea(null);
    setName('');
    setIsModalOpen(true);
  };

  const openEditModal = (a: Area) => {
    setEditingArea(a);
    setName(a.name);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('এরিয়ার নাম দিন');
      return;
    }

    const db = getLocalDB();
    if (editingArea) {
      db.areas = db.areas.map((a: Area) => (a.id === editingArea.id ? { ...a, name } : a));
      toast.success('এরিয়া নাম আপডেট করা হয়েছে');
    } else {
      const newArea: Area = {
        id: `area-${Date.now()}`,
        name,
        created_at: new Date().toISOString()
      };
      db.areas.push(newArea);
      toast.success('নতুন এরিয়া তৈরি করা হয়েছে');
    }

    saveLocalDB(db);
    setIsModalOpen(false);
  };

  const handleDelete = (id: string, areaName: string) => {
    if (window.confirm(`আপনি কি নিশ্চিত যে "${areaName}" এরিয়াটি মুছে ফেলতে চান?`)) {
      const db = getLocalDB();
      db.areas = db.areas.filter((a: Area) => a.id !== id);
      saveLocalDB(db);
      toast.success('এরিয়া মুছে ফেলা হয়েছে');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="সেলস এরিয়া ও জোন তালিকা"
        subtitle="কোম্পানির প্রধান বাণিজ্যিক রিজিওনাল জোনসমূহ"
        action={
          <button
            onClick={openAddModal}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-lg text-xs shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            নতুন এরিয়া জোন
          </button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {areas.map((a) => {
          const areaTerritories = territories.filter((t) => t.area_id === a.id);
          return (
            <div
              key={a.id}
              className="bg-card p-5 rounded-xl border border-border shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="p-2.5 bg-indigo-100 text-indigo-800 rounded-lg">
                    <Map className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-sm">{a.name}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      আওতাধীন টেরিটরি: {areaTerritories.length} টি
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 mt-3">
                  {areaTerritories.map((t) => (
                    <span key={t.id} className="px-2 py-0.5 rounded bg-muted text-foreground text-[11px] font-medium">
                      {t.name}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-border">
                <button
                  onClick={() => openEditModal(a)}
                  className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                  aria-label="সম্পাদনা করুন"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(a.id, a.name)}
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
                {editingArea ? 'এরিয়া সম্পাদনা' : 'নতুন এরিয়া জোন যোগ'}
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
                <label className="block text-xs font-semibold text-foreground mb-1">এরিয়া জোন এর নাম *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="যেমন: রংপুর সেলস এরিয়া"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:outline-hidden"
                />
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
