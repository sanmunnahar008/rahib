import React, { useState, useEffect } from 'react';
import { usePageMeta } from '../hooks/usePageMeta';
import { PageHeader } from '../components/PageHeader';
import { Supplier } from '../types/database';
import { getLocalDB, saveLocalDB } from '../lib/supabase';
import { toast } from 'sonner';
import { Truck, Plus, Edit2, Trash2, Phone, MapPin, X } from 'lucide-react';

export const SuppliersPage: React.FC = () => {
  usePageMeta({
    title: 'সরবরাহকারী তালিকা',
    description: 'কাঁচামাল ও বোতল/প্যাকেজিং সরবরাহকারী ভেন্ডর তালিকা'
  });

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [address, setAddress] = useState('');

  const loadSuppliers = () => {
    const db = getLocalDB();
    setSuppliers(db.suppliers || []);
  };

  useEffect(() => {
    loadSuppliers();
    window.addEventListener('ph_vision_db_updated', loadSuppliers);
    return () => window.removeEventListener('ph_vision_db_updated', loadSuppliers);
  }, []);

  const openAddModal = () => {
    setEditingSupplier(null);
    setName('');
    setMobile('');
    setAddress('');
    setIsModalOpen(true);
  };

  const openEditModal = (sup: Supplier) => {
    setEditingSupplier(sup);
    setName(sup.name);
    setMobile(sup.mobile);
    setAddress(sup.address);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('সরবরাহকারীর নাম দিন');
      return;
    }

    const db = getLocalDB();
    if (editingSupplier) {
      db.suppliers = db.suppliers.map((s: Supplier) =>
        s.id === editingSupplier.id ? { ...s, name, mobile, address } : s
      );
      toast.success('সরবরাহকারীর তথ্য আপডেট করা হয়েছে');
    } else {
      const newSup: Supplier = {
        id: `sup-${Date.now()}`,
        name,
        mobile,
        address,
        created_at: new Date().toISOString()
      };
      db.suppliers.push(newSup);
      toast.success('নতুন সরবরাহকারী যুক্ত করা হয়েছে');
    }

    saveLocalDB(db);
    setIsModalOpen(false);
  };

  const handleDelete = (id: string, supName: string) => {
    if (window.confirm(`আপনি কি নিশ্চিত যে "${supName}" কে মুছে ফেলতে চান?`)) {
      const db = getLocalDB();
      db.suppliers = db.suppliers.filter((s: Supplier) => s.id !== id);
      saveLocalDB(db);
      toast.success('সরবরাহকারী মুছে ফেলা হয়েছে');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="সরবরাহকারী ও ভেন্ডর তালিকা"
        subtitle="কাঁচামাল, কেমিক্যাল ও প্যাকেজিং সরবরাহকারী প্রতিষ্ঠানের তথ্য"
        action={
          <button
            onClick={openAddModal}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-lg text-xs shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            নতুন সরবরাহকারী
          </button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {suppliers.map((sup) => (
          <div
            key={sup.id}
            className="bg-card p-5 rounded-xl border border-border shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <div className="p-2.5 bg-sky-100 text-sky-800 rounded-lg">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-sm">{sup.name}</h3>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-muted-foreground">
                <p className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span>{sup.mobile || 'N/A'}</span>
                </p>
                <p className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span className="truncate">{sup.address || 'N/A'}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-border">
              <button
                onClick={() => openEditModal(sup)}
                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                aria-label="সম্পাদনা করুন"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(sup.id, sup.name)}
                className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                aria-label="মুছে ফেলুন"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card w-full max-w-md rounded-2xl border border-border shadow-xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-bold text-foreground text-sm">
                {editingSupplier ? 'সরবরাহকারী সম্পাদনা' : 'নতুন সরবরাহকারী যোগ'}
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
                <label className="block text-xs font-semibold text-foreground mb-1">প্রতিষ্ঠানের নাম *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="যেমন: গ্লোবাল কেমিক্যালস সলিউশনস"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">মোবাইল নম্বর</label>
                <input
                  type="text"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="01710000000"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">ঠিকানা</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="তেজগাঁও শিল্প এলাকা, ঢাকা"
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
