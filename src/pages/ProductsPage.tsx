import React, { useState, useEffect } from 'react';
import { usePageMeta } from '../hooks/usePageMeta';
import { PageHeader } from '../components/PageHeader';
import { useAuth } from '../context/AuthContext';
import { Product, Category } from '../types/database';
import { getLocalDB, saveLocalDB } from '../lib/supabase';
import { formatBnCurrency, formatBnNumber } from '../lib/format';
import { toast } from 'sonner';
import {
  Package,
  Plus,
  Search,
  Edit2,
  Trash2,
  AlertTriangle,
  X
} from 'lucide-react';

export const ProductsPage: React.FC = () => {
  usePageMeta({
    title: 'পণ্য তালিকা',
    description: 'PH VISION LTD-এর সকল কৃষি-রাসায়নিক পণ্যের বিবরণ ও স্টক'
  });

  const { role } = useAuth();
  const isAdmin = role === 'admin';

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [unit, setUnit] = useState('কেজি');
  const [price, setPrice] = useState<number | ''>('');
  const [currentStock, setCurrentStock] = useState<number | ''>('');
  const [lowStockAlert, setLowStockAlert] = useState<number | ''>(50);

  const loadData = () => {
    const db = getLocalDB();
    setProducts(db.products || []);
    setCategories(db.categories || []);
  };

  useEffect(() => {
    loadData();
    window.addEventListener('ph_vision_db_updated', loadData);
    return () => window.removeEventListener('ph_vision_db_updated', loadData);
  }, []);

  const openAddModal = () => {
    setEditingProduct(null);
    setName('');
    setCategoryId(categories[0]?.id || '');
    setUnit('কেজি');
    setPrice('');
    setCurrentStock('');
    setLowStockAlert(50);
    setIsModalOpen(true);
  };

  const openEditModal = (prod: Product) => {
    setEditingProduct(prod);
    setName(prod.name);
    setCategoryId(prod.category_id);
    setUnit(prod.unit);
    setPrice(prod.price);
    setCurrentStock(prod.current_stock);
    setLowStockAlert(prod.low_stock_alert);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('পণ্যের নাম লিখুন');
      return;
    }
    if (!categoryId) {
      toast.error('ক্যাটাগরি নির্বাচন করুন');
      return;
    }
    if (price === '' || Number(price) <= 0) {
      toast.error('সঠিক মূল্য প্রদান করুন');
      return;
    }

    const db = getLocalDB();
    const catName = categories.find((c) => c.id === categoryId)?.name || '';

    if (editingProduct) {
      // Update
      db.products = db.products.map((p: Product) =>
        p.id === editingProduct.id
          ? {
              ...p,
              name,
              category_id: categoryId,
              category_name: catName,
              unit,
              price: Number(price),
              current_stock: Number(currentStock || 0),
              low_stock_alert: Number(lowStockAlert || 50)
            }
          : p
      );
      toast.success('পণ্য সফলভাবে আপডেট করা হয়েছে');
    } else {
      // Create
      const newProd: Product = {
        id: `prod-${Date.now()}`,
        name,
        category_id: categoryId,
        category_name: catName,
        unit,
        price: Number(price),
        current_stock: Number(currentStock || 0),
        low_stock_alert: Number(lowStockAlert || 50),
        created_at: new Date().toISOString()
      };
      db.products.push(newProd);
      toast.success('নতুন পণ্য সংযুক্ত করা হয়েছে');
    }

    saveLocalDB(db);
    setIsModalOpen(false);
  };

  const handleDelete = (id: string, prodName: string) => {
    if (window.confirm(`আপনি কি নিশ্চিত যে "${prodName}" পণ্যটি মুছে ফেলতে চান?`)) {
      const db = getLocalDB();
      db.products = db.products.filter((p: Product) => p.id !== id);
      saveLocalDB(db);
      toast.success('পণ্যটি মুছে ফেলা হয়েছে');
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'all' || p.category_id === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="পণ্য ও ইনভেন্টরি তালিকা"
        subtitle="কোম্পানির সকল রাসায়নিক পণ্যের তালিকা, পাইকারি মূল্য ও স্টক তথ্য"
        action={
          isAdmin ? (
            <button
              onClick={openAddModal}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-lg text-xs shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              নতুন পণ্য যোগ করুন
            </button>
          ) : undefined
        }
      />

      {/* Filter and Search Bar */}
      <div className="bg-card p-4 rounded-xl border border-border shadow-xs flex flex-col sm:flex-row gap-3 justify-between items-center">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="পণ্যের নাম দিয়ে খুঁজুন..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label className="text-xs font-semibold text-muted-foreground whitespace-nowrap">ক্যাটাগরি:</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full sm:w-48 py-1.5 px-3 text-xs rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:outline-hidden"
          >
            <option value="all">সব ক্যাটাগরি</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Product List Table */}
      <div className="bg-card rounded-xl border border-border shadow-xs overflow-hidden">
        {filteredProducts.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted-foreground">কোনো পণ্য পাওয়া যায়নি</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-muted/50 border-b border-border text-muted-foreground font-bold">
                  <th className="py-3 px-4">পণ্যের নাম</th>
                  <th className="py-3 px-4">ক্যাটাগরি</th>
                  <th className="py-3 px-4 text-right">একক মূল্য</th>
                  <th className="py-3 px-4 text-center">একক</th>
                  <th className="py-3 px-4 text-center">বর্তমান স্টক</th>
                  <th className="py-3 px-4 text-center">স্টক স্ট্যাটাস</th>
                  {isAdmin && <th className="py-3 px-4 text-center">অ্যাকশন</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredProducts.map((p) => {
                  const isLow = p.current_stock <= p.low_stock_alert;
                  const cat = categories.find((c) => c.id === p.category_id);
                  return (
                    <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4 font-bold text-foreground">{p.name}</td>
                      <td className="py-3 px-4 text-muted-foreground">{cat?.name || p.category_name || '-'}</td>
                      <td className="py-3 px-4 text-right font-extrabold text-foreground">
                        {formatBnCurrency(p.price)}
                      </td>
                      <td className="py-3 px-4 text-center text-muted-foreground">{p.unit}</td>
                      <td className="py-3 px-4 text-center font-bold">{formatBnNumber(p.current_stock)}</td>
                      <td className="py-3 px-4 text-center">
                        {isLow ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold">
                            <AlertTriangle className="w-3 h-3 text-amber-600" />
                            কম স্টক
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                            পর্যাপ্ত
                          </span>
                        )}
                      </td>
                      {isAdmin && (
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => openEditModal(p)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                              aria-label="সম্পাদনা করুন"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(p.id, p.name)}
                              className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                              aria-label="মুছে ফেলুন"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card w-full max-w-md rounded-2xl border border-border shadow-xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-bold text-foreground text-sm">
                {editingProduct ? 'পণ্য সংশোধন করুন' : 'নতুন পণ্য সংযুক্ত করুন'}
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
                <label className="block text-xs font-semibold text-foreground mb-1">পণ্যের নাম *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="যেমন: ভিশন থিওভিট ৮০ ডব্লিউডিজি"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">ক্যাটাগরি *</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:outline-hidden"
                >
                  <option value="">ক্যাটাগরি নির্বাচন করুন</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">একক মূল্য (৳) *</label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value ? Number(e.target.value) : '')}
                    placeholder="680"
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
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">বর্তমান স্টক</label>
                  <input
                    type="number"
                    value={currentStock}
                    onChange={(e) => setCurrentStock(e.target.value ? Number(e.target.value) : '')}
                    placeholder="100"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">কম স্টক অ্যালার্ট লেভেল</label>
                  <input
                    type="number"
                    value={lowStockAlert}
                    onChange={(e) => setLowStockAlert(e.target.value ? Number(e.target.value) : '')}
                    placeholder="50"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-muted hover:bg-muted/80 text-foreground font-semibold rounded-lg text-xs"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-lg text-xs shadow-xs"
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
