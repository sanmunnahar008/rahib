import React, { useState, useEffect } from 'react';
import { usePageMeta } from '../hooks/usePageMeta';
import { PageHeader } from '../components/PageHeader';
import { Area, Territory } from '../types/database';
import { getLocalDB, saveLocalDB } from '../lib/supabase';
import { toast } from 'sonner';
import { MapPin, Plus, Edit2, Trash2, X } from 'lucide-react';

export const TerritoriesPage: React.FC = () => {
  usePageMeta({
    title: 'টেরিটরি জোনসমূহ',
    description: 'ফিল্ড সেলস অফিসার ও ডিলার নেটওয়ার্কের জন্য বরাদ্দকৃত টেরিটরি'
  });

  const [areas, setAreas] = useState<Area[]>([]);
  const [territories, setTerritories] = useState<Territory[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTerritory, setEditingTerritory] = useState<Territory | null>(null);

  const [name, setName] = useState('');
  const [areaId, setAreaId] = useState('');

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
    setEditingTerritory(null);
    setName('');
    setAreaId(areas[0]?.id || '');
    setIsModalOpen(true);
  };

  const openEditModal = (t: Territory) => {
    setEditingTerritory(t);
    setName(t.name);
    setAreaId(t.area_id);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('টেরিটরির নাম দিন');
      return;
    }
    if (!areaId) {
      toast.error('এরিয়া নির্বাচন করুন');
      return;
    }

    const db = getLocalDB();
    if (editingTerritory) {
      db.territories = db.territories.map((t: Territory) =>
        t.id === editingTerritory.id ? { ...t, name, area_id: areaId } : t
      );
      toast.success('টেরিটরি তথ্য আপডেট করা হয়েছে');
    } else {
      const newTer: Territory = {
        id: `ter-${Date.now()}`,
        name,
        area_id: areaId,
        created_at: new Date().toISOString()
      };
      db.territories.push(newTer);
      toast.success('নতুন টেরিটরি সংযুক্ত করা হয়েছে');
    }

    saveLocalDB(db);
    setIsModalOpen(false);
  };

  const handleDelete = (id: string, terName: string) => {
    if (window.confirm(`আপনি কি নিশ্চিত যে "${terName}" টেরিটরিটি মুছে ফেলতে চান?`)) {
      const db = getLocalDB();
      db.territories = db.territories.filter((t: Territory) => t.id !== id);
      saveLocalDB(db);
      toast.success('টেরিটরি মুছে ফেলা হয়েছে');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="টেরিটরি তালিকা"
        subtitle="ফিল্ড সেলস অফিসার ও ডিলার নেটওয়ার্কের অধীনস্ত প্রশাসনিক অঞ্চল"
        action={
          <button
            onClick={openAddModal}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-lg text-xs shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            নতুন টেরিটরি যোগ
          </button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {territories.map((t) => {
          const areaObj = areas.find((a) => a.id === t.area_id);
          return (
            <div
              key={t.id}
              className="bg-card p-5 rounded-xl border border-border shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="p-2.5 bg-teal-100 text-teal-800 rounded-lg">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-sm">{t.name}</h3>
                    <p className="text-xs text-primary font-semibold mt-0.5">
                      মূল এরিয়া: {areaObj?.name || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-border">
                <button
                  onClick={() => openEditModal(t)}
                  className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                  aria-label="সম্পাদনা করুন"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(t.id, t.name)}
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
                {editingTerritory ? 'টেরিটরি সম্পাদনা' : 'নতুন টেরিটরি যোগ'}
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
                <label className="block text-xs font-semibold text-foreground mb-1">টেরিটরির নাম *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="যেমন: শেরপুর সদর টেরিটরি"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">মূল এরিয়া *</label>
                <select
                  value={areaId}
                  onChange={(e) => setAreaId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:outline-hidden"
                >
                  <option value="">এরিয়া নির্বাচন করুন</option>
                  {areas.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
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
