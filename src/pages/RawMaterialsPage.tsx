import React, { useState, useEffect } from 'react';
import { usePageMeta } from '../hooks/usePageMeta';
import { PageHeader } from '../components/PageHeader';
import { RawMaterial } from '../types/database';
import { getLocalDB, saveLocalDB } from '../lib/supabase';
import { formatBnNumber } from '../lib/format';
import { toast } from 'sonner';
import { Boxes, Plus, Edit2, Trash2, AlertTriangle, X } from 'lucide-react';

export const RawMaterialsPage: React.FC = () => {
  usePageMeta({
    title: 'কাঁচামাল ইনভেন্টরি',
    description: 'রাসায়নিক উপাদান, অ্যাক্টিভ ইনগ্রেডিয়েন্ট ও বোতল স্টক'
  });

  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<RawMaterial | null>(null);

  const [name, setName] = useState('');
  const [unit, setUnit] = useState('কেজি');
  const [currentStock, setCurrentStock] = useState<number | ''>('');
  const [lowStockAlert, setLowStockAlert] = useState<number | ''>(100);

  const loadData = () => {
    const db = getLocalDB();
    setRawMaterials(db.raw_materials || []);
  };

  useEffect(() => {
    loadData();
    window.addEventListener('ph_vision_db_updated', loadData);
    return () => window.removeEventListener('ph_vision_db_updated', loadData);
  }, []);

  const openAddModal = () => {
    setEditingMaterial(null);
    setName('');
    setUnit('কেজি');
    setCurrentStock('');
    setLowStockAlert(100);
    setIsModalOpen(true);
  };

  const openEditModal = (rm: RawMaterial) => {
    setEditingMaterial(rm);
    setName(rm.name);
    setUnit(rm.unit);
    setCurrentStock(rm.current_stock);
    setLowStockAlert(rm.low_stock_alert);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('কাঁচামালের নাম দিন');
      return;
    }

    const db = getLocalDB();
    if (editingMaterial) {
      db.raw_materials = db.raw_materials.map((rm: RawMaterial) =>
        rm.id === editingMaterial.id
          ? {
              ...rm,
              name,
              unit,
              current_stock: Number(currentStock || 0),
              low_stock_alert: Number(lowStockAlert || 100)
            }
          : rm
      );
      toast.success('কাঁচামাল তথ্য আপডেট করা হয়েছে');
    } else {
      const newRm: RawMaterial = {
        id: `raw-${Date.now()}`,
        name,
        unit,
        current_stock: Number(currentStock || 0),
        low_stock_alert: Number(lowStockAlert || 100),
        created_at: new Date().toISOString()
      };
      db.raw_materials.push(newRm);
      toast.success('নতুন কাঁচামাল যোগ করা হয়েছে');
    }

    saveLocalDB(db);
    setIsModalOpen(false);
  };

  const handleDelete = (id: string, rmName: string) => {
    if (window.confirm(`আপনি কি নিশ্চিত যে "${rmName}" কাঁচামালটি মুছে ফেলতে চান?`)) {
      const db = getLocalDB();
      db.raw_materials = db.raw_materials.filter((rm: RawMaterial) => rm.id !== id);
      saveLocalDB(db);
      toast.success('কাঁচামাল মুছে ফেলা হয়েছে');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="কাঁচামাল ও উপাদান তালিকা"
        subtitle="অ্যাক্টিভ ইনগ্রেডিয়েন্ট, ফিলিং উপাদান, বোতল ও কার্টন ইনভেন্টরি"
        action={
          <button
            onClick={openAddModal}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-lg text-xs shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            নতুন কাঁচামাল যোগ
          </button>
        }
      />

      <div className="bg-card rounded-xl border border-border shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-muted/50 border-b border-border text-muted-foreground font-bold">
                <th className="py-3 px-4">উপাদানের নাম</th>
                <th className="py-3 px-4">একক</th>
                <th className="py-3 px-4 text-center">কম স্টক সীমা</th>
                <th className="py-3 px-4 text-right">বর্তমান ইনভেন্টরি</th>
                <th className="py-3 px-4 text-center">স্ট্যাটাস</th>
                <th className="py-3 px-4 text-center">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rawMaterials.map((rm) => {
                const isLow = rm.current_stock <= rm.low_stock_alert;
                return (
                  <tr key={rm.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4 font-bold text-foreground">{rm.name}</td>
                    <td className="py-3 px-4 text-muted-foreground">{rm.unit}</td>
                    <td className="py-3 px-4 text-center">{formatBnNumber(rm.low_stock_alert)}</td>
                    <td className="py-3 px-4 text-right font-black text-sm">
                      {formatBnNumber(rm.current_stock)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {isLow ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[11px]">
                          <AlertTriangle className="w-3 h-3 text-amber-600" /> কম স্টক
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                          পর্যাপ্ত
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => openEditModal(rm)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                          aria-label="সম্পাদনা করুন"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(rm.id, rm.name)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                          aria-label="মুছে ফেলুন"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card w-full max-w-md rounded-2xl border border-border shadow-xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-bold text-foreground text-sm">
                {editingMaterial ? 'কাঁচামাল সম্পাদনা' : 'নতুন কাঁচামাল যোগ'}
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
                <label className="block text-xs font-semibold text-foreground mb-1">কাঁচামালের নাম *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="যেমন: সালফার গ্র্যানিউলস ৯৯.৫%"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">পরিমাপের একক</label>
                <input
                  type="text"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  placeholder="কেজি / লিটার / পিস"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">বর্তমান স্টক</label>
                  <input
                    type="number"
                    value={currentStock}
                    onChange={(e) => setCurrentStock(e.target.value ? Number(e.target.value) : '')}
                    placeholder="1000"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">কম স্টক এলার্ট</label>
                  <input
                    type="number"
                    value={lowStockAlert}
                    onChange={(e) => setLowStockAlert(e.target.value ? Number(e.target.value) : '')}
                    placeholder="200"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:outline-hidden"
                  />
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
