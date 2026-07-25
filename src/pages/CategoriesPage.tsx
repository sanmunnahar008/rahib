import React, { useState, useEffect } from 'react';
import { usePageMeta } from '../hooks/usePageMeta';
import { PageHeader } from '../components/PageHeader';
import { Category } from '../types/database';
import { getLocalDB, saveLocalDB } from '../lib/supabase';
import { toast } from 'sonner';
import { Plus, Edit2, Trash2, FolderTree, X } from 'lucide-react';

export const CategoriesPage: React.FC = () => {
  usePageMeta({
    title: 'পণ্য ক্যাটাগরি',
    description: 'পণ্যের ক্যাটাগরি ও শ্রেণিবিভাগ ব্যবস্থাপনা'
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const loadCategories = () => {
    const db = getLocalDB();
    setCategories(db.categories || []);
  };

  useEffect(() => {
    loadCategories();
    window.addEventListener('ph_vision_db_updated', loadCategories);
    return () => window.removeEventListener('ph_vision_db_updated', loadCategories);
  }, []);

  const openAddModal = () => {
    setEditingCategory(null);
    setName('');
    setDescription('');
    setIsModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setDescription(cat.description || '');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('ক্যাটাগরির নাম দিন');
      return;
    }

    const db = getLocalDB();
    if (editingCategory) {
      db.categories = db.categories.map((c: Category) =>
        c.id === editingCategory.id ? { ...c, name, description } : c
      );
      toast.success('ক্যাটাগরি আপডেট করা হয়েছে');
    } else {
      const newCat: Category = {
        id: `cat-${Date.now()}`,
        name,
        description,
        created_at: new Date().toISOString()
      };
      db.categories.push(newCat);
      toast.success('নতুন ক্যাটাগরি যুক্ত করা হয়েছে');
    }

    saveLocalDB(db);
    setIsModalOpen(false);
  };

  const handleDelete = (id: string, catName: string) => {
    if (window.confirm(`আপনি কি নিশ্চিত যে "${catName}" ক্যাটাগরি টি মুছে ফেলতে চান?`)) {
      const db = getLocalDB();
      db.categories = db.categories.filter((c: Category) => c.id !== id);
      saveLocalDB(db);
      toast.success('ক্যাটাগরি মুছে ফেলা হয়েছে');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="পণ্যের ক্যাটাগরি ব্যবস্থাপনা"
        subtitle="কীটনাশক, ছত্রাকনাশক ও অন্যান্য ক্যাটাগরি সংজ্ঞায়িত করুন"
        action={
          <button
            onClick={openAddModal}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-lg text-xs shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            নতুন ক্যাটাগরি
          </button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="bg-card p-5 rounded-xl border border-border shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-primary-light text-primary rounded-lg">
                  <FolderTree className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-foreground text-sm">{cat.name}</h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {cat.description || 'কোনো বিবরণ নেই'}
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-border">
              <button
                onClick={() => openEditModal(cat)}
                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                aria-label="সম্পাদনা করুন"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(cat.id, cat.name)}
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
                {editingCategory ? 'ক্যাটাগরি সম্পাদনা' : 'নতুন ক্যাটাগরি যোগ'}
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
                <label className="block text-xs font-semibold text-foreground mb-1">ক্যাটাগরির নাম *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="যেমন: বীজ সুরক্ষা ও পিজিআর"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">বিবরণ</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="ক্যাটাগরি সংক্রান্ত সংক্ষিপ্ত বিবরণ লিখুন..."
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
